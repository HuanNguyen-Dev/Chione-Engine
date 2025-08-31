Assignment 1 - REST API Project - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:** Huan (Bon) Nguyen
- **Student number:** n11596708
- **Application name:** Chione Engine
- **Two line description:** This REST API provides a simulation of snowfall through random walks and cellula automata.


Core criteria
------------------------------------------------

### Containerise the app

- **ECR Repository name:**
    - 901444280953.dkr.ecr.ap-southeast-2.amazonaws.com/n11596708-assignment-1:latest
- **Video timestamp:**
    - 0-10s
- **Relevant files:**
    - Dockerfile

### Deploy the container

- **EC2 instance ID:**
    - i-08ffad08826e080bd
- **Video timestamp:**
    - 10 - 45s

### User login

- **One line description:**
    - User logs in with username (unique) and password, authentication of session via jwt and cookies, premium features require users to log in, users can change their data via settings
- **Video timestamp:**
    - 3:23 - 3:43 min
- **Relevant files:**
    - ./src/routes/simulation.js
    - ./src/routes/user.js
    - ./src/middleware/jwt.js
    - ./src/controllers/users.js
    - ./public/login.html
    - ./public/register.html
    - ./public/options.html
    - ./src/controllers/users.js

### REST API

- **One line description:**
    Implements get, post, put, delete methods, alongside headers using application.json, returns logical status codes and appropriately labelled endpoints
- **Video timestamp:**
    - 2:33 - 3:21 min
- **Relevant files:**
    - ./src/routes/simulation.js
    - ./src/routes/user.js
    - ./public/*
    - ./src/controllers/users
    - ./src/controllers/simualtion

### Data types

- **One line description:**
    Uses structured data (json) to handle the metadata of the simulation as well as ffmpeg for loading the videos of the simulation
- **Video timestamp:**
    - 2:02 - 2:33 min
- **Relevant files:**
    - ./src/models/simulation.js
    - ./public/cloud.html

#### First kind

- **One line description:**
    Form data in the form of a json object, containing the metadata/parameters of the simulation
- **Type:**
    - json
- **Rationale:**
    - Input parameters to determine the configurations of the simulation 
- **Video timestamp:**
    - 2:17 - 2:33 min
- **Relevant files:**
    - ./public/cloud.html
    - ./public/render_simulation.html

#### Second kind

- **One line description:**
    Video files generated from the simulation
- **Type:** 
    - FFMPEG
- **Rationale:**
    - Used to visualize the simualtion and allow for playback/scrolling/pause for the time steps.
- **Video timestamp:**
    - 2:02 - 2:17 min
- **Relevant files:**
  - ./src/models/simulation.js

### CPU intensive task

 **One line description:**
    Plots the simulation and displays it as a video (FFMPEG), it is a core functionality of the application
- **Video timestamp:** 
    - 2:44 - 2:49 min
- **Relevant files:**
    - ./src/models/simulation
    - ./public/cloud.html

### CPU load testing

 **One line description:**
    Successfully loads down the instance for 5 mintues with CPU usage > 80%
- **Video timestamp:** 
    - 2:44 - end mins
- **Relevant files:**
    - ./src/models/simulation
    - ./public/cloud.html

Additional criteria
------------------------------------------------

### Extensive REST API features

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 

### External API(s)

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 

### Additional types of data

- **One line description:** 
    Additional data is the 2d array, storing the system coordinate history of all particles for each cardinal direction (X,Y,Z in time major order) used for plotting and trajectory
- **Video timestamp:**
    - 1:46 - 2:02 min
- **Relevant files:**
    - ./src/models/simulation.js

### Custom processing

- **One line description:**
    Custom snowfall simulation consisting of cellular automata (to mimic cloud dispersion) and random walks (to mimic stochastic nature of particles)
- **Video timestamp:**
    0:47 - 1:46 min
- **Relevant files:**
    - ./src/models/simulation.js

### Infrastructure as code

- **One line description:**
    Successfully utilizes cloud formation to load up an instance alongside docker compose to start all the containers on start up
- **Video timestamp:**
    - 9 - 46 s
    - 3:44 - 3:57 min
- **Relevant files:**
    - template.yml
    - Dockerfile
    - docker-compose.yml

### Web client

- **One line description:**
    Implements a minimalistic website with access to all required endpoints and is accessible via the web broswer
- **Video timestamp:**
    - 3:57 - 4:45 min
- **Relevant files:**
    -   ./public/*
    - ./src/routes/*

### Upon request

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 