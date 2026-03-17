const express = require('express');
const passport = require('passport');
const router = express.Router();
const Bicicleta = require('../models/Bicicleta');

// Middleware para proteger la API con JWT (con bypass para tests)
const authenticateJWT = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return passport.authenticate('jwt', { session: false })(req, res, next);
};

// Obtener todas las bicicletas
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const bicicletas = await Bicicleta.find();
    res.status(200).json(bicicletas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear una bicicleta
router.post('/create', authenticateJWT, async (req, res) => {
  const { code, color, modelo, lat, lng } = req.body;
  const bicicleta = new Bicicleta({ code, color, modelo, ubicacion: [lat, lng] });
  try {
    const newBicicleta = await bicicleta.save();
    res.status(201).json(newBicicleta);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar una bicicleta
router.post('/update', authenticateJWT, async (req, res) => {
  const { code, color, modelo, lat, lng } = req.body;
  try {
    const updatedBici = await Bicicleta.findOneAndUpdate(
      { code: code },
      { color, modelo, ubicacion: [lat, lng] },
      { new: true }
    );
    res.status(200).json(updatedBici);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una bicicleta
router.post('/delete', authenticateJWT, async (req, res) => {
  const { code } = req.body;
  try {
    await Bicicleta.deleteOne({ code: code });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
