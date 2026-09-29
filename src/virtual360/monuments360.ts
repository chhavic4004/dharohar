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

export type Monument360Lang = "en" | "hi" | "pa" | "ur";

/** Translatable text fields of a monument (ids, category keys and urls stay unchanged). */
export type Monument360TextFields = Pick<Monument360, "name" | "city" | "state" | "shortDescription">;

/** Translations keyed by monument id. English lives on the monument itself. */
export const monuments360Translations: Record<
  string,
  Record<Exclude<Monument360Lang, "en">, Monument360TextFields>
> = {
  "brihadishwara-temple": {
    hi: {
      name: "बृहदेश्वर मंदिर",
      city: "तंजावुर",
      state: "तमिलनाडु",
      shortDescription: "चोल काल का एक विशाल मंदिर, जो अपनी वास्तुकला और ऊँचे विमान के लिए प्रसिद्ध है।",
    },
    pa: {
      name: "ਬ੍ਰਿਹਦੇਸ਼ਵਰ ਮੰਦਰ",
      city: "ਤੰਜਾਵੁਰ",
      state: "ਤਾਮਿਲ ਨਾਡੂ",
      shortDescription: "ਚੋਲ ਕਾਲ ਦਾ ਇੱਕ ਵਿਸ਼ਾਲ ਮੰਦਰ, ਜੋ ਆਪਣੀ ਵਾਸਤੂਕਲਾ ਅਤੇ ਉੱਚੇ ਵਿਮਾਨ ਲਈ ਮਸ਼ਹੂਰ ਹੈ।",
    },
    ur: {
      name: "برہدیشور مندر",
      city: "تنجاور",
      state: "تمل ناڈو",
      shortDescription: "چول دور کا ایک عظیم الشان مندر، جو اپنے فنِ تعمیر اور بلند و بالا ومان کے لیے مشہور ہے۔",
    },
  },
  "taj-mahal": {
    hi: {
      name: "ताज महल",
      city: "आगरा",
      state: "उत्तर प्रदेश",
      shortDescription: "संगमरमर की वास्तुकला और सममित बनावट के लिए जाना जाने वाला मुग़ल काल का प्रतिष्ठित स्मारक।",
    },
    pa: {
      name: "ਤਾਜ ਮਹਿਲ",
      city: "ਆਗਰਾ",
      state: "ਉੱਤਰ ਪ੍ਰਦੇਸ਼",
      shortDescription: "ਸੰਗਮਰਮਰ ਦੀ ਵਾਸਤੂਕਲਾ ਅਤੇ ਸਮਮਿਤ ਬਣਤਰ ਲਈ ਜਾਣੀ ਜਾਂਦੀ ਮੁਗ਼ਲ ਕਾਲ ਦੀ ਪ੍ਰਸਿੱਧ ਯਾਦਗਾਰ।",
    },
    ur: {
      name: "تاج محل",
      city: "آگرہ",
      state: "اتر پردیش",
      shortDescription: "سنگِ مرمر کے فنِ تعمیر اور متوازن ڈیزائن کے لیے مشہور مغل دور کی ایک شاندار یادگار۔",
    },
  },
  "arjuna-ratha-mahabalipuram": {
    hi: {
      name: "अर्जुन रथ",
      city: "महाबलीपुरम",
      state: "तमिलनाडु",
      shortDescription: "7वीं सदी का एकाश्म शैलकृत देवालय, पल्लव वंश के काल में एक ही ग्रेनाइट चट्टान से तराशे गए पाँच पंच रथों में से एक।",
    },
    pa: {
      name: "ਅਰਜੁਨ ਰਥ",
      city: "ਮਹਾਬਲੀਪੁਰਮ",
      state: "ਤਾਮਿਲ ਨਾਡੂ",
      shortDescription: "7ਵੀਂ ਸਦੀ ਦਾ ਇੱਕੋ ਚੱਟਾਨ ਵਿੱਚੋਂ ਤਰਾਸ਼ਿਆ ਦੇਵਾਲਾ, ਪੱਲਵ ਵੰਸ਼ ਦੇ ਸਮੇਂ ਇੱਕੋ ਗ੍ਰੇਨਾਈਟ ਚੱਟਾਨ ਤੋਂ ਘੜੇ ਗਏ ਪੰਜ ਪੰਚ ਰਥਾਂ ਵਿੱਚੋਂ ਇੱਕ।",
    },
    ur: {
      name: "ارجن رتھ",
      city: "مہابلی پورم",
      state: "تمل ناڈو",
      shortDescription: "ساتویں صدی کا ایک ہی چٹان سے تراشا گیا معبد، جو پلّو خاندان کے دور میں گرینائٹ کی ایک ہی چٹان سے تراشے گئے پانچ پنچ رتھوں میں سے ایک ہے۔",
    },
  },
  "konark-sun-temple": {
    hi: {
      name: "कोणार्क सूर्य मंदिर",
      city: "कोणार्क",
      state: "ओडिशा",
      shortDescription: "सूर्य देव के रथ के आकार में बनाया गया एक अद्भुत मंदिर परिसर।",
    },
    pa: {
      name: "ਕੋਣਾਰਕ ਸੂਰਜ ਮੰਦਰ",
      city: "ਕੋਣਾਰਕ",
      state: "ਓਡੀਸ਼ਾ",
      shortDescription: "ਸੂਰਜ ਦੇਵਤਾ ਦੇ ਰਥ ਦੇ ਰੂਪ ਵਿੱਚ ਬਣਾਇਆ ਗਿਆ ਇੱਕ ਅਦਭੁਤ ਮੰਦਰ ਕੰਪਲੈਕਸ।",
    },
    ur: {
      name: "کونارک سورج مندر",
      city: "کونارک",
      state: "اوڈیشہ",
      shortDescription: "سورج دیوتا کے رتھ کی شکل میں بنایا گیا ایک حیرت انگیز مندر کمپلیکس۔",
    },
  },
  "qutub-minar": {
    hi: {
      name: "क़ुतुब मीनार",
      city: "दिल्ली",
      state: "दिल्ली",
      shortDescription: "प्रतिष्ठित क़ुतुब मीनार और हिंद-इस्लामी वास्तुकला वाला एक ऐतिहासिक स्मारक परिसर।",
    },
    pa: {
      name: "ਕੁਤੁਬ ਮੀਨਾਰ",
      city: "ਦਿੱਲੀ",
      state: "ਦਿੱਲੀ",
      shortDescription: "ਪ੍ਰਸਿੱਧ ਕੁਤੁਬ ਮੀਨਾਰ ਅਤੇ ਹਿੰਦ-ਇਸਲਾਮੀ ਵਾਸਤੂਕਲਾ ਵਾਲਾ ਇੱਕ ਇਤਿਹਾਸਕ ਯਾਦਗਾਰੀ ਕੰਪਲੈਕਸ।",
    },
    ur: {
      name: "قطب مینار",
      city: "دہلی",
      state: "دہلی",
      shortDescription: "مشہور قطب مینار اور ہند اسلامی فنِ تعمیر پر مشتمل ایک تاریخی یادگاری احاطہ۔",
    },
  },
  "krishna-temple-hampi": {
    hi: {
      name: "कृष्ण मंदिर",
      city: "हम्पी",
      state: "कर्नाटक",
      shortDescription: "16वीं सदी का विजयनगर कालीन मंदिर, जिसे कृष्णदेवराय ने अपने ओडिशा अभियान की स्मृति में बनवाया था; यह अपने बारीक नक्काशीदार गोपुरम के लिए जाना जाता है।",
    },
    pa: {
      name: "ਕ੍ਰਿਸ਼ਨ ਮੰਦਰ",
      city: "ਹੰਪੀ",
      state: "ਕਰਨਾਟਕ",
      shortDescription: "16ਵੀਂ ਸਦੀ ਦਾ ਵਿਜੇਨਗਰ ਕਾਲ ਦਾ ਮੰਦਰ, ਜੋ ਕ੍ਰਿਸ਼ਨਦੇਵਰਾਇ ਨੇ ਆਪਣੀ ਓਡੀਸ਼ਾ ਮੁਹਿੰਮ ਦੀ ਯਾਦ ਵਿੱਚ ਬਣਵਾਇਆ ਸੀ; ਇਹ ਆਪਣੇ ਬਾਰੀਕ ਨੱਕਾਸ਼ੀਦਾਰ ਗੋਪੁਰਮ ਲਈ ਜਾਣਿਆ ਜਾਂਦਾ ਹੈ।",
    },
    ur: {
      name: "کرشن مندر",
      city: "ہمپی",
      state: "کرناٹک",
      shortDescription: "سولہویں صدی کا وجے نگر دور کا مندر، جسے کرشن دیو رائے نے اپنی اوڈیشہ مہم کی یاد میں تعمیر کروایا؛ یہ اپنے باریک نقش و نگار والے گوپورم کے لیے مشہور ہے۔",
    },
  },
};

/** Returns a copy of the monument with its text fields in the given language (English fallback). */
export function localizeMonument(monument: Monument360, lang: Monument360Lang): Monument360 {
  if (lang === "en") return monument;
  const tr = monuments360Translations[monument.id]?.[lang];
  return tr ? { ...monument, ...tr } : monument;
}
