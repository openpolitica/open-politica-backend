const db = require("../database");

// Temporary mock data
const getTopics = async () => {
  return [
    "Educación",
    "Salud",
    "Gobernabilidad",
    "Medio Ambiente",
    "Seguridad",
    "Derechos Civiles",
    "Economía"
  ];
};

const getQuestions = async (params) => {
  let { topics } = params;

  if (typeof topics === "string") {
    topics = [topics];
  }

  // Temporary mock data
  const questionsPerTopic = {
    Educación: [
      { edu1: "¿Cómo mejorar la educación durante la pandemia?" },
      { edu2: "¿Cómo mejorar la calidad de la educación escolar?" },
      { edu3: "¿Cómo mejorar la educación superior?" }
    ],
    Salud: [
      {
        sal1: "¿Cómo obtener mejores resultados en la lucha contra el Covid-19?"
      },
      {
        sal2:
          "¿Cómo reformar la estructura y el funcionamiento del sistema público de salud?"
      },
      { sal3: "¿Cómo disminuir el gasto de las personas en salud?" }
    ],
    Gobernabilidad: [
      { gob1: "¿Qué opinas sobre modificar la Constitución?" },
      {
        gob2:
          "Si se dieran cambios en la Constitución, ¿en qué temas preferirías que sean?"
      },
      {
        gob3:
          "¿Qué quieres que opine el candidato presidencial de tu elección sobre la vacancia del 9 de noviembre?"
      }
    ],
    "Medio Ambiente": [
      {
        med1:
          "¿Cual crees que es la mejor forma de combatir la deforestación de la Amazonía?"
      },
      { med2: "¿Cómo lograr la transición hacia energías renovables?" },
      {
        med3:
          "¿Cual es la mejor forma de abordar los desastres naturales en el país?"
      }
    ],
    Seguridad: [
      {
        seg1:
          "¿Cuál cree que es la mejor forma de mejorar la lucha contra el crimen?"
      },
      {
        seg2:
          "¿Cúal es la mejor manera de mejorar la atención policial de casos de violencia de género?"
      },
      {
        seg3:
          "¿Cuál de las siguientes opciones sería más efectiva para mejorar la formación de la policía?"
      }
    ],
    "Derechos Civiles": [
      { der1: "¿Está a favor del matrimonio civil igualitario?" },
      {
        der2:
          "¿Qué tipo de apoyo cree que debería dar el gobierno a las personas con discapacidad?"
      },
      {
        der3:
          "¿Cómo se debe apoyar a las poblaciones y comunidades nativas del país?"
      }
    ],
    Economía: [
      {
        der4:
          "¿Cuál es la mejor forma de crear nuevos empleos formales en el Perú?"
      },
      { der5: "La regulación laboral debe:" },
      {
        der6:
          "En una reforma tributaria, ¿Cual de las siguientes opciones es la más efectiva para mejorar la recaudación de impuestos en el país?"
      }
    ]
  };

  let questions = [];

  topics.forEach((topic) => {
    let object = {};
    object[topic] = questionsPerTopic[topic];
    console.log(object);
    questions.push(object);
  });

  return questions;
};

const getPolicyResults = async (body) => {
  console.log(body);
  // Temporary mock data
  const partyResults = {
    "Partido Morado": 35,
    "Fuerza Popular": 41,
    Frepap: 11,
    "Juntos por el Perú": 63
  };
  return partyResults;
};

module.exports = {
  getTopics,
  getQuestions,
  getPolicyResults
};
