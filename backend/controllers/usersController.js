const db = require('../db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, branch_id, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT id, name, email, role, branch_id, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, role, branch_id } = req.body;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, branch_id',
      [name, email, password_hash, role, branch_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, branch_id } = req.body;
    let password_hash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }
    const result = await db.query(
      'UPDATE users SET name=$1, email=$2, password_hash=COALESCE($3, password_hash), role=$4, branch_id=$5 WHERE id=$6 RETURNING id, name, email, role, branch_id',
      [name, email, password_hash, role, branch_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
