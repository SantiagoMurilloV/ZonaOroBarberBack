const User = require('../models/users');
const Reservation = require('../models/reservations');
const { validationResult } = require('express-validator');

exports.createUser = async (req, res) => {
  const { first_name, phone_number } = req.body;
  let { last_name } = req.body; 

  last_name = last_name || '';

  try {

    const existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya está registrado con este número de teléfono.' });
    }

    const newUser = new User({ first_name, last_name, phone_number });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {

    res.status(500).json({ error: 'Error al crear el usuario', details: error.message });
  }
};

exports.getAllUsers = (req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(error => res.status(500).json({ error: 'Error al obtener los usuarios' }));
};

exports.getUsersForList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    const matchStage = search
      ? {
          $match: {
            $or: [
              { first_name: { $regex: search, $options: 'i' } },
              { last_name: { $regex: search, $options: 'i' } },
              { phone_number: { $regex: search, $options: 'i' } }
            ]
          }
        }
      : null;

    const pipeline = [];
    if (matchStage) pipeline.push(matchStage);

    pipeline.push(
      {
        $lookup: {
          from: 'reservations',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            { $count: 'count' }
          ],
          as: 'reservationStats'
        }
      },
      {
        $addFields: {
          reservationCount: {
            $ifNull: [{ $arrayElemAt: ['$reservationStats.count', 0] }, 0]
          }
        }
      },
      { $project: { reservationStats: 0 } },
      { $sort: { reservationCount: -1, first_name: 1 } },
      {
        $facet: {
          metadata: [{ $count: 'totalItems' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    );

    const [result] = await User.aggregate(pipeline);
    const totalItems = result?.metadata?.[0]?.totalItems || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return res.status(200).json({
      data: result?.data || [],
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuarios paginados', details: error.message });
  }
};

exports.getReservationsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const reservations = await Reservation.find({ userId }).sort({ day: -1, created_at: -1 }).lean();
    return res.status(200).json(reservations);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener reservas del usuario', details: error.message });
  }
};

exports.getUserById = (req, res) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then(user => {
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(user);
    })
    .catch(error => res.status(500).json({ error: 'Error al obtener el usuario' }));
};

exports.updateUser = (req, res) => {
  const userId = req.params.userId;
  const updateData = req.body;

  User.findByIdAndUpdate(userId, updateData, { new: true })
    .then(user => {
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(user);
    })
    .catch(error => res.status(500).json({ error: 'Error al actualizar el usuario' }));
};

exports.deleteUser = (req, res) => {
  const userId = req.params.userId;

  User.findByIdAndDelete(userId)
    .then(deletedUser => {
      if (!deletedUser) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ message: 'Usuario eliminado con éxito', deletedUser });
    })
    .catch(error => res.status(500).json({ error: 'Error al eliminar el usuario' }));
};
