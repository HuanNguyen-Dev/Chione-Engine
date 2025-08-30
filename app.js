// aws sso login
// aws ssm start-session --target=$INSTANCE
// sudo -iu ubuntu

// git clone in ec2 once only
// ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
// cat ~/.ssh/id_rsa.pub (copy everything)
// add ssh key to your git --> settings, ssh and gpg keys --> add ssh


// netstat -aon | findstr :3306
// Get-Process -Id 4796

// npm init -y
// npm install mariadb
// npm install expressdo
// npm install plotly.js
// npm install canvas gl three
// npm install cookie-parser
// win + r, services.msc, mysql92 stop to get port 3306 free

// // scp -r -i "C:\Users\hnguy\.ssh\CAB432-N11596708-Huan-Nguyen.pem" ubuntu@ec2-16-176-20-87.ap-southeast-2.compute.amazonaws.com:/home/ubuntu/aws "C:\Users\hnguy\OneDrive - Queensland University of Technology\Desktop\uni\3rd year\cab432"


// start docker app up 
// aws sso login
// aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com
// push and pull to ecr
// docker built -t simulation .
// docker tag task-api:latest 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/n11596708-assignment-1:prac_3_base
// docker push 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/n11596708-assignment-1:prac_3_base

// starting up the stack (dir relative to terminal)
// aws cloudformation create-stack --stack-name n11596708-simulation-assignment1 --template-body file://template.yml --tags Key=qut-username,Value=n11596708@qut.edu.au Key=purpose,Value=assignment1  
// aws cloudformation create-stack \
  // --stack-name n11596708-simulation-assignment1 \
  // --template-body file://template.yml \
  // --parameters ParameterKey=EcrImageUri,ParameterValue=901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/n11596708-assignment-1:latest \
  // --tags Key=qut-username,Value=n11596708@qut.edu.au Key=purpose,Value=assignment1  \

const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
/** For Cross origin resource sharing with cookies:
 * const cors = require('cors');

app.use(cors({
  origin: 'http://your-frontend-domain.com', // or http://localhost:5500, etc.
  credentials: true                          // important for cookies
}));
 */
const tasksRouter = require('./src/routes/tasks');
const simulationRouter = require('./src/routes/simulation');
const userRouter = require('./src/routes/user');
const indexRouter = require('./src/routes/index');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());
app.use('/tasks', tasksRouter);
app.use('/simulation', simulationRouter);
app.use('/user', userRouter);
app.use('/', indexRouter)
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));