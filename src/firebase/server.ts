import { firebaseConfig } from '@/firebase/config';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

export type ServerFirebaseSdks = {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
};

function initFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    try {
      return initializeApp();
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic Firebase initialization failed on the server. Falling back to firebaseConfig.',
          error,
        );
      }
      return initializeApp(firebaseConfig);
    }
  }

  return getApp();
}

export function initializeServerFirebase(): ServerFirebaseSdks {
  const firebaseApp = initFirebaseApp();
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, firestore };
}
