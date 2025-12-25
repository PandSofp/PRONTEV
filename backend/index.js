const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('PRONTEV API is running...');
});

const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const categoriesRoutes = require('./routes/categories');
const branchesRoutes = require('./routes/branches');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const servicesRoutes = require('./routes/services');
// const inventoryRoutes = require('./routes/inventory');

app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
// app.use('/api/inventory', inventoryRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
