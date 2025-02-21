const Barber = require('../models/barbers');

exports.createBarber = (req, res) => {
  console.log("Datos recibidos en req.body:", req.body);
  
  const { barber_idcart, first_name, last_name,telegram_Id, phone_number } = req.body;

  if (!barber_idcart || !first_name || !last_name || !telegram_Id || !phone_number) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  const newBarber = new Barber({ barber_idcart, first_name, last_name,telegram_Id, phone_number });

  newBarber.save()
    .then(barber => res.status(201).json(barber))
    .catch(error => {
      console.error("Error al guardar el barbero:", error); 
      res.status(500).json({ error: 'Error al crear el barbero', details: error.message });
    });
};


exports.getAllBarbers = (req, res) => {
  Barber.find()
    .then(barbers => res.json(barbers))
    .catch(error => res.status(500).json({ error: 'Error al obtener los barberos' }));
};

exports.getBarberById = (req, res) => {
  const barberId = req.params.barberId;
  Barber.findById(barberId)
    .then(barber => {
      if (!barber) return res.status(404).json({ error: 'Barbero no encontrado' });
      res.json(barber);
    })
    .catch(error => res.status(500).json({ error: 'Error al obtener el barbero' }));
};

exports.updateBarber = (req, res) => {
  const barberId = req.params.barberId;
  const updateData = req.body;
  
  Barber.findByIdAndUpdate(barberId, updateData, { new: true })
    .then(barber => {
      if (!barber) return res.status(404).json({ error: 'Barbero no encontrado' });
      res.json(barber);
    })
    .catch(error => res.status(500).json({ error: 'Error al actualizar el barbero' }));
};

exports.deleteBarber = (req, res) => {
  const barberId = req.params.barberId;
  
  Barber.findByIdAndDelete(barberId)
    .then(deletedBarber => {
      if (!deletedBarber) return res.status(404).json({ error: 'Barbero no encontrado' });
      res.json({ message: 'Barbero eliminado con éxito', deletedBarber });
    })
    .catch(error => res.status(500).json({ error: 'Error al eliminar el barbero' }));
};
