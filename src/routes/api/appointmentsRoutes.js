const express = require('express');
const router = express.Router();
const appointmentsController = require('../../controllers/appointmentsController');

router.post('/appointments', appointmentsController.createAppointment);
router.get('/appointments', appointmentsController.getAllAppointments);
router.get('/appointments/:appointmentId', appointmentsController.getAppointmentById);
router.put('/appointments/:appointmentId', appointmentsController.updateAppointment);
router.delete('/appointments/:appointmentId', appointmentsController.deleteAppointment);

module.exports = router;
