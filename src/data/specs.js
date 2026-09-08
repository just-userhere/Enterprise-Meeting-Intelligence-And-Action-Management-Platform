// Verified from official Maruti Suzuki Arena Swift page + Swift brochure (2024 Epic New Swift).
// Do not invent beyond this. Variant-specific notes flagged explicitly.
export const VERIFIED_SPECS = {
  engineType: 'Z12E',
  engineDesc: '1.2L Z-Series Dual Jet, Dual VVT',
  displacement: '1197 cc',
  cylinders: '3',
  power: { value: 81.58, unit: 'PS', rpm: '5700 rpm', alt: '60 kW @ 5700 rpm' },
  torque: { value: 111.7, unit: 'Nm', rpm: '4300 rpm' },
  transmission: ['5MT', '5AMT'],
  mileageMT: 24.8,
  mileageAMT: 25.75,
  mileageUnit: 'km/l',
  length: 3860,
  width: 1735,
  height: 1520,
  wheelbase: 2450,
  groundClearance: 163,
  bootSpace: 265,
  fuelTank: 37,
  turningRadius: 4.8,
  seating: 5,
  tyreVXi: '165/80 R14',
  tyreNote: 'Steel wheels with wheel covers (VXi). Alloys are ZXi / ZXi+ only.',
  brakes: 'Ventilated Disc (Front) / Drum (Rear)',
  suspension: 'MacPherson Strut (F) / Torsion Beam (R)',
  emission: 'BS VI',
  source: 'marutisuzuki.com/arena/swift + official brochure'
}

export const VXI_FEATURES = {
  included: [
    '7" SmartPlay Studio with smartphone connectivity',
    'Steering-mounted audio & calling controls',
    'Electrically adjustable ORVMs',
    'Power windows (front + rear) with driver anti-pinch',
    'Keyless entry + central locking + speed-sensing lock',
    'Manual air-conditioner',
    'Rear defogger + electric back-door opener',
    'Front USB (Type A)',
    'Gear-shift indicator + Idle Start-Stop (ISS)',
    'Dual-tone interior with flat-bottom steering feel'
  ],
  higherVariantOnly: [
    'LED DRLs with projector headlamps — ZXi+ (VXi gets halogen with manual levelling)',
    'Alloy wheels 185/65 R15 — ZXi / ZXi+ only',
    'Push-start + Smart Key — VXi(O) and above',
    'Auto AC + rear AC vents — ZXi and above',
    'Cruise control + wireless charger — ZXi+ only',
    'Rear wiper/washer + 60:40 split — ZXi and above'
  ]
}

export const SAFETY_FEATURES = [
  { icon: '◈', name: '6 Airbags', desc: 'Dual front + side + curtain protection (standard range).' },
  { icon: '◎', name: 'ESP + Hill-Hold', desc: 'Electronic stability + hill-hold assist for confident city climbs.' },
  { icon: '⬢', name: 'ABS with EBD', desc: 'Ventilated front discs with anti-lock + distribution.' },
  { icon: '⬣', name: 'ISOFIX + Sensors', desc: 'Child-seat mounts + rear parking sensors + high-speed alert.' }
]

export const COLORS = [
  { id: 'sizzling-red', name: 'Sizzling Red', hex: '#c4001a', env: '#3a0a12' },
  { id: 'luster-blue', name: 'Luster Blue', hex: '#1a4fa0', env: '#0a1a3a' },
  { id: 'arctic-white', name: 'Arctic White', hex: '#e8e8e6', env: '#1a1c20' },
  { id: 'magma-grey', name: 'Magma Grey', hex: '#4a4d52', env: '#101214' },
  { id: 'splendid-silver', name: 'Splendid Silver', hex: '#a8adb3', env: '#16181c' },
  { id: 'novel-orange', name: 'Novel Orange', hex: '#d95a00', env: '#2a1400' }
]
