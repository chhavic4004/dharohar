import { SRC, type BankQuestion } from "./types";

const c = "traditions" as const;

const UN_YOGA = { label: "United Nations: International Day of Yoga", url: "https://www.un.org/en/observances/yoga-day" };
const CHIPKO = SRC.britannica("topic/Chipko-movement", "Chipko movement");

export const traditionsQuestions: BankQuestion[] = [
  // ─────────────── SEEKER ───────────────
  {
    id: "tra-s-01", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which Indian festival was added to UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2025?",
    options: ["Holi", "Deepavali", "Onam", "Pongal"],
    answer: 1,
    explanation: {
      title: "Deepavali joins the UNESCO list",
      body: "Deepavali was inscribed in December 2025 at the UNESCO committee session held in New Delhi. UNESCO recognises it as a festival of light celebrated by many communities in India and abroad, marked by lamps, prayers, shared meals and the renewal of social bonds.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-02", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Garba, inscribed by UNESCO in 2023, is a devotional circular dance from which state?",
    options: ["Gujarat", "Rajasthan", "Maharashtra", "Madhya Pradesh"],
    answer: 0,
    explanation: {
      title: "Garba of Gujarat",
      body: "Garba is danced in circles around a lamp or an image of the Goddess, especially during the nine nights of Navaratri. The circle reflects the cycle of life, and the dance brings together people of every age and background.",
      trivia: "The word garba is linked to garbha, meaning womb, and to the perforated clay pot with a lamp inside that sits at the centre of the dance.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-03", category: c, difficulty: "seeker", type: "odd_one_out",
    prompt: "The Kumbh Mela rotates between four holy cities. Which of these is NOT one of them?",
    options: ["Prayagraj", "Haridwar", "Ujjain", "Varanasi"],
    answer: 3,
    explanation: {
      title: "The four Kumbh cities",
      body: "The Kumbh Mela is held in turn at Prayagraj, Haridwar, Ujjain and Nashik, each on a sacred river. UNESCO inscribed it in 2017, describing it as the largest peaceful gathering of pilgrims on Earth. Varanasi is a major pilgrimage city but is not a Kumbh site.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-04", category: c, difficulty: "seeker", type: "mcq",
    prompt: "On which date is the International Day of Yoga observed every year?",
    options: ["21 March", "21 June", "2 October", "14 November"],
    answer: 1,
    explanation: {
      title: "21 June, the longest day",
      body: "The UN General Assembly declared 21 June the International Day of Yoga in 2014, following a proposal by India. The date is the summer solstice, the longest day of the year in the Northern Hemisphere. UNESCO added yoga to its intangible heritage list in 2016.",
    },
    source: UN_YOGA,
  },
  {
    id: "tra-s-05", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Madhubani painting comes from which cultural region?",
    options: ["Mithila, Bihar", "Malwa, Madhya Pradesh", "Kutch, Gujarat", "Bastar, Chhattisgarh"],
    answer: 0,
    explanation: {
      title: "Madhubani of Mithila",
      body: "Madhubani, or Mithila, painting was traditionally created by women on the walls and floors of their homes for weddings and festivals. It uses bold outlines, bright natural colours and scenes from mythology and nature, with almost no empty space left on the surface.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-s-06", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Warli paintings, made with white paste on mud walls, are the art of a tribal community from which state?",
    options: ["Maharashtra", "Kerala", "Punjab", "Odisha"],
    answer: 0,
    explanation: {
      title: "Warli art",
      body: "The Warli community lives in the hills of Maharashtra near the Gujarat border. Their paintings use circles, triangles and lines drawn in rice paste on red-brown mud walls to show farming, dancing, hunting and village life.",
      trivia: "Warli artist Jivya Soma Mashe helped bring the art to worldwide attention and received the Padma Shri in 2011.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-s-07", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Onam, the harvest festival of Kerala, celebrates the annual homecoming of which legendary king?",
    options: ["Mahabali", "Vikramaditya", "Harishchandra", "Bhoja"],
    answer: 0,
    explanation: {
      title: "Onam and King Mahabali",
      body: "Onam welcomes back King Mahabali, whose reign is remembered as a golden age of equality and plenty. It is celebrated with pookalam flower carpets, the Onasadya feast served on banana leaves and the vallam kali snake boat races.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "tra-s-08", category: c, difficulty: "seeker", type: "mcq",
    prompt: "The Hornbill Festival, a celebration of Naga tribes and their culture, is held every December in which state?",
    options: ["Nagaland", "Mizoram", "Arunachal Pradesh", "Meghalaya"],
    answer: 0,
    explanation: {
      title: "Hornbill Festival of Nagaland",
      body: "First held in 2000 and now staged at Kisama Heritage Village near Kohima, the Hornbill Festival brings Nagaland's tribes together for ten days of music, dance, crafts, food and traditional games. It is named after the hornbill, a bird that appears widely in Naga folklore.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "tra-s-09", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: Durga Puja in Kolkata is on UNESCO's list of intangible cultural heritage.",
    answer: true,
    explanation: {
      title: "Durga Puja in Kolkata",
      body: "UNESCO inscribed Durga Puja in Kolkata in 2021. It recognised not just the worship but also the community art around it: huge pandals, clay idols made by the potters of Kumartuli, and the way the whole city takes part.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-10", category: c, difficulty: "seeker", type: "match",
    prompt: "Match each craft with the place it is famous for.",
    pairs: [
      ["Chikankari embroidery", "Lucknow"],
      ["Phulkari embroidery", "Punjab"],
      ["Bidriware", "Bidar"],
      ["Blue pottery", "Jaipur"],
    ],
    explanation: {
      title: "Crafts with a home",
      body: "Chikankari is fine white-on-white embroidery from Lucknow. Phulkari, meaning 'flower work', is the bright embroidery of Punjab. Bidriware, from Bidar in Karnataka, inlays silver into a blackened metal alloy, and Jaipur's blue pottery is made from a quartz-based paste rather than clay.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-s-11", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Ramlila, inscribed by UNESCO in 2008, is a theatrical performance of which epic?",
    options: ["Mahabharata", "Ramayana", "Shilappadikaram", "Gita Govinda"],
    answer: 1,
    explanation: {
      title: "Ramlila",
      body: "Ramlila re-enacts the story of Rama through songs, narration and dialogue, usually in the days leading up to Dussehra. Performances range from small village stages to the month-long Ramlila of Ramnagar near Varanasi, where the audience walks with the actors from scene to scene.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-12", category: c, difficulty: "seeker", type: "odd_one_out",
    prompt: "Three of these are painting traditions. Which one is a dance?",
    options: ["Madhubani", "Warli", "Pattachitra", "Kathakali"],
    answer: 3,
    explanation: {
      title: "Paint or dance",
      body: "Madhubani (Bihar), Warli (Maharashtra) and Pattachitra (Odisha and West Bengal) are painting traditions. Kathakali is a classical dance-drama from Kerala.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "tra-s-13", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: Pashmina shawls are woven from the fine undercoat of goats raised on the high plateaus of Ladakh.",
    answer: true,
    explanation: {
      title: "The wool of Changthang",
      body: "Pashmina comes from the soft undercoat of Changthangi goats, raised by nomadic herders on the Changthang plateau of Ladakh at altitudes above 4,000 metres. The fibre is spun and woven by hand in Kashmir into light, warm shawls.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-s-14", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Kalbelia songs and dances, inscribed by UNESCO in 2010, belong to a community traditionally associated with what occupation?",
    options: ["Snake charming", "Salt making", "Fishing", "Pottery"],
    answer: 0,
    explanation: {
      title: "Kalbelia of Rajasthan",
      body: "The Kalbelia community of Rajasthan were traditionally snake charmers. Women dancers in swirling black skirts move in ways that echo a serpent, while men play the pungi (a wind instrument once used to charm snakes) and the dafli drum. Songs are passed down orally and often improvised.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-15", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Channapatna, known as the toy town, is famous for what kind of toys?",
    options: ["Lacquered wooden toys", "Clay dolls", "Brass figurines", "Cloth puppets"],
    answer: 0,
    explanation: {
      title: "Channapatna toys of Karnataka",
      body: "Artisans in Channapatna, between Bengaluru and Mysuru, turn soft wood on a lathe and colour it with natural lacquer to make smooth, brightly coloured toys. The craft has a GI tag.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-s-16", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Lohri, celebrated with bonfires in mid-January, is mainly a festival of which region?",
    options: ["Punjab", "Kerala", "Odisha", "Assam"],
    answer: 0,
    explanation: {
      title: "Lohri",
      body: "Lohri marks the end of the coldest part of winter and the harvest of sugarcane in Punjab. Families gather around a bonfire, toss in sesame seeds, jaggery and popcorn, and sing folk songs such as the tale of Dulla Bhatti.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "tra-s-17", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Kanchipuram is renowned for which traditional textile?",
    options: ["Silk sarees", "Pashmina shawls", "Chanderi cotton", "Muga silk"],
    answer: 0,
    explanation: {
      title: "Kanchipuram silk",
      body: "Kanchipuram in Tamil Nadu is famous for heavy silk sarees with contrasting borders and gold zari work. In the traditional korvai technique, the border and body are woven separately and then interlocked by hand.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-s-18", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: The tradition of Vedic chanting is recognised on UNESCO's intangible heritage list.",
    answer: true,
    explanation: {
      title: "Vedic chanting",
      body: "The tradition of Vedic chanting was inscribed in 2008. For thousands of years, the Vedas have been passed on orally with precise rules of pitch and pronunciation, using memory techniques that preserve the texts with remarkable accuracy.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-19", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Chhau, a dance that blends martial movements with storytelling, is performed mainly in which part of India?",
    options: ["Eastern India", "Western India", "Southern India", "North-West India"],
    answer: 0,
    explanation: {
      title: "Chhau of eastern India",
      body: "Chhau is performed in Odisha, Jharkhand and West Bengal and was inscribed by UNESCO in 2010. It draws on martial practice and folk traditions to tell episodes from the epics, and it is closely tied to spring festivals, especially Chaitra Parva.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-s-20", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Pongal, celebrated in Tamil Nadu over four days in January, is mainly a festival to thank whom?",
    options: ["The Sun and the harvest", "The rain god", "Ancestors", "River goddesses"],
    answer: 0,
    explanation: {
      title: "Pongal, the thanksgiving",
      body: "Pongal thanks the Sun, the cattle and the land for the harvest. It falls as the sun begins its northward journey (Uttarayana), and each of its four days has its own customs, including Mattu Pongal, when cattle are bathed, decorated and honoured.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "tra-s-21", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Rongali Bihu, the spring festival of Assam, marks which occasion?",
    options: ["The Assamese New Year", "The end of the monsoon", "The winter harvest", "A royal coronation"],
    answer: 0,
    explanation: {
      title: "Rongali Bihu",
      body: "Rongali, or Bohag, Bihu falls in mid-April and marks the Assamese New Year and the start of the farming season. Assam also celebrates Kongali Bihu in October and Bhogali Bihu, a harvest feast, in January.",
    },
    source: SRC.knowIndia,
  },

  // ─────────────── HISTORIAN ───────────────
  {
    id: "tra-h-01", category: c, difficulty: "historian", type: "chronology",
    prompt: "Arrange these in the order UNESCO inscribed them as intangible cultural heritage, earliest first.",
    items: ["Kutiyattam", "Chhau dance", "Yoga", "Garba of Gujarat"],
    explanation: {
      title: "India on the UNESCO list",
      body: "Kutiyattam was inscribed in 2008 (after being proclaimed a masterpiece in 2001), Chhau in 2010, Yoga in 2016 and Garba of Gujarat in 2023.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-02", category: c, difficulty: "historian", type: "mcq",
    prompt: "In 1730, hundreds of Bishnoi villagers led by Amrita Devi gave their lives at Khejarli to protect which trees?",
    options: ["Khejri", "Neem", "Sal", "Deodar"],
    answer: 0,
    explanation: {
      title: "The Khejarli sacrifice",
      body: "When soldiers of the Jodhpur ruler came to cut khejri trees at Khejarli, Amrita Devi hugged a tree, refusing to let it be felled. In all, 363 Bishnois, including Amrita Devi and her daughters, were killed. The ruler later banned tree felling in Bishnoi villages, and the event is remembered as an early inspiration for the Chipko movement.",
      trivia: "The khejri is now Rajasthan's state tree, and India's Ministry of Environment gives the Amrita Devi Bishnoi award for wildlife protection in her memory.",
    },
    source: { label: "Khejarli massacre (Wikipedia, with cited references)", url: "https://en.wikipedia.org/wiki/Khejarli_massacre" },
  },
  {
    id: "tra-h-03", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Chipko movement of the 1970s, in which villagers hugged trees to stop logging, began in which present-day state?",
    options: ["Uttarakhand", "Himachal Pradesh", "Sikkim", "Jharkhand"],
    answer: 0,
    explanation: {
      title: "Chipko in the Garhwal hills",
      body: "Chipko began in 1973 in the Chamoli district of what is now Uttarakhand. Village women, such as Gaura Devi of Reni in 1974, played a central role by physically embracing trees. The movement pushed the government to restrict tree felling in the Himalayan forests.",
    },
    source: CHIPKO,
  },
  {
    id: "tra-h-04", category: c, difficulty: "historian", type: "mcq",
    prompt: "Mudiyettu, a ritual dance-drama of Kerala, enacts the battle between the goddess Kali and which demon?",
    options: ["Darika", "Mahishasura", "Ravana", "Hiranyakashipu"],
    answer: 0,
    explanation: {
      title: "Mudiyettu",
      body: "Mudiyettu is performed in Bhagavati temples of Kerala after the summer harvest. The whole village takes part as the goddess Kali defeats the demon Darika. It was inscribed by UNESCO in 2010.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-05", category: c, difficulty: "historian", type: "match",
    prompt: "Match each UNESCO-listed tradition with the state where it is practised.",
    pairs: [
      ["Mudiyettu", "Kerala"],
      ["Ramman", "Uttarakhand"],
      ["Sankirtana", "Manipur"],
      ["Kalbelia", "Rajasthan"],
    ],
    explanation: {
      title: "Living traditions across India",
      body: "Mudiyettu is a temple ritual of Kerala, Ramman is a festival of the Garhwal Himalayas in Uttarakhand, Sankirtana is the ritual singing, drumming and dance of Manipur, and Kalbelia is the song and dance of a Rajasthani community.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-06", category: c, difficulty: "historian", type: "mcq",
    prompt: "Ramman, inscribed by UNESCO in 2009, is a religious festival of which region?",
    options: ["Garhwal Himalayas", "Konkan coast", "Thar Desert", "Nilgiri hills"],
    answer: 0,
    explanation: {
      title: "Ramman of Garhwal",
      body: "Ramman is held every year in the twin villages of Saloor-Dungra in Uttarakhand in honour of the village deity, Bhumiyal Devta. It combines masked dances, songs and recitations from the Ramayana, and each caste and family in the village has a set role.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-07", category: c, difficulty: "historian", type: "mcq",
    prompt: "Phad paintings of Rajasthan are long cloth scrolls that tell the stories of which folk deities?",
    options: ["Pabuji and Devnarayan", "Jagannath and Balabhadra", "Murugan and Valli", "Ayyappa and Vavar"],
    answer: 0,
    explanation: {
      title: "Phad, a portable temple",
      body: "A phad is a long painted scroll narrating the lives of folk hero-deities such as Pabuji and Devnarayan. Singer-priests called bhopas unroll it at night and perform the story in song, pointing to each scene with a lamp.",
    },
    source: SRC.sna,
  },
  {
    id: "tra-h-08", category: c, difficulty: "historian", type: "mcq",
    prompt: "Of the two main Kalamkari styles, which one is drawn freehand with a pen (kalam)?",
    options: ["Srikalahasti style", "Machilipatnam style", "Both are block printed", "Neither uses a pen"],
    answer: 0,
    explanation: {
      title: "Two Kalamkari traditions",
      body: "Kalamkari means 'pen work'. In the Srikalahasti style, artists draw temple and epic scenes freehand with a bamboo pen and natural dyes. The Machilipatnam style, shaped by Persian trade, mainly uses carved wooden blocks. Both are in Andhra Pradesh and hold GI tags.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-h-09", category: c, difficulty: "historian", type: "true_false",
    prompt: "True or false: India is one of the countries named in UNESCO's multinational inscription of Nowruz.",
    answer: true,
    explanation: {
      title: "Nowruz, a shared new year",
      body: "Nowruz, the spring new year celebrated from West to South Asia, is a multinational UNESCO inscription. India is one of the named countries, and the inscription has been extended several times as more countries joined. In India it is observed especially by the Parsi community.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-10", category: c, difficulty: "historian", type: "mcq",
    prompt: "A Purna Kumbh Mela returns to the same city after roughly how many years?",
    options: ["4", "6", "12", "20"],
    answer: 2,
    explanation: {
      title: "The twelve-year cycle",
      body: "The Kumbh Mela at each of its four cities follows a cycle of about 12 years, set by the positions of Jupiter, the Sun and the Moon. Because the four cities take turns, a Kumbh is held somewhere roughly every three years.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-11", category: c, difficulty: "historian", type: "mcq",
    prompt: "Dhokra metal craft, practised in central and eastern India, uses which technique?",
    options: ["Lost-wax casting", "Enamel painting", "Filigree wire work", "Repoussé hammering"],
    answer: 0,
    explanation: {
      title: "Dhokra, an ancient casting method",
      body: "Dhokra artisans shape a figure in wax over a clay core, cover it in more clay, then heat it so the wax melts away and molten brass fills the space. The method is thousands of years old; the famous Dancing Girl from Mohenjo-daro was made with a similar technique.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-h-12", category: c, difficulty: "historian", type: "mcq",
    prompt: "In ikat weaving, such as Pochampally ikat of Telangana, what is dyed before the cloth is woven?",
    options: ["The yarn, using a tie and resist method", "The finished fabric, using blocks", "Only the border", "Nothing; colour is painted on later"],
    answer: 0,
    explanation: {
      title: "Ikat: pattern before weaving",
      body: "In ikat, bundles of yarn are tightly tied in sections and dyed, so the tied parts resist the colour. When the dyed yarns are woven, the pattern appears with a slightly blurred edge that is the signature of ikat.",
      trivia: "Pochampally village is often called the Silk City of India and its ikat carries a GI tag.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-h-13", category: c, difficulty: "historian", type: "mcq",
    prompt: "Sankirtana, inscribed by UNESCO in 2013, is ritual singing, drumming and dancing from which state?",
    options: ["Manipur", "Tripura", "Odisha", "Goa"],
    answer: 0,
    explanation: {
      title: "Sankirtana of Manipur",
      body: "Sankirtana is performed in Manipur at religious occasions and at major life events such as birth and marriage. Drummers and singers, often in white, perform in temples and homes, telling stories of Krishna through music and graceful dance.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-14", category: c, difficulty: "historian", type: "mcq",
    prompt: "UNESCO's 2014 inscription for Punjab recognises the Thatheras of Jandiala Guru for which craft?",
    options: ["Brass and copper utensil making", "Phulkari embroidery", "Wood inlay", "Leather footwear"],
    answer: 0,
    explanation: {
      title: "The Thatheras of Jandiala Guru",
      body: "The Thatheras hammer heated brass and copper sheets into vessels by hand, shaping and polishing them without machines. Metal is believed to be good for health, and these utensils are used in homes and in the langar kitchens of gurdwaras.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-15", category: c, difficulty: "historian", type: "true_false",
    prompt: "True or false: Madhubani painting was traditionally made by women on the walls and floors of their homes.",
    answer: true,
    explanation: {
      title: "From mud walls to paper",
      body: "For generations, women of the Mithila region painted walls and floors for weddings and festivals. After a severe drought in 1966 to 1968, the government encouraged artists to paint on paper so the work could be sold, which brought Madhubani art to a wider audience.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-h-16", category: c, difficulty: "historian", type: "mcq",
    prompt: "Pattachitra, the cloth scroll painting of Odisha, is most closely connected with which deity?",
    options: ["Jagannath of Puri", "Vithoba of Pandharpur", "Meenakshi of Madurai", "Kamakhya of Guwahati"],
    answer: 0,
    explanation: {
      title: "Pattachitra and Jagannath",
      body: "Pattachitra artists, known as chitrakars, work mostly around Puri, and many of their paintings show Jagannath, his siblings and the Rath Yatra. The cloth is coated with chalk and gum, and colours are made from natural materials such as conch shell and lamp black.",
      trivia: "Raghurajpur village near Puri is a heritage crafts village where almost every household paints.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "tra-h-17", category: c, difficulty: "historian", type: "odd_one_out",
    prompt: "Three of these are on UNESCO's intangible heritage list for India. Which one is not?",
    options: ["Buddhist chanting of Ladakh", "Sankirtana of Manipur", "Kumbh Mela", "Hornbill Festival"],
    answer: 3,
    explanation: {
      title: "Listed and not listed",
      body: "Buddhist chanting of Ladakh (2012), Sankirtana (2013) and the Kumbh Mela (2017) are all UNESCO-listed. The Hornbill Festival of Nagaland is a popular state-organised festival that began in 2000, but it is not on the UNESCO list.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-18", category: c, difficulty: "historian", type: "mcq",
    prompt: "Theyyam, in which performers are believed to become the deity, is a ritual form mainly of which region?",
    options: ["North Malabar, Kerala", "Coastal Andhra", "Saurashtra", "Chota Nagpur"],
    answer: 0,
    explanation: {
      title: "Theyyam",
      body: "Theyyam is performed in the villages and shrines of North Malabar, especially Kannur and Kasaragod. After elaborate makeup and a towering headdress, the performer is treated as the deity and blesses devotees. There are hundreds of distinct Theyyam forms, each with its own story and costume.",
    },
    source: SRC.knowIndia,
  },
  {
    id: "tra-h-19", category: c, difficulty: "historian", type: "mcq",
    prompt: "UNESCO inscribed the recitation of sacred Buddhist texts in the trans-Himalayan Ladakh region in which year?",
    options: ["2008", "2010", "2012", "2014"],
    answer: 2,
    explanation: {
      title: "Buddhist chanting of Ladakh",
      body: "Lamas in the monasteries and villages of Ladakh chant sacred texts to bring peace and well-being, often with hand gestures, drums, bells and cymbals. UNESCO inscribed the tradition in 2012.",
    },
    source: SRC.unescoIchIndia,
  },
  {
    id: "tra-h-20", category: c, difficulty: "historian", type: "chronology",
    prompt: "Arrange these environmental and cultural events in order, earliest first.",
    items: ["Khejarli sacrifice of the Bishnois", "Chipko movement begins in Chamoli", "Hornbill Festival first held", "Durga Puja in Kolkata inscribed by UNESCO"],
    explanation: {
      title: "From 1730 to 2021",
      body: "The Khejarli sacrifice took place in 1730. The Chipko movement began in 1973, the Hornbill Festival was first held in 2000, and UNESCO inscribed Durga Puja in Kolkata in 2021.",
    },
    source: CHIPKO,
  },
  {
    id: "tra-h-21", category: c, difficulty: "historian", type: "mcq",
    prompt: "Kutiyattam was traditionally performed in special temple theatres. What are they called?",
    options: ["Koothambalams", "Mandapas", "Rangmanch", "Natya sabhas"],
    answer: 0,
    explanation: {
      title: "The koothambalam",
      body: "Kutiyattam was performed by the Chakyar and Nambiar communities in koothambalams, theatres built inside temple compounds in Kerala. The Vadakkunnathan temple in Thrissur has one of the best known.",
    },
    source: SRC.unescoIchIndia,
  },
];
