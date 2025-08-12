const Price = require('../models/prices');

// Crear un nuevo servicio
exports.createPrice = (req, res) => {
  const { serviceName, price, timeRequired } = req.body;

  const newPrice = new Price({ serviceName, price, timeRequired });

  newPrice.save()
    .then(priceDoc => res.status(201).json(priceDoc))
    .catch(error => res.status(500).json({ error: 'Error al crear el precio', details: error.message }));
};

// Obtener todos los servicios
exports.getAllPrices = (req, res) => {
  Price.find()
    .then(prices => res.json(prices))
    .catch(error => res.status(500).json({ error: 'Error al obtener los precios' }));
};

// Obtener un servicio por ID
exports.getPriceById = (req, res) => {
  const priceId = req.params.priceId;
  Price.findById(priceId)
    .then(priceDoc => {
      if (!priceDoc) return res.status(404).json({ error: 'Servicio no encontrado' });
      res.json(priceDoc);
    })
    .catch(error => res.status(500).json({ error: 'Error al obtener el servicio' }));
};

// Actualizar un servicio por ID
exports.updatePrice = (req, res) => {
  const priceId = req.params.priceId;
  const updateData = req.body;

  Price.findByIdAndUpdate(priceId, updateData, { new: true })
    .then(priceDoc => {
      if (!priceDoc) return res.status(404).json({ error: 'Servicio no encontrado' });
      res.json(priceDoc);
    })
    .catch(error => res.status(500).json({ error: 'Error al actualizar el servicio' }));
};

// Eliminar un servicio por ID
exports.deletePrice = (req, res) => {
  const priceId = req.params.priceId;

  Price.findByIdAndDelete(priceId)
    .then(deletedPrice => {
      if (!deletedPrice) return res.status(404).json({ error: 'Servicio no encontrado' });
      res.json({ message: 'Servicio eliminado con éxito', deletedPrice });
    })
    .catch(error => res.status(500).json({ error: 'Error al eliminar el servicio' }));
};
