import { SRC, type BankQuestion } from "./types";

/**
 * Image, audio and map questions. Images and audio are freely licensed files
 * from Wikimedia Commons (credited on screen). Map questions are graded by
 * distance from the target, so a pin close enough counts as correct.
 */
const SEEKER_RADIUS = 150;
const HISTORIAN_RADIUS = 90;

export const visualQuestions: BankQuestion[] = [
  // ─────────────── IMAGE AND AUDIO ───────────────
  {
    id: "rhy-s-22", category: "rhythms", difficulty: "seeker", type: "mcq",
    prompt: "Listen to the clip. Which instrument is being played?",
    media: SRC.commonsAudio("Sitar_clipping.ogg", "Short recording of a plucked string instrument"),
    options: ["Sitar", "Shehnai", "Mridangam", "Bansuri"],
    answer: 0,
    explanation: {
      title: "The sound of the sitar",
      body: "The sitar has a long hollow neck, curved movable frets and a gourd resonator. Its buzzing, shimmering tone comes from a flat bridge called the jawari and from sympathetic strings that ring along with the main ones.",
      trivia: "Players pull the main string sideways across a fret to bend a note by several pitches, a technique called meend.",
    },
    source: SRC.britannica("art/sitar", "Sitar"),
  },
  {
    id: "rhy-h-22", category: "rhythms", difficulty: "historian", type: "mcq",
    prompt: "Listen to this solo. Which instrument is it?",
    media: SRC.commonsAudio("Tabla_Solo,_Mayank_Bedekar.webm", "Recording of a solo on a pair of hand drums"),
    options: ["Tabla", "Mridangam", "Pakhawaj", "Dholak"],
    answer: 0,
    explanation: {
      title: "A tabla solo",
      body: "The crisp strokes on the small right-hand drum and the gliding bass of the left-hand drum are the signature of the tabla. In a solo, the player builds variations on fixed compositions such as kaida and rela while a melody instrument repeats a short cycle called the lehra.",
    },
    source: SRC.britannica("art/tabla", "Tabla"),
  },
  {
    id: "rhy-s-23", category: "rhythms", difficulty: "seeker", type: "mcq",
    prompt: "In Kathakali, green facial makeup like this, called pacha, usually marks which kind of character?",
    media: SRC.commonsImage("Kathakali_-_pacha.jpg", "Kathakali performer with green facial makeup and a large headdress"),
    options: ["A noble hero", "A demon", "A clown", "A sage"],
    answer: 0,
    explanation: {
      title: "Pacha, the colour of nobility",
      body: "Kathakali uses colour codes so the audience can read a character at a glance. Pacha (green) is for noble, virtuous heroes such as Krishna, Arjuna and Nala. Evil characters wear red or black patterns, and women and sages have softer yellowish or orange tones.",
    },
    source: SRC.britannica("art/kathakali", "Kathakali"),
  },
  {
    id: "rhy-h-23", category: "rhythms", difficulty: "historian", type: "mcq",
    prompt: "This trapezoid-shaped instrument from Kashmir is played by striking its strings with light mallets. What is it?",
    media: SRC.commonsImage("Santoor.jpg", "A trapezoid wooden instrument with many strings and two slim mallets"),
    options: ["Santoor", "Swarmandal", "Rudra veena", "Sarod"],
    answer: 0,
    explanation: {
      title: "The santoor",
      body: "The santoor has around a hundred strings stretched over a wooden box and is played with two curved walnut mallets. Once part of Kashmiri Sufi music, it was brought to the Hindustani classical stage in the 20th century, above all by Pandit Shivkumar Sharma.",
    },
    source: SRC.britannica("art/South-Asian-arts", "South Asian arts"),
  },
  {
    id: "arc-s-22", category: "architecture", difficulty: "seeker", type: "mcq",
    prompt: "This carved stone wheel is one of 24 on a 13th-century temple built as the chariot of the Sun God. Which temple?",
    media: SRC.commonsImage("One_of_the_24_wheels_of_Konark_Sun_Temple.jpg", "A large carved stone chariot wheel with spokes and detailed figures"),
    options: ["Sun Temple, Konark", "Modhera Sun Temple", "Brihadisvara Temple, Thanjavur", "Virupaksha Temple, Hampi"],
    answer: 0,
    explanation: {
      title: "The wheels of Konark",
      body: "The Sun Temple at Konark in Odisha was designed as Surya's chariot, with 24 carved wheels on its platform. Each wheel is covered in fine carvings, and the spokes are often said to work as a sundial.",
      trivia: "A Konark wheel appears on the back of India's 10 rupee note.",
    },
    source: SRC.whc(246, "Sun Temple, Konarak"),
  },
  {
    id: "arc-s-23", category: "architecture", difficulty: "seeker", type: "mcq",
    prompt: "This 11th-century stepwell in Gujarat is designed like an upside-down temple. What is it called?",
    media: SRC.commonsImage("Rani_ki_Vav_(Queen's_stepwell),_Patan,_Gujarat.jpg", "Terraced stone stepwell with many carved pillars and levels"),
    options: ["Rani-ki-Vav", "Chand Baori", "Agrasen ki Baoli", "Adalaj Stepwell"],
    answer: 0,
    explanation: {
      title: "Rani-ki-Vav, Patan",
      body: "Rani-ki-Vav descends through seven levels of stairs lined with hundreds of sculptures. UNESCO describes it as an inverted temple that honours the sacredness of water. It became a World Heritage Site in 2014.",
      trivia: "It is shown on the back of India's lavender 100 rupee note.",
    },
    source: SRC.whc(922, "Rani-ki-Vav"),
  },
  {
    id: "arc-s-24", category: "architecture", difficulty: "seeker", type: "mcq",
    prompt: "This hemispherical Buddhist monument in Madhya Pradesh was first built in the time of Emperor Ashoka. What is it?",
    media: SRC.commonsImage("Great_stupa_of_Sanchi.jpg", "A large domed stone stupa with a carved gateway"),
    options: ["The Great Stupa at Sanchi", "Dhamek Stupa at Sarnath", "Mahabodhi Temple", "Shanti Stupa, Leh"],
    answer: 0,
    explanation: {
      title: "The Great Stupa, Sanchi",
      body: "The Great Stupa began as a brick mound in the 3rd century BCE and was later enlarged and cased in stone. Its four carved gateways (toranas) show scenes from the Buddha's life and the Jataka tales.",
    },
    source: SRC.whc(524, "Buddhist Monuments at Sanchi"),
  },
  {
    id: "arc-h-22", category: "architecture", difficulty: "historian", type: "mcq",
    prompt: "This 17th-century tomb in Karnataka has one of the largest domes in the world and a famous whispering gallery. Name it.",
    media: SRC.commonsImage("Gol_Gumbaz,_Bijapur_,_Karnataka,_India.JPG", "A massive cube-shaped building crowned by a giant dome with corner towers"),
    options: ["Gol Gumbaz", "Ibrahim Rauza", "Bibi Ka Maqbara", "Qutb Shahi Tombs"],
    answer: 0,
    explanation: {
      title: "Gol Gumbaz, Vijayapura",
      body: "Gol Gumbaz is the tomb of Sultan Muhammad Adil Shah of the Adil Shahi dynasty. A gallery runs around the base of its great dome, and a whisper against the wall can be heard clearly on the far side.",
    },
    source: SRC.asi,
  },
  {
    id: "tra-s-22", category: "traditions", difficulty: "seeker", type: "mcq",
    prompt: "Which folk art tradition is shown here, with simple white figures on a mud-coloured wall?",
    media: SRC.commonsImage("Warli_art_on_a_house_wall_at_Sanjay_Gandhi_National_Park.jpg", "White stick figures and circles painted on a brown house wall"),
    options: ["Warli", "Madhubani", "Pattachitra", "Gond"],
    answer: 0,
    explanation: {
      title: "Warli painting",
      body: "Warli art uses circles, triangles and lines painted in white rice paste to show village life, farming and dance. Its spare style is easy to recognise and very different from the colour-packed Madhubani or the fine detail of Pattachitra.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-s-23", category: "traditions", difficulty: "seeker", type: "mcq",
    prompt: "This colourful painting with bold outlines and no empty space comes from the Mithila region. Which art form is it?",
    media: SRC.commonsImage("Colorful_Madhubani_painting.jpg", "A densely patterned painting with bright colours and bold black outlines"),
    options: ["Madhubani", "Warli", "Kalighat", "Tanjore"],
    answer: 0,
    explanation: {
      title: "Madhubani painting",
      body: "Madhubani painting fills every part of the surface with pattern, often using double outlines and natural colours. It was traditionally painted by women on walls and floors for weddings and festivals in the Mithila region of Bihar.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-h-22", category: "traditions", difficulty: "historian", type: "mcq",
    prompt: "These smooth, brightly lacquered wooden toys carry a GI tag. Which town are they named after?",
    media: SRC.commonsImage("Channapatna-toys.jpg", "Bright lacquered wooden toys in red, yellow and green"),
    options: ["Channapatna", "Kondapalli", "Varanasi", "Nirmal"],
    answer: 0,
    explanation: {
      title: "Channapatna toys",
      body: "Artisans in Channapatna, Karnataka, turn soft wood on a lathe and colour it with lacquer while it spins. Kondapalli and Nirmal in Andhra Pradesh and Telangana have their own, different wooden toy traditions.",
    },
    source: SRC.giRegistry,
  },

  // ─────────────── MAP PIN: SEEKER ───────────────
  {
    id: "arc-s-25", category: "architecture", difficulty: "seeker", type: "map_pin",
    prompt: "Drop a pin on the city where the Taj Mahal stands.",
    target: { lat: 27.1751, lng: 78.0421 }, label: "Agra, Uttar Pradesh", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Agra on the Yamuna",
      body: "The Taj Mahal is in Agra, Uttar Pradesh, on the right bank of the Yamuna. Agra was one of the main Mughal capitals, and Agra Fort and Fatehpur Sikri are close by.",
    },
    source: SRC.whc(252, "Taj Mahal"),
  },
  {
    id: "arc-s-26", category: "architecture", difficulty: "seeker", type: "map_pin",
    prompt: "Find Hampi, the ruined capital of the Vijayanagara Empire, and drop a pin on it.",
    target: { lat: 15.335, lng: 76.46 }, label: "Hampi, Karnataka", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Hampi on the Tungabhadra",
      body: "Hampi lies in central Karnataka on the banks of the Tungabhadra, among dramatic boulder hills. The river and the rocky landscape made the city easy to defend.",
    },
    source: SRC.whc(241, "Group of Monuments at Hampi"),
  },
  {
    id: "arc-s-27", category: "architecture", difficulty: "seeker", type: "map_pin",
    prompt: "Pin the Sun Temple at Konark on the map.",
    target: { lat: 19.8876, lng: 86.0945 }, label: "Konark, Odisha", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Konark on the Odisha coast",
      body: "Konark is on the Bay of Bengal coast of Odisha, about 35 kilometres from Puri. It forms a well-known heritage triangle with Puri and Bhubaneswar.",
    },
    source: SRC.whc(246, "Sun Temple, Konarak"),
  },
  {
    id: "tra-s-24", category: "traditions", difficulty: "seeker", type: "map_pin",
    prompt: "The Hornbill Festival is held near Kohima. Drop a pin on that state.",
    target: { lat: 25.62, lng: 94.1 }, label: "Kisama near Kohima, Nagaland", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Kohima, Nagaland",
      body: "The Hornbill Festival takes place every December at Kisama Heritage Village near Kohima, the capital of Nagaland. It brings together the state's many tribes in one place.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "tra-s-25", category: "traditions", difficulty: "seeker", type: "map_pin",
    prompt: "Madhubani painting comes from the Mithila region. Pin the town of Madhubani.",
    target: { lat: 26.35, lng: 86.07 }, label: "Madhubani, Bihar", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Madhubani in north Bihar",
      body: "Madhubani is in north Bihar, close to the border with Nepal. The wider Mithila region spans parts of Bihar and southern Nepal, and the art is practised on both sides of the border.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-22", category: "culinary", difficulty: "seeker", type: "map_pin",
    prompt: "India's first GI product is a tea named after a hill town. Pin that town.",
    target: { lat: 27.041, lng: 88.2663 }, label: "Darjeeling, West Bengal", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Darjeeling",
      body: "Darjeeling is in the hills of northern West Bengal, between Nepal, Sikkim and Bhutan. Its tea gardens sit on steep slopes at heights of up to around 2,000 metres, which gives the tea its delicate flavour.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-23", category: "culinary", difficulty: "seeker", type: "map_pin",
    prompt: "Pin Pampore, the town famous for Kashmiri saffron.",
    target: { lat: 34.02, lng: 74.93 }, label: "Pampore, near Srinagar", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Pampore",
      body: "Pampore is a short distance south-east of Srinagar, in the Kashmir valley. Its karewa plateaus turn purple with crocus flowers in late October and November.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "rul-s-22", category: "rulers", difficulty: "seeker", type: "map_pin",
    prompt: "Chhatrapati Shivaji Maharaj was crowned at Raigad in 1674. Drop a pin on Raigad.",
    target: { lat: 18.234, lng: 73.44 }, label: "Raigad Fort, Maharashtra", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Raigad in the Sahyadris",
      body: "Raigad Fort stands on a hilltop in the Sahyadri range of western Maharashtra, south of Mumbai and west of Pune. Shivaji made it his capital.",
    },
    source: SRC.britannica("biography/Shivaji", "Shivaji"),
  },
  {
    id: "rul-s-23", category: "rulers", difficulty: "seeker", type: "map_pin",
    prompt: "Pin Pataliputra, the capital of the Maurya Empire, on the modern map.",
    target: { lat: 25.594, lng: 85.137 }, label: "Patna, Bihar", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Pataliputra is Patna",
      body: "Ancient Pataliputra lies under modern Patna, on the south bank of the Ganga in Bihar. Its position near several rivers made it a strong centre for trade and control of the Gangetic plain.",
    },
    source: SRC.britannica("biography/Ashoka", "Ashoka"),
  },
  {
    id: "rhy-s-24", category: "rhythms", difficulty: "seeker", type: "map_pin",
    prompt: "Sattriya dance grew in the monasteries of a river island in Assam. Pin Majuli.",
    target: { lat: 26.95, lng: 94.17 }, label: "Majuli, Assam", radiusKm: SEEKER_RADIUS,
    explanation: {
      title: "Majuli, the island of sattras",
      body: "Majuli is a large river island in the Brahmaputra in upper Assam. It is home to many sattras, the Vaishnava monasteries founded in the tradition of Srimanta Sankardev, where Sattriya dance has been preserved for centuries.",
    },
    source: SRC.sna,
  },

  // ─────────────── MAP PIN: HISTORIAN ───────────────
  {
    id: "arc-h-23", category: "architecture", difficulty: "historian", type: "map_pin",
    prompt: "Pin Dholavira, the Harappan city on Khadir island.",
    target: { lat: 23.8867, lng: 70.213 }, label: "Dholavira, Kutch, Gujarat", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Dholavira in the Rann of Kutch",
      body: "Dholavira is on Khadir island in the Great Rann of Kutch, Gujarat, surrounded by salt flats. Harappan engineers built reservoirs here to survive in one of the driest parts of India.",
    },
    source: SRC.whc(1645, "Dholavira: a Harappan City"),
  },
  {
    id: "arc-h-24", category: "architecture", difficulty: "historian", type: "map_pin",
    prompt: "Pin the Moidams of Charaideo, the Ahom royal burial ground.",
    target: { lat: 26.94, lng: 94.8 }, label: "Charaideo, Assam", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Charaideo in upper Assam",
      body: "Charaideo is in eastern Assam, in the foothills near the Patkai range. It was the first capital of the Ahom kings and remained their sacred burial ground for centuries.",
    },
    source: SRC.unescoWhcIndia,
  },
  {
    id: "arc-h-25", category: "architecture", difficulty: "historian", type: "map_pin",
    prompt: "Pin the Ramappa Temple, a World Heritage Site since 2021.",
    target: { lat: 18.2593, lng: 79.9431 }, label: "Palampet near Warangal, Telangana", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Ramappa near Warangal",
      body: "The Ramappa Temple is at Palampet in Telangana, north-east of Warangal, the old Kakatiya capital. It stands next to the Ramappa lake, a reservoir built in the same period.",
    },
    source: SRC.whc(1570, "Kakatiya Rudreshwara (Ramappa) Temple"),
  },
  {
    id: "tra-h-23", category: "traditions", difficulty: "historian", type: "map_pin",
    prompt: "Pin Jandiala Guru, home of the Thathera brass and copper craft.",
    target: { lat: 31.56, lng: 75.03 }, label: "Jandiala Guru near Amritsar, Punjab", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Jandiala Guru",
      body: "Jandiala Guru is a town near Amritsar in Punjab. Its Thathera community has hammered brass and copper vessels by hand for generations, a craft UNESCO inscribed in 2014.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-24", category: "traditions", difficulty: "historian", type: "map_pin",
    prompt: "Pin Raghurajpur, the heritage crafts village where almost every home paints Pattachitra.",
    target: { lat: 19.88, lng: 85.83 }, label: "Raghurajpur near Puri, Odisha", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Raghurajpur",
      body: "Raghurajpur is a village a few kilometres from Puri in Odisha. Its houses are painted with murals, and families work in Pattachitra, palm leaf engraving and mask making.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-22", category: "culinary", difficulty: "historian", type: "map_pin",
    prompt: "Pin the Baba Budan Giri hills, where legend says coffee was first planted in India.",
    target: { lat: 13.43, lng: 75.78 }, label: "Baba Budan Giri near Chikkamagaluru, Karnataka", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Baba Budan Giri",
      body: "The Baba Budan Giri range rises north of Chikkamagaluru in Karnataka's Western Ghats. According to the Coffee Board, the story of Indian coffee begins here with seven seeds planted around 1600.",
    },
    source: { label: "Coffee Board of India", url: "https://coffeeboard.gov.in/" },
  },
  {
    id: "cul-h-23", category: "culinary", difficulty: "historian", type: "map_pin",
    prompt: "Pin Bikaner, the desert city that gave its name to a GI-tagged snack.",
    target: { lat: 28.02, lng: 73.31 }, label: "Bikaner, Rajasthan", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Bikaner in the Thar",
      body: "Bikaner is in northern Rajasthan, in the Thar Desert. Moth beans, which grow well in dry soil, are a key ingredient of Bikaneri bhujia.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "rul-h-22", category: "rulers", difficulty: "historian", type: "map_pin",
    prompt: "Tipu Sultan died defending his island capital in 1799. Pin Srirangapatna.",
    target: { lat: 12.414, lng: 76.704 }, label: "Srirangapatna near Mysuru, Karnataka", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Srirangapatna",
      body: "Srirangapatna is an island in the Kaveri river, a few kilometres from Mysuru. Its river setting made it a strong fortress, and it was the capital of Hyder Ali and Tipu Sultan.",
    },
    source: SRC.britannica("biography/Tippu-Sultan", "Tipu Sultan"),
  },
  {
    id: "rul-h-23", category: "rulers", difficulty: "historian", type: "map_pin",
    prompt: "The Battle of Saraighat (1671) was fought on the Brahmaputra near a modern city. Pin it.",
    target: { lat: 26.18, lng: 91.7 }, label: "Guwahati, Assam", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Saraighat near Guwahati",
      body: "Saraighat is on the Brahmaputra at Guwahati, where the river narrows between hills. Lachit Borphukan used this narrow stretch to trap the larger Mughal fleet.",
    },
    source: SRC.britannica("topic/Ahom", "Ahom"),
  },
  {
    id: "rhy-h-24", category: "rhythms", difficulty: "historian", type: "map_pin",
    prompt: "Every January musicians gather at Tyagaraja's samadhi for the Tyagaraja Aradhana. Pin Thiruvaiyaru.",
    target: { lat: 10.88, lng: 79.1 }, label: "Thiruvaiyaru near Thanjavur, Tamil Nadu", radiusKm: HISTORIAN_RADIUS,
    explanation: {
      title: "Thiruvaiyaru on the Kaveri",
      body: "Thiruvaiyaru is a temple town on the Kaveri, about 13 kilometres from Thanjavur. At the Aradhana, hundreds of musicians sing Tyagaraja's five Pancharatna kritis together on the anniversary of his death.",
    },
    source: SRC.britannica("biography/Tyagaraja", "Tyagaraja"),
  },
];
