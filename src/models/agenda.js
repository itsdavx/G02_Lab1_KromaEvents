const mongoose = require("mongoose");
const validator = require("validator");

// Hito 3 · MODELO de la colección agendas (MongoDB). El servicio lo usa: Agenda.create(data)
// El evento vive en PostgreSQL; aquí solo se guarda su id (eventoId)
const actividadSchema = new mongoose.Schema(
  {
    hora: {
      type: String,
      required: [true, "La hora de la actividad es obligatoria"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener el formato HH:MM (24 horas)"],
    },
    titulo: {
      type: String,
      required: [true, "El título de la actividad es obligatorio"],
      trim: true,
      minlength: [3, "El título de la actividad debe tener al menos 3 caracteres"],
    },
    ponenteId: { type: mongoose.Schema.Types.ObjectId, ref: "Ponente" },
  },
  { _id: false }
);

const agendaSchema = new mongoose.Schema(
  {
    eventoId: {
      type: Number,
      required: [true, "El evento es obligatorio"],
      min: [1, "El eventoId debe ser mayor o igual a 1"],
    },
    titulo: {
      type: String,
      required: [true, "El título de la agenda es obligatorio"],
      trim: true,
      minlength: [5, "El título debe tener al menos 5 caracteres"],
      maxlength: [120, "El título no puede superar los 120 caracteres"],
    },
    tipo: {
      type: String,
      required: [true, "El tipo de evento es obligatorio"],
      enum: {
        values: ["concierto", "taller", "feria", "conferencia"],
        message: "{VALUE} no es un tipo válido (concierto, taller, feria o conferencia)",
      },
    },
    edadMinima: {
      type: Number,
      default: 0,
      min: [0, "La edad mínima no puede ser negativa"],
      max: [21, "La edad mínima no puede ser mayor a 21"],
    },
    contacto: {
      type: String,
      required: [true, "El correo de contacto es obligatorio"],
      trim: true,
      lowercase: true,
      // Validación propia con la librería validator
      validate: { validator: (v) => validator.isEmail(v), message: (p) => `${p.value} no es un correo válido` },
    },
    // Embebido: las actividades se leen siempre junto con la agenda y no crecen sin límite
    actividades: {
      type: [actividadSchema],
      validate: { validator: (v) => v.length >= 1, message: "La agenda debe tener al menos una actividad" },
    },
    etiquetas: [String],
  },
  { timestamps: true, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: no se guarda en la base; se calcula con la primera y la última actividad
agendaSchema.virtual("horario").get(function () {
  if (!this.actividades?.length) return null;
  return `${this.actividades[0].hora} - ${this.actividades[this.actividades.length - 1].hora}`;
});

// Middleware de Mongoose (Mongoose 9: sin next): modifica el documento antes de validar
agendaSchema.pre("validate", function () {
  if (this.etiquetas) this.etiquetas = [...new Set(this.etiquetas.filter(Boolean).map((t) => t.trim().toLowerCase()))].filter(Boolean);
  if (this.actividades?.length) this.actividades.sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
});

module.exports = mongoose.model("Agenda", agendaSchema, "agendas");
