const authService = require('../services/auth.service');

const httpSignUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await authService.signUp(username, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error in httpSignUp:', error);
        // we send the validation error (ex. "Email already used")
        res.status(400).json({ error: error.message });
    }
};

const httpLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json(result); // send token and user
    } catch (error) {
        console.error('Error in httpLogin:', error);
        // "unauthorized"
        res.status(401).json({ error: error.message });
    }
};

module.exports = {
    httpSignUp,
    httpLogin
};