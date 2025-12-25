const db = require('./db');
require('dotenv').config();

async function seed() {
    try {
        console.log('Iniciando seeding...');

        // Insert HQ Branch
        const branchRes = await db.query(`
      INSERT INTO branches (name, location, contact, is_hq) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, ['Sede PRONTEV', 'Luanda, Angola', '+244 900 000 000', true]);

        const branchId = branchRes.rows.length > 0 ? branchRes.rows[0].id : 1;

        // Insert Admin User
        // Password is 'admin123'
        await db.query(`
      INSERT INTO users (name, email, password_hash, role, branch_id) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `, [
            'Administrador PRONTEV',
            'admin@prontev.com',
            '$2b$10$hpn9Tw1EOu1kPDsuQ9VHk.otnjVF4wHRrT00GO5tejw4diY8Aym1W',
            'HQ_ADMIN',
            branchId
        ]);

        console.log('Seeding concluído com sucesso!');
        process.exit(0);
    } catch (err) {
        console.error('Erro no seeding:', err.message);
        process.exit(1);
    }
}

seed();
