const express = require('express');
const passport = require('passport');
const router = express.Router();
const Bicicleta = require('../models/Bicicleta');

// Middleware para proteger la API con JWT
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Obtener todas las bicicletas (Protegido)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const bicicletas = await Bicicleta.find();
    res.json(bicicletas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear una bicicleta (Protegido)
router.post('/', authenticateJWT, async (req, res) => {
  const { code, color, modelo, ubicacion } = req.body;
  const bicicleta = new Bicicleta({ code, color, modelo, ubicacion });
  try {
    const newBicicleta = await bicicleta.save();
    res.status(201).json(newBicicleta);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
