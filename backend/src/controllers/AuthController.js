const AuthUseCase = require('../usecases/AuthUseCase');

class AuthController {
    async register(req, res, next) {
        try {
            const { username, password, fullName } = req.body;
            const user = await AuthUseCase.register(username, password, fullName);
            res.status(201).json({
                message: 'User created successfully',
                user: { id: user.id, username: user.username, fullName: user.full_name }
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            console.log('Received password:', password);
            const { user, token } = await AuthUseCase.login(username, password);
            res.status(200).json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
