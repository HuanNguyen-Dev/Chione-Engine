const vector = require('./vector') // import vector class
const min_number_of_particles = 1.6;
const min_neighbour = 3;
const max_neighbour = 8;
exports.falling_snow = (initial_state, steps, region_height) => {
    let { x, y, z } = initialise_state(initial_state, steps, region_height);
    // generate the time evolution arrays for the particles through random walks
    ({ x, y, z } = random_walks(num_particles, steps, x, y, z));
    return {x,y,z};
}

exports.cellula_automata = (inital_state, min_neighbour, max_neighbour,timeframe) => {
    cellula_automata_config = cloud_dispersion(inital_state,z,min_neighbour,max_neighbour,timeframe);
    return cellula_automata_config;
}

// initialises the starting layer (t = 0 or column 0)
function initialise_state(initial_state, steps, region_height) {
    // initial state should be a binary 2d matrix, with 1 representing a particle
    // e.g [[1,0,1,1],
    //       1,1,1,0]]
    const num_particles = initial_state.flat().reduce((accumulator, cur_value) => accumulator += cur_value, 0)
    // if (num_particles < min_number_of_particles) throw new Error("Minumum number of particles must be greater than 1.6 for it to rain!");
    const region_width = initial_state[0].length;
    const region_length = initial_state.length
    const region_area = region_length * region_width
    if (region_area < 10) throw new Error("Minimum region size must be greater than 10!") // kept otherwise random walks outside of boundary

    // time evolution array for every particle in the system (particles,timestep)
    const x = Array.from(Array(num_particles), () => Array(steps).fill(0)) //[[],[]]
    const y = Array.from(Array(num_particles), () => Array(steps).fill(0))
    const z = Array.from(Array(num_particles), () => Array(steps).fill(region_height))

    // keep track of particles
    let particle_index = 0;

    // save the inital state into the first time column for each coordinate for each particle (represented by a 1)
    for (let i = 0; i < region_length; i++) {
        for (let j = 0; j < region_width; j++) {
            if (inital_state[i][j] === 1) {
                x[particle_index][0] = i;
                y[particle_index][0] = j;
                particle_index++;
            }
        }
    }
    return { x, y, z };
}

function random_walks(num_particles, steps, x, y, z) {
    // random walk probabilities
    const threshold_1 = 0.25;
    const threshold_2 = 0.50;
    const threshold_3 = 0.75;

    const delta = 1;

    for (let i = 0; i < num_particles; i++) {
        let vertical_displacement = Array.from(Array(steps), () => Math.random())
        for (let j = 0; j < steps - 1; j++) {
            // check if certain particle has already hit the ground (z = 0)
            if (z[i][j] <= 0) {
                // revert changes as previous iteration has already hit the ground
                z[i][j + 1] = 0
                x[i][j + 1] = x[i][j]
                y[i][j + 1] = y[i][j]
                continue;
            }
            // calculating the z plane displacement of each particle 
            z[i][j + 1] = z[i][j] - vertical_displacement[j];

            // calculating the x-y plane displacement of each particle
            let random_displacement = Math.random();
            // prob left in x dir
            if (random_displacement < threshold_1) {
                x[i][j + 1] = x[i][j] - delta;
                y[i][j + 1] = y[i][j];
            }
            else if (random_displacement > threshold_1 && random_displacement < threshold_2) {
                x[i][j + 1] = x[i][j] + delta;
                y[i][j + 1] = y[i][j];
            }
            // prob down in y dir
            else if (random_displacement > threshold_2 && random_displacement < threshold_3) {
                y[i][j + 1] = y[i][j] - delta;
                x[i][j + 1] = x[i][j];
            }
            else {
                y[i][j + 1] = y[i][j] + delta;
                x[i][j + 1] = x[i][j];
            }
        }
    }
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
function cloud_dispersion(initial_state, min_neighbour, max_neighbour, timeframe) {

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

    const south_neighbout_index = Array.from(Array(rows), (row_index) => (row_index + 1) % rows);
    const east_neighbour_index = Array.from(Array(cols), (col_index) => (col_index + 1) % cols);

    // store each configuration of the CA of shape (row,col,#configs)
    let cellula_automata_config = Array.from(Array(rows), () => Array.from((Array(cols), () => Array(timeframe).fill(0))));

    let tmp_state = initial_state.map(row => [...row]);

    for (let k = 0; k < timeframe; k++) {
        // count the number of cloud particles and their respective neighbours
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                cellula_automata_config[i][j][k] = initial_state[i][j];

                let live_neighbours =
                    // cardinal neighbours
                    initial_state[north_neighbour_index[i]][j] + initial_state[i][west_neighbour_index[j]]
                    + initial_state[south_neighbout_index[i]][j] + initial_state[i][east_neighbour_index[j]]
                    // diagonal neighbouts
                    + initial_state[north_neighbour_index[i]][east_neighbour_index[j]] + initial_state[north_neighbour_index[i]][west_neighbour_index[j]]
                    + initial_state[south_neighbout_index[i]][east_neighbour_index[j]] + initial_state[south_neighbout_index[i]][west_neighbour_index[j]];

                // condition to survive
                if ((live_neighbours > min_neighbour) && (live_neighbours < max_neighbour)
                    && (live_neighbours != max_neighbour - min_neighbour)) {
                    tmp_state[i][j] = 1;
                }
                else {
                    tmp_state[i][j] = 0;
                }
            }
        }
        initial_state = tmp_state;
        // inital state now points to tmp state --> make a another independant copy
        tmp_state = initial_state.map(row => [...row]);
    }
    return cellula_automata_config;
}