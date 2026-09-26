import type { HeritageLink, HvsBand, LatLng } from "../../../../../shared/quiz-contract";

/**
 * Heritage registry: the traditions, sites and foods that quiz questions
 * link to, so every question can point into the Dharohar archive and map.
 *
 * INTEGRATION: ids here should match the ids used by the archive and map
 * modules. When the archive database exists, replace `ArchiveAdapter`
 * (see adapter.ts) to read live data. This file then only acts as a fallback.
 *
 * HVS values below are SAMPLE numbers for the demo (isSample: true). The real
 * Heritage Vulnerability Score comes from the scoring engine:
 * HVS = 100 - (0.30T + 0.25P + 0.20D + 0.15C + 0.10F)
 * Bands: Stable 0-33, Vulnerable 34-66, Critical 67-100.
 */
export interface HeritageEntity {
  id: string;
  kind: "tradition" | "site" | "food";
  name: string;
  hindi?: string;
  state?: string;
  location?: LatLng;
  sampleHvs?: number;
}

const T = (id: string, name: string, hindi: string, state: string, lat: number | null, lng: number | null, sampleHvs?: number): HeritageEntity => ({
  id, kind: "tradition", name, hindi, state, location: lat === null ? undefined : { lat, lng: lng! }, sampleHvs,
});
const S = (id: string, name: string, hindi: string, state: string, lat: number, lng: number): HeritageEntity => ({
  id, kind: "site", name, hindi, state, location: { lat, lng },
});
const F = (id: string, name: string, hindi: string, state: string, lat: number, lng: number): HeritageEntity => ({
  id, kind: "food", name, hindi, state, location: { lat, lng },
});

export const HERITAGE: HeritageEntity[] = [
  // Performing arts and rituals
  T("kutiyattam", "Kutiyattam", "कूडियाट्टम", "Kerala", 10.527, 76.214, 78),
  T("mudiyettu", "Mudiyettu", "मुडियेट्टु", "Kerala", 10.0, 76.3, 71),
  T("ramman", "Ramman", "रम्माण", "Uttarakhand", 30.4, 79.33, 74),
  T("chhau", "Chhau dance", "छऊ नृत्य", "Odisha, Jharkhand, West Bengal", 23.33, 86.36, 52),
  T("kalbelia", "Kalbelia", "कालबेलिया", "Rajasthan", 26.9, 75.8, 58),
  T("sankirtana", "Sankirtana", "संकीर्तन", "Manipur", 24.81, 93.94, 44),
  T("ladakh-chanting", "Buddhist chanting of Ladakh", "लद्दाख का बौद्ध मंत्रोच्चार", "Ladakh", 34.16, 77.58, 49),
  T("thatheras", "Thathera metal craft", "ठठेरा धातु कला", "Punjab", 31.56, 75.03, 76),
  T("vedic-chanting", "Vedic chanting", "वैदिक मंत्रोच्चार", "India", null, null, 40),
  T("ramlila", "Ramlila", "रामलीला", "Uttar Pradesh", 25.28, 83.03, 24),
  T("garba", "Garba", "गरबा", "Gujarat", 23.02, 72.57, 12),
  T("durga-puja", "Durga Puja", "दुर्गा पूजा", "West Bengal", 22.57, 88.36, 10),
  T("kumbh-mela", "Kumbh Mela", "कुंभ मेला", "Uttar Pradesh", 25.43, 81.88, 8),
  T("yoga", "Yoga", "योग", "India", null, null, 6),
  T("deepavali", "Deepavali", "दीपावली", "India", null, null, 5),
  T("theyyam", "Theyyam", "तेय्यम", "Kerala", 11.87, 75.37, 55),
  T("yakshagana", "Yakshagana", "यक्षगान", "Karnataka", 13.34, 74.75, 46),
  T("kathakali", "Kathakali", "कथकली", "Kerala", 10.74, 76.28, 38),
  T("bharatanatyam", "Bharatanatyam", "भरतनाट्यम", "Tamil Nadu", 13.08, 80.27, 15),
  T("kathak", "Kathak", "कथक", "Uttar Pradesh", 26.85, 80.95, 18),
  T("odissi", "Odissi", "ओडिसी", "Odisha", 20.3, 85.82, 22),
  T("manipuri", "Manipuri dance", "मणिपुरी नृत्य", "Manipur", 24.81, 93.94, 41),
  T("sattriya", "Sattriya", "सत्रिया", "Assam", 26.95, 94.17, 47),
  T("kuchipudi", "Kuchipudi", "कुचिपुड़ी", "Andhra Pradesh", 16.24, 80.93, 29),
  T("mohiniyattam", "Mohiniyattam", "मोहिनीअट्टम", "Kerala", 10.74, 76.28, 36),
  T("lavani", "Lavani", "लावणी", "Maharashtra", 18.52, 73.86, 42),
  T("bihu", "Bihu", "बिहू", "Assam", 26.14, 91.74, 16),
  T("dhrupad", "Dhrupad", "ध्रुपद", "India", null, null, 69),
  T("hornbill-festival", "Hornbill Festival", "हॉर्नबिल महोत्सव", "Nagaland", 25.62, 94.1),
  T("onam", "Onam", "ओणम", "Kerala", 10.52, 76.21),
  T("pongal", "Pongal", "पोंगल", "Tamil Nadu", 10.79, 79.14),
  T("rath-yatra", "Rath Yatra", "रथ यात्रा", "Odisha", 19.81, 85.83),
  T("thrissur-pooram", "Thrissur Pooram", "त्रिशूर पूरम", "Kerala", 10.527, 76.214),
  T("mysuru-dasara", "Mysuru Dasara", "मैसूर दशहरा", "Karnataka", 12.305, 76.655),
  T("khejarli", "Bishnoi tree protection", "बिश्नोई वृक्ष संरक्षण", "Rajasthan", 26.21, 73.05),
  T("chipko", "Chipko movement", "चिपको आंदोलन", "Uttarakhand", 30.4, 79.33),
  // Crafts and art
  T("warli", "Warli painting", "वारली चित्रकला", "Maharashtra", 19.97, 72.73, 51),
  T("madhubani", "Madhubani painting", "मधुबनी चित्रकला", "Bihar", 26.35, 86.07, 27),
  T("pattachitra", "Pattachitra", "पट्टचित्र", "Odisha", 19.88, 85.83, 48),
  T("kalamkari", "Kalamkari", "कलमकारी", "Andhra Pradesh", 13.75, 79.7, 54),
  T("phad", "Phad painting", "फड़ चित्रकला", "Rajasthan", 25.35, 74.63, 73),
  T("dhokra", "Dhokra metal casting", "ढोकरा धातु ढलाई", "Chhattisgarh", 19.07, 82.03, 68),
  T("bidriware", "Bidriware", "बिदरी कला", "Karnataka", 17.91, 77.52, 70),
  T("channapatna", "Channapatna toys", "चन्नपटना खिलौने", "Karnataka", 12.65, 77.21, 57),
  T("chikankari", "Chikankari", "चिकनकारी", "Uttar Pradesh", 26.85, 80.95, 35),
  T("phulkari", "Phulkari", "फुलकारी", "Punjab", 30.34, 76.39, 45),
  T("blue-pottery", "Blue pottery", "ब्लू पॉटरी", "Rajasthan", 26.91, 75.79, 59),
  T("pashmina", "Pashmina weaving", "पश्मीना बुनाई", "Jammu and Kashmir", 34.08, 74.8, 43),
  T("kanchipuram-silk", "Kanchipuram silk weaving", "कांचीपुरम रेशम बुनाई", "Tamil Nadu", 12.83, 79.7, 34),
  T("pochampally-ikat", "Pochampally ikat", "पोचमपल्ली इकत", "Telangana", 17.34, 78.82, 50),
  T("tanjore-painting", "Tanjore painting", "तंजौर चित्रकला", "Tamil Nadu", 10.79, 79.14, 39),
  T("kumartuli", "Kumartuli clay idols", "कुमारटुली की मूर्तियां", "West Bengal", 22.6, 88.36, 37),
  // Sites
  S("taj-mahal", "Taj Mahal", "ताज महल", "Uttar Pradesh", 27.1751, 78.0421),
  S("konark", "Sun Temple, Konark", "सूर्य मंदिर, कोणार्क", "Odisha", 19.8876, 86.0945),
  S("hampi", "Hampi", "हम्पी", "Karnataka", 15.335, 76.46),
  S("khajuraho", "Khajuraho temples", "खजुराहो के मंदिर", "Madhya Pradesh", 24.8318, 79.9199),
  S("rani-ki-vav", "Rani-ki-Vav", "रानी की वाव", "Gujarat", 23.8589, 72.1016),
  S("dholavira", "Dholavira", "धोलावीरा", "Gujarat", 23.8867, 70.213),
  S("lothal", "Lothal", "लोथल", "Gujarat", 22.52, 72.25),
  S("sanchi", "Sanchi", "सांची", "Madhya Pradesh", 23.4793, 77.7399),
  S("ajanta", "Ajanta Caves", "अजंता की गुफाएं", "Maharashtra", 20.5519, 75.7033),
  S("ellora", "Ellora Caves", "एलोरा की गुफाएं", "Maharashtra", 20.0268, 75.1771),
  S("elephanta", "Elephanta Caves", "एलिफेंटा की गुफाएं", "Maharashtra", 18.963, 72.931),
  S("mahabodhi", "Mahabodhi Temple", "महाबोधि मंदिर", "Bihar", 24.6959, 84.9913),
  S("sarnath", "Sarnath", "सारनाथ", "Uttar Pradesh", 25.381, 83.021),
  S("nalanda", "Nalanda Mahavihara", "नालंदा महाविहार", "Bihar", 25.1368, 85.4431),
  S("chola-temples", "Brihadisvara Temple, Thanjavur", "बृहदीश्वर मंदिर, तंजावुर", "Tamil Nadu", 10.7828, 79.1318),
  S("mahabalipuram", "Mahabalipuram", "महाबलीपुरम", "Tamil Nadu", 12.6208, 80.1945),
  S("pattadakal", "Pattadakal", "पट्टदकल", "Karnataka", 15.9483, 75.8164),
  S("hoysala", "Hoysala temples, Belur and Halebidu", "होयसल मंदिर", "Karnataka", 13.1624, 75.86),
  S("ramappa", "Ramappa Temple", "रामप्पा मंदिर", "Telangana", 18.2593, 79.9431),
  S("gol-gumbaz", "Gol Gumbaz", "गोल गुम्बज़", "Karnataka", 16.83, 75.736),
  S("qutb-minar", "Qutb Minar", "क़ुतुब मीनार", "Delhi", 28.5245, 77.1855),
  S("red-fort", "Red Fort", "लाल क़िला", "Delhi", 28.6562, 77.241),
  S("humayun-tomb", "Humayun's Tomb", "हुमायूँ का मकबरा", "Delhi", 28.5933, 77.2507),
  S("fatehpur-sikri", "Fatehpur Sikri", "फ़तेहपुर सीकरी", "Uttar Pradesh", 27.0945, 77.6679),
  S("jantar-mantar", "Jantar Mantar, Jaipur", "जंतर मंतर, जयपुर", "Rajasthan", 26.9248, 75.8246),
  S("jaipur-city", "Walled City of Jaipur", "जयपुर परकोटा", "Rajasthan", 26.9239, 75.8267),
  S("ahmedabad", "Historic City of Ahmedabad", "ऐतिहासिक अहमदाबाद", "Gujarat", 23.0258, 72.5873),
  S("bhimbetka", "Bhimbetka rock shelters", "भीमबेटका शैलाश्रय", "Madhya Pradesh", 22.9375, 77.6128),
  S("csmt", "Chhatrapati Shivaji Maharaj Terminus", "छत्रपति शिवाजी महाराज टर्मिनस", "Maharashtra", 18.9398, 72.8355),
  S("mumbai-deco", "Victorian Gothic and Art Deco Mumbai", "मुंबई का विक्टोरियन और आर्ट डेको", "Maharashtra", 18.93, 72.827),
  S("chandigarh-capitol", "Capitol Complex, Chandigarh", "कैपिटल कॉम्प्लेक्स, चंडीगढ़", "Chandigarh", 30.759, 76.807),
  S("santiniketan", "Santiniketan", "शांतिनिकेतन", "West Bengal", 23.68, 87.68),
  S("moidams", "Moidams of Charaideo", "चराइदेव के मोइदाम", "Assam", 26.94, 94.8),
  S("mountain-railways", "Darjeeling Himalayan Railway", "दार्जिलिंग हिमालयन रेलवे", "West Bengal", 27.04, 88.26),
  S("raigad", "Raigad Fort", "रायगढ़ क़िला", "Maharashtra", 18.234, 73.44),
  S("jhansi", "Jhansi Fort", "झांसी का क़िला", "Uttar Pradesh", 25.458, 78.576),
  S("srirangapatna", "Srirangapatna", "श्रीरंगपट्टण", "Karnataka", 12.414, 76.704),
  S("warangal", "Warangal Fort", "वारंगल क़िला", "Telangana", 17.957, 79.614),
  S("pataliputra", "Pataliputra (Patna)", "पाटलिपुत्र (पटना)", "Bihar", 25.594, 85.137),
  // Foods
  F("darjeeling-tea", "Darjeeling tea", "दार्जिलिंग चाय", "West Bengal", 27.04, 88.26),
  F("assam-tea", "Assam tea", "असम चाय", "Assam", 26.75, 94.2),
  F("kashmir-saffron", "Kashmir saffron", "कश्मीरी केसर", "Jammu and Kashmir", 34.02, 74.93),
  F("tirupati-laddu", "Tirupati laddu", "तिरुपति लड्डू", "Andhra Pradesh", 13.683, 79.347),
  F("alphonso", "Alphonso mango", "हापुस आम", "Maharashtra", 16.99, 73.3),
  F("bikaneri-bhujia", "Bikaneri bhujia", "बीकानेरी भुजिया", "Rajasthan", 28.02, 73.31),
  F("hyderabadi-haleem", "Hyderabadi haleem", "हैदराबादी हलीम", "Telangana", 17.36, 78.47),
  F("litti-chokha", "Litti chokha", "लिट्टी चोखा", "Bihar", 25.59, 85.14),
  F("dhokla", "Dhokla", "ढोकला", "Gujarat", 23.02, 72.57),
  F("feni", "Goan feni", "गोवा फेनी", "Goa", 15.5, 73.83),
  F("malabar-pepper", "Malabar pepper", "मालाबार काली मिर्च", "Kerala", 11.25, 75.78),
  F("joynagar-moa", "Joynagar moa", "जयनगर मोआ", "West Bengal", 22.18, 88.42),
  F("dharwad-pedha", "Dharwad pedha", "धारवाड़ पेड़ा", "Karnataka", 15.46, 75.0),
  F("coorg-coffee", "Coorg coffee", "कूर्ग कॉफ़ी", "Karnataka", 12.42, 75.74),
  F("rasgulla", "Rasgulla", "रसगुल्ला", "West Bengal and Odisha", 22.57, 88.36),
  F("mysore-pak", "Mysore pak", "मैसूर पाक", "Karnataka", 12.305, 76.655),
  F("basmati", "Basmati rice", "बासमती चावल", "Punjab and Haryana", 30.7, 76.2),
  F("millets", "Millets", "मोटे अनाज", "India", 15.3, 75.7),
  F("chettinad", "Chettinad cuisine", "चेट्टिनाड व्यंजन", "Tamil Nadu", 10.16, 78.78),
];

export const heritageById = new Map(HERITAGE.map((h) => [h.id, h]));

export function bandFor(score: number): HvsBand {
  if (score >= 67) return "Critical";
  if (score >= 34) return "Vulnerable";
  return "Stable";
}

export function toLink(e: HeritageEntity): HeritageLink {
  return {
    id: e.id,
    kind: e.kind,
    name: e.name,
    hindi: e.hindi,
    state: e.state,
    location: e.location,
    hvs: e.sampleHvs === undefined ? undefined : { score: e.sampleHvs, band: bandFor(e.sampleHvs), isSample: true },
  };
}
