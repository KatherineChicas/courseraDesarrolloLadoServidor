const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('<h1>Bienvenido a mi proyecto</h1><a href="/auth/google">Login con Google</a><br><a href="/auth/facebook">Login con Facebook</a>');
});

router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`<h1>Perfil de ${req.user.displayName}</h1><p>Email: ${req.user.email}</p><a href="/auth/logout">Cerrar sesión</a>`);
});

module.exports = router;
