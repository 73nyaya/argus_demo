// ============================================
// CURRENT USER
// ============================================
const CURRENT_USER = {
  name: 'Nicolas', lastname: 'Yaya', email: 'nicolasy@mincka.com.au',
  initials: 'NY', position: 'Engineer', phone: '+57 3555 5555'
};

// ============================================
// SITES
// ============================================
const SITES = {
  'el-paso': {
    id: 'el-paso', name: 'El Paso Mine', slug: 'el-paso', prefix: 'EP',
    customer: 'Glencore', year: 2026,
    totalDefects: 258, closedDefects: 54, openDefects: 204, remediationRate: 21,
    totalTasks: 56, tasksNotStarted: 30, tasksInProgress: 14, tasksCompleted: 12
  },
  'hail-creek': {
    id: 'hail-creek', name: 'Quinto Mayor Open Cut', slug: 'hail-creek', prefix: 'HC',
    customer: 'Glencore', year: 2026,
    totalDefects: 534, closedDefects: 434, openDefects: 100, remediationRate: 81,
    totalTasks: 42, tasksNotStarted: 10, tasksInProgress: 12, tasksCompleted: 20
  }
};

// ============================================
// ASSETS — use ASSETS[slug].length for asset counts
// ============================================
const ASSETS = {
  'el-paso': [
    { code: 'EP01', name: '13M Reclaim Tunnel', totalDefects: 56, critical: 12, remediated: 78, assignedTo: 'John Smith' },
    { code: 'EP02', name: 'Main Bridge Deck', totalDefects: 43, critical: 8, remediated: 65, assignedTo: 'Sarah Chen' },
    { code: 'EP03', name: 'Reject Bin 1000T', totalDefects: 5, critical: 5, remediated: 0, assignedTo: 'John Smith', has3DViewer: true },
    { code: 'EP04', name: 'Substation A', totalDefects: 28, critical: 7, remediated: 45, assignedTo: 'Mike Torres' },
    { code: 'EP05', name: 'Pump Station', totalDefects: 22, critical: 3, remediated: 91, assignedTo: 'Sarah Chen' },
    { code: 'EP06', name: 'North Sector Conveyor', totalDefects: 19, critical: 4, remediated: 58, assignedTo: 'John Smith' },
    { code: 'EP07', name: 'CHPP Main Structure', totalDefects: 35, critical: 9, remediated: 34, assignedTo: 'Mike Torres' },
    { code: 'EP08', name: 'ROM Bin 500T', totalDefects: 14, critical: 2, remediated: 86, assignedTo: 'Sarah Chen' },
    { code: 'EP09', name: 'Wash Plant Foundation', totalDefects: 8, critical: 1, remediated: 100, assignedTo: 'John Smith' }
  ],
  'hail-creek': [
    { code: 'HC01', name: 'Conveyor 718M', totalDefects: 67, critical: 14, remediated: 85, assignedTo: 'David Kim' },
    { code: 'HC02', name: 'Rejects Bin', totalDefects: 52, critical: 11, remediated: 79, assignedTo: 'Laura Perez' },
    { code: 'HC03', name: 'CHPP Centrifuge Building', totalDefects: 48, critical: 8, remediated: 83, assignedTo: 'David Kim' },
    { code: 'HC04', name: 'Transfer Station 4', totalDefects: 41, critical: 6, remediated: 88, assignedTo: 'Laura Perez' },
    { code: 'HC05', name: 'Stockpile Tunnel', totalDefects: 38, critical: 5, remediated: 76, assignedTo: 'David Kim' },
    { code: 'HC06', name: 'Rail Loadout', totalDefects: 33, critical: 4, remediated: 91, assignedTo: 'Laura Perez' }
  ]
};

// ============================================
// SITE PHOTOS — hero banner image per site (public/converted_jpg)
// ============================================
const SITE_PHOTOS = {
  'el-paso': 'MP CHPP Building Structure.jpg',
  'hail-creek': 'OCN Stacker Conveyor 16M.jpg'
};

// ============================================
// ASSET PHOTOS — map asset code to photo filename in public/converted_jpg
// Matched by asset name to photo name (e.g. "13M Reclaim Tunnel" → "OCN 13M Reclaim Tunnel.jpg")
// ============================================
const ASSET_PHOTOS = {
  'EP01': 'OCN 13M Reclaim Tunnel.jpg',       // 13M Reclaim Tunnel
  'EP02': 'Mod 4 Building Structure.jpg',    // Main Bridge Deck (structure)
  'EP03': 'MP Reject Bin.jpg',                // Reject Bin 1000T
  'EP04': 'MP Substation 02.jpg',             // Substation A
  'EP05': 'CHPP Water Treatment Plant.jpg',   // Pump Station (water treatment / pumping)
  'EP06': '9M Conveyor.jpg',                  // North Sector Conveyor
  'EP07': 'MP CHPP Building Structure.jpg',   // CHPP Main Structure
  'EP08': 'TLO Bin.jpg',                      // ROM Bin 500T
  'EP09': 'MP Balance Tank Recycled Water.jpg', // Wash Plant Foundation (water/wash)
  'HC01': 'OCN Stacker Conveyor 16M.jpg',    // Conveyor 718M
  'HC02': 'MP Reject Bin.jpg',               // Rejects Bin
  'HC03': 'MP CHPP Building Structure.jpg',   // CHPP Centrifuge Building (CHPP industrial building)
  'HC04': 'MP Transfer Tower.jpg',           // Transfer Station 4
  'HC05': 'TLO 9M Product Reclaim Tunnel.jpg', // Stockpile Tunnel
  'HC06': 'TLO Structure.jpg'                 // Rail Loadout
};

// ============================================
// DEFECT FILE MAP — app defect ID → actual file names in public/defects
// Files use codes like 37.01, 37.07, 47.03, 47.15; report=[code].pdf, remedial=[code]_Remedial.pdf,
// photos=[code].01.jpeg, [code].02.jpeg, [code].03.jpeg (OC47.06 uses .1 for first: OC47.06.1.jpeg).
// EP03.05 uses OC47.06 for photos and 47.06 for report/remedial (same defect, two naming styles).
// ============================================
const DEFECT_FILE_MAP = {
  'EP03.01': { report: '37.01', remedial: '37.01', photos: '37.01', firstPhotoSuffix: '01' },
  'EP03.02': { report: '37.07', remedial: '37.07', photos: '37.07', firstPhotoSuffix: '01' },
  'EP03.03': { report: '47.03', remedial: '47.03', photos: '47.03', firstPhotoSuffix: '01' },
  'EP03.04': { report: '47.15', remedial: '47.15', photos: '47.15', firstPhotoSuffix: '01' },
  'EP03.05': { report: '47.06', remedial: '47.06', photos: 'OC47.06', firstPhotoSuffix: '1' }
};

function getDefectMediaPaths(defectId) {
  var map = typeof DEFECT_FILE_MAP !== 'undefined' ? DEFECT_FILE_MAP[defectId] : null;
  if (!map) return null;
  var base = 'public/defects/';
  var ext = '.jpeg';
  return {
    reportPdf: base + map.report + '.pdf',
    remedialPdf: base + map.remedial + '_Remedial.pdf',
    photoGeneral: base + map.photos + '.' + (map.firstPhotoSuffix || '01') + ext,
    photoCloseUp: base + map.photos + '.02' + ext,
    photoDetailed: base + map.photos + '.03' + ext
  };
}

// ============================================
// DEFECTS (complete — do not generate, use as-is)
// ============================================
const DEFECTS = {
  'el-paso': [
    { id: 'EP01.01', type: 'Steel Corrosion', asset: '13M Reclaim Tunnel', assetCode: 'EP01', riskLevel: 'very-high', riskScore: 24, status: 'Not Status Set', targetDate: '24/02/2026' },
    { id: 'EP01.02', type: 'Concrete Cracking', asset: '13M Reclaim Tunnel', assetCode: 'EP01', riskLevel: 'very-high', riskScore: 23, status: 'Not Actioned', targetDate: '28/02/2026' },
    { id: 'EP01.03', type: 'Concrete Spalling', asset: '13M Reclaim Tunnel', assetCode: 'EP01', riskLevel: 'very-high', riskScore: 23, status: 'In Progress', targetDate: '05/03/2026' },
    { id: 'EP02.01', type: 'Steel Corrosion', asset: 'Main Bridge Deck', assetCode: 'EP02', riskLevel: 'high', riskScore: 18, status: 'Not Status Set', targetDate: '05/03/2026' },
    { id: 'EP02.02', type: 'Weld Defect', asset: 'Main Bridge Deck', assetCode: 'EP02', riskLevel: 'high', riskScore: 17, status: 'Work Order Created', targetDate: '10/03/2026' },
    // First 5 defects in Reject Bin — paths resolved via DEFECT_FILE_MAP (37.01, 37.07, 47.03, 47.15, OC47.06/47.06)
    { id: 'EP03.01', type: 'Steel Corrosion', asset: 'Reject Bin 1000T', assetCode: 'EP03', riskLevel: 'medium', riskScore: 14, status: 'Not Actioned', targetDate: '12/03/2026', area: 'Steel Plate', closureStatus: 'Not closed' },
    { id: 'EP03.02', type: 'Concrete Cracking', asset: 'Reject Bin 1000T', assetCode: 'EP03', riskLevel: 'high', riskScore: 16, status: 'In Progress', targetDate: '15/03/2026', area: 'Wall Panel', closureStatus: 'Not closed' },
    { id: 'EP03.03', type: 'Reinforcement Corrosion', asset: 'Reject Bin 1000T', assetCode: 'EP03', riskLevel: 'medium', riskScore: 12, status: 'Work Order Created', targetDate: '20/03/2026', area: 'Steel Plate', closureStatus: 'Not closed' },
    { id: 'EP03.04', type: 'Coating Failure', asset: 'Reject Bin 1000T', assetCode: 'EP03', riskLevel: 'medium', riskScore: 11, status: 'Not Status Set', targetDate: '25/03/2026', area: 'Hopper Section', closureStatus: 'Not closed' },
    { id: 'EP03.05', type: 'Steel Corrosion', asset: 'Reject Bin 1000T', assetCode: 'EP03', riskLevel: 'high', riskScore: 17, status: 'Notification Raised', targetDate: '28/03/2026', area: 'Steel Plate', closureStatus: 'Not closed' },
    { id: 'EP04.01', type: 'Bolt Failure', asset: 'Substation A', assetCode: 'EP04', riskLevel: 'high', riskScore: 17, status: 'Not Actioned', targetDate: '18/03/2026' },
    { id: 'EP04.02', type: 'Steel Corrosion', asset: 'Substation A', assetCode: 'EP04', riskLevel: 'medium', riskScore: 12, status: 'Not Status Set', targetDate: '20/03/2026' },
    { id: 'EP05.01', type: 'Concrete Spalling', asset: 'Pump Station', assetCode: 'EP05', riskLevel: 'very-high', riskScore: 22, status: 'Not Actioned', targetDate: '25/03/2026' },
    { id: 'EP06.01', type: 'Structural Flaw', asset: 'North Sector Conveyor', assetCode: 'EP06', riskLevel: 'medium', riskScore: 11, status: 'Work Order Created', targetDate: '10/04/2026' },
    { id: 'EP07.01', type: 'Steel Corrosion', asset: 'CHPP Main Structure', assetCode: 'EP07', riskLevel: 'very-high', riskScore: 21, status: 'In Progress', targetDate: '15/04/2026' },
    { id: 'EP07.02', type: 'Concrete Cracking', asset: 'CHPP Main Structure', assetCode: 'EP07', riskLevel: 'high', riskScore: 19, status: 'Not Status Set', targetDate: '18/04/2026' },
    { id: 'EP07.03', type: 'Weld Defect', asset: 'CHPP Main Structure', assetCode: 'EP07', riskLevel: 'medium', riskScore: 13, status: 'Notification Raised', targetDate: '22/04/2026' },
    { id: 'EP08.01', type: 'Coating Failure', asset: 'ROM Bin 500T', assetCode: 'EP08', riskLevel: 'low', riskScore: 6, status: 'Completed/Closed', targetDate: '01/02/2026' },
    { id: 'EP09.01', type: 'Concrete Spalling', asset: 'Wash Plant Foundation', assetCode: 'EP09', riskLevel: 'low', riskScore: 4, status: 'Completed/Closed', targetDate: '15/01/2026' }
  ],
  'hail-creek': [
    { id: 'HC01.01', type: 'Steel Corrosion', asset: 'Conveyor 718M', assetCode: 'HC01', riskLevel: 'very-high', riskScore: 22, status: 'In Progress', targetDate: '10/02/2026' },
    { id: 'HC01.02', type: 'Structural Flaw', asset: 'Conveyor 718M', assetCode: 'HC01', riskLevel: 'very-high', riskScore: 21, status: 'Work Order Created', targetDate: '15/02/2026' },
    { id: 'HC01.03', type: 'Bolt Failure', asset: 'Conveyor 718M', assetCode: 'HC01', riskLevel: 'high', riskScore: 18, status: 'Not Actioned', targetDate: '20/02/2026' },
    { id: 'HC02.01', type: 'Concrete Cracking', asset: 'Rejects Bin', assetCode: 'HC02', riskLevel: 'very-high', riskScore: 21, status: 'Not Status Set', targetDate: '12/02/2026' },
    { id: 'HC02.02', type: 'Reinforcement Corrosion', asset: 'Rejects Bin', assetCode: 'HC02', riskLevel: 'high', riskScore: 16, status: 'Notification Raised', targetDate: '18/02/2026' },
    { id: 'HC03.01', type: 'Concrete Spalling', asset: 'CHPP Centrifuge Building', assetCode: 'HC03', riskLevel: 'high', riskScore: 16, status: 'Work Order Created', targetDate: '25/02/2026' },
    { id: 'HC03.02', type: 'Steel Corrosion', asset: 'CHPP Centrifuge Building', assetCode: 'HC03', riskLevel: 'medium', riskScore: 13, status: 'In Progress', targetDate: '01/03/2026' },
    { id: 'HC04.01', type: 'Weld Defect', asset: 'Transfer Station 4', assetCode: 'HC04', riskLevel: 'medium', riskScore: 12, status: 'Completed/Closed', targetDate: '05/02/2026' },
    { id: 'HC04.02', type: 'Coating Failure', asset: 'Transfer Station 4', assetCode: 'HC04', riskLevel: 'medium', riskScore: 10, status: 'Completed/Closed', targetDate: '10/02/2026' },
    { id: 'HC05.01', type: 'Concrete Cracking', asset: 'Stockpile Tunnel', assetCode: 'HC05', riskLevel: 'high', riskScore: 15, status: 'Not Actioned', targetDate: '15/03/2026' },
    { id: 'HC05.02', type: 'Steel Corrosion', asset: 'Stockpile Tunnel', assetCode: 'HC05', riskLevel: 'medium', riskScore: 9, status: 'Not Status Set', targetDate: '20/03/2026' },
    { id: 'HC06.01', type: 'Bolt Failure', asset: 'Rail Loadout', assetCode: 'HC06', riskLevel: 'low', riskScore: 7, status: 'Work Completed', targetDate: '28/02/2026' },
    { id: 'HC06.02', type: 'Concrete Spalling', asset: 'Rail Loadout', assetCode: 'HC06', riskLevel: 'low', riskScore: 5, status: 'Completed/Closed', targetDate: '15/01/2026' }
  ]
};

// ============================================
// SITES BY YEAR — Year-over-year dummy data (2023–2026)
// ============================================
const SITES_BY_YEAR = {
  2023: {
    'el-paso': {
      id: 'el-paso', name: 'El Paso Mine', slug: 'el-paso', prefix: 'EP',
      customer: 'Glencore', year: 2023,
      totalDefects: 312, closedDefects: 28, openDefects: 284, remediationRate: 9,
      totalTasks: 72, tasksNotStarted: 52, tasksInProgress: 12, tasksCompleted: 8,
      assetCount: 7
    },
    'hail-creek': {
      id: 'hail-creek', name: 'Quinto Mayor Open Cut', slug: 'hail-creek', prefix: 'HC',
      customer: 'Glencore', year: 2023,
      totalDefects: 598, closedDefects: 348, openDefects: 250, remediationRate: 58,
      totalTasks: 58, tasksNotStarted: 28, tasksInProgress: 18, tasksCompleted: 12,
      assetCount: 5
    }
  },
  2024: {
    'el-paso': {
      id: 'el-paso', name: 'El Paso Mine', slug: 'el-paso', prefix: 'EP',
      customer: 'Glencore', year: 2024,
      totalDefects: 288, closedDefects: 46, openDefects: 242, remediationRate: 16,
      totalTasks: 64, tasksNotStarted: 42, tasksInProgress: 14, tasksCompleted: 8,
      assetCount: 8
    },
    'hail-creek': {
      id: 'hail-creek', name: 'Quinto Mayor Open Cut', slug: 'hail-creek', prefix: 'HC',
      customer: 'Glencore', year: 2024,
      totalDefects: 572, closedDefects: 384, openDefects: 188, remediationRate: 67,
      totalTasks: 50, tasksNotStarted: 22, tasksInProgress: 16, tasksCompleted: 12,
      assetCount: 6
    }
  },
  2025: {
    'el-paso': {
      id: 'el-paso', name: 'El Paso Mine', slug: 'el-paso', prefix: 'EP',
      customer: 'Glencore', year: 2025,
      totalDefects: 270, closedDefects: 52, openDefects: 218, remediationRate: 19,
      totalTasks: 60, tasksNotStarted: 36, tasksInProgress: 14, tasksCompleted: 10,
      assetCount: 9
    },
    'hail-creek': {
      id: 'hail-creek', name: 'Quinto Mayor Open Cut', slug: 'hail-creek', prefix: 'HC',
      customer: 'Glencore', year: 2025,
      totalDefects: 552, closedDefects: 412, openDefects: 140, remediationRate: 75,
      totalTasks: 46, tasksNotStarted: 16, tasksInProgress: 14, tasksCompleted: 16,
      assetCount: 6
    }
  },
  2026: {
    'el-paso': {
      id: 'el-paso', name: 'El Paso Mine', slug: 'el-paso', prefix: 'EP',
      customer: 'Glencore', year: 2026,
      totalDefects: 256, closedDefects: 56, openDefects: 200, remediationRate: 22,
      totalTasks: 56, tasksNotStarted: 30, tasksInProgress: 14, tasksCompleted: 12,
      assetCount: 9
    },
    'hail-creek': {
      id: 'hail-creek', name: 'Quinto Mayor Open Cut', slug: 'hail-creek', prefix: 'HC',
      customer: 'Glencore', year: 2026,
      totalDefects: 534, closedDefects: 434, openDefects: 100, remediationRate: 81,
      totalTasks: 42, tasksNotStarted: 10, tasksInProgress: 12, tasksCompleted: 20,
      assetCount: 6
    }
  }
};

// ============================================
// DEFECTS BY YEAR — Year-over-year (same defects, targetDate adjusted)
// ============================================
function defectWithYear(d, year) {
  var date = (d.targetDate || '24/02/2026').toString();
  var parts = date.split('/');
  if (parts.length === 3) { parts[2] = String(year); date = parts.join('/'); }
  return { id: d.id, type: d.type, asset: d.asset, assetCode: d.assetCode, riskLevel: d.riskLevel, riskScore: d.riskScore, status: d.status, targetDate: date };
}

function defectsForYear(slug, year) {
  return (DEFECTS[slug] || []).map(function (d) { return defectWithYear(d, year); });
}

const DEFECTS_BY_YEAR = {
  2023: { 'el-paso': defectsForYear('el-paso', 2023), 'hail-creek': defectsForYear('hail-creek', 2023) },
  2024: { 'el-paso': defectsForYear('el-paso', 2024), 'hail-creek': defectsForYear('hail-creek', 2024) },
  2025: { 'el-paso': defectsForYear('el-paso', 2025), 'hail-creek': defectsForYear('hail-creek', 2025) },
  2026: { 'el-paso': DEFECTS['el-paso'] || [], 'hail-creek': DEFECTS['hail-creek'] || [] }
};

// ============================================
// SCHEDULE EVENTS — month is 0-indexed (0=Jan, 1=Feb, etc.)
// ============================================
const SCHEDULE_EVENTS = {
  'el-paso': [
    {
      id: 'ev1', title: 'Annual Structural Inspection', month: 0,
      startDate: 'January 15, 2026', endDate: 'January 30, 2026', isCurrent: true,
      description: 'Annual on-site assessment of infrastructure assets including defect identification, photographic documentation, and 3D scan capture.',
      todos: [
        { id: 't1', text: 'Confirm site access and permits', done: true },
        { id: 't2', text: 'Notify site personnel of inspection schedule', done: false },
        { id: 't3', text: 'Prepare equipment and calibration checks', done: false }
      ]
    },
    {
      id: 'ev2', title: 'CHPP Shutdown Inspection', month: 1,
      startDate: 'February 5, 2026', endDate: 'February 7, 2026', isCurrent: false,
      description: 'Opportunistic inspection during scheduled CHPP maintenance shutdown. Focus on normally inaccessible areas.',
      todos: [
        { id: 't4', text: 'Coordinate with maintenance team', done: false },
        { id: 't5', text: 'Prepare confined space equipment', done: false }
      ]
    },
    {
      id: 'ev3', title: 'Conveyor Belt Replacement Review', month: 2,
      startDate: 'March 10, 2026', endDate: 'March 12, 2026', isCurrent: false,
      description: 'Post-replacement inspection of conveyor belt structure and supporting steelwork.',
      todos: [
        { id: 't6', text: 'Review replacement documentation', done: false },
        { id: 't7', text: 'Schedule access with operations', done: false }
      ]
    }
  ],
  'hail-creek': [
    {
      id: 'ev4', title: 'Q1 Structural Review', month: 1,
      startDate: 'February 10, 2026', endDate: 'February 20, 2026', isCurrent: true,
      description: 'Quarterly review of all high-risk assets. Comparison with previous quarter findings.',
      todos: [
        { id: 't8', text: 'Pull previous quarter reports', done: true },
        { id: 't9', text: 'Schedule drone survey', done: true },
        { id: 't10', text: 'Confirm vehicle access to remote assets', done: false }
      ]
    },
    {
      id: 'ev5', title: 'Conveyor 718M Deep Inspection', month: 2,
      startDate: 'March 15, 2026', endDate: 'March 18, 2026', isCurrent: false,
      description: 'Detailed inspection of Conveyor 718M following identified structural concerns from Q4 2025.',
      todos: [
        { id: 't11', text: 'Review Q4 2025 defect reports', done: false },
        { id: 't12', text: 'Arrange scaffolding access', done: false }
      ]
    }
  ]
};

// ============================================
// USERS (Settings > User Management) — use `let`, Add Member pushes here
// ============================================
let USERS = [
  { name: 'Jesus', lastname: 'Bueno', email: 'jbueno@nativapps.com', role: 'Designer', dateAdded: '24/02/2026' },
  { name: 'Maria', lastname: 'Gonzalez', email: 'maria.g@nativapps.com', role: 'Developer', dateAdded: '15/03/2025' },
  { name: 'Carlos', lastname: 'Hernandez', email: 'carlos.h@nativapps.com', role: 'Product Manager', dateAdded: '10/01/2026' },
  { name: 'Sofia', lastname: 'Lopez', email: 'sofia.l@nativapps.com', role: 'UX Researcher', dateAdded: '22/08/2025' },
  { name: 'David', lastname: 'Martinez', email: 'david.m@nativapps.com', role: 'Frontend Developer', dateAdded: '05/09/2025' },
  { name: 'Laura', lastname: 'Perez', email: 'laura.p@nativapps.com', role: 'UI Designer', dateAdded: '30/04/2025' },
  { name: 'Juan', lastname: 'Rodriguez', email: 'juan.r@nativapps.com', role: 'Backend Developer', dateAdded: '11/11/2025' },
  { name: 'Ana', lastname: 'Sanchez', email: 'ana.s@nativapps.com', role: 'Data Analyst', dateAdded: '14/07/2025' },
  { name: 'Pedro', lastname: 'Torres', email: 'pedro.t@nativapps.com', role: 'Quality Assurance', dateAdded: '18/12/2025' },
  { name: 'Elena', lastname: 'Fernandez', email: 'elena.f@nativapps.com', role: 'Marketing Specialist', dateAdded: '29/01/2026' }
];

// ============================================
// RESOURCES — guides and materials for the app
// ============================================
const RESOURCES = [
  { id: 'r1', title: 'Getting started with Argus', description: 'Learn the basics: dashboard, sites, and navigation. Perfect for new users.', type: 'guide', icon: 'rocket_launch', duration: '5 min' },
  { id: 'r2', title: 'Assets & 3D inspection', description: 'How to browse assets, view 3D models, and understand remediation status.', type: 'guide', icon: 'view_in_ar', duration: '8 min' },
  { id: 'r3', title: 'Managing defects and risk', description: 'Create, track, and prioritise defects. Risk levels and target dates explained.', type: 'guide', icon: 'warning_amber', duration: '10 min' },
  { id: 'r4', title: 'Tasks and workflow', description: 'From open tasks to work orders and completion. Status workflow overview.', type: 'guide', icon: 'task_alt', duration: '6 min' },
  { id: 'r5', title: 'Schedule and planning', description: 'Use the schedule view for inspections and maintenance planning.', type: 'guide', icon: 'calendar_month', duration: '4 min' },
  { id: 'r6', title: 'API reference', description: 'REST API endpoints for sites, assets, defects, and exports. Authentication and rate limits.', type: 'documentation', icon: 'code', duration: null },
  { id: 'r7', title: 'User roles and permissions', description: 'Admin, engineer, viewer: what each role can do in Argus.', type: 'documentation', icon: 'admin_panel_settings', duration: null },
  { id: 'r8', title: 'Data export and reports', description: 'Export defects, assets, and KPIs. CSV, Excel, and PDF report options.', type: 'documentation', icon: 'download', duration: null },
  { id: 'r9', title: 'Argus product overview', description: 'A short video introducing Argus and its value for asset inspection.', type: 'video', icon: 'play_circle', duration: '3:42' },
  { id: 'r10', title: '3D viewer walkthrough', description: 'Navigate the point cloud viewer: zoom, rotate, and defect markers.', type: 'video', icon: 'videocam', duration: '5:20' },
  { id: 'r11', title: 'Keyboard shortcuts', description: 'Quick reference for all keyboard shortcuts in the app.', type: 'quick-reference', icon: 'keyboard', duration: null },
  { id: 'r12', title: 'Glossary of terms', description: 'Definitions for defect types, risk levels, statuses, and asset terms.', type: 'quick-reference', icon: 'menu_book', duration: null }
];

// ============================================
// NOTIFICATIONS — communications over defects and assets
// ============================================
const NOTIFICATIONS = [
  { id: 'n1', type: 'comment-defect', userId: 'sarah', userName: 'Sarah Chen', userInitials: 'SC', siteSlug: 'el-paso', defectId: 'EP01.01', defectType: 'Steel Corrosion', assetName: '13M Reclaim Tunnel', assetCode: 'EP01', message: 'Inspection photos attached. Corrosion appears more extensive than initially assessed—recommend prioritising this for next cycle.', timestamp: '2h ago', read: false, replies: [{ userId: 'nicolas', userName: 'Nicolas Yaya', userInitials: 'NY', message: 'Thanks Sarah. I\'ll escalate to maintenance.', timestamp: '1h ago' }] },
  { id: 'n2', type: 'mention', userId: 'mike', userName: 'Mike Torres', userInitials: 'MT', siteSlug: 'el-paso', defectId: 'EP07.01', defectType: 'Steel Corrosion', assetName: 'CHPP Main Structure', assetCode: 'EP07', message: '@Nicolas can you review EP07.01? We may need to adjust the target date based on contractor availability.', timestamp: '4h ago', read: false, replies: [] },
  { id: 'n3', type: 'comment-asset', userId: 'john', userName: 'John Smith', userInitials: 'JS', siteSlug: 'el-paso', assetCode: 'EP03', assetName: 'Reject Bin 1000T', message: '3D scan complete for EP03. Two new defects identified near the north flange—adding to the asset.', timestamp: '5h ago', read: true, replies: [] },
  { id: 'n4', type: 'status-change', userId: 'david', userName: 'David Kim', userInitials: 'DK', siteSlug: 'hail-creek', defectId: 'HC01.02', defectType: 'Structural Flaw', assetName: 'Conveyor 718M', assetCode: 'HC01', message: 'Work order created for HC01.02. Contractor scheduled for 18 Feb.', timestamp: '6h ago', read: true, replies: [] },
  { id: 'n5', type: 'comment-defect', userId: 'laura', userName: 'Laura Perez', userInitials: 'LP', siteSlug: 'hail-creek', defectId: 'HC02.01', defectType: 'Concrete Cracking', assetName: 'Rejects Bin', assetCode: 'HC02', message: 'Has anyone checked if HC02.01 ties into the cracking we saw on HC02.02? Could be same root cause.', timestamp: '8h ago', read: false, replies: [{ userId: 'david', userName: 'David Kim', userInitials: 'DK', message: 'Good point Laura. I\'ll compare the 3D overlays and update.', timestamp: '6h ago' }] },
  { id: 'n6', type: 'mention', userId: 'sarah', userName: 'Sarah Chen', userInitials: 'SC', siteSlug: 'el-paso', defectId: 'EP02.02', defectType: 'Weld Defect', assetName: 'Main Bridge Deck', assetCode: 'EP02', message: '@Nicolas the weld defect EP02.02 was closed today. Please confirm sign-off when you get a chance.', timestamp: 'Yesterday', read: true, replies: [] },
  { id: 'n7', type: 'comment-asset', userId: 'mike', userName: 'Mike Torres', userInitials: 'MT', siteSlug: 'el-paso', assetCode: 'EP04', assetName: 'Substation A', message: 'Remediation on EP04 is at 60%. Bolt replacement completed—coating scheduled for next week.', timestamp: 'Yesterday', read: true, replies: [] },
  { id: 'n8', type: 'reply', userId: 'john', userName: 'John Smith', userInitials: 'JS', siteSlug: 'el-paso', defectId: 'EP03.02', defectType: 'Reinforcement Corrosion', assetName: 'Reject Bin 1000T', assetCode: 'EP03', parentMessage: 'Any update on EP03.02 remediation?', message: 'In progress. Contractor on-site tomorrow—should close by Friday.', timestamp: 'Yesterday', read: false, replies: [] },
  { id: 'n9', type: 'status-change', userId: 'laura', userName: 'Laura Perez', userInitials: 'LP', siteSlug: 'hail-creek', defectId: 'HC04.02', defectType: 'Coating Failure', assetName: 'Transfer Station 4', assetCode: 'HC04', message: 'HC04.02 marked Completed/Closed. Final inspection passed.', timestamp: '2 days ago', read: true, replies: [] },
  { id: 'n10', type: 'comment-defect', userId: 'david', userName: 'David Kim', userInitials: 'DK', siteSlug: 'hail-creek', defectId: 'HC05.01', defectType: 'Concrete Cracking', assetName: 'Stockpile Tunnel', assetCode: 'HC05', message: 'Risk assessment updated. Cracking has progressed—bumped to high priority for Q1.', timestamp: '2 days ago', read: true, replies: [] }
];

// Expose on window so all scripts can access (e.g. app.js sidebar, views)
window.CURRENT_USER = CURRENT_USER;
window.SITES = SITES;
window.ASSETS = ASSETS;
window.ASSET_PHOTOS = ASSET_PHOTOS;
window.DEFECT_FILE_MAP = DEFECT_FILE_MAP;
window.getDefectMediaPaths = getDefectMediaPaths;
window.DEFECTS = DEFECTS;
window.SITES_BY_YEAR = SITES_BY_YEAR;
window.DEFECTS_BY_YEAR = DEFECTS_BY_YEAR;
window.SCHEDULE_EVENTS = SCHEDULE_EVENTS;
window.USERS = USERS;
window.RESOURCES = RESOURCES;
window.NOTIFICATIONS = NOTIFICATIONS;
