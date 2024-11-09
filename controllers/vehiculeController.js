const db = require('../db');

// Obtenir tous les véhicules
exports.getAllVehicules = (req, res) => {
  const sql = 'SELECT * FROM vehicule';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtenir un véhicule par ID
exports.getVehiculeById = (req, res) => {
  const sql = 'SELECT * FROM vehicule WHERE id_vehicule = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Véhicule non trouvé' });
    res.json(result[0]);
  });
};

// Créer un nouveau véhicule
exports.createVehicule = (req, res) => {
  const { immatriculation, modele, nombreplaces, id_modele } = req.body;
  const sql = 'INSERT INTO vehicule (immatriculation, modele, nombreplaces, id_modele) VALUES (?, ?, ?, ?)';
  db.query(sql, [immatriculation, modele, nombreplaces, id_modele], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Véhicule créé avec succès', id: result.insertId });
  });
};

// Mettre à jour un véhicule
exports.updateVehicule = (req, res) => {
  const { immatriculation, modele, nombreplaces, id_modele } = req.body;
  const sql = 'UPDATE vehicule SET immatriculation = ?, modele = ?, nombreplaces = ?, id_modele = ? WHERE id_vehicule = ?';
  db.query(sql, [immatriculation, modele, nombreplaces, id_modele, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Véhicule mis à jour avec succès' });
  });
};

// Supprimer un véhicule
exports.deleteVehicule = (req, res) => {
  const sql = 'DELETE FROM vehicule WHERE id_vehicule = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Véhicule supprimé avec succès' });
  });
};
