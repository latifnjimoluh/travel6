const db = require('../db');

// Ajouter un nouvel employé
exports.addEmployee = (req, res) => {
  const { nom_personnel, prenom_personnel, adresse_personnel, poste, password } = req.body;

  // Hashage du mot de passe
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: err.message });

    const sql = 'INSERT INTO personnel (nom_personnel, prenom_personnel, adresse_personnel, poste, password) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nom_personnel, prenom_personnel, adresse_personnel, poste, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Employé ajouté avec succès', id_personnel: result.insertId });
    });
  });
};

// Modifier les informations d'un employé
exports.updateEmployee = (req, res) => {
  const { id_personnel, nom_personnel, prenom_personnel, adresse_personnel, poste } = req.body;
  const sql = 'UPDATE personnel SET nom_personnel = ?, prenom_personnel = ?, adresse_personnel = ?, poste = ? WHERE id_personnel = ?';
  db.query(sql, [nom_personnel, prenom_personnel, adresse_personnel, poste, id_personnel], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.json({ message: 'Informations de l\'employé mises à jour avec succès' });
  });
};

// Supprimer un employé
exports.deleteEmployee = (req, res) => {
  const { id_personnel } = req.params;
  const sql = 'DELETE FROM personnel WHERE id_personnel = ?';
  db.query(sql, [id_personnel], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.json({ message: 'Employé supprimé avec succès' });
  });
};

// Consulter l'historique des actions des employés
exports.getEmployeeActions = (req, res) => {
  const { id_personnel } = req.params;
  const sql = 'SELECT * FROM actions WHERE id_personnel = ? ORDER BY date_action DESC';
  db.query(sql, [id_personnel], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucune action trouvée pour cet employé' });
    }
    res.json(result);
  });
};

// Consulter tous les employés
exports.getAllEmployees = (req, res) => {
  const sql = 'SELECT id_personnel, nom_personnel, prenom_personnel, poste FROM personnel';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Récupérer les informations d'un employé
exports.getEmployeeById = (req, res) => {
  const { id_personnel } = req.params;
  const sql = 'SELECT * FROM personnel WHERE id_personnel = ?';
  db.query(sql, [id_personnel], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.json(result[0]);
  });
};

