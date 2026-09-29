export interface Monument360 {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  image: string;
  shortDescription: string;
  google360Url: string;
}

export const monuments360: Monument360[] = [
  {
    id: "brihadishwara-temple",
    name: "Brihadishwara Temple",
    city: "Thanjavur",
    state: "Tamil Nadu",
    category: "Temples",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brihadeeswarar%20Temple%20thanjavur.jpg",
    shortDescription:
      "A monumental Chola-era temple renowned for its architecture and towering vimana.",
    google360Url:
      "https://www.google.com/maps/embed?pb=!4v1790681922901!6m8!1m7!1sv9KTS0tgEjoS5sltKM3uSA!2m2!1d10.78340284978039!2d79.13350159602386!3f247.50158990182464!4f4.975811169380819!5f0.7820865974627469",
  },
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "Monuments",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg",
    shortDescription:
      "An iconic Mughal monument known for its marble architecture and symmetrical design.",
    google360Url:
      "https://www.google.com/maps/embed?pb=!4v1790680985043!6m8!1m7!1sPBTMZmtBBBXct17ChY2b_Q!2m2!1d27.17061337313487!2d78.042107415866!3f206.44127604385196!4f0!5f0.7820865974627469",
  },
  {
    id: "arjuna-ratha-mahabalipuram",
    name: "Arjuna's Ratha",
    city: "Mahabalipuram",
    state: "Tamil Nadu",
    category: "Monuments",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/N-TN-C33%20Arjuna%27s%20Ratha.jpg",
    shortDescription:
      "A 7th-century monolithic rock-cut shrine, one of the five Pancha Rathas carved from a single granite outcrop under the Pallava dynasty.",
    google360Url:
      "https://www.google.com/maps/embed?pb=!4v1790682715680!6m8!1m7!1sBseSWJTpW0ffuJsvo0zWdg!2m2!1d12.60898242121717!2d80.18963096818001!3f126.79721953848066!4f-0.7063822660024499!5f0.7820865974627469",
  },
  {
    id: "konark-sun-temple",
    name: "Konark Sun Temple",
    city: "Konark",
    state: "Odisha",
    category: "Temples",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Konarka_Temple.jpg",
    shortDescription:
      "A remarkable temple complex designed in the form of the chariot of the Sun God.",
    google360Url:
      "https://www.google.com/maps/embed?pb=!4v1790682841083!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRDRoWldCRWc.!2m2!1d19.88759553374042!2d86.09453741466051!3f175.32793465257265!4f-10.213642804456939!5f0.7820865974627469",
  },
  {
    id: "qutub-minar",
    name: "Qutub Minar",
    city: "Delhi",
    state: "Delhi",
    category: "Monuments",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Qutb%20Minar.jpg",
    shortDescription:
      "A historic monument complex featuring the iconic Qutub Minar and Indo-Islamic architecture.",
    google360Url:
      "https://www.google.com/maps/embed?pb=!4v1790682951018!6m8!1m7!1sEdbiBEPhDZCWCKTA4m4u0w!2m2!1d28.52438164071228!2d77.1856570461665!3f281.78170610534494!4f-2.4350622157696336!5f0.7820865974627469",
  },
  {
    id: "krishna-temple-hampi",
    name: "Krishna Temple",
    city: "Hampi",
    state: "Karnataka",
    category: "Monuments",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Krishna-temple-Hampi.jpg",
    shortDescription:
      "A 16th-century Vijayanagara-era temple built by Krishnadevaraya to commemorate his Orissa campaign, known for its intricately carved gopuram.",
    google360Url:
      "https://www.google.com/maps/embed?pb=!4v1790683540540!6m8!1m7!1sTn4JlocnNhdIJ3JqoaBj0Q!2m2!1d15.33022719653234!2d76.46068484044646!3f267.05821430327546!4f6.244867265985135!5f0.7820865974627469",
  },
];
