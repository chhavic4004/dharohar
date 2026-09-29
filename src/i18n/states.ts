import type { SiteLang } from "../lib/language";

/** Indian state and region names in Hindi, Punjabi and Urdu. English is the key. */
const STATES: Record<string, { hi: string; pa: string; ur: string }> = {
  "Andhra Pradesh": { hi: "आंध्र प्रदेश", pa: "ਆਂਧਰਾ ਪ੍ਰਦੇਸ਼", ur: "آندھرا پردیش" },
  "Arunachal Pradesh": { hi: "अरुणाचल प्रदेश", pa: "ਅਰੁਣਾਚਲ ਪ੍ਰਦੇਸ਼", ur: "اروناچل پردیش" },
  Assam: { hi: "असम", pa: "ਅਸਾਮ", ur: "آسام" },
  Bihar: { hi: "बिहार", pa: "ਬਿਹਾਰ", ur: "بہار" },
  Chandigarh: { hi: "चंडीगढ़", pa: "ਚੰਡੀਗੜ੍ਹ", ur: "چنڈی گڑھ" },
  Chhattisgarh: { hi: "छत्तीसगढ़", pa: "ਛੱਤੀਸਗੜ੍ਹ", ur: "چھتیس گڑھ" },
  Delhi: { hi: "दिल्ली", pa: "ਦਿੱਲੀ", ur: "دہلی" },
  Goa: { hi: "गोवा", pa: "ਗੋਆ", ur: "گوا" },
  Gujarat: { hi: "गुजरात", pa: "ਗੁਜਰਾਤ", ur: "گجرات" },
  Haryana: { hi: "हरियाणा", pa: "ਹਰਿਆਣਾ", ur: "ہریانہ" },
  "Himachal Pradesh": { hi: "हिमाचल प्रदेश", pa: "ਹਿਮਾਚਲ ਪ੍ਰਦੇਸ਼", ur: "ہماچل پردیش" },
  India: { hi: "भारत", pa: "ਭਾਰਤ", ur: "ہندوستان" },
  "Jammu and Kashmir": { hi: "जम्मू और कश्मीर", pa: "ਜੰਮੂ ਅਤੇ ਕਸ਼ਮੀਰ", ur: "جموں و کشمیر" },
  Jharkhand: { hi: "झारखंड", pa: "ਝਾਰਖੰਡ", ur: "جھارکھنڈ" },
  Karnataka: { hi: "कर्नाटक", pa: "ਕਰਨਾਟਕ", ur: "کرناٹک" },
  Kerala: { hi: "केरल", pa: "ਕੇਰਲ", ur: "کیرالہ" },
  Ladakh: { hi: "लद्दाख", pa: "ਲੱਦਾਖ", ur: "لداخ" },
  "Madhya Pradesh": { hi: "मध्य प्रदेश", pa: "ਮੱਧ ਪ੍ਰਦੇਸ਼", ur: "مدھیہ پردیش" },
  Maharashtra: { hi: "महाराष्ट्र", pa: "ਮਹਾਰਾਸ਼ਟਰ", ur: "مہاراشٹر" },
  Manipur: { hi: "मणिपुर", pa: "ਮਣੀਪੁਰ", ur: "منی پور" },
  Meghalaya: { hi: "मेघालय", pa: "ਮੇਘਾਲਿਆ", ur: "میگھالیہ" },
  Mizoram: { hi: "मिज़ोरम", pa: "ਮਿਜ਼ੋਰਮ", ur: "میزورم" },
  Nagaland: { hi: "नागालैंड", pa: "ਨਾਗਾਲੈਂਡ", ur: "ناگالینڈ" },
  Odisha: { hi: "ओडिशा", pa: "ਓਡੀਸ਼ਾ", ur: "اوڈیشہ" },
  Punjab: { hi: "पंजाब", pa: "ਪੰਜਾਬ", ur: "پنجاب" },
  Rajasthan: { hi: "राजस्थान", pa: "ਰਾਜਸਥਾਨ", ur: "راجستھان" },
  Sikkim: { hi: "सिक्किम", pa: "ਸਿੱਕਮ", ur: "سکم" },
  "Tamil Nadu": { hi: "तमिलनाडु", pa: "ਤਾਮਿਲ ਨਾਡੂ", ur: "تمل ناڈو" },
  Telangana: { hi: "तेलंगाना", pa: "ਤੇਲੰਗਾਨਾ", ur: "تلنگانہ" },
  Tripura: { hi: "त्रिपुरा", pa: "ਤ੍ਰਿਪੁਰਾ", ur: "تریپورہ" },
  "Uttar Pradesh": { hi: "उत्तर प्रदेश", pa: "ਉੱਤਰ ਪ੍ਰਦੇਸ਼", ur: "اتر پردیش" },
  Uttarakhand: { hi: "उत्तराखंड", pa: "ਉੱਤਰਾਖੰਡ", ur: "اتراکھنڈ" },
  "West Bengal": { hi: "पश्चिम बंगाल", pa: "ਪੱਛਮੀ ਬੰਗਾਲ", ur: "مغربی بنگال" },
};

const AND = { hi: " और ", pa: " ਅਤੇ ", ur: " اور " };
const COMMA = { hi: ", ", pa: ", ", ur: "، " };

/**
 * Translates a state name, including combined ones such as
 * "Punjab and Haryana" or "Odisha, Jharkhand, West Bengal".
 * Unknown names are returned as they are.
 */
export function stateName(state: string | undefined, lang: SiteLang): string {
  if (!state) return "";
  if (lang === "en") return state;
  const parts = state.split(/,\s*| and /);
  const joinedWithAnd = / and /.test(state);
  const out = parts.map((p) => STATES[p.trim()]?.[lang] ?? p.trim());
  if (out.length === 1) return out[0];
  return joinedWithAnd && out.length === 2 ? out.join(AND[lang]) : out.join(COMMA[lang]);
}
