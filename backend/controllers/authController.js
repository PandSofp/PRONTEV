const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, role, branch_id } = req.body;

    try {
        let user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, role, branch_id',
            [name, email, password_hash, role, branch_id]
        );

        const payload = {
            user: {
                id: newUser.rows[0].id,
                role: newUser.rows[0].role,
                branch_id: newUser.rows[0].branch_id
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: newUser.rows[0] });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.rows[0].id,
                role: user.rows[0].role,
                branch_id: user.rows[0].branch_id
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.rows[0].id,
                        name: user.rows[0].name,
                        role: user.rows[0].role,
                        branch_id: user.rows[0].branch_id
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
