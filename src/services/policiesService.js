const db = require("../database");

const getTopics = async () => {
  let query = "SELECT * FROM Topico";
  let response = await db.query(query);
  return response;
};

const getQuestions = async (params) => {
  let { topics } = params;

  if (typeof topics === "string") {
    topics = [topics];
  }
  let query =
    "SELECT * FROM Pregunta a JOIN Topico b WHERE a.codTopico = b.codTopico AND b.topico IN (?)";
  const response = await db.query(query, [topics]);

  let mapped = response.reduce(function (r, a) {
    const { topico, codPregunta, pregunta } = a;

    r[topico] = r[topico] || [];
    r[topico].push({
      [codPregunta]: pregunta
    });
    return r;
  }, Object.create(null));
  return mapped;
};

const getPolicyResults = async (body) => {
  const preguntas = body.candidates.map(function (value) {
    return value.questionId;
  });

  const respuestas = body.candidates.map(function (value) {
    return value.answerId;
  });

  let query = `SELECT a.partido, COUNT(*) AS total FROM (SELECT * FROM partidoxrespuesta WHERE codPregunta IN (?) AND codRespuesta IN (?)) a GROUP BY a.partido ORDER BY total DESC`;
  let response = await db.query(query, [preguntas, respuestas]);

  let partyResults = response.reduce(function (r, a) {
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
