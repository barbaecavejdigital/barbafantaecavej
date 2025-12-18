// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- ATTENZIONE ---
// INCOLLA QUI LA CONFIGURAZIONE DI FIREBASE CHE HAI COPIATO DALLA TUA CONSOLE
// Questo è solo un esempio e NON funzionerà finché non lo sostituisci.
// Esempio:
// const firebaseConfig = {
//   apiKey: "AIzaSy...",
//   authDomain: "tuo-progetto.firebaseapp.com",
//   projectId: "tuo-progetto",
//   storageBucket: "tuo-progetto.appspot.com",
//   messagingSenderId: "1234567890",
//   appId: "1:1234567890:web:abcdef123456"
// };

const firebaseConfig = {
  apiKey: "AIzaSyCj3CsrZMsj0NtzImZhQAvtU9XTpUI5R0o",
  authDomain: "fidelity-club-app.firebaseapp.com",
  projectId: "fidelity-club-app",
  storageBucket: "fidelity-club-app.firebasestorage.app",
  messagingSenderId: "804132467521",
  appId: "1:804132467521:web:7b499c313459a584bea7c0",
  measurementId: "G-XDGQLWNWXR"
};


// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta l'istanza di Firestore per usarla nel resto dell'app
export const db = getFirestore(app);