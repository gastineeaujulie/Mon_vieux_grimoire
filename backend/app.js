const dotenv = require('dotenv'); // variables environnement
dotenv.config();
const express = require('express'); //pour parser le JSON
const cors = require('cors'); //pour autoriser les requêtes cross-origin
const mongoose = require('mongoose');

const path = require('path'); // pour les images

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.error('Connexion à MongoDB échoué !', err));

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

module.exports = app;
