const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const { verifyToken } = require('./authMiddleware');

// Middleware pour analyser le corps des requêtes JSON
router.use(express.json());

// Route pour l'inscription d'un client
router.post('/registerClient', authController.registerClient);

// Route pour la connexion d'un client
router.post('/loginClient', authController.loginClient);

router.post('/logoutClient', authController.logoutClient);

// Route pour l'inscription d'un employé
router.post('/registerEmployee', authController.registerEmployee);

// Route pour la connexion d'un employé
router.post('/loginEmployee', authController.loginEmployee);


// Route pour valider le token
router.get('/validateToken', verifyToken, (req, res) => {
    res.sendStatus(200); // Retourne un succès si le token est valide
  });
  

module.exports = router;
