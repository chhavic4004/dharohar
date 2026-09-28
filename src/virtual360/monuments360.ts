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
      "https://artsandculture.google.com/streetview/brihadeshwara-temple/bQEBFDWGbe1WIQ?sv_lng=79.13209723333006&sv_lat=10.782600687334803&sv_h=-115&sv_p=20&sv_pid=3JuLIKGyCVNnfhbHM9zc5A&sv_z=1",
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
    google360Url: "https://artsandculture.google.com/streetview/taj-mahal/UwGKcX7FFM5U4g",
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
    google360Url: "https://artsandculture.google.com/streetview/arjuna%E2%80%99s-ratha-mahabalipuram/nwEbf8gpXZ4Dpw?sv_lng=80.1897106547394&sv_lat=12.608906841292862&sv_h=-91.74546054999999&sv_p=13.890244429999996&sv_pid=_fnchIFprLkrvtmi82JBTg&sv_z=1", // no verified Street View / Arts & Culture link found — see note below
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
    google360Url: "https://artsandculture.google.com/streetview/konark-sun-temple/vwGtkelwxcvTdQ?sv_lng=86.0950579843996&sv_lat=19.887413539439486&sv_h=-106&sv_p=14&sv_pid=W76pNPycr8qeIEeAqx8-lA&sv_z=1",
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
    google360Url: "https://artsandculture.google.com/streetview/qutub-minar/6AG0rS4-oMGwLw?sv_lng=77.18488656702158&sv_lat=28.524744699093315&sv_h=59.3591433937365&sv_p=20&sv_pid=bu6n95IlT9-_w7UpN66Iiw&sv_z=1",
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
  google360Url: "https://artsandculture.google.com/streetview/krishna-temple-hampi/0wHDXs-LZqK7Gw?sv_lng=76.46051397446149&sv_lat=15.330134715510331&sv_h=-75.37397727446339&sv_p=10.9709918181957&sv_pid=y5Y84FtfghmXrjFXOjcrwg&sv_z=1.38359336346286", // no verified Street View / Arts & Culture link found — see note below
},

];