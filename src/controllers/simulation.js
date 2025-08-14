const {falling_snow, cellula_automata} = require('../models/simulation')

exports.falling_snow = (req, res) => {
    const { initial_state, steps, height, wind_speed, wind_dir, min_neighbour, max_neighbour } = req.body
    if ( !initial_state || !steps || !height) return res.status(500).json({ error: "Please enter in a valid value" })
    try {
        if (!wind_speed) wind_speed = 0;
        if (!wind_dir) wind_dir = null;
        console.log("------------:>");
        // do required checks for valid wind speed and wind dir ---------->
        const falling_snow_coords = falling_snow(initial_state, steps, height,wind_speed, wind_dir, min_neighbour, max_neighbour);
        return res.status(200).json(falling_snow_coords)
    } catch (error) {
        return res.status(400).json({ error: `Something went wrong: ${error.message}` })
    }
}

exports.cellular_automata = (req, res) => {
    const { initial_state, min_neighbour, max_neighbour, timeframe } = req.body;
    if (!initial_state || !min_neighbour || !max_neighbour || !timeframe) return res.status(500).json({ error: "Please enter in a valid value" })
    try {
       const cellula_automata_configs = cellula_automata(initial_state, min_neighbour, max_neighbour, timeframe)
       return res.status(200).json({data: cellula_automata_configs})
    } catch (error) {
        return res.status(400).json({ error: `Something went wrong: ${error.message}` })
    }
}



