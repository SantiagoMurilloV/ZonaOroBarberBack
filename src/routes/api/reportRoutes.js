const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/reportController');


router.post('/reports', reportController.createReport);
router.get('/reports/:barberId', reportController.getReportsByBarberId);
router.delete('/reports/:reportId', reportController.deleteReport);
router.put('/reports/:reportId', reportController.updateReport);

module.exports = router;
