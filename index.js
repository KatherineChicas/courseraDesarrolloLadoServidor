const express = require('express');
const router = express.Router();

// Middleware para asegurar que el usuario esté autenticado en la web
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login?error=Debes iniciar sesión para acceder a esta página');
};

// Vistas públicas
router.get('/', (req, res) => res.render('index'));
router.get('/login', (req, res) => res.render('login', { error: req.query.error, success: req.query.success }));
router.get('/register', (req, res) => res.render('register', { error: req.query.error }));
router.get('/forgot-password', (req, res) => res.render('forgot-password', { error: req.query.error, success: req.query.success }));
router.get('/auth/reset-password/:token', (req, res) => res.render('reset-password', { token: req.params.token, error: req.query.error }));

// Vistas protegidas
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

module.exports = router;
