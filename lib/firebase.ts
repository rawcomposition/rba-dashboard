import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as fs from "firebase/firestore";
import { Profile } from "lib/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: "rba-dashboard.firebaseapp.com",
  projectId: "rba-dashboard",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: "rba-dashboard.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = fs.initializeFirestore(app, { ignoreUndefinedProperties: true });

export const setProfileValue = async (key: string, value: Profile[keyof Profile]) => {
  const user = auth.currentUser;
  if (!user) return;
  await fs.updateDoc(fs.doc(db, "profile", user.uid), {
    [key]: value,
  });
};

export const subscribeToProfile = (callback: (profile: Profile) => void): (() => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  return fs.onSnapshot(fs.doc(db, "profile", user.uid), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Profile);
    } else {
      fs.setDoc(fs.doc(db, "profile", user.uid), {});
    }
  });
};
