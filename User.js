const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, minlength: 6 },
  displayName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método estático findOneOrCreateByGoogle
UserSchema.statics.findOneOrCreateByGoogle = async function(profile) {
  let user = await this.findOne({ googleId: profile.id });
  if (!user) {
    user = await this.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      displayName: profile.displayName,
      isVerified: true // Asumimos que Google ya verificó el email
    });
  }
  return user;
};

// Método estático findOneOrCreateByFacebook
UserSchema.statics.findOneOrCreateByFacebook = async function(profile) {
  let user = await this.findOne({ facebookId: profile.id });
  if (!user) {
    user = await this.create({
      facebookId: profile.id,
      email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
      displayName: profile.displayName,
      isVerified: true // Asumimos que Facebook ya verificó el email
    });
  }
  return user;
};

module.exports = mongoose.model('User', UserSchema);
