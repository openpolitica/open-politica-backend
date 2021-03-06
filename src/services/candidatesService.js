const db = require("../database");

const getCandidates = async (params) => {
  const { parties, region, role, vacancia, sentencias } = params;

  let arguments = [];

  let query =
    'SELECT a.hoja_vida_id, a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.nacimiento_fecha, a.postula_distrito, a.posicion, a.enlace_foto, d.total AS ingreso_total, a.org_politica_nombre, e.alias AS org_politica_alias, b.educacion_mayor_nivel, b.sentencias_ec_civil_cnt, b.sentencias_ec_penal_cnt, b.educacion_primaria, b.educacion_secundaria, b.educacion_superior_tecnica, b.educacion_superior_nouniversitaria, b.educacion_superior_universitaria, b.educacion_postgrado, b.experiencia_publica, b.experiencia_privada, c.papeletas_sat, c.licencia_conducir, c.sancion_servir_registro, c.licencia_conducir, c.deuda_sunat, c.aportes_electorales, c.sancion_servir_registro, c.procesos_electorales_participados, c.procesos_electorales_ganados, IF(a.candidato_designado > 0, "Sí", "No") as designado FROM candidato a LEFT JOIN extra_data b ON a.hoja_vida_id = b.hoja_vida_id LEFT JOIN data_ec c ON a.hoja_vida_id = c.hoja_vida_id LEFT JOIN ingreso d ON a.hoja_vida_id = d.hoja_vida_id LEFT JOIN partidos_alias e ON a.org_politica_id = e.id WHERE a.hoja_vida_id IS NOT NULL ';

  if (parties) {
    query += "AND a.org_politica_nombre IN (?) ";
    arguments.push(parties.split(","));
  }

  if (role) {
    query += "AND a.cargo_nombre LIKE ? ";
    if (role === "CONGRESISTA") arguments.push("%" + role + "%");
    else if (role === "PARLAMENTO ANDINO") arguments.push("%" + role);
    else arguments.push(role + "%");
  }

  if (region) {
    query += "AND a.postula_distrito = ? ";
    arguments.push(region);
  }

  let queryUpdateVacancyCount = "";

  if (vacancia && vacancia === "false") {
    query += "AND b.vacancia = ? ";
    arguments.push(0);
    queryUpdateVacancyCount =
      "UPDATE locations SET no_vacancia = no_vacancia + 1 WHERE location = ?";
  } else {
    arguments.push(1);
    queryUpdateVacancyCount =
      "UPDATE locations SET si_vacancia = si_vacancia + 1 WHERE location = ?";
  }

  let candidates = [];

  if (sentencias === "false") {
    query += "AND b.sentencias_ec_penal_cnt = 0";
  } else if (sentencias === "true") {
    query += "AND b.sentencias_ec_penal_cnt > 0";
  }

  query += ` ORDER BY e.orden_cedula ASC, a.posicion ASC;`;

  try {
    candidates = await db.query(query, arguments);

    if (region) {
      await db.query(
        "UPDATE locations SET apicounts = apicounts + 1 WHERE location = ?",
        region
      );
      if (queryUpdateVacancyCount)
        await db.query(queryUpdateVacancyCount, region);
    }

    return {
      candidates,
    };
  } catch (error) {
    throw new Error("Error al consultar los candidatos");
  }
};

const getCandidateByHojaDeVida = async (hoja_vida_id) => {
  let query_candidate =
    'SELECT a.hoja_vida_id, a.id_dni, a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.nacimiento_fecha, a.nacimiento_provincia, a.nacimiento_departamento, a.nacimiento_pais, a.domicilio_distrito, a.domicilio_provincia, a.domicilio_departamento, a.cargo_nombre, a.postula_distrito, a.posicion, a.enlace_foto, d.total AS ingreso_total, d.total_privado AS ingreso_total_privado, d.total_publico AS ingreso_total_publico, a.org_politica_id, a.org_politica_nombre, e.alias AS org_politica_alias, b.educacion_mayor_nivel, b.sentencias_ec_civil_cnt, b.sentencias_ec_penal_cnt, b.educacion_primaria, b.educacion_secundaria, b.educacion_superior_tecnica, b.educacion_superior_nouniversitaria, b.educacion_superior_universitaria, b.educacion_postgrado, b.experiencia_publica, b.experiencia_privada, b.bienes_muebles_valor, b.bienes_inmuebles_valor, c.papeletas_sat, c.licencia_conducir, c.sancion_servir_registro, c.licencia_conducir, c.deuda_sunat, c.aportes_electorales, c.sancion_servir_registro, c.procesos_electorales_participados, c.procesos_electorales_ganados, IF(a.candidato_designado > 0, "Sí", "No") as designado FROM candidato a LEFT JOIN extra_data b ON a.hoja_vida_id = b.hoja_vida_id LEFT JOIN data_ec c ON a.hoja_vida_id = c.hoja_vida_id LEFT JOIN ingreso d ON a.hoja_vida_id = d.hoja_vida_id LEFT JOIN partidos_alias e ON a.org_politica_id = e.id WHERE a.hoja_vida_id = ?';

  let query_education = "SELECT * FROM educacion WHERE hoja_vida_id = ?";

  let query_experience = "SELECT * FROM experiencia WHERE hoja_vida_id = ?";

  let query_bienes_muebles = "SELECT * FROM bien_mueble WHERE hoja_vida_id = ?";

  let query_bienes_inmuebles =
    "SELECT * FROM bien_inmueble WHERE hoja_vida_id = ?";

  let query_judgements = "SELECT * FROM sentencias_ec WHERE hoja_vida_id = ?";

  let query_afiliations =
    "SELECT a.org_politica, a.afiliacion_inicio, a.afiliacion_cancelacion FROM afiliacion a INNER JOIN candidato c ON a.dni = c.id_dni  WHERE a.vigente = 0 and c.org_politica_nombre != a.org_politica AND c.hoja_vida_id = ?";

  let query_redes_sociales =
    "SELECT * FROM redes_sociales WHERE hoja_vida_id = ?";

  candidate = await db.query(query_candidate, hoja_vida_id);
  education = await db.query(query_education, hoja_vida_id);
  experience = await db.query(query_experience, hoja_vida_id);
  bienes_muebles = await db.query(query_bienes_muebles, hoja_vida_id);
  bienes_inmuebles = await db.query(query_bienes_inmuebles, hoja_vida_id);
  judgements = await db.query(query_judgements, hoja_vida_id);
  afiliations = await db.query(query_afiliations, hoja_vida_id);
  redes_sociales = await db.query(query_redes_sociales, hoja_vida_id);

  return {
    ...candidate[0],
    education,
    experience,
    bienes_muebles,
    bienes_inmuebles,
    judgements,
    afiliations,
    ...redes_sociales[0],
  };
};

const getCandidateByDNI = async (id_dni) => {
  let query_candidate =
    'SELECT a.hoja_vida_id, a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.nacimiento_fecha, a.nacimiento_provincia, a.nacimiento_departamento, a.nacimiento_pais, a.domicilio_distrito, a.domicilio_provincia, a.domicilio_departamento, a.cargo_nombre, a.postula_distrito, a.posicion, a.enlace_foto, d.total AS ingreso_total, d.total_privado AS ingreso_total_privado, d.total_publico AS ingreso_total_publico, a.org_politica_id, a.org_politica_nombre, e.alias AS org_politica_alias, b.educacion_mayor_nivel, b.sentencias_ec_civil_cnt, b.sentencias_ec_penal_cnt, b.educacion_primaria, b.educacion_secundaria, b.educacion_superior_tecnica, b.educacion_superior_nouniversitaria, b.educacion_superior_universitaria, b.educacion_postgrado, b.experiencia_publica, b.experiencia_privada, b.bienes_muebles_valor, b.bienes_inmuebles_valor, c.papeletas_sat, c.licencia_conducir, c.sancion_servir_registro, c.licencia_conducir, c.deuda_sunat, c.aportes_electorales, c.sancion_servir_registro, c.procesos_electorales_participados, c.procesos_electorales_ganados, IF(a.candidato_designado > 0, "Sí", "No") as designado FROM candidato a LEFT JOIN extra_data b ON a.hoja_vida_id = b.hoja_vida_id LEFT JOIN data_ec c ON a.hoja_vida_id = c.hoja_vida_id LEFT JOIN ingreso d ON a.hoja_vida_id = d.hoja_vida_id LEFT JOIN partidos_alias e ON a.org_politica_id = e.id WHERE a.id_dni = ?';

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

  let query_afiliations =
    "SELECT a.org_politica, a.afiliacion_inicio, a.afiliacion_cancelacion FROM afiliacion a INNER JOIN candidato c ON a.dni = c.id_dni  WHERE a.vigente = 0 and c.org_politica_nombre != a.org_politica AND c.id_dni = ?";

  let query_redes_sociales =
    "SELECT e.* FROM redes_sociales e INNER JOIN candidato c ON c.hoja_vida_id = e.hoja_vida_id WHERE c.id_dni = ?";

  candidate = await db.query(query_candidate, id_dni);
  education = await db.query(query_education, id_dni);
  experience = await db.query(query_experience, id_dni);
  bienes_muebles = await db.query(query_bienes_muebles, id_dni);
  bienes_inmuebles = await db.query(query_bienes_inmuebles, id_dni);
  judgements = await db.query(query_judgements, id_dni);
  afiliations = await db.query(query_afiliations, id_dni);
  redes_sociales = await db.query(query_redes_sociales, id_dni);

  return {
    ...candidate[0],
    education,
    experience,
    bienes_muebles,
    bienes_inmuebles,
    judgements,
    afiliations,
    ...redes_sociales[0],
  };
};

const getCandidatesCount = async (params) => {
  const { role } = params;

  let arguments = [];

  let query = "SELECT COUNT(*) as count FROM candidato ";

  if (role) {
    query += "WHERE cargo_nombre LIKE ? ";
    if (role === "CONGRESISTA") arguments.push("%" + role + "%");
    else if (role === "PARLAMENTO ANDINO") arguments.push("%" + role);
    else arguments.push(role + "%");
  }

  let count = [];

  try {
    count = await db.query(query, arguments);
    return count[0];
  } catch (error) {
    throw new Error("Error al consultar los candidatos");
  }
};

module.exports = {
  getCandidates,
  getCandidateByHojaDeVida,
  getCandidateByDNI,
  getCandidatesCount,
};
