const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category_id, branch_id, price, stock_quantity } = req.body;
    const result = await db.query(
      'INSERT INTO products (name, category_id, branch_id, price, stock_quantity) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, category_id, branch_id, price || 0, stock_quantity || 0]
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
    const { name, category_id, branch_id, price, stock_quantity } = req.body;
    const result = await db.query(
      'UPDATE products SET name=$1, category_id=$2, branch_id=$3, price=$4, stock_quantity=$5 WHERE id=$6 RETURNING *',
      [name, category_id, branch_id, price, stock_quantity, id]
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
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
