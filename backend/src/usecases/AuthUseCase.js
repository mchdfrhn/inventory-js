const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const config = require('../config');

class AuthUseCase {
    async register(username, password, fullName) {
        const existingUser = await UserRepository.findByUsername(username);
        if (existingUser) {
            const error = new Error('Username already exists');
            error.status = 409;
            throw error;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await UserRepository.createUser(username, passwordHash, fullName);
        return user;
    }

    async login(username, password) {
        const user = await UserRepository.findByUsername(username);
        if (!user) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            throw error;
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        return { user, token };
    }
}

module.exports = new AuthUseCase();
