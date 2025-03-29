const User = require('../models/users');
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
