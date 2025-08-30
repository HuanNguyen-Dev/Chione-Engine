
const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const simulationRouter = require('./src/routes/simulation');
const userRouter = require('./src/routes/user');
const indexRouter = require('./src/routes/index');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());
app.use('/simulation', simulationRouter);
app.use('/user', userRouter);
app.use('/', indexRouter)
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));