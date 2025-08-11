const Simulation = require('../models/simulation');

exports.initialise = (req, res) => {
    const {initial_state, steps, height} = req.body
    Simulation.initialise(initial_state, steps, height);
    if (!initial) res.status(500).json({ error: "Not implemented" })
}