const Appointment = require('../models/appointments');

exports.createAppointment = (req, res) => {
  const { user_id, barber_id, appointment_date, service_type } = req.body;

  const newAppointment = new Appointment({ user_id, barber_id, appointment_date, service_type });

  newAppointment.save()
    .then(appointment => res.status(201).json(appointment))
    .catch(error => res.status(500).json({ error: 'Error al crear la cita', details: error.message }));
};

exports.getAllAppointments = (req, res) => {
  Appointment.find()
    .populate('user_id', 'first_name last_name')
    .populate('barber_id', 'first_name last_name')
    .then(appointments => res.json(appointments))
    .catch(error => res.status(500).json({ error: 'Error al obtener las citas' }));
};

exports.getAppointmentById = (req, res) => {
  const appointmentId = req.params.appointmentId;
  Appointment.findById(appointmentId)
    .populate('user_id', 'first_name last_name')
    .populate('barber_id', 'first_name last_name')
    .then(appointment => {
      if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });
      res.json(appointment);
    })
    .catch(error => res.status(500).json({ error: 'Error al obtener la cita' }));
};

exports.updateAppointment = (req, res) => {
  const appointmentId = req.params.appointmentId;
  const updateData = req.body;

  Appointment.findByIdAndUpdate(appointmentId, updateData, { new: true })
    .populate('user_id', 'first_name last_name')
    .populate('barber_id', 'first_name last_name')
    .then(appointment => {
      if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });
      res.json(appointment);
    })
    .catch(error => res.status(500).json({ error: 'Error al actualizar la cita' }));
};

exports.deleteAppointment = (req, res) => {
  const appointmentId = req.params.appointmentId;

  Appointment.findByIdAndDelete(appointmentId)
    .then(deletedAppointment => {
      if (!deletedAppointment) return res.status(404).json({ error: 'Cita no encontrada' });
      res.json({ message: 'Cita eliminada con éxito', deletedAppointment });
    })
    .catch(error => res.status(500).json({ error: 'Error al eliminar la cita' }));
};
