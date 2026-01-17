const authRepository = require('../repositories/auth.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signUp = async (username, email, password) => {
    // validation
    if (!username || !email || !password) {
        throw new Error('Toate câmpurile sunt obligatorii');
    }
    if (password.length < 6) {
        throw new Error('Parola trebuie să aibă minim 6 caractere');
    }

    // check if user already exists
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
        throw new Error('Emailul este deja folosit');
    }

    // encrypt pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = await authRepository.create(username, email, hashedPassword);
    return newUser; // Returnăm user-ul fără parolă
};

const login = async (email, password) => {
    // check if user exists
    const user = await authRepository.findByEmail(email);
    if (!user) {
        throw new Error('Acreditări invalide'); // Mesaj generic din motive de securitate
    }

    // check pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Acreditări invalide');
    }

    // create and return a token
    const payload = {
        id: user.id, 
        type: user.user_type 
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET, // .env secret key
        { expiresIn: '1h' } // 1 hour token
    );

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            userType: user.user_type
        }
    };
};

module.exports = {
    signUp,
    login
};