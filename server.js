const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
    'https://todolist-7ap4.onrender.com', 
    'http://localhost:5500' // (optional) for local testing
  ],
  credentials: true
}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/auth', require('./routes/auth'));
app.use('/tasks', require('./routes/tasks'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Servera kļūda' });
});

app.listen(3000, () => console.log('Serveris darbojas uz http://localhost:3000'));
