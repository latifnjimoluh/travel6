const db = require('../db');

// Obtenir tous les trajets
exports.getAllTrajets = (req, res) => {
  const sql = 'SELECT * FROM trajet';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtenir un trajet par ID
exports.getTrajetById = (req, res) => {
  const sql = 'SELECT * FROM trajet WHERE id_trajet = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Trajet non trouvé' });
    res.json(result[0]);
  });
};

// Créer un nouveau trajet
exports.createTrajet = (req, res) => {
  const { ville_depart, ville_arrivee } = req.body;
  const sql = 'INSERT INTO trajet (ville_depart, ville_arrivee) VALUES (?, ?)';
  db.query(sql, [ville_depart, ville_arrivee], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Trajet créé avec succès', id: result.insertId });
  });
};

// Mettre à jour un trajet
exports.updateTrajet = (req, res) => {
  const { ville_depart, ville_arrivee } = req.body;
  const sql = 'UPDATE trajet SET ville_depart = ?, ville_arrivee = ? WHERE id_trajet = ?';
  db.query(sql, [ville_depart, ville_arrivee, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Trajet mis à jour avec succès' });
  });
};

// Supprimer un trajet
exports.deleteTrajet = (req, res) => {
  const sql = 'DELETE FROM trajet WHERE id_trajet = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Trajet supprimé avec succès' });
  });
};
