// Importer les modules nécessaires
require('dotenv').config(); // Charger les variables d'environnement depuis .env
const jwt = require('jsonwebtoken'); // Importer la librairie JWT
const secret = process.env.SECRET_KEY; // Récupérer la clé secrète depuis le fichier .env
const revokedTokens = new Set(); // Une liste en mémoire pour stocker les tokens révoqués temporairement


// Fonction pour créer un token JWT
function createToken(tos) {
    const payload = { login: tos.login, password: tos.password, role: tos.role }; // Création du payload du token
    const options = { expiresIn: '1h' }; // Le token expirera dans 1 heure
    return jwt.sign(payload, secret, options); // Création du token
}

// Fonction middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader != 'undefined' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        
        // Vérifier si le token est dans la liste des tokens révoqués
        if (revokedTokens.has(token)) {
            return res.status(401).json({ message: 'Token révoqué. Veuillez vous reconnecter.' });
        }
        
        try {
            const decodedToken = jwt.verify(token, secret);
            req.user = decodedToken;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Token invalide' });
        }
    } else {
        res.status(401).json({ message: 'Token manquant ou malformé' });
    }
}


// Middleware pour vérifier les rôles des utilisateurs
function checkRole(role) {
    return function(req, res, next) {
        if (req.user && req.user.role === role) {
            next(); // L'utilisateur a le bon rôle, on continue
        } else {
            res.status(403).json({ message: 'Accès refusé' }); // L'utilisateur n'a pas le bon rôle
        }
    }
}

// Middleware pour limiter le nombre de requêtes (Rate Limiting)
// const ratelimit = require("express-rate-limit");
// const limiter = ratelimit({
//     windowMs: 60 * 60 * 1000, // 1 heure en millisecondes
//     max: 30, // Limite de 30 requêtes par heure
//     message: "Trop de requêtes effectuées, veuillez réessayer plus tard."
// });

// Exports pour utiliser ces fonctions dans d'autres fichiers
module.exports = {
    createToken,
    verifyToken,
    checkRole,
    // limiter
};
