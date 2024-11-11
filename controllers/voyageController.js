const db = require('../db');

// Obtenir tous les voyages avec options de tri
exports.getAllVoyages = (req, res) => {
  let { sort_by, order, from, to, date_depart } = req.query;

  sort_by = sort_by || 'heure_depart';  // Par défaut, trier par heure de départ
  order = order || 'ASC';  // Par défaut, ordre croissant

  // Construction de la requête SQL de base avec jointures
  let sql = `
    SELECT voyage.*, trajet.*, vehicule.*, classe.nom_classe, classe.prix_classe AS prix_classe, trajet.ville_depart, trajet.ville_arrivee
    FROM voyage 
    JOIN trajet ON voyage.id_trajet = trajet.id_trajet
    JOIN vehicule ON voyage.id_vehicule = vehicule.id_vehicule
    JOIN classe ON voyage.id_classe = classe.id_classe
  `;

  // Filtrage dynamique
  const conditions = [];
  if (from) {
    conditions.push(`trajet.ville_depart = '${from}'`);
  }
  if (to) {
    conditions.push(`trajet.ville_arrivee = '${to}'`);
  }
  if (date_depart) {
    conditions.push(`DATE(voyage.heure_depart) = '${date_depart}'`);
  }

  // Si des conditions de filtre sont présentes, ajouter à la requête
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Ajout du critère de tri selon la colonne spécifiée
  if (sort_by === 'classe') {
    sql += ' ORDER BY id_classe ' + order;
  } else if (sort_by === 'proche') {
    sql += ' ORDER BY heure_depart ' + order;
  } else {
    sql += ' ORDER BY ' + sort_by + ' ' + order;
  }

  // Exécution de la requête SQL
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });  // En cas d'erreur SQL
    res.json(results);  // Retourner les résultats
  });
};

// Créer un nouveau voyage
exports.createVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut } = req.body;

  // Obtenir le nombre de places du véhicule sélectionné
  const getVehicleSeatsSql = 'SELECT nombreplaces FROM vehicule WHERE id_vehicule = ?';
  db.query(getVehicleSeatsSql, [id_vehicule], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la requête pour obtenir le nombre de places
    if (result.length === 0) return res.status(404).json({ message: 'Véhicule non trouvé' });  // Si aucun véhicule n'est trouvé

    const nombre_de_places = result[0].nombreplaces;

    // Insertion du voyage
    const sql = `
      INSERT INTO voyage (heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut, nombre_de_places) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut || 'actif', nombre_de_places], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });  // Erreur lors de l'insertion du voyage
      res.status(201).json({ message: 'Voyage créé avec succès', id_voyage: result.insertId });  // Succès
    });
  });
};

// Obtenir un voyage par ID
exports.getVoyageById = (req, res) => {
  const sql = 'SELECT * FROM voyage WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la requête pour obtenir le voyage par ID
    if (result.length === 0) return res.status(404).json({ message: 'Voyage non trouvé' });  // Si aucun voyage n'est trouvé
    res.json(result[0]);  // Retourner le voyage trouvé
  });
};

// Mettre à jour un voyage
exports.updateVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut } = req.body;
  
  // Vérifier si id_vehicule a changé pour ajuster les places disponibles
  if (id_vehicule) {
    const checkVehicleSeats = 'SELECT nombreplaces FROM vehicule WHERE id_vehicule = ?';
    db.query(checkVehicleSeats, [id_vehicule], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la requête pour vérifier les places du véhicule
      if (result.length === 0) return res.status(404).json({ message: 'Véhicule non trouvé' });  // Si le véhicule n'est pas trouvé

      const nombre_de_places = result[0].nombreplaces;
      executeUpdate(nombre_de_places);  // Exécuter la mise à jour du voyage avec les nouvelles places
    });
  } else {
    executeUpdate();  // Si id_vehicule n'a pas changé, mettre à jour sans ajuster les places
  }

  // Fonction pour exécuter la mise à jour du voyage
  function executeUpdate(nombre_de_places) {
    const updateSql = `
      UPDATE voyage 
      SET heure_depart = ?, heure_arrive = ?, id_client = ?, id_vehicule = ?, id_chauffeur = ?, id_classe = ?, id_trajet = ?, statut = ?, nombre_de_places = COALESCE(?, nombre_de_places) 
      WHERE id_voyage = ?
    `;
    db.query(updateSql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut || 'actif', nombre_de_places, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la mise à jour
      res.json({ message: 'Voyage mis à jour avec succès' });  // Succès
    });
  }
};

// Annuler un voyage
exports.cancelVoyage = (req, res) => {
  const sql = 'UPDATE voyage SET statut = "annule" WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de l'annulation
    res.json({ message: 'Voyage annulé avec succès' });  // Succès
  });
};

// Supprimer un voyage
exports.deleteVoyage = (req, res) => {
  const sql = 'DELETE FROM voyage WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la suppression
    res.json({ message: 'Voyage supprimé avec succès' });  // Succès
  });
};

// Mise à jour du statut d'un voyage
exports.updateStatutVoyage = (req, res) => {
  const { statut } = req.body;
  const sql = 'UPDATE voyage SET statut = ? WHERE id_voyage = ?';
  db.query(sql, [statut, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la mise à jour du statut
    res.json({ message: 'Statut du voyage mis à jour avec succès' });  // Succès
  });
};

// Récupérer le nombre total de places d'un voyage
exports.getTotalPlaces = (req, res) => {
  const { id_voyage } = req.params;

  const sql = 'SELECT nombre_de_places FROM voyage WHERE id_voyage = ?';
  db.query(sql, [id_voyage], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }
    res.json({ nombre_de_places: result[0].nombre_de_places });
  });
};

// Récupérer le nombre de places réservées pour un voyage
exports.getBookedPlaces = (req, res) => {
  const { id_voyage } = req.params;

  const sql = `
    SELECT reservation_place.numero_place, reservation_place.cote
    FROM reservation_place
    JOIN reservation ON reservation_place.id_reservation = reservation.id_reservation
    WHERE reservation.id_voyage = ?
  `;

  db.query(sql, [id_voyage], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);  // Renvoie un tableau des places réservées
  });
};


// Récupérer le nombre de places disponibles pour un voyage
exports.getAvailablePlaces = (req, res) => {
  const { id_voyage } = req.params;

  const sql = `
    SELECT reservation_place.numero_place, reservation_place.cote,
           CASE 
             WHEN reservation_place.id_voyage IS NULL THEN 'available' 
             ELSE 'booked' 
           END AS place_status
    FROM reservation_place
    LEFT JOIN voyage ON reservation_place.id_voyage = voyage.id_voyage
    WHERE reservation_place.id_voyage = ?
  `;

  db.query(sql, [id_voyage], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);  // Maintenant renvoie un tableau d'objets avec le statut de chaque place
  });
};



exports.getPlacesWithLocation = (req, res) => {
  const { id_voyage } = req.params;

  // SQL pour obtenir les places et les informations associées
  const sql = `
    SELECT 
      place.position AS numero_place,  
      place.cote,
      ligne_siege.numero_ligne,
      ligne_siege.nombre_sieges_gauche,
      ligne_siege.nombre_sieges_droite,
      CASE 
          WHEN reservation_place.numero_place IS NOT NULL THEN 'booked' 
          ELSE 'available' 
      END AS place_status,
      trajet.ville_depart, 
      trajet.ville_arrivee,
      vehicule.nombreplaces  -- Nombre total de places dans le véhicule
    FROM place
    LEFT JOIN ligne_siege ON place.id_ligne = ligne_siege.id_ligne
    LEFT JOIN reservation_place ON place.id_place = reservation_place.numero_place AND reservation_place.id_voyage = ?
    JOIN voyage ON reservation_place.id_voyage = voyage.id_voyage
    JOIN trajet ON voyage.id_trajet = trajet.id_trajet
    JOIN vehicule ON ligne_siege.id_vehicule = vehicule.id_vehicule
    WHERE voyage.id_voyage = ?
  `;

  db.query(sql, [id_voyage, id_voyage], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // Calcul du nombre total de places et des réservations
    const totalSeats = result[0]?.nombreplaces || 0;  // Utilise nombreplaces du véhicule comme nombre total de places
    const bookedSeats = result.filter(seat => seat.place_status === 'booked').length;
    const availableSeats = totalSeats - bookedSeats;  // Nombre de places disponibles

    // Envoi des résultats sous forme de réponse
    res.json({
      totalSeats,
      bookedSeats,
      availableSeats,
      seats: result
    });
  });
};
