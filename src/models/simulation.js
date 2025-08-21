const { spawn } = require('child_process');
const { createCanvas } = require('canvas');

// scp -r -i "C:\Users\hnguy\.ssh\CAB432-N11596708-Huan-Nguyen.pem" ubuntu@ec2-16-176-20-87.ap-southeast-2.compute.amazonaws.com:/home/ubuntu/aws "C:\Users\hnguy\OneDrive - Queensland University of Technology\Desktop\uni\3rd year\cab432"
// const vector = require('./vector') // import vector class
function falling_snow(initial_state, steps, region_height, wind_speed, wind_dir, min_neighbour, max_neighbour) {
    let cloud_configurations = calculate_cloud_configurations(initial_state, min_neighbour, max_neighbour, steps);
    // remove configurations that are dead, otherwise it will perform random walks on particles at (0,0,0)
    for (let i = 0; i < cloud_configurations.length; i++) {
        if (is_empty_configuration(cloud_configurations[i])) {
            if (i === 0) throw new Error("Must have at least 1 cloud particle!");
            cloud_configurations = cloud_configurations.slice(0, i);
            break;
        }
    }

    const batches = [];
    // const batch_particle_ids = [];
    // let particle_counter = 0;
    let max_steps = 0;

    // for each configuration, compute the random walks of each state / cloud config
    for (let i = 0; i < cloud_configurations.length; i++) {
        let { initial_x, initial_y, initial_z, num_particles } = initialise_state(cloud_configurations[i], region_height);
        // const ids = Array.from({ length: num_particles }, () => particle_counter++);
        // batch_particle_ids.push(ids);

        // generate the time evolution arrays for the particles through random walks
        // random walks returns in format {random walks for x,y,z} with each coordinate structured as:
        // [all particles at time n, number of particles]
        const walk = random_walks(num_particles, initial_x, initial_y, initial_z, wind_speed, wind_dir);
        batches.push(walk);
        // as each config produces a different walk, we want to find out the maximum number of steps required to reach the ground
        // to find the upper bound
        if (walk.random_walks_x.length > max_steps) {
            max_steps = walk.random_walks_x.length;
        }
    }

    // cloud config length is added as the next cloud configuration is offset by one
    const total_steps = max_steps + cloud_configurations.length - 1;
    let system_coordinate_history_x = Array.from({ length: total_steps }, () => []);
    let system_coordinate_history_y = Array.from({ length: total_steps }, () => []);
    let system_coordinate_history_z = Array.from({ length: total_steps }, () => []);

    // store each walk for each batch into the system --> note the offset required for each config as explained above
    for (let i = 0; i < batches.length; i++) {
        const landed_particles_map = new Map();
        // if (is_empty_configuration(batches[i]))continue;
        const { random_walks_x, random_walks_y, random_walks_z } = batches[i];
        // const ids = batch_particle_ids[i];
        const local_steps_for_config = random_walks_x.length;

        // add random walks of each config into the global system coords history
        for (let step = 0; step < local_steps_for_config; step++) {
            // offset by config time --> e.g config 2 starts at global step 2
            const global_step = i + step;
            if (global_step >= total_steps) break;

            let num_particles = random_walks_z[step].length;
            // find if particle is falling or has reached ground
            for (let particle = 0; particle < num_particles; particle++) {
                const x = random_walks_x[step][particle];
                const y = random_walks_y[step][particle];
                const z = random_walks_z[step][particle];
                // const particle_id = ids[particle];

                system_coordinate_history_x[global_step].push(x);
                system_coordinate_history_y[global_step].push(y);
                // prevent reaching below ground
                if (z <= 0) {
                    system_coordinate_history_z[global_step].push(0);
                }
                else {
                    system_coordinate_history_z[global_step].push(z);
                }
            }
            // last step indicate particles have hit the ground
            // store those particles across all itimesteps of the system for continuity
            if (step === local_steps_for_config - 1) {
                for (let future_steps = global_step; future_steps < total_steps; future_steps++) {
                    system_coordinate_history_x[future_steps].push(...random_walks_x[local_steps_for_config - 1]);
                    system_coordinate_history_y[future_steps].push(...random_walks_y[local_steps_for_config - 1]);
                    system_coordinate_history_z[future_steps].push(...random_walks_z[local_steps_for_config - 1].map(_ => 0));
                }
            }
        }
    }
    return { system_coordinate_history_x, system_coordinate_history_y, system_coordinate_history_z };
}



function cellula_automata(initial_state, min_neighbour, max_neighbour, timeframe) {
    let cellula_automata_config = calculate_cloud_configurations(initial_state, min_neighbour, max_neighbour, timeframe);
    return cellula_automata_config;
}

function calculate_number_particles(state) {
    return state.flat().reduce((accumulator, cur_value) => accumulator += cur_value, 0)
}

// initialises the starting layer (t = 0 or column 0) --> moving from initial state into a 1d particle array at step = 0
function initialise_state(initial_state, region_height) {
    // initial state should be a binary 2d matrix, with 1 representing a particle
    // e.g [[1,0,1,1],
    //       1,1,1,0]]
    const num_particles = calculate_number_particles(initial_state)
    // if (num_particles < min_number_of_particles) throw new Error("Minumum number of particles must be greater than 1.6 for it to rain!");
    const region_width = initial_state[0].length;
    const region_length = initial_state.length;
    const region_area = region_length * region_width;
    if (region_area < 10) throw new Error("Minimum region size must be greater than 10!") // so clouds dont stay and will die

    // time evolution array for every particle in the system
    const initial_x = new Array(num_particles).fill(0);
    const initial_y = new Array(num_particles).fill(0);
    const initial_z = new Array(num_particles).fill(region_height);

    // keep track of particles
    let particle_index = 0;

    // save the inital state into the first time column for each coordinate for each particle (represented by a 1)
    // [[t0p0]...[t2p3]...[tNpN]]
    for (let i = 0; i < region_length; i++) {
        for (let j = 0; j < region_width; j++) {
            // record coord of particle, serperated into x and y arrays
            if (initial_state[i][j] === 1) {
                initial_x[particle_index] = j;
                initial_y[particle_index] = i;
                particle_index++;
            }
        }
    }
    return { initial_x, initial_y, initial_z, num_particles };
}

function calculate_thresholds(wind_dir, wind_speed) {
    let wind_factor = calculate_windspeed_factor(wind_speed);
    // random walk base probabilities
    let prob_left = 0.25;
    let prob_right = 0.25;
    let prob_up = 0.25;
    let prob_down = 0.25;
    // scale down other thresholds accordingly
    let left_over_prob = (1 - wind_factor) / 3;
    switch ((wind_dir).toLowerCase()) {
        case 'north':
            prob_left = prob_right = prob_down = left_over_prob;
            prob_up = wind_factor;
            break;
        case 'east':
            prob_left = prob_down = prob_up = left_over_prob;
            prob_right = wind_factor;
            break;
        case 'south':
            prob_left = prob_right = prob_up = left_over_prob;
            prob_down = wind_factor;
            break;
        case 'west':
            prob_left = wind_factor;
            prob_right = prob_down = prob_up = left_over_prob;
            break;
        default: // even 0.25 each
    }
    let threshold_1 = prob_left;
    let threshold_2 = prob_left + prob_right;
    let threshold_3 = prob_left + prob_right + prob_down;
    return { threshold_1, threshold_2, threshold_3 };
}

function calculate_windspeed_factor(wind_speed) {
    const max_factor = 0.65
    // since its probabilty, we want to apply the sigmoid function to keep between 0 and 1
    return max_factor * 1 / (1 + Math.exp(-(wind_speed - 10)));
}

function random_walks(num_particles, initial_walks_x, initial_walks_y, initial_walks_z, wind_speed, wind_dir) {
    const delta = 1;

    let { threshold_1, threshold_2, threshold_3 } = calculate_thresholds(wind_dir, wind_speed);
    let random_walks_x = [];
    let random_walks_y = [];
    let random_walks_z = [];

    let system_unstable = true;
    let time_step = 0; // timestep = 0 is initial state
    random_walks_x.push([...initial_walks_x]);
    random_walks_y.push([...initial_walks_y]);
    random_walks_z.push([...initial_walks_z]);

    while (system_unstable) {
        time_step++;
        random_walks_x[time_step] = [];
        random_walks_y[time_step] = [];
        random_walks_z[time_step] = [];
        let vertical_displacement = Array.from({ length: num_particles }, () => Math.random())
        for (let j = 0; j < num_particles; j++) {
            const x_prev = random_walks_x[time_step - 1][j];
            const y_prev = random_walks_y[time_step - 1][j];
            const z_prev = random_walks_z[time_step - 1][j];

            // check if certain particle has already hit the ground (z = 0)
            if (random_walks_z[time_step - 1][j] <= 0) {
                // revert changes as previous iteration has already hit the ground
                random_walks_z[time_step][j] = 0;
                random_walks_x[time_step][j] = x_prev;
                random_walks_y[time_step][j] = y_prev;
                continue;
            }
            // calculating the z plane displacement of each particle 
            random_walks_z[time_step][j] = z_prev - vertical_displacement[j];

            // calculating the x-y plane displacement of each particle
            let random_displacement = Math.random();

            // left
            if (random_displacement < threshold_1) {
                random_walks_x[time_step][j] = x_prev - delta;
                random_walks_y[time_step][j] = y_prev;
            }
            // right
            else if (random_displacement < threshold_2) {
                random_walks_x[time_step][j] = x_prev + delta;
                random_walks_y[time_step][j] = y_prev;
            }
            // down
            else if (random_displacement < threshold_3) {
                random_walks_y[time_step][j] = y_prev - delta;
                random_walks_x[time_step][j] = x_prev;
            }
            // up
            else {
                random_walks_y[time_step][j] = y_prev + delta;
                random_walks_x[time_step][j] = x_prev;
            }
        }
        if (all_particles_grounded(random_walks_z[time_step])) {
            system_unstable = false;
        }
    }
    return { random_walks_x, random_walks_y, random_walks_z }
}

function all_particles_grounded(array) {
    return array.every(z => z <= 0);
}

function is_empty_configuration(array) {
    return array.every(sub_array => sub_array.every(i => i === 0));
}

function calculate_next_configuration(state, neighbour_dir, min_neighbour, max_neighbour) {
    let cols = state[0].length;
    let rows = state.length;
    let tmp_state = state.map(row => [...row]);

    // count the number of cloud particles and their respective neighbours
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let live_neighbours = find_number_of_neighbours(state, neighbour_dir, i, j);
            // condition to survive
            if (state[i][j] && meets_survival_condition(live_neighbours, min_neighbour, max_neighbour)) {
                tmp_state[i][j] = 1;
            }
            // new particle is born
            else if (state[i][j] === 0 && live_neighbours >= min_neighbour && live_neighbours <= max_neighbour) {
                tmp_state[i][j] = 1;
            }
            // particle is dead
            else {
                tmp_state[i][j] = 0;
            }
        }
    }
    return tmp_state;
}

function calculate_cloud_configurations(initial_state, min_neighbour, max_neighbour, timeframe) {
    // note inital state must be a 2d binary matrix --> make the required checks !
    let cols = initial_state[0].length;
    let rows = initial_state.length;
    // set boundary for cellula automata e.g wrap around for each cardinal direction
    // [0,1,2,3,4] => [4,0,1,2,3] for north
    // [0,1,2,3,4] => [1,2,3,4,0] for south
    // --> note south and east are similar but will each depend on rows and cols respectively, same with north and west
    // [0,1,2,3,4] => [4,0,1,2,3] for west
    // [0,1,2,3,4] => [1,2,3,4,0] for east
    const north_neighbour_index = Array.from({ length: rows }, (_, row_index) => (row_index - 1 + rows) % rows); // row index: 0 -> row - 1
    const west_neighbour_index = Array.from({ length: cols }, (_, col_index) => (col_index - 1 + cols) % cols); // col index: 0 -> col - 1

    const south_neighbour_index = Array.from({ length: rows }, (_, row_index) => (row_index + 1) % rows);
    const east_neighbour_index = Array.from({ length: cols }, (_, col_index) => (col_index + 1) % cols);

    // create obj for neighbourhood indexes
    const neighbour_dir = {
        north: north_neighbour_index,
        east: east_neighbour_index,
        south: south_neighbour_index,
        west: west_neighbour_index
    };

    // store each configuration of the C.A take shape in form (configs,row,col)
    let cellula_automata_config = Array.from(Array(timeframe), () => Array.from(Array(rows), () => Array(cols).fill(0)));
    // create temporary state 
    let tmp_state = initial_state.map(row => [...row]);
    cellula_automata_config[0] = initial_state.map(row => [...row]);
    for (let i = 1; i < timeframe; i++) {
        tmp_state = calculate_next_configuration(tmp_state, neighbour_dir, min_neighbour, max_neighbour);
        cellula_automata_config[i] = tmp_state.map((rows) => [...rows]);
        if (calculate_number_particles(tmp_state) === 0) {
            // if the configuration dies out before the timeframe ends (note .slice is not inclusive of upper bound so +1 is req.)
            if (i != timeframe - 1) return cellula_automata_config.slice(0, i + 1);
        }
    }
    return cellula_automata_config;
}


function find_number_of_neighbours(initial_state, neighbour_dir, i, j) {
    let live_neighbours = 0;
    const { north, east, south, west } = neighbour_dir;
    // count the number of cloud particles and their respective neighbours
    live_neighbours =
        // cardinal neighbours
        initial_state[north[i]][j] + initial_state[i][west[j]]
        + initial_state[south[i]][j] + initial_state[i][east[j]]
        // diagonal neighbouts
        + initial_state[north[i]][east[j]] + initial_state[north[i]][west[j]]
        + initial_state[south[i]][east[j]] + initial_state[south[i]][west[j]];
    return live_neighbours;
}

function meets_survival_condition(live_neighbours, min_neighbour, max_neighbour) {
    return (live_neighbours >= min_neighbour) && (live_neighbours <= max_neighbour)
        && (live_neighbours != max_neighbour - min_neighbour)
}

async function render_video(params, writeStream) {
    let { initial_state, steps, height, wind_speed = 0, wind_dir = null, min_neighbour, max_neighbour, view = "default" } = params;

    if (!initial_state || !steps || !height || !min_neighbour || !max_neighbour) throw new Error("Invalid parameters");

    // run simulation
    const sim = falling_snow(initial_state, steps, height, wind_speed, wind_dir, min_neighbour, max_neighbour);
    const framesX = sim.system_coordinate_history_x;
    const framesY = sim.system_coordinate_history_y;
    const framesZ = sim.system_coordinate_history_z;

    const width = 800, heightPx = 600;
    const canvas = createCanvas(width, heightPx);
    const ctx = canvas.getContext('2d');

    // spawn ffmpeg
    const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'png',
        '-r', '20',
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-movflags', 'frag_keyframe+faststart',
        '-f', 'mp4',
        'pipe:1'
    ]);

    ffmpeg.stdout.pipe(writeStream);
    ffmpeg.stderr.on('data', d => console.error(d.toString()));

    const writeFrame = (buf) => new Promise((resolve, reject) => {
        ffmpeg.stdin.write(buf, err => (err ? reject(err) : resolve()));
    });

    // center and scale calculation
    const maxX = framesX.reduce((max, step) => Math.max(max, ...step), -Infinity);
    const minX = framesX.reduce((min, step) => Math.min(min, ...step), Infinity);
    const maxY = framesY.reduce((max, step) => Math.max(max, ...step), -Infinity);
    const minY = framesY.reduce((min, step) => Math.min(min, ...step), Infinity);
    const maxZ = framesZ.reduce((max, step) => Math.max(max, ...step), -Infinity);
    const minZ = framesZ.reduce((min, step) => Math.min(min, ...step), Infinity);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const baseScale = (Math.min(width, heightPx) / 2 - 50) / maxDim;
    const angle = Math.PI / 6;

    // let velocities = view === "velocity" ? [] : null;
    for (let t = (view === "velocity" ? 1 : 0); t < framesX.length; t++) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, heightPx);
        // let frameVel = [];
        for (let p = 0; p < framesX[t].length; p++) {
            const x = framesX[t][p] - centerX;
            const y = framesY[t][p] - centerY;
            const z = framesZ[t][p] - centerZ;

            const scale = 1 / (1 + z * 0.05);
            const screenX = (x - y) * Math.cos(angle) * baseScale + width / 2;
            const screenY = (x + y) * Math.sin(angle) * baseScale - z * baseScale + heightPx / 2;


            const radius = 2 * scale;
            if (view === "depth") {
                const zNorm = (z - minZ) / (maxZ - minZ); // normalize 0–1
                const r = Math.floor(255 * (1 - zNorm));
                const g = Math.floor(255 * zNorm);
                const b = 255;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            }
            else if (view === "velocity") {
                const dx = framesX[t][p] - framesX[t - 1][p];
                const dy = framesY[t][p] - framesY[t - 1][p];
                const dz = framesZ[t][p] - framesZ[t - 1][p];
                const speed = Math.sqrt(dx * dx + dy * dy + dz * dz);

                const normSpeed = speed / 5; // or dynamic max speed
                const r = Math.floor(255 * Math.min(1, normSpeed));
                const b = Math.floor(255 * Math.min(1, 1 - normSpeed));
                const g = 50;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

                // if (velocities) frameVel.push(speed);
            }
            else {
                const brightness = Math.min(255, 150 + z * 10);
                ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
            }

            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
            ctx.fill();
        }
        // if (view === "velocity") {
        //     velocities.push(frameVel);
        // }

        const buf = canvas.toBuffer('image/png');
        await writeFrame(buf);
    }

    ffmpeg.stdin.end();

    return new Promise((resolve, reject) => {
        ffmpeg.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg exited with code ${code}`));
        });
    });
}


module.exports = {
    falling_snow,
    cellula_automata,
    render_video
}