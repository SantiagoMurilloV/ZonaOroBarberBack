const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const barbersRoutes = require('./src/routes/api/barbersRoutes');
const reservationsRoutes = require('./src/routes/api/reservations_routes');
const financeRoutes = require('./src/routes/api/finances_routes')
const inventoryRoutes= require('./src/routes/api/inventoryRoutes')
const admin = require('./src/routes/api/adminRoutes')
const users = require('./src/routes/api/usersRoutes')
const appointments = require('./src/routes/api/appointmentsRoutes')

// const notification = require('./helpers/twilio_route')

const cors = require('cors');



dotenv.config();

app.use(express.json());

const dbUrl = process.env.MONGODB_URL;
const PORT = process.env.PORT;
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Conexión a la base de datos exitosa'));

app.use(cors());
app.use('/api', barbersRoutes);
app.use('/api', reservationsRoutes);
app.use('/api', financeRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', admin);
app.use('/api', appointments);
app.use('/api', users);



app.listen(PORT, () => {
  console.log('Servidor Express en ejecución en el puerto' + PORT);
});