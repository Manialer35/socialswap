// ===== Updated Login.jsx =====
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
      const phoneValue = form.getFieldValue('phone');
      if (!phoneValue) {
        return message.error('Please enter your phone number');
      }
      setLoading(true);
      const res = await axiosInstance.post(`${api}/auth/send-otp`, { phone: phoneValue });
      if (res.data.success) {
        setOtpSent(true);
        setPhone(phoneValue);
        message.success('OTP sent successfully');
      } else {
        message.error(res.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (values) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post(`${api}/auth/verify-otp`, {
        phone: values.phone,
        otp: values.otp
      });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user?.role);
        message.success('Login successful!');
        if (user.role === 'buyer') navigate('/');
        if (user.role === 'seller') navigate('/seller-dashboard');
        if (user.role === 'admin') navigate('/admin-dashboard');
      } else {
        message.error(res.data.message || 'Invalid OTP');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 p-4">
      <Card className="w-full max-w-md backdrop-blur-md bg-white/30 border border-white/50 shadow-lg" style={{ borderRadius: '16px' }}>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login with Mobile OTP</h2>
        <Form form={form} layout="vertical" onFinish={verifyOtp}>
          <Form.Item name="phone" rules={[{ required: true, message: 'Please enter your phone number!' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" disabled={otpSent} />
          </Form.Item>

          {otpSent && (
            <Form.Item name="otp" rules={[{ required: true, message: 'Please enter the OTP!' }]}>
              <Input prefix={<NumberOutlined />} placeholder="Enter OTP" />
            </Form.Item>
          )}

          {!otpSent ? (
            <Button type="primary" onClick={sendOtp} loading={loading} className="w-full">
              Send OTP
            </Button>
          ) : (
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              Verify OTP & Login
            </Button>
          )}
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-700">Don't have an account? </span>
          <Link to="/signup" className="text-[#F83758] hover:text-[#D62D4C] transition-colors duration-300">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;