require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const PARTIDOS_ALIAS = {
  "ACCION POPULAR": "Acción Popular",
  "ALIANZA PARA EL PROGRESO": "Alianza para el Progreso",
  "AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL": "Avanza País",
  "DEMOCRACIA DIRECTA": "Democracia Directa",
  "EL FRENTE AMPLIO POR JUSTICIA, VIDA Y LIBERTAD": "Frente Amplio",
  "FRENTE POPULAR AGRICOLA FIA DEL PERU - FREPAP": "Frepap",
  "FUERZA POPULAR": "Fuerza Popular",
  "JUNTOS POR EL PERU": "Juntos por el Perú",
  "PARTIDO APRISTA PERUANO": "Partido Aprista Peruano",
  "PARTIDO DEMOCRATICO SOMOS PERU": "Somos Perú",
  "PARTIDO FRENTE DE LA ESPERANZA 2021": "Frente de la Esperanza 2021",
  "PARTIDO NACIONALISTA PERUANO": "Partido Nacionalista",
  "PARTIDO MORADO": "Partido Morado",
  "PARTIDO POLÍTICO CONTIGO": "Partido Político Contigo",
  "PARTIDO POLITICO NACIONAL PERU LIBRE": "Perú Libre",
  "PARTIDO POPULAR CRISTIANO - PPC": "Partido Popular Cristiano",
  "PERU NACION": "Perú Nación",
  "PERU PATRIA SEGURA": "Perú Patria Segura",
  "PODEMOS PERU": "Podemos Perú",
  "RENACIMIENTO UNIDO NACIONAL": "Renacimiento Unido Nacional",
  "RENOVACION POPULAR": "Renovación Popular",
  "UNION POR EL PERU": "Unión por el Perú",
  "VAMOS PERU": "Vamos Perú",
  "VICTORIA NACIONAL": "Victoria Nacional"
};

const updateParties = async () => {
  console.log("Updating parties");
  const candidates = await CandidateModel.find({});
  await Promise.all(
    candidates.map(async (candidateElement) => {
      await CandidateModel.updateOne(
        { _id: candidateElement._id },
        {
          $set: {
            org_politica_alias:
              PARTIDOS_ALIAS[candidateElement.org_politica_nombre]
          },
        }
      );
    })
  );
};

updateParties();
