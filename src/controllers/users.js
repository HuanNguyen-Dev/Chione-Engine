const User = require('../models/user');
const { generateAccessToken } = require('../middleware/jwt')
const path = require('path');


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll()
        return res.status(200).json({ users: users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserCookieInfo = async (req, res) => {
    if (req.user.username) {
        return res.json({ username: req.user.username });
    }
    else return res.status(404).json({error: "Missing authentication cookies!"})
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Please enter in a username and password!' });
    try {
        const user = await User.verifyUser(username, password);
        const authToken = generateAccessToken({ username });
        res.cookie('authToken', authToken, {
            httpOnly: true,
            secure: false,         // Set to true in production (HTTPS)
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        return res.status(200).json(user);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Please enter in a username and password!' });
    try {
        const result = await User.create(username, password);
        return res.status(201).json(result.username);
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        console.error('DB Error: ', err);
        res.status(500).json({ error: 'Server error' })
    }
};

exports.updateUserPassword = async (req, res) => {
    const { old_password, new_password } = req.body;
    const username = req.user.username;
    try {
        const result = await User.update(username, old_password, new_password);
        if (!result.updated) return res.status(404).json({ error: 'User ID not found!' });
        return res.status(200).json({ message: 'User updated' });
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const results = await User.remove(req.params.id);
        if (!results.deleted) return res.status(404).json({ error: 'User ID not found!' });
        return res.status(200).json({ message: 'User has been deleted!' });
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
};

exports.showDeletePage = async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'public', 'option.html'));
    } catch (err) {
        console.error("Error loading delete page:", err);
        res.status(500).send('Server error');
    }
};

exports.showRegisterPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
};

exports.showLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
};
