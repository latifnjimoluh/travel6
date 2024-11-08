const db = require('../db');

// Obtenir tous les paiements
exports.getAllPaiements = (req, res) => {
  const sql = 'SELECT * FROM paiement';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtenir un paiement par ID
exports.getPaiementById = (req, res) => {
  const sql = 'SELECT * FROM paiement WHERE id_paiement = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json(result[0]);
  });
};

// Créer un nouveau paiement
exports.createPaiement = (req, res) => {
  const { montant, statut, datepaiement, modepaiement, id_client } = req.body;
  const sql = 'INSERT INTO paiement (montant, statut, datepaiement, modepaiement, id_client) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [montant, statut, datepaiement, modepaiement, id_client], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Paiement créé avec succès', id_paiement: result.insertId });
  });
};

// Mettre à jour un paiement
exports.updatePaiement = (req, res) => {
  const { montant, statut, datepaiement, modepaiement, id_client } = req.body;
  const sql = 'UPDATE paiement SET montant = ?, statut = ?, datepaiement = ?, modepaiement = ?, id_client = ? WHERE id_paiement = ?';
  db.query(sql, [montant, statut, datepaiement, modepaiement, id_client, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Paiement mis à jour avec succès' });
  });
};

// Annuler un paiement
exports.cancelPaiement = (req, res) => {
  const sql = 'UPDATE paiement SET statut = "annulé" WHERE id_paiement = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Paiement annulé avec succès' });
  });
};

// Confirmer un paiement
exports.confirmPaiement = (req, res) => {
  const sql = 'UPDATE paiement SET statut = "réussi" WHERE id_paiement = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Paiement confirmé avec succès' });
  });
};
