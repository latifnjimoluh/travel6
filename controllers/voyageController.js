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

// Obtenir un voyage par ID
exports.getVoyageById = (req, res) => {
  const sql = 'SELECT * FROM voyage WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }
    res.json(result[0]);
  });
};

// Créer un nouveau voyage
exports.createVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet } = req.body;

  // Assurez-vous que les heures sont envoyées dans le format DATETIME
  const sql = 'INSERT INTO voyage (heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Voyage créé avec succès', id_voyage: result.insertId });
  });
};

// Mettre à jour un voyage
exports.updateVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet } = req.body;
  const sql = 'UPDATE voyage SET heure_depart = ?, heure_arrive = ?, id_client = ?, id_vehicule = ?, id_chauffeur = ?, id_classe = ?, id_trajet = ? WHERE id_voyage = ?';
  db.query(sql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Voyage mis à jour avec succès' });
  });
};

// Annuler un voyage
exports.cancelVoyage = (req, res) => {
  const sql = 'UPDATE voyage SET statut = "annulé" WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Voyage annulé avec succès' });
  });
};


// Mettre à jour le statut d'un voyage
exports.updateStatutVoyage = (req, res) => {
  const { statut } = req.body; // Nouveau statut
  const sql = 'UPDATE voyage SET statut = ? WHERE id_voyage = ?';
  
  db.query(sql, [statut, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Statut du voyage mis à jour avec succès' });
  });
};
