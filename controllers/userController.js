// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const userFromToken = require('../utils/userFromToken');

// // ====================== REGISTER ======================
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Name, email, and password are required' });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already registered' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     user.password = undefined;

//     res.status(201).json({ user, token });
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };

// // ====================== LOGIN ======================
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRY || '7d',
//     });

//     user.password = undefined;

//     res.status(200).json({ user, token });
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };

// // ====================== GET PROFILE ======================
// exports.profile = async (req, res) => {
//   try {
//     const userData = userFromToken(req);
//     if (!userData) return res.status(401).json({ message: 'Not authorized' });

//     const user = await User.findById(userData.id).select('-password');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };

// // ====================== UPDATE USER ======================
// exports.updateUser = async (req, res) => {
//   try {
//     const { name, password } = req.body;

//     const user = await User.findById(req.user.id); // use logged-in user id
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     if (name) user.name = name;
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//       user.passwordChangedAt = Date.now(); // invalidate old tokens
//     }

//     await user.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     user.password = undefined;

//     res.status(200).json({ success: true, message: 'User updated successfully', user, token });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Update failed', error: err.message });
//   }
// };

// // ====================== LOGOUT ======================
// exports.logout = async (req, res) => {
//   // If using cookies for JWT:
//   res.cookie('token', '', { httpOnly: true, expires: new Date(0) }).json({
//     message: 'Logged out successfully!',
//   });

//   // If not using cookies, just instruct client to delete token:
//   // res.json({ message: 'Logged out successfully!' });
// };
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    user.password = undefined;
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

     console.log('DB Password Hash:', user.password); 
    const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', isMatch);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    user.password = undefined;
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ================= PROFILE =================
exports.profile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ================= UPDATE USER =================
exports.updateUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    // const user = req.user;
      const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (password) {
      console.log('Old Hash Before Update:', user.password); 
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.passwordChangedAt = Date.now(); // invalidate old tokens
      console.log('New Hash After Update:', user.password);
    }

    await user.save();

    // Issue new token after password change
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    user.password = undefined;
    res.status(200).json({ success: true, message: 'User updated successfully', user, token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: err.message });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) }).json({
    message: 'Logged out successfully!',
  });
};
