const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) =>
  new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();

// Cluj-Napoca bounds
const clujBounds = {
  minLat: 46.745,
  maxLat: 46.785,
  minLng: 23.55,
  maxLng: 23.64,
};

const getRandomLocation = () => ({
  lat: +(
    Math.random() * (clujBounds.maxLat - clujBounds.minLat) +
    clujBounds.minLat
  ).toFixed(6),
  lng: +(
    Math.random() * (clujBounds.maxLng - clujBounds.minLng) +
    clujBounds.minLng
  ).toFixed(6),
});

const categories = [
  "POTHOLE",
  "WASTE",
  "PUBLIC_LIGHTING",
  "VANDALISM",
  "PARKING",
  "TRAFFIC",
];
const statuses = [
  "PENDING",
  "PENDING",
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "RESOLVED",
];

const severities = ["LOW", "MEDIUM", "MEDIUM", "CRITICAL"];
const streetNames = [
  "Calea Moților",
  "Str. Regele Ferdinand",
  "Piața Unirii",
  "B-dul Eroilor",
  "Str. Memorandumului",
  "Calea Mănăștur",
  "Str. Horea",
  "Piața Mihai Viteazu",
  "B-dul 21 Decembrie 1989",
  "Str. Fabricii de Zahăr",
  "Str. Aurel Vlaicu",
  "Str. Alexandru Vaida Voevod",
  "Calea Dorobanților",
  "Str. Observatorului",
  "Str. Frunzișului",
  "Str. Donath",
  "Str. Traian Vuia",
  "B-dul Muncii",
];

const reportTemplates = {
  POTHOLE: {
    names: [
      "Gropă mare pe carosabil",
      "Asfalt crăpat",
      "Capac de canal lăsat",
      "Problemă denivelare",
    ],
    descriptions: [
      "O groapă periculoasă care trebuie reparată urgent.",
      "Asfaltul este crăpat și s-a lăsat.",
      "Capacul de canal este sub nivelul străzii și produce zgomot.",
      "Risc de accidente, groapa e adâncă și plină cu apă.",
    ],
  },
  WASTE: {
    names: [
      "Gunoi neridicat",
      "Containere pline",
      "Mizerie pe spațiul public",
      "Deșeuri abandonate",
    ],
    descriptions: [
      "Gunoiul menajer nu a fost ridicat de 3 zile.",
      "Containerele de colectare selectivă sunt pline.",
      "Miros neplăcut și mizerie lângă coșurile de gunoi.",
      "Cineva a aruncat moloz pe spațiul verde de lângă bloc.",
    ],
  },
  PUBLIC_LIGHTING: {
    names: [
      "Stâlp de iluminat defect",
      "Bec ars pe stradă",
      "Zonă în beznă",
      "Lumină pâlpâie",
    ],
    descriptions: [
      "Stâlpul acesta nu funcționează de o săptămână.",
      "E beznă pe toată aleea dintre blocuri.",
      "Lumina pâlpâie și e deranjant, probabil un scurtcircuit.",
      "Siguranță scăzută pe timp de noapte, e nevoie de reparație.",
    ],
  },
  VANDALISM: {
    names: [
      "Graffiti pe clădire",
      "Bancă ruptă în parc",
      "Coș de gunoi distrus",
      "Stație de autobuz vandalizată",
    ],
    descriptions: [
      "Clădirea istorică a fost mâzgălită cu graffiti.",
      "Băncile din Parcul Central au fost rupte.",
      "Geamurile stației de autobuz au fost sparte.",
      "Cineva a dat foc la coșul de gunoi.",
    ],
  },
  PARKING: {
    names: [
      "Mașină parcată pe trotuar",
      "Blocaj acces auto",
      "Parcare pe spațiu verde",
      "Parcare ilegală",
    ],
    descriptions: [
      "O mașină blochează complet trotuarul, pietonii merg pe stradă.",
      "Accesul în curte/garaj este blocat de un autoturism.",
      "Parcat pe spațiul verde de lângă locul de joacă.",
      "Mașină parcată pe trecerea de pietoni.",
    ],
  },
  TRAFFIC: {
    names: [
      "Semafor defect",
      "Indicator rutier lipsă",
      "Blocaj în intersecție",
      "Trafic îngreunat",
    ],
    descriptions: [
      "Semaforul din intersecție este blocat pe roșu.",
      "A dispărut indicatorul 'Cedează Trecerea'.",
      "Se creează constant ambuteiaje din cauza semaforizării proaste.",
      "Trecere de pietoni ștearsă, nu se mai vede.",
    ],
  },
};

let reports = [];
const TOTAL_REPORTS = 25;

for (let i = 0; i < TOTAL_REPORTS; i++) {
  const category = getRandom(categories);
  const template = reportTemplates[category];
  const street = getRandom(streetNames);
  const address = `${street}, nr. ${getRandomInt(1, 150)}, Cluj-Napoca`;

  reports.push({
    id: i + 1,
    name: getRandom(template.names),
    date: getRandomDate(new Date(2025, 8, 1), new Date(2025, 9, 27)),
    location: getRandomLocation(),
    address: address,
    images: [],
    category: category,
    status: getRandom(statuses),
    severityLevel: getRandom(severities),
    upvotes: getRandomInt(0, 75),
    description: getRandom(template.descriptions),
  });
}

let nextId = TOTAL_REPORTS + 1;

const findAll = (filters = {}) => {
  const { category, status, severity, search } = filters;

  let filteredReports = [...reports];

  if (category) {
    filteredReports = filteredReports.filter(
      (report) => report.category === category
    );
  }

  if (status) {
    filteredReports = filteredReports.filter(
      (report) => report.status === status
    );
  }

  if (severity) {
    filteredReports = filteredReports.filter(
      (report) => report.severityLevel === severity
    );
  }

  // search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    filteredReports = filteredReports.filter(
      (report) =>
        report.name.toLowerCase().includes(searchLower) ||
        report.address.toLowerCase().includes(searchLower) ||
        (report.description &&
          report.description.toLowerCase().includes(searchLower))
    );
  }

  return filteredReports;
};

const findById = (id) => {
  return reports.find((report) => report.id === id);
};

const updateById = (id, dataToUpdate) => {
  const reportIndex = reports.findIndex((report) => report.id === id);
  if (reportIndex === -1) {
    return null;
  }

  // keeping original report to allow partial updates
  const originalReport = reports[reportIndex];
  const updatedReport = {
    ...originalReport,
    ...dataToUpdate,
  };

  reports[reportIndex] = updatedReport;
  return updatedReport;
};

const create = (reportModel) => {
  reportModel.id = nextId++;
  reportModel.date = new Date().toISOString();

  reports.push(reportModel);
  return reportModel;
};

const deleteById = (id) => {
  const reportIndex = reports.findIndex((report) => report.id === id);
  if (reportIndex === -1) {
    return false;
  }
  reports.splice(reportIndex, 1);
  return true;
};

// Export so that they can be used by service
module.exports = {
  findAll,
  findById,
  create,
  deleteById,
  updateById,
};
