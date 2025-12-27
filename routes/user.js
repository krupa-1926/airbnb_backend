const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth');

const {
  register,
  login,
  profile,
  logout,
  updateUser
} = require('../controllers/userController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/profile').get(profile);
router.route('/logout').post(logout);
// router.route('/update-user').put(updateUser);
router.route('/update-user').put(updateUser);

module.exports = router;

