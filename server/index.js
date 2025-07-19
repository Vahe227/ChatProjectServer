import dotenv from 'dotenv';
import { Server } from "socket.io";
import http from 'http';
const httpServer = http.createServer();

dotenv.config();

const origin = process.env.ORIGIN;
const port = process.env.PORT || 5634;
const io = new Server(httpServer, {
    cors: {
        origin: origin,
        methods: ["GET","POST"]
    },
    pingInterval: 5000,
    pingTimeout: 10000
});

let connectedUsers = [];
let messagesClients = [];

io.on('connection', (socket) => {
    try {
        console.log(socket.id , 'Client connected server');
        socket.join('chatRoom');

        socket.emit('client-id', socket.id);
        connectedUsers.push(socket.id);

        io.emit('all-clients', connectedUsers);

        socket.emit('all-messages', messagesClients);

        socket.on('all-clients-messages', (messageText) => {
            const newMessage = {
                id: socket.id,
                text: messageText,
                date: new Date().toISOString()
            };
            messagesClients.push(newMessage);

            io.to('chatRoom').emit('all-messages', messagesClients);
        });
        
        console.log(connectedUsers);

        socket.on('disconnect', () => {
            console.log(socket.id, 'Leaving Room');
            connectedUsers = connectedUsers.filter(id => id !== socket.id);
            io.emit('all-clients', connectedUsers);
        });

    } catch (err) {
        console.error('Connection have an error: ', err);
    };
});

httpServer.listen(port, '0.0.0.0', () => {
    try {
        console.log(`Server Running at http://localhost:${port}`)
    } catch (err) {
        console.error('Server Have an Error');
    };
});

