/*
 * Laboratorio 3 · Mini-API MVC con CRUD
 * Desarrollo Web Avanzado (A0R04) · ESPE
 * Grupo: G02 · Emprendimiento: KromaEvents
 * Integrantes: Bonilla Caiza David Alejandro,
 *              Villa Andrango José Daniel,
 *              Quiroz Herrera María Laura,
 *              Sánchez Verduga Julio Esteban
 * NRC: 36878 · Fecha: 19/10/2026
 */
const express = require("express");
const routes = require("./routes");
const logger = require("./middlewares/logger");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middlewares globales: el logger va primero para registrar también las peticiones con JSON mal formado
app.use(logger);
app.use(express.json());

// Rutas de la API bajo /api
app.get("/", (req, res) => res.json({ api: "Lab 3 · KromaEvents API", estado: "ok" }));
app.use("/api", routes);

// Ruta inexistente y manejo de errores (deben ir al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
