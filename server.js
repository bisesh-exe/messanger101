const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve data.json file
app.get('/messages', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');
    let data = [];

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    res.json(data);
});

// Handle the form submission and notify all clients
app.post('/send-message', (req, res) => {
    const message = req.body.message;
    const senderId = req.body.senderId;

    const filePath = path.join(__dirname, 'data.json');
    let data = [];

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    data.push({ message, senderId });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Notify all connected clients of the new message
    io.emit('new-message', { message, senderId });

    res.status(200).send('Message saved successfully!');
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
