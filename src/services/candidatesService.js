const db = require("../database");

const getCandidates = async (params) => {
  const { parties, region, role, vacancia, sentencias } = params;

  let arguments = [];

  let query =
    "SELECT a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.nacimiento_fecha, a.postula_distrito, a.posicion, a.enlace_foto, d.total AS ingreso_total, b.org_politica_alias, b.educacion_mayor_nivel, b.sentencias_ec_civil_cnt, b.sentencias_ec_penal_cnt, b.educacion_primaria, b.educacion_secundaria, b.educacion_superior_tecnica, b.educacion_superior_nouniversitaria, b.educacion_superior_universitaria, b.educacion_postgrado, b.experiencia_publica, c.papeletas_sat, c.licencia_conducir, c.sancion_servir_registro, c.licencia_conducir, c.deuda_sunat, c.aportes_electorales, c.sancion_servir_registro, c.procesos_electorales_participados, c.procesos_electorales_ganados, c.designado FROM candidato a, extra_data b, data_ec c, ingreso d WHERE a.hoja_vida_id = b.hoja_vida_id AND a.hoja_vida_id = c.hoja_vida_id AND a.hoja_vida_id = d.hoja_vida_id ";

  if (parties) {
    query += "AND a.org_politica_nombre IN (?) ";
    arguments.push(parties.split(","));
  }
  if (role) {
    query += "AND a.cargo_nombre LIKE ? ";
    if (role.lastIndexOf("PRESIDENTE") === 0) arguments.push(role + "%");
    else arguments.push("%" + role + "%");
  }
  if (region) {
    query += "AND a.postula_distrito = ? ";
    arguments.push(region);
  }
  if (vacancia) {
    query += "AND b.vacancia = ? ";
    arguments.push(+vacancia);
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
    throw new Error("Error al consultar la Base de Datos");
  }
};

const getCandidateByHojaDeVida = async (hoja_vida_id) => {
  let query = "SELECT * FROM candidato WHERE hoja_vida_id = ?";
  candidate = await db.query(query, hoja_vida_id);
  return {
    candidate
  };
};

const getCandidateByDNI = async (id_dni) => {
  let query = "SELECT * FROM candidato WHERE id_dni = ?";
  candidate = await db.query(query, id_dni);
  return {
    candidate
  };
};

module.exports = {
  getCandidates,
  getCandidateByHojaDeVida,
  getCandidateByDNI
};
