const db = require('../db');

// Créer une nouvelle réservation
exports.createReservation = (req, res) => {
  const { statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive, numero_place, cote } = req.body;

  // Insertion de la réservation
  const sql = 'INSERT INTO reservation (statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [statut_reservation, id_client, id_voyage, id_paiement, heure_depart, heure_arrive], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // Assigner une place au client dans la table reservation_place
    const reservationId = result.insertId;
    const placeSql = 'INSERT INTO reservation_place (id_reservation, id_client, id_voyage, numero_place, cote) VALUES (?, ?, ?, ?, ?)';
    db.query(placeSql, [reservationId, id_client, id_voyage, numero_place, cote], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Mise à jour du nombre de places dans le voyage
      let updateSql;
      if (statut_reservation === 'confirmee' || statut_reservation === 'en attente') {
        updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places - 1 WHERE id_voyage = ?';
      } else if (statut_reservation === 'annulee') {
        updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places + 1 WHERE id_voyage = ?';
      }

      if (updateSql) {
        db.query(updateSql, [id_voyage], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.status(201).json({ message: 'Réservation et place créées avec succès', id_reservation: result.insertId });
        });
      } else {
        res.status(201).json({ message: 'Réservation et place créées avec succès', id_reservation: result.insertId });
      }
    });
  });
};


// Supprimer une réservation
exports.deleteReservation = (req, res) => {
  // Obtenir la réservation et ses détails de place
  const getReservationSql = 'SELECT id_voyage, statut_reservation FROM reservation WHERE id_reservation = ?';
  db.query(getReservationSql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Réservation non trouvée' });

    const { id_voyage, statut_reservation } = result[0];

    // Supprimer les entrées de place réservée dans reservation_place
    const deletePlaceSql = 'DELETE FROM reservation_place WHERE id_reservation = ?';
    db.query(deletePlaceSql, [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Suppression de la réservation
      const deleteSql = 'DELETE FROM reservation WHERE id_reservation = ?';
      db.query(deleteSql, [req.params.id], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });

        // Mise à jour du nombre de places dans le voyage après la suppression
        let updateSql;
        if (statut_reservation === 'confirmee' || statut_reservation === 'en attente') {
          updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places + 1 WHERE id_voyage = ?';
        } else if (statut_reservation === 'annulee') {
          updateSql = 'UPDATE voyage SET nombre_de_places = nombre_de_places - 1 WHERE id_voyage = ?';
        }

        if (updateSql) {
          db.query(updateSql, [id_voyage], (err4) => {
            if (err4) return res.status(500).json({ error: err4.message });
            res.json({ message: 'Réservation supprimée avec succès' });
          });
        } else {
          res.json({ message: 'Réservation supprimée avec succès' });
        }
      });
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

  let sql = 'SELECT reservation.*, client.nom_client FROM reservation JOIN client ON reservation.id_client = client.id_client';

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
exports.getReservationsByClientId = (req, res) => {
  const sql = `
  SELECT
    c.nom_client AS nom_utilisateur,
    CONCAT(t.ville_depart, ' - ', t.ville_arrivee) AS trajet,
    cl.prix_classe AS prix_reservation,
    r.heure_depart,
    r.heure_arrive,
    r.statut AS statut_reservation
  FROM
    reservation r
  JOIN
    client c ON r.id_client = c.id_client
  JOIN
    voyage v ON r.id_voyage = v.id_voyage
  JOIN
    trajet t ON v.id_trajet = t.id_trajet
  JOIN
    classe cl ON v.id_classe = cl.id_classe
  WHERE
    r.id_client = ?;
  `;
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucune réservation trouvée pour cet utilisateur.' });
    }
    res.json(result);  // Retourner toutes les réservations
  });
};

// Récupérer les réservations d'un utilisateur par ID et statut

// Dans le controller
exports.getReservationsByClientIdAndStatus = (req, res) => {
  const { id, status } = req.params;
  const sql = `
    SELECT
      c.nom_client AS nom_utilisateur,
      CONCAT(t.ville_depart, ' - ', t.ville_arrivee) AS trajet,
      cl.prix_classe AS prix_reservation,
      r.heure_depart,
      r.heure_arrive,
      r.statut AS statut_reservation
    FROM
      reservation r
    JOIN
      client c ON r.id_client = c.id_client
    JOIN
      voyage v ON r.id_voyage = v.id_voyage
    JOIN
      trajet t ON v.id_trajet = t.id_trajet
    JOIN
      classe cl ON v.id_classe = cl.id_classe
    WHERE
      r.id_client = ? AND r.statut = ?;
  `;
  
  db.query(sql, [id, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucune réservation trouvée pour cet utilisateur avec ce statut.' });
    }
    res.json(result);
  });
};
