const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');

// Rutas para administrador
router.post('/admin', adminController.createAdmin);
router.get('/admin', adminController.getAllAdmins);
router.get('/admin/:adminId', adminController.getAdminById);
router.put('/admin/:adminId', adminController.updateAdmin);
router.delete('/admin/:adminId', adminController.deleteAdmin);

module.exports = router;
