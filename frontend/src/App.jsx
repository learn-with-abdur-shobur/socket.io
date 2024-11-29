import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const socket = io('http://localhost:3000');

function App() {
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [user, setUser] = useState(null);
	console.log(messages);
	// Fetch messages from the database
	useEffect(() => {
		axios.get('http://localhost:3000/messages').then((response) => {
			setMessages(response.data);
		});

		socket.on('chat message', (msg) => {
			setMessages((prev) => [...prev, msg]);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	// Handle user login
	const handleLogin = async (username, password) => {
		try {
			const response = await axios.post('http://localhost:3000/login', {
				username,
				password,
			});
			const decoded = jwtDecode(response.data.token);
			setUser(decoded);
		} catch (err) {
			console.error('Login failed', err);
		}
	};
	// Handle user regg
	const handleReg = async (username, password) => {
		try {
			const response = await axios.post('http://localhost:3000/register', {
				username,
				password,
			});
			const decoded = jwtDecode(response.data.token);
			setUser(decoded);
		} catch (err) {
			console.error('Login failed', err);
		}
	};

	// Send message
	const sendMessage = (e) => {
		e.preventDefault();
		if (message.trim() && user) {
			socket.emit('chat message', {
				sender: user.username,
				receiver: 'admin',
				content: message,
			});
			setMessage('');
		}
	};

	return (
		<div>
			<LoginForm onLogin={handleReg} />

			<LoginForm onLogin={handleLogin} />

			<>
				<h1>Chat</h1>
				<ul>
					{Array.isArray(messages) &&
						messages?.map((msg, idx) => (
							<li key={idx}>
								<strong>{msg.sender}:</strong> {msg.content}
							</li>
						))}
				</ul>
				<form onSubmit={sendMessage}>
					<input
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type a message"
					/>
					<button type="submit">Send</button>
				</form>
			</>
		</div>
	);
}

function LoginForm({ onLogin }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		onLogin(username, password);
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
			/>
			<button type="submit">Login</button>
		</form>
	);
}

export default App;
