const express = require('express');
const passport = require('passport');
const router = express.Router();
const sendEmail = require('../config/mailer');

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    // Enviar email de verificación al crear usuario
    if (req.user.createdAt > new Date(Date.now() - 10000)) {
      await sendEmail(req.user.email, 'Verificación de cuenta', 'Gracias por registrarte con Google.');
    }
    res.redirect('/profile');
  }
);

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  async (req, res) => {
    // Enviar email de verificación al crear usuario
    if (req.user.createdAt > new Date(Date.now() - 10000)) {
      await sendEmail(req.user.email, 'Verificación de cuenta', 'Gracias por registrarte con Facebook.');
    }
    res.redirect('/profile');
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
