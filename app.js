const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


const barbersRoutes = require('./src/routes/api/barbersRoutes');
const reservationsRoutes = require('./src/routes/api/reservations_routes');
const financeRoutes = require('./src/routes/api/finances_routes');
const inventoryRoutes = require('./src/routes/api/inventoryRoutes');
const admin = require('./src/routes/api/adminRoutes');
const users = require('./src/routes/api/usersRoutes');
const appointments = require('./src/routes/api/appointmentsRoutes');
const reports = require('./src/routes/api/reportRoutes');
const pricesRoutes = require('./src/routes/api/priceRoutes');


dotenv.config();

app.use(express.json());

const dbUrl = process.env.MONGODB_URL;
const PORT = process.env.PORT || 8080; 

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Conexión a la base de datos exitosa'));


const allowedOrigins = ['https://zonaorobarber.vercel.app', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));


app.use('/api', barbersRoutes);
app.use('/api', reservationsRoutes);
app.use('/api', financeRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', admin);
app.use('/api', users);
app.use('/api', appointments);
app.use('/api', reports);
app.use('/api', pricesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});
