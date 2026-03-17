require("newrelic");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Configuración de MongoDB
const MONGO_URI = process.env.NODE_ENV === "production" ? process.env.MONGO_URI : "mongodb://localhost:27017/mi_proyecto_local";

mongoose.connect(MONGO_URI)
  .then(() => console.log(`Conectado a MongoDB: ${MONGO_URI}`))
  .catch(err => console.error("Error conectando a MongoDB:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "mi_secreto_super_seguro",
  resave: false,
  saveUninitialized: false
}));

// Inicializar Passport
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Configuración de vistas y archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Rutas
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/auth", require("./routes/auth"));
app.use("/api/bicicletas", require("./routes/bicicletas"));
app.use("/", require("./routes/index"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});
