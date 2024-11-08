const db = require('../db');

// Obtenir toutes les réservations
exports.getAllReservations = (req, res) => {
    const sql = 'SELECT * FROM reservation';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Vous pouvez également vérifier si les résultats sont vides et renvoyer un tableau vide si nécessaire
        res.json(results || []); // Si les résultats sont vides, renvoyer un tableau vide
    });
};


// Obtenir une réservation par ID
exports.getReservationById = (req, res) => {
  const sql = 'SELECT * FROM reservation WHERE id_reservation = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    res.json(result[0]);
  });
};

// Créer une nouvelle réservation
exports.createReservation = (req, res) => {
  const { statut_reservation, datereservation, heurereservation, id_client, id_voyage, id_paiement } = req.body;
  const sql = 'INSERT INTO reservation (statut_reservation, datereservation, heurereservation, id_client, id_voyage, id_paiement) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [statut_reservation, datereservation, heurereservation, id_client, id_voyage, id_paiement], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Réservation créée avec succès', id_reservation: result.insertId });
  });
};

// Mettre à jour une réservation
exports.updateReservation = (req, res) => {
  const { statut_reservation, datereservation, heurereservation, id_client, id_voyage, id_paiement } = req.body;
  const sql = 'UPDATE reservation SET statut_reservation = ?, datereservation = ?, heurereservation = ?, id_client = ?, id_voyage = ?, id_paiement = ? WHERE id_reservation = ?';
  db.query(sql, [statut_reservation, datereservation, heurereservation, id_client, id_voyage, id_paiement, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Réservation mise à jour avec succès' });
  });
};

// Annuler une réservation
exports.cancelReservation = (req, res) => {
  const sql = 'UPDATE reservation SET statut_reservation = "annulé" WHERE id_reservation = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Réservation annulée avec succès' });
  });
};

// Confirmer une réservation
exports.confirmReservation = (req, res) => {
  const sql = 'UPDATE reservation SET statut_reservation = "confirmée" WHERE id_reservation = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Réservation confirmée avec succès' });
  });
};
