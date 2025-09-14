// src/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');

// Option A: load JSON file (dev)
const serviceAccount = require(path.join(__dirname, '../config/socialswap-49189-firebase-adminsdk-fbsvc-13b4db401d.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
