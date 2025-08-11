// aws sso login
// aws ssm start-session --target=$INSTANCE
// sudo -iu ubuntu


// npm init -y
// npm install mariadb
// npm install expressdo
// win + r, services.msc, mysql92 stop to get port 3306 free


// aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com
// push and pull to ecr
// docker tag task-api:latest 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/n11596708-assignment-1:prac_3_base
const express = require('express');
const app = express();

const tasksRouter = require('./src/routes/tasks');
const simulationRouter = require('.src/routes/simulation');

app.use(express.json());
app.use('/tasks', tasksRouter);
app.use('/simulation',simulationRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));