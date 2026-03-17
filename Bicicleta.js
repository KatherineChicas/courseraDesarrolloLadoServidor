const mongoose = require('mongoose');

const BicicletaSchema = new mongoose.Schema({
  code: { type: Number, required: true, unique: true },
  color: { type: String, required: true },
  modelo: { type: String, required: true },
  ubicacion: {
    type: [Number], // [lat, lng]
    index: '2dsphere'
  }
});

// Métodos estáticos para CRUD
BicicletaSchema.statics.allBicis = function() {
  return this.find({});
};

BicicletaSchema.statics.add = function(aBici) {
  return this.create(aBici);
};

BicicletaSchema.statics.findByCode = function(aCode) {
  return this.findOne({ code: aCode });
};

BicicletaSchema.statics.removeByCode = function(aCode) {
  return this.deleteOne({ code: aCode });
};

module.exports = mongoose.model('Bicicleta', BicicletaSchema);
