const db = require("../database");

const getTopics = async () => {
  let query = "SELECT * FROM topico";
  let response = await db.query(query);
  return response;
};

const getQuestions = async (params) => {
  if (params.topics.length < 3) {
    const error = new Error("Se requiere al menos 3 tópicos seleccionados.");
    error.statusCode = 400;
    throw error;
  }

  let { topics } = params;

  if (typeof topics === "string") {
    topics = [topics];
  }
  let query =
    "SELECT c.codTopico, b.codPregunta, b.pregunta, a.codRespuesta, a.respuesta FROM respuesta a INNER JOIN pregunta b ON a.codPregunta = b.codPregunta INNER JOIN topico c ON b.codTopico = c.codTopico WHERE b.codTopico IN (?)";

  const response = await db.query(query, [topics]);

  let mapped = response.reduce(function (r, a) {
    const { codTopico, codPregunta, pregunta, codRespuesta, respuesta } = a;

    r[codTopico] = r[codTopico] || [];

    idx = r[codTopico].findIndex(element => element["question"]["id"] === codPregunta)

    if (idx < 0) {
      r[codTopico].push({
        question: {
          id: codPregunta,
          label: pregunta
        },
        answers: [{
          id: codRespuesta,
          label: respuesta
        }]
      });
    } else {
      r[codTopico][idx]["answers"].push(
        {
          id: codRespuesta,
          label: respuesta
        }
      );
    }

    return r;
  }, Object.create(null));
  return mapped;
};

const getPolicyResults = async (body) => {
  const arrayPreguntas = body.answers.map(function (value) {
    return [value.questionId, value.answerId];
  });

  let query = `SELECT a.org_politica_id, a.nombre, a.alias, count(*) AS total FROM (SELECT a.*, b.alias, b.nombre FROM partido_x_respuesta a, partidos_alias b WHERE (codPregunta, codRespuesta) IN (VALUES ?) AND a.org_politica_id = b.id) a GROUP BY a.org_politica_id ORDER BY total DESC`;


  let responsePreguntaPartido = await db.query(query, [arrayPreguntas]);

  let queryPresidentes = "SELECT hoja_vida_id, id_nombres, id_apellido_paterno, id_apellido_materno, id_sexo, enlace_foto, cargo_id, cargo_nombre, org_politica_id, org_politica_nombre FROM candidato WHERE cargo_nombre LIKE '%PRESIDENTE%'";
  let responsePresidentes = await db.query(queryPresidentes);

  const obtainPresidentByCargoId = function (cargoId, item) {
    return responsePresidentes.find((candidato) => item.org_politica_id === candidato.org_politica_id && candidato.cargo_id === cargoId);
  }

  let results = responsePreguntaPartido.map((item, index) => {
    return {
      name: item.alias,
      org_politica_id: item.org_politica_id,
      org_politica_nombre: item.nombre,
      compatibility: (item.total / arrayPreguntas.length).toFixed(2),
      president: obtainPresidentByCargoId(1, item),
      firstVP: obtainPresidentByCargoId(2, item),
      secondVP: obtainPresidentByCargoId(3, item)
    }
  });

  return results;
};

module.exports = {
  getTopics,
  getQuestions,
  getPolicyResults
};
