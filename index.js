// Environment variables
require('custom-env').env('development');

// Module imports
const express = require('express');
const users = require('./routes/users.routes');

const app = express();
app.use(express.json());
app.use('/api/users', users);

app.listen(process.env.APP_PORT, () => {
    console.log(`Server is listening on port ${process.env.APP_PORT}`);
});