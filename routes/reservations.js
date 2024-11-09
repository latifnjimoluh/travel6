const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

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

// Route pour supprimer une réservation
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
