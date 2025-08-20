const { falling_snow, cellula_automata } = require('../models/simulation')
const { spawn } = require('child_process')
const { createCanvas } = require('canvas')

exports.falling_snow = (req, res) => {
    let { initial_state, steps, height, wind_speed = 0, wind_dir = null, min_neighbour, max_neighbour } = req.body;
    if (!initial_state || !steps || !height) return res.status(500).json({ error: "Please enter in a valid value" })
    try {
        if (!wind_speed) wind_speed = 0;
        if (!wind_dir) wind_dir = null;
        // console.log({
        //     initial_state,
        //     steps,
        //     height,
        //     wind_speed,
        //     wind_dir,
        //     min_neighbour,
        //     max_neighbour
        // });
        // do required checks for valid wind speed and wind dir ---------->
        const falling_snow_coords = falling_snow(initial_state, steps, height, wind_speed, wind_dir, min_neighbour, max_neighbour);
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
        return res.status(200).json({ data: cellula_automata_configs })
    } catch (error) {
        return res.status(400).json({ error: `Something went wrong: ${error.message}` })
    }
}

// chatgpt
exports.falling_snow_video = (req, res) => {
    let { initial_state, steps, height, wind_speed = 0, wind_dir = null, min_neighbour, max_neighbour } = req.body;
    if (!initial_state || !steps || !height) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    try {
        if (!wind_speed) wind_speed = 0;
        if (!wind_dir) wind_dir = null;

        // run your simulation
        const sim = falling_snow(initial_state, steps, height, wind_speed, wind_dir, min_neighbour, max_neighbour);

        const framesX = sim.system_coordinate_history_x;
        const framesY = sim.system_coordinate_history_y;
        const framesZ = sim.system_coordinate_history_z;

        // setup canvas for drawing each frame
        const width = 800, heightPx = 600;
        const canvas = createCanvas(width, heightPx);
        const ctx = canvas.getContext('2d');

        // spawn ffmpeg (encode PNGs → mp4 stream)
        const ffmpeg = spawn('ffmpeg', [
            '-y',
            '-f', 'image2pipe',   // input is a stream of images
            '-vcodec', 'png',
            '-r', '20',           // fps
            '-i', '-',            // read from stdin
            '-c:v', 'libx264',    // encode H.264
            '-pix_fmt', 'yuv420p',
            '-movflags', 'frag_keyframe+faststart', // makes MP4 seekable
            '-f', 'mp4',          // explicit container
            'pipe:1'              // write to stdout
        ]);


        // stream back to browser
        res.setHeader('Content-Type', 'video/mp4');
        ffmpeg.stdout.pipe(res);
        ffmpeg.stderr.on('data', d => console.error(d.toString()));


        const writeFrame = async (buf) => {
            return new Promise((resolve, reject) => {
                ffmpeg.stdin.write(buf, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        };
        // feed frames into ffmpeg
        (async () => {
            for (let t = 0; t < framesX.length; t++) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, width, heightPx);

                for (let p = 0; p < framesX[t].length; p++) {
                    const x = framesX[t][p];
                    const y = framesY[t][p];
                    const z = framesZ[t][p]; // use z

                    // Simple perspective projection
                    const scale = 1 / (1 + z * 0.05); // further away = smaller
                    const screenX = width / 2 + x * 5 * scale;
                    const screenY = heightPx / 2 + y * 5 * scale;
                    const radius = 2 * scale;
                    const brightness = Math.min(255, 100 + z * 10); // clamp 0–255
                    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

                    ctx.beginPath();
                    ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }

                const buf = canvas.toBuffer('image/png');
                await writeFrame(buf);
            }

            ffmpeg.stdin.end();
        })();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Render failed" });
    }
};



