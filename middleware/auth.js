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


const decoded = jwt.verify(token, process.env.JWT_SECRET);

const user = await User.findById(decoded.id);

if (!user) {
  return res.status(401).json({ message: 'User not found' });
}

// 🔥 CHECK TOKEN ISSUE TIME
if (user.passwordChangedAt) {
  const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000);

  if (decoded.iat < changedTimestamp) {
    return res.status(401).json({ message: 'Password changed. Login again.' });
  }
}

req.user = user;
next();

