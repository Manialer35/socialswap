// src/authHelpers.js
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

// 1) Email sign-up
export async function signupWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

// 2) Email login
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

// 3) Reset password
export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

// 4) Google sign-in (popup)
const googleProvider = new GoogleAuthProvider();
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

// 5) Phone OTP
// Call setupRecaptcha() on page load or before sending OTP
export function setupRecaptcha(containerId = 'recaptcha-container') {
  // create an invisible recaptcha in the given container
  window.recaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, auth);
  return window.recaptchaVerifier;
}

export async function sendOtp(phoneNumber) {
  if (!window.recaptchaVerifier) setupRecaptcha();
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
  // store confirmationResult globally; confirmCode uses it
  window.confirmationResult = confirmationResult;
  return true;
}

export async function confirmOtp(code) {
  if (!window.confirmationResult) throw new Error('Call sendOtp first');
  const cred = await window.confirmationResult.confirm(code);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}
