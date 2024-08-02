import type { Medicine } from "@/@types/medicine";

export function medfake() {
  // Arrays com prefixos, sufixos e partes do meio dos nomes de remédios
  const prefixos = [
    "Aci",
    "Bio",
    "Cefa",
    "Dolo",
    "Eco",
    "Flu",
    "Gluco",
    "Hemo",
    "Ibu",
    "Keto",
  ];
  const meios = [
    "moxi",
    "termi",
    "corti",
    "andro",
    "cef",
    "gaba",
    "neuro",
    "cyto",
    "metro",
    "pheno",
  ];
  const sufixos = [
    "dol",
    "fen",
    "tox",
    "cort",
    "zine",
    "mycin",
    "cillin",
    "vir",
    "statin",
    "caine",
  ];

  // Função para gerar um nome de remédio fake
  function randomNames() {
    const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
    const meio = meios[Math.floor(Math.random() * meios.length)];
    const sufixo = sufixos[Math.floor(Math.random() * sufixos.length)];
    return prefixo + meio + sufixo;
  }

  // Gerando e exibindo 10 nomes de remédios fakes

  const medicines: Medicine[] = [
    {
      id: "1",
      name: "Paracetamol",
      description:
        "Analgésico e antipirético usado para tratar dores leves a moderadas e febre.",
      nextHour: new Date("2023-07-01T08:00:00Z").toISOString(),
      timesInDay: "3",
      qtsDay: "3",
      startTime: new Date("2023-07-01T07:00:00Z").toISOString(),
      startDate: new Date("2023-07-01").toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Ibuprofeno",
      description:
        "Anti-inflamatório não esteroide usado para reduzir a dor, inchaço e febre.",
      nextHour: new Date("2023-07-01T12:00:00Z").toISOString(),
      timesInDay: "2",
      qtsDay: "2",
      startTime: new Date("2023-07-01T10:00:00Z").toISOString(),
      startDate: new Date("2023-07-02").toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Amoxicilina",
      description:
        "Antibiótico usado para tratar uma ampla variedade de infecções bacterianas.",
      nextHour: new Date("2023-07-01T18:00:00Z").toISOString(),
      timesInDay: "3",
      qtsDay: "3",
      startTime: new Date("2023-07-01T09:00:00Z").toISOString(),
      startDate: new Date("2023-07-03").toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Lorazepam",
      description:
        "Medicamento ansiolítico usado para tratar ansiedade e distúrbios do sono.",
      nextHour: new Date("2023-07-01T22:00:00Z").toISOString(),
      timesInDay: "1",
      qtsDay: "1",
      startTime: new Date("2023-07-01T21:00:00Z").toISOString(),
      startDate: new Date("2023-07-04").toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Metformina",
      description:
        "Medicamento antidiabético usado para controlar os níveis de açúcar no sangue.",
      nextHour: new Date("2023-07-01T08:00:00Z").toISOString(),
      timesInDay: "2",
      qtsDay: "2",
      startTime: new Date("2023-07-01T07:30:00Z").toISOString(),
      startDate: new Date("2023-07-05").toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "6",
      name: "Metformina",
      description:
        "Medicamento antidiabético usado para controlar os níveis de açúcar no sangue.",
      nextHour: new Date("2023-07-01T08:00:00Z").toISOString(),
      timesInDay: "2",
      qtsDay: "2",
      startTime: new Date("2023-07-01T07:30:00Z").toISOString(),
      startDate: new Date("2023-07-05").toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "7",
      name: "Metformina",
      description:
        "Medicamento antidiabético usado para controlar os níveis de açúcar no sangue.",
      nextHour: new Date("2023-07-01T08:00:00Z").toISOString(),
      timesInDay: "2",
      qtsDay: "2",
      startTime: new Date("2023-07-01T07:30:00Z").toISOString(),
      startDate: new Date("2023-07-05").toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];


 return {
  medicines,
  randomNames
 }
}
