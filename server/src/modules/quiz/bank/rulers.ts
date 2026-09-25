import { SRC, type BankQuestion } from "./types";

const c = "rulers" as const;

const ASHOKA = SRC.britannica("biography/Ashoka", "Ashoka");
const MUGHAL = SRC.britannica("topic/Mughal-dynasty", "Mughal dynasty");
const GUPTA = SRC.britannica("topic/Gupta-dynasty", "Gupta dynasty");
const CHOLA = SRC.britannica("topic/Chola-dynasty", "Chola dynasty");
const VIJAYANAGAR = SRC.britannica("place/Vijayanagar", "Vijayanagar");
const EMBLEM = { label: "National Portal of India: State Emblem", url: "https://www.india.gov.in/explore-india/facts-of-india/national-identity/state-emblem" };

export const rulersQuestions: BankQuestion[] = [
  // ─────────────── SEEKER ───────────────
  {
    id: "rul-s-01", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which Mughal emperor built the Taj Mahal in memory of his wife Mumtaz Mahal?",
    options: ["Akbar", "Jahangir", "Shah Jahan", "Aurangzeb"],
    answer: 2,
    explanation: {
      title: "Shah Jahan, the builder emperor",
      body: "Shah Jahan ruled from 1628 to 1658 and commissioned the Taj Mahal after Mumtaz Mahal died in 1631. His reign also produced the Red Fort and Jama Masjid in Delhi. He spent his last years confined in Agra Fort by his son Aurangzeb.",
    },
    source: SRC.whc(252, "Taj Mahal"),
  },
  {
    id: "rul-s-02", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Emperor Ashoka belonged to which dynasty?",
    options: ["Gupta", "Maurya", "Kushan", "Chola"],
    answer: 1,
    explanation: {
      title: "Ashoka the Maurya",
      body: "Ashoka, grandson of Chandragupta Maurya, ruled most of the Indian subcontinent in the 3rd century BCE. His edicts, carved on rocks and pillars, are among the oldest surviving written records in India.",
    },
    source: ASHOKA,
  },
  {
    id: "rul-s-03", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which war filled Ashoka with remorse and turned him towards Buddhism and non-violence?",
    options: ["Kalinga War", "Battle of Hydaspes", "Battle of Tarain", "Battle of Panipat"],
    answer: 0,
    explanation: {
      title: "After Kalinga",
      body: "Around 261 BCE Ashoka conquered Kalinga, roughly present-day Odisha. In his Rock Edict XIII he describes the deaths and suffering of the war and his deep regret. He then promoted dhamma, a moral code of tolerance, non-violence and care for all living beings.",
    },
    source: ASHOKA,
  },
  {
    id: "rul-s-04", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Chanakya, also known as Kautilya, was the adviser of which ruler?",
    options: ["Chandragupta Maurya", "Harshavardhana", "Samudragupta", "Kanishka"],
    answer: 0,
    explanation: {
      title: "Chanakya and Chandragupta",
      body: "Tradition holds that Chanakya helped Chandragupta Maurya overthrow the Nanda dynasty and found the Maurya Empire around 321 BCE. He is traditionally credited with the Arthashastra, a detailed treatise on statecraft, economy and war.",
    },
    source: SRC.britannica("biography/Kautilya", "Kautilya"),
  },
  {
    id: "rul-s-05", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Rani Lakshmibai led the fight against the British in 1857 as the queen of which state?",
    options: ["Jhansi", "Kittur", "Awadh", "Gwalior"],
    answer: 0,
    explanation: {
      title: "The Rani of Jhansi",
      body: "The British annexed Jhansi under the Doctrine of Lapse after Lakshmibai's husband died without a natural heir. During the revolt of 1857 she defended the fort of Jhansi and later fought near Gwalior, where she died in battle in June 1858.",
    },
    source: SRC.britannica("biography/Lakshmi-Bai", "Lakshmi Bai"),
  },
  {
    id: "rul-s-06", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Chhatrapati Shivaji Maharaj was crowned in 1674 at which hill fort?",
    options: ["Raigad", "Sinhagad", "Pratapgad", "Torna"],
    answer: 0,
    explanation: {
      title: "Coronation at Raigad",
      body: "Shivaji was crowned Chhatrapati at Raigad in 1674, formally founding the Maratha kingdom. He is remembered for his network of hill forts, guerrilla tactics, a strong navy along the Konkan coast and an efficient system of administration.",
    },
    source: SRC.britannica("biography/Shivaji", "Shivaji"),
  },
  {
    id: "rul-s-07", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: Akbar founded the Mughal Empire in India.",
    answer: false,
    explanation: {
      title: "Babur founded the empire",
      body: "The Mughal Empire was founded by Babur, Akbar's grandfather, after he defeated Ibrahim Lodi at the First Battle of Panipat in 1526. Akbar, who ruled from 1556 to 1605, greatly expanded and strengthened the empire.",
    },
    source: MUGHAL,
  },
  {
    id: "rul-s-08", category: c, difficulty: "seeker", type: "match",
    prompt: "Match each ruler with their dynasty.",
    pairs: [
      ["Ashoka", "Maurya"],
      ["Samudragupta", "Gupta"],
      ["Rajaraja I", "Chola"],
      ["Krishnadevaraya", "Vijayanagara"],
    ],
    explanation: {
      title: "Rulers and their houses",
      body: "Ashoka was a Maurya emperor, Samudragupta a great Gupta conqueror, Rajaraja I the Chola king who built the Thanjavur temple, and Krishnadevaraya the most celebrated ruler of the Vijayanagara Empire.",
    },
    source: SRC.britannica("place/India/The-Mauryan-empire", "History of India"),
  },
  {
    id: "rul-s-09", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Maharaja Ranjit Singh, known as Sher-e-Punjab, founded the Sikh Empire with its capital at which city?",
    options: ["Lahore", "Amritsar", "Patiala", "Ludhiana"],
    answer: 0,
    explanation: {
      title: "The Lion of Punjab",
      body: "Ranjit Singh captured Lahore in 1799 and was proclaimed Maharaja of Punjab in 1801. He built a modern army and ruled a large, stable kingdom until his death in 1839. He also covered the Harmandir Sahib in Amritsar with gilded copper, giving it the name Golden Temple.",
    },
    source: SRC.britannica("biography/Ranjit-Singh-Sikh-maharaja", "Ranjit Singh"),
  },
  {
    id: "rul-s-10", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Tipu Sultan, the Tiger of Mysore, fought against which power in a series of wars?",
    options: ["The British East India Company", "The Portuguese", "The Mughals", "The Dutch"],
    answer: 0,
    explanation: {
      title: "Tipu Sultan",
      body: "Tipu Sultan ruled Mysore from 1782 to 1799 and fought the British East India Company in the Anglo-Mysore Wars. He was killed defending his capital, Srirangapatna, in 1799. His army was known for using iron-cased rockets.",
    },
    source: SRC.britannica("biography/Tippu-Sultan", "Tipu Sultan"),
  },
  {
    id: "rul-s-11", category: c, difficulty: "seeker", type: "odd_one_out",
    prompt: "Three of these were Mughal emperors. Which one was not?",
    options: ["Babur", "Humayun", "Jahangir", "Sher Shah Suri"],
    answer: 3,
    explanation: {
      title: "Sher Shah Suri, the rival",
      body: "Sher Shah Suri founded the Sur Empire after defeating Humayun in 1540 and ruled North India until 1545. In his short reign he introduced the silver rupiya and improved the road later known as the Grand Trunk Road. Humayun regained the throne in 1555.",
    },
    source: SRC.britannica("biography/Sher-Shah-of-Sur", "Sher Shah of Sur"),
  },
  {
    id: "rul-s-12", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Rudrama Devi, one of the few women to rule a major South Indian kingdom, belonged to which dynasty?",
    options: ["Kakatiya", "Hoysala", "Pandya", "Chera"],
    answer: 0,
    explanation: {
      title: "Rudrama Devi of the Kakatiyas",
      body: "Rudrama Devi ruled the Kakatiya kingdom from Warangal in the 13th century. The Venetian traveller Marco Polo, who visited the region, wrote admiringly about the queen and her rule.",
    },
    source: { label: "Rudrama Devi (Wikipedia, with cited references)", url: "https://en.wikipedia.org/wiki/Rudrama_Devi" },
  },
  {
    id: "rul-s-13", category: c, difficulty: "seeker", type: "mcq",
    prompt: "The Ahom dynasty ruled which region for about 600 years?",
    options: ["Assam", "Bengal", "Odisha", "Tripura"],
    answer: 0,
    explanation: {
      title: "Six centuries of the Ahoms",
      body: "The Ahoms arrived in the Brahmaputra valley in 1228 under their founder Sukaphaa and ruled until the early 19th century. They successfully resisted repeated Mughal invasions and kept detailed court chronicles called buranjis.",
    },
    source: SRC.britannica("topic/Ahom", "Ahom"),
  },
  {
    id: "rul-s-14", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: The Lion Capital of Ashoka from Sarnath is the State Emblem of India.",
    answer: true,
    explanation: {
      title: "The Lion Capital",
      body: "India adopted the Lion Capital of Ashoka from Sarnath as its State Emblem on 26 January 1950. The emblem shows three of its four lions, with the motto Satyameva Jayate, 'Truth alone triumphs', written below in Devanagari.",
      trivia: "The Ashoka Chakra in the centre of the national flag also comes from this capital.",
    },
    source: EMBLEM,
  },
  {
    id: "rul-s-15", category: c, difficulty: "seeker", type: "mcq",
    prompt: "In which battle did Babur defeat Ibrahim Lodi in 1526?",
    options: ["First Battle of Panipat", "Battle of Khanwa", "Battle of Haldighati", "Battle of Plassey"],
    answer: 0,
    explanation: {
      title: "Panipat, 1526",
      body: "At the First Battle of Panipat, Babur's smaller army used field artillery and tight cavalry tactics to defeat the Delhi Sultan Ibrahim Lodi. The victory laid the foundation of the Mughal Empire.",
    },
    source: MUGHAL,
  },
  {
    id: "rul-s-16", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Krishnadevaraya was the most celebrated ruler of which empire?",
    options: ["Vijayanagara", "Bahmani", "Chalukya", "Pala"],
    answer: 0,
    explanation: {
      title: "Krishnadevaraya of Vijayanagara",
      body: "Krishnadevaraya ruled from 1509 to 1529, when Vijayanagara was at its height. He was a strong military leader, a patron of art and literature and a poet himself, writing the Telugu work Amuktamalyada.",
    },
    source: VIJAYANAGAR,
  },
  {
    id: "rul-s-17", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which Chola king built the Brihadisvara temple at Thanjavur?",
    options: ["Rajaraja I", "Karikala", "Kulothunga I", "Rajadhiraja"],
    answer: 0,
    explanation: {
      title: "Rajaraja I",
      body: "Rajaraja I ruled from 985 to 1014 and turned the Cholas into a major power in South India and Sri Lanka. The Brihadisvara temple, completed in 1010, has a vimana (tower) nearly 60 metres high and is still an active temple.",
    },
    source: SRC.whc(250, "Great Living Chola Temples"),
  },
  {
    id: "rul-s-18", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Akbar built the city of Fatehpur Sikri near Agra. For roughly how long was it the Mughal capital?",
    options: ["About 10 years", "About 50 years", "About 100 years", "About 200 years"],
    answer: 0,
    explanation: {
      title: "The short-lived capital",
      body: "Fatehpur Sikri was built in the 1570s and served as Akbar's capital for only about a decade before the court moved away, possibly because of water shortages and political needs. Its well-preserved palaces and mosque are a World Heritage Site.",
    },
    source: SRC.whc(255, "Fatehpur Sikri"),
  },
  {
    id: "rul-s-19", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: Rani Lakshmibai died fighting near Gwalior in 1858.",
    answer: true,
    explanation: {
      title: "The last battle",
      body: "After Jhansi fell to the British, Lakshmibai joined other rebel leaders and helped capture Gwalior. She was killed in battle there in June 1858. The British commander Hugh Rose later described her as the most dangerous of the rebel leaders.",
    },
    source: SRC.britannica("biography/Lakshmi-Bai", "Lakshmi Bai"),
  },
  {
    id: "rul-s-20", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which empire had its capital at Pataliputra, near present-day Patna?",
    options: ["Maurya", "Chola", "Vijayanagara", "Maratha"],
    answer: 0,
    explanation: {
      title: "Pataliputra",
      body: "Pataliputra was the capital of the Maurya Empire and later of the Guptas. The Greek ambassador Megasthenes, who visited the Maurya court, described it as a huge city protected by wooden walls and a deep moat.",
    },
    source: ASHOKA,
  },
  {
    id: "rul-s-21", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which Mughal emperor completed the Red Fort in Delhi?",
    options: ["Shah Jahan", "Babur", "Humayun", "Bahadur Shah Zafar"],
    answer: 0,
    explanation: {
      title: "Shah Jahan's Red Fort",
      body: "Shah Jahan moved his capital from Agra to Delhi and built the new city of Shahjahanabad with the Red Fort as its palace. The fort was completed in 1648 and includes the Diwan-i-Aam and Diwan-i-Khas halls of audience.",
    },
    source: SRC.whc(231, "Red Fort Complex"),
  },

  // ─────────────── HISTORIAN ───────────────
  {
    id: "rul-h-01", category: c, difficulty: "historian", type: "mcq",
    prompt: "Chandragupta II of the Gupta dynasty is best known by which title?",
    options: ["Vikramaditya", "Devanampiya", "Gangaikonda", "Sher-e-Punjab"],
    answer: 0,
    explanation: {
      title: "Chandragupta II Vikramaditya",
      body: "Chandragupta II ruled from about 380 to 415 CE and took the title Vikramaditya. His reign is often seen as a high point of Gupta culture. The Chinese pilgrim Faxian travelled through India during this period and described it as peaceful and prosperous.",
    },
    source: GUPTA,
  },
  {
    id: "rul-h-02", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Allahabad Pillar inscription praising Samudragupta's conquests was composed by which court poet?",
    options: ["Harishena", "Banabhatta", "Kalidasa", "Kalhana"],
    answer: 0,
    explanation: {
      title: "Harishena's praise poem",
      body: "Harishena wrote the Prayaga Prashasti, carved on an older Ashokan pillar now at Prayagraj. It lists the kings Samudragupta defeated and praises him as a warrior, poet and musician.",
      trivia: "Some of Samudragupta's gold coins show him playing the veena.",
    },
    source: GUPTA,
  },
  {
    id: "rul-h-03", category: c, difficulty: "historian", type: "mcq",
    prompt: "Rajendra I took the title Gangaikonda Chola. What does it commemorate?",
    options: ["His northern campaign that reached the Ganga", "His coronation on the Ganga", "A temple he built at Varanasi", "His marriage to a northern princess"],
    answer: 0,
    explanation: {
      title: "The Chola who reached the Ganga",
      body: "Rajendra I, son of Rajaraja I, sent an army north that reached the Ganga around 1019 to 1021. He took the title Gangaikonda Chola, 'the Chola who took the Ganga', and built a new capital, Gangaikondacholapuram, with a great temple.",
    },
    source: CHOLA,
  },
  {
    id: "rul-h-04", category: c, difficulty: "historian", type: "true_false",
    prompt: "True or false: The Chola naval expedition against the Srivijaya kingdom around 1025 was led during the reign of Rajaraja I.",
    answer: false,
    explanation: {
      title: "It was Rajendra I",
      body: "The famous overseas expedition against Srivijaya, in present-day Indonesia and Malaysia, took place around 1025 under Rajendra I, not his father Rajaraja I. It shows how far Chola naval power reached across the Bay of Bengal.",
    },
    source: CHOLA,
  },
  {
    id: "rul-h-05", category: c, difficulty: "historian", type: "chronology",
    prompt: "Arrange these rulers by when they reigned, earliest first.",
    items: ["Ashoka", "Chandragupta II", "Rajaraja I", "Akbar"],
    explanation: {
      title: "Across two thousand years",
      body: "Ashoka ruled in the 3rd century BCE, Chandragupta II in the late 4th and early 5th century CE, Rajaraja I from 985 to 1014, and Akbar from 1556 to 1605.",
    },
    source: SRC.britannica("place/India", "History of India"),
  },
  {
    id: "rul-h-06", category: c, difficulty: "historian", type: "chronology",
    prompt: "Arrange these battles in the order they were fought, earliest first.",
    items: ["First Battle of Panipat", "Battle of Talikota", "Battle of Plassey", "Battle of Buxar"],
    explanation: {
      title: "Battles that changed India",
      body: "Panipat (1526) began Mughal rule. Talikota (1565) led to the fall of Vijayanagara. Plassey (1757) gave the East India Company control of Bengal, and Buxar (1764) confirmed British power in eastern India.",
    },
    source: SRC.britannica("place/India", "History of India"),
  },
  {
    id: "rul-h-07", category: c, difficulty: "historian", type: "mcq",
    prompt: "Most of Ashoka's edicts within India are written in which script?",
    options: ["Brahmi", "Devanagari", "Grantha", "Sharada"],
    answer: 0,
    explanation: {
      title: "Reading Ashoka",
      body: "Most of Ashoka's edicts were written in Prakrit using the Brahmi script. Those in the north-west used Kharosthi, and some in present-day Afghanistan used Greek and Aramaic. James Prinsep deciphered Brahmi in 1837, which finally let historians read the edicts again.",
    },
    source: ASHOKA,
  },
  {
    id: "rul-h-08", category: c, difficulty: "historian", type: "mcq",
    prompt: "What was the name of the hall at Fatehpur Sikri where Akbar held discussions with scholars of many religions?",
    options: ["Ibadat Khana", "Diwan-i-Khas", "Sheesh Mahal", "Naubat Khana"],
    answer: 0,
    explanation: {
      title: "The Ibadat Khana",
      body: "Akbar built the Ibadat Khana, or House of Worship, in 1575. He invited Sunni and Shia scholars, Hindu pandits, Jains, Zoroastrians and Jesuit priests to debate there. These discussions shaped his policy of sulh-i-kul, or peace with all.",
    },
    source: MUGHAL,
  },
  {
    id: "rul-h-09", category: c, difficulty: "historian", type: "mcq",
    prompt: "At the Battle of Saraighat in 1671, which Ahom general defeated the Mughal fleet on the Brahmaputra?",
    options: ["Lachit Borphukan", "Bir Chilarai", "Sukaphaa", "Momai Tamuli Borbarua"],
    answer: 0,
    explanation: {
      title: "Lachit Borphukan at Saraighat",
      body: "Lachit Borphukan led the Ahom forces near present-day Guwahati and defeated a much larger Mughal army in a river battle on the Brahmaputra. Assam marks 24 November as Lachit Divas in his honour.",
    },
    source: SRC.britannica("topic/Ahom", "Ahom"),
  },
  {
    id: "rul-h-10", category: c, difficulty: "historian", type: "match",
    prompt: "Match each ruler with their capital.",
    pairs: [
      ["Chandragupta Maurya", "Pataliputra"],
      ["Harshavardhana", "Kannauj"],
      ["Krishnadevaraya", "Vijayanagara (Hampi)"],
      ["Ranjit Singh", "Lahore"],
    ],
    explanation: {
      title: "Seats of power",
      body: "The Mauryas ruled from Pataliputra, Harsha made Kannauj the leading city of North India in the 7th century, Krishnadevaraya ruled from Vijayanagara (today's Hampi), and Ranjit Singh governed the Sikh Empire from Lahore.",
    },
    source: SRC.britannica("place/India", "History of India"),
  },
  {
    id: "rul-h-11", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Harshacharita, a biography of King Harshavardhana, was written by which poet?",
    options: ["Banabhatta", "Harishena", "Bilhana", "Jayadeva"],
    answer: 0,
    explanation: {
      title: "Banabhatta's Harshacharita",
      body: "Banabhatta was the court poet of Harsha in the 7th century. His Harshacharita, written in ornate Sanskrit prose, is one of the earliest biographies of an Indian king.",
    },
    source: SRC.britannica("biography/Harsha", "Harsha"),
  },
  {
    id: "rul-h-12", category: c, difficulty: "historian", type: "mcq",
    prompt: "Which Chinese pilgrim visited India and studied at Nalanda during the reign of Harsha?",
    options: ["Xuanzang", "Faxian", "Yijing", "Zheng He"],
    answer: 0,
    explanation: {
      title: "Xuanzang in India",
      body: "Xuanzang travelled through India between about 630 and 645 CE, studied at Nalanda and met Harsha. His detailed account, the Great Tang Records on the Western Regions, is a key source for the history of the period.",
      trivia: "Faxian came earlier, during the reign of Chandragupta II, and Yijing came later in the 7th century.",
    },
    source: SRC.britannica("biography/Xuanzang", "Xuanzang"),
  },
  {
    id: "rul-h-13", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Kakatiya dynasty ruled from which capital city?",
    options: ["Warangal", "Golconda", "Devagiri", "Dwarasamudra"],
    answer: 0,
    explanation: {
      title: "Warangal, the Kakatiya capital",
      body: "The Kakatiyas ruled much of present-day Telangana and Andhra Pradesh from Warangal, then called Orugallu, between the 12th and 14th centuries. Warangal Fort still preserves their finely carved stone gateways, known as the Kakatiya Kala Thoranam.",
    },
    source: SRC.britannica("place/Warangal", "Warangal"),
  },
  {
    id: "rul-h-14", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Doctrine of Lapse, used to annex Jhansi, Satara and Nagpur, was pursued by which Governor-General?",
    options: ["Lord Dalhousie", "Lord Wellesley", "Lord Cornwallis", "Lord Canning"],
    answer: 0,
    explanation: {
      title: "Dalhousie's Doctrine of Lapse",
      body: "Under Lord Dalhousie (1848 to 1856), the British refused to recognise adopted heirs of Indian rulers and took over their states. Satara, Jhansi and Nagpur were annexed this way, and the anger it caused was one of the causes of the revolt of 1857.",
    },
    source: SRC.britannica("topic/doctrine-of-lapse", "Doctrine of lapse"),
  },
  {
    id: "rul-h-15", category: c, difficulty: "historian", type: "odd_one_out",
    prompt: "Which of these is NOT traditionally counted among the nine jewels (navaratnas) of Akbar's court?",
    options: ["Tansen", "Birbal", "Abul Fazl", "Kalidasa"],
    answer: 3,
    explanation: {
      title: "Akbar's navaratnas",
      body: "Tansen, Birbal and Abul Fazl are traditionally counted among Akbar's navaratnas. Kalidasa, the great Sanskrit poet, lived more than a thousand years earlier and is traditionally linked with the court of a king called Vikramaditya.",
    },
    source: MUGHAL,
  },
  {
    id: "rul-h-16", category: c, difficulty: "historian", type: "mcq",
    prompt: "Krishnadevaraya wrote Amuktamalyada, a celebrated literary work, in which language?",
    options: ["Telugu", "Kannada", "Tamil", "Persian"],
    answer: 0,
    explanation: {
      title: "A king who wrote poetry",
      body: "Amuktamalyada tells the story of Andal, the Tamil poet-saint devoted to Vishnu, and is considered a classic of Telugu literature. Krishnadevaraya's court was home to eight great Telugu poets known as the Ashtadiggajas.",
    },
    source: VIJAYANAGAR,
  },
  {
    id: "rul-h-17", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Vijayanagara Empire was founded in 1336 by two brothers of which dynasty?",
    options: ["Sangama", "Saluva", "Tuluva", "Aravidu"],
    answer: 0,
    explanation: {
      title: "Harihara and Bukka",
      body: "Harihara I and Bukka Raya I of the Sangama dynasty founded Vijayanagara on the banks of the Tungabhadra in 1336. Three more dynasties followed: the Saluva, the Tuluva (to which Krishnadevaraya belonged) and the Aravidu.",
    },
    source: VIJAYANAGAR,
  },
  {
    id: "rul-h-18", category: c, difficulty: "historian", type: "true_false",
    prompt: "True or false: Akbar started a spiritual order called Din-i Ilahi.",
    answer: true,
    explanation: {
      title: "Din-i Ilahi",
      body: "Around 1582 Akbar started Din-i Ilahi, meaning 'divine faith', a small spiritual order that drew on ideas from several religions and stressed loyalty to the emperor. It had few followers and ended with Akbar's death, but it reflects his interest in religious harmony.",
    },
    source: MUGHAL,
  },
  {
    id: "rul-h-19", category: c, difficulty: "historian", type: "mcq",
    prompt: "Who deciphered the Brahmi script in 1837, making Ashoka's edicts readable again?",
    options: ["James Prinsep", "William Jones", "Alexander Cunningham", "John Marshall"],
    answer: 0,
    explanation: {
      title: "James Prinsep",
      body: "James Prinsep, an official of the Asiatic Society of Bengal, cracked the Brahmi script in 1837. This revealed that the edicts were issued by a king called Devanampiya Piyadasi, who scholars later confirmed was Ashoka.",
    },
    source: ASHOKA,
  },
  {
    id: "rul-h-20", category: c, difficulty: "historian", type: "match",
    prompt: "Match each ruler with a famous title or epithet.",
    pairs: [
      ["Ranjit Singh", "Sher-e-Punjab"],
      ["Tipu Sultan", "Tiger of Mysore"],
      ["Chandragupta II", "Vikramaditya"],
      ["Rajendra I", "Gangaikonda Chola"],
    ],
    explanation: {
      title: "Names that became legends",
      body: "Ranjit Singh was the Lion of Punjab, Tipu Sultan the Tiger of Mysore, Chandragupta II took the title Vikramaditya, and Rajendra I became Gangaikonda Chola after his northern campaign.",
    },
    source: SRC.britannica("place/India", "History of India"),
  },
  {
    id: "rul-h-21", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Battle of Talikota in 1565 led to the downfall of which empire's capital?",
    options: ["Vijayanagara", "Bahmani", "Maratha", "Kakatiya"],
    answer: 0,
    explanation: {
      title: "Talikota, 1565",
      body: "An alliance of Deccan sultanates defeated Vijayanagara at Talikota in 1565. The capital was then sacked over several months, and UNESCO notes the destruction led to the city's abandonment. The empire survived in a reduced form under the Aravidu dynasty.",
    },
    source: SRC.whc(241, "Group of Monuments at Hampi"),
  },
];
