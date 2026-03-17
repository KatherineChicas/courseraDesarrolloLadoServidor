const mongoose = require('mongoose');
const Bicicleta = require('../../models/Bicicleta');

describe('Testing Bicicletas', function() {
    beforeAll(function(done) {
        const mongoDB = 'mongodb://localhost:27017/testdb';
        mongoose.connect(mongoDB);
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function() {
            console.log('We are connected to test database!');
            done();
        });
    });

    afterEach(function(done) {
        Bicicleta.deleteMany({}, function(err, success) {
            if (err) console.log(err);
            done();
        });
    });

    afterAll(function(done) {
        mongoose.disconnect(done);
    });

    describe('Bicicleta.createInstance', () => {
        it('crea una instancia de Bicicleta', () => {
            const bici = new Bicicleta({code: 1, color: "verde", modelo: "urbana", ubicacion: [-34.6012424, -58.3861497]});

            expect(bici.code).toBe(1);
            expect(bici.color).toBe("verde");
            expect(bici.modelo).toBe("urbana");
            expect(bici.ubicacion[0]).toEqual(-34.6012424);
            expect(bici.ubicacion[1]).toEqual(-58.3861497);
        });
    });

    describe('Bicicleta.allBicis', () => {
        it('comienza vacía', (done) => {
            Bicicleta.allBicis().then(bicis => {
                expect(bicis.length).toBe(0);
                done();
            });
        });
    });

    describe('Bicicleta.add', () => {
        it('agrega una sola bicicleta', (done) => {
            const aBici = new Bicicleta({code: 1, color: "verde", modelo: "urbana"});
            Bicicleta.add(aBici).then(() => {
                Bicicleta.allBicis().then(bicis => {
                    expect(bicis.length).toBe(1);
                    expect(bicis[0].code).toBe(aBici.code);
                    done();
                });
            });
        });
    });

    describe('Bicicleta.findByCode', () => {
        it('debe devolver la bici con code 1', (done) => {
            const aBici = new Bicicleta({code: 1, color: "verde", modelo: "urbana"});
            Bicicleta.add(aBici).then(() => {
                const aBici2 = new Bicicleta({code: 2, color: "roja", modelo: "urbana"});
                Bicicleta.add(aBici2).then(() => {
                    Bicicleta.findByCode(1).then(targetBici => {
                        expect(targetBici.code).toBe(1);
                        expect(targetBici.color).toBe(aBici.color);
                        expect(targetBici.modelo).toBe(aBici.modelo);
                        done();
                    });
                });
            });
        });
    });
});
