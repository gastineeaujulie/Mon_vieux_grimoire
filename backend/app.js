const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.error('Connexion à MongoDB échoué !', err));

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
