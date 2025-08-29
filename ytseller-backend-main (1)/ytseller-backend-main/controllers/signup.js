// controllers/signup.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if mobile already exists
    const existingUser = await User.findOne({ mobile: phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    // Optional: Check email uniqueness if still using it
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
    }

    // Hash the password (optional if still used for other features)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email ? email.toLowerCase() : undefined,
      password: hashedPassword,
      mobile: phone,
      role,
    });

    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
