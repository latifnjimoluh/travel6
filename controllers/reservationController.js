const db = require('../db');

// Créer une nouvelle réservation
exports.createReservation = (req, res) => {
  const { statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive } = req.body;

  // Insertion de la réservation
  const sql = 'INSERT INTO reservation (statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // Mise à jour du nombre de places dans le voyage
    let updateSql;
    if (statut_reservation === 'confirmee' || statut_reservation === 'en attente') {
      updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places - 1 WHERE id_voyage = ?';
    } else if (statut_reservation === 'annulee') {
      updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places + 1 WHERE id_voyage = ?';
    }

    if (updateSql) {
      db.query(updateSql, [id_voyage], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: 'Réservation créée avec succès', id_reservation: result.insertId });
      });
    } else {
      res.status(201).json({ message: 'Réservation créée avec succès', id_reservation: result.insertId });
    }
  });
};

// Supprimer une réservation
exports.deleteReservation = (req, res) => {
  // Obtenir le voyage associé à la réservation pour mettre à jour le nombre de places
  const getReservationSql = 'SELECT id_voyage, statut_reservation FROM reservation WHERE id_reservation = ?';
  db.query(getReservationSql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Réservation non trouvée' });

    const { id_voyage, statut_reservation } = result[0];

    // Suppression de la réservation
    const deleteSql = 'DELETE FROM reservation WHERE id_reservation = ?';
    db.query(deleteSql, [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Mise à jour du nombre de places dans le voyage après la suppression
      let updateSql;
      if (statut_reservation === 'confirmee' || statut_reservation === 'en attente') {
        updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places + 1 WHERE id_voyage = ?';
      } else if (statut_reservation === 'annulee') {
        updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places - 1 WHERE id_voyage = ?';
      }

      if (updateSql) {
        db.query(updateSql, [id_voyage], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ message: 'Réservation supprimée avec succès' });
        });
      } else {
        res.json({ message: 'Réservation supprimée avec succès' });
      }
    });
  });
};

// Mettre à jour une réservation
exports.updateReservation = (req, res) => {
  const { statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive } = req.body;

  // Obtenir l'ancien statut de la réservation pour effectuer les mises à jour nécessaires
  const getReservationSql = 'SELECT statut_reservation FROM reservation WHERE id_reservation = ?';
  db.query(getReservationSql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Réservation non trouvée' });

    const oldStatut = result[0].statut_reservation;

    // Mettre à jour la réservation
    const updateSql = 'UPDATE reservation SET statut_reservation = ?, id_client = ?, id_voyage = ?, id_paiement = ?, heure_depart = ?, heure_arrive = ? WHERE id_reservation = ?';
    db.query(updateSql, [statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive, req.params.id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Mise à jour du nombre de places dans le voyage en fonction du statut
      let updateVoyageSql;
      if (statut_reservation === 'confirmee' || statut_reservation === 'en attente') {
        updateVoyageSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places - 1 WHERE id_voyage = ?';
      } else if (statut_reservation === 'annulee') {
        updateVoyageSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places + 1 WHERE id_voyage = ?';
      }

      // Si le statut a changé, ajuster le nombre de places en conséquence
      if (updateVoyageSql) {
        db.query(updateVoyageSql, [id_voyage], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          // Si l'ancien statut était "confirmé" ou "en attente", on doit ajouter des places
          if (oldStatut === 'confirmee' || oldStatut === 'en attente') {
            db.query('UPDATE voyage SET nombre_de_places = nombre_de_places + 1 WHERE id_voyage = ?', [id_voyage], (err4) => {
              if (err4) return res.status(500).json({ error: err4.message });
              res.json({ message: 'Réservation mise à jour avec succès' });
            });
          } else {
            res.json({ message: 'Réservation mise à jour avec succès' });
          }
        });
      } else {
        res.json({ message: 'Réservation mise à jour avec succès' });
      }
    });
  });
};

// Récupérer toutes les réservations avec tri et recherche
exports.getAllReservations = (req, res) => {
  const { sortBy, clientName, startDate, endDate } = req.query;

  let sql = 'SELECT reservation.*, client.nom FROM reservation JOIN client ON reservation.id_client = client.id_client';

  // Filtrer par nom du client
  if (clientName) {
    sql += ` WHERE client.nom LIKE ?`;
  }

  // Filtrer par date de réservation
  if (startDate && endDate) {
    sql += clientName ? ' AND ' : ' WHERE ';
    sql += 'reservation.date_reservation BETWEEN ? AND ?';
  }

  // Trier par date
  if (sortBy) {
    sql += ` ORDER BY reservation.date_reservation ${sortBy === 'desc' ? 'DESC' : 'ASC'}`;
  }

  db.query(sql, [clientName ? `%${clientName}%` : null, startDate, endDate], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Récupérer une réservation par ID
exports.getReservationById = (req, res) => {
  const sql = 'SELECT reservation.*, client.nom FROM reservation JOIN client ON reservation.id_client = client.id_client WHERE id_reservation = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    res.json(result[0]);
  });
};
