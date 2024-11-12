const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Middleware pour analyser les requêtes JSON
router.use(express.json());

// Route pour obtenir toutes les réservations
router.get('/', reservationController.getAllReservations);

// Route pour obtenir toutes les réservations d'un utilisateur par ID et statut
router.get('/client/:id', reservationController.getReservationsByClientId);
// Route pour récupérer les réservations filtrées par statut
router.get('/client/:id/status/:status', reservationController.getReservationsByClientIdAndStatus);

// Route pour créer une nouvelle réservation
router.post('/', reservationController.createReservation);

// Route pour mettre à jour une réservation
router.put('/:id', reservationController.updateReservation);

// Route pour supprimer une réservation
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
