const Simulation = require('../models/simulation');

exports.falling_snow = (req, res) => {
    const { initial_state, steps, height, wind_speed, wind_dir, min_neighbour, max_neighbour } = req.body
    if (!initial || !state || !steps || !height) return res.status(500).json({ error: "Please enter in a valid value" })
    try {
        if (!wind_speed) wind_speed = 0;
        if (!wind_dir) wind_dir = null;
        // do required checks for valid wind speed and wind dir ---------->
        Simulation.falling_snow(initial_state, steps, height,wind_speed, wind_dir, min_neighbour, max_neighbour);
    } catch (error) {
        return res.status(500).json({ error: `Something went wrong: ${error.message}` })
    }
}

exports.cellular_automata = (req, res) => {
    const { initial_state, min_neighbour, max_neighbour, timeframe } = req.body;
    if (!initial_state || !min_neighbour || !max_neighbour || !timeframe) return res.status(500).json({ error: "Please enter in a valid value" })
    try {
        Simulation.cellula_automata(initial_state, min_neighbour, max_neighbour, timeframe)
    } catch (error) {
        return res.status(500).json({ error: `Something went wrong: ${error.message}` })
    }
}