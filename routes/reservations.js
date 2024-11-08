const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController'); // Import du contrôleur

// Middleware pour analyser les requêtes JSON
router.use(express.json());

// Route pour obtenir toutes les réservations
router.get('/', reservationController.getAllReservations);

// Route pour obtenir une réservation par ID
router.get('/:id', reservationController.getReservationById);

// Route pour créer une nouvelle réservation
router.post('/', reservationController.createReservation);

// Route pour mettre à jour une réservation
router.put('/:id', reservationController.updateReservation);

// Route pour annuler une réservation
router.put('/:id/cancel', reservationController.cancelReservation);

// Route pour confirmer une réservation
router.put('/:id/confirm', reservationController.confirmReservation);

module.exports = router;
