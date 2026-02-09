const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const booksRoutes = require('./routes/books');

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.error('Connexion à MongoDB échoué !', err));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/books', booksRoutes);

module.exports = app;
