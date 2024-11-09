const db = require('../db');

// Obtenir toutes les classes
exports.getAllClasses = (req, res) => {
  const sql = 'SELECT * FROM classe';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtenir une classe par ID
exports.getClasseById = (req, res) => {
  const sql = 'SELECT * FROM classe WHERE id_classe = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Classe non trouvée' });
    res.json(result[0]);
  });
};

// Créer une nouvelle classe
exports.createClasse = (req, res) => {
  const { nom_classe, prix_classe } = req.body;
  const sql = 'INSERT INTO classe (nom_classe, prix_classe) VALUES (?, ?)';
  db.query(sql, [nom_classe, prix_classe], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Classe créée avec succès', id: result.insertId });
  });
};

// Mettre à jour une classe
exports.updateClasse = (req, res) => {
  const { nom_classe, prix_classe } = req.body;
  const sql = 'UPDATE classe SET nom_classe = ?, prix_classe = ? WHERE id_classe = ?';
  db.query(sql, [nom_classe, prix_classe, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Classe mise à jour avec succès' });
  });
};

// Supprimer une classe
exports.deleteClasse = (req, res) => {
  const sql = 'DELETE FROM classe WHERE id_classe = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Classe supprimée avec succès' });
  });
};
