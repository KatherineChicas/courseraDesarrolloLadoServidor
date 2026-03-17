const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  facebookId: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Método estático findOneOrCreateByGoogle
UserSchema.statics.findOneOrCreateByGoogle = async function(profile) {
  let user = await this.findOne({ googleId: profile.id });
  if (!user) {
    user = await this.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      displayName: profile.displayName
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
      displayName: profile.displayName
    });
  }
  return user;
};

module.exports = mongoose.model('User', UserSchema);
