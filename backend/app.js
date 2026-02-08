const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const booksRoutes = require('./routes/books');

dotenv.config();

const Books = require('./models/Books');

mongoose.connect(process.env.MONGODB_URI)
 .then(() => console.log('Connexion à MongoDB réussie !'))
 .catch(err => console.error('Connexion à MongoDB échoué !', err));

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/books', booksRoutes);

app.post('/api/books', (req, res, next) => {
    delete req.body._id;
    const book = new Books ({
        ...req.body
    });
    book.save() //enregistre un livre
    .then(() => res.status(201).json({message: 'Objet enregistre !'}))
    .catch(error => res.status(400).json({ error }));
    
});

app.get('api/books/:id', (req, res, next) => {
    Books.findOne({_id: req.params.id}) //retourne un seul livre basé sur son id
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({ error }));
})

app.get('/api/books', (req, res, next) => {
  books.find() //retourne tous les livres
  .then(books => res.status(200).json(books))
  .catch(error => res.status(400).json({ error }));
});




module.exports = app;