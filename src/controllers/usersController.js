const User = require('../models/users');

exports.createUser = (req, res) => {
  const { user_idcart, first_name, last_name, email, phone_number, role } = req.body;

  const newUser = new User({ user_idcart, first_name, last_name, email, phone_number, role });

  newUser.save()
    .then(user => res.status(201).json(user))
    .catch(error => res.status(500).json({ error: 'Error al crear el usuario', details: error.message }));
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
