const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for HTTP requests
app.use(cors());

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:8080', // React app origin
		methods: ['GET', 'POST'], // Allowed HTTP methods
		credentials: true, // Include cookies, if needed
	},
});

io.on('connection', (socket) => {
	console.log('A user connected:', socket.id);

	socket.on('chat message', (msg) => {
		console.log(`Message from ${socket.id}: ${msg}`);
		io.emit('chat message', msg);
	});

	socket.on('disconnect', () => {
		console.log('A user disconnected:', socket.id);
	});
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
