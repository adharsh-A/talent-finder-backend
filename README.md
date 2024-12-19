# Talent Finder Backend
========================

## Overview

Talent Finder Backend is a RESTful API built using Node.js, Express, and Sequelize. It provides a platform for clients to post job openings and for talents to apply for these jobs.

## Features

* User authentication and authorization
* Job posting and management
* Job application and management
* User profile management
* Search functionality for jobs and users

## Dependencies

* Node.js
* Express
* Sequelize
* PostgreSQL
* Socket.IO

## Installation

1. Clone the repository: `git clone https://github.com/adharsh-A/talent-finder-backend.git`
2. Install dependencies: `npm install`
3. Create a PostgreSQL database and update the `config/database.js` file with your database credentials
4. Run the server: `npm start`

## API Endpoints

### Authentication

* `POST /api/auth/register`: Register a new user
* `POST /api/auth/login`: Login an existing user

### Jobs

* `POST /api/jobs`: Create a new job posting
* `GET /api/jobs`: Get all job postings
* `GET /api/jobs/:id`: Get a specific job posting
* `PUT /api/jobs/:id`: Update a job posting
* `DELETE /api/jobs/:id`: Delete a job posting

### Job Applications

* `POST /api/applications`: Create a new job application
* `GET /api/applications`: Get all job applications
* `GET /api/applications/:id`: Get a specific job application
* `PUT /api/applications/:id`: Update a job application
* `DELETE /api/applications/:id`: Delete a job application

### User Profile

* `GET /api/users/:id`: Get a user's profile
* `PUT /api/users/:id`: Update a user's profile

### Search

* `GET /api/search/jobs`: Search for jobs
* `GET /api/search/users`: Search for users

## Socket.IO Events

* `connection`: Establish a connection with the server
* `disconnect`: Disconnect from the server
* `join_room`: Join a room
* `leave_room`: Leave a room
* `private_message`: Send a private message
* `receive_message`: Receive a private message

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

This project is licensed under the MIT License.