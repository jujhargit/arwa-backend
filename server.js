const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const callAiRoutes = require('./routes/call-ai');

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use(callAiRoutes);

app.get('/', (req, res) => {
    res.send('Server is Running');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
