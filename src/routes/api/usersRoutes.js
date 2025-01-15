 const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');

router.post('/users', usersController.createUser);
router.get('/users', usersController.getAllUsers);
router.get('/users/:userId', usersController.getUserById);
router.put('/users/:userId', usersController.updateUser);
router.delete('/users/:userId', usersController.deleteUser);

module.exports = router;
