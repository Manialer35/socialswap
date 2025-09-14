// src/middlewares/verifyFirebase.js
const admin = require('../firebaseAdmin');
const User = require('../models/User'); // adjust to your User model path

module.exports = async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    // decoded contains uid, email, name, picture, etc.
    req.firebaseUser = decoded;

    // Map or create local user record:
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      // try to match by email if present to avoid duplicates
      if (decoded.email) {
        user = await User.findOne({ email: decoded.email });
      }
      if (!user) {
        // create a simple user skeleton; extend to match your schema
        user = await User.create({ email: decoded.email || null, firebaseUid: decoded.uid, provider: 'firebase' });
      } else {
        // link accounts
        user.firebaseUid = decoded.uid;
        await user.save();
      }
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('verifyFirebaseToken error', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
