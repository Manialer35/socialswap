import React from 'react';
import { signInWithGoogle } from '../authHelpers';

export default function GoogleSignIn() {
  async function handleGoogle(){
    const { idToken } = await signInWithGoogle();
    localStorage.setItem('idToken', idToken);
    // optionally POST to backend to create or sync user record
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/firebase`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${idToken}` },
      body: JSON.stringify({source:'google'})
    });
    alert('Google sign-in success');
  }
  return <button onClick={handleGoogle}>Sign in with Google</button>;
}
