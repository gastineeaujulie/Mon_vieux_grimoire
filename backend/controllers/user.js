const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signUpUser = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10); // hash le mdp avec bcrypt (10 tours de salage)

    const user = new User({
      email: req.body.email,
      password: hash,
    }); // creation nouvel utilisateur en base MongoDB

    await user.save();
    res.status(201).json({ message: 'Utilisateur créé !' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email déjà utilisé !' }); // code erreur MongoDB 11000 = doublon
    }
    return res
      .status(500)
      .json({ message: 'Erreur lors de la création du compte' });
  }
};

exports.logInUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }); // chercher le user par son mail

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Paire identifiant/mot de passe incorrecte !' });
    }

    const valid = await bcrypt.compare(req.body.password, user.password); // comparer le mdp fourni avec le hash stocké

    if (!valid) {
      return res
        .status(401)
        .json({ message: 'Identifiant ou mot de passe incorrecte !' });
    }

    res.status(200).json({
      userId: user._id,
      token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      }),
    }); //genere un token JWT valable 24h et le retourne avec userID
  } catch (error) {
    res.status(500).json({ error });
  }
};
