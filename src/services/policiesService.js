const db = require("../database");
const { shuffle, groupObjectListByKey } = require("../utils/utilFunctions")

const getTopics = async () => {
  let query = "SELECT * FROM topico";
  let response = await db.query(query);
  return response;
};

const getQuestions = async (params) => {
  if (params.topics.length < 1) {
    const error = new Error("Se requiere al menos 1 tópico seleccionado.");
    error.statusCode = 400;
    throw error;
  }

  let { topics } = params;

  if (typeof topics === "string") {
    topics = [topics];
  }
  let query =
    "SELECT c.codTopico, b.codPregunta, b.pregunta, b.isMultiple, a.codRespuesta, a.respuesta, a.forceSingle FROM respuesta a INNER JOIN pregunta b ON a.codPregunta = b.codPregunta INNER JOIN topico c ON b.codTopico = c.codTopico WHERE b.codTopico IN (?)";

  const response = await db.query(query, [topics]);

  let mapped = response.reduce(function (r, a) {
    const {
      codTopico,
      codPregunta,
      pregunta,
      isMultiple,
      codRespuesta,
      respuesta,
      forceSingle
    } = a;

    r[codTopico] = r[codTopico] || [];

    idx = r[codTopico].findIndex(
      (element) => element["question"]["id"] === codPregunta
    );

    if (idx < 0) {
      r[codTopico].push({
        question: {
          id: codPregunta,
          label: pregunta,
          isMultiple
        },
        answers: [
          {
            id: codRespuesta,
            label: respuesta,
            forceSingle
          }
        ]
      });
    } else {
      r[codTopico][idx]["answers"].push({
        id: codRespuesta,
        label: respuesta,
        forceSingle
      });
    }

    return r;
  }, Object.create(null));

  for (topic in mapped) {
    mapped[topic].forEach((item, index) => {
      mapped[topic][index]["answers"] = shuffle(
        mapped[topic][index]["answers"]
      );
    });
  }

  return mapped;
};

const getPolicyResults = async (body) => {
  let questions = [];
  let arrayPreguntas = [];
  body.answers.forEach(function (value) {
    if (value.answerId === null && value.answers.length > 0) {
      //Pregunta múltiple
      //answers: ['a', 'b']
      value.answers.forEach((answer) => arrayPreguntas.push([value.questionId, answer]));
    } else if (value.answers === null && !!value.answerId) {
      //Pregunta única
      //answers: null
      //answerId: 'c'
      arrayPreguntas.push([value.questionId, value.answerId]);
    }
  });

  console.log(arrayPreguntas);

  //Validates if the response only has max. 2 answers by question
  questions.forEach((item) => {
    if (questions.filter(questionItem => questionItem === item).length > 2) {
      const error = new Error("No está permitido más de 2 respuestas por pregunta.");
      error.statusCode = 400;
      throw error;
    }
  });

  //List of parties obtained based on questions answered without agrupation and counting
  let queryQuestionsTopics = `SELECT a.*, c.codTopico, b.alias, b.orden_cedula, b.nombre FROM partido_x_respuesta a, partidos_alias b, pregunta c WHERE (a.codPregunta, a.codRespuesta) IN (VALUES ?) AND a.org_politica_id = b.id AND a.codPregunta = c.codPregunta ORDER BY c.codTopico, a.codPregunta`;

  let responseQuestionsTopics = await db.query(queryQuestionsTopics, [arrayPreguntas]);

  //Object with the count of items by topic
  //Ex: { health: 2, education: 3}
  let topicCounter = {};

  //Helper array used to count the number of questions based on its topic
  let questionsCounterHelper = [];

  //Main array where counting and grouping for every political party is added based on the first response (responseQuestionsTopics) obtained
  let partyCountList = [];

  responseQuestionsTopics.forEach((item) => {
    if (partyCountList.some(itemList => itemList.org_politica_id === item.org_politica_id && itemList.codTopico === item.codTopico)) {
      let indexPartyFounded = partyCountList.findIndex(itemList => itemList.org_politica_id === item.org_politica_id && itemList.codTopico === item.codTopico);

      if (questions.filter(questionItem => item.codPregunta === questionItem).length > 1) {
        partyCountList[indexPartyFounded].total += 0.5;
      } else {
        partyCountList[indexPartyFounded].total++;
      }
    } else {
      let initialCounter = 0;

      if (questions.filter(questionItem => item.codPregunta === questionItem).length > 1) {
        initialCounter = 0.5;
      } else {
        initialCounter = 1;
      }

      partyCountList.push({
        org_politica_id: item.org_politica_id,
        orden_cedula: item.orden_cedula,
        codTopico: item.codTopico,
        nombre: item.nombre,
        alias: item.alias,
        total: initialCounter
      })
    }

    //Count the number of questions by topic and save it in the topicCounter variable
    if (!questionsCounterHelper.includes(item.codPregunta)) {
      questionsCounterHelper.push(item.codPregunta);
      topicCounter[item.codTopico] ? topicCounter[item.codTopico]++ : topicCounter[item.codTopico] = 1;
      topicCounter["total"] ? topicCounter["total"]++ : topicCounter["total"] = 1;
    }
  });

  //Group the array of parties count based on the "codTopico" key
  let groupedCountRespuestas = groupObjectListByKey(partyCountList, "codTopico");

  //The variable partyList will have a list of parties removing the duplicate entries because the topic agroupation on partyCountList
  //Ex: partyCountList : [{ alias: 'Fuerza Popular', codTopico: 'health', total: 3.5, ...}, { alias: 'Fuerza Popular', codTopico: 'education', total: 2, ...}]
  // partyList: [ alias: 'Fuerza Popular', codTopico: 'health', ...}]
  let partyList = [];

  partyCountList.forEach((item) => {
    if (!partyList.some(itemList => itemList.org_politica_id === item.org_politica_id)) {
      partyList.push({
        org_politica_id: item.org_politica_id,
        orden_cedula: item.orden_cedula,
        nombre: item.nombre,
        alias: item.alias
      })
    }
  })

  let queryPresidentes = "SELECT hoja_vida_id, id_nombres, id_apellido_paterno, id_apellido_materno, id_sexo, enlace_foto, cargo_id, cargo_nombre, org_politica_id, org_politica_nombre FROM candidato WHERE cargo_nombre LIKE '%PRESIDENTE%'";

  let responsePresidentes = await db.query(queryPresidentes);

  const obtainPresidentByCargoId = function (cargoId, item) {
    return responsePresidentes.find((candidato) => item.org_politica_id === candidato.org_politica_id && candidato.cargo_id === cargoId);
  }

  let listaIdPartidosObtenidos = partyList.map((item) => item.org_politica_id);

  let queryPartidosSinCompatibilidad = "SELECT a.id AS org_politica_id, a.orden_cedula, a.nombre, a.alias FROM partidos_alias a WHERE a.id NOT IN (?) AND a.id IN (SELECT org_politica_id FROM partido_x_respuesta) ORDER BY a.alias ASC";

  let responsePartidosSinCompatibilidad = await db.query(
    queryPartidosSinCompatibilidad,
    [listaIdPartidosObtenidos]
  );

  let listaTotalPartidos = [...partyList, ...responsePartidosSinCompatibilidad];

  let results = listaTotalPartidos.map((item) => {
    let presidenteData = obtainPresidentByCargoId(1, item);
    if (presidenteData) {
      //To create a compatibility object, just clone the topicCounter model : { education: ..., health: ..., total: ...}
      let { total: totalCount, ...compatibilityObject } = { ...topicCounter };

      let accumulatorByParty = 0;
      for (const topic in compatibilityObject) {
        //Find by topic if the party exists on the responses count list "groupedCountRespuestas"
        let itemPartyResponse = groupedCountRespuestas[topic].find((itemResp) => itemResp.org_politica_id === item.org_politica_id);
        if (itemPartyResponse) {
          let topicCompatibility = (itemPartyResponse.total / topicCounter[topic]);
          compatibilityObject[topic] = topicCompatibility ? +topicCompatibility.toFixed(2) : topicCompatibility;
          accumulatorByParty += itemPartyResponse.total;
        } else {
          compatibilityObject[topic] = 0;
        }
      }
      let totalCompatibility = (accumulatorByParty / totalCount);
      let compatibility = totalCompatibility ? +totalCompatibility.toFixed(2) : totalCompatibility;

      return {
        name: item.alias,
        order: item.orden_cedula,
        org_politica_id: item.org_politica_id,
        org_politica_nombre: item.nombre,
        compatibility,
        compatibility_per_topic: compatibilityObject,
        president: presidenteData,
        firstVP: obtainPresidentByCargoId(2, item),
        secondVP: obtainPresidentByCargoId(3, item)
      };
    }
  });

  //Remove null values for parties with no presidential leaders with filter
  //And sort the object list by the total compatibility
  return results.filter((i) => i).sort((a, b) => b.compatibility - a.compatibility);
};

module.exports = {
  getTopics,
  getQuestions,
  getPolicyResults
};
