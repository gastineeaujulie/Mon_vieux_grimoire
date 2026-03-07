const jwt = require('jsonwebtoken'); // créer et vérifier les tokens d'authentification JWT côté serveur

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1]; // j'utilise split pour tout recupérer après l'espace dans le header
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // j'utilise verify pour decoder le token
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
