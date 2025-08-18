const User = require('../models/user');
const { generateAccessToken } = require('../middleware/jwt')



exports.getAllUsers = (req, res) => {
    User.getAll()
        .then(rows => { return res.json(rows) })
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Please enter in a username and password!' });
    try {
        User.verifyUser(username, password)
            .then(row => {
                row.authToken = generateAccessToken({ username });
                { return res.status(200).json(row); }
            }).catch(err => {
                return res.status(400).json({ error: err.message });
            });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.createUser = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Please enter in a username and password!' });

    User.create(username, password)
        .then(user => { return res.status(201).json(user) })
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.updateUserPassword = (req, res) => {
    const { username, old_password, new_password } = req.body;

    User.update(username, old_password, new_password)
        .then(result => {
            return res.json({ message: 'User updated' });
        })
        .catch(err => res.status(404).json({ error: err.message }));
};

exports.deleteUser = (req, res) => {
    User.remove(req.params.id)
        .then(result => {
            if (!result.deleted) return res.status(404).json({ error: 'User not found' });
            return res.json({ message: 'User deleted' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
};