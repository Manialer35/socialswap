import React, { useState, useEffect } from 'react';
import { setupRecaptcha, sendOtp, confirmOtp } from '../authHelpers';

export default function PhoneAuth() {
  const [phone,setPhone] = useState('');
  const [code,setCode] = useState('');
  useEffect(()=>{
    // make sure recaptcha is ready
    setupRecaptcha('recaptcha-container');
  },[]);
  async function handleSend(){
    await sendOtp(phone); // phone must be in E.164 format: +9198.... 
    alert('OTP sent');
  }
  async function handleVerify(){
    const { idToken } = await confirmOtp(code);
    localStorage.setItem('idToken', idToken);
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/firebase`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${idToken}` },
      body: JSON.stringify({source:'phone'})
    });
    alert('Phone verified and logged in!');
  }
  return (
    <div>
      <div id="recaptcha-container"></div> {/* recaptcha mounts here */}
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+919XXXXXXXXX" />
      <button onClick={handleSend}>Send OTP</button>
      <input value={code} onChange={e=>setCode(e.target.value)} placeholder="123456"/>
      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
}
