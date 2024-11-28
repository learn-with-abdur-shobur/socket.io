import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
	transports: ['websocket'], // Use WebSocket as primary transport
});

function App() {
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Connected to server:', socket.id);
		});

		socket.on('chat message', (msg) => {
			setMessages((prevMessages) => [...prevMessages, msg]);
		});

		socket.on('disconnect', (reason) => {
			console.warn('Disconnected:', reason);
		});

		socket.on('reconnect', (attempt) => {
			console.log(`Reconnected after ${attempt} attempts.`);
			// Re-subscribe to events or reinitialize any state
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const sendMessage = (e) => {
		e.preventDefault();
		if (message.trim()) {
			socket.emit('chat message', message);
			setMessage('');
		}
	};

	return (
		<div>
			<h1>React Chat</h1>
			<ul>
				{messages.map((msg, idx) => (
					<li key={idx}>{msg}</li>
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
		</div>
	);
}

export default App;
