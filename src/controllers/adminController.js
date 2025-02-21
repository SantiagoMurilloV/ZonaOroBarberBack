const Admin = require('../models/admin');

exports.createAdmin = (req, res) => {
  const { admin_idcart, first_name, last_name, telegram_Id, phone_number } = req.body;

  const newAdmin = new Admin({ admin_idcart, first_name, last_name, telegram_Id, phone_number });

  newAdmin.save()
    .then(admin => res.status(201).json(admin))
    .catch(error => res.status(500).json({ error: 'Error al crear el administrador', details: error.message }));
};

exports.getAllAdmins = (req, res) => {
  Admin.find()
    .then(admins => res.json(admins))
    .catch(error => res.status(500).json({ error: 'Error al obtener los administradores' }));
};

exports.getAdminById = (req, res) => {
  const adminId = req.params.adminId;
  Admin.findById(adminId)
    .then(admin => {
      if (!admin) return res.status(404).json({ error: 'Administrador no encontrado' });
      res.json(admin);
    })
    .catch(error => res.status(500).json({ error: 'Error al obtener el administrador' }));
};

exports.updateAdmin = (req, res) => {
  const adminId = req.params.adminId;
  const updateData = req.body;

  Admin.findByIdAndUpdate(adminId, updateData, { new: true })
    .then(admin => {
      if (!admin) return res.status(404).json({ error: 'Administrador no encontrado' });
      res.json(admin);
    })
    .catch(error => res.status(500).json({ error: 'Error al actualizar el administrador' }));
};

exports.deleteAdmin = (req, res) => {
  const adminId = req.params.adminId;

  Admin.findByIdAndDelete(adminId)
    .then(deletedAdmin => {
      if (!deletedAdmin) return res.status(404).json({ error: 'Administrador no encontrado' });
      res.json({ message: 'Administrador eliminado con éxito', deletedAdmin });
    })
    .catch(error => res.status(500).json({ error: 'Error al eliminar el administrador' }));
};
