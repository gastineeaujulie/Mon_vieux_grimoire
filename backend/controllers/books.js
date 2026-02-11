const Book = require('../models/Book');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // transforme objet string en Object javascript exploitable
  delete bookObject._id; // car id généré par la base de données
  delete bookObject._userId; // ne pas utiliser celui du client mais utilisé celui du token
  const book = new Book({
    ...bookObject, // spread operator qui prend toutes les propriétés contenues dans bookObject et les copie ici
    userId: req.auth.userId, //extrait de l'objet req grâce au middleware auth
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // génère url de l'image avec protocole (http), nom d'hôte (localhost:3000), nom de fichier donné par multer
  });
  book
    .save() //enregistre un livre
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const ratingObject = req.body.ratings;
  delete ratingObject._id;
  delete ratingObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { $push: { ratings: ratingObject } }
        )
          .then(() => res.status(201).json({ message: 'Note ajoutée !' }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id }) //permet de modifier un objet avec verification de l'utilisateur
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(201).json({ message: 'Objet modifié !' }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(201).json({ message: 'Objet supprimé !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.topRatingBook = (req, res, next) => {};

exports.getAllBook = (req, res, next) => {
  Book.find() //retourne tous les livres
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) //retourne un seul livre basé sur son id
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};
