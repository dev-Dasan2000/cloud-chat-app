require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 5001;
const TARGET_SERVER_URL = "http://localhost:5000";
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize messages file if it doesn't exist
async function initMessagesFile() {
  try {
    await fs.access(MESSAGES_FILE);
  } catch {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify([], null, 2));
  }
}

// Read messages from JSON file
async function readMessages() {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
}

// Write messages to JSON file
async function writeMessages(messages) {
  try {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error writing messages:', error);
  }
}

// POST endpoint to receive messages from a different server
app.post('/api/messages/receive', async (req, res) => {
  try {
    const { message, sender, timestamp } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const newMessage = {
      id: Date.now().toString(),
      message,
      sender: sender || 'external-server',
      timestamp: timestamp || new Date().toISOString(),
      source: 'external'
    };

    // Save to JSON
    const messages = await readMessages();
    messages.push(newMessage);
    await writeMessages(messages);

    // Broadcast to all connected clients via Socket.io
    io.emit('new_message', newMessage);

    res.status(200).json({ 
      success: true, 
      message: 'Message received and broadcasted',
      data: newMessage
    });
  } catch (error) {
    console.error('Error in /api/messages/receive:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint to receive message from frontend and send to different server
app.post('/api/messages/send', async (req, res) => {
  try {
    const { message, sender } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const newMessage = {
      id: Date.now().toString(),
      message,
      sender: sender || 'user',
      timestamp: new Date().toISOString(),
      source: 'frontend'
    };

    // Save to JSON
    const messages = await readMessages();
    messages.push(newMessage);
    await writeMessages(messages);

    // Broadcast to all connected clients via Socket.io
    io.emit('new_message', newMessage);

    // Forward to different server if targetServerUrl is provided or use default from env
    const serverUrl = "http://localhost:5000";
    if (serverUrl) {
      try {
        const fetch = require('node-fetch');
        const response = await fetch(`${serverUrl}/api/messages/receive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMessage)
        });
        
        if (!response.ok) {
          console.error('Failed to forward message to target server');
        }
      } catch (error) {
        console.error('Error forwarding message to target server:', error);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Message sent and saved',
      data: newMessage
    });
  } catch (error) {
    console.error('Error in /api/messages/send:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await readMessages();
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in /api/messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Send all existing messages to newly connected client
  readMessages().then(messages => {
    socket.emit('initial_messages', messages);
  });

  // Handle client sending message via socket
  socket.on('send_message', async (data) => {
    try {
      const newMessage = {
        id: Date.now().toString(),
        message: data.message,
        sender: data.sender || 'user',
        timestamp: new Date().toISOString(),
        source: 'frontend'
      };

      // Save to JSON
      const messages = await readMessages();
      messages.push(newMessage);
      await writeMessages(messages);

      // Broadcast to all clients
      io.emit('new_message', newMessage);
    } catch (error) {
      console.error('Error handling send-message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize and start server
initMessagesFile().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
