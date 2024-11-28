const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:8080', // React frontend URL
		methods: ['GET', 'POST'],
	},
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/chat-app', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	role: { type: String, enum: ['admin', 'user'], default: 'user' },
});
const User = mongoose.model('User', UserSchema);

// Message Schema
const MessageSchema = new mongoose.Schema({
	sender: String,
	receiver: String,
	content: String,
	timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', MessageSchema);

// Routes for user registration and login
app.post('/register', async (req, res) => {
	const { username, password, role } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		const newUser = new User({ username, password: hashedPassword, role });
		await newUser.save();
		res.status(201).json({ message: 'User registered successfully' });
	} catch (err) {
		res.status(500).json({ error: 'Error registering user' });
	}
});

app.post('/login', async (req, res) => {
	const { username, password } = req.body;

	try {
		const user = await User.findOne({ username });
		console.log(user);
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY', {
			expiresIn: '1h',
		});
		console.log(token, 'token');
		res.json({ token });
	} catch (err) {
		res.status(500).json({ error: 'Error logging in' + err });
	}
});
app.get('/messages', async (req, res) => {
	try {
		const result = await Message.find();

		res.json(result);
	} catch (err) {
		res.status(500).json({ error: 'Error logging in' + err });
	}
});

// Real-time communication
io.on('connection', (socket) => {
	console.log(`User connected: ${socket.id}`);

	socket.on('chat message', async ({ sender, receiver, content }) => {
		const newMessage = new Message({ sender, receiver, content });
		await newMessage.save();
		io.emit('chat message', newMessage); // Broadcast the message
	});

	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

// Start the server
server.listen(3000, () => {
	console.log('Server running on http://localhost:3000');
});
