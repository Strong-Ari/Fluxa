# Fluxa - Système de Paiement Hors-Ligne (Offline P2P)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Fluxa est une application de paiement peer-to-peer (P2P) fonctionnant entièrement hors-ligne, permettant aux utilisateurs d'échanger de l'argent sans connexion internet via NFC et Bluetooth Low Energy (BLE).

#RustAfricaHackathon

## 📋 Problème Adressé

Dans de nombreuses régions, notamment en Afrique de l'Ouest, l'accès à internet est limité, intermittent ou coûteux. Les solutions de paiement mobile existantes nécessitent une connexion internet constante pour valider les transactions, ce qui exclut une grande partie de la population.

**Problèmes spécifiques :**
- Dépendance à une connexion internet stable pour les transactions
- Coûts élevés des données mobiles
- Zones blanches sans couverture réseau
- Latence élevée lors des transactions en ligne
- Risques de sécurité liés aux serveurs centralisés

**Solution Fluxa :**
- Transactions P2P fonctionnant 100% hors-ligne
- Communication directe entre appareils via NFC et Bluetooth
- Synchronisation différée avec le cloud lorsque la connexion est disponible
- Architecture hybride : solde en ligne (cloud) + solde hors-ligne (vault local)
- Cryptographie Ed25519 pour la sécurité des transactions

## 🎯 Approche Technique

### Architecture

Fluxa utilise une architecture hybride **offline-first** avec synchronisation différée :

1. **Backend Rust (Tauri)** : Moteur bancaire sécurisé gérant :
   - Portefeuille avec balances en ligne et hors-ligne
   - Génération de clés cryptographiques (Ed25519)
   - Signatures et vérification de transactions
   - Gestion des transactions P2P

2. **Frontend React + TypeScript** : Interface utilisateur moderne avec :
   - Détection automatique du statut réseau
   - Service Worker pour le mode offline
   - Interface adaptative mobile-first
   - Animations fluides avec Tailwind CSS

3. **Communication P2P** :
   - **NFC** : Pour les paiements en contact (Android/iOS)
   - **Bluetooth Low Energy (BLE)** : Pour les paiements à distance (jusqu'à 10m)

### Flux de Transaction

```
1. Utilisateur A initie un paiement
   ↓
2. Création de transaction offline dans le backend Rust
   ↓
3. Signature cryptographique (SHA256 + Ed25519)
   ↓
4. Transmission via NFC ou Bluetooth
   ↓
5. Utilisateur B reçoit et valide la transaction
   ↓
6. Mise à jour des balances locales
   ↓
7. Synchronisation avec le cloud (quand disponible)
```

### Sécurité

- **Cryptographie** : SHA256 pour le hachage, Ed25519 pour les signatures
- **Validation locale** : Vérification des signatures sans serveur
- **Isolation** : Solde hors-ligne isolé du solde en ligne
- **Transactions signées** : Chaque transaction est signée cryptographiquement

## 📦 Dépendances

### Prérequis Système

- **Node.js** : >= 18.0.0
- **pnpm** : >= 8.0.0 (gestionnaire de paquets)
- **Rust** : >= 1.70.0
- **Tauri CLI** : >= 2.0.0

### Dépendances Frontend

```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "@tauri-apps/api": "^2",
  "@tauri-apps/plugin-opener": "^2",
  "@tauri-apps/plugin-nfc": "^2",
  "tailwindcss": "^3.4.19",
  "typescript": "~5.8.3",
  "vite": "^7.0.4"
}
```

### Dépendances Backend (Rust)

```toml
tauri = "2"
serde = "1"
sha2 = "0.10"
ed25519-dalek = "1.0"
uuid = "1.0"
chrono = "0.4"
tokio = "1"
```

## 🚀 Installation et Setup

### 1. Cloner le Repository

```bash
git clone https://github.com/votre-username/fluxa.git
cd fluxa
```

### 2. Installer les Dépendances

**Frontend (pnpm) :**
```bash
pnpm install
```

**Backend (Rust) :**
```bash
# Les dépendances Rust sont gérées automatiquement par Cargo
# Assurez-vous d'avoir Rust installé : https://rustup.rs/
```

### 3. Configuration

Aucune configuration supplémentaire n'est requise. L'application fonctionne immédiatement après l'installation.

## 🏗️ Build et Compilation

### Mode Développement

```bash
# Démarrer le serveur de développement
pnpm tauri dev
```

Cette commande :
- Lance Vite pour le frontend React
- Compile le backend Rust
- Ouvre l'application Tauri en mode développement

### Build de Production

**Desktop (Windows/macOS/Linux) :**
```bash
pnpm tauri build
```

Les binaires seront générés dans `src-tauri/target/release/`

**Android :**
```bash
pnpm tauri android build
```

**iOS :**
```bash
pnpm tauri ios build
```

### Build Options

```bash
# Build pour une plateforme spécifique
pnpm tauri build --target x86_64-pc-windows-msvc  # Windows
pnpm tauri build --target x86_64-apple-darwin      # macOS
pnpm tauri build --target x86_64-unknown-linux-gnu # Linux
```

## ▶️ Exécution

### Exécution en Mode Développement

```bash
pnpm tauri dev
```

### Exécution de la Version Compilée

**Windows :**
```bash
.\src-tauri\target\release\fluxa.exe
```

**macOS/Linux :**
```bash
./src-tauri/target/release/fluxa
```

**Android :**
```bash
# Installer l'APK généré
adb install src-tauri/target/android/apk/release/app-release.apk
```

## 📱 Utilisation

### Première Utilisation

1. **Initialisation du Portefeuille** :
   - L'application crée automatiquement un portefeuille au premier lancement
   - Génération automatique des clés cryptographiques

2. **Gestion des Soldes** :
   - **Solde en ligne** : Synchronisé avec le cloud
   - **Solde hors-ligne (Vault)** : Stocké localement pour les paiements P2P

3. **Transfert vers le Vault** :
   - Accéder à l'écran "Vault"
   - Transférer des fonds du solde en ligne vers le vault hors-ligne

### Paiement P2P

**Via NFC :**
1. Activer NFC sur les deux appareils
2. Sélectionner "NFC" dans l'écran P2P
3. Approcher les appareils (contact)
4. Confirmer le montant et le destinataire

**Via Bluetooth :**
1. Activer Bluetooth sur les deux appareils
2. Sélectionner "Bluetooth" dans l'écran P2P
3. Scanner les appareils à proximité
4. Sélectionner le destinataire
5. Confirmer le montant et envoyer

### Réception de Paiement

1. L'appareil détecte automatiquement les transactions entrantes
2. Afficher les détails de la transaction
3. Accepter ou rejeter le paiement
4. Le solde est mis à jour automatiquement

## 🏗️ Architecture du Code

```
fluxa/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── screens/           # Écrans principaux
│   ├── hooks/             # Hooks React personnalisés
│   ├── contexts/          # Contextes React
│   ├── utils/             # Utilitaires
│   └── config/            # Configuration
│
├── src-tauri/             # Backend Rust (Tauri)
│   ├── src/
│   │   ├── lib.rs         # Moteur bancaire principal
│   │   └── main.rs        # Point d'entrée Tauri
│   └── Cargo.toml         # Dépendances Rust
│
└── public/                # Assets statiques
```

## 🔧 Configuration

### Variables d'Environnement

Aucune variable d'environnement n'est requise pour le fonctionnement de base.

### Personnalisation

Les configurations sont centralisées dans :
- `src/config/fluxa.config.ts` : Configuration frontend
- `src-tauri/tauri.conf.json` : Configuration Tauri

## 🧪 Tests

```bash
# Tests frontend (à implémenter)
pnpm test

# Tests Rust
cd src-tauri
cargo test
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Blé Ariel Josaphat** - Développement initial

## 🙏 Remerciements

- Tauri pour le framework cross-platform
- React et TypeScript pour le frontend
- La communauté Rust pour les excellentes crates

## 📝 Déclaration de Code Généré par LLM

Ce projet contient du code boilerplate généré avec l'assistance d'un LLM (Large Language Model). Les fichiers suivants incluent du code généré par LLM et sont marqués avec des commentaires appropriés :

### Fichiers de Configuration Boilerplate
- `vite.config.ts` - Configuration Vite pour Tauri
- `tailwind.config.js` - Configuration Tailwind CSS
- `tsconfig.json` - Configuration TypeScript
- `tsconfig.node.json` - Configuration TypeScript pour les fichiers Node.js
- `postcss.config.js` - Configuration PostCSS
- `package.json` - Dépendances et scripts du projet
- `index.html` - Fichier HTML de base
- `src/main.tsx` - Point d'entrée React avec configuration Service Worker

### Code Boilerplate et Backend Rust
- `src-tauri/src/lib.rs` - **Module backend Rust principal** : Ce fichier contient du code généré avec l'assistance d'un LLM, notamment les fonctions P2P NFC/Bluetooth.

**Note importante** : Le code métier principal, la logique applicative, et les fonctionnalités spécifiques au domaine ont été développés manuellement. Seuls les fichiers de configuration standard, le code boilerplate initial, et la structure de base du backend Rust ont bénéficié de l'assistance LLM.

## 🐛 Problèmes Connus

- NFC nécessite un appareil physique compatible (Android/iOS)
- Bluetooth nécessite des permissions système
- La synchronisation cloud nécessite une connexion internet (fonctionnalité future)

## 🔮 Roadmap

- [ ] Synchronisation automatique avec serveur cloud
- [ ] Support multi-devices
- [ ] Historique de transactions amélioré
- [ ] Support de plusieurs devises
- [ ] Intégration avec systèmes de paiement existants

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

---

**Date de soumission** : 31 janvier 2026
**Version** : 0.1.0
