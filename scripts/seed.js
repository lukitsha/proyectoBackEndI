const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');

/**
 * Util
 */
const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const img = (url) => [url];

/**
 * Productos HARDCODEADOS (Airsoft)
 * Categorías válidas según config: ['replicas', 'magazines', 'bbs', 'batteries']
 */
const SEED_PRODUCTS = [
  //
  // ============================
  // RÉPLICAS (8 MODELOS)
  // ============================
  //
  // 1) APS ASK209 AK74 (AEG)
  {
    id: uuid(),
    title: 'APS AEG ASK209 AK74 Tactical Advanced Blowback - Black',
    description:
      'Réplica AEG tipo AK74 de APS con Gearbox híbrida V3 cableada al frente y a la culata, permitiendo usar dos baterías en simultáneo (stick en tapa superior o nunchuck en culata tipo crane). Incluye rodamientos de 8 mm, blowback realista, liberación de cargador ergonómica y selector modificado accesible con el dedo. Guardamanos con empuñadura angular instalada, culata retráctil de seis posiciones y riel superior flat‑top para ópticas.',
    price: 209,
    category: 'replicas',
    status: 'active',
    stock: 16,
    brand: 'APS',
    model: 'ASK209',
    thumbnails: img('https://www.arsenalsports.com/img/12809/produtos/1200/dd04e27c4689026eae798eba93b695fc.jpg'),
    tags: ['aeg', 'ak74', 'blowback'],
    specs: {
      caliber: '6mm',
      weight: 3400,          // g
      length: 901,           // mm (extendida)
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'AEG',
      fps_0_20: 430,
      gearbox: 'V3 híbrida (8mm)',
      mag_capacity: 500,
      mag_type: 'hicap',
      connector: 'Mini Tamiya',
      battery_recommendation: 'NiMH 9.6V Stick'
    },
    createdAt: now(),
    updatedAt: now()
  },

  // 2) CYMA G36C CM.011 (AEG)
  {
    id: uuid(),
    title: 'CYMA AEG G36C Sport ABS con Gearbox V3 - Black',
    description:
      'G36C AEG con hop‑up ajustable accesible al accionar la palanca de carga. Gearbox V3 actualizable, pistón ABS con camisa de aluminio y engranajes de acero. Riel picatinny superior largo y riel inferior adicional para accesorios. Conector Small Tamiya.',
    price: 126,
    category: 'replicas',
    status: 'active',
    stock: 25,
    brand: 'CYMA',
    model: 'CM.011',
    thumbnails: img('https://www.arsenalsports.com/img/26091/produtos/1200/775b07d8d0aea0631cc629d733684d62.jpg'),
    tags: ['aeg', 'g36c'],
    specs: {
      caliber: '6mm',
      weight: 2620,
      length: 720,
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'AEG',
      fps_0_20: 380,
      gearbox: 'V3 (7mm)',
      mag_capacity: 470,
      mag_type: 'hicap',
      connector: 'Small Tamiya',
      battery_recommendation: 'NiMH 8.4V'
    },
    createdAt: now(),
    updatedAt: now()
  },

  // 3) Classic Army MP5 CA5A4 MP017M (AEG)
  {
    id: uuid(),
    title: 'Classic Army AEG MP5 CA5A4 Wide Forearm - Black',
    description:
      'MP5 AEG con upper metálico y palanca de carga funcional. Cañón externo metálico, alza delantera fija y trasera ajustable. Guardamanos y culata fija en polímero. Incluye magazine hi‑cap de 200 BBs.',
    price: 249,
    category: 'replicas',
    status: 'active',
    stock: 12,
    brand: 'Classic Army',
    model: 'MP017M',
    thumbnails: img('https://www.arsenalsports.com/img/29179/produtos/1200/a2c4d72a2b1dfa7d8796254f430923ed.jpg'),
    tags: ['aeg', 'mp5'],
    specs: {
      caliber: '6mm',
      weight: 2500,
      length: 780,
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'AEG',
      fps_0_20: 380,
      gearbox: 'V2',
      mag_capacity: 200,
      mag_type: 'hicap',
      connector: 'Large Tamiya',
      battery_recommendation: '7.4V–11.1V LiPo'
    },
    createdAt: now(),
    updatedAt: now()
  },

  // 4) Classic Army SCAR Heavy MK1-HL (AEG)
  {
    id: uuid(),
    title: 'Classic Army AEG SCAR Heavy Long MK1‑HL con Gearbox 2.5 - Black',
    description:
      'SCAR‑H AEG con riel superior de 23", receptor superior CNC con número de serie, miras metálicas ajustables y receptor inferior de polímero reforzado. Gearbox versión 2.5 con bujes de 9 mm, engranajes de acero y pistón de policarbonato. Rosca 14 mm CCW.',
    price: 279,
    category: 'replicas',
    status: 'active',
    stock: 10,
    brand: 'Classic Army',
    model: 'CA099M',
    thumbnails: img('https://www.arsenalsports.com/img/24076/produtos/1200/a2ad7fc9e1d07412ad8b8c8265521e60.jpg'),
    tags: ['aeg', 'scar-h'],
    specs: {
      caliber: '6mm',
      weight: 3500,
      length: 1005, // promedio dentro del rango
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'AEG',
      fps_0_20: 350,
      gearbox: 'V2.5 (9mm)',
      mag_capacity: 470,
      mag_type: 'hicap',
      connector: 'Small Tamiya',
      battery_recommendation: 'NiMH 8.4V / LiPo 7.4V'
    },
    createdAt: now(),
    updatedAt: now()
  },

  // 5) Tokyo Marui AUG Steyr Standard (AEG)
  {
    id: uuid(),
    title: 'Tokyo Marui AEG AUG Steyr Standard - Black',
    description:
      'Clásica AUG eléctrica de Tokyo Marui en configuración bullpup. Selector progresivo (semi/auto según recorrido del gatillo), miras abiertas ajustables y diseño con desmontaje tipo real para mantenimiento. Incluye cargador de 80 BBs.',
    price: 370,
    category: 'replicas',
    status: 'active',
    stock: 9,
    brand: 'Tokyo Marui',
    model: '170484',
    thumbnails: img('https://www.arsenalsports.com/img/28727/produtos/1200/56a0996ed6b703981ae18b35ee7e20b8.jpg'),
    tags: ['aeg', 'aug'],
    specs: {
      caliber: '6mm',
      weight: 3400,
      length: 805,
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'AEG',
      fps_0_20: 320,
      gearbox: 'Propietaria TM',
      mag_capacity: 80,
      mag_type: 'standard',
      connector: 'Mini Tamiya',
      battery_recommendation: 'NiMH 8.4V Mini S 1300mAh'
    },
    createdAt: now(),
    updatedAt: now()
  },

  // 6) APS Phantom Extremis Mark VI PDW (AEG)
  {
    id: uuid(),
    title: 'APS AEG Phantom Extremis Mark VI PDW Blowback - Black',
    description:
      'Plataforma PDW pensada para juego competitivo: receptor estilo competición, guardamanos M‑LOK de 6", culata PW de 3 posiciones y controles ambidiestros. Monta la Gearbox APS Silver Edge EBB con sistema de cambio rápido de resorte.',
    price: 229,
    category: 'replicas',
    status: 'active',
    stock: 18,
    brand: 'APS',
    model: 'PER706',
    thumbnails: img('https://www.arsenalsports.com/img/14425/produtos/1200/f68f88ef299858695b1b4cc21cd2eacf.jpg'),
    tags: ['aeg', 'pdw', 'mlok'],
    specs: {
      caliber: '6mm',
      weight: 2263,
      length: 620,
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'AEG',
      fps_0_20: 340,
      gearbox: 'APS Ver.2 SilverEdge EBB',
      mag_capacity: 190,
      mag_type: 'hicap',
      connector: 'Stick 7.4V',
      battery_recommendation: 'LiPo 7.4V tipo stick'
    },
    createdAt: now(),
    updatedAt: now()
  },

  // 7) H&K Umarex VFC UMP45 DX (GBBR)
  {
    id: uuid(),
    title: 'H&K Umarex Licensed VFC GBBR UMP45 DX - Black',
    description:
      'Subfusil UMP45 con licencia oficial H&K. Receptor de polímero reforzado, culata lateral plegable, rieles Picatinny y mandos ambidiestros. Sistema GBBR con retroceso muy realista y cargador de 30 BBs.',
    price: 360,
    category: 'replicas',
    status: 'active',
    stock: 6,
    brand: 'Umarex / H&K',
    model: 'CF2-LUMP-BK81',
    thumbnails: img('https://www.arsenalsports.com/img/13507/produtos/1200/1b53da4dbd23163eceda391f8d48010a.jpg'),
    tags: ['gbbr', 'ump45'],
    specs: {
      caliber: '6mm',
      weight: 2500,
      length: 695,
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'GBBR',
      fps_0_20: 330,
      gearbox: 'N/A (gas blowback)',
      mag_capacity: 30,
      mag_type: 'gbb',
      connector: 'N/A',
      battery_recommendation: 'N/A'
    },
    createdAt: now(),
    updatedAt: now()
  },

  // 8) APS ASR117 BOAR Tactical (AEG) — tu réplica
  {
    id: uuid(),
    title: 'APS ASR117 BOAR Tactical AEG Silver Edge Keymod - Black',
    description:
      'Réplica AEG M4 con cuerpo metálico, gearbox APS Silver Edge (V2), guardamanos Keymod y blowback electrónico. Ideal para juego mixto CQB/campo. Excelente respuesta de gatillo con LiPo 11.1V.',
    price: 299,
    category: 'replicas',
    status: 'active',
    stock: 8,
    brand: 'APS',
    model: 'ASR117',
    thumbnails: img('https://www.arsenalsports.com/img/10338/produtos/1200/dc8a5399120e2702a5d16e0fa59666ca.jpg'),
    tags: ['aeg', 'm4', 'metal-body'],
    specs: {
      caliber: '6mm',
      weight: 2800,
      length: 860,
      firingMode: 'Safe/Semi-Auto/Full-Auto',
      hopUp: true
    },
    attributes: {
      platform: 'AEG',
      fps_0_20: 390,
      gearbox: 'V2 Silver Edge',
      mag_capacity: 130,
      mag_type: 'midcap',
      connector: 'Deans',
      battery_recommendation: 'LiPo 11.1V 1200mAh Deans'
    },
    createdAt: now(),
    updatedAt: now()
  },

  //
  // ============================
  // MAGAZINES (2 por réplica)
  // ============================
  //
  // AK74 (ASK209)
  {
    id: uuid(),
    title: 'Magazine AK74 Mid‑Cap 130rds (AEG)',
    description: 'Cargador mid‑cap para plataformas AK AEG. Construcción en polímero reforzado y resorte de alta tensión.',
    price: 12,
    category: 'magazines',
    status: 'active',
    stock: 60,
    thumbnails: img('https://www.arsenalsports.com/img/16055/produtos/600/1d8286465e58706409cb3a9b0ed438bf.jpg'),
    specs: { capacity: 130, compatibility: ['AK74 AEG', 'AK47/AKM AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine AK74 Hi‑Cap 500rds (AEG)',
    description: 'Cargador hi‑cap para AK AEG con rueda de alimentación manual y cuerpo de polímero resistente.',
    price: 15,
    category: 'magazines',
    status: 'active',
    stock: 40,
    thumbnails: img('https://www.arsenalsports.com/img/27698/produtos/600/458846a4be1bb3403c06701607f6745c.jpg'),
    specs: { capacity: 500, compatibility: ['AK74 AEG', 'AK47/AKM AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  // G36C
  {
    id: uuid(),
    title: 'Magazine G36 Mid‑Cap 140rds (AEG)',
    description: 'Cargador mid‑cap de 140 BBs para G36 AEG, polímero de alta resistencia.',
    price: 15,
    category: 'magazines',
    status: 'active',
    stock: 50,
    thumbnails: img('https://www.arsenalsports.com/img/30688/produtos/600/99563c3a3af1e8a142a217586bc7470a.png'),
    specs: { capacity: 140, compatibility: ['G36 / G36C AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine G36 Hi‑Cap 470rds (AEG)',
    description: 'Cargador hi‑cap de 470 BBs para G36 AEG con acople lateral clásico.',
    price: 18,
    category: 'magazines',
    status: 'active',
    stock: 40,
    thumbnails: img('https://www.arsenalsports.com/img/5604/produtos/600/e3f31f71120d3caa7e57f0880237ec43.jpg'),
    specs: { capacity: 470, compatibility: ['G36 / G36C AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  // MP5
  {
    id: uuid(),
    title: 'Magazine MP5 Mid‑Cap 120rds (AEG)',
    description: 'Cargador mid‑cap de perfil curvo para plataformas MP5 AEG.',
    price: 14,
    category: 'magazines',
    status: 'active',
    stock: 45,
    thumbnails: img('https://www.arsenalsports.com/img/26820/produtos/600/eeccfbf19df9e374f2d5e328d0604e8a.jpg'),
    specs: { capacity: 120, compatibility: ['MP5 AEG'], material: 'Metal / Polímero' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine MP5 Hi‑Cap 200rds (AEG)',
    description: 'Cargador hi‑cap de 200 BBs para MP5 AEG, rueda inferior de alimentación.',
    price: 16,
    category: 'magazines',
    status: 'active',
    stock: 40,
    thumbnails: img('https://www.arsenalsports.com/img/15993/produtos/600/e0fd58b4e8647b24b0c9560602746911.jpg'),
    specs: { capacity: 200, compatibility: ['MP5 AEG'], material: 'Metal / Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  // SCAR‑H
  {
    id: uuid(),
    title: 'Magazine SCAR‑H Mid‑Cap 120rds (AEG)',
    description: 'Cargador mid‑cap 7.62‑style para plataformas SCAR‑H AEG.',
    price: 18,
    category: 'magazines',
    status: 'active',
    stock: 30,
    thumbnails: img('https://www.arsenalsports.com/img/30100/produtos/600/50a9093d179299cd4f514384059ff679.jpg'),
    specs: { capacity: 120, compatibility: ['SCAR‑H AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine SCAR‑H Hi‑Cap 470rds (AEG)',
    description: 'Cargador hi‑cap de alta capacidad para SCAR‑H AEG.',
    price: 22,
    category: 'magazines',
    status: 'active',
    stock: 25,
    thumbnails: img('https://www.arsenalsports.com/img/26141/produtos/600/83f6fd3a216829363ba177d6fcf4db76.jpg'),
    specs: { capacity: 470, compatibility: ['SCAR‑H AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  // AUG
  {
    id: uuid(),
    title: 'Magazine AUG Mid‑Cap 110rds (AEG)',
    description: 'Cargador mid‑cap translúcido para plataformas AUG AEG.',
    price: 16,
    category: 'magazines',
    status: 'active',
    stock: 35,
    thumbnails: img('https://www.arsenalsports.com/img/28734/produtos/600/ae0de68fde1839912b05ada79fc79641.jpg'),
    specs: { capacity: 110, compatibility: ['AUG AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine AUG Hi‑Cap 330rds (AEG)',
    description: 'Cargador hi‑cap para AUG AEG con cuerpo de polímero resistente.',
    price: 19,
    category: 'magazines',
    status: 'active',
    stock: 30,
    thumbnails: img('https://www.arsenalsports.com/img/27695/produtos/600/caf9f7825ac68fc1e98d603c361b4c22.jpg'),
    specs: { capacity: 330, compatibility: ['AUG AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  // PDW / M4 (APS PER706)
  {
    id: uuid(),
    title: 'APS U‑Mag M4 Mid‑Cap 130rds (AEG)',
    description: 'Cargador mid‑cap tipo U‑Mag para plataformas M4/M16 AEG. Polímero POM de alta resistencia y resorte tratado.',
    price: 10,
    category: 'magazines',
    status: 'active',
    stock: 80,
    thumbnails: img('https://www.arsenalsports.com/img/8374/produtos/600/d315b467564dc1cd8effed9dece99e2a.jpg'),
    specs: { capacity: 130, compatibility: ['M4/M16/AR‑15 AEG'], material: 'Polímero POM' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine M4 Hi‑Cap 300rds (AEG)',
    description: 'Cargador hi‑cap para plataformas M4/M16 AEG con rueda de alimentación.',
    price: 12,
    category: 'magazines',
    status: 'active',
    stock: 60,
    thumbnails: img('https://www.arsenalsports.com/img/5081/produtos/600/fa371312f1bf60370808408eb731a9e3.jpg'),
    specs: { capacity: 300, compatibility: ['M4/M16/AR‑15 AEG'], material: 'Metal / Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  // UMP45 (GBBR) — mags GBB
  {
    id: uuid(),
    title: 'Magazine UMP45 Mid‑Cap 110rds (GBB/AEG estilo real)',
    description: 'Cargador tipo mid para UMP45 (compatibilidad según plataforma). Construcción de polímero reforzado.',
    price: 28,
    category: 'magazines',
    status: 'active',
    stock: 20,
    thumbnails: img('https://www.arsenalsports.com/img/16387/produtos/600/291cccc33021f87b2129ec7bcdc8e383.jpg'),
    specs: { capacity: 110, compatibility: ['UMP45 (verificar AEG/GBB)'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine UMP45 Hi‑Cap 420rds (AEG)',
    description: 'Cargador hi‑cap de 420 BBs para UMP‑style AEG. (Para GBBR usar cargadores específicos de gas).',
    price: 24,
    category: 'magazines',
    status: 'active',
    stock: 22,
    thumbnails: img('https://www.arsenalsports.com/img/17785/produtos/600/ad67ae48de59804cd2ca5df2b6eaf5d1.jpg'),
    specs: { capacity: 420, compatibility: ['UMP AEG'], material: 'Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  // ASR117 / M4 
  {
    id: uuid(),
    title: 'APS U‑Mag M4 Mid‑Cap 130rds (AEG) — Black Reaper',
    description: 'Cargador mid‑cap U‑Mag de 130 BBs para M4/M16 AEG. Polímero POM de alta resistencia, resorte japonés.',
    price: 10,
    category: 'magazines',
    status: 'active',
    stock: 80,
    thumbnails: img('https://www.arsenalsports.com/img/17785/produtos/600/ad67ae48de59804cd2ca5df2b6eaf5d1.jpg'),
    specs: { capacity: 130, compatibility: ['M4/M16/AR‑15 AEG'], material: 'Polímero POM' },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Magazine M4 Hi‑Cap 300rds (AEG) — Black',
    description: 'Cargador hi‑cap 300 BBs para plataformas M4/M16 AEG.',
    price: 12,
    category: 'magazines',
    status: 'active',
    stock: 60,
    thumbnails: img('https://www.arsenalsports.com/img/17785/produtos/600/ad67ae48de59804cd2ca5df2b6eaf5d1.jpg'),
    specs: { capacity: 300, compatibility: ['M4/M16/AR‑15 AEG'], material: 'Metal / Polímero' },
    createdAt: now(),
    updatedAt: now()
  },

  //
  // ============================
  // BBs (1 KG)
  // ============================
  {
    id: uuid(),
    title: 'BLS Precision BBs 0.20g — Bolsa 1 kg',
    description:
      'BBs grado competencia, esféricas y sin imperfecciones. Diámetro 5.94–5.96 mm, bolsa resellable para un mejor almacenamiento. Excelente consistencia para todo rango de FPS.',
    price: 7,
    category: 'bbs',
    status: 'active',
    stock: 120,
    brand: 'BLS',
    thumbnails: img('https://www.arsenalsports.com/img/22220/produtos/1200/0f6ccecee5f45c8b9332ab97e6bf3756.jpg'),
    specs: {
      weight: 0.20,
      diameter: 5.95,
      quantity: 5000, // aprox. 1kg / 0.20g
      material: 'Polímero (Precision Grade)'
    },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'BLS Precision BBs 0.28g — Bolsa 1 kg',
    description:
      'BBs 0.28 g Precision Grade, diámetro 5.95 mm ± 0.01 mm. Superficie pulida para máxima precisión y consistencia.',
    price: 9,
    category: 'bbs',
    status: 'active',
    stock: 100,
    brand: 'BLS',
    thumbnails: img('https://www.arsenalsports.com/img/13972/produtos/1200/428ec1895bae2d708d672a56d395bdca.jpg'),
    specs: {
      weight: 0.28,
      diameter: 5.95,
      quantity: 3570, // aprox. 1kg / 0.28g
      material: 'Polímero (Precision Grade)'
    },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'BLS Precision BBs 0.40g — Bolsa 1 kg (Ivory)',
    description:
      'BBs 0.40 g con alta uniformidad y resistencia a astillado. Bolsa resellable y acabado premium para tiros de larga distancia.',
    price: 23,
    category: 'bbs',
    status: 'active',
    stock: 80,
    brand: 'BLS',
    thumbnails: img('https://www.arsenalsports.com/img/21923/produtos/1200/e8aec42462cfb2f8bf5133296c3e466c.jpg'),
    specs: {
      weight: 0.40,
      diameter: 5.95,
      quantity: 2500, // aprox. 1kg / 0.40g
      material: 'Polímero (Precision Grade)'
    },
    createdAt: now(),
    updatedAt: now()
  },

  //
  // ============================
  // BBs (25 KG)
  // ============================
  {
    id: uuid(),
    title: 'BLS BBs 0.20g — Bolsa 25 kg (Precision White)',
    description:
      'BBs 0.20 g grado precisión para uso intensivo. Diámetro 5.94–5.96 mm y consistencia esférica. Presentación industrial 25 kg.',
    price: 178,
    category: 'bbs',
    status: 'active',
    stock: 8,
    brand: 'BLS',
    thumbnails: img('https://www.arsenalsports.com/img/20807/produtos/1200/ada91e7f36b4d96b40c9bf3e07dbbe33.jpg'),
    specs: {
      weight: 0.20,
      diameter: 5.95,
      quantity: 125000, // 25kg / 0.20g
      material: 'Polímero (Precision Grade)'
    },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'BLS BBs 0.28g — Bolsa 25 kg (Precision White)',
    description:
      'BBs 0.28 g grado precisión. Diámetro 5.94–5.96 mm, esfericidad consistente y empaque 25 kg para equipos/tiendas.',
    price: 210,
    category: 'bbs',
    status: 'active',
    stock: 6,
    brand: 'BLS',
    thumbnails: img('https://www.arsenalsports.com/img/20807/produtos/1200/ada91e7f36b4d96b40c9bf3e07dbbe33.jpg'),
    specs: {
      weight: 0.28,
      diameter: 5.95,
      quantity: 89285, // 25kg / 0.28g
      material: 'Polímero (Precision Grade)'
    },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'BLS BBs 0.40g — Bolsa 25 kg (Precision White)',
    description:
      'BBs 0.40 g de alta uniformidad para tiradores DMR/Sniper. Presentación 25 kg. (Foto ilustrativa de la línea 25 kg).',
    price: 360,
    category: 'bbs',
    status: 'active',
    stock: 4,
    brand: 'BLS',
    thumbnails: img('https://www.arsenalsports.com/img/20807/produtos/1200/ada91e7f36b4d96b40c9bf3e07dbbe33.jpg'),
    specs: {
      weight: 0.40,
      diameter: 5.95,
      quantity: 62500, // 25kg / 0.40g
      material: 'Polímero (Precision Grade)'
    },
    createdAt: now(),
    updatedAt: now()
  },

  //
  // ============================
  // BATERÍAS
  // ============================
  {
    id: uuid(),
    title: 'Nano‑Tech LiPo 7.4V 1200mAh (2S) 15–25C — Mini Tamiya',
    description:
      'Batería LiPo 7.4 V 1200 mAh (2S1P) con descarga 15C (25C burst). Tecnología nano‑core para menor impedancia y mejor entrega de corriente. Conector Mini‑Tamiya, conector de balance JST‑XH.',
    price: 14,
    category: 'batteries',
    status: 'active',
    stock: 30,
    thumbnails: img('https://www.arsenalsports.com/img/25934/produtos/1200/0d1041fb5d1f85d1d853ffdc2be604d1.jpg'),
    specs: {
      voltage: 7.4,
      capacity: 1200,
      chemistry: 'LiPo Nano‑Tech',
      connector: 'Mini Tamiya'
    },
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: uuid(),
    title: 'Nano‑Tech LiPo 11.1V 1200mAh (3S) 15–25C — Mini Tamiya',
    description:
      'Batería LiPo 11.1 V 1200 mAh (3S1P) con descarga 15C (25C burst). Baja caída de tensión y mejor control térmico. Conector Mini‑Tamiya, balance JST‑XH.',
    price: 17,
    category: 'batteries',
    status: 'active',
    stock: 28,
    thumbnails: img('https://www.arsenalsports.com/img/25932/produtos/1200/7d989791403832c656d9acda36f9ce96.jpg'),
    specs: {
      voltage: 11.1,
      capacity: 1200,
      chemistry: 'LiPo Nano‑Tech',
      connector: 'Mini Tamiya'
    },
    createdAt: now(),
    updatedAt: now()
  }
];

// Carritos
const SEED_CARTS = [];

/**
 * FS helpers
 */
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    console.log('📁 Creando directorio data/');
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isArrayJsonOrEmpty(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data.length === 0 : false;
  } catch {
    return true;
  }
}

async function shouldInitialize(filePath, force = false) {
  if (force) return true;
  const exists = await fileExists(filePath);
  if (!exists) return true;
  return await isArrayJsonOrEmpty(filePath);
}

/**
 * Seed writers
 */
async function seedProducts(force = false) {
  if (await shouldInitialize(PRODUCTS_FILE, force)) {
    console.log('Inicializando products.json con datos de ejemplo...');
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf-8');
    console.log(`Creados ${SEED_PRODUCTS.length} productos`);
  } else {
    console.log('products.json ya existe con datos, omitiendo...');
  }
}

async function seedCarts(force = false) {
  if (await shouldInitialize(CARTS_FILE, force)) {
    console.log('Inicializando carts.json...');
    await fs.writeFile(CARTS_FILE, JSON.stringify(SEED_CARTS, null, 2), 'utf-8');
    console.log('Archivo carts.json creado');
  } else {
    console.log('carts.json ya existe, omitiendo...');
  }
}

/**
 * Entradas
 */
async function initializeIfEmpty() {
  try {
    await ensureDataDir();
    await seedProducts(false);
    await seedCarts(false);
    console.log('Inicialización de datos completada');
  } catch (error) {
    console.error('Error durante la inicialización:', error.message);
    throw error;
  }
}

async function seedAll(force = false) {
  try {
    console.log('Iniciando seed de datos...');
    await ensureDataDir();
    await seedProducts(force);
    await seedCarts(force);
    console.log('Seed completado exitosamente');
  } catch (error) {
    console.error('Error durante el seed:', error.message);
    process.exit(1);
  }
}

// CLI
if (require.main === module) {
  const force = process.argv.includes('--force');
  if (force) console.log('⚠️  Modo --force activado: sobrescribiendo datos existentes');
  seedAll(force);
}

module.exports = {
  seedAll,
  initializeIfEmpty,
  SEED_PRODUCTS,
  SEED_CARTS
};
