const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


app.use(bodyParser.json());

let messages = [];

app.use(express.static('public'));

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.post('/send', (req, res) => {
  const message = req.body.message;
  const sender = req.body.sender;
  if (message && sender) {
    messages.push({ sender, message });
    res.status(200).send({ status: 'Message received' });
  } else {
    res.status(400).send({ error: 'Message or sender missing' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});