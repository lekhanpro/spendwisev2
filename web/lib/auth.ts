// lib/auth.ts
import { app } from "./firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

export const auth = getAuth(app);

// Google provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// Google sign-in
export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

// Email/password sign-up with email verification
export async function signUpWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Send email verification
  await sendEmailVerification(userCredential.user);
  return userCredential;
}

// Email/password sign-in
export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Logout
export function logout() {
  return signOut(auth);
}


