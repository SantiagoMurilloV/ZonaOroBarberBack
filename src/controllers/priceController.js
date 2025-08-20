const Price = require('../models/prices');

// Crear un nuevo servicio
exports.createPrice = async (req, res) => {
  try {
    let { serviceName, price, timeRequired } = req.body;

    // --- Normalización ---
    serviceName = (serviceName ?? '').trim();
    price = Number(price);
    timeRequired = Number(timeRequired);

    // --- Validaciones básicas ---
    if (!serviceName) {
      return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
    }
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ error: 'Precio inválido (>= 0)' });
    }
    if (!Number.isFinite(timeRequired) || timeRequired <= 0) {
      return res.status(400).json({ error: 'Tiempo requerido inválido (minutos > 0)' });
    }

    // --- Chequeo de duplicado case-insensitive ---
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exists = await Price.findOne({
      serviceName: { $regex: `^${escapeRegex(serviceName)}$`, $options: 'i' }
    }).lean();

    if (exists) {
      return res.status(409).json({ error: 'Ya existe un servicio con ese nombre' });
    }

    // --- Crear ---
    const doc = await Price.create({ serviceName, price, timeRequired });
    return res.status(201).json(doc);
  } catch (err) {
    // Si tienes índice único y salta E11000
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un servicio con ese nombre' });
    }
    console.error('Error al crear el precio:', err);
    return res.status(500).json({ error: 'Error al crear el precio' });
  }
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


