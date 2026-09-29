import { SRC, type BankQuestion } from "./types";

const c = "culinary" as const;

const FAO_MILLETS = { label: "FAO: International Year of Millets 2023", url: "https://www.fao.org/millets-2023/en" };
const INCREDIBLE_INDIA = { label: "Incredible India, Ministry of Tourism", url: "https://www.incredibleindia.gov.in/" };
const TEA_BOARD = { label: "Tea Board of India", url: "https://www.teaboard.gov.in/" };
const COFFEE_BOARD = { label: "Coffee Board of India", url: "https://coffeeboard.gov.in/" };

export const culinaryQuestions: BankQuestion[] = [
  // ─────────────── SEEKER ───────────────
  {
    id: "cul-s-01", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which product became India's first registered Geographical Indication (GI)?",
    options: ["Basmati rice", "Darjeeling tea", "Alphonso mango", "Kashmiri saffron"],
    answer: 1,
    explanation: {
      title: "Darjeeling tea, GI number one",
      body: "Darjeeling tea was the first product registered under India's Geographical Indications Act, in 2004. A GI tag means only tea grown and processed in the defined Darjeeling hill areas can legally be sold under that name.",
      trivia: "Darjeeling tea is often called the champagne of teas for its delicate muscatel flavour.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-02", category: c, difficulty: "seeker", type: "mcq",
    prompt: "A classic dosa batter is made by fermenting rice with which lentil?",
    options: ["Urad dal (black gram)", "Masoor dal (red lentil)", "Moong dal (green gram)", "Rajma (kidney beans)"],
    answer: 0,
    explanation: {
      title: "Rice, urad dal and time",
      body: "Dosa and idli batters are made by soaking and grinding rice and urad dal, then leaving the batter to ferment, usually overnight. Fermentation makes the batter rise slightly, adds a mild tang and makes it easier to digest.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-03", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: Idli is made by steaming a fermented batter.",
    answer: true,
    explanation: {
      title: "Idli, the steamed cake",
      body: "Idli batter, made from rice and urad dal, is poured into round moulds and steamed rather than fried. This makes it one of the lightest traditional breakfasts of South India, usually served with sambar and chutney.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-04", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Litti chokha, a much-loved rustic meal, belongs mainly to which region?",
    options: ["Bihar", "Kerala", "Goa", "Kashmir"],
    answer: 0,
    explanation: {
      title: "Litti chokha of Bihar",
      body: "Litti are balls of wheat dough stuffed with spiced sattu (roasted gram flour) and roasted, traditionally over cow-dung cakes or coals. They are eaten with chokha, a smoky mash of roasted brinjal, tomato and potato.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-05", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Sattu, used in litti and in summer drinks, is flour made from what?",
    options: ["Roasted gram (chana)", "Raw rice", "Dried coconut", "Pearl millet"],
    answer: 0,
    explanation: {
      title: "Sattu, roasted gram flour",
      body: "Sattu is made by dry-roasting gram (chana) and grinding it into flour. Because it needs no further cooking, it is mixed with water, salt, lemon and spices into a cooling summer drink across Bihar, Jharkhand and eastern Uttar Pradesh.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-06", category: c, difficulty: "seeker", type: "odd_one_out",
    prompt: "Panch phoron, a Bengali and Odia spice mix, contains five whole spices. Which of these is NOT one of them?",
    options: ["Fenugreek seeds", "Nigella seeds", "Fennel seeds", "Cardamom"],
    answer: 3,
    explanation: {
      title: "The five in panch phoron",
      body: "Panch phoron is made of fenugreek, nigella (kalonji), cumin, black mustard and fennel seeds, usually in equal parts. The seeds are kept whole and crackled in hot oil or ghee at the start of cooking. Cardamom is not part of the mix.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-07", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: Chilli peppers are native to India and were used in Indian cooking in ancient times.",
    answer: false,
    explanation: {
      title: "Chillies came from the Americas",
      body: "Chilli peppers are native to the Americas. They reached India in the 16th century, largely through Portuguese traders, and spread so quickly that they are now central to Indian food. Before chillies, heat in Indian cooking came mainly from black pepper and long pepper.",
      trivia: "India is today the world's largest producer of chillies.",
    },
    source: SRC.britannica("plant/chili-pepper", "Chili pepper"),
  },
  {
    id: "cul-s-08", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Dhokla, a soft steamed savoury cake, is a speciality of which state?",
    options: ["Gujarat", "Punjab", "Odisha", "Tamil Nadu"],
    answer: 0,
    explanation: {
      title: "Dhokla of Gujarat",
      body: "Dhokla is made from a fermented batter, commonly of gram flour or rice and lentils, which is steamed and then topped with a tempering of mustard seeds, green chillies and curry leaves. It is a staple snack across Gujarat.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-09", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which spice, grown on the Malabar coast, was so valuable in ancient trade that it was called black gold?",
    options: ["Black pepper", "Clove", "Turmeric", "Cumin"],
    answer: 0,
    explanation: {
      title: "Pepper, the black gold",
      body: "Black pepper is native to the Western Ghats of South India. For more than two thousand years it drew traders from Rome, Arabia, China and later Europe to the Malabar coast, and it was worth so much that it was sometimes used like currency.",
    },
    source: SRC.britannica("plant/black-pepper-plant", "Black pepper"),
  },
  {
    id: "cul-s-10", category: c, difficulty: "seeker", type: "match",
    prompt: "Match each dish with the state it is most associated with.",
    pairs: [
      ["Dhokla", "Gujarat"],
      ["Litti chokha", "Bihar"],
      ["Bisi bele bath", "Karnataka"],
      ["Sarson da saag", "Punjab"],
    ],
    explanation: {
      title: "A plate from every corner",
      body: "Dhokla is Gujarati, litti chokha is from Bihar, bisi bele bath is a spiced rice and lentil dish from Karnataka, and sarson da saag, slow-cooked mustard greens, is a winter favourite of Punjab, usually eaten with makki di roti.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-11", category: c, difficulty: "seeker", type: "mcq",
    prompt: "The Alphonso mango, which has a GI tag, is grown mainly in which region?",
    options: ["Konkan coast of Maharashtra", "Malwa plateau", "Terai of Uttar Pradesh", "Brahmaputra valley"],
    answer: 0,
    explanation: {
      title: "Alphonso of the Konkan",
      body: "Alphonso mangoes, known locally as hapus, grow mainly in the Ratnagiri and Sindhudurg districts on Maharashtra's Konkan coast and nearby areas. They carry a GI tag, which protects the name from being used for mangoes grown elsewhere.",
      trivia: "The name is linked to Afonso de Albuquerque, the Portuguese general in Goa, whose era saw grafting techniques spread along the coast.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-12", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Bikaneri bhujia, a crunchy GI-tagged snack, comes from which state?",
    options: ["Rajasthan", "Madhya Pradesh", "West Bengal", "Kerala"],
    answer: 0,
    explanation: {
      title: "Bikaneri bhujia",
      body: "Bikaneri bhujia is made from moth bean and gram flour dough, pressed into thin strands and fried. It is named after the city of Bikaner in Rajasthan and received a GI tag in 2010.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-13", category: c, difficulty: "seeker", type: "mcq",
    prompt: "The Tirupati laddu, which has its own GI tag, is offered as prasadam at a temple in which state?",
    options: ["Andhra Pradesh", "Tamil Nadu", "Odisha", "Gujarat"],
    answer: 0,
    explanation: {
      title: "The Tirupati laddu",
      body: "The laddu is made at the Sri Venkateswara temple at Tirumala in Andhra Pradesh and handed out to devotees as prasadam. Its GI registration in 2009 means only the temple can make and sell laddus under that name.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-14", category: c, difficulty: "seeker", type: "odd_one_out",
    prompt: "Three of these are usually steamed. Which one is deep-fried?",
    options: ["Idli", "Dhokla", "Puttu", "Jalebi"],
    answer: 3,
    explanation: {
      title: "Steamed versus fried",
      body: "Idli, dhokla and puttu, a Kerala dish of rice flour and coconut steamed in a cylinder, are all steamed. Jalebi is made by piping fermented batter into hot oil in spirals and then soaking it in sugar syrup.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-15", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Pampore, famous for its purple crocus fields and GI-tagged saffron, is in which region?",
    options: ["Jammu and Kashmir", "Himachal Pradesh", "Sikkim", "Uttarakhand"],
    answer: 0,
    explanation: {
      title: "The saffron town of Pampore",
      body: "Pampore near Srinagar is the heart of Kashmiri saffron farming. Saffron is the dried stigma of the crocus flower, and each flower has only three, so it takes a huge number of hand-picked flowers to make a small amount of spice. Kashmir saffron received a GI tag in 2020.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-16", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Dal baati churma is a traditional meal from which state?",
    options: ["Rajasthan", "Kerala", "Assam", "Bihar"],
    answer: 0,
    explanation: {
      title: "Dal baati churma of Rajasthan",
      body: "Baati are hard wheat rolls baked over coals and dipped in ghee. They are eaten with dal and churma, a sweet made by crushing baati with ghee and sugar or jaggery. The dish suits the desert because baati keep well for long journeys.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-17", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Mysore pak, the famous sweet from Karnataka, is made mainly from gram flour, sugar and what?",
    options: ["Ghee", "Coconut milk", "Condensed milk", "Honey"],
    answer: 0,
    explanation: {
      title: "Mysore pak",
      body: "Mysore pak is made by cooking gram flour in generous amounts of ghee and sugar syrup. It is linked by tradition to the royal kitchens of the Mysore palace, where it is said to have been created.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-18", category: c, difficulty: "seeker", type: "true_false",
    prompt: "True or false: Pongal, the dish, shares its name with the Tamil harvest festival at which it is cooked.",
    answer: true,
    explanation: {
      title: "Pongal, the dish and the festival",
      body: "At the Pongal festival in January, families cook newly harvested rice with milk and jaggery in a pot until it boils over. The word pongal means 'boiling over', a sign of abundance for the year ahead. Savoury ven pongal, with rice, moong dal, pepper and ghee, is a common breakfast.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-s-19", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Feni, a traditional spirit with a GI tag, is distilled from cashew apples or coconut sap in which state?",
    options: ["Goa", "Punjab", "Nagaland", "Bihar"],
    answer: 0,
    explanation: {
      title: "Goan feni",
      body: "Feni is distilled in Goa either from the juice of cashew apples or from coconut palm sap. Cashew trees were brought to Goa by the Portuguese, and cashew feni has become a symbol of Goan heritage, with a GI tag since 2009.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-s-20", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Which state produces the largest share of India's tea?",
    options: ["Assam", "Kerala", "Himachal Pradesh", "Tamil Nadu"],
    answer: 0,
    explanation: {
      title: "Assam, India's tea heartland",
      body: "Assam produces more tea than any other Indian state, roughly half of the country's output. The Assam variety of the tea plant was identified in the region in the 1820s, and today the Brahmaputra valley is one of the largest tea-growing areas in the world.",
    },
    source: TEA_BOARD,
  },
  {
    id: "cul-s-21", category: c, difficulty: "seeker", type: "mcq",
    prompt: "Hyderabadi haleem, a slow-cooked dish of meat, wheat and lentils, is especially popular during which month?",
    options: ["Ramzan", "Shravan", "Kartik", "Magh"],
    answer: 0,
    explanation: {
      title: "Haleem in Ramzan",
      body: "Haleem is cooked for hours until meat, wheat, lentils and spices blend into a thick, smooth dish. In Hyderabad it is eaten above all during Ramzan to break the fast. It became the first meat dish in India to receive a GI tag, in 2010.",
    },
    source: SRC.giRegistry,
  },

  // ─────────────── HISTORIAN ───────────────
  {
    id: "cul-h-01", category: c, difficulty: "historian", type: "chronology",
    prompt: "Arrange these foods in the order they received their GI registration, earliest first.",
    items: ["Darjeeling tea", "Hyderabadi haleem", "Banglar rasogolla", "Kashmir saffron"],
    explanation: {
      title: "A timeline of taste",
      body: "Darjeeling tea was registered in 2004, Hyderabadi haleem in 2010, West Bengal's Banglar rasogolla in 2017 and Kashmir saffron in 2020.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-02", category: c, difficulty: "historian", type: "mcq",
    prompt: "After West Bengal's Banglar rasogolla got its GI tag in 2017, Odisha received a separate GI for 'Odisha rasagola' in which year?",
    options: ["2017", "2018", "2019", "2021"],
    answer: 2,
    explanation: {
      title: "Two states, two rasgullas",
      body: "West Bengal and Odisha have long debated where the rasgulla was born. The GI Registry settled the matter by registering both: Banglar rasogolla in 2017 and Odisha rasagola in 2019. Odisha links its version to offerings at the Jagannath temple in Puri.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-03", category: c, difficulty: "historian", type: "mcq",
    prompt: "In 1498 Vasco da Gama reached India by sea, landing near which spice-trading city?",
    options: ["Calicut (Kozhikode)", "Surat", "Masulipatnam", "Goa"],
    answer: 0,
    explanation: {
      title: "The sea route to the spices",
      body: "Vasco da Gama landed near Calicut on the Malabar coast in May 1498, ruled then by the Zamorin. The Portuguese came looking for direct access to pepper and other spices, which opened a new era of European trade and conquest in Asia.",
    },
    source: SRC.britannica("biography/Vasco-da-Gama", "Vasco da Gama"),
  },
  {
    id: "cul-h-04", category: c, difficulty: "historian", type: "true_false",
    prompt: "True or false: Potatoes were a staple of Indian cooking long before the 16th century.",
    answer: false,
    explanation: {
      title: "The potato's late arrival",
      body: "The potato is a New World crop from the Andes of South America. It reached India only in the 17th century, probably through Portuguese and later British traders, and was widely grown only in the 19th century. Today it is hard to imagine dishes like aloo paratha or samosa without it.",
    },
    source: SRC.britannica("plant/potato", "Potato"),
  },
  {
    id: "cul-h-05", category: c, difficulty: "historian", type: "match",
    prompt: "Match each spice with its common Hindi name.",
    pairs: [
      ["Fenugreek", "Methi"],
      ["Nigella", "Kalonji"],
      ["Fennel", "Saunf"],
      ["Carom", "Ajwain"],
    ],
    explanation: {
      title: "Know your masala box",
      body: "Methi (fenugreek) is slightly bitter, kalonji (nigella) is small, black and onion-scented, saunf (fennel) is sweet and often chewed after meals, and ajwain (carom) has a strong thyme-like flavour that is added to fried snacks and breads.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-h-06", category: c, difficulty: "historian", type: "mcq",
    prompt: "At India's proposal, the United Nations declared 2023 the International Year of what?",
    options: ["Millets", "Pulses", "Rice", "Spices"],
    answer: 0,
    explanation: {
      title: "The International Year of Millets",
      body: "India proposed the idea and the UN General Assembly declared 2023 the International Year of Millets. Millets such as ragi, jowar and bajra are hardy, nutritious grains that grow well with little water, and they were staples across much of India for thousands of years.",
    },
    source: FAO_MILLETS,
  },
  {
    id: "cul-h-07", category: c, difficulty: "historian", type: "mcq",
    prompt: "Ragi, widely eaten in Karnataka as ragi mudde, is also known by which English name?",
    options: ["Finger millet", "Pearl millet", "Foxtail millet", "Sorghum"],
    answer: 0,
    explanation: {
      title: "Ragi, the finger millet",
      body: "Ragi is finger millet, named for its seed heads that spread out like fingers. It is rich in calcium and fibre. Pearl millet is bajra and sorghum is jowar.",
    },
    source: FAO_MILLETS,
  },
  {
    id: "cul-h-08", category: c, difficulty: "historian", type: "mcq",
    prompt: "Legend credits the Sufi saint Baba Budan with bringing the first coffee seeds to India. In which state are the hills named after him?",
    options: ["Karnataka", "Kerala", "Tamil Nadu", "Odisha"],
    answer: 0,
    explanation: {
      title: "Baba Budan and Indian coffee",
      body: "According to tradition, Baba Budan returned from a pilgrimage in the 17th century with seven coffee beans hidden in his clothes and planted them in the hills near Chikkamagaluru, Karnataka. Those hills are now called the Baba Budan Giri range, and Karnataka produces most of India's coffee.",
    },
    source: COFFEE_BOARD,
  },
  {
    id: "cul-h-09", category: c, difficulty: "historian", type: "odd_one_out",
    prompt: "Three of these hold a GI tag in India. Which does not?",
    options: ["Darjeeling tea", "Bikaneri bhujia", "Tirupati laddu", "Samosa"],
    answer: 3,
    explanation: {
      title: "What earns a GI tag",
      body: "A GI tag protects a product whose quality is tied to a specific place, such as Darjeeling tea, Bikaneri bhujia or the Tirupati laddu. The samosa is eaten across India and far beyond, and its roots trace back to Central Asia and the Middle East, so it has no single place of origin to protect.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-10", category: c, difficulty: "historian", type: "match",
    prompt: "Match each GI-tagged food with its state.",
    pairs: [
      ["Bikaneri bhujia", "Rajasthan"],
      ["Dharwad pedha", "Karnataka"],
      ["Joynagar moa", "West Bengal"],
      ["Tirupati laddu", "Andhra Pradesh"],
    ],
    explanation: {
      title: "Sweets and snacks with an address",
      body: "Bikaneri bhujia is from Rajasthan, Dharwad pedha is a caramelised milk sweet from Karnataka, Joynagar moa is a winter sweet from West Bengal made with puffed rice and date palm jaggery, and the Tirupati laddu comes from the temple at Tirumala in Andhra Pradesh.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-11", category: c, difficulty: "historian", type: "mcq",
    prompt: "Joynagar moa, a GI-tagged winter sweet of Bengal, gets its flavour from which special ingredient?",
    options: ["Nolen gur (date palm jaggery)", "Saffron", "Rose water", "Cardamom"],
    answer: 0,
    explanation: {
      title: "Nolen gur",
      body: "Joynagar moa is made from a fragrant variety of puffed rice called kanakchur khoi, bound with nolen gur, the fresh date palm jaggery collected only in winter. Because nolen gur is seasonal, genuine moa is available for just a few months each year.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-12", category: c, difficulty: "historian", type: "mcq",
    prompt: "Kashmiri saffron grows on the karewa soils around Pampore. What part of the crocus flower is the saffron itself?",
    options: ["The stigma", "The petal", "The pollen", "The bulb"],
    answer: 0,
    explanation: {
      title: "Threads of saffron",
      body: "Saffron threads are the dried red stigmas of the Crocus sativus flower. Each flower has only three, and they must be picked by hand soon after the flowers open in autumn, which is why saffron is among the most expensive spices in the world.",
    },
    source: SRC.britannica("topic/saffron", "Saffron"),
  },
  {
    id: "cul-h-13", category: c, difficulty: "historian", type: "true_false",
    prompt: "True or false: Hyderabadi haleem was the first meat-based product in India to receive a GI tag.",
    answer: true,
    explanation: {
      title: "A first for meat",
      body: "Hyderabadi haleem was registered as a GI in 2010, the first non-vegetarian food to get one in India. The registration sets rules for the ingredients and slow-cooking process that give it its character.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-14", category: c, difficulty: "historian", type: "mcq",
    prompt: "Which region of the Western Ghats is best known in India for its long history of coffee estates?",
    options: ["Kodagu (Coorg)", "Kutch", "Bundelkhand", "Marwar"],
    answer: 0,
    explanation: {
      title: "Coffee in Kodagu",
      body: "Kodagu, or Coorg, in Karnataka is one of India's major coffee regions, growing both Arabica and Robusta under the shade of tall forest trees. Shade-grown coffee helps protect the region's rich biodiversity.",
    },
    source: COFFEE_BOARD,
  },
  {
    id: "cul-h-15", category: c, difficulty: "historian", type: "chronology",
    prompt: "Arrange these events in Indian food history, earliest first.",
    items: [
      "Vasco da Gama reaches Calicut seeking spices",
      "Chillies spread through India after Portuguese contact",
      "Darjeeling tea becomes India's first GI",
      "UN International Year of Millets, proposed by India",
    ],
    explanation: {
      title: "Five centuries on a plate",
      body: "Vasco da Gama arrived in 1498. Chillies spread across India through the 16th century after Portuguese contact. Darjeeling tea was registered as a GI in 2004, and the International Year of Millets was celebrated in 2023.",
    },
    source: SRC.britannica("biography/Vasco-da-Gama", "Vasco da Gama"),
  },
  {
    id: "cul-h-16", category: c, difficulty: "historian", type: "mcq",
    prompt: "Malabar pepper, the black pepper with a GI tag, comes from which state?",
    options: ["Kerala", "Assam", "Gujarat", "Rajasthan"],
    answer: 0,
    explanation: {
      title: "Malabar pepper",
      body: "Malabar pepper is grown in the hills of Kerala and parts of Karnataka and was traded through ports such as Muziris and Calicut for centuries. Its GI tag recognises the long link between this spice and the Malabar coast.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-17", category: c, difficulty: "historian", type: "mcq",
    prompt: "Which of these ingredients is used to make a traditional tempering (tadka) of sambar in South India?",
    options: ["Mustard seeds and curry leaves", "Saffron and rose water", "Cinnamon and cloves only", "Fennel and dried rose petals"],
    answer: 0,
    explanation: {
      title: "The South Indian tadka",
      body: "A typical sambar is finished with a tempering of mustard seeds, curry leaves, dried red chillies and a pinch of asafoetida (hing) fried in oil. Pouring this sizzling mix over the dish at the end releases the aromas into the whole pot.",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-h-18", category: c, difficulty: "historian", type: "true_false",
    prompt: "True or false: A GI tag can be registered for handicrafts and agricultural products, not just for food.",
    answer: true,
    explanation: {
      title: "More than food",
      body: "India's Geographical Indications Act covers agricultural goods, natural goods, manufactured goods, handicrafts and foodstuffs. That is why items as different as Darjeeling tea, Kanchipuram silk and Channapatna toys all carry GI tags.",
    },
    source: SRC.giRegistry,
  },
  {
    id: "cul-h-19", category: c, difficulty: "historian", type: "mcq",
    prompt: "Chettinad cuisine, known for its bold spice blends, comes from which state?",
    options: ["Tamil Nadu", "Kerala", "Telangana", "Maharashtra"],
    answer: 0,
    explanation: {
      title: "Chettinad kitchens",
      body: "Chettinad cuisine belongs to the Nattukottai Chettiar community of the Chettinad region in Tamil Nadu, a trading community that travelled across Southeast Asia. Their dishes use freshly ground spices such as black pepper, dried red chillies, star anise and kalpasi (black stone flower).",
    },
    source: INCREDIBLE_INDIA,
  },
  {
    id: "cul-h-20", category: c, difficulty: "historian", type: "mcq",
    prompt: "The Assam tea plant was identified in the region in the 1820s. Which Scottish trader is usually credited with learning of it from the Singpho community?",
    options: ["Robert Bruce", "Robert Fortune", "Thomas Lipton", "James Finlay"],
    answer: 0,
    explanation: {
      title: "Discovering Assam tea",
      body: "Robert Bruce learned in 1823 that the Singpho people of Assam were brewing a drink from a wild local plant. The plant turned out to be a variety of tea, and it became the basis of Assam's huge tea industry. The Singpho had been drinking it long before any European arrived.",
      trivia: "Robert Fortune, by contrast, is famous for smuggling Chinese tea plants and seeds into India in the 1840s and 1850s.",
    },
    source: TEA_BOARD,
  },
  {
    id: "cul-h-21", category: c, difficulty: "historian", type: "odd_one_out",
    prompt: "Three of these are millets. Which one is not?",
    options: ["Jowar", "Bajra", "Ragi", "Basmati"],
    answer: 3,
    explanation: {
      title: "Millets and rice",
      body: "Jowar (sorghum), bajra (pearl millet) and ragi (finger millet) are millets, hardy grains that need far less water than rice or wheat. Basmati is a long-grain aromatic rice grown mainly in the Indo-Gangetic plains.",
    },
    source: FAO_MILLETS,
  },
];
