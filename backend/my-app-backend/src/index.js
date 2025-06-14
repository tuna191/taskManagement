import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ownerRoutes from './routes/ownerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import messageRoutes from './routes/messagesRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import chatSocket from './sockets/chatSocket.js';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
chatSocket(io);
app.use(cors({
  origin: `${process.env.NEXT_PUBLIC_URL_FE}`, // Replace with your client URL
  credentials: true,                
}));
app.use(express.json());
app.use('/api/owner', ownerRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tasks', taskRoutes);



const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));