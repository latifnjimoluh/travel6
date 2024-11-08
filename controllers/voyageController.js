const db = require('../db');

// Obtenir tous les voyages
exports.getAllVoyages = (req, res) => {
  const sql = 'SELECT * FROM voyage';
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
