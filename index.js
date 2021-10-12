// Environment variables
require('custom-env').env('development');

// Module imports
const express = require('express');
const usersRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/users', usersRoutes);
app.use('/api/login', authRoutes);

app.listen(process.env.APP_PORT, () => {
    console.log(`Server is listening on port ${process.env.APP_PORT}`);
});