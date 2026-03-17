const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const Token = require('../models/Token');
const sendEmail = require('../config/mailer');

// --- RUTAS WEB ---

// Login Local
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login?error=' + encodeURIComponent(info.message));
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/profile');
    });
  })(req, res, next);
});

// Registro Local
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.redirect('/register?error=Email ya registrado');

    user = new User({ email, password, displayName });
    await user.save();

    // Crear token de verificación
    const token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
    await token.save();

    // Enviar email de bienvenida con link de verificación
    const verificationUrl = `${req.protocol}://${req.get('host')}/auth/verify/${token.token}`;
    await sendEmail(user.email, 'Bienvenido - Verifica tu cuenta', `Hola ${user.displayName}, por favor verifica tu cuenta haciendo clic aquí: ${verificationUrl}`);

    res.redirect('/login?success=Registro exitoso. Revisa tu email para verificar tu cuenta.');
  } catch (err) {
    res.redirect('/register?error=' + err.message);
  }
});

// Verificación de cuenta
router.get('/verify/:token', async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.params.token });
    if (!token) return res.status(400).send('Token inválido o expirado');

    const user = await User.findById(token._userId);
    if (!user) return res.status(400).send('Usuario no encontrado');

    user.isVerified = true;
    await user.save();
    await Token.deleteOne({ _id: token._id });

    res.redirect('/login?success=Cuenta verificada correctamente.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Recuperación de contraseña (solicitud)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.redirect('/forgot-password?error=Email no encontrado');

    const token = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetTokenExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;
    await sendEmail(user.email, 'Recuperación de contraseña', `Haz clic aquí para restablecer tu contraseña: ${resetUrl}`);

    res.redirect('/forgot-password?success=Se ha enviado un email con instrucciones.');
  } catch (err) {
    res.redirect('/forgot-password?error=' + err.message);
  }
});

// Restablecer contraseña (procesar)
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetTokenExpires: { $gt: Date.now() }
    });

    if (!user) return res.redirect('/forgot-password?error=Token inválido o expirado');

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    res.redirect('/login?success=Contraseña actualizada correctamente.');
  } catch (err) {
    res.redirect('/forgot-password?error=' + err.message);
  }
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => res.redirect('/profile'));

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => res.redirect('/profile'));

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// --- RUTAS API (JWT) ---

// Login API para obtener Token
router.post('/api/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) return res.status(400).json({ message: info ? info.message : 'Login fallido', user });
    
    req.login(user, { session: false }, (err) => {
      if (err) res.send(err);
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secreto_jwt_por_defecto', { expiresIn: '1h' });
      return res.json({ user: { email: user.email, displayName: user.displayName }, token });
    });
  })(req, res, next);
});

module.exports = router;
