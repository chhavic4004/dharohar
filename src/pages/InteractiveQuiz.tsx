import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  label: string;
  hindi: string;
  emoji: string;
  image: string;
  color: string;
};

type Difficulty = "seeker" | "historian";

type Question = {
  id: number;
  text: string;
  options: string[];
  correct: number;
  image?: string;
  insight: {
    title: string;
    body: string;
    trivia: string;
  };
};

type Screen = "lobby" | "question" | "results";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "rhythms",
    label: "Rhythms & Ragas",
    hindi: "राग और ताल",
    emoji: "🎵",
    image: "https://images.unsplash.com/photo-1568219656418-15c329312bf1?w=600&h=400&fit=crop&auto=format",
    color: "#7A1F35",
  },
  {
    id: "architecture",
    label: "Architectural Marvels",
    hindi: "स्थापत्य चमत्कार",
    emoji: "🏛️",
    image: "https://images.unsplash.com/photo-1698055689340-291dac6a7062?w=600&h=400&fit=crop&auto=format",
    color: "#C9622E",
  },
  {
    id: "culinary",
    label: "Culinary Roots",
    hindi: "पाककला की जड़ें",
    emoji: "🍛",
    image: "https://images.unsplash.com/photo-1546702005-7f8e5aeab4a6?w=600&h=400&fit=crop&auto=format",
    color: "#C68A1D",
  },
  {
    id: "traditions",
    label: "Living Traditions & Lore",
    hindi: "परम्परा और लोककथा",
    emoji: "🪔",
    image: "https://images.unsplash.com/photo-1756370256926-e48ca54c5efe?w=600&h=400&fit=crop&auto=format",
    color: "#3E6B4F",
  },
  {
    id: "rulers",
    label: "Rulers & Empires",
    hindi: "राजा और साम्राज्य",
    emoji: "👑",
    image: "https://images.unsplash.com/photo-1698055589154-a5e83f9006d1?w=600&h=400&fit=crop&auto=format",
    color: "#4A3728",
  },
];

const QUESTIONS: Record<string, Question[]> = {
  rhythms: [
    {
      id: 1,
      text: "Which raga is traditionally associated with dawn and the breaking light of early morning?",
      options: ["Yaman", "Bhairavi", "Bhairav", "Darbari Kanada"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1568219656418-15c329312bf1?w=800&h=400&fit=crop&auto=format",
      insight: {
        title: "Raga Bhairav — The Dawn Awakener",
        body: "Raga Bhairav is the quintessential morning raga, evoking the serene transition from darkness to light. Sung between 6–9 AM, it uses komal (flat) versions of Re, Ga, Dha, and Ni, giving it a deeply contemplative, devotional character.",
        trivia: "The name Bhairav is another name for Lord Shiva. Ancient texts describe this raga as capable of inducing a meditative trance in both performer and listener.",
      },
    },
    {
      id: 2,
      text: "The Carnatic music tradition uses a system of 72 parent scales. What are these called?",
      options: ["Thaats", "Melakarta", "Jati", "Raaganga"],
      correct: 1,
      insight: {
        title: "Melakarta — The Mother Scales",
        body: "The Melakarta system, codified by Venkatamakhi in the 17th century, organises 72 parent ragas from which all other Carnatic ragas derive. Each melakarta uses all seven notes of the octave in both ascent and descent.",
        trivia: "The 72 Melakartas are systematically derived by mathematical permutation of swara positions — a feat of musicological architecture unparalleled in world music.",
      },
    },
    {
      id: 3,
      text: "Tala Teentaal, the most common rhythmic cycle in Hindustani music, has how many beats?",
      options: ["12", "14", "16", "10"],
      correct: 2,
      insight: {
        title: "Teentaal — The Sixteen-Beat Universe",
        body: "Teentaal divides its 16 beats into four vibhags (sections) of 4 beats each, marked by claps and waves of the hand. It is the bedrock of khayal gayaki — the principal classical vocal genre of North India.",
        trivia: "The word 'taal' comes from the Sanskrit root meaning 'clapping of hands.' Ancient texts mention over 360 talas, though only a few dozen remain in active use today.",
      },
    },
    {
      id: 4,
      text: "Which instrument is described in ancient texts as 'Saraswati Veena' and is the national instrument of India?",
      options: ["Sitar", "Sarod", "Rudra Veena", "Veena (Saraswati Veena)"],
      correct: 3,
      insight: {
        title: "Saraswati Veena — Voice of the Goddess",
        body: "The Saraswati Veena, declared India's National Instrument, features a large resonating gourd, a long neck with 24 fixed frets, and four main strings. It is the instrument held by Goddess Saraswati herself in iconography.",
        trivia: "The Thanjavur Veena-making tradition, practiced by a small community of artisans, was inscribed on the UNESCO Intangible Cultural Heritage list in 2012.",
      },
    },
    {
      id: 5,
      text: "Dhrupad, the oldest form of Hindustani classical music, is historically associated with which royal court?",
      options: ["Maratha Court of Pune", "Mughal Court of Akbar", "Vijayanagara Empire", "Nizam of Hyderabad"],
      correct: 1,
      insight: {
        title: "Dhrupad — The Ancient Voice of Akbar's Court",
        body: "Dhrupad flourished under Emperor Akbar, who patronised the legendary Mian Tansen — one of the Navaratnas (nine gems) of his court. This austere, meditative form prioritises the manipulation of nada (pure sound) and is sung without accompaniment of tabla.",
        trivia: "Tansen is said to have had the power to light lamps with Raga Deepak and summon rain with Raga Megh Malhar. His descendants, the Senia gharana, continue the tradition today.",
      },
    },
  ],
  architecture: [
    {
      id: 1,
      text: "The intricate inlay work of coloured stones set into white marble, most famously seen at the Taj Mahal, is known as?",
      options: ["Jaali work", "Pietra dura", "Thikri work", "Kundan"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1698055589154-a5e83f9006d1?w=800&h=400&fit=crop&auto=format",
      insight: {
        title: "Pietra Dura — Flowers in Stone",
        body: "Pietra dura (Italian for 'hard stone') was introduced to Mughal India during Jahangir's reign. The Taj Mahal features over 28 types of precious and semi-precious stones sourced from across the world, including lapis lazuli from Afghanistan and turquoise from Iran.",
        trivia: "The floral inlay panels on the Taj's cenotaph chamber are considered the finest examples of this craft ever produced. Each flower took weeks to complete.",
      },
    },
    {
      id: 2,
      text: "The Brihadeeswarar Temple in Thanjavur, built by Raja Raja Chola I, is notable for which architectural achievement?",
      options: ["First temple with a floating foundation", "Its vimana (tower) casts no shadow at noon", "Built entirely without mortar", "Features the world's oldest working clock"],
      correct: 1,
      insight: {
        title: "The Shadow-less Vimana of Thanjavur",
        body: "The 66-metre vimana (tower) of Brihadeeswarar Temple is so precisely positioned that at noon, its shadow falls entirely within the temple complex rather than outside it. This 11th-century architectural marvel was built entirely from granite sourced from distant quarries.",
        trivia: "The massive capstone at the top of the vimana weighs approximately 80 tonnes. Scholars believe a ramp several kilometres long was used to haul it up — no cranes, no modern machinery.",
      },
    },
    {
      id: 3,
      text: "Jantar Mantar in Jaipur, built by Maharaja Jai Singh II, contains the world's largest stone sundial. What is it called?",
      options: ["Samrat Yantra", "Jai Prakash Yantra", "Ram Yantra", "Kapali Yantra"],
      correct: 0,
      insight: {
        title: "Samrat Yantra — The Supreme Instrument",
        body: "The Samrat Yantra at Jaipur's Jantar Mantar stands 27 metres high and can measure time to within two seconds accuracy. It was completed in 1738 CE and remains fully functional today, predating most European astronomical instruments of comparable precision.",
        trivia: "Maharaja Jai Singh II built five Jantar Mantars across India — in Jaipur, Delhi, Varanasi, Ujjain, and Mathura. He taught himself European astronomical methods and corresponded with Portuguese astronomers.",
      },
    },
    {
      id: 4,
      text: "Which architectural style, characterised by horseshoe arches and geometric stone lattices, flourished under the Gujarat Sultanate?",
      options: ["Kalinga architecture", "Indo-Saracenic", "Gujarat Sultanate style", "Deccan Sultanate style"],
      correct: 2,
      insight: {
        title: "Gujarat Sultanate Architecture — Stone Lace",
        body: "The Gujarat Sultanate style (15th–16th centuries) synthesised Hindu temple craft with Islamic form — producing exquisite jaali (lattice) screens, ornate mihrabs, and towering minarets carved from local sandstone. The Sidi Saiyyed Mosque's Tree of Life jaali is its supreme expression.",
        trivia: "The Sidi Saiyyed Mosque's jaali was so admired it became the logo of the Indian Institute of Management, Ahmedabad.",
      },
    },
    {
      id: 5,
      text: "The stepped wells of Gujarat and Rajasthan, combining water storage with elaborate temple sculpture, are called?",
      options: ["Kund", "Baoli / Vav", "Talab", "Pushkarini"],
      correct: 1,
      insight: {
        title: "Vav — The Inverted Temple",
        body: "Stepwells (vav or baoli) are essentially temples built underground around a water source. The Rani ki Vav at Patan, built by Queen Udayamati in the 11th century, descends seven storeys and features over 500 principal sculptures and 1,000 minor ones.",
        trivia: "Rani ki Vav was lost for centuries, buried under silt. Excavated in the 1980s, it was inscribed as a UNESCO World Heritage Site in 2014.",
      },
    },
  ],
  culinary: [
    {
      id: 1,
      text: "The spice blend 'Panch Phoron', used extensively in Bengali and Odia cooking, consists of exactly five whole spices. Which of these is NOT one of them?",
      options: ["Fenugreek seeds", "Nigella seeds", "Cumin seeds", "Cardamom pods"],
      correct: 3,
      image: "https://images.unsplash.com/photo-1546702005-7f8e5aeab4a6?w=800&h=400&fit=crop&auto=format",
      insight: {
        title: "Panch Phoron — The Five-Spice Tempering",
        body: "Panch Phoron consists of fenugreek (methi), nigella (kalonji), cumin (jeera), black mustard (sarson), and fennel (saunf) seeds in equal proportion. It is always used whole and fried in oil or ghee at the start of cooking to bloom its aromatics.",
        trivia: "Unlike Chinese five-spice powder, Panch Phoron is never ground. The interplay of bitter, sharp, sweet, and pungent notes develops only when the whole seeds hit hot fat.",
      },
    },
    {
      id: 2,
      text: "Biryani's name derives from the Persian word 'birian'. What does this word mean?",
      options: ["Layered rice", "Fried before cooking", "Mixed together", "Royal feast"],
      correct: 1,
      insight: {
        title: "Biryani — The Fried Origin",
        body: "'Birian' means 'fried before cooking' in Persian, referring to the technique of parboiling rice or meat before layering and slow-cooking (dum). The dish arrived with the Mughals and was transformed by each regional cuisine — Hyderabadi, Lucknawi, Kolkata, Malabar, and Chettinad styles each have distinct character.",
        trivia: "The Lucknawi (Awadhi) biryani uses a kacchi (raw) method where raw marinated meat and parboiled rice are cooked together under a sealed dum, infusing every grain.",
      },
    },
    {
      id: 3,
      text: "Which fermented South Indian breakfast dish, made from a batter of rice and urad dal, holds a Geographical Indication tag?",
      options: ["Appam", "Idli", "Dosa", "Puttu"],
      correct: 1,
      insight: {
        title: "Idli — The Ancient Steamed Cake",
        body: "Idli's earliest literary mention appears in a Kannada text from 920 CE. The fermentation process — driven by wild lactobacillus bacteria — makes it one of the most probiotic and nutritionally complete traditional foods. It is now served in over 30 countries.",
        trivia: "The ideal fermentation time is 8–16 hours. During this period, the batter's volume can double and its pH drops significantly, making idli light and digestible.",
      },
    },
    {
      id: 4,
      text: "The cooking technique 'dum pukht' (slow-cooking in a sealed vessel) was historically used partly because:",
      options: ["It preserved food longer in hot climates", "Royal tasters could not inspect the food midway", "Wood fuel was expensive and this method conserved it", "The sealed steam created a more even heat"],
      correct: 1,
      insight: {
        title: "Dum Pukht — The Sealed Secret",
        body: "Dum pukht (meaning 'breathe and cook' in Persian) used a sealed mahtaba (dough crust) to prevent royal tasters from interfering — once sealed, no one could add poison undetected. This court security measure produced the world's most flavourful slow-cooked cuisine.",
        trivia: "The legendary ITC Dum Pukht restaurant in Delhi took its name from this tradition. Their signature biryani is cooked for 3–4 hours in sealed vessels on slow charcoal.",
      },
    },
    {
      id: 5,
      text: "The world's most expensive spice by weight — used in Kashmiri Yakhni and Zarda — is grown primarily in which Indian valley?",
      options: ["Kullu Valley", "Pampore, Kashmir", "Coorg, Karnataka", "Wayanad, Kerala"],
      correct: 1,
      insight: {
        title: "Kashmiri Saffron — Red Gold of Pampore",
        body: "The Pampore region near Srinagar produces saffron with the world's highest crocin content — giving Kashmiri saffron its unique fragrance and intensely deep colour. Each flower must be hand-harvested at dawn and the stigmas extracted within hours.",
        trivia: "It takes approximately 150,000 flowers to produce just one kilogram of saffron. Kashmiri saffron received a Geographical Indication tag in 2020, protecting it from cheaper substitutes.",
      },
    },
  ],
  traditions: [
    {
      id: 1,
      text: "The Warli tribe of Maharashtra creates their celebrated paintings using a white paste made from which material?",
      options: ["Rice flour and water", "Limestone and egg white", "Chalk and milk", "Clay and turmeric"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1756370256926-e48ca54c5efe?w=800&h=400&fit=crop&auto=format",
      insight: {
        title: "Warli Art — Geometric Cosmos on Mud Walls",
        body: "Warli paintings use a simple rice paste on mud walls to depict circular, triangular, and square motifs representing the cosmos, harvest, and ritual. The central motif of a circle with radiating lines represents the sun — the source of all life.",
        trivia: "Warli art entered mainstream consciousness in the 1970s when artist Jivya Soma Mashe was 'discovered.' He went on to receive the Padma Shri and exhibit across Europe, never formally trained.",
      },
    },
    {
      id: 2,
      text: "The Kalbelia dance of Rajasthan, performed by the snake-charmer community, was inscribed on the UNESCO list in which year?",
      options: ["2003", "2010", "2016", "2019"],
      correct: 1,
      insight: {
        title: "Kalbelia — The Serpentine Dance",
        body: "Kalbelia dancers mimic the fluid, sinuous movement of cobras, wearing black skirts with intricate red and silver embroidery. The accompanying instrument is the poongi (been), traditionally used to charm snakes. Gulabo Sapera popularised the form internationally.",
        trivia: "Kalbelia songs are entirely oral — passed mother to daughter with no written notation. Each performance is improvised within traditional structures, meaning no two performances are alike.",
      },
    },
    {
      id: 3,
      text: "The Theyyam ritual performance of Kerala channels deities through which principal element of the performer's appearance?",
      options: ["Costume and jewellery", "Elaborate headdress (mudi)", "Body paint", "Sacred mask"],
      correct: 1,
      insight: {
        title: "Theyyam — When the Human Becomes Divine",
        body: "The Theyyam headdress (mudi) can tower 5–10 metres above the performer's head, constructed from bamboo, coconut leaves, and cloth. Once the mudi is worn and the ritual invocation complete, the performer is no longer human — they are the deity incarnate.",
        trivia: "There are over 400 distinct Theyyam forms, each with its own elaborate costume, makeup, and mythological backstory. The tradition is held primarily by lower-caste communities who, for the duration of the ritual, become gods worshipped by all castes.",
      },
    },
    {
      id: 4,
      text: "The festival of Pongal celebrated in Tamil Nadu is primarily a thanksgiving for which phenomenon?",
      options: ["The monsoon rains", "The harvest and the sun", "The new year", "The birth of Lord Murugan"],
      correct: 1,
      insight: {
        title: "Pongal — When Rice Boils Over with Joy",
        body: "Pongal (meaning 'to boil over') celebrates Uttarayan — the sun's northward journey — and the harvest. The ritual boiling-over of sweet rice (Sakkarai Pongal) symbolises abundance and prosperity. The festival spans four days, each with its own ritual.",
        trivia: "Jallikattu — the ancient bull-taming sport associated with Mattu Pongal — has been practiced for over 2,500 years. Cave paintings in the Madurai district depict the sport from the Neolithic era.",
      },
    },
    {
      id: 5,
      text: "The Bishnoi community of Rajasthan gave their lives in 1730 CE to protect which trees from being felled for a maharaja's palace?",
      options: ["Neem trees", "Khejri trees", "Peepal trees", "Banyan trees"],
      correct: 1,
      insight: {
        title: "The Khejri Martyrdom — India's First Environmental Protest",
        body: "In 1730 CE, Amrita Devi led the Bishnoi community in hugging Khejri trees (Prosopis cineraria) to prevent them being felled for Maharaja Abhay Singh's palace. 363 Bishnois were killed. The Maharaja, horrified, halted the felling and apologised.",
        trivia: "This event — 246 years before the Chipko movement — is considered the world's first recorded environmental protest. The Khejri is now Rajasthan's state tree, and the Bishnois remain its fiercest protectors.",
      },
    },
  ],
  rulers: [
    {
      id: 1,
      text: "Emperor Ashoka's conversion to Buddhism is traditionally dated after the Battle of Kalinga, around 261 BCE. What shocked him into conversion?",
      options: ["The death of his favourite general", "The scale of human suffering the war caused", "A vision of the Buddha in a dream", "His queen's plea for peace"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1698055589154-a5e83f9006d1?w=800&h=400&fit=crop&auto=format",
      insight: {
        title: "Kalinga — The War That Changed an Empire",
        body: "The Kalinga War killed an estimated 100,000 soldiers and 150,000 civilians, with many more dying of disease and famine afterward. Ashoka's own Rock Edict XIII records his anguish: 'What have I done? If this is victory, what is defeat?' He renounced war and propagated Dhamma across Asia.",
        trivia: "Ashoka's edicts — carved on rock faces and pillars across the subcontinent — are among the oldest surviving written records of India. His Lion Capital from Sarnath became India's national emblem.",
      },
    },
    {
      id: 2,
      text: "Which Maratha queen is celebrated for defending the fort of Jhansi and fighting against the British East India Company in 1857?",
      options: ["Ahilyabai Holkar", "Tarabai Bhosale", "Lakshmibai of Jhansi", "Kittur Chennamma"],
      correct: 2,
      insight: {
        title: "Rani Lakshmibai — The Warrior Queen of Jhansi",
        body: "Rani Lakshmibai led the defence of Jhansi Fort in 1858 after the British applied the Doctrine of Lapse to annex her kingdom. She died in battle at Gwalior aged just 29, reportedly dressed in male attire, sword in hand, her son tied to her back.",
        trivia: "General Hugh Rose, the British commander who defeated her, described her as 'the most dangerous of all the Indian leaders' and 'the bravest and best.' She has since become an enduring symbol of resistance.",
      },
    },
    {
      id: 3,
      text: "The Vijayanagara Empire at its height in the early 16th century was described by foreign visitors as equal to which European city?",
      options: ["Venice", "Constantinople (Istanbul)", "Rome", "Lisbon"],
      correct: 1,
      insight: {
        title: "Vijayanagara — The City as Large as Constantinople",
        body: "Portuguese traveller Domingo Paes, visiting around 1520 CE, described Vijayanagara as 'as large as Rome' and the king as 'the greatest ruler of India.' The city supported a population of 500,000–700,000 — making it one of the world's largest cities.",
        trivia: "The ruins of Hampi (ancient Vijayanagara) stretch across 40 square kilometres and are now a UNESCO World Heritage Site. The city was sacked and destroyed after the Battle of Talikota in 1565.",
      },
    },
    {
      id: 4,
      text: "Chandragupta II, known by which epithet meaning 'Sun of Power', ruled during what is often called India's 'Golden Age'?",
      options: ["Vikramaditya", "Samudragupta", "Skandagupta", "Chandragupta"],
      correct: 0,
      insight: {
        title: "Vikramaditya — The Golden Age Emperor",
        body: "Chandragupta II's reign (380–415 CE) saw flourishing art, literature, astronomy, and mathematics. His court included the nine gems (Navaratnas) — among them Kalidasa, the Sanskrit playwright, and Aryabhata, who proposed the Earth rotates on its axis.",
        trivia: "The Iron Pillar of Delhi, erected during the Gupta period, has stood rust-free for over 1,600 years — a metallurgical mystery that modern science has only recently begun to explain.",
      },
    },
    {
      id: 5,
      text: "Tipu Sultan of Mysore is credited with deploying which novel weapon system against the British that terrified European armies?",
      options: ["Armoured war elephants", "Iron-cased rockets (Mysorean rockets)", "Flamethrowers", "Submarine mines in rivers"],
      correct: 1,
      insight: {
        title: "Mysorean Rockets — The First Modern Rockets",
        body: "Tipu Sultan's iron-cased rockets could travel up to 2 kilometres and were attached to bamboo poles for stability. He deployed them in mass brigades of 1,200 rocketmen. The British captured these rockets and William Congreve used them as the basis for the Congreve rocket.",
        trivia: "The 'rockets' red glare' in the American national anthem refers to Congreve rockets — which were themselves inspired by Tipu Sultan's Mysorean rockets. India's space programme named its rocket facility at Thiruvananthapuram after Tipu's rocket base.",
      },
    },
  ],
};

const BADGES: Record<number, { label: string; hindi: string; emoji: string; description: string }> = {
  5: { label: "Heritage Master", hindi: "धरोहर गुरु", emoji: "🏆", description: "Perfect score! A true keeper of Indian heritage." },
  4: { label: "Cultural Scholar", hindi: "सांस्कृतिक विद्वान", emoji: "📜", description: "Excellent! You know India's heritage deeply." },
  3: { label: "Heritage Seeker", hindi: "धरोहर अन्वेषक", emoji: "🔍", description: "Good effort! Keep exploring India's rich past." },
  2: { label: "Curious Learner", hindi: "जिज्ञासु शिष्य", emoji: "🌱", description: "A great start on your heritage journey." },
  1: { label: "Novice Explorer", hindi: "नवीन खोजी", emoji: "🧭", description: "Every master was once a beginner. Try again!" },
  0: { label: "Novice Explorer", hindi: "नवीन खोजी", emoji: "🧭", description: "Every master was once a beginner. Try again!" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 border-b border-[#7A1F35]/20 bg-[#F3ECDA]/95 backdrop-blur-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#7A1F35] hover:text-[#C9622E] transition-colors text-sm font-medium"
      >
        <span className="text-lg leading-none">←</span>
        <span>Back</span>
      </button>
      <div className="flex flex-col items-center">
        <span className="font-serif text-base font-semibold text-[#241B1D] tracking-wide">धरोहर</span>
        <span className="text-[10px] text-[#7A1F35] tracking-widest uppercase font-medium">Heritage Quiz</span>
      </div>
      <div className="w-16 flex justify-end">
        <span className="text-[#C68A1D] text-lg">✦</span>
      </div>
    </header>
  );
}

function CategoryCard({ cat, selected, onClick }: { cat: Category; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-2xl overflow-hidden transition-all duration-300 text-left ${
        selected
          ? "scale-[1.02] shadow-xl"
          : "hover:scale-[1.02] hover:shadow-lg shadow-md"
      }`}
      style={{ outline: selected ? `2px solid ${cat.color}` : "none", outlineOffset: "2px" }}
    >
      <div className="relative h-36 bg-[#241B1D]">
        <img
          src={cat.image}
          alt={cat.label}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-300"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${cat.color}dd 0%, transparent 60%)` }}
        />
        {selected && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow">
            <span className="text-[#3E6B4F] text-sm font-bold">✓</span>
          </div>
        )}
        <div className="absolute top-3 left-3 text-2xl">{cat.emoji}</div>
      </div>
      <div
        className="px-4 py-3"
        style={{ backgroundColor: selected ? cat.color : "#EDE4CE" }}
      >
        <p
          className="font-serif font-semibold text-sm leading-tight"
          style={{ color: selected ? "#fff" : "#241B1D" }}
        >
          {cat.label}
        </p>
        <p
          className="text-xs mt-0.5 font-devanagari"
          style={{ color: selected ? "rgba(255,255,255,0.75)" : "#7A1F35" }}
        >
          {cat.hindi}
        </p>
      </div>
    </button>
  );
}

// ─── Screen 1: Lobby ──────────────────────────────────────────────────────────

function LobbyScreen({
  onStart,
}: {
  onStart: (category: string, difficulty: Difficulty) => void;
}) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("seeker");

  const canStart = selectedCat !== null;
  const cat = CATEGORIES.find((c) => c.id === selectedCat);

  return (
    <div className="min-h-screen bg-[#F3ECDA] pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#241B1D] pt-12 pb-16 px-5 text-center">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, #C68A1D 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <p className="text-[#C68A1D] text-xs tracking-[0.3em] uppercase font-medium mb-3 font-devanagari">
            भारत की अमर धरोहर
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F3ECDA] leading-tight mb-3">
            Heritage & Culture Quiz
          </h1>
          <p className="text-[#C9622E] font-serif italic text-lg mb-1">धरोहर प्रश्नोत्तरी</p>
          <p className="text-[#F3ECDA]/60 text-sm max-w-sm mx-auto leading-relaxed mt-3">
            Test your knowledge of India's living traditions, art, architecture, cuisine, and rulers.
          </p>
          <div className="flex justify-center gap-3 mt-5">
            {["5 Questions", "2 Difficulty Levels", "Heritage Insights"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-[#F3ECDA]/80 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {/* Ornamental rule */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#F3ECDA]"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
        {/* Category selection */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#7A1F35]/20" />
            <h2 className="font-serif text-lg font-semibold text-[#241B1D]">Choose a Category</h2>
            <div className="h-px flex-1 bg-[#7A1F35]/20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                selected={selectedCat === cat.id}
                onClick={() => setSelectedCat(cat.id)}
              />
            ))}
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#7A1F35]/20" />
            <h2 className="font-serif text-lg font-semibold text-[#241B1D]">Select Difficulty</h2>
            <div className="h-px flex-1 bg-[#7A1F35]/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "seeker" as Difficulty,
                label: "Seeker",
                hindi: "साधक",
                sub: "Casual — No time limit",
                icon: "🪔",
                desc: "Explore at your own pace with heritage context after every answer.",
              },
              {
                id: "historian" as Difficulty,
                label: "Historian",
                hindi: "इतिहासकार",
                sub: "Timed — 30s per question",
                icon: "⏳",
                desc: "Race against time. Every second counts in the archives.",
              },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`rounded-2xl p-5 text-left transition-all duration-200 border-2 ${
                  difficulty === d.id
                    ? "border-[#7A1F35] bg-[#7A1F35] text-white shadow-lg scale-[1.02]"
                    : "border-[#7A1F35]/20 bg-white/60 hover:border-[#7A1F35]/50 hover:bg-white/80"
                }`}
              >
                <div className="text-2xl mb-2">{d.icon}</div>
                <p className={`font-serif font-bold text-base ${difficulty === d.id ? "text-white" : "text-[#241B1D]"}`}>
                  {d.label}
                </p>
                <p className={`font-devanagari text-xs mb-1.5 ${difficulty === d.id ? "text-white/70" : "text-[#7A1F35]"}`}>
                  {d.hindi}
                </p>
                <p className={`text-xs font-medium mb-2 ${difficulty === d.id ? "text-[#F3ECDA]" : "text-[#C9622E]"}`}>
                  {d.sub}
                </p>
                <p className={`text-xs leading-snug ${difficulty === d.id ? "text-white/80" : "text-[#241B1D]/60"}`}>
                  {d.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={() => canStart && onStart(selectedCat!, difficulty)}
            disabled={!canStart}
            className={`w-full py-4 rounded-2xl font-serif font-bold text-lg transition-all duration-300 ${
              canStart
                ? "bg-[#7A1F35] text-white shadow-lg hover:bg-[#C9622E] hover:shadow-xl active:scale-[0.98]"
                : "bg-[#241B1D]/10 text-[#241B1D]/30 cursor-not-allowed"
            }`}
          >
            {canStart ? `Begin — ${cat?.label}` : "Select a Category to Begin"}
          </button>
          {canStart && (
            <p className="text-center text-xs text-[#241B1D]/40 mt-2">
              5 questions · {difficulty === "historian" ? "30s timer per question" : "No time limit"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Question ───────────────────────────────────────────────────────

function QuestionScreen({
  category,
  difficulty,
  onFinish,
}: {
  category: string;
  difficulty: Difficulty;
  onFinish: (score: number, answers: number[], questions: Question[]) => void;
}) {
  const questions = QUESTIONS[category] ?? [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [insightOpen, setInsightOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [zoomed, setZoomed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const q = questions[current];
  const isAnswered = selected !== null || timedOut;
  const isCorrect = selected === q.correct;

  useEffect(() => {
    setSelected(null);
    setInsightOpen(false);
    setTimedOut(false);
    setTimeLeft(30);
  }, [current]);

  useEffect(() => {
    if (difficulty !== "historian" || isAnswered) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      setAnswers((a) => [...a, -1]);
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, difficulty, isAnswered]);

  const handleSelect = useCallback(
    (idx: number) => {
      if (isAnswered) return;
      setSelected(idx);
      const correct = idx === q.correct;
      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
      setAnswers((a) => [...a, idx]);
      setTimeout(() => setInsightOpen(true), 600);
    },
    [isAnswered, q.correct]
  );

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onFinish(score + (selected === q.correct ? 0 : 0), answers, questions);
    }
  };

  const optionLabels = ["A", "B", "C", "D"];

  const optionClass = (idx: number) => {
    const base =
      "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ";
    if (!isAnswered) {
      return base + "border-[#7A1F35]/15 bg-white/70 hover:border-[#7A1F35]/50 hover:bg-white hover:shadow-md cursor-pointer";
    }
    if (idx === q.correct) {
      return base + "border-[#3E6B4F] bg-[#3E6B4F]/10 shadow-md";
    }
    if (idx === selected && !isCorrect) {
      return base + "border-[#C9622E] bg-[#C9622E]/10";
    }
    return base + "border-[#7A1F35]/10 bg-white/40 opacity-60";
  };

  const progress = ((current) / questions.length) * 100;
  const timerPct = (timeLeft / 30) * 100;

  return (
    <div className="min-h-screen bg-[#F3ECDA]">
      {/* Stats bar */}
      <div className="sticky top-0 z-40 bg-[#F3ECDA]/95 backdrop-blur-sm border-b border-[#7A1F35]/15 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#241B1D]/50 uppercase tracking-widest">Score</span>
            <span className="font-serif font-bold text-[#7A1F35] text-lg">{score}</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-[#241B1D]/50">
              Question <strong className="text-[#241B1D]">{current + 1}</strong> of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {streak >= 2 && (
              <span className="text-xs bg-[#C68A1D] text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                🔥 ×{streak}
              </span>
            )}
            <span className="text-[10px] text-[#241B1D]/50 uppercase tracking-widest">Streak</span>
            <span className="font-serif font-bold text-[#C68A1D] text-lg">{streak}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto h-1.5 rounded-full bg-[#7A1F35]/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#7A1F35] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {difficulty === "historian" && !isAnswered && (
          <div className="max-w-2xl mx-auto mt-1.5 h-1 rounded-full bg-[#C9622E]/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-[#A83E22]" : "bg-[#C9622E]"}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        )}
        {difficulty === "historian" && !isAnswered && (
          <p className={`text-center text-xs mt-1 ${timeLeft <= 10 ? "text-[#A83E22] font-bold" : "text-[#241B1D]/40"}`}>
            {timeLeft}s
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Heritage image */}
        {q.image && (
          <div className="relative rounded-2xl overflow-hidden shadow-lg cursor-zoom-in" onClick={() => setZoomed(true)}>
            <img
              src={q.image}
              alt="Heritage visual"
              className="w-full h-44 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#241B1D]/60 to-transparent" />
            <span className="absolute bottom-2 right-3 text-white/60 text-xs">Tap to zoom ↗</span>
          </div>
        )}

        {/* Question */}
        <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-[#7A1F35]/10">
          <p className="text-[#7A1F35] text-xs uppercase tracking-widest font-medium mb-3">
            {CATEGORIES.find((c) => c.id === category)?.emoji}{" "}
            {CATEGORIES.find((c) => c.id === category)?.label}
          </p>
          <p className="font-serif text-xl font-semibold text-[#241B1D] leading-snug">{q.text}</p>
        </div>

        {/* Answer options */}
        <div className="space-y-2.5">
          {q.options.map((opt, idx) => (
            <button key={idx} className={optionClass(idx)} onClick={() => handleSelect(idx)}>
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                  isAnswered && idx === q.correct
                    ? "bg-[#3E6B4F] text-white"
                    : isAnswered && idx === selected && !isCorrect
                    ? "bg-[#C9622E] text-white"
                    : "bg-[#7A1F35]/10 text-[#7A1F35]"
                }`}
              >
                {isAnswered && idx === q.correct ? "✓" : isAnswered && idx === selected && !isCorrect ? "✗" : optionLabels[idx]}
              </span>
              <span className="text-sm text-[#241B1D] leading-snug pt-0.5">{opt}</span>
            </button>
          ))}
        </div>

        {/* Timed out notice */}
        {timedOut && (
          <div className="bg-[#A83E22]/10 border border-[#A83E22]/30 rounded-xl p-4 text-center">
            <p className="text-[#A83E22] font-semibold text-sm">⏰ Time's up!</p>
            <p className="text-[#241B1D]/60 text-xs mt-1">
              Correct answer: <strong>{q.options[q.correct]}</strong>
            </p>
          </div>
        )}

        {/* Heritage Insight */}
        {isAnswered && (
          <div className="rounded-2xl border border-[#C68A1D]/40 overflow-hidden shadow-sm">
            <button
              onClick={() => setInsightOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#C68A1D]/10 hover:bg-[#C68A1D]/15 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <div className="text-left">
                  <p className="font-serif font-semibold text-[#241B1D] text-sm">Heritage Insight</p>
                  <p className="text-[#C68A1D] text-xs">{q.insight.title}</p>
                </div>
              </div>
              <span className={`text-[#7A1F35] transition-transform duration-300 ${insightOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {insightOpen && (
              <div className="px-5 py-4 bg-white/80 space-y-3">
                <p className="text-[#241B1D]/80 text-sm leading-relaxed">{q.insight.body}</p>
                <div className="flex gap-2 items-start pt-1 border-t border-[#C68A1D]/20">
                  <span className="text-base flex-shrink-0 mt-0.5">✨</span>
                  <p className="text-xs text-[#241B1D]/60 leading-relaxed italic">{q.insight.trivia}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-[#7A1F35] text-white font-serif font-bold text-base hover:bg-[#C9622E] transition-all duration-200 shadow-lg active:scale-[0.98]"
          >
            {current < questions.length - 1 ? "Next Question →" : "See Results →"}
          </button>
        )}
      </div>

      {/* Zoom overlay */}
      {zoomed && q.image && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <img src={q.image.replace("w=800", "w=1400")} alt="Heritage visual" className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl">✕</button>
        </div>
      )}
    </div>
  );
}

// ─── Screen 3: Results ────────────────────────────────────────────────────────

function ResultsScreen({
  score,
  totalQuestions,
  answers,
  questions,
  category,
  onRetry,
  onChangeCategory,
}: {
  score: number;
  totalQuestions: number;
  answers: number[];
  questions: Question[];
  category: string;
  onRetry: () => void;
  onChangeCategory: () => void;
}) {
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const badge = BADGES[score] ?? BADGES[0];
  const cat = CATEGORIES.find((c) => c.id === category)!;
  const pct = Math.round((score / totalQuestions) * 100);

  const handleShare = () => {
    const text = `I scored ${score}/${totalQuestions} on the Dharohar Heritage Quiz — ${cat.label}! 🇮🇳 #Dharohar #IndianHeritage`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3ECDA] pb-16">
      {/* Hero result */}
      <div
        className="relative pt-12 pb-14 px-5 text-center overflow-hidden"
        style={{ backgroundColor: cat.color }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 80%, #F3ECDA 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10">
          <div className="text-6xl mb-3">{badge.emoji}</div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1">{badge.label}</h2>
          <p className="font-devanagari text-white/70 text-sm mb-4">{badge.hindi}</p>
          <div className="inline-flex items-baseline gap-1 bg-white/20 rounded-2xl px-6 py-3 mb-3">
            <span className="font-serif text-5xl font-bold text-white">{score}</span>
            <span className="text-white/60 text-xl">/{totalQuestions}</span>
          </div>
          <p className="text-white/70 text-sm">{badge.description}</p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-10 bg-[#F3ECDA]"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {/* Score ring */}
        <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-[#7A1F35]/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold text-[#241B1D]">Your Performance</h3>
            <span className="text-[#C68A1D] font-bold text-sm">{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-[#7A1F35]/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: cat.color }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#241B1D]/50">
            <span>✓ {score} correct</span>
            <span>✗ {totalQuestions - score} incorrect</span>
          </div>
        </div>

        {/* Answer breakdown */}
        <div>
          <h3 className="font-serif font-semibold text-[#241B1D] mb-3">Answer Breakdown</h3>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const ans = answers[i];
              const correct = ans === q.correct;
              const timedOut = ans === -1;
              return (
                <div
                  key={q.id}
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: correct ? "#3E6B4F40" : "#C9622E40" }}
                >
                  <div
                    className="flex items-start gap-3 p-4"
                    style={{ backgroundColor: correct ? "#3E6B4F08" : "#C9622E08" }}
                  >
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ backgroundColor: correct ? "#3E6B4F" : "#C9622E" }}
                    >
                      {correct ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#241B1D]/80 font-medium leading-snug">{q.text}</p>
                      <p className="text-xs mt-1.5" style={{ color: correct ? "#3E6B4F" : "#C9622E" }}>
                        {timedOut ? "⏰ Timed out" : correct ? `Your answer: ${q.options[ans]}` : `Your answer: ${q.options[ans]}`}
                      </p>
                      {!correct && (
                        <p className="text-xs text-[#3E6B4F] mt-0.5">
                          Correct: {q.options[q.correct]}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                      className="flex-shrink-0 text-[#C68A1D] text-xs mt-0.5 hover:underline"
                    >
                      📜
                    </button>
                  </div>
                  {expandedInsight === i && (
                    <div className="px-4 pb-4 pt-2 bg-[#C68A1D]/5 border-t border-[#C68A1D]/20">
                      <p className="text-xs font-semibold text-[#C68A1D] mb-1">{q.insight.title}</p>
                      <p className="text-xs text-[#241B1D]/70 leading-relaxed">{q.insight.body}</p>
                      <p className="text-xs text-[#241B1D]/50 italic mt-1.5">{q.insight.trivia}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action grid */}
        <div className="space-y-3">
          <h3 className="font-serif font-semibold text-[#241B1D]">What's Next?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetry}
              className="col-span-2 py-4 rounded-2xl bg-[#7A1F35] text-white font-serif font-bold text-base hover:bg-[#C9622E] transition-all shadow-lg active:scale-[0.98]"
            >
              🔄 Retry This Quiz
            </button>
            <button
              onClick={onChangeCategory}
              className="py-3 rounded-xl border-2 border-[#7A1F35] text-[#7A1F35] font-semibold text-sm hover:bg-[#7A1F35]/5 transition-all"
            >
              🗂 Change Category
            </button>
            <button
              onClick={handleShare}
              className="py-3 rounded-xl border-2 border-[#C68A1D] text-[#C68A1D] font-semibold text-sm hover:bg-[#C68A1D]/5 transition-all"
            >
              📤 Share Score
            </button>
          </div>

          <div className="bg-[#241B1D]/5 rounded-2xl p-5 border border-[#241B1D]/10">
            <p className="text-xs text-[#241B1D]/50 uppercase tracking-widest mb-3 font-medium">Explore Dharohar</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Preserve a Story", icon: "📖", href: "/preserve" },
                { label: "Heritage Passport", icon: "🛂", href: "/passport" },
                { label: "Explore Map", icon: "🗺", href: "/map" },
                { label: "AR Walk", icon: "📡", href: "/ar-walk" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/70 hover:bg-white transition-colors border border-[#241B1D]/8 text-sm text-[#241B1D]/70 hover:text-[#7A1F35]"
                >
                  <span>{link.icon}</span>
                  <span className="text-xs font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function InteractiveQuiz() {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>("seeker");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizKey, setQuizKey] = useState(0);

  const handleStart = (cat: string, diff: Difficulty) => {
    setCategory(cat);
    setDifficulty(diff);
    setScreen("question");
    setQuizKey((k) => k + 1);
  };

  const handleFinish = (finalScore: number, finalAnswers: number[], _qs: Question[]) => {
    setScore(finalScore);
    setAnswers(finalAnswers);
    setScreen("results");
  };

  const handleRetry = () => {
    setScreen("question");
    setQuizKey((k) => k + 1);
  };

  const handleBack = () => {
    if (screen === "question") {
      if (confirm("Exit the quiz? Your progress will be lost.")) setScreen("lobby");
    } else if (screen === "results") {
      setScreen("lobby");
    } else {
      window.history.back();
    }
  };

  const questions = QUESTIONS[category] ?? [];

  return (
    <div className="min-h-screen bg-[#F3ECDA]">
      <TopBar onBack={handleBack} />
      {screen === "lobby" && <LobbyScreen onStart={handleStart} />}
      {screen === "question" && (
        <QuestionScreen
          key={quizKey}
          category={category}
          difficulty={difficulty}
          onFinish={(s, a) => handleFinish(s, a, questions)}
        />
      )}
      {screen === "results" && (
        <ResultsScreen
          score={score}
          totalQuestions={questions.length}
          answers={answers}
          questions={questions}
          category={category}
          onRetry={handleRetry}
          onChangeCategory={() => setScreen("lobby")}
        />
      )}
    </div>
  );
}
