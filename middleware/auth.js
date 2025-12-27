// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ success: false, message: 'No token' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // contains user id
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };


const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔥 PASSWORD INVALIDATION CHECK
    if (user.passwordChangedAt) {
      const changedAt = parseInt(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedAt) {
        return res
          .status(401)
          .json({ message: 'Password changed. Please login again.' });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

