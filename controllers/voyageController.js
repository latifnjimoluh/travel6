const db = require('../db');


// Rechercher des voyages par date et destination
exports.searchVoyages = (req, res) => {
  const { date, destination } = req.query;
  let sql = 'SELECT * FROM voyage JOIN trajet ON voyage.id_trajet = trajet.id_trajet WHERE 1=1';

  // Filtrer par date de départ (en utilisant le champ DATETIME)
  if (date) {
    sql += ' AND DATE(voyage.heure_depart) = ?';
  }

  // Filtrer par destination (ville_arrivee de la table trajet)
  if (destination) {
    sql += ' AND trajet.ville_arrivee LIKE ?';
  }

  // Exécution de la requête avec les paramètres
  db.query(sql, [date ? date : null, destination ? `%${destination}%` : null], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};



// Obtenir tous les voyages avec options de tri
exports.getAllVoyages = (req, res) => {
  let { sort_by, order } = req.query;

  // Si aucun tri n'est spécifié, on tri par date de départ par défaut
  sort_by = sort_by || 'heure_depart';
  order = order || 'ASC';  // Ordre par défaut : ASC (croissant)

  // Requête SQL de base
  let sql = 'SELECT * FROM voyage';
  
  // Ajouter le tri si demandé
  if (sort_by === 'classe') {
    sql += ' ORDER BY id_classe ' + order;
  } else if (sort_by === 'proche') {
    sql += ' ORDER BY heure_depart ' + order;
  } else {
    // Par défaut, tri par heure_depart si aucun autre tri n'est spécifié
    sql += ' ORDER BY ' + sort_by + ' ' + order;
  }

  // Exécution de la requête
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Créer un nouveau voyage
exports.createVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut } = req.body;

  // Obtenir le nombre de places du véhicule sélectionné
  const getVehicleSeatsSql = 'SELECT nombreplaces FROM vehicule WHERE id_vehicule = ?';
  db.query(getVehicleSeatsSql, [id_vehicule], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Véhicule non trouvé' });

    const nombre_de_places = result[0].nombreplaces;

    // Insertion du voyage
    const sql = `
      INSERT INTO voyage (heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut, nombre_de_places) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut || 'actif', nombre_de_places], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Voyage créé avec succès', id_voyage: result.insertId });
    });
  });
};


// Obtenir un voyage par ID
exports.getVoyageById = (req, res) => {
  const sql = 'SELECT * FROM voyage WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Voyage non trouvé' });
    res.json(result[0]);
  });
};

// Mettre à jour un voyage
exports.updateVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut } = req.body;
  
  // Optionnel : Vérifier si id_vehicule a changé pour ajuster les places disponibles
  const checkVehicleSeats = id_vehicule 
    ? 'SELECT nombreplaces FROM vehicule WHERE id_vehicule = ?'
    : null;
  
  if (checkVehicleSeats) {
    db.query(checkVehicleSeats, [id_vehicule], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ message: 'Véhicule non trouvé' });

      const nombre_de_places = result[0].nombreplaces;
      executeUpdate(nombre_de_places);
    });
  } else {
    executeUpdate();
  }

  // Fonction pour exécuter la mise à jour avec ou sans modification de places
  function executeUpdate(nombre_de_places) {
    const updateSql = `
      UPDATE voyage 
      SET heure_depart = ?, heure_arrive = ?, id_client = ?, id_vehicule = ?, id_chauffeur = ?, id_classe = ?, id_trajet = ?, statut = ?, nombre_de_places = COALESCE(?, nombre_de_places) 
      WHERE id_voyage = ?
    `;
    db.query(updateSql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut || 'actif', nombre_de_places, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Voyage mis à jour avec succès' });
    });
  }
};

// Annuler un voyage
exports.cancelVoyage = (req, res) => {
  const sql = 'UPDATE voyage SET statut = "annule" WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Voyage annulé avec succès' });
  });
};

// Supprimer un voyage
exports.deleteVoyage = (req, res) => {
  const sql = 'DELETE FROM voyage WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Voyage supprimé avec succès' });
  });
};

// Mise à jour du statut d'un voyage
exports.updateStatutVoyage = (req, res) => {
  const { statut } = req.body;
  const sql = 'UPDATE voyage SET statut = ? WHERE id_voyage = ?';
  db.query(sql, [statut, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Statut du voyage mis à jour avec succès' });
  });
};