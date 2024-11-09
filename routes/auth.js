const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import du contrôleur

// Middleware pour analyser le corps des requêtes JSON
router.use(express.json());

// Route pour l'inscription d'un client
router.post('/registerClient', authController.registerClient);

// Route pour la connexion d'un client
router.post('/loginClient', authController.loginClient);

// Route pour l'inscription d'un employé
router.post('/registerEmployee', authController.registerEmployee);

// Route pour la connexion d'un employé
router.post('/loginEmployee', authController.loginEmployee);

module.exports = router;
