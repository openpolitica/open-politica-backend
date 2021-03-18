const db = require("../database");

const getTopics = async () => {
  let query = "SELECT * FROM topico";
  let response = await db.query(query);
  return response;
};

const getQuestions = async (params) => {
  let { topics } = params;

  if (typeof topics === "string") {
    topics = [topics];
  }
  let query =
    "SELECT c.codTopico, b.codPregunta, b.pregunta, a.codRespuesta, a.respuesta FROM respuesta a INNER JOIN pregunta b ON a.codPregunta = b.codPregunta INNER JOIN topico c ON b.codTopico = c.codTopico WHERE b.codTopico IN (?)";

  const response = await db.query(query, [topics]);

  let mapped = response.reduce(function(r, a) {
    const { codTopico, codPregunta, pregunta, codRespuesta, respuesta } = a;

    r[codTopico] = r[codTopico] || [];

    idx = r[codTopico].findIndex( element => element["question"]["id"] === codPregunta )

    if (idx < 0 ) {
        r[codTopico].push({
          question: {
            id: codPregunta,
            label: pregunta
          },
          answers : [{
            id: codRespuesta,
            label: respuesta
          }]
        });
    }else{
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
  const preguntas = body.answers.map(function(value) {
    return value.questionId;
  });

  const respuestas = body.answers.map(function(value) {
    return value.answerId;
  });

  let query = `SELECT b.alias AS partido, COUNT(*) AS total FROM (SELECT * FROM partido_x_respuesta WHERE codPregunta IN (?) AND codRespuesta IN (?)) a INNER JOIN partidos_alias b GROUP BY b.alias ORDER BY total DESC`;
  let response = await db.query(query, [preguntas, respuestas]);

  let partyResults = response.reduce(function(r, a) {
    const { partido, total } = a;

    r[partido] = r[partido] || [];
    r[partido] = total;
    return r;
  }, Object.create(null));

  return partyResults;
};

module.exports = {
  getTopics,
  getQuestions,
  getPolicyResults
};
