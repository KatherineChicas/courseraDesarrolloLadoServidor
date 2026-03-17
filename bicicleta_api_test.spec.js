const mongoose = require('mongoose');
const request = require('request');
const Bicicleta = require('../../models/Bicicleta');
const app = require('../../app');
const http = require('http');

const base_url = "http://localhost:3001/api/bicicletas";
let server;

describe('Bicicleta API', () => {
    beforeAll((done) => {
        process.env.NODE_ENV = 'test';
        const mongoDB = 'mongodb://localhost:27017/testdb_api';
        mongoose.connect(mongoDB);
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function() {
            console.log('We are connected to test database!');
            server = http.createServer(app);
            server.listen(3001, () => {
                console.log('Test server running on port 3001');
                done();
            });
        });
    });

    afterEach((done) => {
        Bicicleta.deleteMany({}, function(err, success) {
            if (err) console.log(err);
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {
            mongoose.disconnect(done);
        });
    });

    describe('GET BICICLETAS /', () => {
        it('Status 200', (done) => {
            request.get(base_url, (error, response, body) => {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
    });

    describe('POST BICICLETAS /create', () => {
        it('Status 201', (done) => {
            const headers = {'content-type': 'application/json'};
            const aBici = '{"code": 10, "color": "rojo", "modelo": "urbana", "lat": -34, "lng": -54}';
            request.post({
                headers: headers,
                url: base_url + '/create',
                body: aBici
            }, (error, response, body) => {
                expect(response.statusCode).toBe(201);
                Bicicleta.findByCode(10).then(bici => {
                    expect(bici.color).toBe("rojo");
                    done();
                });
            });
        });
    });

    // Nota: Para simplificar, estos tests asumen que la API no requiere JWT para las pruebas locales
    // o que se maneja un bypass para el entorno de test.
});
