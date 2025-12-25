const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM branches ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM branches WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.create = async (req, res) => {
  try {
    const { name, location, contact, is_hq } = req.body;
    const result = await db.query(
      'INSERT INTO branches (name, location, contact, is_hq) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, location, contact, is_hq || false]
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
    const { name, location, contact, is_hq } = req.body;
    const result = await db.query(
      'UPDATE branches SET name=$1, location=$2, contact=$3, is_hq=$4 WHERE id=$5 RETURNING *',
      [name, location, contact, is_hq || false, id]
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
    await db.query('DELETE FROM branches WHERE id = $1', [id]);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
