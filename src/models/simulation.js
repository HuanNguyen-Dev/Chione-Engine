// scp -r -i "C:\Users\hnguy\.ssh\CAB432-N11596708-Huan-Nguyen.pem" ubuntu@ec2-16-176-20-87.ap-southeast-2.compute.amazonaws.com:/home/ubuntu/aws "C:\Users\hnguy\OneDrive - Queensland University of Technology\Desktop\uni\3rd year\cab432"
// const vector = require('./vector') // import vector class
exports.falling_snow = (initial_state, steps, region_height, wind_speed, wind_dir, min_neighbour, max_neighbour) => {
    const cloud_configurations = calculate_cloud_configurations(initial_state, min_neighbour, max_neighbour, steps);
    let config_index = 0;
    // dynamically push to arrays as num_particles isnt known beforehand
    // max length of the array is the number of steps + the number of cloud configurations due to the global time offset
    let system_coordinate_history_x = Array.from(Array(steps + cloud_configurations.length -1).fill(0).map(() => []))
    let system_coordinate_history_y = Array.from(Array(steps + cloud_configurations.length - 1).fill(0).map(() => []))
    let system_coordinate_history_z = Array.from(Array(steps + cloud_configurations.length - 1).fill(0).map(() => []))

    for (let i = 0; i < cloud_configurations.length; i++) {
        let current_cloud_configuration = cloud_configurations[i];
        let { initial_x, initial_y, initial_z, num_particles } = initialise_state(current_cloud_configuration, steps, region_height);

        // generate the time evolution arrays for the particles through random walks
        // random walks returns in format [all particles at time n, number of particles]
        let { random_walks_x, random_walks_y, random_walks_z } = random_walks(num_particles, steps, initial_x, initial_y, initial_z, wind_speed, wind_dir)
        // store history of coords in format [timestep,pos]
        for (let k = 0; k < steps; k++) {
            let global_t = config_index + k;
            system_coordinate_history_x[global_t].push(...random_walks_x[k]); 
            system_coordinate_history_y[global_t].push(...random_walks_y[k]); 
            system_coordinate_history_z[global_t].push(...random_walks_z[k]);
        }
        config_index++;
    }
    return { system_coordinate_history_x, system_coordinate_history_y, system_coordinate_history_z };
}

exports.cellula_automata = (initial_state, min_neighbour, max_neighbour, timeframe) => {
    let cellula_automata_config = calculate_cloud_configurations(initial_state, min_neighbour, max_neighbour, timeframe);
    return cellula_automata_config;
}

function calculate_number_particles(state) {
    return state.flat().reduce((accumulator, cur_value) => accumulator += cur_value, 0)
}

// initialises the starting layer (t = 0 or column 0)
function initialise_state(initial_state, steps, region_height) {
    // initial state should be a binary 2d matrix, with 1 representing a particle
    // e.g [[1,0,1,1],
    //       1,1,1,0]]
    const num_particles = calculate_number_particles(initial_state)
    // if (num_particles < min_number_of_particles) throw new Error("Minumum number of particles must be greater than 1.6 for it to rain!");
    const region_width = initial_state[0].length;
    const region_length = initial_state.length
    const region_area = region_length * region_width
    if (region_area < 10) throw new Error("Minimum region size must be greater than 10!") // kept otherwise random walks outside of boundary

    // time evolution array for every particle in the system (particles,timestep)
    const x = Array.from(Array(steps), () => Array(num_particles).fill(0)) //[[],[]]
    const y = Array.from(Array(steps), () => Array(num_particles).fill(0))
    const z = Array.from(Array(steps), () => Array(num_particles).fill(region_height))

    // keep track of particles
    let particle_index = 0;

    // save the inital state into the first time column for each coordinate for each particle (represented by a 1)
    // 
    for (let i = 0; i < region_length; i++) {
        for (let j = 0; j < region_width; j++) {
            // record coord of particle, serperated into x and y arrays of format (particle,timestep)
            if (initial_state[i][j] === 1) {
                x[0][particle_index] = j;
                y[0][particle_index] = i;
                particle_index++;
            }
        }
    }
    return { x, y, z, num_particles };
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

function random_walks(num_particles, steps, x, y, z, wind_speed, wind_dir) {
    const delta = 1;

    let { threshold_1, threshold_2, threshold_3 } = calculate_thresholds(wind_dir, wind_speed);


    for (let i = 0; i < steps - 1; i++) {
        let vertical_displacement = Array.from(Array(num_particles), () => Math.random())
        for (let j = 0; j < num_particles; j++) {
            // check if certain particle has already hit the ground (z = 0)
            if (z[i][j] <= 0) {
                // revert changes as previous iteration has already hit the ground
                z[i + 1][j] = 0
                x[i + 1][j] = x[i][j]
                y[i + 1][j] = y[i][j]
                continue;
            }
            // calculating the z plane displacement of each particle 
            z[i + 1][j] = z[i][j] - vertical_displacement[j];

            // calculating the x-y plane displacement of each particle
            let random_displacement = Math.random();
            // note --> no boundaries currently
            // prob left in x dir
            if (random_displacement < threshold_1) {
                x[i + 1][j] = x[i][j] - delta;
                y[i + 1][j] = y[i][j];
            }
            // prob right ( dont need to check if its >threshold 1 if the structure of if statement is kept in this order)
            else if (random_displacement < threshold_2) {
                x[i + 1][j] = x[i][j] + delta;
                y[i + 1][j] = y[i][j];
            }
            // prob down in y dir
            else if (random_displacement < threshold_3) {
                y[i + 1][j] = y[i][j] - delta;
                x[i + 1][j] = x[i][j];
            }
            // prob up
            else {
                y[i + 1][j] = y[i][j] + delta;
                x[i + 1][j] = x[i][j];
            }
        }
    }
    return { x, y, z }
}

function find_zero_column(array) {
    const cols = array[0].length;
    const rows = array.length;
    const sum = Array(array[0].length).fill(0);
    let col_index = -1;
    // finds the first column in the arrray where the sum is zero and returns the index
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            sum[i] += array[j][i];
        }
        if (sum[i] === 0) {
            col_index = i;
            break;
        }
    }
    return col_index;
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
    const north_neighbour_index = Array.from(Array(rows), (row_index) => (row_index - 1 + rows) % rows); // row index: 0 -> row - 1
    const west_neighbour_index = Array.from(Array(cols), (col_index) => (col_index - 1 + cols) % cols); // col index: 0 -> col - 1

    const south_neighbour_index = Array.from(Array(rows), (row_index) => (row_index + 1) % rows);
    const east_neighbour_index = Array.from(Array(cols), (col_index) => (col_index + 1) % cols);

    // create obj for neighbourhood indexes
    const neighbour_dir = {
        north: north_neighbour_index,
        east: east_neighbour_index,
        south: south_neighbour_index,
        west: west_neighbour_index
    };

    // store each configuration of the C.A take shape in form (configs,row,col)
    let cellula_automata_config = Array.from(Array(timeframe), () => Array.from((Array(rows), () => Array(cols).fill(0))));
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
