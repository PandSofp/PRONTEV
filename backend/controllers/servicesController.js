const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM services ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.create = async (req, res) => {
  try {
    const { name, type, base_price, unit } = req.body;
    const result = await db.query(
      'INSERT INTO services (name, type, base_price, unit) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, type, base_price || 0, unit]
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
    const { name, type, base_price, unit } = req.body;
    const result = await db.query(
      'UPDATE services SET name=$1, type=$2, base_price=$3, unit=$4 WHERE id=$5 RETURNING *',
      [name, type, base_price, unit, id]
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
    await db.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
