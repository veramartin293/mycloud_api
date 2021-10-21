// Environment variables
require('custom-env').env();

// Module imports
const express = require('express');
const usersRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes');
const filesRoutes = require('./routes/files.routes');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/api/users', usersRoutes);
app.use('/api/login', authRoutes);
app.use('/api/files', filesRoutes);

app.listen(process.env.APP_PORT, () => {
    console.log(`Server is listening on port ${process.env.APP_PORT}`);
});