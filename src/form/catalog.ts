/**
 * Option catalog for the Tzu Chi Commissioner / Faith Corps Training Application Form
 * (佛教慈濟慈善事業基金會『委員慈誠培訓報名表』, 2023-02-01 overseas edition).
 *
 * Every label below is transcribed verbatim from the official .docx so that the
 * rendered document is indistinguishable from the paper form. `zh` is the
 * Traditional Chinese label, `en` the English label; the printed form shows them
 * concatenated (e.g. "訪視Case visit"), which is exactly how `<Checkbox>` renders.
 *
 * NOTHING in this file may be reworded without a matching change to the official
 * form — the form is the contract with Tzu Chi headquarters.
 */

export interface Choice {
  /** Stable key persisted in the database. Never change a key once shipped. */
  readonly key: string;
  readonly zh: string;
  readonly en: string;
  /** When true the choice carries a free-text companion field. */
  readonly specify?: boolean;
  /**
   * The paper form prints the English for a few long options on its own
   * indented line rather than running it on after the Chinese. The document
   * renderer honours this; the wizard always shows both together.
   */
  readonly stacked?: boolean;
}

const c = (key: string, zh: string, en: string, specify?: boolean): Choice =>
  specify === undefined ? { key, zh, en } : { key, zh, en, specify };

/** A choice whose English the paper form prints on its own line. */
const stackedChoice = (
  key: string,
  zh: string,
  en: string,
  specify?: boolean,
): Choice => ({ key, zh, en, stacked: true, ...(specify ? { specify } : {}) });

/* ------------------------------------------------------------------ *
 * (1) 報名項目 — Application for
 * ------------------------------------------------------------------ */

export type Track = "commissioner" | "faithCorps";

export const TRACKS = [
  {
    key: "commissioner" as const,
    zh: "培訓委員",
    en: "Commissioner Training",
    /** Gender the track is open to, per the Talent Cultivation Department. */
    audience: "Female",
    gender: "female" as const,
  },
  {
    key: "faithCorps" as const,
    zh: "培訓慈誠",
    en: "Faith Corps Training",
    audience: "Male",
    gender: "male" as const,
  },
] as const;

/* ------------------------------------------------------------------ *
 * (6) 個人基本資料 — Personal information
 * ------------------------------------------------------------------ */

export const GENDERS: readonly Choice[] = [
  c("male", "男", "Male"),
  c("female", "女", "Female"),
];

export const BLOOD_TYPES: readonly Choice[] = [
  c("A", "", "A"),
  c("B", "", "B"),
  c("O", "", "O"),
  c("AB", "", "AB"),
  c("other", "其他", "other", true),
];

export const MARITAL_STATUSES: readonly Choice[] = [
  c("married", "已婚", "Married"),
  c("single", "未婚", "Single"),
  c("other", "其他", "Other", true),
];

export const EDUCATION_LEVELS: readonly Choice[] = [
  c("none", "不識字", "None"),
  c("selfStudy", "自修", "Self-study"),
  c("primary", "小學", "Primary School"),
  c("middle", "國中", "Middle School"),
  c("high", "高中職", "High School"),
  c("vocational", "專科", "Vocational Training"),
  c("bachelor", "大學", "Bachelor Degree"),
  c("master", "碩士", "Master’s Degree"),
  c("doctoral", "博士", "Doctoral Degree"),
];

/* ------------------------------------------------------------------ *
 * (9) 曾經參與過的功能 — Activities you’ve participated in
 * ------------------------------------------------------------------ */

export const ACTIVITIES: readonly Choice[] = [
  c("tima", "人醫會", "TIMA"),
  c("teachers", "教聯會", "Teacher’s Association"),
  c("daaiMothers", "大愛媽媽", "DaAi Mothers"),
  c("tzuChing", "慈青社", "Tzu Ching"),
  c("documentation", "人文真善美", "Documentation"),
  c("cleaning", "福田", "Cleaning"),
  c("cooking", "香積", "Cooking"),
  c("recycling", "環保", "Recycling"),
  c("culturalPromotion", "人文推廣", "Cultural Promotion"),
  c("other", "其他", "Other", true),
];

/* ------------------------------------------------------------------ *
 * (10) 願意投入的志工項目 — Volunteer work you’d like to participate in
 * ------------------------------------------------------------------ */

export const MISSION_CHARITY: readonly Choice[] = [
  c("caseVisit", "訪視", "Case visit"),
  c("chanting", "助念", "Chanting for deceased"),
  c("soliciting", "勸募", "Soliciting donations"),
  c("cleaning", "清潔打掃", "Cleaning"),
  c("seniorCare", "老人關懷", "Senior care"),
  c("cooking", "烹飪", "Cooking"),
  c("youthCare", "青少年關懷", "Youth care"),
  c("hairDressing", "義剪", "Hair dressing"),
  c("construction", "營建工程", "Construction"),
  c("plumbing", "水電維修", "Plumbing & electrical repairs"),
];

export const MISSION_MEDICINE: readonly Choice[] = [
  stackedChoice(
    "boneMarrow",
    "骨髓及臍帶血捐贈宣導與關懷",
    "Bone marrow and umbilical cord blood donation advocacy and care",
  ),
  stackedChoice(
    "bloodPressure",
    "社區量血壓、衛教宣導",
    "Community blood pressure measuring service, and health education",
  ),
  c("hospital", "醫院志工", "Hospital volunteering"),
  stackedChoice("freeClinic", "義診", "Free clinic", true),
];

export const MISSION_EDUCATION: readonly Choice[] = [
  c("happyCampus", "靜思語說故事", "Happy Campus Program"),
  c("tutoring", "學生課業輔導", "Student tutoring"),
  c("jingSi", "靜思語教學", "Teaching Jing Si Aphorisms"),
];

export const MISSION_HUMANISTIC: readonly Choice[] = [
  c("dataEntry", "文書處理", "Data entry"),
  c("contentWriting", "文字編輯", "Content writing"),
  c("videoEditing", "影視編輯", "Video editing"),
  c("recycling", "環保志工", "Recycling"),
  c("eventSetup", "佈置", "Event setup"),
  c("gardening", "園藝", "Gardening"),
  c("photography", "攝影", "Photography"),
  c("culturePromotion", "文物推廣", "Culture Promotion"),
  c("calligraphy", "書法", "Calligraphy"),
  c("teaParty", "茶會", "Tea Party"),
  c("translation", "翻譯", "Translation"),
  c("illustration", "插畫", "Illustration"),
  c("flowerArrangement", "花道", "Flower arrangement"),
];

export const MISSIONS = [
  { key: "charity" as const, zh: "慈善", en: "Charity", choices: MISSION_CHARITY },
  { key: "medicine" as const, zh: "醫療", en: "Medicine", choices: MISSION_MEDICINE },
  { key: "education" as const, zh: "教育", en: "Education", choices: MISSION_EDUCATION },
  {
    key: "humanistic" as const,
    zh: "人文",
    en: "Humanistic Culture",
    choices: MISSION_HUMANISTIC,
  },
] as const;

export type MissionKey = (typeof MISSIONS)[number]["key"];

/* ------------------------------------------------------------------ *
 * (11) 專長 — Skills checklist
 * ------------------------------------------------------------------ */

export const SKILL_LANGUAGE: readonly Choice[] = [
  c("mandarin", "國語", "Mandarin"),
  c("english", "英語", "English"),
  c("japanese", "日語", "Japanese"),
  c("taiwanese", "台語", "Taiwanese"),
  c("spanish", "西班牙語", "Spanish"),
  c("portuguese", "葡語", "Portuguese"),
  c("french", "法語", "French"),
  c("german", "德語", "German"),
  c("hindi", "印度語", "Hindi"),
  c("indonesian", "印尼語", "Indonesian"),
  c("arabic", "阿文", "Arabic"),
  c("other", "", "", true),
];

export const SKILL_COMPUTER: readonly Choice[] = [
  c("wordProcessing", "文書處理", "Word processing"),
  c("websiteCreation", "網頁製作", "Website creation"),
  c("webDesign", "網頁美工", "Web design"),
  c("programming", "程式撰寫", "Programming"),
  c("fileCreation", "檔案製作", "File creation"),
  c("webArticle", "網頁編寫", "Web article"),
  c("interviewWriting", "文字採訪", "Interview writing"),
  c("itSupport", "硬體維修", "IT support"),
];

export const SKILL_ACTIVITY: readonly Choice[] = [
  c("signLanguage", "手語", "Sign Language"),
  c("activityPlanning", "活動策畫", "Activity planning"),
  c("retreatLeadership", "營隊輔導", "Retreat leadership"),
  c("singing", "唱歌", "Singing"),
  c("drama", "戲劇演出", "Drama performance"),
  c("leadingActivities", "團康帶動", "Leading activities"),
];

export const SKILL_ARTS_CRAFTS: readonly Choice[] = [
  c("graphicDesign", "美術設計", "Graphic design"),
  c("artsAndCrafts", "美術勞作", "Arts and crafts"),
  c("artisticDesign", "美術編輯", "Artistic design"),
  c("posterDesign", "海報美工", "Poster design"),
];

export const SKILL_DOCUMENTATION: readonly Choice[] = [
  c("photography", "攝影", "Photography"),
  c("soundRecording", "錄音", "Sound Recording"),
  c("tvInterview", "電視採訪", "TV interview"),
  c("videography", "錄影", "Videography"),
  c("musicComposing", "配樂", "Music Composing"),
  c("hostProgram", "主持節目", "Host Program"),
  c("videoSoundEditing", "剪接", "Video/sound editing"),
  c("documentWriting", "文字撰寫", "Document writing"),
];

export const SKILL_HEALTH_CARE: readonly Choice[] = [
  c("doctor", "醫師", "Doctor"),
  c("technician", "醫技", "Technician"),
  c("nurse", "護理", "Nurse"),
  c("counseling", "心理諮詢", "Psychological Counseling"),
];

export const SKILL_DRIVING: readonly Choice[] = [
  c("miniBus", "小客車", "Mini bus"),
  c("van9", "九人座", "9-seat van"),
  c("van12", "十二人座以上", "12-seat van"),
  c("heavyMachinery", "重型機械", "Heavy machinery"),
];

export const SKILL_MUSIC: readonly Choice[] = [
  c("writingLyrics", "作詞", "Writing lyrics"),
  c("composing", "作曲", "Composing"),
  c("singing", "演唱", "Singing"),
  c("instrument", "樂器", "Musical Instrument", true),
];

export const SKILL_TRANSLATION: readonly Choice[] = [
  c("enZh", "英翻中", "English-Chinese"),
  c("zhEn", "中翻英", "Chinese-English"),
  c("esZh", "西翻中", "Spanish-Chinese"),
  c("zhEs", "中翻西", "Chinese-Spanish"),
  c("other", "其他", "Other", true),
];

export const SKILL_CONSTRUCTION: readonly Choice[] = [
  c("waterElectricity", "水電", "Water/electricity"),
  c("cementWork", "水泥工", "Cement work"),
  c("carpentry", "板模", "Carpentry"),
  c("architecturalDesign", "建築設計", "Architectural design"),
  c("interiorDesign", "室內設計", "Interior design"),
  c("painting", "油漆", "Painting"),
  c("civilEngineering", "土木", "Civil engineering"),
  c("landscaping", "景觀", "Landscaping"),
  c("contractor", "監工", "Contractor"),
];

export const SKILL_EDITING: readonly Choice[] = [
  c("primaryMaterial", "小學教材編輯", "Primary school education material"),
  c("highMaterial", "中學教材編輯", "High school education material"),
  c("articleEditing", "文字編輯", "Article editing"),
  c("magazineEditing", "雜誌編輯", "Magazine editing"),
  c("bookEditing", "書籍編輯", "Book editing"),
];

export const SKILL_FINE_ARTS: readonly Choice[] = [
  c("drawing", "繪圖", "Drawing"),
  c("sculpture", "雕刻", "Sculpture"),
  c("calligraphy", "書法", "Calligraphy"),
  c("illustration", "插畫", "Illustration"),
  c("drama", "戲劇", "Drama performance"),
  c("ceramics", "陶瓷", "Ceramics"),
  c("staging", "情境佈置", "Staging"),
  c("cartoon", "漫畫", "Cartoon/comic drawing"),
];

export const SKILL_OTHER: readonly Choice[] = [
  c("accounting", "會計", "Accounting"),
  c("gardening", "園藝", "Gardening"),
  c("crafts", "手工藝", "Crafts"),
  c("cooking", "烹飪", "Cooking"),
  c("teaCeremony", "茶藝", "Tea Ceremony"),
  c("flowerArrangement", "插花", "Flower Arrangement"),
  c("locksmith", "開鎖製鎖", "Locksmith"),
  c("other", "", "", true),
];

export const SKILL_CATEGORIES = [
  { key: "language" as const, zh: "語言", en: "Language", choices: SKILL_LANGUAGE },
  { key: "computer" as const, zh: "電腦", en: "Computer", choices: SKILL_COMPUTER },
  { key: "activity" as const, zh: "活動", en: "Activity", choices: SKILL_ACTIVITY },
  {
    key: "artsCrafts" as const,
    zh: "美工",
    en: "Arts and crafts",
    choices: SKILL_ARTS_CRAFTS,
  },
  {
    key: "documentation" as const,
    zh: "影視",
    en: "Documentation",
    choices: SKILL_DOCUMENTATION,
  },
  {
    key: "healthCare" as const,
    zh: "醫護",
    en: "Health care",
    choices: SKILL_HEALTH_CARE,
  },
  { key: "driving" as const, zh: "駕駛", en: "Driving", choices: SKILL_DRIVING },
  { key: "music" as const, zh: "音樂", en: "Music", choices: SKILL_MUSIC },
  {
    key: "translation" as const,
    zh: "文字翻譯",
    en: "Translation",
    choices: SKILL_TRANSLATION,
  },
  {
    key: "construction" as const,
    zh: "建築",
    en: "Construction",
    choices: SKILL_CONSTRUCTION,
  },
  { key: "editing" as const, zh: "編輯", en: "Editing", choices: SKILL_EDITING },
  { key: "fineArts" as const, zh: "藝術", en: "Fine Arts", choices: SKILL_FINE_ARTS },
  { key: "other" as const, zh: "其他", en: "Other", choices: SKILL_OTHER },
] as const;

export type SkillCategoryKey = (typeof SKILL_CATEGORIES)[number]["key"];

/* ------------------------------------------------------------------ *
 * (13) 方便投入的時段 — Availability grid
 * ------------------------------------------------------------------ */

export const WEEKDAYS = [
  { key: "mon" as const, zh: "星期一", en: "Monday", short: "Mon" },
  { key: "tue" as const, zh: "星期二", en: "Tuesday", short: "Tue" },
  { key: "wed" as const, zh: "星期三", en: "Wednesday", short: "Wed" },
  { key: "thu" as const, zh: "星期四", en: "Thursday", short: "Thu" },
  { key: "fri" as const, zh: "星期五", en: "Friday", short: "Fri" },
  { key: "sat" as const, zh: "星期六", en: "Saturday", short: "Sat" },
  { key: "sun" as const, zh: "星期日", en: "Sunday", short: "Sun" },
] as const;

export const TIME_SLOTS = [
  { key: "morning" as const, zh: "上午", en: "Morning" },
  { key: "afternoon" as const, zh: "下午", en: "Afternoon" },
  { key: "evening" as const, zh: "晚上", en: "Evening" },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]["key"];
export type TimeSlotKey = (typeof TIME_SLOTS)[number]["key"];

/* ------------------------------------------------------------------ *
 * (14) 志工背心、琉璃念珠尺寸 — Vest & bracelet sizing
 * ------------------------------------------------------------------ */

export const VEST_SIZES: readonly Choice[] = [
  c("M", "", "M"),
  c("L", "", "L"),
  c("2L", "", "2L"),
  c("3L", "", "3L"),
  c("4L", "", "4L"),
  c("5L", "", "5L"),
  c("received", "已領", "Already received"),
];

export const BEADS_SIZES: readonly Choice[] = [
  c("XS", "加小", "XS-15.5cm"),
  c("S", "小", "S-16.5cm"),
  c("M", "中", "M-18cm"),
  c("L", "大", "L-19.5cm"),
  c("XL", "加大", "XL-20.5cm"),
  stackedChoice(
    "received",
    "已領過（無需再申請）",
    "Already Received (If you have received beads, please do not reapply.)",
  ),
];

/* ------------------------------------------------------------------ *
 * (15) 自省 — Tzu Chi’s Ten Precepts
 * ------------------------------------------------------------------ */

export const PRECEPTS = [
  { key: "noKilling" as const, zh: "不殺生", en: "No killing" },
  { key: "noStealing" as const, zh: "不偷盜", en: "No stealing" },
  { key: "noSexualMisconduct" as const, zh: "不邪淫", en: "No sexual misconduct" },
  { key: "noLying" as const, zh: "不妄語", en: "No lying" },
  { key: "noDrinking" as const, zh: "不飲酒", en: "No drinking" },
  {
    key: "noSmoking" as const,
    zh: "不抽菸，不吸毒，不嚼檳榔",
    en: "No smoking, using narcotics, or chewing betel nuts",
  },
  { key: "noGambling" as const, zh: "不賭博，不投機取巧", en: "No gambling or speculation" },
  {
    key: "filialPiety" as const,
    zh: "孝順父母，調和聲色",
    en: "Practice filial piety and develop pleasant manners and speech",
  },
  { key: "trafficRules" as const, zh: "遵守交通規則", en: "Abide by traffic rules" },
  {
    key: "noPolitics" as const,
    zh: "不參與政治活動、示威遊行",
    en: "No participation in political events or demonstrations",
  },
  { key: "vegetarian" as const, zh: "素食比例", en: "Observing a vegetarian diet" },
] as const;

export type PreceptKey = (typeof PRECEPTS)[number]["key"];

/* ------------------------------------------------------------------ *
 * (16) 培訓實務課程 — Practical training duration
 * ------------------------------------------------------------------ */

export const PRACTICAL_DURATIONS: readonly Choice[] = [
  c("oneYear", "一年內完成", "1 year"),
  c("twoYears", "二年內完成", "2 years"),
];

/* ------------------------------------------------------------------ *
 * Lookup helpers
 * ------------------------------------------------------------------ */

export function findChoice(
  choices: readonly Choice[],
  key: string | null | undefined,
): Choice | undefined {
  if (!key) return undefined;
  return choices.find((choice) => choice.key === key);
}

/** "訪視Case visit" — the exact string the paper form prints. */
export function choiceLabel(choice: Choice): string {
  if (choice.zh && choice.en) return `${choice.zh}${choice.en}`;
  return choice.zh || choice.en;
}

/**
 * The label for a choice in the reader's language. English mode keeps the
 * bilingual pairing the paper form uses; Chinese mode shows Chinese alone,
 * falling back to English for options that have no Chinese (A/B/O/AB, sizes).
 */
export function choiceLabelIn(choice: Choice, lang: "en" | "zh"): string {
  if (lang === "zh") return choice.zh || choice.en;
  return choiceLabel(choice);
}
