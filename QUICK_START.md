<!-- Quick Start Guide for Kpay Offline Frontend -->

# 🚀 Démarrage Rapide Kpay Offline

## 1️⃣ Installation Rapide

```bash
# Windows (PowerShell)
.\install-frontend.ps1

# ou macOS/Linux
bash install-frontend.sh

# ou manuel
pnpm install
pnpm add -D tailwindcss postcss autoprefixer
```

## 2️⃣ Lancer le Projet

```bash
# Mode développement (Vite)
pnpm dev

# ou avec Tauri
pnpm tauri dev
```

## 3️⃣ Construire pour Production

```bash
pnpm build
```

## 📱 Tester les Écrans

L'app démarre sur le **Dashboard**. Vous pouvez naviguer entre:

1. **Dashboard** (Accueil)
   - Affiche les deux portefeuilles (Online/Offline)
   - Boutons: "Sécuriser des Fonds" et "Trouver un Marchand"

2. **VaultScreen** (Le Coffre)
   - Slider pour sélectionner le montant
   - Bouton "Sécuriser par Rust" avec animation
   - Retour: Clic sur "Retour"

3. **PaymentRadar** (Radar Bluetooth)
   - Onde radar animée avec marchands
   - Sélectionnez un marchand pour continuer

4. **TransactionInProgress** (Signature)
   - Visualisation des 3 étapes de signature
   - Automatiquement vers le reçu après 5s

5. **PaymentReceipt** (Reçu)
   - Bouton "Partager le Reçu"
   - Bouton "Retour à l'Accueil"

## 🎨 Personnalisation des Couleurs

Modifiez `tailwind.config.js`:

```js
colors: {
  "navy-deep": "#0A192F",      // Fond principal
  "gold-royal": "#FFD700",     // Accents Or
  "neon-green": "#39FF14",     // Validation Rust
}
```

## 🔧 Structure des Fichiers Important

```
src/
├── App.tsx                    ← Router principal
├── screens/                   ← Les 5 écrans
│   ├── Dashboard.tsx
│   ├── VaultScreen.tsx
│   ├── PaymentRadar.tsx
│   ├── TransactionInProgress.tsx
│   └── PaymentReceipt.tsx
├── utils/tauri.ts             ← Appels Rust
└── index.css                  ← Styles globaux
```

## 🛠️ Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarrer le serveur dev |
| `pnpm build` | Construire pour production |
| `pnpm preview` | Prévisualiser la build |
| `pnpm tauri dev` | Lancer Tauri en dev |
| `pnpm tauri build` | Construire l'app Tauri |

## 🔗 Integration Rust

Les appels Rust sont dans `src/utils/tauri.ts`. Exemple:

```typescript
// Appeler une commande Rust
await invoke("secure_vault_funds", { amount: 5000 });
```

Les commandes Rust correspondantes doivent être définies dans `src-tauri/src/main.rs`.

## 📊 Dépannage

### "Module not found: 'tailwindcss'"
```bash
pnpm add -D tailwindcss postcss autoprefixer
```

### "Cannot find module '@tauri-apps/api'"
```bash
pnpm add @tauri-apps/api
```

### Styles ne s'appliquent pas
1. Vérifiez que `src/index.css` est importé dans `src/main.tsx`
2. Vérifiez que le fichier `tailwind.config.js` existe à la racine
3. Relancez le serveur dev: `pnpm dev`

## 🎯 Pour le Hackathon

✅ Design premium avec Glassmorphism
✅ 5 écrans complets et interactifs
✅ Animations fluides et efficaces
✅ Intégration Rust ready
✅ Responsive design
✅ Sécurité visuelle Rust partout

---

**Bon hackathon! 🚀**
