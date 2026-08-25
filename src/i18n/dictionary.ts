/**
 * Every user-facing string in the portal, in English and Traditional Chinese.
 *
 * Traditional Chinese (繁體中文) is deliberate: the official application form,
 * the Talent Cultivation Department's materials and Tzu Chi's own terminology
 * are all Traditional, and the Chinese on the printed form has to match the
 * Chinese on screen. Tzu Chi vocabulary follows the foundation's usage —
 * 委員 / 慈誠 / 培訓 / 受證 / 勸募 / 合心・和氣・互愛・協力.
 *
 * The reproduced form itself lives in `src/document` and is not translated:
 * it is the official document and always prints in both languages.
 */

import type { Phrase } from "./types";

const p = (en: string, zh: string): Phrase => ({ en, zh });

export const D = {
  /* ------------------------------------------------------------------ *
   * Organisation & chrome
   * ------------------------------------------------------------------ */
  org: {
    foundation: p("Buddhist Tzu Chi Foundation", "佛教慈濟基金會"),
    foundationShort: p("Tzu Chi Foundation", "佛教慈濟基金會"),
    department: p("Talent Cultivation Department", "人才培育室"),
    headquarters: p("National Headquarters", "美國總會"),
    footer: p(
      "Buddhist Tzu Chi Foundation · National Headquarters · Talent Cultivation Department",
      "佛教慈濟基金會・美國總會・人才培育室",
    ),
    formEdition: p(
      "Tzu Chi Commissioner / Faith Corps Training Application Form, 1 Feb 2023 overseas edition",
      "佛教慈濟基金會「委員慈誠培訓報名表」2023年2月1日海外版",
    ),
    programme: p("Advanced Certification Training", "委員慈誠培訓"),
    contactName: p("Ashley Yong", "楊妤緗"),
    contactRole: p(
      "Deputy Director, Talent Cultivation Department",
      "人才培育室副主任",
    ),
  },

  nav: {
    guidelines: p("Program Guidelines", "培訓辦法"),
    guidelinesShort: p("Guidelines", "培訓辦法"),
    begin: p("Begin Application", "開始報名"),
    beginShort: p("Begin", "開始報名"),
    resume: p("Resume", "繼續報名"),
    resumeApplication: p("Resume your application", "繼續填寫報名表"),
    skipToContent: p("Skip to content", "跳至主要內容"),
    home: p("Home", "首頁"),
    language: p("Language", "語言"),
    switchToChinese: p("Switch to Chinese", "切換為中文"),
    switchToEnglish: p("Switch to English", "切換為英文"),
  },

  action: {
    back: p("Back", "上一步"),
    continue: p("Continue", "繼續"),
    submit: p("Submit application", "送出報名表"),
    submitting: p("Sending your application…", "報名表送出中…"),
    reviewMyForm: p("Review my form", "檢視我的報名表"),
    download: p("Download PDF", "下載 PDF"),
    print: p("Print", "列印"),
    clear: p("Clear", "清除"),
    clearAll: p("Clear all", "全部清除"),
    expandAll: p("Expand all", "全部展開"),
    collapseAll: p("Collapse all", "全部收合"),
    dismiss: p("Dismiss", "關閉"),
    remove: p("Remove", "移除"),
    tryAgain: p("Try again", "重試"),
    signIn: p("Sign in", "登入"),
    signOut: p("Sign out", "登出"),
    exportCsv: p("Export CSV", "匯出 CSV"),
    preparing: p("Preparing…", "準備中…"),
    close: p("Close", "關閉"),
  },

  field: {
    required: p("This field is required.", "此欄位為必填。"),
    optional: p("optional", "選填"),
    notApplicable: p("N/A", "無"),
  },

  /* ------------------------------------------------------------------ *
   * Landing
   * ------------------------------------------------------------------ */
  landing: {
    eyebrow: p("2026–2027 Cohort · TCCA Alumni", "2026–2027 學年・慈青學長"),
    title: p("Advanced Certification Training", "委員慈誠培訓報名"),
    lede: p(
      "The path to becoming a certified Tzu Chi Commissioner or Faith Corps member begins with one form. We have rebuilt it — the eight-page bilingual application is now nine guided steps you can finish in about twenty minutes.",
      "受證為慈濟委員或慈誠，是從一份報名表開始。我們重新設計了這份表單——原本正反八頁的中英文報名表，現在是九個步驟，大約二十分鐘就能填完。",
    ),
    statTime: p("~20 min", "約 20 分鐘"),
    statTimeLabel: p("to complete", "即可填完"),
    statSteps: p("9 steps", "9 個步驟"),
    statStepsLabel: p("instead of 8 pages", "取代正反八頁"),
    statDate: p("Sept 27", "9 月 27 日"),
    statDateLabel: p("first class, in person", "首堂課・總會實體上課"),

    filledForYou: p("Filled in for you", "已為您預先填好"),
    filledForYouDetail: p(
      "Team, mentor and training details are pre-set.",
      "組隊、直屬委員與培訓資料皆已預設。",
    ),

    howItWorks: p("How it works", "填寫流程"),
    autosaveNote: p(
      "Your answers are saved on this device as you go.",
      "填寫內容會即時儲存在您這台裝置上。",
    ),
    step1Title: p("Answer nine steps", "回答九個步驟"),
    step1Body: p(
      "Plain questions in English and Chinese, grouped the way a person thinks — not the way the paper form is printed. Every field is checked as you type.",
      "以中英文提問，依照人的思考順序分組，而不是照著紙本表格的版面排列。每個欄位都會即時檢查。",
    ),
    step2Title: p("Review the real form", "檢視正式表單"),
    step2Body: p(
      "We fill the official bilingual application for you. Read it through, jump back to fix anything, then sign with your mouse or finger.",
      "系統會為您填好正式的中英文報名表。您可以逐頁確認，隨時回去修改，最後用滑鼠或手指簽名。",
    ),
    step3Title: p("Send and keep a copy", "送出並保留副本"),
    step3Body: p(
      "Your application goes straight to the Talent Cultivation Team, and you download a signed PDF for your own records.",
      "報名表會直接送到人才培育團隊，您也可以下載已簽名的 PDF 留存。",
    ),

    readyTitle: p("Have these ready", "請先準備好"),
    ready1: p("A 2-inch headshot", "二吋大頭照一張"),
    ready1Detail: p(
      "Grey shirt with white collar, for your training ID card.",
      "請著灰衣白領，作為培訓證使用。",
    ),
    ready2: p("Your ID number", "身分證號"),
    ready2Detail: p("Driver license or passport.", "駕照或護照號碼皆可。"),
    ready3: p("When you started serving", "投入社區志工的時間"),
    ready3Detail: p(
      "The month and year you began community volunteering.",
      "請記得開始承擔社區志工的年月。",
    ),
    ready4: p("An emergency contact", "緊急聯絡人"),
    ready4Detail: p(
      "Name, relationship and phone number.",
      "姓名、關係與聯絡電話。",
    ),

    separateTitle: p("Sent separately", "另行繳交"),
    separateBody: p(
      "Two items are not part of this form. Email or upload them for your training coordinator alongside your application.",
      "以下兩項不在本表單內，請另外以電子郵件寄送或上傳給人事幹事。",
    ),
    separate1: p("A 600-word autobiography", "600 字以上自傳"),
    separate1Detail: p(
      "In Word format, plus one printed copy.",
      "請以 Word 編輯，並列印紙本一份。",
    ),
    separate2: p("Your uniform headshot", "制服大頭照"),
    separate2Detail: p("Also uploaded here, in Step 2.", "第 2 步驟也會請您上傳一次。"),
    questions: p("Questions?", "有問題嗎？"),
  },

  /* ------------------------------------------------------------------ *
   * Wizard shell
   * ------------------------------------------------------------------ */
  wizard: {
    progress: p("Progress", "填寫進度"),
    stepOf: p("Step %s of %s", "第 %s 步，共 %s 步"),
    ofSteps: p("%s of %s", "%s / %s"),
    allSteps: p("All steps", "所有步驟"),
    hideSteps: p("Hide steps", "收合步驟"),
    steps: p("Application steps", "報名步驟"),
    reviewAndSign: p("Review & Sign", "檢視與簽名"),
    savedOnDevice: p("Saved on this device", "已儲存於本裝置"),
    autosaveUnavailable: p("Autosave unavailable", "無法自動儲存"),
    draftNote: p(
      "Answers stay on this device until you submit. Close the tab and come back any time.",
      "在您送出之前，所有內容只會保存在這台裝置上。可以隨時關閉分頁，稍後再回來繼續。",
    ),
    restored: p("We picked up where you left off.", "已為您接續上次填寫的內容。"),
    stepPrefix: p("Step %s · Form %s", "第 %s 步・表單%s"),
    oneAnswerLeft: p(
      "One answer still needs your attention — it is highlighted below.",
      "還有 1 個欄位需要修改，已在下方標示。",
    ),
    answersLeft: p(
      "%s answers still need your attention — they are highlighted below.",
      "還有 %s 個欄位需要修改，已在下方標示。",
    ),
    answersLeftShort: p("%s left on this step", "本步驟還有 %s 個未完成"),
  },

  /* ------------------------------------------------------------------ *
   * Steps
   * ------------------------------------------------------------------ */
  step: {
    trackTitle: p("Training Track", "報名項目"),
    trackBlurb: p(
      "Tell us which certification training you are applying for.",
      "請選擇您要報名的培訓項目。",
    ),
    personalTitle: p("Personal Details", "個人基本資料"),
    personalBlurb: p(
      "Your name, identification and emergency contact, plus your headshot.",
      "您的姓名、身分資料、緊急聯絡人，以及大頭照。",
    ),
    contactTitle: p("Contact Information", "通訊資料"),
    contactBlurb: p(
      "Where the Talent Cultivation Team can reach you.",
      "人才培育團隊聯絡您的方式。",
    ),
    familyTitle: p("Family Information", "親屬資料"),
    familyBlurb: p(
      "Optional. Family members who are happy to be contacted by Tzu Chi for activities.",
      "選填。願意讓慈濟聯繫、參與活動的親屬資料。",
    ),
    involvementTitle: p("Tzu Chi Involvement", "慈濟參與"),
    involvementBlurb: p(
      "What you have already taken part in, and what you would like to join.",
      "您曾經參與過的功能，以及願意投入的志工項目。",
    ),
    skillsTitle: p("Skills & Talents", "專長"),
    skillsBlurb: p(
      "The talents you can offer — pick everything that applies.",
      "您可以奉獻的專長，請勾選所有符合的項目。",
    ),
    experienceTitle: p("Volunteer Experience", "志工經歷"),
    experienceBlurb: p(
      "When you began serving in your community and the groups you serve with.",
      "您開始投入社區的時間，以及所屬的組隊。",
    ),
    availabilityTitle: p("Availability & Sizing", "時段與尺寸"),
    availabilityBlurb: p(
      "When you can serve, and the sizes for your vest and prayer beads.",
      "您方便投入的時段，以及志工背心與琉璃念珠的尺寸。",
    ),
    reflectionTitle: p("Self-Reflection", "自省"),
    reflectionBlurb: p(
      "An honest self-evaluation on the Ten Precepts, and your training pace.",
      "請誠實自我省思慈濟十戒，並選擇培訓實務課程的完成期限。",
    ),
    sectionsOne: p("Section %s", "第 %s 項"),
    sectionsTwo: p("Sections %s & %s", "第 %s、%s 項"),
  },

  /* ------------------------------------------------------------------ *
   * Step 1 — track
   * ------------------------------------------------------------------ */
  track: {
    openTo: p("Open to %s applicants", "限%s報名"),
    female: p("female", "女眾"),
    male: p("male", "男眾"),
    commissionerBlurb: p(
      "Certification as a Tzu Chi Commissioner (委員) — the lay volunteer who carries the mission into the community and cultivates donor households.",
      "受證成為慈濟委員——在社區中承擔慈濟志業、勸募會員的居家志工。",
    ),
    faithCorpsBlurb: p(
      "Certification as a Faith Corps member (慈誠) — the brothers’ corps that anchors logistics, construction, disaster relief and event support.",
      "受證成為慈濟慈誠——承擔勤務、營建、賑災與活動護持的男眾志工。",
    ),
    note: p(
      "This choice decides which fields on the official form apply to you, and which mentor and recommending person are recorded. You can change it later.",
      "此選擇會決定正式表單上適用的欄位，以及所登錄的直屬委員或推薦人。之後仍可修改。",
    ),
    chooseError: p(
      "Please choose the training you are applying for.",
      "請選擇您要報名的培訓項目。",
    ),
  },

  /* ------------------------------------------------------------------ *
   * Step 2 — personal
   * ------------------------------------------------------------------ */
  personal: {
    nameSection: p("Your name", "姓名"),
    identitySection: p("Identity", "基本資料"),
    educationSection: p("Education and work", "學歷與職業"),
    emergencySection: p("Emergency contact", "緊急聯絡人"),
    emergencyBlurb: p(
      "Someone Tzu Chi can reach if something happens during a training day or a service event.",
      "若在培訓或勤務期間發生狀況，慈濟可以聯繫的人。",
    ),
    firstName: p("First name", "名字"),
    firstNameHint: p(
      "Exactly as printed on your passport.",
      "請與護照上的拼音完全相同。",
    ),
    surname: p("Surname", "姓氏"),
    chineseName: p("Chinese name", "中文姓名"),
    email: p("Email", "電子信箱"),
    emailInvalid: p(
      "Enter a valid email address, e.g. name@example.com",
      "請輸入有效的電子信箱，例如 name@example.com",
    ),
    birthday: p("Date of birth", "出生日期"),
    birthdayPicker: p("Use the date picker.", "請使用日期選擇器。"),
    birthdayFuture: p(
      "Birthday cannot be in the future.",
      "出生日期不可晚於今天。",
    ),
    birthdayInvalid: p("That date is not valid.", "此日期無效。"),
    birthdayYear: p("Please check the year.", "請確認年份是否正確。"),
    gender: p("Gender", "性別"),
    genderHint: p(
      "Pre-selected from your training track. You can change it.",
      "已依報名項目預先選取，您仍可自行修改。",
    ),
    bloodType: p("Blood type", "血型"),
    bloodTypeOther: p("Please specify your blood type", "請說明您的血型"),
    idNumber: p("ID number", "身分證號"),
    idNumberHint: p(
      "Driver license or passport number.",
      "駕照或護照號碼皆可。",
    ),
    maritalStatus: p("Marital status", "婚姻狀況"),
    maritalStatusOther: p("Please specify", "請說明"),
    education: p("Highest education", "最高學歷"),
    school: p("School", "畢業學校"),
    major: p("Department / major", "科系"),
    employer: p("Employer", "服務單位"),
    employerHint: p("Not working right now? Tap N/A.", "目前沒有工作？請點選「無」。"),
    position: p("Position", "職位"),
    emergencyName: p("Name", "姓名"),
    emergencyRelationship: p("Relationship", "關係"),
    emergencyRelationshipPlaceholder: p("Mother, spouse…", "母親、配偶……"),
    emergencyTel: p("Phone", "聯絡電話"),
    photo: p("2-inch headshot", "二吋大頭照"),
    photoHint: p(
      "Grey shirt with white collar. Resized automatically.",
      "請著灰衣白領，系統會自動調整尺寸。",
    ),
    photoRequired: p("A 2-inch headshot is required.", "二吋大頭照為必填。"),
    photoAdd: p("Add your photo", "上傳大頭照"),
    photoDrop: p("Tap to choose, or drop an image here", "點選或拖曳圖片至此"),
    photoReplace: p("Replace", "重新上傳"),
    photoRemove: p("Remove photo", "移除照片"),
    photoProcessing: p("Processing…", "處理中…"),
    photoUploaded: p("Your uploaded headshot", "已上傳的大頭照"),
    photoTooBig: p(
      "That image is over 25 MB. Please choose a smaller photo.",
      "圖片超過 25 MB，請選擇較小的檔案。",
    ),
    photoNotImage: p(
      "Please choose an image file (JPG, PNG or HEIC).",
      "請選擇圖片檔（JPG、PNG 或 HEIC）。",
    ),
    photoUnreadable: p(
      "That image could not be read. Please try another file.",
      "無法讀取此圖片，請改用其他檔案。",
    ),
    photoUnsupported: p(
      "Your browser could not process the image.",
      "您的瀏覽器無法處理這張圖片。",
    ),
  },

  /* ------------------------------------------------------------------ *
   * Step 3 — contact
   * ------------------------------------------------------------------ */
  contact: {
    addressSection: p("Addresses", "地址"),
    phoneSection: p("Telephone", "聯絡電話"),
    phoneBlurb: p(
      "A mobile number is required — it is how the Talent Cultivation Team will reach you about class dates.",
      "手機號碼為必填，人才培育團隊會以此通知上課日期。",
    ),
    homeAddress: p("Home address", "居住地址"),
    homeAddressPlaceholder: p("Street, city, state, ZIP", "街道、城市、州別、郵遞區號"),
    businessAddress: p("Business address", "公司地址"),
    mobile: p("Mobile", "手機"),
    homePhone: p("Home phone", "住家電話"),
    companyPhone: p("Company phone", "公司電話"),
    fax: p("Fax number", "傳真"),
  },

  /* ------------------------------------------------------------------ *
   * Step 4 — family
   * ------------------------------------------------------------------ */
  family: {
    voluntary: p("This section is voluntary.", "本欄位依個人意願填寫。"),
    voluntaryBody: p(
      "The official form asks for parents, in-laws, spouse and children who are willing to be contacted by Tzu Chi for activities — “please fill out the following and sign at your own will”. Leave it empty if you prefer.",
      "正式表單請填寫父母、公婆、配偶及子女中，同意供慈濟相關活動連繫者的資料——「請依個人意願填寫」。若不便提供，可以留空。",
    ),
    empty: p(
      "No family members added. You can add up to %s, matching the rows on the paper form.",
      "尚未新增親屬。最多可新增 %s 位，與紙本表單的列數相同。",
    ),
    addFirst: p("Add a family member", "新增親屬"),
    addAnother: p("Add another family member", "再新增一位親屬"),
    full: p(
      "The form has room for %s family members.",
      "表單最多可填寫 %s 位親屬。",
    ),
    member: p("Family member %s", "親屬 %s"),
    relationship: p("Relationship", "關係"),
    relationshipPlaceholder: p("Mother", "母親"),
    relationshipRequired: p("Relationship is required.", "關係為必填。"),
    name: p("Name", "姓名"),
    nameRequired: p("Name is required.", "姓名為必填。"),
    birthDate: p("Birth date", "出生年月日"),
    phone: p("Phone", "電話"),
    commissionerNo: p("Commissioner No.", "委員證號"),
    faithCorpsNo: p("Faith Corps No.", "慈誠證號"),
    honoraryBoardNo: p("Honorary Board No.", "榮董號"),
  },

  /* ------------------------------------------------------------------ *
   * Step 5 — involvement
   * ------------------------------------------------------------------ */
  involvement: {
    activitiesTitle: p("Activities you have taken part in", "曾經參與過的功能"),
    activitiesBlurb: p(
      "Everything you have already been part of, however briefly.",
      "只要曾經參與過，無論時間長短都可以勾選。",
    ),
    activitiesLabel: p("Select all that apply", "請勾選所有符合的項目"),
    activitiesRequired: p(
      "Select at least one activity you have taken part in.",
      "請至少勾選一項曾參與過的功能。",
    ),
    activitiesOther: p("Please describe the other activity", "請說明其他功能"),
    activitiesOtherRequired: p(
      "Please describe the other activity.",
      "請說明其他功能。",
    ),
    missionsTitle: p("Volunteer work you would like to join", "願意投入的志工項目"),
    missionsBlurb: p(
      "Across the Four Missions. Pick anything that interests you — nothing here is a commitment.",
      "涵蓋慈濟四大志業。有興趣的都可以勾選，此處不代表承諾。",
    ),
    missionsRequired: p(
      "Select at least one kind of volunteer work you would like to join.",
      "請至少勾選一項願意投入的志工項目。",
    ),
    profession: p("Your medical profession", "您的醫療專業"),
    professionRequired: p(
      "Please state your medical profession.",
      "請填寫您的醫療專業。",
    ),
    unrecognised: p(
      "Unrecognised selection — please re-select.",
      "選項無法辨識，請重新選擇。",
    ),
  },

  /* ------------------------------------------------------------------ *
   * Step 6 — skills
   * ------------------------------------------------------------------ */
  skills: {
    blurbLong: p(
      "The talents you can offer — pick everything that applies. Thirteen categories, and it is fine to leave most of them empty.",
      "您可以奉獻的專長，請勾選所有符合的項目。共十三類，大部分留空也沒有關係。",
    ),
    selectedAcross: p(
      "%s selected across %s categories",
      "已勾選 %s 項，分屬 %s 類",
    ),
    selectedNone: p("%s selected — pick at least one", "已勾選 %s 項，請至少選一項"),
    required: p("Select at least one skill.", "請至少勾選一項專長。"),
    whichLanguage: p("Which language?", "請問是哪一種語言？"),
    whichLanguageRequired: p("Please name the language.", "請填寫語言名稱。"),
    whichInstrument: p("Which instrument?", "請問是哪一種樂器？"),
    whichInstrumentRequired: p("Please name the instrument.", "請填寫樂器名稱。"),
    whichPair: p("Which language pair?", "請問是哪一種語言互譯？"),
    whichPairRequired: p("Please name the language pair.", "請填寫語言互譯組合。"),
    whichSkill: p("Which skill?", "請問是哪一項專長？"),
    whichSkillRequired: p("Please describe the skill.", "請說明該項專長。"),
  },

  /* ------------------------------------------------------------------ *
   * Step 7 — experience
   * ------------------------------------------------------------------ */
  experience: {
    communityTitle: p("Community volunteering", "社區志工"),
    communityBlurb: p(
      "When you began serving in your community, and which teams you serve with.",
      "您開始投入社區服務的時間，以及所屬的組隊。",
    ),
    started: p("Started", "起於"),
    startedHint: p(
      "Year and month you began community volunteering.",
      "請填寫開始承擔社區志工的年月。",
    ),
    startedRequired: p("Use the month picker.", "請使用月份選擇器。"),
    areas: p("Areas you serve with", "所屬區域"),
    areasHint: p(
      "Fill in whichever you know. At least one is needed.",
      "知道哪一項就填哪一項，至少填寫一項。",
    ),
    areasRequired: p("Fill in at least one area.", "請至少填寫一項區域。"),
    harmony: p("Harmony", "和氣"),
    mutualLove: p("Mutual Love", "互愛"),
    concertedEffort: p("Concerted Effort", "協力"),
    certificationTitle: p("Certification training", "培訓委員慈誠"),
    certificationBlurb: p(
      "Your 2026–2027 cohort details are already recorded — you do not need to enter them.",
      "2026–2027 梯次的培訓資料已預先登錄，您不需要另外填寫。",
    ),
    startsLabel: p("Starts", "起於"),
    areaHarmonyLabel: p("Area 和氣 Harmony", "區域・和氣"),
    recommendedBy: p("Recommended by", "推薦人姓名"),
    badgeNumber: p("Badge number 慈濟證號", "慈濟證號"),
    functionalGroups: p("Functional groups you are part of", "所投入的功能組"),
    functionalGroupsHint: p(
      "For example: Culinary 香積, Documentation 人文真善美, TCCA, TCYA. If you only serve with your team, use the shortcut.",
      "例如：香積、人文真善美、慈青學長會、慈少。若僅落實組隊、未投入功能組，可直接使用快速填入。",
    ),
    volunteerWorkOnly: p("Volunteer work only", "僅落實組隊"),
  },

  /* ------------------------------------------------------------------ *
   * Step 8 — availability & sizing
   * ------------------------------------------------------------------ */
  availability: {
    title: p("When you can serve", "您方便投入慈濟志業的時段"),
    blurb: p(
      "Choose every slot that usually works.",
      "請勾選平時方便的時段。",
    ),
    blurbDesktop: p(
      "Tap a day or a row heading to select the whole line.",
      "點選星期或時段名稱可以整排勾選。",
    ),
    tableCaption: p(
      "Availability by day and time of day",
      "依星期與時段標示可投入的時間",
    ),
    toggleDay: p("Toggle all of %s", "切換整個%s"),
    selectAllDays: p("Select all days", "全選"),
    required: p(
      "Select at least one time you are available.",
      "請至少勾選一個方便的時段。",
    ),
    sizingTitle: p("Vest and prayer beads", "志工背心與琉璃念珠"),
    sizingBlurb: p(
      "Please measure before choosing — these are ordered in bulk for the cohort.",
      "請務必套量後再選擇，本梯次會統一訂製。",
    ),
    vest: p("Volunteer Vest", "志工背心"),
    beads: p("Buddhist Beads Bracelet", "琉璃念珠"),
    beadsNote: p(
      "If you have already received prayer beads, please do not reapply.",
      "若已領過琉璃念珠，無需再申請。",
    ),
    alreadyReceived: p("Already received", "已領過"),
  },

  /* ------------------------------------------------------------------ *
   * Step 9 — reflection
   * ------------------------------------------------------------------ */
  reflection: {
    preceptsTitle: p("Tzu Chi’s Ten Precepts", "慈濟十戒"),
    preceptsBlurb: p(
      "An honest self-evaluation, from 0% (not yet) to 100% (fully observed). There is no right answer — this is for your own reflection during training.",
      "請誠實自我評量，從 0%（尚未做到）到 100%（完全做到）。沒有標準答案，這是培訓期間自我省思的依據。",
    ),
    answered: p("%s of %s answered", "已填寫 %s / %s"),
    setRemaining: p("Set all remaining to 100%", "其餘全部設為 100%"),
    percentOf: p("%s percentage", "%s 守戒百分比"),
    notAnswered: p("not answered", "尚未填寫"),
    range: p("Enter a number between 0 and 100.", "請輸入 0 至 100 之間的數字。"),
    practicalTitle: p("Practical training", "培訓實務課程"),
    practicalBlurb: p(
      "Practical Training means fundraising and taking part personally in Tzu Chi’s Four Missions and Eight Dharma Footprints. To balance family, work and service, you may complete it in one year or two.",
      "「培訓實務課程」係指募心募款及親身參與四大志業、八大法印。為兼顧家業、事業與志業，可自選於一年或二年內完成。",
    ),
    oneYear: p("One year", "一年內完成"),
    twoYears: p("Two years", "二年內完成"),
    practicalRequired: p(
      "Choose how long you will take to finish practical training.",
      "請選擇培訓實務課程的完成期限。",
    ),
  },

  /* ------------------------------------------------------------------ *
   * Review & sign
   * ------------------------------------------------------------------ */
  review: {
    header: p("Review your application", "檢視您的報名表"),
    notSentYet: p(
      "Nothing is sent until you press Submit",
      "在按下「送出報名表」之前，資料不會送出",
    ),
    backToStep: p("Back to Step %s", "回到第 %s 步"),
    officialForm: p("Official form, filled from your answers", "正式表單，已依您的回答填入"),
    pages: p("8 pages", "共 8 頁"),
    title: p("Confirm & sign", "確認與簽名"),
    blurb: p(
      "Read the form through. If anything is wrong, jump to the step, fix it, and come straight back here.",
      "請逐頁確認。若有需要修改，可直接跳到該步驟更正後再回到這裡。",
    ),
    jumpTo: p("Jump to a section", "跳至各項"),
    skipToSign: p("Go to sign", "前往簽名"),
    backToTop: p("Back to top", "回到頂端"),
    section17Notice: p(
      "is not shown here — the Talent Cultivation Team completes it by hand. It is included, blank, in your PDF.",
      "不會顯示在這裡，由人才培育團隊親筆簽名。您下載的 PDF 中仍會保留該欄位（空白）。",
    ),
    section17Label: p("(17) Mentor Signatures", "(17) 推薦簽名"),
    consent: p(
      "I have read the completed form and confirm it is correct. I agree for the above personal information to be used for contact whenever needed for Tzu Chi-related activities, volunteer team operations, and development of volunteer services.",
      "我已閱讀填妥的報名表並確認內容無誤。茲同意以上個人資料供慈濟相關活動之聯繫、志工團隊之運作及因志工會務所延伸之各項需求使用。",
    ),
    signature: p("Your signature", "同意人簽名"),
    signHere: p(
      "Sign here with your mouse, trackpad or finger",
      "請以滑鼠、觸控板或手指在此簽名",
    ),
    signatureCaptured: p("Signature captured.", "已完成簽名。"),
    signaturePrompt: p("Draw your signature above.", "請在上方簽名。"),
    afterSubmit: p(
      "You will be able to download a signed PDF straight after.",
      "送出後即可下載已簽名的 PDF。",
    ),
    confirmFirst: p("Please confirm the form is correct.", "請先確認表單內容無誤。"),
    signFirst: p("Please sign in the box above.", "請先在上方簽名。"),
    almostThere: p("Almost there", "就快完成了"),
    incomplete: p(
      "A few answers on %s still need filling in before we can build your form.",
      "「%s」還有幾個欄位需要填寫，才能產生您的報名表。",
    ),
    goToStep: p("Go to %s", "前往「%s」"),
    zoomOut: p("Zoom out", "縮小"),
    zoomIn: p("Zoom in", "放大"),
    fitWidth: p("Fit to width", "符合寬度"),
    jumpTrack: p("1 Track", "(1) 報名項目"),
    jumpPersonal: p("6 Personal", "(6) 個人基本資料"),
    jumpContact: p("7 Contact", "(7) 通訊資料"),
    jumpFamily: p("8 Family", "(8) 親屬資料"),
    jumpInvolvement: p("9–10 Involvement", "(9)(10) 慈濟參與"),
    jumpSkills: p("11 Skills", "(11) 專長"),
    jumpExperience: p("12 Experience", "(12) 志工經歷"),
    jumpAvailability: p("13–14 Availability", "(13)(14) 時段與尺寸"),
    jumpReflection: p("15–16 Reflection", "(15)(16) 自省"),
  },

  /* ------------------------------------------------------------------ *
   * Confirmation
   * ------------------------------------------------------------------ */
  submitted: {
    thankYou: p("Thank you, %s.", "感恩您，%s。"),
    gratitude: p("Thank you for your vow of service", "感恩您的發心"),
    received: p("Your application has been received.", "您的報名表已收到。"),
    willContact: p(
      "The Talent Cultivation Team will get back to you soon!",
      "人才培育團隊會盡快與您聯繫！",
    ),
    reference: p("Reference", "報名編號"),
    submittedAt: p("Submitted", "送出時間"),
    justNow: p("Just now", "剛剛"),
    twoThings: p("Two things left to do", "還有兩件事要完成"),
    todo1: p(
      "Email your 600-word autobiography (Word format) to your training coordinator, and bring one printed copy.",
      "請將 600 字以上自傳（Word 檔）寄給人事幹事，並攜帶列印紙本一份。",
    ),
    todo1Strong: p("600-word autobiography", "600 字以上自傳"),
    todo2: p(
      "Keep the PDF copy of your signed application — download it now, this page is not saved.",
      "請保留已簽名報名表的 PDF 副本——請現在下載，本頁面不會保存。",
    ),
    todo2Strong: p("PDF copy", "PDF 副本"),
    yourApplication: p("Your signed application", "您已簽名的報名表"),
    signedPages: p("%s · 8 pages · signed", "%s・共 8 頁・已簽名"),
    downloaded: p("Downloaded. Keep it somewhere safe.", "已下載，請妥善保存。"),
    renderingPage: p("Rendering page %s of %s…", "正在產生第 %s / %s 頁…"),
    pdfFailed: p(
      "We could not build the PDF in this browser. Try the Print button instead, and choose “Save as PDF”.",
      "此瀏覽器無法產生 PDF。請改用「列印」，並選擇「另存為 PDF」。",
    ),
  },

  /* ------------------------------------------------------------------ *
   * Guidelines
   * ------------------------------------------------------------------ */
  guidelines: {
    pageTitle: p(
      "Program Guidelines · Advanced Certification Training",
      "培訓辦法・委員慈誠培訓",
    ),
    eyebrow: p("Program Guidelines · Draft", "培訓辦法・草案"),
    title: p(
      "Advanced Certification Training for TCCA (Tzu Ching) Alumni",
      "慈青學長委員慈誠培訓辦法",
    ),
    lede: p(
      "Standards for alumni recommended for Certified Training as a Committee Member or Faith Corps member, for the 2026–2027 cohort.",
      "2026–2027 梯次，慈青學長推薦參加委員慈誠培訓的標準。",
    ),
    onThisPage: p("On this page", "本頁內容"),
    navEligibility: p("Eligibility", "推薦資格"),
    navRegistration: p("Registration", "報名方式"),
    navSchedule: p("Class schedule", "課程時間"),
    navCertification: p("Certification eligibility", "受證條件"),
    navContact: p("Contact", "聯絡方式"),

    eligibilityTitle: p("AVCT Eligibility", "培訓推薦資格"),
    eligibilityLede: p(
      "TCCA (Tzu Ching) alumni recommended for Certified Training as Committee Member or Faith Corps must meet all of the following requirements:",
      "推薦參加委員慈誠培訓的慈青學長，須符合以下所有條件：",
    ),
    eligibility1: p(
      "Served as a TCCA (Tzu Ching) officer or cadre and was issued the TCCA (Tzu Ching) uniform while participating in a TCCA (Tzu Ching) club at a U.S. university.",
      "於美國大學慈青社擔任過幹部，並已領有慈青制服。",
    ),
    eligibility2: p(
      "Participated as a student or as staff in a national or overseas TCCA (Tzu Ching) Retreat or Conference at least two (2) times.",
      "曾以學員或工作人員身分，參加全美或海外慈青營隊、研習會至少二次。",
    ),
    eligibility3: p(
      "As a TCCA (Tzu Ching) alumnus or alumna after graduation, served at least once as staff for a chapter, national, or overseas TCCA (Tzu Ching) Retreat or Conference.",
      "畢業成為慈青學長後，曾於分會、全美或海外慈青營隊、研習會擔任工作人員至少一次。",
    ),
    flexibilityTitle: p(
      "Flexibility for the Headquarters Region",
      "總會區的彈性調整",
    ),
    flexibilityBody: p(
      "Recommendations are generally based on meeting all three conditions above. In view of the different environments for TCCA (Tzu Ching) recruitment and activities across chapters, and with input from the Chapter CEO, the Chapter CEO and team retain flexibility to make further adjustments. The Headquarters Region has adjusted the requirement so that meeting any two of the three conditions is sufficient.",
      "推薦原則上以符合上述三項條件為準。惟各分會慈青招生與活動環境不同，經分會執行長提報後，分會執行長及團隊得再行彈性調整。總會區已調整為符合三項中任兩項即可。",
    ),
    flexibilityStrong: p("any two of the three", "三項中任兩項"),

    registrationTitle: p("Registration", "報名方式"),
    registration1: p("Complete the registration form.", "填寫報名表。"),
    registration2: p(
      "Upload your 600-word (or more) autobiography.",
      "上傳 600 字以上自傳。",
    ),
    registration3: p(
      "Upload an electronic headshot of you wearing the Tzu Chi grey shirt with white collar, for use in producing the Training ID card.",
      "上傳著慈濟灰衣白領的電子大頭照，用於製作培訓證。",
    ),
    registration4Label: p("Training attire:", "培訓服裝："),
    registration4: p(
      "grey shirt with white collar, white trousers, Tzu Chi blue belt, white shoes and white socks. Sisters should wear their hair in the Tzu Chi bun or TCCA (Tzu Ching) alumni braids.",
      "灰衣白領、白長褲、慈濟藍腰帶、白鞋白襪。女眾請梳慈濟包頭或慈青學長辮。",
    ),
    linkRegistrationForm: p("Registration Form", "線上報名表"),
    linkPaperForm: p("Original paper form", "紙本報名表原件"),
    linkAutobiography: p("Autobiography upload", "自傳上傳"),

    scheduleTitle: p("Class Schedule", "課程時間"),
    inPerson: p("In person · Headquarters", "實體・總會"),
    onZoom: p("Zoom, local centre", "線上・各地會所"),
    classHours: p("Class hours", "上課時間"),
    classHoursValue: p("12:00 PM – 4:00 PM", "中午 12:00 至下午 4:00"),
    conductedBy: p("Conducted by", "授課單位"),
    conductedByValue: p("the DAW team", "DAW 團隊"),
    closingCeremony: p("Closing Ceremony 圓緣", "圓緣"),
    closingCeremonyValue: p(
      "8:00 AM – 4:00 PM at Headquarters (mandatory)",
      "上午 8:00 至下午 4:00，於總會舉行（必須出席）",
    ),
    classNote1: p(
      "Attend all classes together at your local Tzu Chi center, via the Zoom link provided by DAW. Expect email reminders and calendar invitations directly from DAW.",
      "請至當地慈濟會所共同上課，並使用 DAW 提供的 Zoom 連結。DAW 會直接寄送電子郵件提醒與行事曆邀請。",
    ),
    classNote2: p(
      "Wear the required uniform during class, and turn your camera on during small-group discussions.",
      "上課期間請穿著規定服裝，小組討論時請開啟視訊鏡頭。",
    ),
    classNote3: p(
      "The Talent Cultivation Department can arrange accommodation for participants traveling from outside the Headquarters region.",
      "人才培育室可為總會區以外前來的學員安排住宿。",
    ),

    certificationTitle: p("Certification Eligibility", "受證條件"),
    certification1: p(
      "Complete at least 80% of the AVCT courses (6 sessions in English). In-person attendance at the Closing Ceremony is mandatory.",
      "完成至少 80% 的培訓課程（英文班共 6 堂）。圓緣必須親自出席。",
    ),
    certification1Strong: p("80% of the AVCT courses", "80% 的培訓課程"),
    certification2: p(
      "Actively engage in the Tzu Chi Four Missions and Eight Footprints (四大八法); complete at least 300 hours of volunteer service.",
      "積極參與慈濟四大志業、八大法印，並完成至少 300 小時志工服務。",
    ),
    certification2Strong: p("300 hours", "300 小時"),
    certification3: p(
      "Report your volunteer hours to your designated Concerted Effort Team Leader by the end of each month.",
      "每月月底前，向指定的協力組隊長回報志工時數。",
    ),
    certification4: p(
      "Cultivate at least 20 donor households (not including yourself) through fundraising. Redeem your fundraising and donation record book from the Finance Department at your local region.",
      "勸募至少 20 戶會員（本人不計入）。請向所屬地區財務室領取勸募本。",
    ),
    certification4Strong: p("20 donor households", "20 戶會員"),
    certification5: p("Complete the Training Handbook.", "完成培訓手冊。"),
    certification6: p(
      "Hold Right Understanding and Right View (正知正見), and fully embody the Tzu Chi spirit and philosophy.",
      "具備正知正見，並確實體現慈濟精神與理念。",
    ),

    contactTitle: p(
      "Questions about registration or eligibility?",
      "對報名或受證條件有疑問嗎？",
    ),
  },

  /* ------------------------------------------------------------------ *
   * Admin
   * ------------------------------------------------------------------ */
  admin: {
    title: p("AVCT Admin", "培訓報名管理"),
    internal: p("Internal", "內部"),
    internalOnly: p(
      "Talent Cultivation Department · Internal access only",
      "人才培育室・僅供內部使用",
    ),
    accessCode: p("Access code", "存取碼"),
    accessCodeMissing: p("Enter the access code.", "請輸入存取碼。"),
    accessCodeWrong: p("That access code is not correct.", "存取碼不正確。"),
    directLinkOnly: p(
      "This page is reachable by direct link only. It is never linked from the applicant site.",
      "本頁只能透過直接網址進入，報名網站上不會有任何連結。",
    ),
    checkingSession: p("Checking your session…", "正在確認登入狀態…"),

    applications: p("Applications", "報名表"),
    cohort: p(
      "2026–2027 Advanced Certification Training cohort",
      "2026–2027 委員慈誠培訓梯次",
    ),
    search: p("Search name, email or reference", "搜尋姓名、信箱或編號"),
    searchLabel: p("Search applications", "搜尋報名表"),
    allTracks: p("All tracks", "全部項目"),
    filterByTrack: p("Filter by track", "依項目篩選"),
    commissionerTrack: p("Commissioner 委員", "培訓委員"),
    faithCorpsTrack: p("Faith Corps 慈誠", "培訓慈誠"),
    statTotal: p("Total applications", "報名總數"),
    statCommissioner: p("Commissioner 委員", "培訓委員"),
    statFaithCorps: p("Faith Corps 慈誠", "培訓慈誠"),
    statWeek: p("New this week", "本週新增"),
    loading: p("Loading applications…", "載入報名表中…"),
    empty: p("No applications yet", "尚無報名表"),
    emptyBody: p(
      "Submitted applications will appear here as soon as they arrive.",
      "報名表送出後會立即顯示在這裡。",
    ),
    noMatch: p("Nothing matches that search", "沒有符合的搜尋結果"),
    noMatchBody: p(
      "Try a different name, email or reference.",
      "請改用其他姓名、信箱或編號搜尋。",
    ),
    colApplicant: p("Applicant", "報名者"),
    colTrack: p("Track", "項目"),
    colSubmitted: p("Submitted", "送出時間"),
    selectApplicant: p(
      "Select an applicant to see their completed form.",
      "請選擇一位報名者，即可檢視填妥的報名表。",
    ),
    detail: p("Application detail", "報名表明細"),
    tabForm: p("Filled form", "填妥表單"),
    tabAnswers: p("Answers", "回答內容"),
    tabSignature: p("Signature", "簽名"),
    noPhoto: p("No photo", "無照片"),
    noSignature: p("No signature on file.", "無簽名檔。"),
    signedOn: p("Signed", "簽名時間"),
    printNotice: p(
      "Print this form to collect the four Section (17) mentor signatures by hand. Names are printed beside each line.",
      "請列印此表，親筆收集第 (17) 項的四個推薦簽名。每一欄旁已印上應簽名者姓名。",
    ),
    printNoticeStrong: p("Section (17)", "第 (17) 項"),
    loadFailed: p("Could not load applications.", "無法載入報名表。"),
    loadOneFailed: p("Could not load that application.", "無法載入該份報名表。"),
    pdfFailed: p(
      "Could not build the PDF here. Use Print and choose “Save as PDF”.",
      "無法在此產生 PDF。請使用「列印」並選擇「另存為 PDF」。",
    ),
    emailApplicant: p("Email %s", "寄信給 %s"),
  },

  /* ------------------------------------------------------------------ *
   * Answers read-out (admin)
   * ------------------------------------------------------------------ */
  answers: {
    application: p("Application", "報名資料"),
    personal: p("Personal", "個人基本資料"),
    contact: p("Contact", "通訊資料"),
    family: p("Family", "親屬資料"),
    involvement: p("Involvement", "慈濟參與"),
    skills: p("Skills", "專長"),
    experience: p("Experience", "志工經歷"),
    availabilitySizing: p("Availability & sizing", "時段與尺寸"),
    selfReflection: p("Self-reflection", "自省"),
    mentors: p("Mentors on file", "登錄的直屬委員與推薦人"),
    consent: p("Consent", "同意聲明"),
    track: p("Track", "報名項目"),
    fundraisingNo: p("Fundraising no.", "勸募編號"),
    memberNo: p("Donating member no.", "會員編號"),
    name: p("Name", "姓名"),
    dharmaName: p("Dharma name", "法號"),
    email: p("Email", "電子信箱"),
    birthday: p("Birthday", "出生日期"),
    gender: p("Gender", "性別"),
    bloodType: p("Blood type", "血型"),
    idNumber: p("ID number", "身分證號"),
    maritalStatus: p("Marital status", "婚姻狀況"),
    education: p("Education", "最高學歷"),
    school: p("School", "畢業學校"),
    major: p("Major", "科系"),
    employer: p("Employer", "服務單位"),
    position: p("Position", "職位"),
    emergencyContact: p("Emergency contact", "緊急聯絡人"),
    homeAddress: p("Home address", "居住地址"),
    businessAddress: p("Business address", "公司地址"),
    mobile: p("Mobile", "手機"),
    homePhone: p("Home phone", "住家電話"),
    companyPhone: p("Company phone", "公司電話"),
    fax: p("Fax", "傳真"),
    members: p("Members", "親屬"),
    noneProvided: p("None provided (voluntary section)", "未填寫（依個人意願）"),
    activities: p("Activities", "曾參與功能"),
    profession: p("profession", "醫療專業"),
    otherLanguage: p("Other language", "其他語言"),
    instrument: p("Instrument", "樂器"),
    otherTranslation: p("Other translation", "其他翻譯"),
    otherSkill: p("Other skill", "其他專長"),
    communityFrom: p("Community from", "社區志工起於"),
    areas: p("Areas", "區域"),
    recommendedBy: p("Recommended by", "推薦人"),
    certificationFrom: p("Certification from", "培訓起於"),
    functionalGroups: p("Functional groups", "功能組"),
    available: p("Available", "方便時段"),
    vest: p("Vest", "志工背心"),
    beads: p("Beads", "琉璃念珠"),
    practicalTraining: p("Practical training", "培訓實務課程"),
    unityTeam: p("Unity team 合心", "合心"),
    harmonyTeam: p("Harmony team 和氣", "和氣"),
    mutualLoveTeam: p("Mutual love 互愛", "互愛"),
    concertedTeam: p("Concerted effort 協力", "協力"),
    commissionerMentor: p("Commissioner mentor", "直屬委員"),
    recommendingPerson: p("Recommending person", "推薦人"),
    mutualLoveMentor: p("Mutual love mentor", "同互愛之直屬委員／推薦人"),
    teamLeader: p("Team leader 協力組隊長", "協力組隊長"),
    agreed: p("Agreed", "已同意"),
    signedAt: p("Signed at", "簽名時間"),
    yes: p("Yes", "是"),
    no: p("No", "否"),
    morning: p("Morning", "上午"),
    afternoon: p("Afternoon", "下午"),
    evening: p("Evening", "晚上"),
  },

  /* ------------------------------------------------------------------ *
   * Errors & misc
   * ------------------------------------------------------------------ */
  error: {
    notFoundTitle: p("This page does not exist", "找不到此頁面"),
    notFoundBody: p(
      "The link may be out of date. Everything starts from the application home page.",
      "連結可能已失效。請從報名首頁重新開始。",
    ),
    goToApplication: p("Go to the application", "前往報名表"),
    network: p(
      "We could not reach the server. Check your connection and try again.",
      "無法連線至伺服器，請檢查網路後再試一次。",
    ),
    generic: p("Something went wrong. Please try again.", "發生錯誤，請再試一次。"),
    tooLarge: p(
      "The application is too large to send. Try a smaller photo.",
      "報名資料過大，請改用較小的照片。",
    ),
    notSignedIn: p("Not signed in.", "尚未登入。"),
    loading: p("Loading…", "載入中…"),
    submitInvalid: p(
      "Some answers are missing or invalid. Go back through the steps and try again.",
      "部分欄位未填寫或格式不正確，請回到各步驟檢查後再送出。",
    ),
    saveFailed: p(
      "We could not save your application. Please try again.",
      "無法儲存您的報名表，請再試一次。",
    ),
  },
} as const;

/**
 * The phrase in the OTHER language. The hero and the thank-you screen set the
 * headline in the reader's language and echo it underneath in the other, the
 * way Tzu Chi's own bilingual materials do.
 */
export function counterpart(phrase: Phrase, lang: "en" | "zh"): string {
  return lang === "zh" ? phrase.en : phrase.zh;
}

/** Substitutes %s placeholders in order. */
export function format(template: string, ...values: (string | number)[]): string {
  let index = 0;
  return template.replace(/%s/g, () => String(values[index++] ?? ""));
}
