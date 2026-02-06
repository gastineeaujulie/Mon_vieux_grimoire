const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
 .then(() => console.log('Connexion à MongoDB réussie !'))
 .catch(err => console.error('Connexion à MongoDB échoué !', err));

const app = express();


app.use(cors());
app.use(express.json());


// app.use('/api/books', (req, res, next) => {
//    const books =  [
//     {

//     }]
// });

// app.use('/api/books/:id', (req, res, next) => {
//     res.status(201);
//     next();
// });

// app.use((req, res, next) => {
//     res.json({ message: 'ok !'});
//     next();
// });

// app.use((req, res) => {
//     console.log('Reponse ok !');
// })

module.exports = app;