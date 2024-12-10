const express = require('express');
const router = express.Router();
const barbersController = require('../../controllers/barbersController');

// Rutas para barberos
router.post('/barbers', barbersController.createBarber);
router.get('/barbers', barbersController.getAllBarbers);
router.delete('/barbers/:barberId', barbersController.deleteBarber);
router.get('/barbers/:barberId', barbersController.getBarberById);
router.put('/barbers/:barberId', barbersController.updateBarber);

module.exports = router;
