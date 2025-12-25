const db = require('../db');

exports.createSale = async (req, res) => {
  const { branch_id, user_id, total, discount, items, is_offline, offline_id, date } = req.body;

  try {
    await db.query('BEGIN');

    // Insert sale
    const saleResult = await db.query(
      `INSERT INTO sales (branch_id, user_id, total_amount, discount, final_amount, is_offline, offline_id, sale_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [branch_id, user_id, total + discount, discount, total, is_offline || false, offline_id || null, date]
    );

    const saleId = saleResult.rows[0].id;

    // Insert items
    for (const item of items) {
      const isProduct = item.category !== undefined; // Simple check, or use a type field
      await db.query(
        `INSERT INTO sale_items (sale_id, product_id, service_id, quantity, unit_price, subtotal) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          saleId, 
          isProduct ? item.id : null, 
          !isProduct ? item.id : null, 
          item.quantity, 
          item.price, 
          item.price * item.quantity
        ]
      );

      // Update stock if product
      if (isProduct) {
        await db.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND branch_id = $3',
          [item.quantity, item.id, branch_id]
        );
      }
    }

    await db.query('COMMIT');
    res.status(201).json({ msg: 'Sale recorded successfully', saleId });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getSalesByBranch = async (req, res) => {
  const { branch_id } = req.params;
  try {
    const sales = await db.query(
      `SELECT s.*, u.name as seller_name 
       FROM sales s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.branch_id = $1 
       ORDER BY s.sale_date DESC`,
      [branch_id]
    );
    res.json(sales.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sales ORDER BY sale_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM sales WHERE id = $1', [id]);
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
    await db.query('DELETE FROM sales WHERE id = $1', [id]);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
