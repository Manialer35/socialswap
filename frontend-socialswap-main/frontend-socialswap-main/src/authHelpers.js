// src/authHelpers.js
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

export async function signupWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

const googleProvider = new GoogleAuthProvider();
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

// Recaptcha + Phone OTP
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, auth);
  }
  return window.recaptchaVerifier;
}

export async function sendOtp(phoneNumber) {
  if (!window.recaptchaVerifier) setupRecaptcha();
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
  window.confirmationResult = confirmationResult;
  return true;
}

export async function confirmOtp(code) {
  if (!window.confirmationResult) throw new Error('Call sendOtp first');
  const cred = await window.confirmationResult.confirm(code);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}
