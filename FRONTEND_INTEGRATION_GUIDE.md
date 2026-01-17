# Guide d'Intégration Frontend - Fluxa

## Vue d'ensemble

Le frontend React/TypeScript est maintenant **complètement intégré** avec le backend Rust. Les appels au serveur sont remplacés par des appels directs aux commandes Tauri.

## Architecture d'Intégration

### 1. Hooks Personnalisés

#### `useRustWallet()` - Hook Principal
Gère tout l'état du portefeuille et les transactions.

```typescript
import { useRustWallet } from "@/hooks/useRustWallet";

const MyComponent = () => {
  const {
    wallet,              // État du portefeuille
    transactions,        // Historique des transactions
    publicKey,          // Clé publique Ed25519
    loading,            // État de chargement
    error,              // Messages d'erreur

    // Méthodes
    transferToVault,
    transferFromVault,
    createOfflineTransaction,
    createOnlineTransaction,
    confirmTransaction,
    cancelTransaction,
    refreshWallet,
    getStats,
  } = useRustWallet();
};
```

#### `useTransaction()` - Hook Transactions
Wrapper spécialisé pour les transactions.

```typescript
import { useTransaction } from "@/hooks/useTransaction";

const {
  transaction,                 // État transaction actuelle
  initiateOfflineTransaction,  // Créer P2P
  initiateOnlineTransaction,   // Créer serveur
  confirmTx,                   // Confirmer
  cancelTx,                    // Annuler
  resetTransaction,            // Réinitialiser
} = useTransaction();
```

### 2. Composants Intégrés

#### `WalletInitializer`
Enveloppe l'app et initialise le wallet au démarrage.

```typescript
<WalletInitializer>
  <App />
</WalletInitializer>
```

Gère:
- ✅ Initialisation du wallet
- ✅ État de chargement
- ✅ Gestion des erreurs
- ✅ Écran de splash

#### `TransactionHistory`
Affiche l'historique des transactions.

```typescript
<TransactionHistory />
```

Affiche:
- Merchant name et montant
- Date/heure
- Statut (confirmée/en attente/annulée)
- Type (en ligne/P2P/transfert)

#### `WalletStats`
Statistiques du portefeuille.

```typescript
<WalletStats />
```

Affiche:
- Nombre total de transactions
- Transactions confirmées
- Volume total

### 3. Écrans Mis à Jour

#### Dashboard
- ✅ Récupère le solde du backend Rust
- ✅ Affiche l'état de connexion (vert/rouge)
- ✅ Synchronisé avec le wallet en temps réel

#### VaultScreen
- ✅ Utilise `transferToVault()` du backend
- ✅ Validation du montant
- ✅ Affichage du progrès réel

#### TransactionInProgress
- ✅ Crée la transaction via `createOfflineTransaction()`
- ✅ Confirme après les étapes de crypto
- ✅ Appelle le backend Rust automatiquement

## Flux d'Utilisation

### 1. Démarrage de l'App

```typescript
// App.tsx
import { WalletInitializer } from "@/components/WalletInitializer";

<WalletInitializer>
  <OnlineStatusProvider>
    {/* Écrans */}
  </OnlineStatusProvider>
</WalletInitializer>
```

### 2. Récupération du Wallet

```typescript
const Dashboard = () => {
  const { wallet, loading } = useRustWallet();

  return (
    <div>
      <p>Solde: {wallet?.online_balance} FCFA</p>
      <p>Vault: {wallet?.offline_balance} FCFA</p>
    </div>
  );
};
```

### 3. Transaction P2P

```typescript
const handlePayment = async () => {
  const tx = await createOfflineTransaction(
    "merchant_id_123",
    "Chez Amenan",
    5000
  );

  // Afficher QR code, etc...
  // Puis confirmer après validation
  await confirmTransaction(tx.id);
};
```

### 4. Transaction Serveur

```typescript
const handleOnlinePayment = async () => {
  const tx = await createOnlineTransaction(
    "merchant_id_456",
    "Tech Store",
    10000
  );

  // Envoyer au serveur pour validation
  const response = await fetch("/api/validate", {
    method: "POST",
    body: JSON.stringify(tx)
  });

  if (response.ok) {
    await confirmTransaction(tx.id);
  } else {
    await cancelTransaction(tx.id);
  }
};
```

## Gestion des Erreurs

```typescript
const { wallet, error, loading } = useRustWallet();

if (error) {
  return <ErrorBanner message={error} />;
}

if (loading) {
  return <LoadingSpinner />;
}

return <Dashboard />;
```

## Types TypeScript

### Wallet
```typescript
interface WalletData {
  id: string;
  online_balance: number;
  offline_balance: number;
  total_balance: number;
  created_at: string;
  last_updated: string;
}
```

### Transaction
```typescript
interface TransactionData {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  merchant_name: string;
  amount: number;
  timestamp: string;
  signature: string;
  tx_type: "online" | "offline" | "transfer";
  status: "pending" | "confirmed" | "failed" | "cancelled";
}
```

### API Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## Appels Tauri Disponibles

| Méthode | Paramètres | Retour |
|---------|-----------|--------|
| `init_wallet()` | - | Wallet |
| `get_wallet()` | - | Wallet |
| `initialize_keys()` | - | KeyPair |
| `get_public_key()` | - | String |
| `transfer_to_vault(amount)` | u64 | Wallet |
| `transfer_from_vault(amount)` | u64 | Wallet |
| `create_offline_transaction(to_id, name, amount)` | String, String, u64 | Transaction |
| `create_online_transaction(to_id, name, amount)` | String, String, u64 | Transaction |
| `confirm_transaction(tx_id)` | String | Transaction |
| `cancel_transaction(tx_id)` | String | Wallet |
| `get_transactions()` | - | Transaction[] |
| `get_wallet_stats()` | - | Stats |
| `verify_tx_signature(data, sig)` | String, String | bool |

## Bonnes Pratiques

### 1. Toujours initialiser le wallet au démarrage
```typescript
useEffect(() => {
  initWallet();
}, []);
```

### 2. Rafraîchir après les mutations
```typescript
const handleTransfer = async (amount: number) => {
  await transferToVault(amount);
  await refreshWallet();  // Rafraîchir l'état
};
```

### 3. Gérer les erreurs
```typescript
const { error, loading } = useRustWallet();
if (error) showError(error);
if (loading) showSpinner();
```

### 4. Valider avant d'envoyer
```typescript
if (amount <= 0) {
  setError("Montant invalide");
  return;
}
if (amount > wallet.online_balance) {
  setError("Solde insuffisant");
  return;
}
```

## Fichiers Modifiés

- ✅ `src/hooks/useRustWallet.ts` - Hook principal
- ✅ `src/hooks/useTransaction.ts` - Hook transactions
- ✅ `src/components/WalletInitializer.tsx` - Initialisation
- ✅ `src/components/TransactionHistory.tsx` - Historique
- ✅ `src/components/WalletStats.tsx` - Statistiques
- ✅ `src/screens/Dashboard.tsx` - Écran principal
- ✅ `src/screens/VaultScreen.tsx` - Vault
- ✅ `src/screens/TransactionInProgress.tsx` - Progression

## Prochaines Étapes

1. **Ajouter QR Code**: Intégrer `qrcode.react` pour scanner/partager
2. **Bluetooth**: Implémenter communication BLE P2P
3. **Persistance**: Sauvegarder les transactions localement
4. **Serveur**: Intégrer validation côté serveur
5. **Tests**: Ajouter tests unitaires pour les hooks

---

✅ **Frontend Entièrement Intégré avec le Backend Rust!**
