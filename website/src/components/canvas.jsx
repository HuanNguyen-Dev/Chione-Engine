import { animate } from 'plotly.js';
import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';

function get_particles_at_step(time_step, current_step, array, num_particles) {
  const particles = new Array(num_particles);
  for (let i = 0; i < num_particles; i++) {
    particles[i] = array[i * time_step + current_step]
  }
  return particles;
}

function is_valid(data) {
  return !data.length === 0 && !isNaN(data) && data
}
export default function Visualise_random_walks({ data }) {
  const [current_step, set_current_step] = useState(0);
  const { x, y, z, steps, region_height, x_axis, y_axis } = data;
  const flat_x = useMemo(() => x.flat(), [x]);
  const flat_y = useMemo(() => y.flat(), [x]);
  const flat_z = useMemo(() => z.flat(), [x]);

  const num_particles = x.length;
  // retreive particles at current step
  const x_pos = get_particles_at_step(steps, current_step, flat_x, num_particles);
  const y_pos = get_particles_at_step(steps, current_step, flat_y, num_particles);
  const z_pos = get_particles_at_step(steps, current_step, flat_z, num_particles);

  useEffect(() => {
    let animation_frame;
    const update = () => {
      // avoid out of bounds with %
      set_current_step((prev) => (prev + 1) % steps)

      animation_frame = requestAnimationFrame(update);
    };
    animation_frame = requestAnimationFrame(update);
    // 
    return () => cancelAnimationFrame(animation_frame);
  }, [])

  return (
    <div>
      <h4>Random Walks</h4>
      <div>
        {is_valid(data) ? <Plot
          data={[{
            x: x_pos,
            y: y_pos,
            z: z_pos,
            type: 'scatter3d',
            mode: 'markers',

          }]}
          layout={{
            width: 700,
            height: 700,
            scene: {
              xaxis: { range: [-x_axis, x_axis] },
              yaxis: { range: [-y_axis, y_axis] },
              zaxis: { range: [-1, region_height + 5] },
            }
          }}
          config={{ displayModeBar: false }} /> : <h3>Please put something in</h3>}
        
      </div>
    </div >
  );
}
