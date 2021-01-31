const db = require("../database");

const getCandidates = async (params) => {
  const { parties, region, role, vacancia, sentencias } = params;

  let arguments = [];

  let query =
    "SELECT a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.nacimiento_fecha, a.postula_distrito, a.posicion, a.enlace_foto, d.total AS ingreso_total, a.org_politica_nombre, b.org_politica_alias, b.educacion_mayor_nivel, b.sentencias_ec_civil_cnt, b.sentencias_ec_penal_cnt, b.educacion_primaria, b.educacion_secundaria, b.educacion_superior_tecnica, b.educacion_superior_nouniversitaria, b.educacion_superior_universitaria, b.educacion_postgrado, b.experiencia_publica, c.papeletas_sat, c.licencia_conducir, c.sancion_servir_registro, c.licencia_conducir, c.deuda_sunat, c.aportes_electorales, c.sancion_servir_registro, c.procesos_electorales_participados, c.procesos_electorales_ganados, c.designado FROM candidato a, extra_data b, data_ec c, ingreso d WHERE a.hoja_vida_id = b.hoja_vida_id AND a.hoja_vida_id = c.hoja_vida_id AND a.hoja_vida_id = d.hoja_vida_id ";

  if (parties) {
    query += "AND a.org_politica_nombre IN (?) ";
    arguments.push(parties.split(","));
  }
  if (role) {
    query += "AND a.cargo_nombre LIKE ? ";
    if (role === "CONGRESISTA") arguments.push("%" + role + "%");
    else arguments.push(role + "%");
  }
  if (region) {
    query += "AND a.postula_distrito = ? ";
    arguments.push(region);
  }
  if (vacancia) {
    query += "AND b.vacancia = ? ";
    arguments.push(vacancia ? 1 : 0);
  }

  let candidates = [];
  if (sentencias === "false") {
    query += "AND b.sentencias_ec_civil_cnt + b.sentencias_ec_penal_cnt = 0";
  } else if (sentencias === "true") {
    query += "AND b.sentencias_ec_civil_cnt + b.sentencias_ec_penal_cnt > 0";
  }

  try {
    candidates = await db.query(query, arguments);
    return {
      candidates
    };
  } catch (error) {
    throw new Error("Error al consultar los candidatos");
  }
};

const getCandidateByHojaDeVida = async (hoja_vida_id) => {
  let query_candidate =
    "SELECT a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.nacimiento_fecha, a.nacimiento_departamento, a.cargo_nombre, a.postula_distrito, a.posicion, a.enlace_foto, d.total AS ingreso_total, d.total_privado AS ingreso_total_privado, d.total_publico AS ingreso_total_publico, a.org_politica_nombre, b.org_politica_alias, b.educacion_mayor_nivel, b.sentencias_ec_civil_cnt, b.sentencias_ec_penal_cnt, b.educacion_primaria, b.educacion_secundaria, b.educacion_superior_tecnica, b.educacion_superior_nouniversitaria, b.educacion_superior_universitaria, b.educacion_postgrado, b.experiencia_publica, c.papeletas_sat, c.licencia_conducir, c.sancion_servir_registro, c.licencia_conducir, c.deuda_sunat, c.aportes_electorales, c.sancion_servir_registro, c.procesos_electorales_participados, c.procesos_electorales_ganados, c.designado FROM candidato a, extra_data b, data_ec c, ingreso d WHERE a.hoja_vida_id = ? AND a.hoja_vida_id = b.hoja_vida_id AND a.hoja_vida_id = c.hoja_vida_id AND a.hoja_vida_id = d.hoja_vida_id ";

  let query_education = "SELECT * FROM educacion WHERE hoja_vida_id = ?";

  let query_experience = "SELECT * FROM experiencia WHERE hoja_vida_id = ?";

  let query_bienes_muebles = "SELECT * FROM bien_mueble WHERE hoja_vida_id = ?";

  let query_bienes_inmuebles =
    "SELECT * FROM bien_inmueble WHERE hoja_vida_id = ?";

  let query_judgements = "SELECT * FROM sentencias_ec WHERE hoja_vida_id = ?";

  candidate = await db.query(query_candidate, hoja_vida_id);
  education = await db.query(query_education, hoja_vida_id);
  experience = await db.query(query_experience, hoja_vida_id);
  bienes_muebles = await db.query(query_bienes_muebles, hoja_vida_id);
  bienes_inmuebles = await db.query(query_bienes_inmuebles, hoja_vida_id);
  judgements = await db.query(query_judgements, hoja_vida_id);

  return {
    candidate,
    education,
    experience,
    bienes_muebles,
    bienes_inmuebles,
    judgements
  };
};

const getCandidateByDNI = async (id_dni) => {
  let query_candidate =
    "SELECT a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.nacimiento_fecha, a.nacimiento_departamento, a.cargo_nombre, a.postula_distrito, a.posicion, a.enlace_foto, d.total AS ingreso_total, d.total_privado AS ingreso_total_privado, d.total_publico AS ingreso_total_publico, a.org_politica_nombre, b.org_politica_alias, b.educacion_mayor_nivel, b.sentencias_ec_civil_cnt, b.sentencias_ec_penal_cnt, b.educacion_primaria, b.educacion_secundaria, b.educacion_superior_tecnica, b.educacion_superior_nouniversitaria, b.educacion_superior_universitaria, b.educacion_postgrado, b.experiencia_publica, c.papeletas_sat, c.licencia_conducir, c.sancion_servir_registro, c.licencia_conducir, c.deuda_sunat, c.aportes_electorales, c.sancion_servir_registro, c.procesos_electorales_participados, c.procesos_electorales_ganados, c.designado FROM candidato a, extra_data b, data_ec c, ingreso d WHERE a.id_dni = ? AND a.hoja_vida_id = b.hoja_vida_id AND a.hoja_vida_id = c.hoja_vida_id AND a.hoja_vida_id = d.hoja_vida_id ";

  let query_education =
    "SELECT e.* FROM educacion e INNER JOIN candidato c ON c.hoja_vida_id = e.hoja_vida_id WHERE c.id_dni = ?";

  let query_experience =
    "SELECT e.* FROM experiencia e INNER JOIN candidato c ON c.hoja_vida_id = e.hoja_vida_id WHERE c.id_dni = ?";

  let query_bienes_muebles =
    "SELECT e.* FROM bien_mueble e INNER JOIN candidato c ON c.hoja_vida_id = e.hoja_vida_id WHERE c.id_dni = ?";

  let query_bienes_inmuebles =
    "SELECT e.* FROM bien_inmueble e INNER JOIN candidato c ON c.hoja_vida_id = e.hoja_vida_id WHERE c.id_dni = ?";

  let query_judgements =
    "SELECT e.* FROM sentencias_ec e INNER JOIN candidato c ON c.hoja_vida_id = e.hoja_vida_id WHERE c.id_dni = ?";

  candidate = await db.query(query_candidate, id_dni);
  education = await db.query(query_education, id_dni);
  experience = await db.query(query_experience, id_dni);
  bienes_muebles = await db.query(query_bienes_muebles, id_dni);
  bienes_inmuebles = await db.query(query_bienes_inmuebles, id_dni);
  judgements = await db.query(query_judgements, id_dni);

  return {
    candidate,
    education,
    experience,
    bienes_muebles,
    bienes_inmuebles,
    judgements
  };
};

module.exports = {
  getCandidates,
  getCandidateByHojaDeVida,
  getCandidateByDNI
};
