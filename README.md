<div align="center">
  <h1>CertifyChain</h1>
  <p><strong>Immutable Blockchain-Based Certificate Verification System</strong></p>
  <p>Securely issue, verify, and explore digital credentials on a cryptographically chained ledger.</p>
</div>

---

## Overview

**CertifyChain** is a modern, web-based certificate management platform built with blockchain-inspired principles. Each certificate is cryptographically hashed using SHA-256 and linked to the previous certificate's hash, forming an immutable chain of trust. The application provides a seamless interface for administrators to issue credentials and for anyone to instantly verify their authenticity.

---

## Features

### Certificate Verification
- Instantly verify any certificate by its unique ID
- View full certificate details: recipient, course, issuer, issue date
- Inspect the cryptographic SHA-256 hash stored on the ledger
- Tamper-proof validation against the blockchain record

### Issue Certificates (Admin Only)
- Secure Google Sign-In authentication for administrators
- Issue new certificates with recipient name, course name, issuer authority, and issue date
- Automatic SHA-256 hash generation
- Blockchain linking: each new certificate references the previous certificate's hash
- Immutable storage once recorded

### Ledger Explorer
- Real-time view of all certificates on the chain
- Blockchain-style block visualization with block numbers
- View current and previous cryptographic hashes
- Copy certificate IDs or jump directly to verification
- Refresh to sync with the latest ledger state

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, Lucide React Icons |
| Animations | Motion (Framer Motion) |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth (Google Sign-In) |
| Cryptography | CryptoJS (SHA-256) |

---

## How It Works

1. **Hash Generation**: When a certificate is issued, a SHA-256 hash is generated from the recipient name, course, issuer, issue date, and the previous block's hash.
2. **Chain Linking**: Each certificate stores the `dataHash` (its own hash) and `prevHash` (the previous certificate's hash), creating a tamper-evident chain.
3. **Verification**: To verify, the system retrieves the stored certificate and ensures its hash matches the recorded value. Any data modification breaks the chain.
4. **Immutability**: Firestore security rules strictly prevent updates or deletions to issued certificates.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Firebase](https://firebase.google.com/) project with Firestore and Authentication enabled
- Google Sign-In configured in Firebase Authentication

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MSF0Shehriyaar/certifychain.git
   cd certifychain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Update `firebase-applet-config.json` with your Firebase project credentials:
   ```json
   {
     "projectId": "your-project-id",
     "appId": "your-app-id",
     "apiKey": "your-api-key",
     "authDomain": "your-project-id.firebaseapp.com",
     "firestoreDatabaseId": "your-database-id",
     "storageBucket": "your-project-id.appspot.com",
     "messagingSenderId": "your-sender-id",
     "measurementId": ""
   }
   ```

4. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   APP_URL=http://localhost:3000
   ```

5. **Configure Firestore Rules**
   
   Deploy the security rules in `firestore.rules` to your Firebase project. Update the admin email in the `isAdmin()` function to match your authorized administrator.

---

## Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## Project Structure

```
certifychain/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx         # Certificate issuance UI (admin only)
│   │   ├── BlockchainExplorer.tsx # Ledger explorer with block visualization
│   │   └── VerifyPanel.tsx        # Public certificate verification
│   ├── lib/
│   │   ├── firebase.ts            # Firebase app initialization
│   │   └── utils.ts               # Utility helpers (cn, etc.)
│   ├── services/
│   │   └── certificateService.ts  # Firestore CRUD + hash logic
│   ├── App.tsx                    # Main app shell with navigation
│   ├── types.ts                   # TypeScript interfaces
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
├── firebase-applet-config.json    # Firebase configuration
├── firestore.rules                # Firestore security rules
├── .env.example                   # Environment variable template
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Firestore Security Rules

The application includes strict security rules (`firestore.rules`):

- **Public Access**: Anyone can read/verify certificates (`get`, `list`).
- **Admin-Only Creation**: Only signed-in users can create certificates. For production hardening, restrict the `isAdmin()` function to specific email(s).
- **Immutability**: Updates and deletions are permanently denied.
- **Validation**: All certificates must contain exactly 7 fields with valid data types and 64-character SHA-256 hashes.

---

## Security Notes

- Certificates are **immutable** once issued. There is no edit or delete functionality.
- SHA-256 cryptographic hashing ensures any tampering with certificate data is immediately detectable.
- The `prevHash` chain linking creates a tamper-evident history similar to blockchain structures.
- Admin authentication is handled via Firebase Auth with Google Sign-In.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` directory |

---

## License

This project is open source and available under the [MIT License](LICENSE).
