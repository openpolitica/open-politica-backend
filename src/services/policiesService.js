const db = require("../database");

const getTopics = async () => {
  let query = "SELECT * FROM topico";
  let response = await db.query(query);
  return response;
};

const isKeyInArray = (key,array) => {
    for ( i in array ){
      if( key in i.keys){
        return true
      }
    }
  return false;
}
const getQuestions = async (params) => {
  let { topics } = params;

  if (typeof topics === "string") {
    topics = [topics];
  }
  let query =
    "SELECT c.topico, b.codPregunta, b.pregunta, a.codRespuesta, a.respuesta FROM respuesta a INNER JOIN pregunta b ON a.codPregunta = b.codPregunta INNER JOIN topico c ON b.codTopico = c.codTopico WHERE b.codTopico IN (?)";

  const response = await db.query(query, [topics]);

  let mapped = response.reduce(function(r, a) {
    const { topico, codPregunta, pregunta, codRespuesta, respuesta } = a;

    r[topico] = r[topico] || [];

    if (isKeyInArray(codPregunta,r[topico])){
        r[topico]["respuestas"].push(
          {
            [codRespuesta]:respuesta
          }
        )
    }else{
        r[topico].push({
          [codPregunta]: pregunta,
          respuestas : []
        });
        r[topico]["respuestas"].push({
            [codRespuesta]:respuesta
        })
    }

    return r;
  }, Object.create(null));
  return mapped;
};

const getPolicyResults = async (body) => {
  const preguntas = body.candidates.map(function(value) {
    return value.questionId;
  });

  const respuestas = body.candidates.map(function(value) {
    return value.answerId;
  });

  let query = `SELECT a.partido, COUNT(*) AS total FROM (SELECT * FROM partido_x_respuesta WHERE codPregunta IN (?) AND codRespuesta IN (?)) a GROUP BY a.partido ORDER BY total DESC`;
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
