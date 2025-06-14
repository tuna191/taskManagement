# Employee Task Management System

This is a web-based task management system for managing employees, assigning tasks, and allowing employees to mark their tasks as complete. The system includes real-time messaging between Owner and Employee roles using Socket.IO and Firebase.

## Why Nodemailer instead of Twilio?

Originally, the system was designed to send verification codes and setup links via SMS using Twilio. However, since:

- SMS services are blocked or unreliable in some countries
- Twilio Gmail account registration can fail

We replaced it with **Nodemailer**, which sends setup links and login verification codes via **email** using Gmail.

## Features

- Owner can:
  - Login by email and verify with otp
  - Add and manage employees
  - Assign tasks (title, date, time, description)
  - View all assigned tasks and employee statuses
- Employee can:
  - Receive email invitation to set up an account
  - Log in and view assigned tasks
  - Mark tasks as completed
- Real-time messaging with online presence tracking
- Firebase Firestore used for all data storage
- Nodemailer used for sending verification/setup emails

## Technology Stack

- Frontend: Next.js, TailwindCSS, ShadCN UI
- Backend: Express.js, Firebase Firestore
- Auth: Custom email-based login with access code (Owner) and password-based login (Employee)
- Messaging: Socket.IO
- Email: Nodemailer
## Project Structure
	•	backend/my-app-backend/: Contains the backend source code using Node.js/Express, Firebase, Socket.IO, and Nodemailer.
	•	frontend/my-app/: Contains the frontend user interface built with Next.js, TailwindCSS, and Zustand.
	•	.env: Environment variable file. It should be listed in .gitignore if it contains sensitive information.
	•	README.md: Documentation with setup instructions, how to run the project, and deployment notes.

## Getting Started

## Install dependencies
## Frontend
cd frontend/my-app
npm install
npm run dev
## Backend
cd ../backend/my-app-backend
npm install
npm run dev