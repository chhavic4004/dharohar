/**
 * Which traditions, sites and foods each question is about (ids from
 * heritage/registry.ts). Used to link answers into the archive and map,
 * to build "quiz about this tradition" sets and the vulnerable-traditions mode.
 */
export const QUESTION_LINKS: Record<string, string[]> = {
  // Rhythms & Ragas
  "rhy-s-03": ["bharatanatyam"], "rhy-s-04": ["kathakali"], "rhy-s-05": ["kathak"],
  "rhy-s-09": ["kuchipudi", "odissi", "mohiniyattam", "sattriya"], "rhy-s-15": ["bihu"], "rhy-s-16": ["yakshagana"],
  "rhy-s-17": ["lavani"], "rhy-s-20": ["manipuri"], "rhy-s-12": ["sattriya"],
  "rhy-h-04": ["dhrupad"], "rhy-h-13": ["chhau"], "rhy-h-17": ["sattriya"], "rhy-h-19": ["mohiniyattam"],
  "rhy-h-21": ["kutiyattam"],
  // Architecture
  "arc-s-01": ["taj-mahal"], "arc-s-02": ["rani-ki-vav"], "arc-s-03": ["konark"], "arc-s-04": ["ellora"],
  "arc-s-05": ["ajanta"], "arc-s-06": ["humayun-tomb"], "arc-s-07": ["sanchi"], "arc-s-08": ["mahabodhi"],
  "arc-s-09": ["red-fort"], "arc-s-10": ["fatehpur-sikri"], "arc-s-11": ["konark", "rani-ki-vav", "hampi", "khajuraho"],
  "arc-s-12": ["mahabalipuram"], "arc-s-13": ["csmt"], "arc-s-14": ["dholavira"], "arc-s-15": ["jantar-mantar"],
  "arc-s-16": ["bhimbetka"], "arc-s-17": ["hampi"], "arc-s-18": ["elephanta", "qutb-minar"], "arc-s-19": ["santiniketan"],
  "arc-s-20": ["khajuraho"], "arc-s-21": ["qutb-minar"],
  "arc-h-01": ["qutb-minar"], "arc-h-02": ["ellora"], "arc-h-03": ["chola-temples"], "arc-h-04": ["dholavira"],
  "arc-h-05": ["fatehpur-sikri"], "arc-h-06": ["hoysala", "pattadakal"], "arc-h-07": ["sanchi", "ellora", "chola-temples", "taj-mahal"],
  "arc-h-08": ["taj-mahal", "rani-ki-vav", "dholavira", "santiniketan"], "arc-h-09": ["pattadakal"], "arc-h-10": ["mahabalipuram"],
  "arc-h-11": ["ahmedabad"], "arc-h-12": ["chandigarh-capitol"], "arc-h-13": ["konark"], "arc-h-14": ["ellora"],
  "arc-h-15": ["ramappa"], "arc-h-16": ["rani-ki-vav"], "arc-h-17": ["moidams"], "arc-h-18": ["mumbai-deco"],
  "arc-h-20": ["mahabalipuram", "khajuraho", "konark", "ramappa"], "arc-h-21": ["jaipur-city", "jantar-mantar"],
  // Culinary
  "cul-s-01": ["darjeeling-tea"], "cul-s-04": ["litti-chokha"], "cul-s-05": ["litti-chokha"], "cul-s-08": ["dhokla"],
  "cul-s-09": ["malabar-pepper"], "cul-s-10": ["dhokla", "litti-chokha"], "cul-s-11": ["alphonso"], "cul-s-12": ["bikaneri-bhujia"],
  "cul-s-13": ["tirupati-laddu"], "cul-s-15": ["kashmir-saffron"], "cul-s-17": ["mysore-pak"], "cul-s-18": ["pongal"],
  "cul-s-19": ["feni"], "cul-s-20": ["assam-tea"], "cul-s-21": ["hyderabadi-haleem"],
  "cul-h-01": ["darjeeling-tea", "hyderabadi-haleem", "rasgulla", "kashmir-saffron"], "cul-h-02": ["rasgulla"],
  "cul-h-03": ["malabar-pepper"], "cul-h-06": ["millets"], "cul-h-07": ["millets"], "cul-h-08": ["coorg-coffee"],
  "cul-h-10": ["bikaneri-bhujia", "dharwad-pedha", "joynagar-moa", "tirupati-laddu"], "cul-h-11": ["joynagar-moa"],
  "cul-h-12": ["kashmir-saffron"], "cul-h-13": ["hyderabadi-haleem"], "cul-h-14": ["coorg-coffee"], "cul-h-16": ["malabar-pepper"],
  "cul-h-19": ["chettinad"], "cul-h-20": ["assam-tea"], "cul-h-21": ["millets"],
  // Traditions
  "tra-s-01": ["deepavali"], "tra-s-02": ["garba"], "tra-s-03": ["kumbh-mela"], "tra-s-04": ["yoga"], "tra-s-05": ["madhubani"],
  "tra-s-06": ["warli"], "tra-s-07": ["onam"], "tra-s-08": ["hornbill-festival"], "tra-s-09": ["durga-puja"],
  "tra-s-10": ["chikankari", "phulkari", "bidriware", "blue-pottery"], "tra-s-11": ["ramlila"],
  "tra-s-12": ["madhubani", "warli", "pattachitra"], "tra-s-13": ["pashmina"], "tra-s-14": ["kalbelia"], "tra-s-15": ["channapatna"],
  "tra-s-17": ["kanchipuram-silk"], "tra-s-18": ["vedic-chanting"], "tra-s-19": ["chhau"], "tra-s-20": ["pongal"], "tra-s-21": ["bihu"],
  "tra-h-01": ["kutiyattam", "chhau", "yoga", "garba"], "tra-h-02": ["khejarli"], "tra-h-03": ["chipko"], "tra-h-04": ["mudiyettu"],
  "tra-h-05": ["mudiyettu", "ramman", "sankirtana", "kalbelia"], "tra-h-06": ["ramman"], "tra-h-07": ["phad"], "tra-h-08": ["kalamkari"],
  "tra-h-10": ["kumbh-mela"], "tra-h-11": ["dhokra"], "tra-h-12": ["pochampally-ikat"], "tra-h-13": ["sankirtana"],
  "tra-h-14": ["thatheras"], "tra-h-15": ["madhubani"], "tra-h-16": ["pattachitra"],
  "tra-h-17": ["ladakh-chanting", "sankirtana", "kumbh-mela", "hornbill-festival"], "tra-h-18": ["theyyam"],
  "tra-h-19": ["ladakh-chanting"], "tra-h-20": ["khejarli", "chipko", "hornbill-festival", "durga-puja"], "tra-h-21": ["kutiyattam"],
  // Rulers
  "rul-s-01": ["taj-mahal"], "rul-s-03": ["konark"], "rul-s-05": ["jhansi"], "rul-s-06": ["raigad"], "rul-s-10": ["srirangapatna"],
  "rul-s-12": ["warangal"], "rul-s-13": ["moidams"], "rul-s-14": ["sarnath"], "rul-s-16": ["hampi"], "rul-s-17": ["chola-temples"],
  "rul-s-18": ["fatehpur-sikri"], "rul-s-19": ["jhansi"], "rul-s-20": ["pataliputra"], "rul-s-21": ["red-fort"],
  "rul-h-03": ["chola-temples"], "rul-h-08": ["fatehpur-sikri"], "rul-h-09": ["moidams"], "rul-h-12": ["nalanda"],
  "rul-h-13": ["warangal", "ramappa"], "rul-h-14": ["jhansi"], "rul-h-16": ["hampi"], "rul-h-17": ["hampi"], "rul-h-21": ["hampi"],
  // Daily
  "day-01": ["qutb-minar"], "day-03": ["mountain-railways"], "day-04": ["rath-yatra"], "day-06": ["lothal"], "day-09": ["gol-gumbaz"],
  "day-11": ["nalanda"], "day-13": ["thrissur-pooram"], "day-14": ["sarnath"], "day-15": ["tanjore-painting"], "day-17": ["hampi"],
  "day-18": ["pongal"], "day-20": ["ajanta"], "day-21": ["mysuru-dasara"], "day-23": ["bhimbetka"],
  "day-24": ["taj-mahal", "fatehpur-sikri", "chola-temples", "jantar-mantar"], "day-26": ["basmati"],
  "day-28": ["kathakali", "kutiyattam"], "day-29": ["ajanta", "elephanta", "csmt", "rani-ki-vav"], "day-30": ["kumartuli", "durga-puja"],
  // Image, audio and map questions
  "rhy-s-23": ["kathakali"], "rhy-s-24": ["sattriya"], "arc-s-22": ["konark"], "arc-s-23": ["rani-ki-vav"], "arc-s-24": ["sanchi"],
  "arc-h-22": ["gol-gumbaz"], "tra-s-22": ["warli"], "tra-s-23": ["madhubani"], "tra-h-22": ["channapatna"],
  "arc-s-25": ["taj-mahal"], "arc-s-26": ["hampi"], "arc-s-27": ["konark"], "tra-s-24": ["hornbill-festival"], "tra-s-25": ["madhubani"],
  "cul-s-22": ["darjeeling-tea"], "cul-s-23": ["kashmir-saffron"], "rul-s-22": ["raigad"], "rul-s-23": ["pataliputra"],
  "arc-h-23": ["dholavira"], "arc-h-24": ["moidams"], "arc-h-25": ["ramappa"], "tra-h-23": ["thatheras"], "tra-h-24": ["pattachitra"],
  "cul-h-22": ["coorg-coffee"], "cul-h-23": ["bikaneri-bhujia"], "rul-h-22": ["srirangapatna"],
};
