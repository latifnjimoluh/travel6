const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController'); // Import du contrôleur

// Middleware pour analyser les requêtes JSON
router.use(express.json());

// Route pour obtenir tous les paiements
router.get('/', paiementController.getAllPaiements);

// Route pour obtenir un paiement par ID
router.get('/:id', paiementController.getPaiementById);

// Route pour créer un nouveau paiement
router.post('/', paiementController.createPaiement);

// Route pour mettre à jour un paiement
router.put('/:id', paiementController.updatePaiement);

// Route pour annuler un paiement
router.put('/:id/cancel', paiementController.cancelPaiement);

// Route pour confirmer un paiement
router.put('/:id/confirm', paiementController.confirmPaiement);

module.exports = router;
