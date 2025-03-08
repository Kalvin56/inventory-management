const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Extraire le token de l'en-tête Authorization
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extraire le token en enlevant le préfixe 'Bearer '
  const token = authHeader.split(' ')[1];

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};