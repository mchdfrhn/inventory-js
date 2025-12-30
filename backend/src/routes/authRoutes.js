const express = require('express');
const AuthController = require('../controllers/AuthController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validations/schemas');

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

module.exports = router;
