import { SRC, type BankQuestion } from "./types";

/**
 * Problem of the Day pool. These questions never appear in regular quizzes,
 * so the daily challenge always feels new. One is picked per day (IST) in a
 * shuffled cycle; the whole pool is used before any question repeats.
 */
export const dailyQuestions: BankQuestion[] = [
  {
    id: "day-01", category: "architecture", difficulty: "historian", type: "mcq",
    prompt: "The Iron Pillar in the Qutb complex has resisted rusting for over 1,600 years. In which dynasty's era was it made?",
    options: ["Gupta", "Maurya", "Mughal", "Tughlaq"],
    answer: 0,
    explanation: {
      title: "The rustless Iron Pillar",
      body: "The Iron Pillar carries a Sanskrit inscription in Gupta-era script and is generally dated to the reign of Chandragupta II, around 400 CE. Scientists have found that a thin protective layer, helped by the high phosphorus content of the iron, has kept it largely free of rust.",
    },
    source: SRC.whc(233, "Qutb Minar and its Monuments, Delhi"),
  },
  {
    id: "day-02", category: "rhythms", difficulty: "seeker", type: "mcq",
    prompt: "Rabindranath Tagore wrote the national anthems of India and which other country?",
    options: ["Bangladesh", "Nepal", "Sri Lanka", "Myanmar"],
    answer: 0,
    explanation: {
      title: "Two anthems, one poet",
      body: "Tagore wrote Jana Gana Mana, India's national anthem, and Amar Shonar Bangla, the national anthem of Bangladesh. In 1913 he became the first non-European to win the Nobel Prize in Literature.",
    },
    source: SRC.britannica("biography/Rabindranath-Tagore", "Rabindranath Tagore"),
  },
  {
    id: "day-03", category: "architecture", difficulty: "seeker", type: "chronology",
    prompt: "Arrange the Mountain Railways of India by the year each was added to the World Heritage list, earliest first.",
    items: ["Darjeeling Himalayan Railway", "Nilgiri Mountain Railway", "Kalka-Shimla Railway"],
    explanation: {
      title: "Railways in the hills",
      body: "The Darjeeling Himalayan Railway was inscribed in 1999. The Nilgiri Mountain Railway was added in 2005 and the Kalka-Shimla Railway in 2008, together forming the Mountain Railways of India site.",
    },
    source: SRC.whc(944, "Mountain Railways of India"),
  },
  {
    id: "day-04", category: "traditions", difficulty: "seeker", type: "mcq",
    prompt: "The Rath Yatra of Puri carries three deities on giant chariots. Jagannath is one. Who are the other two?",
    options: ["Balabhadra and Subhadra", "Rama and Sita", "Shiva and Parvati", "Lakshmi and Saraswati"],
    answer: 0,
    explanation: {
      title: "The three chariots of Puri",
      body: "Every year Jagannath, his elder brother Balabhadra and sister Subhadra travel on three huge wooden chariots from the Jagannath temple to the Gundicha temple. New chariots are built for each festival, and thousands of devotees pull them with thick ropes.",
      trivia: "The English word juggernaut comes from Jagannath, inspired by the unstoppable size of the chariots.",
    },
    source: SRC.britannica("topic/Rathayatra", "Rathayatra"),
  },
  {
    id: "day-05", category: "rulers", difficulty: "seeker", type: "true_false",
    prompt: "True or false: Sher Shah Suri introduced a silver coin called the rupiya.",
    answer: true,
    explanation: {
      title: "The first rupiya",
      body: "Sher Shah Suri, who ruled North India from 1540 to 1545, issued a standardised silver coin weighing about 178 grains, called the rupiya. The Mughals kept the system, and the word lives on in the rupee.",
    },
    source: SRC.britannica("biography/Sher-Shah-of-Sur", "Sher Shah of Sur"),
  },
  {
    id: "day-06", category: "architecture", difficulty: "seeker", type: "mcq",
    prompt: "Lothal, a Harappan site in Gujarat, is famous for what feature?",
    options: ["An ancient dockyard", "A giant stupa", "A rock-cut temple", "A stepwell"],
    answer: 0,
    explanation: {
      title: "The dockyard of Lothal",
      body: "Lothal, near the Gulf of Khambhat, has a large brick basin that many archaeologists interpret as one of the world's earliest known dockyards, from around 2400 BCE. It was part of trade networks that reached as far as Mesopotamia.",
    },
    source: SRC.asi,
  },
  {
    id: "day-07", category: "traditions", difficulty: "seeker", type: "mcq",
    prompt: "Makar Sankranti marks the sun's entry into which zodiac sign?",
    options: ["Capricorn (Makara)", "Aries (Mesha)", "Leo (Simha)", "Pisces (Meena)"],
    answer: 0,
    explanation: {
      title: "Makar Sankranti",
      body: "Makar Sankranti, usually on 14 or 15 January, marks the sun's move into Makara (Capricorn). It is one of the few Indian festivals tied to the solar calendar, and it is celebrated as Pongal, Uttarayan, Magh Bihu and Lohri in different regions.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "day-08", category: "rhythms", difficulty: "historian", type: "mcq",
    prompt: "Vande Mataram, the national song of India, first appeared in which novel?",
    options: ["Anandamath", "Gora", "Devdas", "Durgeshnandini"],
    answer: 0,
    explanation: {
      title: "Vande Mataram",
      body: "Bankim Chandra Chattopadhyay included Vande Mataram in his Bengali novel Anandamath, published in 1882. The song became a rallying cry of the freedom movement, and its first two verses were adopted as the national song in 1950.",
    },
    source: EMBLEM_SOURCE(),
  },
  {
    id: "day-09", category: "architecture", difficulty: "historian", type: "mcq",
    prompt: "Gol Gumbaz in Vijayapura (Bijapur) is famous for which acoustic feature?",
    options: ["A whispering gallery", "A singing stone pillar", "A musical staircase", "An echo well"],
    answer: 0,
    explanation: {
      title: "The whispering gallery of Gol Gumbaz",
      body: "Gol Gumbaz, the 17th-century tomb of Sultan Muhammad Adil Shah, has one of the largest domes in the world. Around its base runs a gallery where a whisper against the wall can be heard clearly on the opposite side, and a single clap echoes several times.",
    },
    source: SRC.asi,
  },
  {
    id: "day-10", category: "culinary", difficulty: "seeker", type: "odd_one_out",
    prompt: "Three of these crops reached India from the Americas after 1500. Which one has been grown in India for thousands of years?",
    options: ["Chilli", "Potato", "Tomato", "Black pepper"],
    answer: 3,
    explanation: {
      title: "Old and new ingredients",
      body: "Chilli, potato and tomato all came from the Americas and arrived in India after Portuguese contact. Black pepper is native to the Western Ghats and has been grown and traded from South India for thousands of years.",
    },
    source: SRC.britannica("plant/chili-pepper", "Chili pepper"),
  },
  {
    id: "day-11", category: "architecture", difficulty: "seeker", type: "mcq",
    prompt: "Nalanda Mahavihara, a World Heritage Site since 2016, was one of the ancient world's great centres of what?",
    options: ["Learning", "Trade", "Shipbuilding", "Astronomy only"],
    answer: 0,
    explanation: {
      title: "Nalanda, the great monastery-university",
      body: "Nalanda in Bihar was a Buddhist monastic and scholastic institution from the 3rd century BCE to the 13th century CE. It drew students and teachers from across Asia and taught subjects from philosophy and logic to medicine and grammar.",
    },
    source: SRC.whc(1502, "Archaeological Site of Nalanda Mahavihara"),
  },
  {
    id: "day-12", category: "rulers", difficulty: "historian", type: "mcq",
    prompt: "In which year was the city of Vijayanagara founded by Harihara and Bukka?",
    options: ["1206", "1336", "1498", "1526"],
    answer: 1,
    explanation: {
      title: "1336, a southern empire rises",
      body: "Harihara I and Bukka Raya I founded Vijayanagara in 1336 on the banks of the Tungabhadra. Within a century it became the most powerful state in South India.",
      trivia: "1206 is the founding of the Delhi Sultanate, 1498 is Vasco da Gama's arrival and 1526 is the First Battle of Panipat.",
    },
    source: SRC.britannica("place/Vijayanagar", "Vijayanagar"),
  },
  {
    id: "day-13", category: "traditions", difficulty: "seeker", type: "mcq",
    prompt: "Thrissur Pooram in Kerala is famous for caparisoned elephants and a contest of what?",
    options: ["Colourful umbrellas (kudamattam)", "Kite flying", "Boat racing", "Bull taming"],
    answer: 0,
    explanation: {
      title: "Kudamattam at Thrissur Pooram",
      body: "At Thrissur Pooram, rival temple groups line up elephants and swap brightly decorated parasols in quick succession, a display called kudamattam. The festival also features the thundering percussion ensemble known as ilanjithara melam.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "day-14", category: "architecture", difficulty: "seeker", type: "true_false",
    prompt: "True or false: The Buddha gave his first sermon at Sarnath, near Varanasi.",
    answer: true,
    explanation: {
      title: "The first sermon at Sarnath",
      body: "After his enlightenment at Bodh Gaya, the Buddha gave his first sermon to five companions in the deer park at Sarnath. Ashoka later raised a pillar here, and its Lion Capital became the State Emblem of India.",
    },
    source: SRC.britannica("place/Sarnath", "Sarnath"),
  },
  {
    id: "day-15", category: "traditions", difficulty: "historian", type: "mcq",
    prompt: "Tanjore (Thanjavur) paintings are known for which striking feature?",
    options: ["Gold foil and gem inlay", "Only black ink", "Painting on palm leaves", "Carved wooden panels"],
    answer: 0,
    explanation: {
      title: "The gleam of Tanjore art",
      body: "Tanjore paintings, which flourished under the Maratha rulers of Thanjavur, show deities in rich colours, with raised areas covered in gold foil and set with glass or semi-precious stones. The craft holds a GI tag.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "day-16", category: "rulers", difficulty: "seeker", type: "mcq",
    prompt: "Which Mughal emperor wrote his memoirs, the Baburnama, in the Chagatai Turkic language?",
    options: ["Babur", "Akbar", "Jahangir", "Aurangzeb"],
    answer: 0,
    explanation: {
      title: "The Baburnama",
      body: "Babur wrote his memoirs in Chagatai Turkic, his mother tongue. They describe his battles, the gardens he built and his honest impressions of India's plants, animals and people. Akbar later had them translated into Persian and illustrated.",
    },
    source: SRC.britannica("biography/Babur", "Babur"),
  },
  {
    id: "day-17", category: "architecture", difficulty: "historian", type: "mcq",
    prompt: "The stone chariot at Hampi stands inside which temple complex?",
    options: ["Vittala temple", "Virupaksha temple", "Hazara Rama temple", "Achyutaraya temple"],
    answer: 0,
    explanation: {
      title: "The stone chariot",
      body: "The stone chariot in the Vittala temple complex is actually a shrine for Garuda, Vishnu's eagle mount, built to look like a temple car. The same complex is known for its musical pillars, which ring when tapped.",
    },
    source: SRC.whc(241, "Group of Monuments at Hampi"),
  },
  {
    id: "day-18", category: "traditions", difficulty: "seeker", type: "mcq",
    prompt: "Jallikattu, the traditional bull-taming sport of Tamil Nadu, is held during which festival?",
    options: ["Pongal", "Deepavali", "Onam", "Navaratri"],
    answer: 0,
    explanation: {
      title: "Jallikattu at Pongal",
      body: "Jallikattu is held during the Pongal harvest festival, especially on Mattu Pongal, the day dedicated to cattle. Participants try to hold on to the hump of a running bull. Alanganallur near Madurai hosts one of the best-known events.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "day-19", category: "rulers", difficulty: "historian", type: "true_false",
    prompt: "True or false: The Chinese pilgrim Faxian visited India during the reign of Chandragupta II.",
    answer: true,
    explanation: {
      title: "Faxian's journey",
      body: "Faxian travelled from China to India around 399 to 412 CE in search of Buddhist texts. His account describes Gupta India, during Chandragupta II's reign, as orderly, with light taxes and many charitable institutions.",
    },
    source: SRC.britannica("biography/Faxian", "Faxian"),
  },
  {
    id: "day-20", category: "architecture", difficulty: "seeker", type: "mcq",
    prompt: "Who is credited with rediscovering the Ajanta Caves in 1819 while on a hunting trip?",
    options: ["A British officer named John Smith", "Emperor Aurangzeb", "James Prinsep", "Raja Ravi Varma"],
    answer: 0,
    explanation: {
      title: "A tiger hunt and a lost treasure",
      body: "In 1819, Captain John Smith of the Madras Presidency army was hunting a tiger when he spotted the entrance of one of the caves across the Waghora ravine. Local people knew of the caves, but his report brought them to wider attention. His name, scratched on a pillar in Cave 10, can still be seen.",
    },
    source: SRC.whc(242, "Ajanta Caves"),
  },
  {
    id: "day-21", category: "rhythms", difficulty: "seeker", type: "mcq",
    prompt: "Which festival of Karnataka is famous for the Jamboo Savari, a grand elephant procession?",
    options: ["Mysuru Dasara", "Hampi Utsav", "Karaga", "Kambala"],
    answer: 0,
    explanation: {
      title: "Mysuru Dasara",
      body: "Mysuru Dasara ends on Vijayadashami with the Jamboo Savari, when a decorated elephant carries an image of Goddess Chamundeshwari in a golden howdah through the city. The Mysore Palace is lit with nearly a hundred thousand bulbs during the festival.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "day-22", category: "culinary", difficulty: "historian", type: "mcq",
    prompt: "Erode and Kandhamal are both known for a GI-tagged variety of which spice?",
    options: ["Turmeric", "Cardamom", "Cumin", "Clove"],
    answer: 0,
    explanation: {
      title: "Turmeric with an address",
      body: "Erode turmeric from Tamil Nadu and Kandhamal haladi from Odisha both hold GI tags. Turmeric is the dried and ground rhizome of a plant in the ginger family, and its yellow pigment, curcumin, gives Indian curries their colour. India grows most of the world's turmeric.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "day-23", category: "architecture", difficulty: "seeker", type: "mcq",
    prompt: "Which archaeologist identified the importance of the Bhimbetka rock shelters in 1957?",
    options: ["V. S. Wakankar", "Mortimer Wheeler", "R. D. Banerji", "Alexander Cunningham"],
    answer: 0,
    explanation: {
      title: "Wakankar and Bhimbetka",
      body: "Vishnu Shridhar Wakankar noticed rock formations resembling those he had seen in Europe while travelling by train through Madhya Pradesh. His surveys revealed hundreds of painted shelters, some with paintings thought to date back to the Mesolithic period.",
    },
    source: SRC.whc(925, "Rock Shelters of Bhimbetka"),
  },
  {
    id: "day-24", category: "rulers", difficulty: "seeker", type: "match",
    prompt: "Match each monument with the ruler who built it.",
    pairs: [
      ["Taj Mahal", "Shah Jahan"],
      ["Fatehpur Sikri", "Akbar"],
      ["Brihadisvara temple, Thanjavur", "Rajaraja I"],
      ["Jantar Mantar, Jaipur", "Sawai Jai Singh II"],
    ],
    explanation: {
      title: "Builders and their buildings",
      body: "Shah Jahan built the Taj Mahal, Akbar built Fatehpur Sikri, the Chola king Rajaraja I built the Brihadisvara temple and Maharaja Sawai Jai Singh II built the Jantar Mantar observatory in Jaipur.",
    },
    source: SRC.unescoWhcIndia,
  },
  {
    id: "day-25", category: "traditions", difficulty: "historian", type: "mcq",
    prompt: "The Chola bronze figure of Shiva as the cosmic dancer is known by which name?",
    options: ["Nataraja", "Ardhanarishvara", "Dakshinamurti", "Bhairava"],
    answer: 0,
    explanation: {
      title: "Nataraja, lord of dance",
      body: "Chola artists of the 10th to 12th centuries perfected the Nataraja bronze using the lost-wax method. Shiva dances inside a ring of fire, crushing a dwarf that symbolises ignorance, in a pose that represents the cycle of creation and destruction.",
      trivia: "A two-metre Nataraja statue gifted by India stands at CERN, the physics laboratory in Geneva.",
    },
    source: SRC.britannica("topic/Nataraja", "Nataraja"),
  },
  {
    id: "day-26", category: "culinary", difficulty: "seeker", type: "true_false",
    prompt: "True or false: Basmati rice has a GI tag in India.",
    answer: true,
    explanation: {
      title: "Basmati's protected name",
      body: "Basmati rice grown in specified areas of the Indo-Gangetic plains, across states such as Punjab, Haryana, Uttarakhand and parts of Uttar Pradesh, Himachal Pradesh, Delhi and Jammu and Kashmir, is registered as a GI. The long grains lengthen a lot on cooking and have a distinctive aroma.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "day-27", category: "rulers", difficulty: "historian", type: "mcq",
    prompt: "The Grand Trunk Road, one of Asia's oldest roads, was greatly improved and extended by which ruler in the 16th century?",
    options: ["Sher Shah Suri", "Akbar", "Aurangzeb", "Humayun"],
    answer: 0,
    explanation: {
      title: "Sher Shah's highway",
      body: "Sher Shah Suri rebuilt and extended the ancient route linking Bengal to the north-west, adding sarais (rest houses), wells and trees along the way. The British later called it the Grand Trunk Road, and much of it is still in use.",
    },
    source: SRC.britannica("biography/Sher-Shah-of-Sur", "Sher Shah of Sur"),
  },
  {
    id: "day-28", category: "rhythms", difficulty: "seeker", type: "mcq",
    prompt: "Kathakali and Kutiyattam both come from Kerala. Which famous institution, founded in 1930, helped revive them?",
    options: ["Kerala Kalamandalam", "Kalakshetra", "Nrityagram", "Bharatiya Vidya Bhavan"],
    answer: 0,
    explanation: {
      title: "Kerala Kalamandalam",
      body: "The poet Vallathol Narayana Menon founded Kerala Kalamandalam in 1930 to save Kerala's performing arts at a time when royal patronage was fading. It now trains students in Kathakali, Kutiyattam, Mohiniyattam and traditional percussion.",
    },
    source: SRC.sna,
  },
  {
    id: "day-29", category: "architecture", difficulty: "historian", type: "odd_one_out",
    prompt: "Three of these World Heritage Sites are in Maharashtra. Which one is not?",
    options: ["Ajanta Caves", "Elephanta Caves", "Chhatrapati Shivaji Terminus", "Rani-ki-Vav"],
    answer: 3,
    explanation: {
      title: "Maharashtra's heritage sites",
      body: "Ajanta, Elephanta and Chhatrapati Shivaji Terminus are all in Maharashtra. Rani-ki-Vav is a stepwell in Patan, Gujarat.",
    },
    source: SRC.unescoWhcIndia,
  },
  {
    id: "day-30", category: "traditions", difficulty: "seeker", type: "mcq",
    prompt: "Kumartuli in Kolkata is famous for which craft?",
    options: ["Clay idol making", "Silk weaving", "Brass casting", "Kite making"],
    answer: 0,
    explanation: {
      title: "The potters of Kumartuli",
      body: "Kumartuli, on the banks of the Hooghly, is home to generations of potters who sculpt clay idols for Durga Puja and other festivals. The clay is traditionally mixed with river silt, and the work is part of the living heritage UNESCO recognised in 2021.",
    },
    source: SRC.unescoIchIndia,
  },
];

function EMBLEM_SOURCE() {
  return { label: "National Portal of India: National Song", url: "https://www.india.gov.in/explore-india/facts-of-india/national-identity/national-song" };
}
