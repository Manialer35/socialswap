// controllers/login.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const twilio = require('twilio');

const otpStore = new Map(); // { mobile: { otp, expiresAt } }

// Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Step 1: Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this mobile number not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry (5 minutes)
    otpStore.set(mobile, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Send via Twilio SMS
    await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Step 2: Verify OTP & Login
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const record = otpStore.get(mobile);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP request found' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(mobile);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is valid — log user in
    otpStore.delete(mobile);
    const user = await User.findOne({ mobile });

    const token = jwt.sign(
      { userId: user._id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
