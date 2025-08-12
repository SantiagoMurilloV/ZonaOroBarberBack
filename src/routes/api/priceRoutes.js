
// routes/prices.js
const express = require('express');
const router = express.Router();
const priceController = require('../../controllers/priceController');

// Crear un nuevo servicio
router.post('/', priceController.createPrice);

// Obtener todos los servicios
router.get('/prices', priceController.getAllPrices);

// Obtener un servicio por ID
router.get('/prices/:priceId', priceController.getPriceById);

// Actualizar un servicio por ID
router.put('/prices/:priceId', priceController.updatePrice);

// Eliminar un servicio por ID
router.delete('/prices/:priceId', priceController.deletePrice);

module.exports = router;
