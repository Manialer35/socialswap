import React, { useState } from 'react';
import { signupWithEmail, loginWithEmail } from '../authHelpers';

export default function EmailAuthForm() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  async function handleSignup(){ 
    const { idToken } = await signupWithEmail(email, password);
    // send idToken to backend to create or get app user:
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/firebase`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${idToken}` },
      body: JSON.stringify({source: 'email'})
    });
    // store idToken in localStorage or let backend create an httpOnly cookie
    localStorage.setItem('idToken', idToken);
    alert('Signed up!');
  }
  async function handleLogin(){
    const { idToken } = await loginWithEmail(email, password);
    localStorage.setItem('idToken', idToken);
    alert('Logged in!');
  }
  return (
    <div>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password"/>
      <button onClick={handleSignup}>Sign up</button>
      <button onClick={handleLogin}>Log in</button>
    </div>
  );
}
