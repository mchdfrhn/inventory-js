const { User } = require('../models');

class UserRepository {
    async createUser(username, passwordHash, fullName) {
        const user = await User.create({
            username: username,
            password_hash: passwordHash,
            full_name: fullName,
        });
        return user;
    }

    async findByUsername(username) {
        const user = await User.findOne({
            where: { username: username },
        });
        return user;
    }

    async findById(id) {
        const user = await User.findByPk(id);
        return user;
    }
}

module.exports = new UserRepository();