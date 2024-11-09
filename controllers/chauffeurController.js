const db = require('../db');

// Obtenir tous les chauffeurs
exports.getAllChauffeurs = (req, res) => {
  const sql = 'SELECT * FROM chauffeur';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtenir un chauffeur par ID
exports.getChauffeurById = (req, res) => {
  const sql = 'SELECT * FROM chauffeur WHERE id_chauffeur = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Chauffeur non trouvé' });
    res.json(result[0]);
  });
};

// Créer un nouveau chauffeur
exports.createChauffeur = (req, res) => {
  const { nom_chauffeur, prenom_chauffeur, date_naiss_chauffeur, num_cni_chauffeur, adresse_chauffeur, telephone_chauffeur } = req.body;
  const sql = 'INSERT INTO chauffeur (nom_chauffeur, prenom_chauffeur, date_naiss_chauffeur, num_cni_chauffeur, adresse_chauffeur, telephone_chauffeur) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nom_chauffeur, prenom_chauffeur, date_naiss_chauffeur, num_cni_chauffeur, adresse_chauffeur, telephone_chauffeur], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Chauffeur créé avec succès', id: result.insertId });
  });
};

// Mettre à jour un chauffeur
exports.updateChauffeur = (req, res) => {
  const { nom_chauffeur, prenom_chauffeur, date_naiss_chauffeur, num_cni_chauffeur, adresse_chauffeur, telephone_chauffeur } = req.body;
  const sql = 'UPDATE chauffeur SET nom_chauffeur = ?, prenom_chauffeur = ?, date_naiss_chauffeur = ?, num_cni_chauffeur = ?, adresse_chauffeur = ?, telephone_chauffeur = ? WHERE id_chauffeur = ?';
  db.query(sql, [nom_chauffeur, prenom_chauffeur, date_naiss_chauffeur, num_cni_chauffeur, adresse_chauffeur, telephone_chauffeur, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Chauffeur mis à jour avec succès' });
  });
};

// Supprimer un chauffeur
exports.deleteChauffeur = (req, res) => {
  const sql = 'DELETE FROM chauffeur WHERE id_chauffeur = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Chauffeur supprimé avec succès' });
  });
};
