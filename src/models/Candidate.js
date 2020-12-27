const mongoose = require("mongoose");

const linksSchema = new mongoose.Schema(
  {
    imagen: String,
    resumen: String,
    hoja_vida: String,
  },
  { _id: false }
);

const annotationsSchema = new mongoose.Schema(
  {
    anotacion_numero: String,
    expediente_numero: String,
    informe_numero: String,
    documento_numero: String,
    documento_identidad: String,
    dice: String,
    debe_decir: String,
  },
  { _id: false }
);

const trajectorySchema = new mongoose.Schema(
  {
    dni: String,
    eleccion: String,
    lugar: String,
    cargo: String,
    org_politica: String,
    resultado: String,
  },
  { _id: false }
);

const additionalInfoSchema = new mongoose.Schema(
  {
    info: String,
  },
  { _id: false }
);

const assetsSchema = new mongoose.Schema(
  {
    bienes_otros: { type: Array },
    bienes_muebles: { type: Array },
    bienes_inmuebles: { type: Array },
  },
  { _id: false }
);

const incomeSchema = new mongoose.Schema(
  {
    remuneracion_bruta_publico: String,
    remuneracion_bruta_privado: String,
    renta_individual_publico: String,
    renta_individual_privado: String,
    otro_ingreso_publico: String,
    otro_ingreso_privado: String,
    total_remuneracion_bruta: String,
    total_renta: String,
    total_otro: String,
    total: String,
    total_privado: String,
    total_publico: String,
  },
  { _id: false }
);

const judgementsCivilSchema = new mongoose.Schema(
  {
    materia_sentencia: String,
    expediente_obliga: String,
    organo_judicial_obliga: String,
    fallo_obliga: String,
  },
  { _id: false }
);

const judgementsCriminalSchema = new mongoose.Schema(
  {
    expediente_penal: String,
    organo_judicial_penal: String,
    delito_penal: String,
    fallo_penal: String,
    modalidad: String,
    cumple_fallo: String,
  },
  { _id: false }
);

const judgementsSchema = new mongoose.Schema(
  {
    sentencias_penales: [judgementsCriminalSchema],
    sentencias_civiles: [judgementsCivilSchema],
  },
  { _id: false }
);

const experienceWorkSchema = new mongoose.Schema(
  {
    centro_trabajo: String,
    ocupacion_profesion: String,
    anio_desde: Number,
    anio_hasta: Number,
    hasta_actualidad: Boolean,
  },
  { _id: false }
);

const experienceElectionsSchema = new mongoose.Schema(
  {
    org_politica: String,
    cargo: String,
    anio_desde: Number,
    anio_hasta: Number,
    hasta_actualidad: Boolean,
  },
  { _id: false }
);

const experiencePartySchema = new mongoose.Schema(
  {
    org_politica: String,
    cargo: String,
    anio_desde: Number,
    anio_hasta: Number,
    hasta_actualidad: Boolean,
  },
  { _id: false }
);

const experienceQuitSchema = new mongoose.Schema(
  {
    org_politica: String,
    anio: Number,
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    laboral: [experienceWorkSchema],
    cargos_elecciones: [experienceElectionsSchema],
    cargos_partidarios: [experiencePartySchema],
    renuncias: [experienceQuitSchema],
  },
  { _id: false }
);

const educationBasicSchema = new mongoose.Schema(
  {
    tiene_basica: Boolean,
    tiene_primaria: Boolean,
    primaria_concluida: Boolean,
    tiene_secundaria: Boolean,
    secundaria_concluida: Boolean,
  },
  { _id: false }
);

const educationTechnicalSchema = new mongoose.Schema(
  {
    centro_estudio: String,
    carrera: String,
    concluida: Boolean,
  },
  { _id: false }
);

const educationNonUniversitySchema = new mongoose.Schema(
  {
    centro_estudio: String,
    carrera: String,
    concluida: Boolean,
  },
  { _id: false }
);

const educationUniversitySchema = new mongoose.Schema(
  {
    centro_estudio: String,
    carrera: String,
    concluida: Boolean,
    bachiller: Boolean,
    titulo: Boolean,
  },
  { _id: false }
);

const educationPostGraduateSchema = new mongoose.Schema(
  {
    centro_estudio: String,
    especialidad: String,
    concluida: Boolean,
    egresado: Boolean,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    basica: educationBasicSchema,
    tecnica: [educationTechnicalSchema],
    no_universitaria: [educationNonUniversitySchema],
    universitaria: [educationUniversitySchema],
    postgrado: [educationPostGraduateSchema],
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema({
  hoja_vida_id: Number,
  id_dni: Object,
  id_ce: Object,
  id_nombres: String,
  id_apellido_paterno: String,
  id_apellido_materno: String,
  id_sexo: String,
  nacimiento_fecha: String,
  nacimiento_pais: String,
  nacimiento_departamento: String,
  nacimiento_provincia: String,
  nacimiento_distrito: String,
  postula_ubigeo: String,
  postula_departamento: String,
  postula_provincia: String,
  postula_distrito: String,
  cargo_id: Number,
  cargo_nombre: String,
  org_politica_id: Number,
  org_politica_nombre: String,
  educacion: educationSchema,
  experiencia: experienceSchema,
  sentencias: judgementsSchema,
  ingresos: { type: Array, items: incomeSchema },
  bienes: assetsSchema,
  info_adicional: { type: Array, items: additionalInfoSchema },
  contraloria: { type: Array },
  redam: { type: Array },
  servir: { type: Array },
  trayectorias: { type: Array, items: trajectorySchema },
  revocatoria: { type: Array },
  vacancia: { type: Array },
  anotaciones_marginales: { type: Array, items: annotationsSchema },
  enlaces: linksSchema,
});

mongoose.model("Candidate", candidateSchema);
