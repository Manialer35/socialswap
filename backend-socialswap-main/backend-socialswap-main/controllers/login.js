const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Temporary in-memory OTP store (use Redis or DB in production)
const otpStore = {};

exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP temporarily (with expiry)
    otpStore[mobile] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    // TODO: Integrate with SMS provider here
    console.log(`OTP for ${mobile}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyOtpLogin = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
    }

    const stored = otpStore[mobile];
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP after verification
    delete otpStore[mobile];

    // Find or create user
    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile, role: 'user' });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, mobile: user.mobile, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name || '',
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
