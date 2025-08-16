const User = require('../models/user');

exports.getAllUsers = (req, res) => {
    User.getAll()
        .then(rows => {return res.json(rows)})
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Please enter in a username and password!' });
    try {
        User.verifyUser(username, password)
        .then(row => {
            {return res.status(200).json(row);}
        })
    }catch(err){
        return res.status(400).json({error: err.message});
    }
};

exports.createUser = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Please enter in a username and password!' });

    User.create(username, password)
        .then(task => {return res.status(201).json(task)})
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.updateUserPassword = (req, res) => {
    const { username, new_password } = req.body;

    User.update(username, new_password)
        .then(result => {
            return res.json({ message: 'Task updated' });
        })
        .catch(err => res.status(404).json({ error: err.message }));
};

exports.deleteUser = (req, res) => {
    User.remove(req.params.id)
        .then(result => {
            if (!result.deleted) return res.status(404).json({ error: 'Task not found' });
            return res.json({ message: 'Task deleted' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
};