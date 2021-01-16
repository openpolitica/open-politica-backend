const { Schema, model } = require("mongoose");

const linksSchema = new Schema(
  {
    imagen: String,
    resumen: String,
    hoja_vida: String
  },
  { _id: false }
);

const annotationsSchema = new Schema(
  {
    anotacion_numero: String,
    expediente_numero: String,
    informe_numero: String,
    documento_numero: String,
    documento_identidad: String,
    dice: String,
    debe_decir: String
  },
  { _id: false }
);

const trajectorySchema = new Schema(
  {
    dni: String,
    eleccion: String,
    lugar: String,
    cargo: String,
    org_politica: String,
    resultado: String
  },
  { _id: false }
);

const additionalInfoSchema = new Schema(
  {
    info: String
  },
  { _id: false }
);

const assetsSchema = new Schema(
  {
    bienes_otros: { type: Array },
    bienes_muebles: { type: Array },
    bienes_inmuebles: { type: Array }
  },
  { _id: false }
);

const incomeSchema = new Schema(
  {
    remuneracion_bruta_publico: Number,
    remuneracion_bruta_privado: Number,
    renta_individual_publico: Number,
    renta_individual_privado: Number,
    otro_ingreso_publico: Number,
    otro_ingreso_privado: Number,
    total_remuneracion_bruta: Number,
    total_renta: Number,
    total_otro: Number,
    total: Number,
    total_privado: Number,
    total_publico: Number
  },
  { _id: false }
);

const judgementsCivilSchema = new Schema(
  {
    materia_sentencia: String,
    expediente_obliga: String,
    organo_judicial_obliga: String,
    fallo_obliga: String
  },
  { _id: false }
);

const judgementsCriminalSchema = new Schema(
  {
    expediente_penal: String,
    organo_judicial_penal: String,
    delito_penal: String,
    fallo_penal: String,
    modalidad: String,
    cumple_fallo: String
  },
  { _id: false }
);

const judgementsSchema = new Schema(
  {
    sentencias_penales: [judgementsCriminalSchema],
    sentencias_civiles: [judgementsCivilSchema]
  },
  { _id: false }
);

const judgementsECSchema = new Schema(
  {
    delito: String,
    procesos: Number,
    tipo: String,
    fallo: String
  },
  { _id: false }
);

const experienceWorkSchema = new Schema(
  {
    centro_trabajo: String,
    ocupacion_profesion: String,
    anio_desde: Number,
    anio_hasta: Number,
    hasta_actualidad: Boolean
  },
  { _id: false }
);

const experienceElectionsSchema = new Schema(
  {
    org_politica: String,
    cargo: String,
    anio_desde: Number,
    anio_hasta: Number,
    hasta_actualidad: Boolean
  },
  { _id: false }
);

const experiencePartySchema = new Schema(
  {
    org_politica: String,
    cargo: String,
    anio_desde: Number,
    anio_hasta: Number,
    hasta_actualidad: Boolean
  },
  { _id: false }
);

const experienceQuitSchema = new Schema(
  {
    org_politica: String,
    anio: Number
  },
  { _id: false }
);

const experienceSchema = new Schema(
  {
    laboral: [experienceWorkSchema],
    cargos_elecciones: [experienceElectionsSchema],
    cargos_partidarios: [experiencePartySchema],
    renuncias: [experienceQuitSchema]
  },
  { _id: false }
);

const educationBasicSchema = new Schema(
  {
    tiene_basica: Boolean,
    tiene_primaria: Boolean,
    primaria_concluida: Boolean,
    tiene_secundaria: Boolean,
    secundaria_concluida: Boolean
  },
  { _id: false }
);

const educationTechnicalSchema = new Schema(
  {
    centro_estudio: String,
    carrera: String,
    concluida: Boolean
  },
  { _id: false }
);

const educationNonUniversitySchema = new Schema(
  {
    centro_estudio: String,
    carrera: String,
    concluida: Boolean
  },
  { _id: false }
);

const educationUniversitySchema = new Schema(
  {
    centro_estudio: String,
    carrera: String,
    concluida: Boolean,
    bachiller: Boolean,
    titulo: Boolean
  },
  { _id: false }
);

const educationPostGraduateSchema = new Schema(
  {
    centro_estudio: String,
    especialidad: String,
    concluida: Boolean,
    egresado: Boolean
  },
  { _id: false }
);

const educationSchema = new Schema(
  {
    basica: educationBasicSchema,
    tecnica: [educationTechnicalSchema],
    no_universitaria: [educationNonUniversitySchema],
    universitaria: [educationUniversitySchema],
    postgrado: [educationPostGraduateSchema]
  },
  { _id: false }
);

const fileSchema = new Schema({
  expediente_id: Number,
  expediente_estado: String,
  tipo_eleccion_id: Number,
  expediente_codigo: String,
  expediente_codigo_padre: String,
  ubigeo: Number,
  region: String,
  provincia: String,
  distrito: String,
  org_politica_id: Number,
  org_politica_nombre: String,
  org_politica_tipo: String,
  lista_solicitud_id: Number,
  lista_solicitud_estado: String,
  jurado_electoral_id: Number,
  jurado_electoral_nombre: String,
  candidatos_hombres: Number,
  candidatos_mujeres: Number,
  ubicacion_jurado_id: Number,
  distrito_electoral: String
});

const candidateSchema = new Schema({
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
  nacimiento_ubigeo: String,
  domicilio_direccion: String,
  domicilio_ubigeo: String,
  domicilio_departamento: String,
  domicilio_provincia: String,
  domicilio_distrito: String,
  postula_ubigeo: String,
  postula_departamento: String,
  postula_provincia: String,
  postula_distrito: String,
  postula_anio: String,
  cargo_id: Number,
  cargo_nombre: String,
  candidato_id: Number,
  proceso_electoral_id: Number,
  posicion: Number,
  org_politica_id: Number,
  org_politica_nombre: String,
  estado_nombre: String,
  estado_id: Number,
  hoja_vida: String,
  enlace_foto: String,
  expediente: fileSchema,
  educacion: educationSchema,
  experiencia: experienceSchema,
  sentencias: judgementsSchema,
  ingresos: { type: Array, items: incomeSchema },
  bienes: assetsSchema,
  info_adicional: { type: Array, items: additionalInfoSchema },
  // Campos nuevos?
  vacancia: { type: Boolean },
  experiencia_publica: { type: Boolean },
  sentencias_ec: [judgementsECSchema],
  org_politica_alias: String,
  // Campos obsoletos?
  contraloria: { type: Array },
  redam: { type: Array },
  servir: { type: Array },
  trayectorias: { type: Array, items: trajectorySchema },
  revocatoria: { type: Array },
  anotaciones_marginales: { type: Array, items: annotationsSchema },
  enlaces: linksSchema
});

module.exports = model("Candidate", candidateSchema);
