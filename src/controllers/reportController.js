const Report = require('../models/report');

// Función para crear un nuevo reporte
exports.createReport = async (req, res) => {
  try {
    const { barberId, type, hours, dates } = req.body;
    const newReport = new Report({ barberId, type, hours, dates });
    await newReport.save();
    res.status(201).send({ message: 'Reporte creado exitosamente', data: newReport });
  } catch (error) {
    res.status(400).send({ message: 'Error al crear el reporte', error: error.message });
  }
};


// Función para obtener reportes por barberId
exports.getReportsByBarberId = async (req, res) => {
  try {
    const { barberId } = req.params;
    const reports = await Report.find({ barberId: barberId });
    res.status(200).send(reports);
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener los reportes', error: error.message });
  }
};


// Función para eliminar un reporte específico
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;  
    const report = await Report.findByIdAndRemove(reportId);  

    if (!report) {
      return res.status(404).send({ message: 'Reporte no encontrado' });
    }

    res.status(200).send({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar el reporte', error: error.message });
  }
};


// Función para actualizar un reporte específico
exports.updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { hours, dates } = req.body; 

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { $set: { hours, dates } },
      { new: true }  
    );

    if (!updatedReport) {
      return res.status(404).send({ message: 'Reporte no encontrado' });
    }

    res.status(200).send({ message: 'Reporte actualizado exitosamente', data: updatedReport });
  } catch (error) {
    res.status(500).send({ message: 'Error al actualizar el reporte', error: error.message });
  }
};
