const express = require('express');
const router = express.Router();
const barbersController = require('../../controllers/barbersController');
const multer = require('multer'); // Middleware para manejar multipart/form-data


const upload = multer({ storage: multer.memoryStorage() });
// Rutas para barberos
router.post('/barbers', barbersController.createBarber);
router.get('/barbers', barbersController.getAllBarbers);
router.delete('/barbers/:barberId', barbersController.deleteBarber);
router.get('/barbers/:barberId', barbersController.getBarberById);
router.put('/barbers/:barberId', barbersController.updateBarber);
router.post('/api/barbers/:id/upload-image', upload.single('image'),barbersController.uploadImage);

module.exports = router;
