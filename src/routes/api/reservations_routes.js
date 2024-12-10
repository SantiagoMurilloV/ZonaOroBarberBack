const express = require('express');
const router = express.Router();
const reservationsControllers = require('../../controllers/reservations_controllers');

router.post('/reservations', reservationsControllers.createReservation);
router.get('/reservations/barber/:id_barbero', reservationsControllers.getReservationsByBarber);
router.get('/reservationsByDay/barber/:barberId', reservationsControllers.getReservationsByBarberDay);

module.exports = router;
