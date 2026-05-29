import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDVH3zih4L0BBr4R8zbMl6d7xMS9x8m-og',
  authDomain: 'reclutamiento-1918a.firebaseapp.com',
  projectId: 'reclutamiento-1918a',
  storageBucket: 'reclutamiento-1918a.firebasestorage.app',
  messagingSenderId: '676868420909',
  appId: '1:676868420909:web:9bdfcd0df614d5514c0fa4',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
