// src/Pages/Seller/Login.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { PhoneOutlined, NumberOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance, { api } from '../../API/api';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const sendOtp = async () => {
    try {
      const values = await form.validateFields(['phone']);
      setLoading(true);
      const res = await axiosInstance.post(`${api}/auth/send-otp`, {
        phone: values.phone
      });
      if (res.data.success) {
        message.success('OTP sent successfully!');
        setPhone(values.phone);
        setOtpSent(true);
      } else {
        message.error(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      const values = await form.validateFields(['otp']);
      setLoading(true);
      const res = await axiosInstance.post(`${api}/auth/verify-otp`, {
        phone,
        otp: values.otp
      });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user?.role);
        message.success('Login successful!');
        if (user.role === 'buyer') return navigate('/');
        if (user.role === 'seller') return navigate('/seller-dashboard');
        if (user.role === 'admin') return navigate('/admin-dashboard');
      } else {
        message.error(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 p-4">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>

      <Card className="w-full max-w-md backdrop-blur-md bg-white/30 border border-white/50 shadow-lg" style={{ borderRadius: '16px' }}>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login with Mobile</h2>
        <Form form={form} layout="vertical">
          {!otpSent && (
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9]{10}$/, message: 'Enter valid 10 digit number' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="Phone Number"
                className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          )}
          {otpSent && (
            <Form.Item
              name="otp"
              rules={[{ required: true, message: 'Please enter OTP' }]}
            >
              <Input
                prefix={<NumberOutlined className="text-gray-400" />}
                placeholder="Enter OTP"
                className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          )}
          <Form.Item>
            {!otpSent ? (
              <Button type="primary" onClick={sendOtp} loading={loading} className="w-full h-10 bg-gradient-to-r from-[#F83758] to-[#D62D4C]" style={{ borderRadius: '8px' }}>
                Send OTP
              </Button>
            ) : (
              <Button type="primary" onClick={verifyOtp} loading={loading} className="w-full h-10 bg-gradient-to-r from-[#F83758] to-[#D62D4C]" style={{ borderRadius: '8px' }}>
                Verify & Login
              </Button>
            )}
          </Form.Item>
        </Form>
        <div className="text-center mt-4">
          <span className="text-gray-700">Don't have an account? </span>
          <Link to="/signup" className="text-[#F83758] hover:text-[#D62D4C]">Sign up</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
