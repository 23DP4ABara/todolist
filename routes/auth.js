const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashed });
    res.status(201).json({ message: 'Reģistrācija veiksmīga' });
  } catch {
    res.status(400).json({ error: 'Lietotājvārds jau eksistē' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'Lietotājs nav atrasts' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Nepareiza parole' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// GET /user/:id
router.get('/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('username');
  if (!user) return res.status(404).json({ error: 'Lietotājs nav atrasts' });
  res.json({ username: user.username });
});

module.exports = router;
