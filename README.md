# Chione Engine

## Overview

**Description:**  
Chione Engine is a REST API that simulates snowfall using a combination of random walks and cellular automata. It produces both structured simulation data and rendered video outputs for visualization.

---

## Current Status
- The application is currently **offline**  
- It can be **redeployed on an AWS account** using the provided infrastructure configuration  


---

## Features

### REST API
- Implements GET, POST, PUT, DELETE methods  
- Uses `application/json` for requests and responses  
- Returns appropriate HTTP status codes  
- Structured and logically named endpoints  

### User Authentication
- Unique username and password login  
- Authentication via JWT and cookies  
- Restricted access to premium features  
- User settings and data management  

### Data Handling
- JSON for simulation configuration and metadata  
- Video output generated using FFMPEG  

### Simulation Engine
- Combines:
  - Cellular automata (cloud dispersion)
  - Random walks (particle movement)  
- Tracks particle positions over time using coordinate arrays  

### Video Rendering
- Converts simulation output into video  
- Supports playback and time-step visualization  

### CPU Intensive Processing
- Simulation rendering and video generation are CPU-heavy  

### Infrastructure
- Docker containerization  
- AWS EC2 deployment  
- AWS ECR for image storage  
- CloudFormation for infrastructure setup  
- Docker Compose for orchestration  

### Web Client
- Minimal browser-based interface  
- Access to API endpoints  

---
### Infrastructure as Code
- `template.yml` (CloudFormation)  
- `docker-compose.yml`

## API Endpoints

### Simulation
- Generate snowfall simulation data  
- Render simulation as video  
- Save rendered video  

### Users
- Register  
- Login  
- Update user settings  

---
# Project Structure

## Source Code

### Backend
- controllers/
- middleware/
- models/
- routes/
- utils/

### Frontend
- public/
  - *.html

---

## Configuration & Infrastructure

- Dockerfile
- docker-compose.yml
- template.yml
- db.js

--- 
## Future Improvements

- Deploy a persistent hosted version with a public endpoint  
- Add external API integrations (e.g., weather data for realistic simulations)  
- Improve scalability for high CPU workloads (e.g., queue-based processing)  
- Enhance frontend UI/UX  
- Add authentication enhancements (e.g., OAuth, role-based access)  
- Implement more extensive REST features (filtering, pagination, versioning)  
- Optimize simulation performance and rendering speed  
