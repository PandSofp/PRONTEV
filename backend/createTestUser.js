const db = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUser() {
  try {
    const name = 'Usuario Teste';
    const email = 'test@prontev.com';
    const password = 'test123';
    const role = 'BRANCH_USER';
    const branchId = 1; // ajusta se necessário

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const res = await db.query(`
      INSERT INTO users (name, email, password_hash, role, branch_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id, email
    `, [name, email, password_hash, role, branchId]);

    console.log('Utilizador criado/actualizado:', res.rows[0]);
    console.log('Credenciais ->', email, '/', password);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar utilizador de teste:', err.message || err);
    process.exit(1);
  }
}

createUser();
