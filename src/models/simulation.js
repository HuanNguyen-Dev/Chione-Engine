// scp -r -i "C:\Users\hnguy\.ssh\CAB432-N11596708-Huan-Nguyen.pem" ubuntu@ec2-16-176-20-87.ap-southeast-2.compute.amazonaws.com:/home/ubuntu/aws "C:\Users\hnguy\OneDrive - Queensland University of Technology\Desktop\uni\3rd year\cab432"
// const vector = require('./vector') // import vector class
function falling_snow(initial_state, steps, region_height, wind_speed, wind_dir, min_neighbour, max_neighbour) {
    const cloud_configurations = calculate_cloud_configurations(initial_state, min_neighbour, max_neighbour, steps);
    let config_index = 0;
    // dynamically push to arrays as num_particles isnt known beforehand
    // max length of the array is the number of steps + the number of cloud configurations due to the global time offset
    // const total_steps = steps + cloud_configurations.length - 1;
    let system_coordinate_history_x = []
    let system_coordinate_history_y = []
    let system_coordinate_history_z = []

    for (let config_time = 0; config_time < cloud_configurations.length; config_time++) {
        let current_cloud_configuration = cloud_configurations[config_time];
        let { initial_x, initial_y, initial_z, num_particles } = initialise_state(current_cloud_configuration, steps, region_height);

        // generate the time evolution arrays for the particles through random walks
        // random walks returns in format [all particles at time n, number of particles]
        let { random_walks_x, random_walks_y, random_walks_z } = random_walks(num_particles, initial_x, initial_y, initial_z, wind_speed, wind_dir)

        // store history of coords in format [timestep,pos]
        for (let local_time_step = 0; local_time_step < random_walks_x.length; local_time_step++) {
            let global_t = config_index + local_time_step;
            if (!system_coordinate_history_x[global_t]) {
                system_coordinate_history_x[global_t] = [];
                system_coordinate_history_y[global_t] = [];
                system_coordinate_history_z[global_t] = [];
            }
            system_coordinate_history_x[global_t].push(...random_walks_x[local_time_step]);
            system_coordinate_history_y[global_t].push(...random_walks_y[local_time_step]);
            system_coordinate_history_z[global_t].push(...random_walks_z[local_time_step]);
        }

        let last_index = random_walks_z.length - 1;
        let next_config_step = last_index + config_index;
        if (!system_coordinate_history_x[next_config_step]) {
            system_coordinate_history_x[next_config_step] = [];
            system_coordinate_history_y[next_config_step] = [];
            system_coordinate_history_z[next_config_step] = [];
        }
        for (let particle = 0; particle < num_particles; particle++) {
            if (random_walks_z[last_index][particle] <= 0) {
                system_coordinate_history_x[next_config_step].push(random_walks_x[last_index][particle]);
                system_coordinate_history_y[next_config_step].push(random_walks_y[last_index][particle]);
                system_coordinate_history_z[next_config_step].push(random_walks_z[last_index][particle]);
            }
        }

        config_index++;
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
function initialise_state(initial_state, steps, region_height) {
    // initial state should be a binary 2d matrix, with 1 representing a particle
    // e.g [[1,0,1,1],
    //       1,1,1,0]]
    const num_particles = calculate_number_particles(initial_state)
    // if (num_particles < min_number_of_particles) throw new Error("Minumum number of particles must be greater than 1.6 for it to rain!");
    const region_width = initial_state[0].length;
    const region_length = initial_state.length
    const region_area = region_length * region_width
    if (region_area < 10) throw new Error("Minimum region size must be greater than 10!") // so clouds dont stay and will die

    // time evolution array for every particle in the system
    const initial_x = new Array(num_particle).fill(0) 
    const initial_y = new Array(num_particles).fill(0)
    const initial_z = new Array((num_particles).fill(region_height))

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
    let threshold_1 = 0.25; // <0.25 = left
    let threshold_2 = 0.50; // 0.25 < x < 0.5 = right
    let threshold_3 = 0.75; // 0.5 < x < 0.75 = up
    // scale down other thresholds accordingly
    let left_over_prob = (1 - wind_factor) / 3;
    switch (wind_dir) {
        case 'north':
            threshold_1 = left_over_prob;
            threshold_2 = left_over_prob * 2;
            threshold_3 = (left_over_prob * 2) + wind_factor;
            break;
        case 'east':
            threshold_1 = left_over_prob;
            threshold_2 = (left_over_prob * 2) + wind_factor;
            threshold_3 = left_over_prob * 3;
            break;
        case 'south':
            threshold_1 = left_over_prob;
            threshold_2 = left_over_prob * 2;
            threshold_3 = (left_over_prob * 3) - wind_factor;
            break;
        case 'west':
            threshold_1 = left_over_prob + wind_factor;
            threshold_2 = left_over_prob * 2;
            threshold_3 = left_over_prob * 3;
            break;
        default:
            threshold_1 = 0.25; // <0.25 = left
            threshold_2 = 0.50; // 0.25 < x < 0.5 = right
            threshold_3 = 0.75; // 0.5 < x < 0.75 = up
    }
    return { threshold_1, threshold_2, threshold_3 };
}

function calculate_windspeed_factor(wind_speed) {
    // since its probabilty, we want to apply the sigmoid function to keep between 0 and 1
    return 1 / (1 + Math.exp(-(wind_speed - 10)));
}

function random_walks(num_particles, initial_walks_x, initial_walks_y, initial_walks_z, wind_speed, wind_dir) {
    const delta = 1;

    let { threshold_1, threshold_2, threshold_3 } = calculate_thresholds(wind_dir, wind_speed);
    let random_walks_x = [];
    let random_walks_y = [];
    let random_walks_z = [];

    let system_unstable = true;
    let time_step = 0; // timestep = 0 is initial state
    random_walks_x.push(initial_walks_x);
    random_walks_y.push(initial_walks_y);
    random_walks_z.push(initial_walks_z);

    while (system_unstable) {
        time_step++;
        random_walks_x[time_step] = [];
        random_walks_y[time_step] = [];
        random_walks_z[time_step] = [];
        let vertical_displacement = Array.from({ length: num_particles }, () => Math.random())
        for (let j = 0; j < num_particles; j++) {
            // check if certain particle has already hit the ground (z = 0)
            if (random_walks_z[time_step - 1][j] <= 0) {
                // revert changes as previous iteration has already hit the ground
                random_walks_z[time_step][j] = 0
                random_walks_x[time_step][j] = random_walks_x[time_step - 1][j]
                random_walks_y[time_step][j] = random_walks_y[time_step - 1][j]
                continue;
            }
            // calculating the z plane displacement of each particle 
            random_walks_z[time_step][j] = random_walks_z[time_step - 1][j] - vertical_displacement[j];

            // calculating the x-y plane displacement of each particle
            let random_displacement = Math.random();
            // note --> no boundaries currently
            // prob left in x dir
            if (random_displacement < threshold_1) {
                random_walks_x[time_step][j] = random_walks_x[time_step - 1][j] - delta;
                random_walks_y[time_step][j] = random_walks_y[time_step - 1][j];
            }
            // prob right ( dont need to check if its >threshold 1 if the structure of if statement is kept in this order)
            else if (random_displacement < threshold_2) {
                random_walks_x[time_step][j] = random_walks_x[time_step - 1][j] + delta;
                random_walks_y[time_step][j] = random_walks_y[time_step - 1][j];
            }
            // prob down in y dir
            else if (random_displacement < threshold_3) {
                random_walks_y[time_step][j] = random_walks_y[time_step - 1][j] - delta;
                random_walks_x[time_step][j] = random_walks_x[time_step - 1][j];
            }
            // prob up
            else {
                random_walks_y[time_step][j] = random_walks_y[time_step - 1][j] + delta;
                random_walks_x[time_step][j] = random_walks_x[time_step - 1][j];
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

function calculate_next_configuration(state, neighbour_dir, min_neighbour, max_neighbour) {
    let cols = state[0].length;
    let rows = state.length;
    let tmp_state = state.map(row => [...row]);

    // count the number of cloud particles and their respective neighbours
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let live_neighbours = find_number_of_neighbours(state, neighbour_dir, i, j);
            // condition to survive
            if (meets_survival_condition(live_neighbours, min_neighbour, max_neighbour)) {
                tmp_state[i][j] = 1;
            }
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
    return (live_neighbours > min_neighbour) && (live_neighbours < max_neighbour)
        && (live_neighbours != max_neighbour - min_neighbour)
}


module.exports = {
    falling_snow,
    cellula_automata,
}