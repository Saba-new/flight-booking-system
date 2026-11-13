require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

const bookingsRouter = require('./routes/bookings');
const offersRouter = require('./routes/offers');
const authRouter = require('./routes/auth');
const airportsRouter = require('./routes/airports');

app.use('/api/bookings', verifyToken, bookingsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/auth', authRouter);
app.use('/api/airports', airportsRouter);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

module.exports = app;
