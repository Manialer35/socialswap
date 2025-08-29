// src/Pages/Seller/SignUp.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, NumberOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance, { api } from '../../API/api';

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('buyer');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    form.setFieldsValue({ role: category });
  };

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
        message.success('Phone number verified!');
        setPhoneVerified(true);
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

  const onFinish = async (values) => {
    if (!phoneVerified) {
      return message.error('Please verify your phone number before signing up.');
    }
    try {
      const { confirmPassword, otp, ...signupData } = values; // remove OTP from payload
      signupData.role = selectedCategory;
      setLoading(true);
      const response = await axiosInstance.post(`${api}/auth/signup`, signupData);
      if (response.data.success) {
        message.success('Signup successful! Please login.');
        navigate('/login');
      } else {
        message.error(response.data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      message.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 p-4">
      {/* Animated background circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>

      <Card 
        className="w-full max-w-lg backdrop-blur-md bg-white/30 border border-white/50 shadow-lg"
        style={{
          borderRadius: '16px',
        }}
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Your Account</h2>
        
        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ role: 'buyer' }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Full Name" 
              className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="Email" 
              className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number!' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />} 
              placeholder="Phone Number" 
              className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
              style={{ borderRadius: '8px' }}
              disabled={otpSent}
              addonAfter={!otpSent ? <Button type="link" onClick={sendOtp}>Send OTP</Button> : null}
            />
          </Form.Item>

          {otpSent && !phoneVerified && (
            <Form.Item
              name="otp"
              rules={[{ required: true, message: 'Please enter OTP' }]}
            >
              <Input
                prefix={<NumberOutlined className="text-gray-400" />} 
                placeholder="Enter OTP"
                className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
                style={{ borderRadius: '8px' }}
                addonAfter={<Button type="link" onClick={verifyOtp}>Verify OTP</Button>}
              />
            </Form.Item>
          )}

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters long!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Password" 
              className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Confirm Password" 
              className="h-10 !bg-white/50 border-white/50 hover:!bg-white/70 focus:!bg-white/70"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item name="role" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              disabled={!phoneVerified}
              loading={loading}
              className="w-full h-10 bg-gradient-to-r from-[#F83758] to-[#D62D4C] hover:from-[#D62D4C] hover:to-[#F83758]"
              style={{ borderRadius: '8px' }}
            >
              Sign up
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center mt-4">
          <span className="text-gray-700">Already have an account? </span>
          <Link 
            to="/login" 
            className="text-[#F83758] hover:text-[#D62D4C] transition-colors duration-300"
          >
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
