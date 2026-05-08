const IC = {
  eye: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  check: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  plus: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  download: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  filter: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  send: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  truck: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  user: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  phone: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.62 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.48-1.28a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.6.62A2 2 0 0 1 22 16.92z"/></svg>',
  clock: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  shield: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  file: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  inbox: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  calendar: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  dollar: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  scale: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v15"/><path d="M5 7h14"/><path d="M4 7l-3 6h6l-3-6z"/><path d="M20 7l-3 6h6l-3-6z"/><path d="M9 22h6"/></svg>',
  briefcase: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/></svg>',
  bell: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  compass: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  mapPin: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  toggle: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>',
  grid: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  activity: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  save: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  userPlus: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  printer: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  chevronLeft: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevronRight: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  building: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><line x1="9" y1="15" x2="9.01" y2="15"/><line x1="15" y1="15" x2="15.01" y2="15"/></svg>',
  badge: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5l1 7L12 18l-4.5 2.5 1-7"/></svg>',
  lock: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  mail: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  upload: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  fuel: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>',
  satellite: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  package: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  layers: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  card: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  hash: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
  award: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  heart: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  graduation: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  palette: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
  globe: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  bank: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><path d="M3 10l9-7 9 7"/><path d="M5 21V10"/><path d="M19 21V10"/><path d="M9 21V14h6v7"/></svg>',
  flag: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  star: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  cake: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h0"/><path d="M12 4h0"/><path d="M17 4h0"/></svg>',
  users: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  alertTriangle: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  search: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
};

function pcardWrap(iconKey, title, subtitle, bodyHtml, extraClass = "") {
  return `<div class="p-card ${extraClass}"><div class="p-card-header"><div class="p-card-header-left"><svg class="p-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[iconKey]?.replace(/<svg[^>]*>|<\/svg>/g, "") || ""}</svg><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}</div></div></div><div class="p-card-body">${bodyHtml}</div></div>`;
}

function emptyState(text) {
  return `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${escapeHtml(text)}</p></div>`;
}

/** Evita XSS cuando texto de usuario o BD se interpola en HTML. */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Valores en atributos HTML entre comillas dobles. */
function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}

function moduleFleetHeroStrip(metrics, hrVariant = "") {
  const stripTone =
    hrVariant === "payroll" ? " fleet-hero-strip--hr-payroll" : hrVariant === "hiring" ? " fleet-hero-strip--hr-hiring" : "";
  const inner = (metrics || [])
    .map(({ label, value, tone }) => {
      const extra =
        tone === "warn" ? " fleet-hero-metric-warn" : tone === "alert" ? " fleet-hero-metric-alert" : "";
      return `<div class="fleet-hero-metric${extra}"><span>${escapeHtml(String(label))}</span><strong>${escapeHtml(String(value))}</strong></div>`;
    })
    .join("");
  return `<div class="fleet-hero-strip fleet-hero-strip--solo${stripTone}"><div class="fleet-hero-metrics">${inner}</div></div>`;
}

function renderHrAlertCards(items = []) {
  const cards = (items || [])
    .map((item) => {
      const tone = ["ok", "info", "warn", "alert"].includes(item?.tone) ? item.tone : "info";
      const iconHtml = item?.icon || "";
      const value = item?.value === undefined || item?.value === null ? "—" : item.value;
      return `<div class="hr-alert-card hr-alert-card--${tone}">
        <span class="hr-alert-card-ico" aria-hidden="true">${iconHtml}</span>
        <div class="hr-alert-card-body">
          <span class="hr-alert-card-label">${escapeHtml(String(item?.label || ""))}</span>
          <strong class="hr-alert-card-value">${escapeHtml(String(value))}</strong>
          ${item?.help ? `<p class="hr-alert-card-help">${escapeHtml(String(item.help))}</p>` : ""}
        </div>
      </div>`;
    })
    .join("");
  return `<div class="hr-alert-grid">${cards}</div>`;
}

function isAntaresDebugEnabled() {
  try {
    if (typeof window !== "undefined" && window.__ANTARES_DEBUG__ === true) return true;
    if (typeof window !== "undefined" && window.__ANTARES_ALLOW_DEV_CONSOLE__ === true) return true;
  } catch {
    return false;
  }
  return false;
}

function devWarn() {
  if (!isAntaresDebugEnabled() || typeof console === "undefined" || !console.warn) return;
  console.warn.apply(console, arguments);
}

function devError() {
  if (!isAntaresDebugEnabled() || typeof console === "undefined" || !console.error) return;
  console.error.apply(console, arguments);
}

function hrWorkspaceTabIcon(iconKey) {
  const raw = IC[String(iconKey || "")];
  if (!raw) return "";
  const svg = raw.replace(/class="btn-icon"/, 'class="hr-tab-icon-svg"');
  return `<span class="hr-workspace-tab-ico" aria-hidden="true">${svg}</span>`;
}

function hrModuleOverviewGuide(variant) {
  const cls = variant === "payroll" ? "hr-overview-guide--payroll" : "hr-overview-guide--hiring";
  if (variant === "payroll") {
    return `<aside class="hr-overview-guide ${cls}" role="note">
      <p class="hr-overview-guide-kicker">¿Qué puedes hacer aquí?</p>
      <p class="hr-overview-guide-lead">Administra a tus empleados, calcula la nómina cada mes y registra ausencias o incapacidades. Usa las pestañas de arriba para moverte por las tres áreas:</p>
      <ol class="hr-overview-guide-steps">
        <li><span class="hr-overview-guide-step-num">1</span><div><strong>Inicio</strong> — bienvenida, resumen general y accesos rápidos.</div></li>
        <li><span class="hr-overview-guide-step-num">2</span><div><strong>Nuevos registros</strong> — agrega empleados, calcula la nómina o registra ausencias.</div></li>
        <li><span class="hr-overview-guide-step-num">3</span><div><strong>Información y reportes</strong> — consulta listas, filtros e historial. Exporta a CSV cuando lo necesites.</div></li>
      </ol>
    </aside>`;
  }
  return `<aside class="hr-overview-guide ${cls}" role="note">
      <p class="hr-overview-guide-kicker">¿Qué puedes hacer aquí?</p>
      <p class="hr-overview-guide-lead">Sigue el proceso completo de contratación: del cargo a la vacante, del candidato al contrato. Usa las pestañas de arriba para moverte por las tres áreas:</p>
      <ol class="hr-overview-guide-steps">
        <li><span class="hr-overview-guide-step-num">1</span><div><strong>Inicio</strong> — bienvenida, métricas del proceso y accesos rápidos.</div></li>
        <li><span class="hr-overview-guide-step-num">2</span><div><strong>Proceso</strong> — define cargos, publica vacantes, evalúa candidatos y genera contratos.</div></li>
        <li><span class="hr-overview-guide-step-num">3</span><div><strong>Seguimiento del proceso</strong> — alertas de plazos, candidatos en proceso, vacantes activas, entrevistas y contratos. Cada tabla a ancho completo para leerla sin deslizamientos.</div></li>
      </ol>
    </aside>`;
}

function renderHrWorkspaceTabs({ module, ariaLabel, activeId, tabs }) {
  const safeModule = escapeAttr(module);
  const safeAria = escapeAttr(ariaLabel);
  return `<nav class="hr-workspace-tabs hr-workspace-tabs--pro" role="tablist" aria-label="${safeAria}">
    ${tabs
      .map((t, idx) => {
        const active = activeId === t.id;
        const hintHtml = t.hint ? `<span class="hr-workspace-tab-hint">${escapeHtml(t.hint)}</span>` : "";
        const iconKey = t.icon;
        const hasIcon = Boolean(iconKey);
        const badge = hasIcon
          ? hrWorkspaceTabIcon(iconKey)
          : `<span class="hr-workspace-tab-num" aria-hidden="true">${idx + 1}</span>`;
        const proClass = hasIcon ? " hr-workspace-tab--has-icon" : "";
        return `<button type="button" role="tab" aria-selected="${active}" class="hr-workspace-tab hr-workspace-tab--pro${active ? " is-active" : ""}${proClass}" data-action="hr-workspace-tab" data-module="${safeModule}" data-tab="${escapeAttr(t.id)}">
      ${badge}
      <span class="hr-workspace-tab-body"><span class="hr-workspace-tab-label">${escapeHtml(t.label)}</span>${hintHtml}</span>
    </button>`;
      })
      .join("")}
  </nav>`;
}

function hrWizardValidityTargets(stepEl) {
  if (!stepEl) return [];
  return [...stepEl.querySelectorAll("input, select, textarea")].filter((el) => {
    if (el.disabled || el.type === "hidden") return false;
    return true;
  });
}

function hrWizardStepValid(stepEl) {
  for (const el of hrWizardValidityTargets(stepEl)) {
    if (typeof el.checkValidity === "function" && !el.checkValidity()) {
      el.reportValidity();
      return false;
    }
  }
  return true;
}

function bindHrFormWizard(form) {
  if (!form || form.dataset.hrWizardBound === "1") return;
  const wizard = form.querySelector("[data-hr-wizard]");
  if (!wizard) return;
  const steps = [...wizard.querySelectorAll(":scope > .hr-form-step")];
  if (steps.length < 2) return;
  form.dataset.hrWizardBound = "1";

  const prevBtn = wizard.querySelector("[data-hr-wizard-prev]");
  const nextBtn = wizard.querySelector("[data-hr-wizard-next]");
  const submitBtn = wizard.querySelector(".hr-form-wizard-submit");
  const progressEl = wizard.querySelector("[data-hr-wizard-progress]");
  const progressFill = wizard.querySelector("[data-hr-wizard-progress-fill]");
  const hintEl = wizard.querySelector("[data-hr-wizard-hint]");
  const dots = [...wizard.querySelectorAll("[data-hr-wizard-dot]")];

  let idx = Math.max(
    0,
    steps.findIndex((s) => s.classList.contains("is-active"))
  );

  const sync = () => {
    steps.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle("is-active", on);
      s.classList.toggle("hidden", !on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });
    dots.forEach((d, i) => {
      const on = i === idx;
      d.classList.toggle("is-active", on);
      d.classList.toggle("is-done", i < idx);
      if (on) d.setAttribute("aria-current", "step");
      else d.removeAttribute("aria-current");
    });
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) {
      nextBtn.classList.toggle("hidden", idx >= steps.length - 1);
      nextBtn.disabled = idx >= steps.length - 1;
    }
    const submitSyncButtons = [...wizard.querySelectorAll("[data-hr-wizard-submit-sync]")];
    if (submitBtn) {
      const wizKind = String(wizard.getAttribute("data-hr-wizard") || "");
      const contractEarly = wizKind === "contract";
      const last = idx >= steps.length - 1;
      const enableSubmit = contractEarly || last;
      submitBtn.disabled = !enableSubmit;
      submitBtn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
      submitSyncButtons.forEach((btn) => {
        btn.disabled = !enableSubmit;
        btn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
      });
    }
    const pct = steps.length ? ((idx + 1) / steps.length) * 100 : 0;
    if (progressEl) progressEl.textContent = `Paso ${idx + 1} de ${steps.length}`;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (hintEl) {
      const wizKind = String(wizard.getAttribute("data-hr-wizard") || "");
      if (wizKind === "contract") {
        hintEl.textContent = "Puede generar el contrato desde el paso que prefiera.";
      } else {
        hintEl.textContent =
          idx < steps.length - 1
            ? "Avance hasta el último paso para habilitar guardar."
            : wizKind === "employee"
              ? "Último paso: puede generar el contrato Word antes de guardar la ficha."
              : "Último paso: revise y guarde.";
      }
    }
  };

  prevBtn?.addEventListener("click", () => {
    if (idx > 0) {
      idx -= 1;
      sync();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (!hrWizardStepValid(steps[idx])) return;
    if (idx < steps.length - 1) {
      idx += 1;
      sync();
    }
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const raw = dot.dataset.hrWizardDot;
      const targetIdx = Number.parseInt(String(raw ?? ""), 10);
      if (!Number.isFinite(targetIdx) || targetIdx < 0 || targetIdx >= steps.length) return;
      if (targetIdx === idx) return;
      if (targetIdx > idx) {
        for (let i = idx; i < targetIdx; i++) {
          if (!hrWizardStepValid(steps[i])) return;
        }
      }
      idx = targetIdx;
      sync();
    });
  });

  form.addEventListener(
    "submit",
    (ev) => {
      for (let i = 0; i < steps.length; i++) {
        if (!hrWizardStepValid(steps[i])) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          idx = i;
          sync();
          notify("Revise el paso indicado antes de guardar.", "error");
          return;
        }
      }
    },
    true
  );

  sync();
}

function createCollapsibleCard(panelId, iconKey, title, subtitle, bodyHtml, expandLabel = "Crear nuevo") {
  const expanded = Boolean(state.createPanels?.[panelId]);
  const toggleText = expanded ? "Ocultar formulario" : expandLabel;
  const cardBody = `<div class="toolbar hr-create-toolbar">
    <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="${escapeAttr(panelId)}">
      ${expanded ? IC.x : IC.plus} ${escapeHtml(toggleText)}
    </button>
  </div>
  <div class="${expanded ? "" : "hidden"}" data-create-panel="${escapeAttr(panelId)}">
    ${bodyHtml}
  </div>`;
  const extraClass = expanded ? "p-card--expanded" : "p-card--collapsed";
  return pcardWrap(iconKey, title, subtitle, cardBody, extraClass);
}

function notify(message, type = "info", durationMs = 3200) {
  let box = document.getElementById("toast-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-container";
    box.className = "toast-container";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  box.style.position = "fixed";
  box.style.zIndex = "2147483647";
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.textContent = message;
  box.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  const ms = Number(durationMs);
  const hideAfter = Number.isFinite(ms) && ms > 0 ? ms : 3200;
  setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => item.remove(), 240);
  }, hideAfter);
}

/** Si la bandeja guardó una notificación para quien ya vio el toast de éxito en pantalla, no repetir en el poll. */
function suppressSelfInboxPollToastIfRecipientIsCurrentUser(recipientUserId) {
  const self = currentUser();
  if (!self || recipientUserId === undefined || recipientUserId === null || recipientUserId === "") return;
  if (String(recipientUserId) !== String(self.id)) return;
  state.portalSuppressSelfPollToastUntil = Date.now() + 5200;
}

/** Mensajes en {@link window.AntaresFeedback} (modules/core/feedback-messages.js). */
function userMessage(key, ...args) {
  const M = window.AntaresFeedback;
  if (!M) return String(key);
  const v = M[key];
  if (typeof v === "function") return v(...args);
  return v != null ? v : String(key);
}

function openEditModal({
  title,
  subtitle = "",
  fields = [],
  submitText = "Guardar",
  onSubmit,
  afterMount,
  extraModalCardClass = ""
}) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) {
    card.className = `modal-card modal-card-edit${extraModalCardClass ? ` ${extraModalCardClass}` : ""}`;
  }
  const content = modal.querySelector("#crud-modal-content");
  const fieldsHtml = fields
    .map((f) => {
      if (f.type === "select") {
        const options = (f.options || [])
          .map((opt) => {
            const v = escapeAttr(String(opt.value ?? ""));
            const sel = String(opt.value) === String(f.value ?? "") ? "selected" : "";
            return `<option value="${v}" ${sel}>${escapeHtml(opt.label)}</option>`;
          })
          .join("");
        return `<label><span>${escapeHtml(f.label)}</span><select name="${escapeAttr(f.name)}" ${f.required ? "required" : ""}>${options}</select></label>`;
      }
      if (f.type === "hidden") {
        return `<input type="hidden" name="${escapeAttr(f.name)}" value="${escapeAttr(String(f.value ?? ""))}" />`;
      }
      if (f.type === "textarea") {
        return `<label class="full"><span>${escapeHtml(f.label)}</span><textarea name="${escapeAttr(f.name)}" rows="${f.rows || 3}" ${f.required ? "required" : ""}>${escapeHtml(f.value ?? "")}</textarea></label>`;
      }
      if (f.type === "file") {
        return `<label class="full"><span>${escapeHtml(f.label)}</span><input type="file" name="${escapeAttr(f.name)}" ${f.accept ? `accept="${escapeAttr(f.accept)}"` : ""} ${f.multiple ? "multiple" : ""} ${f.required ? "required" : ""} /></label>`;
      }
      if (f.type === "custom") {
        /**
         * Bloque HTML libre dentro del modal (p.ej. checklist de permisos editables).
         * El consumidor wirea sus interacciones con `afterMount(form)` y/o lee los inputs en `onSubmit`.
         */
        const labelHtml = f.label ? `<span class="modal-edit-section-title">${escapeHtml(f.label)}</span>` : "";
        return `<div class="full modal-edit-custom-slot"${f.id ? ` id="${escapeAttr(f.id)}"` : ""}>${labelHtml}${f.html || ""}</div>`;
      }
      const inputType = String(f.type || "text").replace(/[^a-z0-9\-]/gi, "") || "text";
      const minAttr = f.min != null ? ` min="${escapeAttr(String(f.min))}"` : "";
      const maxAttr = f.max != null ? ` max="${escapeAttr(String(f.max))}"` : "";
      return `<label><span>${escapeHtml(f.label)}</span><input type="${inputType}" name="${escapeAttr(f.name)}" value="${escapeAttr(String(f.value ?? ""))}"${minAttr}${maxAttr} ${f.required ? "required" : ""} /></label>`;
    })
    .join("");

  content.innerHTML = `
    <div class="modal-head">
      <h2>${escapeHtml(title)}</h2>
      <button type="button" id="crud-close" class="btn btn-text" aria-label="Cerrar">${IC.x}</button>
    </div>
    ${subtitle ? `<p class="muted">${escapeHtml(subtitle)}</p>` : ""}
    <form id="crud-form" class="p-form modal-edit-form">
      ${fieldsHtml}
      <div class="modal-edit-actions">
        <button type="button" id="crud-cancel" class="btn btn-outline">Cancelar</button>
        <button type="submit" class="btn btn-primary">${IC.save} ${escapeHtml(submitText)}</button>
      </div>
    </form>
  `;

  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  content.querySelector("#crud-close").addEventListener("click", close);
  content.querySelector("#crud-cancel").addEventListener("click", close);
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) close();
    },
    { once: true }
  );
  const formEl = content.querySelector("#crud-form");
  if (typeof afterMount === "function") {
    try {
      afterMount(formEl);
    } catch (err) {
      devWarn("openEditModal afterMount", err);
    }
  }
  /**
   * Misma guardia de idempotencia que en `openConfirmModal`: si el submit del
   * modal de edición se llegara a disparar dos veces (doble click rápido al
   * botón principal, Enter + click, listeners residuales por re-renders), solo
   * la primera invocación corre `onSubmit`. Las siguientes son no-op hasta que
   * el modal se cierre y se vuelva a abrir.
   */
  let submitInFlight = false;
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitInFlight) return;
    submitInFlight = true;
    const submitBtn = formEl.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }
    const releaseLock = () => {
      submitInFlight = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      }
    };
    const currentForm = event.currentTarget;
    const payload = Object.fromEntries(new FormData(currentForm).entries());
    const fileInputs = [...currentForm.querySelectorAll("input[type='file']")];
    fileInputs.forEach((input) => {
      if (input.multiple) {
        payload[input.name] = [...input.files].map((file) => file.name).join(", ");
      } else if (input.files?.[0]) {
        payload[input.name] = input.files[0].name;
      }
    });
    let result;
    try {
      result = onSubmit?.(payload, currentForm);
      if (result && typeof result.then === "function") {
        result = await result;
      }
    } catch (err) {
      devWarn("openEditModal onSubmit", err);
      releaseLock();
      return;
    }
    if (result === false) {
      releaseLock();
      return;
    }
    close();
  });
}

function openConfirmModal({ title, message, confirmText = "Confirmar", onConfirm }) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) card.className = "modal-card modal-card-edit";
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    <div class="modal-head">
      <h2>${escapeHtml(title)}</h2>
      <button type="button" id="crud-close" class="btn btn-text" aria-label="Cerrar">${IC.x}</button>
    </div>
    <p>${escapeHtml(message)}</p>
    <div class="modal-edit-actions" style="margin-top:1rem;">
      <button type="button" id="crud-cancel" class="btn btn-outline">Cancelar</button>
      <button type="button" id="crud-confirm" class="btn btn-primary">${IC.check} ${escapeHtml(confirmText)}</button>
    </div>
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  content.querySelector("#crud-close").addEventListener("click", close);
  content.querySelector("#crud-cancel").addEventListener("click", close);

  /**
   * Guardia de idempotencia para evitar toasts/efectos duplicados al confirmar.
   * Si por cualquier motivo (doble click rápido, listeners residuales, eventos
   * sintéticos por extensiones del navegador, re-binding tras render parcial)
   * el click se dispara más de una vez sobre el mismo modal, `onConfirm` solo
   * se ejecutará una sola vez por apertura. Los demás disparos quedan no-op.
   */
  const confirmBtn = content.querySelector("#crud-confirm");
  let confirmConsumed = false;
  confirmBtn.addEventListener("click", async () => {
    if (confirmConsumed) return;
    confirmConsumed = true;
    confirmBtn.disabled = true;
    confirmBtn.setAttribute("aria-busy", "true");
    try {
      let out = onConfirm?.();
      if (out && typeof out.then === "function") {
        await out;
      }
    } catch (_e) {
      try {
        const msg =
          _e && typeof _e === "object" && _e.message
            ? String(_e.message)
            : typeof _e === "string"
              ? _e
              : typeof userMessage === "function"
                ? userMessage("genericError")
                : "Error";
        if (msg && typeof notify === "function") notify(msg, "error");
      } catch (_) {}
    } finally {
      close();
      confirmBtn.disabled = false;
      confirmBtn.removeAttribute("aria-busy");
    }
  });
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) close();
    },
    { once: true }
  );
}

function openInfoModal({ title, subtitle = "", bodyHtml = "", wide = false, extraModalCardClass = "" }) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) {
    const extra = [wide ? "modal-card-edit--wide-info" : "", extraModalCardClass].filter(Boolean).join(" ");
    card.className = `modal-card modal-card-edit${extra ? ` ${extra}` : ""}`;
  }
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    <div class="modal-head">
      <h2>${escapeHtml(title)}</h2>
      <button type="button" id="crud-close" class="btn btn-text" aria-label="Cerrar">${IC.x}</button>
    </div>
    ${subtitle ? `<p class="muted">${escapeHtml(subtitle)}</p>` : ""}
    <div class="modal-info-body${wide ? " modal-info-body--profile" : ""}">${bodyHtml}</div>
    <div class="modal-edit-actions" style="margin-top:1rem;">
      <button type="button" id="crud-ok" class="btn btn-primary">Cerrar</button>
    </div>
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  content.querySelector("#crud-close").addEventListener("click", close);
  content.querySelector("#crud-ok").addEventListener("click", close);
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) close();
    },
    { once: true }
  );
}

function validateColombianDocument(docType, rawValue) {
  const type = String(docType || "").toUpperCase();
  const base = String(rawValue || "").trim();
  const compact = base.replace(/[.\s]/g, "");
  if (!compact) return { ok: false, message: "El documento es obligatorio.", normalized: "" };
  if (type === "CC") {
    const ok = /^\d{6,10}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CC debe tener entre 6 y 10 digitos.", normalized: compact };
  }
  if (type === "CE") {
    const ok = /^\d{6,12}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CE debe tener entre 6 y 12 digitos.", normalized: compact };
  }
  if (type === "NIT") {
    const ok = /^\d{8,10}(-\d)?$/.test(compact);
    return { ok, message: ok ? "" : "El NIT debe tener formato 900123456 o 900123456-7.", normalized: compact };
  }
  if (type === "PAS") {
    const ok = /^[A-Za-z0-9]{5,20}$/.test(compact);
    return { ok, message: ok ? "" : "El pasaporte debe ser alfanumerico (5-20 caracteres).", normalized: compact.toUpperCase() };
  }
  return { ok: compact.length >= 5, message: "Tipo de documento no valido.", normalized: compact };
}

/** Clave estable para validar que la cédula/documento personal no se repita (incluye registros previos). */
function getPersonalRegistrationKey(user) {
  if (!user) return "";
  const raw =
    (user.personalDoc != null && String(user.personalDoc).trim() !== "" && String(user.personalDoc)) ||
    (user.personalTaxId != null && String(user.personalTaxId).trim() !== "" && String(user.personalTaxId)) ||
    "";
  if (raw) {
    const onlyDig = raw.replace(/\D/g, "");
    if (onlyDig.length >= 5) return onlyDig;
    return String(raw).trim().toUpperCase();
  }
  const dt = String(user.documentType || "").toUpperCase();
  if (dt === "PAS") return String(user.taxId || "").replace(/\s/g, "").toUpperCase();
  if (dt === "NIT") return "";
  return String(user.taxId || "").replace(/\D/g, "");
}

function applyModuleMicroAnimations() {
  const targets = [...nodes.viewRoot.querySelectorAll(".p-card, .table-wrap, .user-card, .users-hero-item")];
  targets.forEach((node, idx) => {
    node.classList.remove("module-appear");
    node.style.animationDelay = `${Math.min(idx * 45, 380)}ms`;
    requestAnimationFrame(() => node.classList.add("module-appear"));
  });
}

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  counters: "antares_counters_v2",
  contacts: "antares_contacts_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  notifications: "antares_notifications_v2",
  emails: "antares_emails_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  payrollRuns: "antares_payroll_runs_v2",
  fuelLogs: "antares_fuel_logs_v2",
  vehicleTechnicalLogs: "antares_vehicle_technical_logs_v2",
  travelAllowanceRules: "antares_travel_allowance_rules_v2",
  vacancies: "antares_vacancies_v2",
  candidates: "antares_candidates_v2",
  positions: "antares_positions_v2",
  interviews: "antares_interviews_v2",
  contracts: "antares_contracts_v2",
  hrAbsences: "antares_hr_absences_v2",
  sstCompliance: "antares_sst_compliance_v2",
  tripRouteRates: "antares_trip_route_rates_v2",
  approvals: "antares_approvals_v2",
  session: "antares_session_v2"
};

/** Opcional: usuario marca «recordar» en login; se guarda correo y contraseña en este navegador (texto plano). No usar en equipos compartidos. */
const LOGIN_REMEMBER_STORAGE_KEY = "antares_portal_login_remember_v1";

function readRememberedLoginCredentials() {
  try {
    const raw = localStorage.getItem(LOGIN_REMEMBER_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    const email = String(o.email || "").trim();
    if (!email) return null;
    return { email, password: String(o.password || "") };
  } catch {
    return null;
  }
}

function writeRememberedLoginCredentials(email, password) {
  try {
    localStorage.setItem(
      LOGIN_REMEMBER_STORAGE_KEY,
      JSON.stringify({
        email: String(email || "").trim(),
        password: String(password || ""),
        savedAt: Date.now()
      })
    );
  } catch (_) {}
}

function clearRememberedLoginCredentials() {
  try {
    localStorage.removeItem(LOGIN_REMEMBER_STORAGE_KEY);
  } catch (_) {}
}

const CO_TIMEZONE = "America/Bogota";
const REGISTER_TERMS_URL = "./terminos-condiciones.html";
const REGISTER_PRIVACY_URL = "./politica-privacidad.html";

const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  RRHH: "rrhh",
  ADMINISTRACION: "administracion",
  AUXILIAR_ADMINISTRATIVO: "auxiliar_administrativo",
  LIDER_ADMINISTRATIVO: "lider_administrativo"
};

const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard_view",
  CLIENT_REQUESTS: "client_requests",
  TRANSPORT_REQUESTS: "transport_requests",
  TRANSPORT_TRIPS: "transport_trips",
  TRANSPORT_VEHICLES: "transport_vehicles",
  TRANSPORT_DRIVERS: "transport_drivers",
  TRANSPORT_CALENDAR: "transport_calendar",
  TRANSPORT_HISTORY: "transport_history",
  PAYROLL_MANAGE: "payroll_manage",
  HIRING_MANAGE: "hiring_manage",
  SST_COMPLIANCE: "sst_compliance",
  USERS_MANAGE: "users_manage",
  AUTHORIZATIONS_MANAGE: "authorizations_manage",
  PROFILE_VIEW: "profile_view",
  NOTIFICATIONS_VIEW: "notifications_view",
  CONTACT_B2B_VIEW: "contact_b2b_view"
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);
const COLOMBIA_LOCATIONS = {
  Amazonas: ["Leticia", "Puerto Narino"],
  Antioquia: ["Medellin", "Bello", "Itagui", "Envigado", "Rionegro", "Apartado", "Turbo", "Caucasia", "La Ceja", "Sabaneta", "Copacabana", "Girardota", "Marinilla", "Yarumal", "Santa Fe de Antioquia"],
  Arauca: ["Arauca", "Arauquita", "Saravena", "Tame", "Fortul"],
  Atlantico: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia", "Galapa", "Sabanagrande", "Santo Tomas", "Baranoa"],
  Bogota: ["Bogota D.C."],
  Bolivar: ["Cartagena", "Turbaco", "Magangue", "Arjona", "El Carmen de Bolivar", "Mompox", "San Juan Nepomuceno", "Turbana"],
  Boyaca: ["Tunja", "Duitama", "Sogamoso", "Chiquinquira", "Paipa", "Puerto Boyaca", "Samaca", "Villa de Leyva"],
  Caldas: ["Manizales", "Villamaria", "Chinchina", "La Dorada", "Riosucio", "Anserma", "Supia"],
  Caqueta: ["Florencia", "San Vicente del Caguan", "El Doncello", "Puerto Rico", "Belen de los Andaquies"],
  Casanare: ["Yopal", "Aguazul", "Villanueva", "Monterrey", "Tauramena", "Paz de Ariporo"],
  Cauca: ["Popayan", "Santander de Quilichao", "Puerto Tejada", "Patia", "Piendamo", "Corinto", "Guapi"],
  Cesar: ["Valledupar", "Aguachica", "Bosconia", "Codazzi", "La Jagua de Ibirico", "Curumani"],
  Choco: ["Quibdo", "Istmina", "Condoto", "Tado", "Bahia Solano"],
  Cordoba: ["Monteria", "Cerete", "Lorica", "Sahagun", "Planeta Rica", "Montelibano", "Tierralta", "Cienaga de Oro"],
  Cundinamarca: ["Soacha", "Chia", "Zipaquira", "Facatativa", "Girardot", "Mosquera", "Funza", "Madrid", "Fusagasuga", "Cajica", "La Calera", "Sopo", "Tabio", "Tocancipa", "Gachancipa"],
  Guainia: ["Inirida", "Barranco Minas", "Cacahual"],
  Guaviare: ["San Jose del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  Huila: ["Neiva", "Pitalito", "Garzon", "La Plata", "Campoalegre", "Palermo"],
  LaGuajira: ["Riohacha", "Maicao", "Uribia", "Manaure", "Fonseca", "San Juan del Cesar", "Villanueva"],
  Magdalena: ["Santa Marta", "Cienaga", "Fundacion", "Aracataca", "El Banco", "Plato", "Pivijay"],
  Meta: ["Villavicencio", "Acacias", "Granada", "Puerto Lopez", "Puerto Gaitan", "Cumaral", "Restrepo"],
  Narino: ["Pasto", "Ipiales", "Tumaco", "Tuquerres", "Sandoná", "La Union", "Samaniego"],
  NorteDeSantander: ["Cucuta", "Ocana", "Villa del Rosario", "Los Patios", "Tibú", "Pamplona", "Chinacota"],
  Putumayo: ["Mocoa", "Puerto Asis", "Orito", "Villagarzon", "Sibundoy", "Valle del Guamuez"],
  Quindio: ["Armenia", "Calarca", "La Tebaida", "Montenegro", "Quimbaya", "Circasia"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Marsella", "Belen de Umbria"],
  SanAndresYProvidencia: ["San Andres", "Providencia"],
  Santander: ["Bucaramanga", "Floridablanca", "Giron", "Barrancabermeja", "Piedecuesta", "San Gil", "Socorro", "Malaga", "Cimitarra", "Puerto Wilches"],
  Sucre: ["Sincelejo", "Corozal", "Sampues", "San Marcos", "Toluviejo", "Coveñas", "Tolu"],
  Tolima: ["Ibague", "Espinal", "Melgar", "Honda", "Lerida", "Chaparral", "Libano", "Mariquita"],
  ValleDelCauca: ["Cali", "Palmira", "Buenaventura", "Tulua", "Yumbo", "Buga", "Cartago", "Jamundi", "Candelaria", "Florida", "Pradera", "Zarzal", "Roldanillo"],
  Vaupes: ["Mitu", "Caruru", "Taraira"],
  Vichada: ["Puerto Carreno", "La Primavera", "Santa Rosalia", "Cumaribo"]
};
const PERMISSION_META = {
  [PERMISSIONS.DASHBOARD_VIEW]: { title: "Ver dashboard", desc: "Acceso a indicadores y resumen general." },
  [PERMISSIONS.CLIENT_REQUESTS]: { title: "Solicitudes de cliente", desc: "Crear y consultar solicitudes propias." },
  [PERMISSIONS.TRANSPORT_REQUESTS]: { title: "Operacion solicitudes (legacy)", desc: "Sin pantalla propia; use Autorizaciones y Mis solicitudes." },
  [PERMISSIONS.TRANSPORT_TRIPS]: { title: "Gestion de viajes", desc: "Asignar y actualizar estados de viaje." },
  [PERMISSIONS.TRANSPORT_VEHICLES]: { title: "Gestion de camiones", desc: "Registrar y modificar vehiculos." },
  [PERMISSIONS.TRANSPORT_DRIVERS]: { title: "Gestion de conductores", desc: "Registrar y administrar conductores." },
  [PERMISSIONS.TRANSPORT_CALENDAR]: { title: "Calendario operativo", desc: "Ver programacion de viajes." },
  [PERMISSIONS.TRANSPORT_HISTORY]: { title: "Historial y reportes", desc: "Consultar historicos y filtros." },
  [PERMISSIONS.PAYROLL_MANAGE]: { title: "Gestión humana", desc: "Gestionar empleados y liquidaciones." },
  [PERMISSIONS.HIRING_MANAGE]: { title: "Contratacion", desc: "Gestionar vacantes, candidatos y contratos." },
  [PERMISSIONS.SST_COMPLIANCE]: { title: "Cumplimiento laboral y SST", desc: "Controlar seguridad social, vencimientos y auditoria documental." },
  [PERMISSIONS.USERS_MANAGE]: { title: "Usuarios y permisos", desc: "Crear usuarios y administrar accesos." },
  [PERMISSIONS.AUTHORIZATIONS_MANAGE]: { title: "Autorizaciones", desc: "Aprobar solicitudes de operaciones y personal." },
  [PERMISSIONS.PROFILE_VIEW]: { title: "Mi perfil", desc: "Ver y editar informacion personal." },
  [PERMISSIONS.NOTIFICATIONS_VIEW]: { title: "Notificaciones", desc: "Ver novedades del sistema." },
  [PERMISSIONS.CONTACT_B2B_VIEW]: { title: "Solicitudes contacto web", desc: "Ver y gestionar prospectos del formulario de contacto B2B." }
};

const VIEW_PERMISSIONS = {
  dashboard: PERMISSIONS.DASHBOARD_VIEW,
  requests: PERMISSIONS.CLIENT_REQUESTS,
  "transport-trips": PERMISSIONS.TRANSPORT_TRIPS,
  "transport-vehicles": PERMISSIONS.TRANSPORT_VEHICLES,
  "transport-drivers": PERMISSIONS.TRANSPORT_DRIVERS,
  "transport-calendar": PERMISSIONS.TRANSPORT_CALENDAR,
  history: PERMISSIONS.TRANSPORT_HISTORY,
  reports: PERMISSIONS.TRANSPORT_HISTORY,
  payroll: PERMISSIONS.PAYROLL_MANAGE,
  hiring: PERMISSIONS.HIRING_MANAGE,
  "labor-compliance": PERMISSIONS.SST_COMPLIANCE,
  "admin-users": PERMISSIONS.USERS_MANAGE,
  authorizations: PERMISSIONS.AUTHORIZATIONS_MANAGE,
  profile: PERMISSIONS.PROFILE_VIEW,
  notifications: PERMISSIONS.NOTIFICATIONS_VIEW,
  "contact-leads": PERMISSIONS.CONTACT_B2B_VIEW
};

const STATUS = {
  PENDIENTE: "Pendiente",
  APROBADA_PENDIENTE_ASIGNACION: "Aprobada pendiente asignacion",
  VIAJE_ASIGNADO: "Viaje asignado",
  EN_TRANSITO: "En transito",
  ESPERA_STANDBY: "Espera standby",
  COMPLETADA: "Completada",
  CERRADA: "Cerrada",
  CANCELADA: "Cancelada",
  RECHAZADA: "Rechazada"
};

const STATUS_TRANSITIONS = {
  [STATUS.PENDIENTE]: [STATUS.APROBADA_PENDIENTE_ASIGNACION, STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA, STATUS.RECHAZADA],
  [STATUS.APROBADA_PENDIENTE_ASIGNACION]: [STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA],
  [STATUS.VIAJE_ASIGNADO]: [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY, STATUS.CANCELADA],
  [STATUS.EN_TRANSITO]: [STATUS.ESPERA_STANDBY, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.ESPERA_STANDBY]: [STATUS.EN_TRANSITO, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.COMPLETADA]: [STATUS.CERRADA],
  [STATUS.CERRADA]: [],
  [STATUS.CANCELADA]: [],
  [STATUS.RECHAZADA]: []
};

const ACCOUNT_STATUS = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado"
};

function normalizeUserAccountStatus(user) {
  const raw =
    user?.accountStatus ??
    user?.account_status ??
    user?.estadoCuenta ??
    user?.estado_cuenta ??
    "";
  return String(raw)
    .trim()
    .toLowerCase();
}

/** Normaliza filas de GET /portal/bootstrap (aliases snake_case / español). */
function normalizePortalBootstrapUserRow(u) {
  if (!u || typeof u !== "object") return u;
  const s = normalizeUserAccountStatus(u);
  const out = { ...u };
  if (s) out.accountStatus = s;
  if (!out.source) {
    out.source = out.accountStatus === ACCOUNT_STATUS.PENDIENTE ? "portal_db" : "portal_db";
  }
  return out;
}

/** Origen del registro pendiente: BD `usuarios` vs solo Supabase Auth (huérfano). */
function pendingUserOrigin(user) {
  const raw = String(user?.source || "").trim().toLowerCase();
  if (raw === "supabase_auth_only") return "supabase_auth_only";
  return "portal_db";
}

/** Cuentas creadas en el sitio / API con estado pendiente en PostgreSQL o solo en Supabase Auth. */
function isPortalUserPendingApproval(user) {
  if (pendingUserOrigin(user) === "supabase_auth_only") return true;
  const s = normalizeUserAccountStatus(user);
  return s === ACCOUNT_STATUS.PENDIENTE || s === "pending";
}

const PIPELINE = ["Recibido", "Preseleccionado", "Entrevistado", "Oferta enviada", "Contratado", "Descartado"];
const PIPELINE_TRANSITIONS = {
  Recibido: ["Preseleccionado", "Descartado"],
  Preseleccionado: ["Entrevistado", "Descartado"],
  Entrevistado: ["Oferta enviada", "Descartado"],
  "Oferta enviada": ["Contratado", "Descartado"],
  Contratado: [],
  Descartado: []
};
const AUTO_APPROVE_MINUTES = 10;
const CO_PAYROLL = {
  healthEmployeeRate: 0.04,
  pensionEmployeeRate: 0.04,
  solidarityRate: 0.01,
  solidarityThresholdSmmlv: 4,
  // SMMLV 2026 orientativo (~ $1.750.905 COP — verificar decreto del año fiscal).
  smmlv: 1750905
};

/** Ley 52/1975: interés legal anual sobre cesantías (referencia normativa vigente). */
const CO_CESANTIAS_INTERES_ANUAL_PCT = 12;

/** Junio (06) o diciembre (12): periodo habitual semestral de prima de servicios. */
function payrollMonthIsPrimaSemester(ym) {
  return /^(\d{4})-(06|12)(-|$)/.test(String(ym || "").trim());
}

/**
 * Enero u febrero: ventana habitual en nómina para liquidar o pagar intereses de cesantías del año causado (Ley 52/1975).
 * La ley señala pago **en el mes de enero** del año siguiente; muchas empresas lo registran en la planilla **01**, otras en **02** — valide con contador y fondo.
 */
function payrollMonthIsCesantiasInterestMonth(ym) {
  return /^(\d{4})-(01|02)(-|$)/.test(String(ym || "").trim());
}

/**
 * Intereses sobre cesantías (referencia Ley 52/1975): 12% anual.
 * Si `days360` > 0: proporcional (días/360). Si no, aplica tasa plena sobre la base (año completo orientativo).
 */
function calcColombiaInteresesCesantiasCop(baseCesantias, days360) {
  const b = Math.max(0, parseNum(baseCesantias));
  const d = Math.max(0, parseNum(days360));
  const rate = CO_CESANTIAS_INTERES_ANUAL_PCT / 100;
  if (d <= 0) return Math.round(b * rate);
  return Math.round(b * rate * (Math.min(d, 360) / 360));
}

/**
 * Prima de servicios semestral (referencia CST arts. 244–249): (salario mensual × días) ÷ 360.
 * Validar siempre con contador y política interna de la empresa.
 */
function calcColombiaPrimaServiciosCop(salaryMonthly, daysInSemester) {
  const s = Math.max(0, parseNum(salaryMonthly));
  const d = Math.max(0, parseNum(daysInSemester));
  return Math.round((s * d) / 360);
}

/**
 * Liquidación contractual por terminación (referencia orientativa — CST y normativa salarial colombiana).
 * Cesantías: salario × días ÷ 360. Intereses: 12% anual proporcional sobre cesantías calculadas (simplificado).
 * Prima proporcional: (salario × días proporcionales) ÷ 360. Vacaciones: (salario × días compensar) ÷ 720 (uso frecuente en nómina).
 */
function calcColombiaTerminationLines({ baseSalary, days360Year, primaPropDays, vacationDays }) {
  const base = Math.max(0, parseNum(baseSalary));
  const d360 = Math.max(0, parseNum(days360Year));
  const dPrima = Math.max(0, parseNum(primaPropDays));
  const dVac = Math.max(0, parseNum(vacationDays));
  const cesantias = Math.round((base * d360) / 360);
  const interesesCesantias = Math.round(((cesantias * 12) / 100) * (Math.min(d360, 360) / 360));
  const primaProporcional = Math.round((base * dPrima) / 360);
  const vacaciones = Math.round((base * dVac) / 720);
  return { cesantias, interesesCesantias, primaProporcional, vacaciones };
}

/** Rellena rubros del formulario de liquidación contractual a partir del salario y días ingresados. */
function fillSettlementSuggestedAmounts(form) {
  if (!form) return;
  const employeeId = String(form.querySelector("[name='employeeId']")?.value || "");
  const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === employeeId);
  if (!employee) {
    notify(userMessage("contractPickEmployee"), "error");
    return;
  }
  const base = parseNum(employee.baseSalary);
  const days360 = parseNum(form.querySelector("[name='days360Year']")?.value);
  const primaPropDays = parseNum(form.querySelector("[name='primaPropDays']")?.value);
  const vacationDays = parseNum(form.querySelector("[name='vacationDays']")?.value);
  const lines = calcColombiaTerminationLines({ baseSalary: base, days360Year: days360, primaPropDays, vacationDays });
  const c = form.querySelector("[name='cesantiasCop']");
  const i = form.querySelector("[name='interesesCesantiasCop']");
  const p = form.querySelector("[name='primaPropCop']");
  const v = form.querySelector("[name='vacacionesCop']");
  if (c) c.value = String(lines.cesantias);
  if (i) i.value = String(lines.interesesCesantias);
  if (p) p.value = String(lines.primaProporcional);
  if (v) v.value = String(lines.vacaciones);
}

function wireMonthlyPayrollConcepts(form) {
  if (!form || form.dataset.monthlyPayrollConceptsBound === "1") return;
  form.dataset.monthlyPayrollConceptsBound = "1";
  const monthEl = form.querySelector('[name="month"]');
  const empEl = form.querySelector('[name="employeeId"]');
  if (!monthEl || !empEl) return;

  const fsP = form.querySelector("#payroll-prima-fieldset");
  const cbP = form.querySelector("#payroll-pay-prima");
  const daysP = form.querySelector('[name="primaServiciosDays"]');
  const copP = form.querySelector('[name="primaServiciosCop"]');

  const fsC = form.querySelector("#payroll-cesantias-int-fieldset");
  const cbC = form.querySelector("#payroll-pay-int-cesantias");
  const baseC = form.querySelector('[name="cesantiasInterestBaseCop"]');
  const daysC = form.querySelector('[name="cesantiasInterestDays"]');
  const copC = form.querySelector('[name="interesesCesantiasCopMonthly"]');

  const applyPrima = () => {
    if (!fsP || !cbP || !daysP || !copP) return;
    const show = payrollMonthIsPrimaSemester(monthEl.value);
    fsP.classList.toggle("hidden", !show);
    fsP.setAttribute("aria-hidden", show ? "false" : "true");
    if (!show) {
      cbP.checked = false;
      daysP.value = "";
      copP.value = "";
      delete copP.dataset.userEdited;
    }
    daysP.disabled = !(show && cbP.checked);
    copP.disabled = !(show && cbP.checked);
  };

  const recalcPrimaCop = () => {
    if (!cbP || !daysP || !copP) return;
    if (!payrollMonthIsPrimaSemester(monthEl.value) || !cbP.checked) return;
    if (copP.dataset.userEdited === "1") return;
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || ""));
    const bs = emp ? parseNum(emp.baseSalary) : 0;
    const d = parseNum(daysP.value);
    if (d > 0) copP.value = String(calcColombiaPrimaServiciosCop(bs, d));
    else copP.value = "";
  };

  const applyCesantias = () => {
    if (!fsC || !cbC || !baseC || !daysC || !copC) return;
    const show = payrollMonthIsCesantiasInterestMonth(monthEl.value);
    fsC.classList.toggle("hidden", !show);
    fsC.setAttribute("aria-hidden", show ? "false" : "true");
    if (!show) {
      cbC.checked = false;
      baseC.value = "";
      daysC.value = "360";
      copC.value = "";
      delete copC.dataset.userEdited;
    }
    baseC.disabled = !(show && cbC.checked);
    daysC.disabled = !(show && cbC.checked);
    copC.disabled = !(show && cbC.checked);
  };

  const recalcInteresesCop = () => {
    if (!cbC || !baseC || !daysC || !copC) return;
    if (!payrollMonthIsCesantiasInterestMonth(monthEl.value) || !cbC.checked) return;
    if (copC.dataset.userEdited === "1") return;
    const base = parseNum(baseC.value);
    const d = parseNum(daysC.value) || 360;
    if (base > 0) copC.value = String(calcColombiaInteresesCesantiasCop(base, d));
    else copC.value = "";
  };

  const onMonthChange = () => {
    applyPrima();
    applyCesantias();
    recalcPrimaCop();
    recalcInteresesCop();
  };

  monthEl.addEventListener("change", onMonthChange);
  empEl.addEventListener("change", () => {
    recalcPrimaCop();
    recalcInteresesCop();
  });

  if (cbP && daysP && copP) {
    cbP.addEventListener("change", applyPrima);
    daysP.addEventListener("input", recalcPrimaCop);
    copP.addEventListener("input", () => {
      copP.dataset.userEdited = parseNum(copP.value) > 0 ? "1" : "";
    });
  }
  if (cbC && baseC && daysC && copC) {
    cbC.addEventListener("change", applyCesantias);
    baseC.addEventListener("input", recalcInteresesCop);
    daysC.addEventListener("input", recalcInteresesCop);
    copC.addEventListener("input", () => {
      copC.dataset.userEdited = parseNum(copC.value) > 0 ? "1" : "";
    });
  }

  onMonthChange();
}

function wireTerminationSettlementForm(form) {
  if (!form || form.dataset.settlementWire === "1") return;
  form.dataset.settlementWire = "1";
  const btn = form.querySelector('[data-action="settlement-recalc"]');
  if (btn) btn.addEventListener("click", () => fillSettlementSuggestedAmounts(form));
}
const CO_HR_RULES = {
  legalWeeklyHours: 46,
  minMonthlySalary: 1423500,
  transportAllowance: 200000
};
const CO_CATALOGS = {
  licenseCategories: ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"],
  eps: ["Sura", "Nueva EPS", "Sanitas", "Compensar", "Famisanar", "Salud Total", "Aliansalud", "Coosalud", "Mutual Ser", "S.O.S."],
  arl: ["Sura", "Positiva", "Colmena", "Bolivar", "Alfa", "Equidad", "Mapfre"],
  bloodTypes: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
  pensionFunds: ["Colpensiones", "Porvenir", "Proteccion", "Colfondos", "Skandia"],
  severanceFunds: ["Porvenir", "Proteccion", "Colfondos", "Skandia", "FNA"],
  compensationFunds: ["Colsubsidio", "Cafam", "Compensar", "Comfama", "Comfandi", "Cafaba", "Comfenalco Antioquia", "Comfenalco Valle", "Cajacopi"],
  arlRiskLevels: ["I", "II", "III", "IV", "V"],
  bodyTypes: ["Furgon seco", "Furgon refrigerado (Termoking)", "Estacas", "Plancha", "Cisterna", "Granelero", "Volqueta"],
  fuelTypes: ["Diesel ACPM", "Gas Natural Vehicular (GNV)", "Gasolina corriente", "Hibrido"],
  axleConfig: ["2 ejes (4 llantas)", "3 ejes (6 llantas)", "4 ejes (8 llantas)", "5 ejes (10 llantas)", "6 ejes (12 llantas)"],
  documentTypes: ["CC", "CE", "PAS", "PEP", "TI"],
  contractTypes: ["Termino indefinido", "Termino fijo", "Obra o labor", "Prestacion de servicios", "Aprendizaje SENA"],
  workSchedule: ["Diurna", "Nocturna", "Mixta", "Por turnos"],
  payFrequency: ["Mensual", "Quincenal", "Semanal", "Catorcenal"], // mismo canon que apps/api/src/payroll/payroll-frequency.ts → periodicidad_pago
  contributorTypes: ["Dependiente", "Independiente", "Aprendiz SENA lectivo", "Aprendiz SENA productivo", "Pensionado activo"],
  banks: ["Bancolombia", "Davivienda", "BBVA", "Banco de Bogota", "Banco Popular", "Itau (Corpbanca)", "Banco Caja Social", "Banco AV Villas", "Banco Falabella", "Scotiabank Colpatria", "Banco Agrario", "Banco GNB Sudameris", "Nequi", "Daviplata"],
  accountTypes: ["Ahorros", "Corriente"],
  educationLevel: ["Primaria", "Bachiller", "Tecnico", "Tecnologo", "Profesional", "Posgrado"],
  maritalStatus: ["Soltero(a)", "Casado(a)", "Union libre", "Separado(a)", "Divorciado(a)", "Viudo(a)"],
  genders: ["Masculino", "Femenino", "Otro", "Prefiero no decirlo"],
  vehicleColors: ["Blanco", "Negro", "Gris", "Plata", "Azul", "Rojo", "Verde", "Amarillo", "Naranja"],
  contractTerminationCauses: ["Vencimiento de termino", "Mutuo acuerdo", "Justa causa", "Sin justa causa", "Renuncia voluntaria", "Termino de obra", "Pension"],
  uniformIssuance: ["Enero/Mayo/Septiembre", "Abril/Agosto/Diciembre", "No aplica"]
};

function selectOptionsFromCatalog(values = [], selected = "", placeholder = "Seleccione...") {
  const normalizedSelected = String(selected || "");
  const options = values.map((value) => {
    const safeValue = String(value || "").trim();
    return `<option value="${safeValue}" ${safeValue === normalizedSelected ? "selected" : ""}>${safeValue}</option>`;
  });
  return [`<option value="">${placeholder}</option>`, ...options].join("");
}

function validateCandidatePipelineTransition(candidate, nextStatus) {
  const currentStatus = String(candidate?.status || PIPELINE[0]);
  const targetStatus = String(nextStatus || currentStatus);
  if (currentStatus === targetStatus) return { ok: true };
  const allowed = PIPELINE_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return { ok: false, message: `Flujo invalido: ${currentStatus} -> ${targetStatus}. Debes respetar el orden del pipeline.` };
  }
  if (targetStatus === "Oferta enviada") {
    const hasInterview = read(KEYS.interviews, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    if (!hasInterview) {
      return { ok: false, message: "Para enviar oferta primero debes registrar entrevista del candidato." };
    }
  }
  if (targetStatus === "Contratado") {
    const byCandidate = read(KEYS.contracts, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    const candDoc = String(candidate.idDoc || "").trim();
    const byEmployeeDoc =
      Boolean(candDoc) &&
      read(KEYS.contracts, []).some((item) => {
        if (!item.employeeId) return false;
        const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(item.employeeId));
        return emp && String(emp.idDoc || "").trim() === candDoc;
      });
    if (!byCandidate && !byEmployeeDoc) {
      return {
        ok: false,
        message:
          "Para marcar como contratado debe existir un contrato generado (desde Gestión humana o Contratación, misma cédula) o el registro histórico por candidato."
      };
    }
  }
  return { ok: true };
}

let state = {
  session: null,
  currentView: "dashboard",
  portalContacts: [],
  theme: "light",
  publicLang: "es",
  authTab: "login",
  authSupabaseRecovery: false,
  authSecurity: {
    failedAttempts: 0,
    lockUntil: 0
  },
  adminUsersUi: {
    panel: "",
    editUserId: "",
    editCompanyId: ""
  },
  createPanels: {},
  calendarFocus: null,
  calendarFilters: { driver: "", vehicle: "", status: "" },
  payrollFilters: {
    period: "all",
    employee: "",
    status: "all"
  },
  payrollUi: {
    runSort: "recent",
    workspace: "overview"
  },
  hiringUi: {
    candidateFilter: "active",
    vacancyFilter: "open",
    candidateSort: "recent",
    workspace: "overview"
  },
  registrationSuccessBanner: null,
  contactLeadsLoading: false,
  authorizationsSyncError: null,
  portalSuppressSelfPollToastUntil: 0,
  portalNonAdminCaptureBound: false
};

hydrateHrWorkspaceFromStorage();
try {
  purgeDuplicateContracts();
} catch (_) {
  /* no-op: purge is best-effort */
}

window.AntaresDataAccess = Object.freeze({
  getPortalContacts() {
    return Array.isArray(state.portalContacts) ? state.portalContacts : [];
  }
});

const nodes = {
  openAuth: document.getElementById("open-auth"),
  openAuthHero: document.getElementById("open-auth-hero"),
  closeAuth: document.getElementById("close-auth"),
  authModal: document.getElementById("auth-modal"),
  authContent: document.getElementById("auth-content"),
  b2bForm: document.getElementById("b2b-form"),
  publicApp: document.getElementById("public-app"),
  portalApp: document.getElementById("portal-app"),
  sideLinks: [...document.querySelectorAll(".side-link[data-view]")],
  logout: document.getElementById("logout"),
  viewTitle: document.getElementById("view-title"),
  viewRoot: document.getElementById("view-root"),
  kpiCards: document.getElementById("kpi-cards"),
  sessionMeta: document.getElementById("session-meta"),
  authTabs: [...document.querySelectorAll(".tab")],
  themeTogglePublic: document.getElementById("theme-toggle-public"),
  themeTogglePortal: document.getElementById("theme-toggle-portal"),
  langTogglePublic: document.getElementById("lang-toggle-public"),
  themeButtonsPublic: [...document.querySelectorAll("#theme-toggle-public [data-theme-option]")],
  themeButtonsPortal: [...document.querySelectorAll("#theme-toggle-portal [data-theme-option]")],
  langButtonsPublic: [...document.querySelectorAll("#lang-toggle-public [data-lang-option]")]
};

const UI_PREFS = {
  theme: "antares_theme_v1",
  publicLang: "antares_public_lang_v1"
};

const HR_WORKSPACE_STORAGE = {
  payroll: "antares_hr_payroll_workspace_v1",
  hiring: "antares_hr_hiring_workspace_v1"
};
const HR_VALID_PAYROLL_WS = new Set(["overview", "operate", "data"]);
const HR_VALID_HIRING_WS = new Set(["overview", "operate", "track"]);

function hydrateHrWorkspaceFromStorage() {
  try {
    const p = localStorage.getItem(HR_WORKSPACE_STORAGE.payroll);
    const h = localStorage.getItem(HR_WORKSPACE_STORAGE.hiring);
    if (p && HR_VALID_PAYROLL_WS.has(p)) {
      state.payrollUi = { ...(state.payrollUi || {}), workspace: p };
    }
    if (h && HR_VALID_HIRING_WS.has(h)) {
      state.hiringUi = { ...(state.hiringUi || {}), workspace: h };
    }
  } catch (_e) {}
}

function persistHrWorkspace(moduleId, workspace) {
  const ws = String(workspace || "");
  try {
    if (moduleId === "payroll" && HR_VALID_PAYROLL_WS.has(ws)) {
      localStorage.setItem(HR_WORKSPACE_STORAGE.payroll, ws);
    } else if (moduleId === "hiring" && HR_VALID_HIRING_WS.has(ws)) {
      localStorage.setItem(HR_WORKSPACE_STORAGE.hiring, ws);
    }
  } catch (_e) {}
}

/** Misma política que modules/core/persistence.js cuando no hay AntaresPersistence. */
function capStoredArrayRows(key, value) {
  const caps = { [KEYS.notifications]: 500, [KEYS.emails]: 400 };
  const max = caps[key];
  if (!max || !Array.isArray(value) || value.length <= max) return value;
  return value.slice(0, max);
}

function read(key, fallback = []) {
  const P = window.AntaresPersistence;
  if (P && typeof P.read === "function") return P.read(key, fallback);
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (_error) {
    return fallback;
  }
}

function write(key, value) {
  const P = window.AntaresPersistence;
  if (P && typeof P.write === "function") {
    P.write(key, value);
    return;
  }
  const stored = capStoredArrayRows(key, value);
  localStorage.setItem(key, JSON.stringify(stored));
  if (window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
    window.AntaresPortalSync.schedule(key, stored);
  }
}

/**
 * Igual que `write` pero espera POST /portal/sync-key (PostgreSQL) cuando hay sesión API.
 * En modo sólo navegador (sin URL de API/token) sólo persiste la proyección en memoria.
 * @throws Las mismas errores que `AntaresPortalSync.flushStorageKeyNow` cuando el servidor rechaza tras reintentos.
 */
async function writeAwaitServer(storageKeyLike, value) {
  write(storageKeyLike, value);
  const api = window.AntaresApi;
  const sync = window.AntaresPortalSync;
  if (!sync || typeof sync.flushStorageKeyNow !== "function") return;
  if (!api || typeof api.getBase !== "function" || !api.getBase()) return;
  if (typeof api.getAccessToken !== "function" || !String(api.getAccessToken() || "").trim()) return;
  await sync.flushStorageKeyNow(storageKeyLike);
}

function decodeJwtPayload(token) {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (_e) {
    return null;
  }
}

function mapJwtRoleToAppRole(roleRaw) {
  const r = String(roleRaw || "client")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
  const roleMap = {
    admin: ROLES.ADMIN,
    administrador: ROLES.ADMIN,
    client: ROLES.CLIENT,
    cliente: ROLES.CLIENT,
    rrhh: ROLES.RRHH,
    administracion: ROLES.ADMINISTRACION,
    auxiliar_administrativo: ROLES.AUXILIAR_ADMINISTRATIVO,
    lider_administrativo: ROLES.LIDER_ADMINISTRATIVO
  };
  return roleMap[r] || ROLES.CLIENT;
}

/**
 * Tras login API, /portal/bootstrap puede no haber hidratado caché aún; sin fila en KEYS.users el flujo abortaba.
 * Los claims del access token vienen de la misma API (sub, email, role) y permiten abrir sesión hasta el próximo bootstrap.
 */
function upsertPortalUserStubFromJwtPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const uid = String(payload.sub || "").trim();
  const email = String(payload.email || "").trim();
  if (!uid || !email) return null;
  const users = read(KEYS.users, []);
  const existing = users.find((u) => String(u.id) === uid);
  if (existing) return existing;
  const localPart = email.split("@")[0] || "";
  const stub = {
    id: uid,
    email,
    name: localPart.replace(/[._-]+/g, " ").trim() || email,
    role: mapJwtRoleToAppRole(payload.role),
    accountStatus: "aprobado",
    companyId: "",
    company: "",
    password: "",
    permissions: [],
    taxId: "",
    phone: ""
  };
  write(KEYS.users, [stub, ...users.filter((u) => String(u.id) !== uid)]);
  return stub;
}

/**
 * Inserta o reemplaza una fila de usuario (formato `loadUsers`) en `KEYS.users`.
 * Usado como fallback ligero si /portal/bootstrap falla pero /portal/me responde:
 * así Mi perfil renderiza con datos reales en vez de stub vacío del JWT.
 */
function upsertPortalUserRowIntoCache(row) {
  if (!row || typeof row !== "object") return null;
  const uid = String(row.id || "").trim();
  if (!uid) return null;
  const normalized = normalizePortalBootstrapUserRow(row);
  const users = read(KEYS.users, []);
  const others = users.filter((u) => String(u.id) !== uid);
  const merged = { ...normalized };
  write(KEYS.users, [merged, ...others]);
  return merged;
}

/** Mini-identidad persistida en antares_session_v2 para sobrevivir a F5 (caché de usuarios solo en RAM). */
function buildProfileSnapshotFromUserRow(u) {
  if (!u || u.id == null) return null;
  return {
    id: String(u.id),
    email: String(u.email || "").trim(),
    name: String(u.name || "").trim(),
    role: u.role,
    companyId: u.companyId != null ? String(u.companyId) : "",
    permissions: Array.isArray(u.permissions) ? u.permissions : []
  };
}

function syncSessionProfileSnapshotFromCache() {
  const s = getSession();
  if (!s?.userId) return;
  const u = read(KEYS.users, []).find((x) => String(x.id) === String(s.userId));
  const snap = buildProfileSnapshotFromUserRow(u);
  if (!snap) return;
  setSession({ ...s, profileSnapshot: snap });
}

/**
 * Tras F5 la tabla users está vacía en RAM hasta el bootstrap; evita clearSession si la sesión en disco sigue siendo válida.
 *
 * Estrategia:
 *  1. `currentUser()` directo (cache repoblado por bootstrap reciente).
 *  2. `profileSnapshot` persistido en la sesión al login (sobrevive a F5).
 *  3. JWT decodificado (claims sub/email/role).
 *  4. Stub mínimo (solo userId + role) — siempre devuelve algo si la sesión está sana.
 *
 * NO bloquea la materialización aunque permisos vengan vacíos: el bootstrap diferido
 * los hidratará cuando la API responda (`__portalRefreshAfterBootstrap` re-evalúa la URL).
 */
function materializePortalUserFromSession(session) {
  if (!session?.userId) return null;
  let user = currentUser();
  if (user && String(user.id) === String(session.userId)) return user;

  const snap = session.profileSnapshot;
  if (snap && String(snap.id) === String(session.userId)) {
    const users = read(KEYS.users, []);
    const row = {
      id: String(snap.id),
      email: String(snap.email || "").trim() || "usuario@portal",
      name: String(snap.name || "").trim() || String(snap.email || "Usuario").trim() || "Usuario",
      role: snap.role || session.role || ROLES.CLIENT,
      accountStatus: "aprobado",
      companyId: snap.companyId != null ? String(snap.companyId) : "",
      company: "",
      password: "",
      permissions: Array.isArray(snap.permissions) ? snap.permissions : [],
      taxId: "",
      phone: ""
    };
    write(KEYS.users, [row, ...users.filter((u) => String(u.id) !== String(row.id))]);
    user = currentUser();
    if (user && String(user.id) === String(session.userId)) return user;
  }

  const token = String(session.accessToken || "").trim() || String(window.AntaresApi?.getAccessToken?.() || "").trim();
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && String(payload.sub || "").trim() === String(session.userId)) {
      upsertPortalUserStubFromJwtPayload(payload);
    }
    user = currentUser();
    if (user && String(user.id) === String(session.userId)) {
      if (snap && Array.isArray(snap.permissions) && snap.permissions.length && (!user.permissions || !user.permissions.length)) {
        const users = read(KEYS.users, []);
        write(
          KEYS.users,
          users.map((u) =>
            String(u.id) === String(session.userId) ? { ...u, permissions: snap.permissions } : u
          )
        );
        user = currentUser();
      }
      return user;
    }
  }

  /**
   * Fallback final: siempre construimos un stub usable a partir de session.userId. Si falta `role`
   * asumimos cliente para no expulsar al usuario por una sesión incompleta tras F5; cuando el
   * bootstrap responda se rehidrata con el rol real y permisos correctos.
   */
  const fallbackRole = session.role || session.profileSnapshot?.role || ROLES.CLIENT;
  const usersFinal = read(KEYS.users, []);
  const stubRow = {
    id: String(session.userId),
    email: String(session.profileSnapshot?.email || "").trim() || "usuario@portal",
    name: String(session.profileSnapshot?.name || "").trim() || "Usuario",
    role: fallbackRole,
    accountStatus: "aprobado",
    companyId: String(session.profileSnapshot?.companyId || ""),
    company: "",
    password: "",
    permissions: Array.isArray(session.profileSnapshot?.permissions) ? session.profileSnapshot.permissions : [],
    taxId: "",
    phone: ""
  };
  write(KEYS.users, [stubRow, ...usersFinal.filter((u) => String(u.id) !== String(stubRow.id))]);
  user = currentUser();
  if (user && String(user.id) === String(session.userId)) return user;

  return null;
}

function applyPortalBootstrapPayload(p) {
  if (!p || typeof p !== "object") return;
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    __applyPortalBootstrapPayloadInner(p);
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

function __applyPortalBootstrapPayloadInner(p) {
  if (p.contacts !== undefined) {
    state.portalContacts = Array.isArray(p.contacts) ? p.contacts : [];
  }
  const map = [
    ["users", KEYS.users],
    ["companies", KEYS.companies],
    ["counters", KEYS.counters],
    ["requests", KEYS.requests],
    ["vehicles", KEYS.vehicles],
    ["drivers", KEYS.drivers],
    ["notifications", KEYS.notifications],
    ["emails", KEYS.emails],
    ["payrollEmployees", KEYS.payrollEmployees],
    ["payrollRuns", KEYS.payrollRuns],
    ["fuelLogs", KEYS.fuelLogs],
    ["vehicleTechnicalLogs", KEYS.vehicleTechnicalLogs],
    ["travelAllowanceRules", KEYS.travelAllowanceRules],
    ["vacancies", KEYS.vacancies],
    ["candidates", KEYS.candidates],
    ["positions", KEYS.positions],
    ["interviews", KEYS.interviews],
    ["contracts", KEYS.contracts],
    ["hrAbsences", KEYS.hrAbsences],
    ["sstCompliance", KEYS.sstCompliance],
    ["tripRouteRates", KEYS.tripRouteRates],
    ["approvals", KEYS.approvals]
  ];
  for (const [prop, key] of map) {
    if (p[prop] === undefined) continue;
    if (prop === "users") {
      const raw = Array.isArray(p.users) ? p.users : [];
      write(KEYS.users, raw.map(normalizePortalBootstrapUserRow));
      continue;
    }
    if (prop === "companies") {
      const raw = Array.isArray(p.companies) ? p.companies : [];
      const prev = read(KEYS.companies, []);
      const prevMap = new Map(prev.map((c) => [String(c.id ?? ""), c]));
      const merged = patchOperatorCompanyKindIfNeeded(
        raw.map((c) => {
          const id = String(c?.id ?? "");
          const old = id ? prevMap.get(id) : null;
          const explicitInactive =
            c.active === false ||
            String(c.active ?? "").toLowerCase() === "false" ||
            String((c.activeCompany ?? c.companyActive) ?? "").toLowerCase() === "false";
          const active =
            explicitInactive ? false : old && typeof old.active === "boolean" ? old.active : true;
          return { ...c, active };
        })
      );
      write(KEYS.companies, merged);
      continue;
    }
    if (prop === "candidates") {
      const raw = Array.isArray(p.candidates) ? p.candidates : [];
      write(
        KEYS.candidates,
        raw.map((row) => {
          if (!row || typeof row !== "object") return row;
          const r = { ...row };
          const st = String(r.status || "").trim();
          const ps = String(r.pipelineStage || "").trim();
          if (!st && ps) r.status = ps;
          if (r.expectedSalary == null && r.salaryExpectation != null)
            r.expectedSalary = Number(r.salaryExpectation) || 0;
          const avail = String(r.availabilityDate || "").trim();
          if (!avail && r.availableFrom != null) {
            const af = r.availableFrom;
            r.availabilityDate = typeof af === "string" ? af.slice(0, 10) : String(af).slice(0, 10);
          }
          if (r.birthDate != null && r.birthDate !== "") {
            r.birthDate = String(r.birthDate).trim().slice(0, 10);
          }
          return r;
        })
      );
      continue;
    }
    write(key, p[prop]);
  }
}

/** Alinea el token Bearer con la sesión persistida si difieren (evita llamadas silenciosas sin Auth). */
function portalEnsureApiTokensAligned() {
  const api = window.AntaresApi;
  if (!api || typeof api.getAccessToken !== "function" || typeof api.setAccessToken !== "function") return;
  const s = getSession();
  const fromSession = String(s?.accessToken || "").trim();
  if (!fromSession) return;
  const cur = String(api.getAccessToken() || "").trim();
  if (fromSession !== cur) api.setAccessToken(fromSession);
}

/** URL API + JWT (cliente o sesión): mismos criterios que bootstrap tras `portalEnsureApiTokensAligned`. */
function portalCanRefreshFromApi() {
  portalEnsureApiTokensAligned();
  const api = window.AntaresApi;
  if (!api?.getBase?.()) return false;
  const tok =
    String(api.getAccessToken?.() || "").trim() || String(getSession()?.accessToken || "").trim();
  return Boolean(tok);
}

/**
 * POST autenticado al API: usa la misma alineacion JWT↔sesion que bootstrap.
 * Sin URL de backend: no llama al servidor (retorna undefined).
 * Con backend pero sin token/sesión valida: lanza Error (evita borrados solo en caché en produccion).
 */
async function postPortalAuthorized(path, body) {
  const api = window.AntaresApi;
  if (!api?.getBase?.()) return undefined;
  if (!portalCanRefreshFromApi()) {
    throw new Error(
      "No hay sesion valida con el servidor. Revise antares_api_base y vuelva a iniciar sesion."
    );
  }
  return api.postJson(path, body);
}

async function applyPortalBootstrapFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const api = window.AntaresApi;
  const runBootstrap = async () => {
    const p = await api.getJson("/portal/bootstrap");
    applyPortalBootstrapPayload(p);
    syncSessionProfileSnapshotFromCache();
  };
  /**
   * Si bootstrap falla por completo (p. ej. error 500 en otra tabla), al menos
   * intentamos hidratar el perfil propio para que Mi perfil no quede vacío.
   * Endpoint dedicado: /portal/me (lectura ligera, no depende de tarifas/viajes/etc.).
   */
  const tryHydrateOwnProfileFallback = async () => {
    try {
      const me = await api.getJson("/portal/me");
      if (me && me.id) {
        upsertPortalUserRowIntoCache(me);
        syncSessionProfileSnapshotFromCache();
      }
    } catch (_meErr) {
      /* sin fallback, se usará lo que haya en cache/JWT */
    }
  };
  try {
    await runBootstrap();
    return true;
  } catch (err) {
    const st = err && typeof err.status === "number" ? err.status : 0;
    if (st === 401) {
      await tryApiRefreshBridge();
      portalEnsureApiTokensAligned();
      if (!portalCanRefreshFromApi()) return false;
      try {
        await runBootstrap();
        return true;
      } catch (e2) {
        devWarn("Portal: /portal/bootstrap fallo tras renovar token.", e2?.message || e2);
        await tryHydrateOwnProfileFallback();
        return false;
      }
    }
    devWarn("Portal: no se pudo cargar /portal/bootstrap (se usa caché local si existe).", err?.message || err);
    await tryHydrateOwnProfileFallback();
    return false;
  }
}

/** Fusiona filas de GET /portal/pending-user-registrations sin borrar el resto de usuarios en caché. */
function mergePendingUserRegistrationsIntoCache(rows) {
  if (!Array.isArray(rows)) return;
  const normalized = rows.map(normalizePortalBootstrapUserRow);
  const existing = read(KEYS.users, []);
  const byId = new Map(existing.map((u) => [String(u.id), { ...u }]));
  /** Sólo huérfanos vivos en la respuesta actual: si el admin los borra, deben desaparecer. */
  const orphansSeen = new Set();
  for (const row of normalized) {
    const id = String(row.id || "").trim();
    if (!id) continue;
    const prev = byId.get(id) || {};
    if (pendingUserOrigin(row) === "supabase_auth_only") {
      orphansSeen.add(id);
    }
    byId.set(id, {
      ...prev,
      ...row,
      accountStatus: row.accountStatus || prev.accountStatus || ACCOUNT_STATUS.PENDIENTE,
      source: row.source || prev.source || "portal_db"
    });
  }
  // Remueve huérfanos cacheados que la API ya no devuelve (p.ej. usuario eliminado en Supabase Auth).
  const out = [];
  for (const u of byId.values()) {
    if (pendingUserOrigin(u) === "supabase_auth_only" && !orphansSeen.has(String(u.id))) {
      continue;
    }
    out.push(u);
  }
  write(KEYS.users, out);
}

/** Solo administrador: bandeja dedicada de altas pendientes (misma fuente que BD). */
async function applyPendingUserRegistrationsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  if (currentUser()?.role !== ROLES.ADMIN) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/pending-user-registrations");
    if (!Array.isArray(rows)) return false;
    mergePendingUserRegistrationsIntoCache(rows);
    return true;
  } catch (err) {
    devWarn("Portal: GET /portal/pending-user-registrations fallo.", err?.message || err);
    return false;
  }
}

/** Lista prospectos B2B sin depender del bootstrap pesado (mitiga fallos al abrir Solicitudes contacto web). */
async function refreshContactB2bProspectsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/contact-b2b-prospects");
    if (!Array.isArray(rows)) return false;
    state.portalContacts = rows;
    return true;
  } catch (err) {
    devWarn("Portal: GET /portal/contact-b2b-prospects fallo.", err?.message || err);
    return false;
  }
}

window.applyPortalBootstrapFromApi = applyPortalBootstrapFromApi;
window.portalCanRefreshFromApi = portalCanRefreshFromApi;

async function startPortalBootstrapForInteractiveSession() {
  if (!portalCanRefreshFromApi()) return;
  const p = window.PortalDataLayer?.refreshCacheFromApi
    ? window.PortalDataLayer.refreshCacheFromApi()
    : applyPortalBootstrapFromApi();
  let ok = false;
  try {
    ok = await p;
  } catch (_e) {
    /* fallo de red o 401: la vista usa proyección local hasta el próximo intento */
  }
  if (ok && typeof window.__portalRefreshAfterBootstrap === "function") {
    try {
      window.__portalRefreshAfterBootstrap();
    } catch (_e2) {}
  }
}

/** Evita POST /portal/sync-key con el array completo de usuarios mientras se ajusta caché a mano. */
function portalPatchUsersCacheWithoutSyncKey(mutator) {
  if (typeof mutator !== "function") return;
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    mutator();
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

/**
 * Tras POST que muta usuarios en PostgreSQL: volcado bootstrap y cola de pendientes (admin).
 * El merge de pendientes también va bajo begin/end para no disparar sync-key redundante.
 */
async function portalRefreshBootstrapThenPendingRegistrations() {
  await startPortalBootstrapForInteractiveSession();
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    if (currentUser()?.role === ROLES.ADMIN) {
      await applyPendingUserRegistrationsFromApi();
    }
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

function reqRead() {
  return typeof DomainModules?.requests?.readAllSync === "function"
    ? DomainModules.requests.readAllSync()
    : read(KEYS.requests, []);
}

function reqWrite(next) {
  if (typeof DomainModules?.requests?.writeAllSync === "function") {
    DomainModules.requests.writeAllSync(next);
  } else {
    write(KEYS.requests, next);
  }
}

/** Igual que `reqWrite` pero espera `sync-key` con la tabla `solicitudes_transporte` en PostgreSQL. */
async function reqWriteAwait(next) {
  reqWrite(next);
  await writeAwaitServer(KEYS.requests, read(KEYS.requests, []));
}

if (typeof window.DomainModules?.requests?.attachStorage === "function") {
  window.DomainModules.requests.attachStorage({ KEYS, read, write });
}
if (typeof window.DomainRegistry?.wireFromAntares === "function") {
  window.DomainRegistry.wireFromAntares({ KEYS, read, write });
}

const publicTextStore = [];
let publicTextCaptured = false;

function capturePublicTextNodes() {
  if (publicTextCaptured) return;
  const scopes = [document.querySelector(".top-nav"), document.getElementById("public-app"), document.querySelector(".site-footer"), document.getElementById("auth-modal")].filter(Boolean);
  scopes.forEach((scope) => {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const original = current.nodeValue;
      if (String(original || "").trim()) {
        publicTextStore.push({ node: current, original });
      }
      current = walker.nextNode();
    }
  });
  publicTextCaptured = true;
}

function normalizePublicKey(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapePublicRegexFragment(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Find [start,end) in haystack such that normalizePublicKey(slice) === normalizePublicKey(needle). */
function findNormalizedSpan(haystack, needle) {
  const nNorm = normalizePublicKey(needle);
  if (!nNorm) return null;
  for (let i = 0; i < haystack.length; i++) {
    for (let j = i + 1; j <= haystack.length; j++) {
      const sub = haystack.slice(i, j);
      const subNorm = normalizePublicKey(sub);
      if (subNorm === nNorm) return [i, j];
      if (subNorm.length > nNorm.length) break;
    }
  }
  return null;
}

function replaceAllNormalizedSpans(haystack, needle, replacement) {
  let result = haystack;
  for (let guard = 0; guard < 500; guard++) {
    const span = findNormalizedSpan(result, needle);
    if (!span) break;
    const [a, b] = span;
    result = result.slice(0, a) + replacement + result.slice(b);
  }
  return result;
}

/** Spanish → English strings for the public site (source HTML uses plain ASCII in many words). */
const PUBLIC_ES_EN_DICT = {
  Inicio: "Home",
  Nosotros: "About",
  Equipo: "Team",
  Empresas: "Companies",
  Testimonios: "Testimonials",
  Aliados: "Partners",
  Actualidad: "News",
  Experiencias: "Client stories",
  Liderazgo: "Leadership",
  Carreras: "Careers",
  "Abrir menu de navegacion": "Open navigation menu",
  Flota: "Fleet",
  Servicios: "Services",
  Cobertura: "Coverage",
  Proceso: "Process",
  Novedades: "Updates",
  "Trabaja con nosotros": "Careers",
  Contacto: "Contact",
  Portal: "Portal",
  Tema: "Theme",
  Idioma: "Language",
  Principal: "Main",
  "Menu de navegacion": "Open navigation menu",
  "Modo claro": "Light mode",
  "Modo oscuro": "Dark mode",
  "Logistica premium para floricultura y exportacion": "Premium logistics for floriculture and exports",
  "Transporte especializado de flores con": "Specialized flower transportation with",
  "trazabilidad total": "full traceability",
  "Operamos una red B2B con turbos, camiones y tractocamiones para movilizar": "We operate a B2B network with turbo trucks, medium trucks, and tractor-trailers to move",
  "flor de exportacion con control de temperatura, seguridad y cumplimiento en toda Colombia.": "export flowers with temperature control, safety, and compliance across Colombia.",
  "Operamos con turbos, camiones y tractocamiones para llevar tu carga": "We operate turbo trucks, medium trucks, and tractor-trailers to move your cargo",
  "con control de temperatura, seguridad y cumplimiento en toda Colombia.": "with temperature control, security, and on-time compliance across Colombia.",
  Contactenos: "Contact us",
  "Solicitar propuesta": "Request proposal",
  "Ingresar al portal": "Enter portal",
  "Entregas mensuales": "Monthly deliveries",
  "Nivel de cumplimiento": "Service compliance",
  "Tiempo de respuesta": "Response time",
  "Quienes somos": "Who we are",
  "Somos una compania con enfoque B2B especializada en logistica de": "We are a B2B-focused company specialized in logistics for",
  "flor. Integramos tecnologia, experiencia operativa y servicio al": "flowers. We combine technology, operational experience, and customer",
  "cliente para garantizar entregas puntuales y seguras.": "service to ensure on-time, secure deliveries.",
  Valores: "Values",
  "Compromiso con tiempos de entrega.": "Commitment to delivery times.",
  "Calidad operativa y trazabilidad.": "Operational quality and traceability.",
  "Atencion humana y cercana.": "Human, approachable service.",
  "Mejora continua con datos.": "Continuous improvement driven by data.",
  "Equipo directivo": "Leadership team",
  "Liderazgo estrategico y operativo para asegurar excelencia en cada": "Strategic and operational leadership to ensure excellence on every",
  "viaje y en toda la cadena de servicio.": "trip and across the entire service chain.",
  "Foto de prueba (reemplazable)": "Placeholder photo (replaceable)",
  "Direccion general": "Executive leadership",
  "Vision estrategica, alianzas y crecimiento sostenible.": "Strategic vision, partnerships, and sustainable growth.",
  Operacion: "Operations",
  "Ejecucion logistica, eficiencia de flota y cumplimiento.": "Logistics execution, fleet efficiency, and reliability.",
  Administracion: "Administration",
  "Soporte documental, atencion y gestion interna diaria.": "Document support, customer care, and day-to-day internal management.",
  "Auxiliar administrativa": "Administrative assistant",
  "Gestion administrativa": "Business administration",
  "Lider administrativo": "Administrative lead",
  "Control de procesos, coordinacion y mejora continua.": "Process control, coordination, and continuous improvement.",
  "Estandar empresarial": "Enterprise standard",
  "Operamos con procesos definidos, seguimiento documentado, niveles de servicio medibles y una cultura de mejora continua orientada a resultados.": "We operate with defined processes, documented follow-up, measurable service levels, and a results-driven continuous improvement culture.",
  "Empresas que confian en nosotros": "Companies that trust us",
  "Aliados del sector floricultor, comercializador y exportador que": "Allies across floriculture, trading, and exports who",
  "priorizan puntualidad y conservacion de cadena de frio.": "prioritize punctuality and cold-chain integrity.",
  "Empresas atendidas en el ultimo ano.": "Companies served in the last year.",
  "Clientes recurrentes por nivel de servicio.": "Repeat clients driven by service quality.",
  "Monitoreo de operacion y trazabilidad.": "Operations monitoring and traceability.",
  "Rastrea tu envio": "Track your shipment",
  "Lo que dicen nuestros clientes": "What our clients say",
  "Experiencias reales de empresas que gestionan volumen, calidad y": "Real stories from companies managing volume, quality, and",
  "tiempos exigentes.": "tight timelines.",
  '"Redujimos reprocesos logisticos en un 32% desde que operamos': '"We cut logistics rework by 32% since we started working',
  'con Antares. Son rapidos, claros y muy confiables."': 'with Antares. They are fast, clear, and very reliable."',
  "Directora de Operaciones": "Director of Operations",
  "Gerente Logistico": "Logistics Manager",
  "Coordinadora Comercial": "Commercial Coordinator",
  '"La trazabilidad por estado de viaje nos dio control real del': '"Trip-status traceability gave us real control over the',
  'proceso. Excelente coordinacion y cumplimiento."': 'process. Excellent coordination and execution."',
  '"El manejo de cadena de frio y puntualidad en entregas criticas': '"Cold-chain handling and punctuality on critical deliveries',
  'ha sido sobresaliente. Equipo altamente profesional."': 'have been outstanding. A highly professional team."',
  "Nuestra flota": "Our fleet",
  "Vehiculos especializados con control de temperatura para cada necesidad logistica.": "Specialized vehicles with temperature control for every logistics need.",
  "Capacidad:": "Capacity:",
  "Cajas:": "Boxes:",
  "Ideal para rutas urbanas y regionales": "Ideal for urban and regional routes",
  Tractomula: "Articulated fleet",
  Bus: "Bus",
  "Traslados de equipo y corredores entre sedes": "Crew moves and corridor runs between locations",
  Camion: "Truck",
  "Balance entre volumen y eficiencia": "Balance of volume and efficiency",
  Tractocamion: "Tractor-trailer",
  "Alto volumen y larga distancia": "High volume and long distance",
  "Nuestros servicios": "Our services",
  "Soluciones logisticas integrales para el sector floricultor y de exportacion.": "End-to-end logistics solutions for floriculture and exports.",
  "Refrigerado y especializado": "Refrigerated and specialized",
  "Control de temperatura con monitoreo constante para conservar la frescura y calidad de la flor desde el origen hasta el destino.": "Temperature control with continuous monitoring to preserve freshness and flower quality from origin to destination.",
  "Monitoreo operativo": "Operational monitoring",
  "Seguimiento en tiempo real por estado de viaje, notificaciones automaticas y visibilidad completa del proceso logistico.": "Real-time tracking by trip status, automated notifications, and full visibility of the logistics process.",
  "Atencion B2B": "B2B service",
  "Modelo de servicio dedicado para exportadores y comercializadores con acuerdos de servicio personalizados.": "A dedicated service model for exporters and traders with tailored service agreements.",
  "Proceso operativo estandar": "Standard operating process",
  "Un flujo claro de punta a punta para proteger la cadena de frio y asegurar entregas confiables.": "A clear end-to-end flow to protect the cold chain and ensure reliable deliveries.",
  "Planeacion de ruta": "Route planning",
  "Definimos origen, ventanas de cargue, destino y contingencias segun criticidad de la carga.": "We define origin, loading windows, destination, and contingencies according to shipment criticality.",
  "Asignacion de flota": "Fleet assignment",
  "Seleccionamos vehiculo y conductor acorde a volumen, temperatura objetivo y tiempos de entrega.": "We assign the right vehicle and driver based on volume, target temperature, and delivery windows.",
  "Monitoreo en viaje": "In-transit monitoring",
  "Hacemos seguimiento en tiempo real del estado del viaje y puntos criticos de la operacion.": "We track trip status and critical checkpoints in real time.",
  "Cierre y trazabilidad": "Closure and traceability",
  "Registramos novedades, evidencia de entrega y reporte para analisis de cumplimiento.": "We record incidents, proof of delivery, and compliance reporting.",
  "Cobertura nacional": "Nationwide coverage",
  "Rutas principales y corredores frecuentes para el sector floricultor y exportador.": "Main routes and frequent corridors for floriculture and exports.",
  "Rutas principales": "Main routes",
  "Corredores frecuentes": "Frequent corridors",
  Sabana: "Savannah",
  "Sabana de Bogota": "Bogota savannah",
  "Antioquia floricultora": "Flower-growing Antioquia",
  "Puertos de exportacion": "Export ports",
  "Eje cafetero": "Coffee axis",
  "Costa atlantica": "Atlantic coast",
  "Bogota D.C.": "Bogota D.C.",
  Medellin: "Medellin",
  Rionegro: "Rionegro",
  Cali: "Cali",
  Pereira: "Pereira",
  Armenia: "Armenia",
  Bucaramanga: "Bucaramanga",
  Cartagena: "Cartagena",
  Barranquilla: "Barranquilla",
  "Novedades y mejoras": "News and updates",
  "Cambios recientes en operacion, tecnologia y servicio para mantener a nuestros clientes informados.": "Recent changes in operations, technology, and service to keep our clients informed.",
  "Infraestructura y competitividad": "Infrastructure and competitiveness",
  "COMUNICADO OFICIAL · OPERACIÓN HISTÓRICA": "OFFICIAL STATEMENT · HISTORIC OPERATION",
  "Antares marca un hito en Puerto Antioquia con la tractomula JZX522": "Antares marks a milestone at Puerto Antioquia with tractor-trailer JZX522",
  "Abrimos un nuevo precedente logístico: primera operación de ingreso de contenedor de flor al puerto con unidad propia, consolidando capacidad real para rutas de exportación de alto valor.": "We are opening a new logistics precedent: first entry of a flower container into the port with our own unit, consolidating real capacity for high-value export routes.",
  "Operación documentada en campo": "Field-documented operation",
  "Corredor estratégico de exportación": "Strategic export corridor",
  "Evidencia audiovisual y fotográfica": "Audiovisual and photographic evidence",
  "Hito logístico Antares": "Antares logistics milestone",
  "Unidad destacada: JZX522": "Featured unit: JZX522",
  "Primera operación de contenedor de flor en Puerto Antioquia": "First flower container operation at Puerto Antioquia",
  "Fuimos la": "We were the",
  "primera empresa de transporte": "first transport company",
  "en ingresar contenedor de flor a Puerto Antioquia con nuestra tractomula": "entering a flower container into Puerto Antioquia with our tractor-trailer",
  ", marcando un avance clave para la cadena de exportación.": ", marking a key advance for the export chain.",
  "Ventaja competitiva": "Competitive edge",
  "Menor tiempo de conexión portuaria": "Shorter port connection time",
  "Capacidad operativa": "Operational capacity",
  "Operación real en corredor de exportación": "Real operation on an export corridor",
  "Impacto sectorial": "Sector impact",
  "Más confianza para floricultores y comercializadores": "More confidence for growers and traders",
  "Unidad destacada JZX522": "Featured unit JZX522",
  "Registro visual de la tractomula en operación.": "Visual record of the tractor-trailer in operation.",
  "Activo logístico clave": "Key logistics asset",
  "Tractomula JZX522": "Tractor-trailer JZX522",
  "Unidad utilizada en la operación destacada, con soporte fotográfico como respaldo del comunicado institucional.": "Unit used in the highlighted operation, with photographic support backing the institutional announcement.",
  "Timeline del logro": "Milestone timeline",
  "Planeación:": "Planning:",
  "coordinación previa de ventana y documentación.": "prior coordination of loading window and documentation.",
  "Ejecución:": "Execution:",
  "ingreso de contenedor de flor con tractomula": "flower container entry with tractor-trailer",
  "Validación:": "Validation:",
  "cierre operativo y confirmación de hito en puerto.": "operational closure and milestone confirmation at the port.",
  "Ruta de impacto": "Impact route",
  "Mercado internacional": "International market",
  "Corredor estratégico para exportación de flor con trazabilidad continua.": "Strategic corridor for flower export with continuous traceability.",
  "Antes": "Before",
  "Rutas más largas, mayores tiempos y menor control de conexión portuaria.": "Longer routes, longer times, and less control of the port connection.",
  "Ahora con el hito": "Now with the milestone",
  "Operación directa más competitiva, mejor respuesta logística y más confiabilidad para clientes.": "A more competitive direct operation, better logistics response, and greater reliability for customers.",
  "Contexto institucional": "Institutional context",
  "Mensaje oficial de la Gobernación de Antioquia": "Official message from the Government of Antioquia",
  "Mensaje institucional sobre competitividad regional e infraestructura": "Institutional message on regional competitiveness and infrastructure",
  "Fuente oficial: Gobernación de Antioquia (@puerto_antioquia) · Validación operativa interna Antares · Actualizado: Abril 2026": "Official source: Government of Antioquia (@puerto_antioquia) · Antares internal operational validation · Updated: April 2026",
  "\"Puerto Antioquia en Uraba marca un antes y un despues para la competitividad de Antioquia y del pais. Todos los dias zarpan barcos con productos del campo: 130 mil tallos de flores, cultivados en La Ceja, van rumbo hacia Inglaterra y 23 toneladas de aguacate Hass del Suroeste llegaran a Belgica. En el pasado estas exportaciones salian por Santa Marta, lo que implicaba mayores tiempos y costos. Hoy, el mundo entra y sale por Uraba, generando ahorros logisticos, empleo y nuevas oportunidades.\"": "\"Puerto Antioquia in Urabá marks a before-and-after for competitiveness in Antioquia and the country. Every day, ships sail with products from the countryside: 130,000 flower stems grown in La Ceja bound for England, and 23 tons of Hass avocado from the southwest heading to Belgium. In the past, these exports left through Santa Marta, with longer times and higher costs. Today, the world enters and leaves through Urabá, generating logistics savings, jobs, and new opportunities.\"",
  "GOBERNACIÓN DE ANTIOQUIA": "GOVERNMENT OF ANTIOQUIA",
  "Este resultado posiciona a Antares como aliado logístico empresarial para operaciones con alta exigencia de cumplimiento y trazabilidad.": "This outcome positions Antares as a business logistics partner for operations with high compliance and traceability requirements.",
  "Puerto Antioquia impulsa exportaciones: nuestra tractomula en operacion": "Puerto Antioquia boosts exports: our tractor-trailer in operation",
  "Nuestra operacion participa en una ruta clave de exportacion de flores y aguacate desde Antioquia hacia mercados internacionales.": "Our operation supports a key export route for flowers and avocado from Antioquia to international markets.",
  "Tu navegador no soporta video HTML5.": "Your browser does not support HTML5 video.",
  "Puerto Antioquia @puerto_antioquia en Uraba marca un antes y un despues para la competitividad de Antioquia y del pais. Todos los dias zarpan barcos con productos del campo: 130 mil tallos de flores, cultivados en La Ceja, van rumbo hacia Inglaterra y 23 toneladas de aguacate Hass del Suroeste llegaran a Belgica. En el pasado estas exportaciones salian por Santa Marta, lo que implicaba mayores tiempos y costos. Hoy, el mundo entra y sale por Uraba, generando ahorros logisticos, empleo y nuevas oportunidades. ¡En Antioquia, la infraestructura se traduce en hechos!": "Puerto Antioquia @puerto_antioquia in Urabá marks a before-and-after for competitiveness in Antioquia and the country. Every day, ships sail with products from the countryside: 130,000 flower stems grown in La Ceja bound for England, and 23 tons of Hass avocado from the southwest headed to Belgium. In the past, these exports left through Santa Marta, meaning longer times and higher costs. Today, the world enters and leaves through Urabá, generating logistics savings, jobs, and new opportunities. In Antioquia, infrastructure becomes concrete results!",
  "Fuente: Gobernacion de Antioquia · Actualizado: Abril 2026": "Source: Government of Antioquia · Updated: April 2026",
  "Imagen operativa en ruta": "Operational image on the road",
  "Nuestra tractomula en escenario real de cargue y despacho.": "Our tractor-trailer in a real loading and dispatch scenario.",
  "Presencia de marca en carretera": "Brand presence on the road",
  "Vehiculos visibles, cuidados y alineados con estandares de servicio.": "Visible, well-maintained vehicles aligned with service standards.",
  Marca: "Brand",
  Calidad: "Quality",
  Plataforma: "Platform",
  "Seguimiento de viajes reforzado": "Enhanced trip tracking",
  "Incorporamos alertas internas para detectar desvíos de ruta y mejorar tiempos de respuesta en incidentes.": "We added internal alerts to detect route deviations and improve incident response times.",
  "Cadena de frio con mayor control": "Stronger cold-chain control",
  "Se ajustaron protocolos de temperatura por tipo de flor y duracion de trayecto para reducir mermas.": "Temperature protocols were tuned by flower type and journey length to reduce shrinkage.",
  "Nuevos contratos Word automatizados": "New automated Word contracts",
  "Al crear empleados se generan contratos en formato Word conservando la estructura oficial de la empresa.": "When creating employees, Word contracts are generated while preserving the company’s official structure.",
  "Actualizado: Abril 2026": "Updated: April 2026",
  "Vacantes publicadas desde nuestro portal de RRHH. Postulate de forma segura; tu hoja de vida llega al modulo de": "Open roles from our HR portal. Apply securely; your résumé goes straight to the",
  Contratacion: "Recruitment",
  "para que el equipo revise tu perfil.": "module so the team can review your profile.",
  "Las vacantes se sincronizan con el mismo equipo que gestiona candidatos en el portal (misma base local del navegador).": "Vacancies sync with the same team that manages candidates in the portal (same local browser database).",
  "Formulario de contacto B2B": "B2B contact form",
  "Cuentanos tu necesidad logistica y te compartimos una propuesta tecnica y comercial.": "Tell us your logistics needs and we will share a technical and commercial proposal.",
  "Cuentanos tu operacion y te proponemos una solucion logistica ajustada a tu nivel de servicio.": "Tell us about your operation and we will propose a logistics solution tailored to your service level.",
  "Respuesta comercial < 30 min": "Commercial response < 30 min",
  "Atencion especializada B2B": "Specialized B2B support",
  "Confidencialidad de datos": "Data confidentiality",
  "Al enviar, un asesor B2B te contactara para validar requerimientos tecnicos y comerciales.": "After submitting, a B2B advisor will contact you to validate technical and commercial requirements.",
  "Enviar solicitud B2B": "Send B2B request",
  "Tipo de operacion": "Operation type",
  Exportacion: "Export",
  "Distribucion nacional": "Domestic distribution",
  "Operacion mixta": "Mixed operation",
  "Frecuencia estimada": "Estimated frequency",
  Diaria: "Daily",
  Semanal: "Weekly",
  Quincenal: "Biweekly",
  Mensual: "Monthly",
  "Ventana de inicio": "Start window",
  "Inmediata (0-7 dias)": "Immediate (0-7 days)",
  "Corto plazo (8-30 dias)": "Short term (8-30 days)",
  "Planificada (31+ dias)": "Planned (31+ days)",
  "Volumen mensual aprox. (kg)": "Approx. monthly volume (kg)",
  "1. Contacto": "1. Contact",
  "2. Operacion": "2. Operation",
  "3. Requerimiento": "3. Requirements",
  Anterior: "Back",
  Siguiente: "Next",
  "Portal empresarial Antares": "Antares enterprise portal",
  "Ingreso seguro para clientes y equipos operativos.": "Secure access for clients and operational teams.",
  Ingresar: "Sign in",
  "Ingreso empresarial seguro": "Secure enterprise access",
  "Accede a tu operacion con trazabilidad, control de permisos y registro de actividad.": "Access your operation with traceability, permission control, and activity records.",
  "Portal disenado para equipos de operaciones, administracion y recursos humanos.": "Portal designed for operations, administration, and HR teams.",
  "Sesion cifrada": "Encrypted session",
  "Historial de cambios": "Change history",
  "Soporte corporativo": "Corporate support",
  "Usa credenciales corporativas. Evita ingresar desde equipos compartidos o redes publicas.": "Use corporate credentials. Avoid signing in from shared devices or public networks.",
  "Registro de cliente empresarial": "Enterprise client registration",
  "Completa tu perfil para habilitar aprobacion de acceso y configuracion de servicios.": "Complete your profile to enable access approval and service setup.",
  "Tu solicitud sera revisada por un administrador antes de habilitar acceso al portal.": "Your request will be reviewed by an administrator before portal access is enabled.",
  "Recuperacion de acceso": "Access recovery",
  "Te ayudamos a restablecer el acceso de forma segura con validacion administrativa.": "We help you restore access securely with administrative validation.",
  "Solicitar recuperacion": "Request recovery",
  "Caso de exito · Exportador floricola": "Success case · Floriculture exporter",
  "De 9 incidentes mensuales a 2 con control en ruta": "From 9 monthly incidents down to 2 with route control",
  "Integramos seguimiento por hitos, control de temperatura y alertas tempranas para reducir desviaciones en despachos de alto valor.": "We integrated milestone tracking, temperature control, and early alerts to reduce deviations in high-value dispatches.",
  "incidencias criticas": "critical incidents",
  "visibilidad operativa": "operational visibility",
  "puesta en marcha": "go-live",
  "Caso de exito · Comercializador": "Success case · Distributor",
  "Escalamiento de temporada alta sin perder puntualidad": "Peak-season scaling without losing punctuality",
  "Con planeacion de flota y monitoreo 24/7 mantuvimos continuidad operativa durante picos de demanda y cierres de ventana.": "With fleet planning and 24/7 monitoring, we maintained operational continuity during demand peaks and narrow loading windows.",
  "quiebres de cadena de frio": "cold-chain breaks",
  "capacidad en picos": "peak capacity",
  "entregas en SLA": "SLA deliveries",
  "-18% tiempos de conexion": "-18% connection times",
  "+23% eficiencia logistica": "+23% logistics efficiency",
  "98.7% entregas a tiempo": "98.7% on-time deliveries",
  Nombre: "Name",
  Empresa: "Company",
  "NIT/RUT": "Tax ID",
  Cargo: "Role",
  Telefono: "Phone",
  Correo: "Email",
  "Tipo de servicio": "Service type",
  "Seleccione...": "Select...",
  "Transporte nacional con termoking": "National transport with Thermo King",
  "Transporte nacional sin termoking": "National transport without Thermo King",
  "Transporte entre sedes del cliente": "Transport between client sites",
  Mensaje: "Message",
  "Enviar solicitud": "Send request",
  Aplicar: "Apply",
  Cierre: "Closing",
  "Sin fecha limite": "Open deadline",
  "No hay vacantes publicadas en este momento. Vuelve pronto o escribenos en Contacto.": "There are no openings right now. Check back soon or reach us via Contact.",
  Direccion: "Address",
  "Las solicitudes se guardan en base de datos local del navegador y": "Requests are stored in the browser’s local database and",
  "generan una notificacion simulada de email.": "trigger a simulated email notification.",
  Legal: "Legal",
  "Politica de privacidad": "Privacy policy",
  "Terminos y condiciones": "Terms and conditions",
  "Redes sociales": "Social media",
  "Transporte especializado de flores para empresas en toda Colombia.": "Specialized flower transport for companies across Colombia.",
  "Camiones y utilización": "Trucks and utilization",
  Nomina: "Payroll",
  "Mi perfil": "My profile",
  Notificaciones: "Notifications",
  "Cerrar sesion": "Sign out",
  "Todos los derechos reservados.": "All rights reserved.",
  WhatsApp: "WhatsApp",
  "Contactar por WhatsApp": "Contact via WhatsApp",
  "Galeria operativa": "Operations gallery",
  "Videos relacionados": "Related videos",
  Claro: "Light",
  Oscuro: "Dark"
};

let publicTranslationSortedEntries = null;
function getPublicTranslationSortedEntries() {
  if (!publicTranslationSortedEntries) {
    publicTranslationSortedEntries = Object.entries(PUBLIC_ES_EN_DICT).sort((a, b) => b[0].length - a[0].length);
  }
  return publicTranslationSortedEntries;
}

function translatePublicText(text, lang) {
  if (lang !== "en") return text;
  const raw = String(text || "");
  const leading = raw.match(/^\s*/)?.[0] ?? "";
  const trailing = raw.match(/\s*$/)?.[0] ?? "";
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) return text;

  const normalizedDict = Object.entries(PUBLIC_ES_EN_DICT).reduce((acc, [es, en]) => {
    acc[normalizePublicKey(es)] = en;
    return acc;
  }, {});

  const fullKey = normalizePublicKey(collapsed);
  let out;
  if (normalizedDict[fullKey]) {
    out = normalizedDict[fullKey];
  } else {
    out = collapsed;
    const phraseThreshold = 14;
    for (const [es, en] of getPublicTranslationSortedEntries()) {
      const src = String(es).replace(/\s+/g, " ").trim();
      if (!src) continue;
      const usePhrase = src.length >= phraseThreshold || /\s/.test(src);
      if (usePhrase) {
        if (out.includes(src)) {
          out = out.split(src).join(en);
        } else if (normalizePublicKey(out).includes(normalizePublicKey(src))) {
          out = replaceAllNormalizedSpans(out, src, en);
        }
      } else {
        const re = new RegExp(`\\b${escapePublicRegexFragment(src)}\\b`, "g");
        let next = out.replace(re, en);
        if (
          next === out &&
          src.length >= 5 &&
          normalizePublicKey(out).includes(normalizePublicKey(src))
        ) {
          next = replaceAllNormalizedSpans(out, src, en);
        }
        out = next;
      }
    }
  }
  return leading + out + trailing;
}

function tPublic(textEs) {
  if (state.publicLang !== "en") return textEs;
  return translatePublicText(textEs, "en");
}

function setElementTextPreserveChildren(selector, text) {
  const el = document.querySelector(selector);
  if (!el) return;
  const textNodes = [...el.childNodes].filter(
    (node) => node.nodeType === Node.TEXT_NODE && String(node.nodeValue || "").trim()
  );
  if (!textNodes.length) {
    el.appendChild(document.createTextNode(` ${text}`));
    return;
  }
  const target = textNodes[textNodes.length - 1];
  const leading = /^\s/.test(target.nodeValue || "") ? " " : "";
  const trailing = /\s$/.test(target.nodeValue || "") ? " " : "";
  target.nodeValue = `${leading}${text}${trailing}`;
}

const PUBLIC_TEXT_OVERRIDES = {
  es: {
    "#trusted .section-head p": "Aliados del sector floricultor, comercializador y exportador que priorizan puntualidad y conservacion de cadena de frio.",
    "#trusted .mini-metric:nth-child(1) p": "Empresas atendidas en el ultimo ano.",
    "#trusted .mini-metric:nth-child(2) p": "Clientes recurrentes por nivel de servicio.",
    "#trusted .mini-metric:nth-child(3) p": "Monitoreo de operacion y trazabilidad.",
    "#about .about-grid article:nth-child(1) p": "Somos un operador logistico B2B especializado en transporte refrigerado para floricultores, comercializadores y exportadores. Integramos tecnologia, disciplina operativa y servicio cercano para garantizar entregas puntuales.",
    "#hierarchy .section-head p": "Liderazgo estrategico y operativo para asegurar excelencia en cada viaje y en toda la cadena de servicio.",
    "#testimonials .section-head p": "Experiencias reales de empresas que gestionan volumen, calidad y tiempos exigentes.",
    "#services .section-head p": "Soluciones logisticas integrales para el sector floricultor y de exportacion.",
    "#coverage .section-head p": "Rutas principales y corredores frecuentes para el sector floricultor y exportador.",
    "#news .section-head p": "Cambios recientes en operacion, tecnologia y servicio para mantener a nuestros clientes informados.",
    "#careers .muted":
      "Con el servidor de la empresa configurado, las vacantes y postulaciones quedan registradas de forma centralizada; sin esa conexión solo verá datos de demostración en este equipo.",
    "#contact .container > article:nth-child(2) .muted":
      "Con el servidor configurado, las solicitudes se registran de forma segura. Sin conexión, la información puede quedar solo en este navegador."
  },
  en: {
    "#trusted .section-head p": "Allies across floriculture, trading, and exports who prioritize punctuality and cold-chain integrity.",
    "#trusted .mini-metric:nth-child(1) p": "Companies served in the last year.",
    "#trusted .mini-metric:nth-child(2) p": "Repeat clients driven by service quality.",
    "#trusted .mini-metric:nth-child(3) p": "Operations monitoring and traceability.",
    "#about .about-grid article:nth-child(1) p": "We are a B2B logistics operator specialized in refrigerated transport for growers, distributors, and exporters. We combine technology, operational discipline, and close support to ensure on-time deliveries.",
    "#hierarchy .section-head p": "Strategic and operational leadership that ensures excellence on every trip and across the full service chain.",
    "#testimonials .section-head p": "Real stories from companies managing high volume, strict quality, and demanding timelines.",
    "#services .section-head p": "End-to-end logistics solutions for floriculture and export operations.",
    "#coverage .section-head p": "Main routes and frequent corridors for the floriculture and export sector.",
    "#news .section-head p": "Recent updates in operations, technology, and service to keep our clients informed.",
    "#careers .muted":
      "With your organization server configured, openings and applications are stored centrally; without it you only see demo data in this browser.",
    "#contact .container > article:nth-child(2) .muted":
      "With the server configured, requests are stored securely. Without a connection, information may remain only in this browser."
  }
};

function applyPublicLanguage(lang = "es") {
  capturePublicTextNodes();
  publicTextStore.forEach(({ node, original }) => {
    node.nodeValue = lang === "en" ? translatePublicText(original, "en") : original;
  });
  nodes.langButtonsPublic.forEach((btn) => {
    btn.classList.toggle("active", String(btn.dataset.langOption || "") === lang);
  });
  const attrMap = {
    es: {
      "#open-auth": "Portal",
      "#open-auth-hero": "Ingresar al portal",
      "#logout": "Cerrar sesion"
    },
    en: {
      "#open-auth": "Portal",
      "#open-auth-hero": "Enter portal",
      "#logout": "Sign out"
    }
  };
  const attrs = attrMap[lang] || attrMap.es;
  Object.entries(attrs).forEach(([selector, value]) => {
    setElementTextPreserveChildren(selector, value);
  });

  const textOverrides = PUBLIC_TEXT_OVERRIDES[lang] || PUBLIC_TEXT_OVERRIDES.es;
  Object.entries(textOverrides).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  });

  const placeholderMap = {
    es: {
      "input[name='name']": "Ej. Laura Castaneda",
      "input[name='company']": "Ej. Comercializadora S.A.S.",
      "input[name='taxId']": "Ej. 900123456-7",
      "input[name='position']": "Ej. Directora de Operaciones",
      "input[name='phone']": "+57 300 000 0000",
      "input[name='email']": "nombre@empresa.com",
      "input[name='monthlyVolumeKg']": "Ej. 12000",
      "textarea[name='message']": "Cuentanos origen/destino, volumen aproximado, frecuencia y ventana de entrega."
    },
    en: {
      "input[name='name']": "E.g. Laura Castaneda",
      "input[name='company']": "E.g. Trading Company S.A.S.",
      "input[name='taxId']": "E.g. 900123456-7",
      "input[name='position']": "E.g. Director of Operations",
      "input[name='phone']": "+57 300 000 0000",
      "input[name='email']": "name@company.com",
      "input[name='monthlyVolumeKg']": "E.g. 12000",
      "textarea[name='message']": "Tell us origin/destination, approximate volume, frequency, and delivery window."
    }
  };
  const placeholders = placeholderMap[lang] || placeholderMap.es;
  Object.entries(placeholders).forEach(([selector, value]) => {
    const el = document.querySelector(`#contact ${selector}`);
    if (el) el.setAttribute("placeholder", value);
  });

  const docLang = lang === "en" ? "en-US" : "es";
  document.documentElement.setAttribute("lang", docLang);

  document.title = lang === "en" ? "Antares — B2B Refrigerated Logistics" : "Antares - Logistica Refrigerada B2B";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      lang === "en"
        ? "B2B logistics operator specialized in refrigerated transport for floriculture and exports, with traceability, compliance, and 24/7 monitoring across Colombia."
        : "Operador logistico B2B especializado en transporte refrigerado para floricultura y exportacion, con trazabilidad, cumplimiento y monitoreo 24/7 en Colombia."
    );
  }

  const mainNav = document.getElementById("main-nav");
  if (mainNav) mainNav.setAttribute("aria-label", lang === "en" ? "Main" : "Principal");

  const logoMarquee = document.querySelector(".logo-marquee");
  if (logoMarquee) logoMarquee.setAttribute("aria-label", lang === "en" ? "Partner companies" : "Empresas aliadas");

  const waFab = document.querySelector(".whatsapp-fab");
  if (waFab) {
    const waLabel = lang === "en" ? "Contact via WhatsApp" : "Contactar por WhatsApp";
    waFab.setAttribute("aria-label", waLabel);
    waFab.setAttribute("title", waLabel);
  }

  if (nodes.themeTogglePublic) nodes.themeTogglePublic.setAttribute("aria-label", lang === "en" ? "Theme" : "Tema");
  if (nodes.langTogglePublic) nodes.langTogglePublic.setAttribute("aria-label", lang === "en" ? "Language" : "Idioma");

  const hamburgerBtn = document.getElementById("hamburger-btn");
  if (hamburgerBtn) {
    hamburgerBtn.setAttribute(
      "aria-label",
      lang === "en" ? "Open navigation menu" : "Abrir menu de navegacion"
    );
  }
}

function applyTheme(theme = "light") {
  const mode = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", mode);
  state.theme = mode;
  localStorage.setItem(UI_PREFS.theme, mode);
  [...nodes.themeButtonsPublic, ...nodes.themeButtonsPortal].forEach((btn) => {
    btn.classList.toggle("active", String(btn.dataset.themeOption || "") === mode);
  });
}

/** IDs cortos locales (no usar para filas que sincronizan a PostgreSQL con `::uuid`; usar `newUuidV4`). */
function uid() {
  return Math.random().toString(36).slice(2, 11);
}

/** UUID v4 para entidades que persisten en PostgreSQL (empresas, etc.). */
function newUuidV4() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidString(value) {
  return typeof value === "string" && UUID_V4_RE.test(value.trim());
}

/**
 * Registro teléfono: países principales (Colombia siempre primero = opción por defecto).
 * `flag`: sufijo CSS `.register-lang-flag--*` (gradientes locales, sin red).
 */
const REGISTER_PHONE_COUNTRIES = [
  { id: "CO", label: "Colombia", dial: "57", minNat: 10, maxNat: 10, style: "co", flag: "co" },
  { id: "MX", label: "México", dial: "52", minNat: 10, maxNat: 10, style: "generic", flag: "mx" },
  { id: "US", label: "Estados Unidos", dial: "1", minNat: 10, maxNat: 10, style: "generic", flag: "us" },
  { id: "EC", label: "Ecuador", dial: "593", minNat: 9, maxNat: 9, style: "generic", flag: "ec" },
  { id: "PE", label: "Perú", dial: "51", minNat: 9, maxNat: 9, style: "generic", flag: "pe" },
  { id: "CL", label: "Chile", dial: "56", minNat: 9, maxNat: 9, style: "generic", flag: "cl" },
  { id: "AR", label: "Argentina", dial: "54", minNat: 10, maxNat: 10, style: "generic", flag: "ar" },
  { id: "BR", label: "Brasil", dial: "55", minNat: 10, maxNat: 11, style: "generic", flag: "br" },
  { id: "PA", label: "Panamá", dial: "507", minNat: 8, maxNat: 8, style: "generic", flag: "pa" },
  { id: "CR", label: "Costa Rica", dial: "506", minNat: 8, maxNat: 8, style: "generic", flag: "cr" },
  { id: "ES", label: "España", dial: "34", minNat: 9, maxNat: 9, style: "generic", flag: "es" },
  { id: "VE", label: "Venezuela", dial: "58", minNat: 10, maxNat: 10, style: "generic", flag: "ve" },
  { id: "GT", label: "Guatemala", dial: "502", minNat: 8, maxNat: 8, style: "generic", flag: "gt" },
  { id: "HN", label: "Honduras", dial: "504", minNat: 8, maxNat: 8, style: "generic", flag: "hn" }
];

const PHONE_UI_PRESETS = {
  register: {
    cc: ".js-register-phone-cc",
    nat: ".js-register-phone-national",
    flag: ".js-register-lang-flag",
    hintId: "register-phone-hint",
    full: ".js-register-phone-full"
  },
  b2b: {
    cc: ".js-b2b-phone-cc",
    nat: ".js-b2b-phone-national",
    flag: ".js-b2b-lang-flag",
    hintId: "b2b-phone-hint",
    full: ".js-b2b-phone-full"
  }
};

function registerPhoneCountryOptionsHtml() {
  return REGISTER_PHONE_COUNTRIES.map((c, index) => {
    const escLabel = String(c.label || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");
    const selected = index === 0 ? " selected" : "";
    return `<option value="${c.id}" title="${escLabel}"${selected}>+${c.dial}</option>`;
  }).join("");
}

function getSelectedPhoneCountry(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return REGISTER_PHONE_COUNTRIES[0];
  const sel = form.querySelector(p.cc);
  const id = sel?.value || "CO";
  return REGISTER_PHONE_COUNTRIES.find((c) => c.id === id) || REGISTER_PHONE_COUNTRIES[0];
}

function formatGenericNationalDisplay(value, maxLen) {
  let d = String(value || "").replace(/\D/g, "").slice(0, maxLen);
  if (!d) return "";
  const parts = [];
  for (let i = 0; i < d.length; i += 3) {
    parts.push(d.slice(i, i + 3));
  }
  return parts.join(" ");
}

function stripDigitsForRegisterNational(raw, meta) {
  let d = String(raw || "").replace(/\D/g, "");
  const dial = meta.dial;
  if (d.startsWith(dial)) d = d.slice(dial.length);
  if (meta.style === "co") {
    if (d.startsWith("57")) d = d.slice(2);
    return d.slice(0, 10);
  }
  while (d.length > meta.maxNat && d.startsWith("0")) {
    d = d.slice(1);
  }
  return d.slice(0, meta.maxNat);
}

function updatePhoneFieldForCountry(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return;
  const meta = getSelectedPhoneCountry(form, presetKey);
  const nat = form.querySelector(p.nat);
  const wrap = nat?.closest(".phone-input-professional") || form.querySelector(".phone-input-professional");
  const ccSel = form.querySelector(p.cc);
  const langFlag = form.querySelector(p.flag);
  const hint = document.getElementById(p.hintId);
  if (langFlag) {
    const sfx = meta.flag || "co";
    const flagBase = presetKey === "b2b" ? "js-b2b-lang-flag" : "js-register-lang-flag";
    langFlag.className = `${flagBase} register-lang-flag register-lang-flag--${sfx}`;
    langFlag.setAttribute("title", meta.label);
  }
  if (ccSel) {
    ccSel.setAttribute("aria-label", `Indicativo +${meta.dial} (${meta.label})`);
  }
  if (wrap) {
    wrap.setAttribute(
      "aria-label",
      meta.id === "CO" ? "Teléfono celular Colombia" : `Teléfono ${meta.label}`
    );
  }
  if (hint) {
    hint.textContent =
      meta.style === "co"
        ? "Celular Colombia: 10 dígitos (empieza por 3)."
        : meta.minNat === meta.maxNat
          ? `Indicativo +${meta.dial}: ingrese ${meta.maxNat} dígitos del número local.`
          : `Indicativo +${meta.dial}: entre ${meta.minNat} y ${meta.maxNat} dígitos del número local.`;
  }
  if (nat) {
    nat.placeholder = meta.style === "co" ? "300 123 4567" : "Número local";
    const maxFormatted =
      meta.style === "co"
        ? 14
        : meta.maxNat + (Math.ceil(meta.maxNat / 3) - 1);
    nat.setAttribute("maxlength", String(maxFormatted));
  }
}

/** Formato fijo: +57 y máximo 10 dígitos nacionales (sin depender de slice(-10) que provocaba dígitos erróneos al editar). */
function formatColombianPhone(value) {
  let d = String(value || "").replace(/\D/g, "");
  if (d.startsWith("57")) d = d.slice(2);
  d = d.slice(0, 10);
  if (!d) return "";
  const segs = [];
  segs.push(d.slice(0, Math.min(3, d.length)));
  if (d.length > 3) segs.push(d.slice(3, Math.min(6, d.length)));
  if (d.length > 6) segs.push(d.slice(6, Math.min(8, d.length)));
  if (d.length > 8) segs.push(d.slice(8, 10));
  return `+57 ${segs.join(" ")}`.trim();
}

/** Solo parte nacional (10 dígitos), mismos grupos que formatColombianPhone sin +57. */
function formatColombianNationalDisplay(value) {
  let d = String(value || "").replace(/\D/g, "").slice(0, 10);
  if (!d) return "";
  const segs = [];
  segs.push(d.slice(0, Math.min(3, d.length)));
  if (d.length > 3) segs.push(d.slice(3, Math.min(6, d.length)));
  if (d.length > 6) segs.push(d.slice(6, Math.min(8, d.length)));
  if (d.length > 8) segs.push(d.slice(8, 10));
  return segs.join(" ");
}

function syncPhoneHiddenFull(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return;
  const nat = form.querySelector(p.nat);
  const hid = form.querySelector(p.full);
  if (!nat || !hid) return;
  const meta = getSelectedPhoneCountry(form, presetKey);
  let digits = stripDigitsForRegisterNational(nat.value, meta);
  if (meta.style === "co") {
    nat.value = digits ? formatColombianNationalDisplay(digits) : "";
    hid.value = digits ? formatColombianPhone("57" + digits) : "";
    return;
  }
  nat.value = digits ? formatGenericNationalDisplay(digits, meta.maxNat) : "";
  hid.value = digits ? `+${meta.dial} ${formatGenericNationalDisplay(digits, meta.maxNat)}` : "";
}

function clearFieldError(field) {
  if (!field) return;
  field.classList.remove("field-invalid");
  const label = field.closest("label");
  const error = label?.querySelector(".field-error");
  if (error) error.remove();
}

function setFieldError(field, message) {
  if (!field) return;
  const label = field.closest("label");
  if (!label) return;
  clearFieldError(field);
  field.classList.add("field-invalid");
  const hint = document.createElement("small");
  hint.className = "field-error";
  hint.textContent = message;
  label.appendChild(hint);
}

function initB2BFormExperience() {
  const form = nodes.b2bForm;
  if (!form) return;
  const panes = [...form.querySelectorAll("[data-step-pane]")];
  const chips = [...form.querySelectorAll("[data-step-chip]")];
  const actions = form.querySelector(".contact-step-actions");
  const prevBtn = form.querySelector("[data-step-prev]");
  const nextBtn = form.querySelector("[data-step-next]");
  const submitBtn = form.querySelector("[data-step-submit]");
  let currentStep = 0;

  const setStep = (index) => {
    currentStep = Math.max(0, Math.min(index, panes.length - 1));
    panes.forEach((pane, idx) => pane.classList.toggle("active", idx === currentStep));
    chips.forEach((chip, idx) => chip.classList.toggle("active", idx === currentStep));
    if (actions) {
      actions.classList.toggle("is-first", currentStep === 0);
      actions.classList.toggle("is-last", currentStep === panes.length - 1);
    }
    form.setAttribute("data-step-current", String(currentStep));
  };
  form.__setB2BStep = setStep;

  const validateStep = (index) => {
    const pane = panes[index];
    if (!pane) return true;
    const requiredFields = [...pane.querySelectorAll("input[required], select[required], textarea[required]")];
    let firstInvalid = null;
    requiredFields.forEach((field) => {
      const value = String(field.value || "").trim();
      if (!value) {
        setFieldError(field, "Este campo es obligatorio.");
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    return true;
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => setStep(currentStep - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      syncPhoneHiddenFull(form, "b2b");
      if (!validateStep(currentStep)) return;
      setStep(currentStep + 1);
    });
  }
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      syncPhoneHiddenFull(form, "b2b");
      if (!validateStep(currentStep)) return;
    });
  }

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    if (currentStep >= panes.length - 1) return;
    event.preventDefault();
    syncPhoneHiddenFull(form, "b2b");
    if (!validateStep(currentStep)) return;
    setStep(currentStep + 1);
  });

  setStep(0);

  const ccB2b = form.querySelector(".js-b2b-phone-cc");
  if (ccB2b && ccB2b.options.length === 0) {
    ccB2b.innerHTML = registerPhoneCountryOptionsHtml();
  }
  const b2bPhoneNat = form.querySelector(".js-b2b-phone-national");
  const b2bPhoneCc = form.querySelector(".js-b2b-phone-cc");
  if (b2bPhoneNat) {
    b2bPhoneNat.addEventListener("input", () => {
      syncPhoneHiddenFull(form, "b2b");
      clearFieldError(b2bPhoneNat);
    });
  }
  if (b2bPhoneCc) {
    b2bPhoneCc.addEventListener("change", () => {
      clearFieldError(b2bPhoneNat);
      updatePhoneFieldForCountry(form, "b2b");
      syncPhoneHiddenFull(form, "b2b");
    });
  }
  updatePhoneFieldForCountry(form, "b2b");
  syncPhoneHiddenFull(form, "b2b");

  const emailInput = form.querySelector("input[name='email']");
  const messageInput = form.querySelector("textarea[name='message']");
  const volumeInput = form.querySelector("input[name='monthlyVolumeKg']");

  if (emailInput) {
    emailInput.addEventListener("input", () => clearFieldError(emailInput));
  }
  if (messageInput) {
    messageInput.addEventListener("input", () => clearFieldError(messageInput));
  }
  if (volumeInput) {
    volumeInput.addEventListener("input", () => clearFieldError(volumeInput));
  }

  form.querySelectorAll("input,select,textarea").forEach((field) => {
    field.addEventListener("change", () => clearFieldError(field));
  });
}

function nowIso() {
  return colombiaNowIso();
}

function nowLocalIso() {
  return colombiaNowIso().slice(0, 19);
}

function getColombiaDateParts(dateValue = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(dateValue);
  const pick = (type) => parts.find((part) => part.type === type)?.value || "00";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second")
  };
}

function colombiaNowIso() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}-05:00`;
}

function colombiaTodayIsoDate() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

/** Año calendario después de una fecha `YYYY-MM-DD` (p. ej. vencimiento SOAT un año tras expedición). */
function addCalendarYearsIsoDate(isoDateStr, years = 1) {
  const raw = String(isoDateStr || "").trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return "";
  const n = Number(years);
  const deltaYears = Number.isFinite(n) && n !== 0 ? n : 1;
  dt.setFullYear(dt.getFullYear() + deltaYears);
  const oy = dt.getFullYear();
  const om = String(dt.getMonth() + 1).padStart(2, "0");
  const od = String(dt.getDate()).padStart(2, "0");
  return `${oy}-${om}-${od}`;
}

/** SOAT y tecnomecánica: al cambiar fecha de expedición, sugerir vencimiento un año después. */
function bindVehicleDocExpiryAutoFill(formEl) {
  if (!formEl || typeof formEl.querySelector !== "function") return;
  const soatExpEl = formEl.querySelector("input[name='soatExpeditionDate']");
  const soatVenEl = formEl.querySelector("input[name='soatExpiryDate']");
  if (soatExpEl && soatVenEl) {
    const syncSoat = () => {
      const next = addCalendarYearsIsoDate(soatExpEl.value, 1);
      if (next) soatVenEl.value = next;
    };
    soatExpEl.addEventListener("change", syncSoat);
    soatExpEl.addEventListener("blur", syncSoat);
  }
  const techExpEl = formEl.querySelector("input[name='techInspectionExpeditionDate']");
  const techVenEl = formEl.querySelector("input[name='techInspectionExpiryDate']");
  if (techExpEl && techVenEl) {
    const syncTech = () => {
      const next = addCalendarYearsIsoDate(techExpEl.value, 1);
      if (next) techVenEl.value = next;
    };
    techExpEl.addEventListener("change", syncTech);
    techExpEl.addEventListener("blur", syncTech);
  }
}

/** Valor para `input type="datetime-local"` (sin offset): misma pared de reloj que America/Bogota. */
function colombiaDatetimeLocalString(dateValue = new Date()) {
  const p = getColombiaDateParts(dateValue);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function buildColombiaOffsetDateTime(datePart, timePart) {
  const date = String(datePart || "").trim();
  const time = String(timePart || "").trim();
  if (!date || !time) return "";
  return `${date}T${time}:00-05:00`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/** Para persistencia en BD/sincronización: sin tildes; ñ → n (ASCII estable). */
function normalizeLatinForDb(value) {
  if (value == null) return "";
  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N");
}

/**
 * Teléfono en admin edición / alta usuario / perfil: acepta +57, espacios y separadores.
 * Quita el patrón HTML solo-dígitos que bloqueaba "+57 …".
 * — Colombia: 10 dígitos nacionales o prefijo 57 + 10 → guarda "+57 XXX XXX XX XX".
 * — Otros: si solo dígitos y longitud internacional típica → "+…".
 */
function normalizePortalPhoneForStorage(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return "";
  const d = trimmed.replace(/\D/g, "");
  if (!d) return trimmed.replace(/\s+/g, " ").trim();

  let national = d;
  if (d.startsWith("57") && d.length >= 11) {
    national = d.slice(2);
  }

  if (/^\d{10}$/.test(national)) {
    const n = national;
    return `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
  }

  if (d.startsWith("57")) {
    return `+${d}`;
  }

  if (/^\d{11,15}$/.test(d)) {
    return `+${d}`;
  }

  return trimmed.replace(/\s+/g, " ").trim();
}

/** Listados y tarjetas: mismo criterio que al guardar cuando solo hay dígitos (p. ej. fijo medellín → +57 …). */
function formatPortalPhoneForDisplay(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const normalized = normalizePortalPhoneForStorage(s);
  return normalized && /\d/.test(normalized) ? normalized : s;
}

/** Nombres, cargo, dirección, etc.: mayúsculas + sin tildes (uniforme en BD y listados). No usar en correo/contraseña ni en valores de catálogo (departamento/ciudad). */
function normalizeLatinUpperForDb(value) {
  return normalizeLatinForDb(value).toUpperCase();
}

/** tipo_persona siempre "Natural" | "Juridica": una sola forma al persistir; las consultas usan = sin LOWER(). */
function normalizePersonTypeForDb(value) {
  const k = normalizeLatinForDb(value).toLowerCase();
  if (k === "juridica") return "Juridica";
  return "Natural";
}

/** tipo_vinculo_registro / registrationKind: siempre "cliente" | "empleado_interno". */
function normalizeRegistrationKindForDb(value) {
  const k = String(value || "")
    .trim()
    .toLowerCase();
  return k === "empleado_interno" ? "empleado_interno" : "cliente";
}

/** empresas.tipo_relacion_empresa / companyKind: cliente | tercero | propia */
function normalizeCompanyKindForDb(value) {
  const k = String(value || "")
    .trim()
    .toLowerCase();
  if (k === "tercero") return "tercero";
  if (k === "propia") return "propia";
  return "cliente";
}

function companyKindLabel(kind) {
  const k = normalizeCompanyKindForDb(kind);
  if (k === "propia") return "Empresa propia (Antares)";
  if (k === "tercero") return "Tercero";
  return "Cliente";
}

/** Chip en tarjetas (`.role-chip` fuerza mayúsculas); texto corto para no desalinear la cabecera. */
function companyKindChipShortLabel(kind) {
  const k = normalizeCompanyKindForDb(kind);
  if (k === "propia") return "Propia";
  if (k === "tercero") return "Tercero";
  return "Cliente";
}

function isCompanyRecordActive(c) {
  return c && c.active !== false;
}

function companyKindChipHtml(kind) {
  const k = normalizeCompanyKindForDb(kind);
  const colors = { cliente: "#0E7490", tercero: "#7C3AED", propia: "#377cc0" };
  return `<span class="role-chip company-kind-chip" style="--role-color:${colors[k] || "#64748B"}">${escapeHtml(companyKindChipShortLabel(k))}</span>`;
}

/**
 * Una sola fila con nombre canónico "antares" como cliente y sin otra empresa "propia":
 * se interpreta como operador (misma semántica que tipo_relacion propia en BD).
 */
function patchOperatorCompanyKindIfNeeded(companies) {
  if (!Array.isArray(companies) || companies.length === 0) return companies;
  const normName = (n) =>
    normalizeLatinForDb(String(n || ""))
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  const antaresRows = companies.filter((c) => normName(c.name) === "antares");
  if (antaresRows.length !== 1) return companies;
  const hasPropia = companies.some((c) => normalizeCompanyKindForDb(c.companyKind) === "propia");
  if (hasPropia) return companies;
  const targetId = String(antaresRows[0].id ?? "");
  return companies.map((c) => {
    if (String(c.id ?? "") !== targetId) return c;
    if (normalizeCompanyKindForDb(c.companyKind) !== "cliente") return c;
    return { ...c, companyKind: "propia" };
  });
}

function isPersonTypeJuridica(value) {
  return normalizePersonTypeForDb(value) === "Juridica";
}

function validatePasswordPolicy(password) {
  const p = String(password || "");
  if (p.length < 10) return { ok: false, key: "passwordPolicyLength" };
  if (!/[a-z]/.test(p)) return { ok: false, key: "passwordPolicyLower" };
  if (!/[A-Z]/.test(p)) return { ok: false, key: "passwordPolicyUpper" };
  if (!/[0-9]/.test(p)) return { ok: false, key: "passwordPolicyDigit" };
  if (!/[^A-Za-z0-9]/.test(p)) return { ok: false, key: "passwordPolicySpecial" };
  return { ok: true };
}

function getPasswordStrengthReport(password) {
  const p = String(password || "");
  const checks = [
    { rule: "len", ok: p.length >= 10 },
    { rule: "lower", ok: /[a-z]/.test(p) },
    { rule: "upper", ok: /[A-Z]/.test(p) },
    { rule: "digit", ok: /[0-9]/.test(p) },
    { rule: "special", ok: /[^A-Za-z0-9]/.test(p) }
  ];
  const met = checks.filter((c) => c.ok).length;
  const pct = Math.round((met / 5) * 100);
  let tier = "weak";
  if (pct >= 80) tier = "strong";
  else if (pct >= 60) tier = "good";
  else if (pct >= 40) tier = "fair";
  let headline = "Indique una contraseña segura";
  if (p.length > 0) {
    if (met === 5) headline = "Excelente: cumple todos los requisitos";
    else if (met === 4) headline = "Muy buena: falta un detalle";
    else if (met === 3) headline = "Media: refuerce los puntos pendientes";
    else if (met >= 1) headline = "Débil: complete más requisitos";
    else headline = "Muy débil: siga las indicaciones";
  }
  return { pct, tier, met, checks, headline };
}

/** Panel de fortaleza (barra, píldora %, checklist). El contenedor incluye .password-strength-bar-fill, .password-strength-pill, .password-strength-headline, .password-rule-grid li[data-rule]. */
function bindPasswordStrengthSuite(passInput, container) {
  if (!passInput || !container) return;
  const fill = container.querySelector(".password-strength-bar-fill");
  const pill = container.querySelector(".password-strength-pill");
  const headline = container.querySelector(".password-strength-headline");
  const bar = container.querySelector(".password-strength-bar");
  const rules = [...container.querySelectorAll(".password-rule-grid li[data-rule]")];
  const sync = () => {
    const r = getPasswordStrengthReport(passInput.value);
    const active = passInput.value.length > 0;
    const complete = r.met === 5;
    if (fill) {
      fill.style.width = `${r.pct}%`;
      fill.className = `password-strength-bar-fill password-strength-bar-fill--${r.tier}`;
    }
    if (bar) {
      bar.setAttribute("aria-valuenow", String(r.pct));
      bar.classList.toggle("password-strength-bar--active", active);
      bar.classList.toggle("password-strength-bar--complete", complete);
    }
    if (pill) {
      pill.textContent = `${r.pct}%`;
      pill.className = `password-strength-pill password-strength-pill--${r.tier}`;
    }
    if (headline) headline.textContent = r.headline;
    for (const li of rules) {
      const key = li.getAttribute("data-rule");
      const ok = r.checks.find((c) => c.rule === key)?.ok;
      li.classList.toggle("password-rule-met", Boolean(ok));
    }
  };
  passInput.addEventListener("input", sync);
  sync();
}

async function hashPassword(raw) {
  const input = String(raw || "");
  if (!input) return "";
  if (input.startsWith("sha256:")) return input;
  if (!window.crypto?.subtle) return `sha256:${btoa(input)}`;
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${hex}`;
}

async function verifyPassword(raw, storedHash) {
  if (!String(storedHash || "").startsWith("sha256:")) {
    return String(raw || "") === String(storedHash || "");
  }
  const hashed = await hashPassword(raw);
  return hashed === storedHash;
}

function readCounters() {
  return read(KEYS.counters, {});
}

function nextCounter(prefix) {
  const counters = readCounters();
  const current = Number(counters[prefix] || 0) + 1;
  counters[prefix] = current;
  write(KEYS.counters, counters);
  return current;
}

function makeRequestNumber(existingNumbers = new Set()) {
  let code = `SOL-${String(nextCounter("request")).padStart(6, "0")}`;
  while (existingNumbers.has(code)) {
    code = `SOL-${String(nextCounter("request")).padStart(6, "0")}`;
  }
  return code;
}

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO", { timeZone: CO_TIMEZONE });
}

function addYears(dateValue, years) {
  const d = new Date(dateValue);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function daysUntil(dateValue) {
  const target = new Date(dateValue).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((target - now) / 86400000);
}

function docExpiryStatus(expeditionDate) {
  if (!expeditionDate) return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  const expiresAt = addYears(expeditionDate, 1);
  const days = daysUntil(expiresAt);
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)} dias`, cls: "status-rechazada", days, expiresAt };
  if (days <= 30) return { label: `Por vencer (${days} dias)`, cls: "status-pendiente", days, expiresAt };
  return { label: `Vigente (${days} dias)`, cls: "status-viaje_asignado", days, expiresAt };
}

function formatRoute(request) {
  const origin = `${request.originDepartment ? `${request.originDepartment}, ` : ""}${request.originCity || "-"}`;
  const destination = `${request.destinationDepartment ? `${request.destinationDepartment}, ` : ""}${request.destinationCity || "-"}`;
  return `${origin} → ${destination}`;
}

function toInputDate(isoDate) {
  if (!isoDate) return "";
  const p = getColombiaDateParts(new Date(isoDate));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function routeRateKeyFromRequest(request) {
  const origin = `${String(request?.originDepartment || "").trim()}|${String(request?.originCity || "").trim()}`.toLowerCase();
  const destination = `${String(request?.destinationDepartment || "").trim()}|${String(request?.destinationCity || "").trim()}`.toLowerCase();
  return `${origin}->${destination}`;
}

function buildTripRouteRateKey(originDepartment, originCity, destinationDepartment, destinationCity) {
  const origin = `${String(originDepartment || "").trim()}|${String(originCity || "").trim()}`.toLowerCase();
  const destination = `${String(destinationDepartment || "").trim()}|${String(destinationCity || "").trim()}`.toLowerCase();
  return `${origin}->${destination}`;
}

/** Separador entre clave de ruta y ámbito de empresas en almacenamiento local / sync */
const TRIP_RATE_SCOPE_SEP = "@@";

function tripRateStorageKey(routeKey, companyIds) {
  const ids = Array.isArray(companyIds) ? companyIds.map(String).filter(Boolean).sort() : [];
  const suffix = ids.length ? ids.join(",") : "*";
  return `${routeKey}${TRIP_RATE_SCOPE_SEP}${suffix}`;
}

function getTripRouteRatesNormalized() {
  const raw = read(KEYS.tripRouteRates, {});
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  let needWrite = false;
  for (const [k, val] of Object.entries(raw)) {
    if (typeof val === "number" && Number.isFinite(val)) {
      if (!k.includes(TRIP_RATE_SCOPE_SEP)) {
        out[`${k}${TRIP_RATE_SCOPE_SEP}*`] = { value: val, companyIds: [] };
        needWrite = true;
      } else {
        out[k] = { value: val, companyIds: [] };
      }
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      const v = parseNum(val.value ?? 0);
      if (v <= 0) continue;
      const ids = Array.isArray(val.companyIds) ? val.companyIds.map(String).filter(Boolean) : [];
      if (!k.includes(TRIP_RATE_SCOPE_SEP)) {
        const suffix = ids.length ? ids.slice().sort().join(",") : "*";
        out[`${k}${TRIP_RATE_SCOPE_SEP}${suffix}`] = { value: v, companyIds: ids };
        needWrite = true;
      } else {
        out[k] = { value: v, companyIds: ids };
      }
    }
  }
  if (needWrite) write(KEYS.tripRouteRates, out);
  return out;
}

function getConfiguredTripValue(request) {
  const rates = getTripRouteRatesNormalized();
  const rk = routeRateKeyFromRequest(request);
  const cid = String(request?.clientCompanyId || "").trim();
  let bestSpecific = 0;
  let bestGlobal = 0;
  for (const [fullKey, entry] of Object.entries(rates)) {
    const sepIdx = fullKey.lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routePart = sepIdx === -1 ? fullKey : fullKey.slice(0, sepIdx);
    if (routePart !== rk) continue;
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    if (!ids.length) {
      if (v > bestGlobal) bestGlobal = v;
    } else if (cid && ids.includes(cid)) {
      if (v > bestSpecific) bestSpecific = v;
    }
  }
  return bestSpecific > 0 ? bestSpecific : bestGlobal;
}

/** Opciones de tarifa guardadas que coinciden con la ruta de la solicitud (misma clave origen→destino). */
function listTripRateOptionsForRequest(request) {
  const rates = getTripRouteRatesNormalized();
  const rk = routeRateKeyFromRequest(request);
  const cid = String(request?.clientCompanyId || "").trim();
  const items = [];
  for (const [storageKey, entry] of Object.entries(rates)) {
    const sepIdx = storageKey.lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routePart = sepIdx === -1 ? storageKey : storageKey.slice(0, sepIdx);
    if (routePart !== rk) continue;
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    const scopeLabel = ids.length
      ? ids.map((id) => getCompanyById(id)?.name || id).join(", ")
      : "Todos los clientes";
    const appliesToRequest = !ids.length || (cid && ids.includes(cid));
    items.push({ storageKey, value: v, scopeLabel, appliesToRequest });
  }
  items.sort((a, b) => {
    if (a.appliesToRequest !== b.appliesToRequest) return a.appliesToRequest ? -1 : 1;
    if (b.value !== a.value) return b.value - a.value;
    return String(a.storageKey).localeCompare(String(b.storageKey));
  });
  return items;
}

function defaultTripRateStorageKeyForRequest(request) {
  const items = listTripRateOptionsForRequest(request);
  const pref = items.find((i) => i.appliesToRequest);
  return pref ? pref.storageKey : items.length ? items[0].storageKey : "";
}

function initialTripValueForAssignment(request, preferredStorageKey) {
  const rates = getTripRouteRatesNormalized();
  if (preferredStorageKey && rates[preferredStorageKey]) {
    const v = parseNum(rates[preferredStorageKey].value);
    if (v > 0) return v;
  }
  const cfg = getConfiguredTripValue(request);
  if (cfg > 0) return cfg;
  return parseNum(request.tripValue || 0);
}

/** Enlaza el selector de tarifa con el campo numérico de precio en el modal de asignación. */
function wireTripRateChoiceSelect(formEl) {
  const sel = formEl.querySelector("select[name='tripRateChoice']");
  const num = formEl.querySelector("input[name='tripValue']");
  if (!sel || !num) return;
  sel.addEventListener("change", () => {
    const key = String(sel.value || "").trim();
    if (!key) return;
    const rates = getTripRouteRatesNormalized();
    const entry = rates[key];
    if (entry && parseNum(entry.value) > 0) num.value = String(parseNum(entry.value));
  });
}

function slugStatus(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(" ", "_");
}

/** Campos de precio con selector de tarifa por trayecto (si hay) + valor editable. */
function buildTripRateModalFields(request, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const required = !!o.required;
  const items = listTripRateOptionsForRequest(request);
  const defaultKey = defaultTripRateStorageKeyForRequest(request);
  const initial = initialTripValueForAssignment(request, defaultKey);
  const fallbackVal = initial > 0 ? initial : parseNum(request?.tripValue || 0);

  if (!items.length) {
    return {
      fields: [
        {
          name: "tripValue",
          label: "Precio del viaje (COP)",
          type: "number",
          required,
          value: fallbackVal
        }
      ]
    };
  }

  const selectOptions = [
    { value: "", label: "Manual / sin elegir tarifa del catalogo" },
    ...items.map((i) => ({
      value: i.storageKey,
      label: `$${parseNum(i.value).toLocaleString("es-CO")} · ${i.scopeLabel}${i.appliesToRequest ? "" : " (otro cliente / alcance)"}`
    }))
  ];

  return {
    fields: [
      {
        name: "tripRateChoice",
        label: "Tarifa por trayecto (opcional)",
        type: "select",
        required: false,
        value: defaultKey || "",
        options: selectOptions
      },
      {
        name: "tripValue",
        label: "Precio del viaje (COP) · editable",
        type: "number",
        required,
        value: fallbackVal
      }
    ],
    afterMount: (formEl) => wireTripRateChoiceSelect(formEl)
  };
}

function prettyStatus(status, scope = "general") {
  const key = slugStatus(status);
  const iconMap = {
    pendiente: IC.clock,
    aprobada_pendiente_asignacion: IC.inbox,
    viaje_asignado: scope === "request" ? IC.truck : IC.check,
    en_transito: IC.truck,
    espera_standby: IC.clock,
    completada: IC.check,
    cerrada: IC.briefcase,
    cancelada: IC.x,
    rechazada: IC.x
  };
  const icon = iconMap[key] || IC.activity;
  const road = scope === "request" && (key === "viaje_asignado" || key === "en_transito");
  return `<span class="status-pretty status-${key} ${road ? "status-road" : ""}">${icon}<span>${status}</span></span>`;
}

function fieldLabel(icon, text, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const mark = o.required
    ? '<span class="field-required-mark" aria-hidden="true" title="Obligatorio">*</span>'
    : "";
  return `<span class="field-label">${icon}<span>${text}</span>${mark}</span>`;
}

function departmentOptions(selected = "") {
  return Object.keys(COLOMBIA_LOCATIONS)
    .map((dept) => `<option value="${dept}" ${dept === selected ? "selected" : ""}>${dept}</option>`)
    .join("");
}

function cityOptionsFromDepartment(department = "", selectedCity = "") {
  const cities = COLOMBIA_LOCATIONS[String(department || "")] || [];
  return cities
    .map((city) => `<option value="${city}" ${city === selectedCity ? "selected" : ""}>${city}</option>`)
    .join("");
}

function attachDepartmentCitySelects(form, {
  departmentSelector = "select[name='department']",
  citySelector = "select[name='city']",
  initialDepartment = "",
  initialCity = ""
} = {}) {
  if (!form) return;
  const deptSelect = form.querySelector(departmentSelector);
  const citySelect = form.querySelector(citySelector);
  if (!deptSelect || !citySelect) return;

  const fill = (dept, preferredCity = "") => {
    const cities = COLOMBIA_LOCATIONS[String(dept || "")] || [];
    citySelect.innerHTML = `<option value="">Seleccione...</option>${cities
      .map((c) => `<option value="${c}" ${c === preferredCity ? "selected" : ""}>${c}</option>`)
      .join("")}`;
  };

  const startDept = String(deptSelect.value || initialDepartment || "");
  if (startDept) {
    deptSelect.value = startDept;
    fill(startDept, String(citySelect.value || initialCity || ""));
  } else {
    citySelect.innerHTML = `<option value="">Seleccione un departamento...</option>`;
  }
  deptSelect.addEventListener("change", () => fill(deptSelect.value, ""));
}

function saveNotification({ userId, title, body }) {
  const all = read(KEYS.notifications, []);
  all.unshift({ id: newUuidV4(), userId, title, body, createdAt: nowIso(), readAt: null });
  write(KEYS.notifications, all);
}

function notifyHrUsers(title, body) {
  read(KEYS.users, [])
    .filter((u) => canAccessRRHH(u.role))
    .forEach((u) => saveNotification({ userId: u.id, title, body }));
}

function sendEmail({ to, subject, body }) {
  const outbox = read(KEYS.emails, []);
  outbox.unshift({ id: newUuidV4(), to, subject, body, createdAt: nowIso() });
  write(KEYS.emails, outbox);
}

/**
 * URL de retorno tras recuperar contraseña (sin hash ni query). En producción use __PORTAL_PUBLIC_ORIGIN__
 * en antares.public.js para que el correo no apunte a localhost.
 */
function buildSupabasePasswordRecoveryRedirectUrl() {
  const configured = String(window.__PORTAL_PUBLIC_ORIGIN__ || "").trim().replace(/\/+$/, "");
  if (configured && /^https?:\/\//i.test(configured)) {
    return `${configured}/`;
  }
  const u = new URL(window.location.href);
  u.hash = "";
  u.search = "";
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host === "::1"
  ) {
    return "https://www.transportesantares.co/";
  }
  return u.toString();
}

function stripSupabaseAuthHashFromUrl() {
  const u = new URL(window.location.href);
  if (!u.hash || u.hash.length < 2) return;
  u.hash = "";
  history.replaceState(null, "", u.toString());
}

function scheduleStripSupabaseRecoveryHash(delayMs = 400) {
  window.setTimeout(() => {
    try {
      stripSupabaseAuthHashFromUrl();
    } catch (_e) {}
  }, delayMs);
}

async function waitForAntaresSupabaseClient(timeoutMs) {
  const cap = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 15000;
  if (window.antaresSupabase) return window.antaresSupabase;
  const ready = window.antaresSupabaseReady;
  if (!ready || typeof ready.then !== "function") return null;
  return await Promise.race([
    ready.then(() => window.antaresSupabase || null),
    new Promise((resolve) => {
      setTimeout(() => resolve(window.antaresSupabase || null), cap);
    })
  ]);
}

/** Escucha enlace de recuperación Supabase y abre el modal con el formulario de nueva contraseña. */
function wireSupabasePasswordRecoveryUi() {
  if (window.__antaresSupabaseRecoveryWired) return;
  window.__antaresSupabaseRecoveryWired = true;

  function enterRecoveryFlowFromStorage() {
    try {
      if (sessionStorage.getItem("antares_pw_recovery_pending") !== "1") return false;
      sessionStorage.removeItem("antares_pw_recovery_pending");
      state.authSupabaseRecovery = true;
      showAuth();
      renderAuthTab();
      scheduleStripSupabaseRecoveryHash(300);
      return true;
    } catch (_e) {
      return false;
    }
  }

  enterRecoveryFlowFromStorage();

  window.addEventListener("antares:supabase-password-recovery", () => {
    try {
      sessionStorage.setItem("antares_pw_recovery_pending", "1");
    } catch (_s) {}
    state.authSupabaseRecovery = true;
    showAuth();
    renderAuthTab();
    scheduleStripSupabaseRecoveryHash(500);
  });

  void waitForAntaresSupabaseClient(20000).then((client) => {
    if (!client) {
      enterRecoveryFlowFromStorage();
      return;
    }
    void client.auth.getSession().then(({ data }) => {
      const session = data?.session;
      const hash = String(window.location.hash || "");
      const recoveryUrl = /type=recovery/i.test(hash);
      let pending = false;
      try {
        pending = sessionStorage.getItem("antares_pw_recovery_pending") === "1";
      } catch (_e) {
        pending = false;
      }
      if (session && (recoveryUrl || pending)) {
        state.authSupabaseRecovery = true;
        showAuth();
        renderAuthTab();
        try {
          sessionStorage.removeItem("antares_pw_recovery_pending");
        } catch (_e2) {}
        scheduleStripSupabaseRecoveryHash(400);
        return;
      }
      enterRecoveryFlowFromStorage();
    });
  });
}

function findOrCreateCompanyIdByName(name) {
  const companyName = String(name || "").trim();
  if (!companyName) return null;
  const companies = read(KEYS.companies, []);
  const existing = companies.find(
    (item) => item.name.toLowerCase() === companyName.toLowerCase()
  );
  if (existing) return existing.id;
  const company = {
    id: newUuidV4(),
    name: companyName,
    taxId: "",
    nit: "",
    phone: "",
    companyKind: "cliente",
    active: true,
    createdAt: nowIso()
  };
  companies.push(company);
  write(KEYS.companies, companies);
  return company.id;
}

function getCompanyById(companyId) {
  return read(KEYS.companies, []).find((item) => item.id === companyId) || null;
}

function companySelectOptions(selectedId = "") {
  const sel = String(selectedId || "").trim();
  return read(KEYS.companies, [])
    .filter((company) => isCompanyRecordActive(company) || String(company.id) === sel)
    .map(
      (company) =>
        `<option value="${company.id}" ${String(company.id) === sel ? "selected" : ""}>${escapeHtml(String(company.name || ""))} (${escapeHtml(companyKindLabel(company.companyKind))})</option>`
    )
    .join("");
}

function getActivePositions() {
  return read(KEYS.positions, []).filter((p) => p.active !== false);
}

function getPositionById(positionId) {
  return read(KEYS.positions, []).find((item) => item.id === positionId) || null;
}

function positionSelectOptions(selectedId = "") {
  return getActivePositions()
    .map((position) => `<option value="${position.id}" ${position.id === selectedId ? "selected" : ""}>${position.name} · $${parseNum(position.baseSalary).toLocaleString("es-CO")}</option>`)
    .join("");
}

function ensureCompaniesAndUserMapping() {
  const companies = read(KEYS.companies, []);
  const users = read(KEYS.users, []);

  let nextCompanies = [...companies];

  const companyByName = (name) =>
    nextCompanies.find(
      (company) => company.name.toLowerCase() === String(name || "").toLowerCase()
    );

  const mappedUsers = users.map((user) => {
    if (user.companyId) return user;
    const existing = companyByName(user.company);
    if (existing) return { ...user, companyId: existing.id };
    const created = {
      id: newUuidV4(),
      name: user.company || "Empresa sin nombre",
      taxId: user.taxId || "",
      nit: user.taxId || "",
      phone: user.phone || "",
      companyKind: "cliente",
      active: true,
      createdAt: nowIso()
    };
    nextCompanies.push(created);
    return { ...user, companyId: created.id };
  });

  write(KEYS.companies, nextCompanies);
  write(KEYS.users, mappedUsers);
}

function ensureRequestsCompanyMapping() {
  const users = read(KEYS.users, []);
  const requests = reqRead();
  const mapped = requests.map((request) => {
    if (request.clientCompanyId) return request;
    const owner = users.find((user) => user.id === request.clientUserId);
    return {
      ...request,
      clientCompanyId: owner?.companyId || null,
      requestedByName: request.requestedByName || owner?.name || request.clientName
    };
  });
  reqWrite(mapped);
}

function ensureRequestAndTripIdentifiers() {
  const requests = reqRead();
  let changed = false;
  const usedRequestNumbers = new Set(requests.map((r) => String(r.requestNumber || "").trim()).filter(Boolean));
  const usedTripNumbers = new Set(
    requests.map((r) => String(r.trip?.tripNumber || "").trim()).filter(Boolean)
  );
  const mapped = requests.map((request) => {
    const next = { ...request };
    if (!next.requestNumber) {
      next.requestNumber = makeRequestNumber(usedRequestNumbers);
      usedRequestNumbers.add(next.requestNumber);
      changed = true;
    }
    if (next.trip && !next.trip.tripNumber) {
      const tripNumber = makeTripNumber(usedTripNumbers);
      usedTripNumbers.add(tripNumber);
      next.trip = { ...next.trip, tripNumber };
      changed = true;
    }
    return next;
  });
  if (changed) reqWrite(mapped);
}

function defaultPermissionsForRole(role) {
  if (role === ROLES.ADMIN) return [...ALL_PERMISSIONS];
  if ([ROLES.RRHH, ROLES.ADMINISTRACION, ROLES.LIDER_ADMINISTRATIVO].includes(role)) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.SST_COMPLIANCE,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  if (role === ROLES.AUXILIAR_ADMINISTRATIVO) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  return [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLIENT_REQUESTS,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW
  ];
}

function ensureUsersPermissions() {
  const users = read(KEYS.users, []);
  const updated = users.map((user) => {
    const current = Array.isArray(user.permissions) ? user.permissions : [];
    const base = defaultPermissionsForRole(user.role);
    const merged = [...new Set([...base, ...current])].filter((permission) =>
      ALL_PERMISSIONS.includes(permission)
    );
    return { ...user, permissions: merged };
  });
  write(KEYS.users, updated);
}

function ensureUsersAccountStatus() {
  const users = read(KEYS.users, []);
  const serverBacked = Boolean(window.AntaresApi?.isConfigured?.() && window.AntaresApi?.getBase?.());
  let changed = false;
  const updated = users.map((user) => {
    const raw = user.accountStatus;
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") return user;
    if (serverBacked) {
      return user;
    }
    changed = true;
    return { ...user, accountStatus: ACCOUNT_STATUS.APROBADO };
  });
  if (changed) write(KEYS.users, updated);
}

async function queueApproval({ type, title, payload, requestedByUserId, requestedByName }) {
  const approvals = read(KEYS.approvals, []);
  approvals.unshift({
    id: newUuidV4(),
    type,
    title,
    payload,
    status: "pendiente",
    requestedByUserId,
    requestedByName,
    requestedAt: nowIso(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: ""
  });
  try {
    await writeAwaitServer(KEYS.approvals, approvals);
  } catch (_e) {}
  const admins = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
  admins.forEach((admin) => {
    saveNotification({
      userId: admin.id,
      title: "Nueva autorización pendiente",
      body: `${title} solicitada por ${requestedByName}.`
    });
  });
  try {
    await writeAwaitServer(KEYS.notifications, read(KEYS.notifications, []));
  } catch (_e) {}
}

/** Metadatos UI: cola de autorizaciones agrupada por ambito operativo (ver también queueApproval). */
const APPROVAL_TYPE_META = {
  create_user: { sectionKey: "portal_access", label: "Alta de usuario del portal" },
  create_driver: { sectionKey: "transport_fleet", label: "Alta de conductor" },
  create_employee: { sectionKey: "workforce", label: "Alta de colaborador (gestión humana)" },
  register_hr_absence: { sectionKey: "hr_absences", label: "Registro de ausencia o incapacidad" },
  mark_payroll_paid: { sectionKey: "payroll_pay", label: "Confirmar pago de liquidación" },
  approve_trip_request: { sectionKey: "misc", label: "Solicitud de transporte pendiente (historico en cola)" }
};

const APPROVAL_UI_BLOCKS = [
  {
    key: "portal_access",
    kind: "queue",
    title: "Acceso y usuarios del portal",
    description:
      "Creación de cuentas que un operador sin rol administrador registra en el módulo de usuarios. Al aprobar, el sistema materializa el usuario, permisos y empresa asociada.",
    origin: "Usuarios y permisos → nuevo usuario (no administrador)"
  },
  {
    key: "transport_fleet",
    kind: "queue",
    title: "Conductores y flota operativa",
    description:
      "Alta de conductor solicitada por un perfil que no es administrador. Al aprobar, se crea el conductor disponible para asignación y, si aplica, el registro vinculado en gestión humana.",
    origin: "Conductores → nuevo registro (no administrador)"
  },
  {
    key: "workforce",
    kind: "queue",
    title: "Talento, contratación y gestión humana",
    description:
      "Ingreso de colaborador al expediente de personal cuando quien registra no es administrador. Incluye datos contractuales, seguridad social y desempeño del flujo de aprobación previo a la ficha activa.",
    origin: "Gestión humana → nuevo empleado (no administrador)"
  },
  {
    key: "hr_absences",
    kind: "queue",
    title: "Ausencias, incapacidades y SST",
    description:
      "Registro formal de ausencia cuando quien carga el dato tiene rol de Recursos Humanos, Administración, Auxiliar administrativo o Líder administrativo. El administrador valida antes de dejar constancia.",
    origin: "Cumplimiento laboral y SST → registro de ausencia (roles RRHH / administrativos)"
  },
  {
    key: "payroll_pay",
    kind: "queue",
    title: "Liquidación y marcas de pago",
    description:
      "Marcar liquidación de nómina como pagada cuando la acción la inicia un perfil RRHH o administrativo (no administrador de sistema). Evita cierres contables sin doble validación.",
    origin: "Gestión humana → marcar liquidación pagada (roles RRHH / administrativos)"
  }
];

function approvalTypeLabel(type) {
  return APPROVAL_TYPE_META[type]?.label || type;
}

/** Referencias cortas para correlacionar colas en soporte (no sustituyen UUID completos en API). */
function shortAuthRefSegment(rawId) {
  const s = String(rawId || "").replace(/-/g, "");
  return s.length >= 8 ? s.slice(0, 8).toUpperCase() : (s || "--------").toUpperCase();
}
function authRefAltaUsuario(id) {
  return `USR-${shortAuthRefSegment(id)}`;
}

/**
 * Enmascara un número/documento mostrando solo los últimos N caracteres.
 * Pensado para PII (cédulas, NIT, teléfonos) en listados visibles a varios
 * operadores: el admin reconoce el registro pero no expone el dato completo.
 * El valor sin máscara solo se ve dentro del modal de aprobación.
 */
function maskSensitiveTail(raw, keep = 3) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const compact = s.replace(/\s+/g, "");
  if (compact.length <= keep) return "•".repeat(Math.max(2, compact.length));
  const visible = compact.slice(-keep);
  return `${"•".repeat(Math.max(3, compact.length - keep))}${visible}`;
}

/** Enmascara teléfono dejando los últimos 4 dígitos visibles (estándar para PII). */
function maskSensitivePhone(raw) {
  return maskSensitiveTail(raw, 4);
}
function authRefSolicitudViaje(r) {
  const n = String(r.requestNumber || "").trim();
  return n ? `VIA-${n}` : `VIA-${shortAuthRefSegment(r.id)}`;
}
function authRefColaInterna(approvalId) {
  return `COL-${shortAuthRefSegment(approvalId)}`;
}

function approvalDetailLine(approval) {
  const p = approval.payload || {};
  switch (approval.type) {
    case "create_user":
      return [normalizeEmail(p.email || ""), p.role].filter(Boolean).join(" · ") || "—";
    case "create_driver":
      return [String(p.name || "").trim(), p.idDoc ? `Doc. ${p.idDoc}` : ""].filter(Boolean).join(" · ") || "—";
    case "create_employee":
      return [String(p.name || "").trim(), p.idDoc ? `ID ${p.idDoc}` : "", String(p.position || "").trim()]
        .filter(Boolean)
        .join(" · ") || "—";
    case "register_hr_absence":
      return [String(p.absenceType || "").trim(), p.startDate && p.endDate ? `${p.startDate} → ${p.endDate}` : ""]
        .filter(Boolean)
        .join(" · ") || "—";
    case "mark_payroll_paid":
      return [String(p.employeeName || "").trim(), String(p.month || "").trim()].filter(Boolean).join(" · ") || "—";
    case "approve_trip_request":
      return String(p.requestId || "").trim() ? `Solicitud ${p.requestId}` : "—";
    default:
      return "—";
  }
}

/** Misma barra de acciones en todas las colas de Autorizaciones (solo cambian los data-action). */
function buildAuthStandardActionsHtml(mode, id) {
  const eid = escapeAttr(String(id));
  if (mode === "registration") {
    return `<div class="toolbar auth-approval-toolbar">
      <button type="button" class="btn btn-sm btn-approve" data-action="approve-registration" data-id="${eid}">${IC.check} Aprobar</button>
      <button type="button" class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${eid}">${IC.x} Rechazar</button>
    </div>`;
  }
  return `<div class="toolbar auth-approval-toolbar">
      <button type="button" class="btn btn-sm btn-approve" data-action="approval-approve" data-id="${eid}">${IC.check} Aprobar</button>
      <button type="button" class="btn btn-sm btn-reject" data-action="approval-reject" data-id="${eid}">${IC.x} Rechazar</button>
    </div>`;
}

/** Orden: más reciente primero (fecha ISO). */
function sortAuthQueueByDateDesc(items, getIso) {
  const getTs = typeof getIso === "function" ? getIso : (x) => x;
  return items.slice().sort((a, b) => {
    const ta = new Date(getTs(a) || 0).getTime();
    const tb = new Date(getTs(b) || 0).getTime();
    return tb - ta;
  });
}

const AUTH_QUEUE_SHORT_TAB_LABELS = {
  portal_access: "Alta usuarios",
  transport_fleet: "Conductores",
  workforce: "Empleados",
  hr_absences: "Ausencias",
  payroll_pay: "Liquidaciones"
};

function buildAuthorizationsTransportRequestsSection(pendingRequests) {
  const n = pendingRequests.length;
  const countBadge = `<span class="auth-section-count">${n} solicitud pendiente${n === 1 ? "" : "es"}</span>`;
  const cards = pendingRequests
    .map((r) => {
      const eid = escapeAttr(String(r.id));
      return `<article class="auth-request-card">
      <div class="auth-request-card-top">
        <span class="auth-ref-pill" title="Código solicitud">${escapeHtml(authRefSolicitudViaje(r))}</span>
        <span class="auth-request-card-id">${escapeHtml(String(r.requestNumber || r.id))}</span>
        ${prettyStatus(r.status, "request")}
      </div>
      <p class="auth-request-card-route">${escapeHtml(formatRoute(r))}</p>
      <p class="muted auth-request-card-meta">${escapeHtml(String(r.clientName || "").trim() || "—")} · ${escapeHtml(String(r.requestedByName || "").trim() || "—")}</p>
      <p class="muted auth-request-card-date">${fmtDate(r.createdAt)}</p>
      <div class="toolbar auth-request-card-actions">
        <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${eid}">${IC.eye} Ver</button>
        <button type="button" class="btn btn-sm btn-approve" data-action="approve" data-id="${eid}">${IC.check} Aprobar</button>
        <button type="button" class="btn btn-sm btn-reject" data-action="reject" data-id="${eid}">${IC.x} Rechazar</button>
      </div>
    </article>`;
    })
    .join("");
  const body = n
    ? `<div class="auth-request-cards-scroll">${cards}</div>`
    : emptyState("No hay solicitudes de transporte pendientes de aprobación.");
  return `<section class="auth-queue-section auth-queue-section--transport-req" data-auth-section="transport_requests" aria-label="Solicitudes de transporte pendientes">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">Solicitudes pendientes</h3>
          ${countBadge}
        </div>
        <p class="muted auth-queue-section-desc">Pendientes de aprobación operativa. Lo más reciente aparece primero; use <strong>Aprobar</strong> para el mismo flujo que en Solicitudes.</p>
      </header>
      <div class="auth-queue-section-body">${body}</div>
    </section>`;
}

function portalRegistrationDetailLine(u) {
  const company = getCompanyById(u.companyId)?.name || u.company || "";
  const doc = [u.documentType, u.taxId].filter(Boolean).join(" ");
  const pers = u.personalTaxId || u.personalDoc;
  const persBit = pers ? `pers. ${String(pers).trim()}` : "";
  const parts = [
    normalizeEmail(u.email || ""),
    company,
    doc,
    persBit,
    u.phone ? String(u.phone).trim() : ""
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function registrationKindLabel(kind) {
  const k = String(kind || "")
    .trim()
    .toLowerCase();
  if (k === "empleado_interno") return "Empleado interno";
  return "Cliente externo";
}

function portalRegistrationInboxInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function buildPortalRegistrationInboxCardsHtml(pendingUsers) {
  const sorted = sortAuthQueueByDateDesc(pendingUsers || [], (u) => u.registeredAt || u.createdAt);
  return sorted
    .map((u) => {
      const eid = escapeAttr(String(u.id));
      const when = u.registeredAt || u.createdAt;
      const loc = [u.city, u.department].filter(Boolean).join(", ");
      const personLabel = u.personType === "juridica" ? "Jurídica" : u.personType === "natural" ? "Natural" : String(u.personType || "").trim() || "—";
      // PII enmascarada en la bandeja: el admin solo ve los últimos dígitos para
      // reconocer la solicitud. El número completo se muestra dentro del modal
      // de aprobación, donde la acción ya queda auditada.
      const docTypeStr = String(u.documentType || "").trim();
      const docNumRaw = String(u.taxId || u.personalDoc || "").trim();
      const docMasked = docNumRaw ? maskSensitiveTail(docNumRaw, 3) : "";
      const docLine = [docTypeStr, docMasked].filter(Boolean).join(" ");
      const nitEmpRaw = String(u.companyNit || "").trim();
      const nitMasked = nitEmpRaw ? maskSensitiveTail(nitEmpRaw, 3) : "";
      const phoneRaw = String(u.phone || "").trim();
      const phoneMasked = phoneRaw ? maskSensitivePhone(phoneRaw) : "";
      return `<article class="auth-inbox-card" data-pending-user-id="${eid}">
        <div class="auth-inbox-card-accent" aria-hidden="true"></div>
        <div class="auth-inbox-card-main">
          <div class="auth-inbox-card-avatar" aria-hidden="true">${escapeHtml(portalRegistrationInboxInitials(u.name))}</div>
          <div class="auth-inbox-card-body">
            <div class="auth-inbox-card-top">
              <div class="auth-inbox-card-title-row">
                <h4 class="auth-inbox-card-name">${escapeHtml(String(u.name || "").trim() || "Sin nombre")}</h4>
                <span class="auth-ref-pill" title="Código de alta">${escapeHtml(authRefAltaUsuario(u.id))}</span>
              </div>
              <span class="auth-inbox-pulse">${IC.userPlus} En revisión</span>
            </div>
            <p class="auth-inbox-card-email">${escapeHtml(normalizeEmail(u.email || ""))}</p>
            <div class="auth-inbox-chip-row">
              <span class="auth-inbox-chip">${IC.briefcase} ${escapeHtml(personLabel)}</span>
              ${docLine ? `<span class="auth-inbox-chip" title="Documento enmascarado por privacidad. Verá el número completo al aprobar.">${IC.badge} ${escapeHtml(docLine)}</span>` : ""}
              ${nitMasked ? `<span class="auth-inbox-chip" title="NIT enmascarado por privacidad. Verá el número completo al aprobar.">${IC.building} NIT ${escapeHtml(nitMasked)}</span>` : ""}
              ${u.registrationKind ? `<span class="auth-inbox-chip">${IC.shield} ${escapeHtml(registrationKindLabel(u.registrationKind))}</span>` : ""}
              ${u.position ? `<span class="auth-inbox-chip">${IC.award} ${escapeHtml(String(u.position).trim())}</span>` : ""}
              ${loc ? `<span class="auth-inbox-chip">${IC.mapPin} ${escapeHtml(loc)}</span>` : ""}
              ${phoneMasked ? `<span class="auth-inbox-chip" title="Teléfono enmascarado por privacidad. Verá el número completo al aprobar.">${IC.phone} ${escapeHtml(phoneMasked)}</span>` : ""}
            </div>
            <p class="auth-inbox-card-date">${IC.clock} Solicitud · ${when ? escapeHtml(fmtDate(when)) : "—"}</p>
            <div class="auth-inbox-card-actions">${buildAuthStandardActionsHtml("registration", u.id).replace("auth-approval-toolbar", "auth-approval-toolbar auth-inbox-actions")}</div>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function buildPortalRegistrationPendingTableHtml(pendingUsers) {
  return `<div class="auth-inbox-grid">${buildPortalRegistrationInboxCardsHtml(pendingUsers)}</div>`;
}

function buildPendingApprovalsTableHtml(rows) {
  const sorted = sortAuthQueueByDateDesc(rows || [], (a) => a.requestedAt);
  const body = sorted
    .map((a) => {
      const detail = approvalDetailLine(a);
      const detailHtml = escapeHtml(detail);
      return `<tr>
    <td><span class="auth-ref-pill">${escapeHtml(authRefColaInterna(a.id))}</span></td>
    <td><span class="auth-type-badge">${escapeHtml(approvalTypeLabel(a.type))}</span></td>
    <td><strong>${escapeHtml(String(a.title || "").trim() || "—")}</strong></td>
    <td class="auth-detail-cell">${detailHtml}</td>
    <td>${escapeHtml(String(a.requestedByName || "").trim() || "—")}</td>
    <td>${fmtDate(a.requestedAt)}</td>
    <td>${buildAuthStandardActionsHtml("approval", a.id)}</td>
  </tr>`;
    })
    .join("");
  return `<div class="table-wrap auth-pending-table"><table><thead><tr>
    <th>Código</th><th>Tipo</th><th>Resumen</th><th>Detalle</th><th>Solicitante</th><th>Fecha</th><th>Acciones</th>
  </tr></thead><tbody>${body}</tbody></table></div>`;
}

function ensureVehicleDocs() {
  const vehicles = read(KEYS.vehicles, []);
  let changed = false;
  const nowDate = colombiaTodayIsoDate();
  const updated = vehicles.map((v) => {
    if (v.soatExpeditionDate && v.techInspectionExpeditionDate) return v;
    changed = true;
    return {
      ...v,
      soatExpeditionDate: v.soatExpeditionDate || nowDate,
      techInspectionExpeditionDate: v.techInspectionExpeditionDate || nowDate
    };
  });
  if (changed) write(KEYS.vehicles, updated);
}

/** Migraciones de esquema. Datos de negocio: memoria de sesión + PostgreSQL (no localStorage). */
function initPortalClientStorage() {
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    const PORTAL_DATA_VERSION = "v8-server-backed-memory-only";
    if (localStorage.getItem("antares_portal_data_ver") !== PORTAL_DATA_VERSION) {
      if (typeof window.AntaresPersistence?.purgeServerBackedFromDisk === "function") {
        window.AntaresPersistence.purgeServerBackedFromDisk();
      }
      localStorage.removeItem("antares_enterprise_seed_v1");
      localStorage.removeItem("antares_purge_demo_v1");
      localStorage.setItem("antares_portal_data_ver", PORTAL_DATA_VERSION);
    }

    if (localStorage.getItem("antares_users_storage_ver") !== "v5-memory") {
      localStorage.setItem("antares_users_storage_ver", "v5-memory");
    }

    ensureCompaniesAndUserMapping();
    ensureRequestsCompanyMapping();
    ensureRequestAndTripIdentifiers();
    ensureUsersPermissions();
    ensureUsersAccountStatus();
    ensureVehicleDocs();
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

/**
 * Política de sesión:
 *  - F5 / recarga: la sesión persiste en `localStorage` (`antares_session_v2`) y se rehidrata
 *    siempre que no se exceda el idle máximo. Nunca se cierra solo porque la API esté lenta o
 *    el bootstrap falle: usamos el `profileSnapshot` capturado al login.
 *  - Inactividad (sin mover mouse / teclado / scroll / toques): 30 minutos. Tras ese tiempo el
 *    timer global o el chequeo de `renderPortal` ejecutan `clearSession()` y avisan al usuario.
 *  - Cierre manual: botón "Cerrar sesión" (logout) hace `clearSession()` independientemente del idle.
 */
const SESSION_IDLE_MS = 30 * 60 * 1000;
const SESSION_ACTIVITY_THROTTLE_MS = 30 * 1000;
/** Evita JSON.stringify + localStorage en cada bump: solo persistir cada ~2 min (la actividad real sigue en memoria). */
const SESSION_ACTIVITY_PERSIST_MIN_MS = 2 * 60 * 1000;
const SESSION_API_REFRESH_MS = 12 * 60 * 1000;
const SESSION_CLIENT_TOKEN_ROTATE_MS = 15 * 60 * 1000;

let __sessionActivityThrottleAt = 0;
/** Marca de última interacción en RAM; la sesión en disco puede ir rezagada hasta SESSION_ACTIVITY_PERSIST_MIN_MS. */
let __sessionActivityMemoryAt = 0;
let __lastSessionActivityPersistAt = 0;
let __sessionIdleCheckTimer = null;
let __sessionApiRefreshTimer = null;
let __sessionActivityHandler = null;

function getSession() {
  return read(KEYS.session, null);
}

function setSession(sessionData) {
  write(KEYS.session, sessionData);
  state.session = sessionData;
  if (sessionData && typeof sessionData.lastActivityAt === "number") {
    __sessionActivityMemoryAt = Math.max(__sessionActivityMemoryAt, sessionData.lastActivityAt);
    __lastSessionActivityPersistAt = Date.now();
  }
}

function getEffectiveLastActivityAt() {
  const s = getSession();
  const stored = s && typeof s.lastActivityAt === "number" ? s.lastActivityAt : 0;
  return Math.max(stored, __sessionActivityMemoryAt);
}

/** Antes de cerrar pestaña: evita que idle use un lastActivityAt viejo solo en disco. */
function flushSessionActivityToStorage() {
  const s = getSession();
  if (!s || !__sessionActivityMemoryAt) return;
  const merged = Math.max(typeof s.lastActivityAt === "number" ? s.lastActivityAt : 0, __sessionActivityMemoryAt);
  if (merged <= (typeof s.lastActivityAt === "number" ? s.lastActivityAt : 0)) return;
  write(KEYS.session, { ...s, lastActivityAt: merged });
  state.session = { ...s, lastActivityAt: merged };
  __lastSessionActivityPersistAt = Date.now();
}

function stopSessionSecurityWatch() {
  if (__sessionActivityHandler) {
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) => {
      window.removeEventListener(ev, __sessionActivityHandler);
    });
    __sessionActivityHandler = null;
  }
  if (__sessionIdleCheckTimer) {
    clearInterval(__sessionIdleCheckTimer);
    __sessionIdleCheckTimer = null;
  }
  if (__sessionApiRefreshTimer) {
    clearInterval(__sessionApiRefreshTimer);
    __sessionApiRefreshTimer = null;
  }
}

function bumpSessionActivityTimestamp() {
  const s = getSession();
  if (!s) return;
  const now = Date.now();
  __sessionActivityMemoryAt = now;
  if (state.session) state.session = { ...state.session, lastActivityAt: now };
  const persistAge = now - __lastSessionActivityPersistAt;
  if (persistAge >= SESSION_ACTIVITY_PERSIST_MIN_MS) {
    const cur = getSession();
    if (cur) setSession({ ...cur, lastActivityAt: now });
  }
}

function throttledBumpSessionActivity() {
  const now = Date.now();
  if (now - __sessionActivityThrottleAt < SESSION_ACTIVITY_THROTTLE_MS) return;
  __sessionActivityThrottleAt = now;
  bumpSessionActivityTimestamp();
}

function checkSessionIdleAndLogout() {
  const s = getSession();
  if (!s) return;
  const last = getEffectiveLastActivityAt();
  if (!last || Date.now() - last <= SESSION_IDLE_MS) return;
  stopSessionSecurityWatch();
  clearSession();
  state.currentView = "dashboard";
  history.replaceState(null, "", window.location.pathname + window.location.search);
  notify(userMessage("sessionIdle"), "info");
  renderPortal();
}

async function tryApiRefreshBridge() {
  const api = window.AntaresApi;
  const session = getSession();
  if (!api?.getBase?.() || !session?.userId || !session?.refreshToken) return;
  const base = String(api.getBase()).replace(/\/+$/, "");
  try {
    const res = await fetch(`${base}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ userId: session.userId, refreshToken: session.refreshToken })
    });
    if (!res.ok) return;
    const body = await res.json();
    if (!body?.accessToken) return;
    api.setAccessToken(body.accessToken);
    const now = Date.now();
    setSession({
      ...session,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken || session.refreshToken,
      lastActivityAt: now
    });
    syncSessionProfileSnapshotFromCache();
  } catch (_e) {
    /* API opcional */
  }
}

function refreshClientSessionTokenIfDue() {
  const s = getSession();
  if (!s) return;
  const user = currentUser();
  if (!user) return;
  const now = Date.now();
  const lastAct = getEffectiveLastActivityAt() || now;
  if (now - lastAct > SESSION_IDLE_MS) return;
  const issued = typeof s.tokenIssuedAt === "number" ? s.tokenIssuedAt : 0;
  if (now - issued < SESSION_CLIENT_TOKEN_ROTATE_MS) return;
  setSession({ ...getSession(), token: buildToken(user), tokenIssuedAt: now });
}

async function scheduledSessionTokenMaintenance() {
  const s = getSession();
  if (!s || !currentUser()) return;
  const lastAct = getEffectiveLastActivityAt() || Date.now();
  if (Date.now() - lastAct > SESSION_IDLE_MS) return;
  await tryApiRefreshBridge();
  refreshClientSessionTokenIfDue();
}

function ensureSessionLifecycleHooks() {
  if (typeof window === "undefined" || window.__antaresSessionLifecycleOk) return;
  window.__antaresSessionLifecycleOk = true;
  window.addEventListener("pagehide", () => flushSessionActivityToStorage(), { capture: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSessionActivityToStorage();
  });
}

function startSessionSecurityWatch() {
  stopSessionSecurityWatch();
  ensureSessionLifecycleHooks();
  __sessionActivityHandler = throttledBumpSessionActivity;
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) => {
    window.addEventListener(ev, __sessionActivityHandler, { passive: true });
  });
  __sessionIdleCheckTimer = setInterval(checkSessionIdleAndLogout, 60 * 1000);
  __sessionApiRefreshTimer = setInterval(() => void scheduledSessionTokenMaintenance(), SESSION_API_REFRESH_MS);
}

function clearSession() {
  stopSessionSecurityWatch();
  stopNotificationsPolling();
  __sessionActivityMemoryAt = 0;
  __lastSessionActivityPersistAt = 0;
  localStorage.removeItem(KEYS.session);
  state.session = null;
  state.portalContacts = [];
  if (typeof window.AntaresPersistence?.clearServerBackedMemory === "function") {
    window.AntaresPersistence.clearServerBackedMemory();
  }
  try {
    localStorage.removeItem("antares_api_access_token");
  } catch (_e) {
    /* noop */
  }
}

async function tryApiLoginBridge(user, password) {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || !user?.email) return;
  try {
    const url = `${api.getBase()}/api/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: user.email, password })
    });
    const body = res.ok ? await res.json() : null;
    if (!body?.accessToken) return;
    api.setAccessToken(body.accessToken);
    const session = getSession();
    if (session) {
      setSession({
        ...session,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken || "",
        lastActivityAt: Date.now()
      });
    }
    await startPortalBootstrapForInteractiveSession();
    syncSessionProfileSnapshotFromCache();
    if (state.session && currentUser()) {
      scheduleRenderPortalView();
      updateNotificationBadge();
    }
  } catch (_e) {
    /* API opcional: sesion local sigue valida */
  }
}

function buildToken(user) {
  const nonce = crypto.getRandomValues(new Uint32Array(2)).join("");
  return btoa(`${user.id}.${user.role}.${Date.now()}.${nonce}`);
}

async function ensureUsersPasswordHashing() {
  const users = read(KEYS.users, []);
  if (window.AntaresApi?.getBase?.()) {
    let anyPlain = false;
    for (const user of users) {
      const p = String(user.password || "");
      if (p && !p.startsWith("sha256:")) {
        anyPlain = true;
        break;
      }
    }
    if (!anyPlain) return;
  }
  let changed = false;
  const secured = [];
  for (const user of users) {
    const p = String(user.password || "");
    if (p.startsWith("sha256:")) {
      secured.push(user);
      continue;
    }
    if (!p) {
      secured.push(user);
      continue;
    }
    changed = true;
    secured.push({ ...user, password: await hashPassword(p) });
  }
  if (changed) write(KEYS.users, secured);
}

/** Marca opcional para el widget Turnstile. Si la site key no está configurada (dev sin captcha), devuelve cadena vacía y el formulario igual envía. */
function turnstileWidgetMarkup() {
  const siteKey = String(window.ANTARES_TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) return "";
  return `
    <div class="full turnstile-row">
      <div class="cf-turnstile" data-sitekey="${siteKey}" data-size="flexible" data-theme="auto" data-antares-pending="1"></div>
    </div>
  `;
}

/**
 * Renderiza explícitamente todos los widgets Turnstile presentes en el DOM. La auto-detección de
 * `api.js` falla a veces en formularios montados dinámicamente; este paso es defensivo y se vuelve
 * no-op cuando un nodo ya fue inicializado (marcamos con `data-antares-pending="0"`).
 */
function ensureTurnstileWidgets() {
  const siteKey = String(window.ANTARES_TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) return;
  const nodes = document.querySelectorAll('.cf-turnstile[data-antares-pending="1"]');
  if (!nodes.length) return;
  const tryRender = () => {
    if (!window.turnstile?.render) return false;
    nodes.forEach((node) => {
      try {
        if (node.dataset.antaresPending !== "1") return;
        node.dataset.antaresPending = "0";
        window.turnstile.render(node, {
          sitekey: siteKey,
          callback: (token) => {
            try {
              node.dataset.antaresToken = String(token || "");
              node.dataset.antaresError = "";
            } catch (_e) {}
          },
          /**
           * Marcamos `data-antares-error="1"` para que `waitForTurnstileToken`
           * pueda resolver de inmediato y no haga esperar al usuario hasta
           * agotar el timeout (típicamente 4-6s). Esto evita que el login se
           * "cuelgue" cuando el hostname no está permitido en el panel de
           * Turnstile o cuando el script de Cloudflare está bloqueado por
           * algún antivirus / red corporativa.
           */
          "error-callback": () => {
            try {
              node.dataset.antaresToken = "";
              node.dataset.antaresError = "1";
            } catch (_e) {}
          },
          "expired-callback": () => {
            try {
              node.dataset.antaresToken = "";
            } catch (_e) {}
          }
        });
      } catch (_e) {
        node.dataset.antaresPending = "1";
      }
    });
    return true;
  };
  if (!tryRender()) {
    // El script `api.js` aún no terminó de cargar (defer). Reintentamos cuando esté disponible.
    const interval = window.setInterval(() => {
      if (tryRender()) window.clearInterval(interval);
    }, 250);
    window.setTimeout(() => window.clearInterval(interval), 8000);
  }
}

/**
 * Espera a que el widget Turnstile produzca un token (hasta `timeoutMs`).
 * Devuelve cadena vacía cuando:
 *  - El formulario no tiene widget (sitekey ausente, dev sin captcha, etc.).
 *  - El widget reportó error (`data-antares-error="1"`, p. ej. hostname no
 *    permitido o script de Cloudflare bloqueado): no esperamos al timeout.
 *  - Pasaron `timeoutMs` ms sin token.
 *
 * El backend tiene su propia guarda (`TurnstileService.assertValid`): si el
 * token llega vacío y `CF_TURNSTILE_REQUIRED` está apagado, login pasa igual;
 * si está encendido, responde 400 limpio en lugar de hacer esperar al usuario.
 */
function waitForTurnstileToken(form, timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (!form) return resolve("");
    const widget = form.querySelector(".cf-turnstile");
    if (!widget) return resolve("");
    const readNow = () => {
      const fromWidget = String(widget.dataset.antaresToken || "").trim();
      if (fromWidget) return fromWidget;
      try {
        if (window.turnstile?.getResponse) {
          const v = window.turnstile.getResponse(widget);
          if (v) return String(v).trim();
        }
      } catch (_e) {}
      try {
        const fd = new FormData(form);
        const v = fd.get("cf-turnstile-response");
        return typeof v === "string" ? v.trim() : "";
      } catch (_e) {
        return "";
      }
    };
    const hasError = () => String(widget.dataset.antaresError || "") === "1";
    const immediate = readNow();
    if (immediate) return resolve(immediate);
    if (hasError()) return resolve("");
    const start = Date.now();
    const timer = window.setInterval(() => {
      const now = readNow();
      if (now) {
        window.clearInterval(timer);
        resolve(now);
        return;
      }
      if (hasError()) {
        window.clearInterval(timer);
        resolve("");
        return;
      }
      if (Date.now() - start > timeoutMs) {
        window.clearInterval(timer);
        resolve("");
      }
    }, 200);
  });
}

/** Lectura síncrona del token (sin esperar). Útil cuando ya validamos antes en submit. */
function readTurnstileToken(form) {
  if (!form) return "";
  const widget = form.querySelector?.(".cf-turnstile");
  if (widget) {
    const fromWidget = String(widget.dataset.antaresToken || "").trim();
    if (fromWidget) return fromWidget;
    try {
      if (window.turnstile?.getResponse) {
        const v = window.turnstile.getResponse(widget);
        if (v) return String(v).trim();
      }
    } catch (_e) {}
  }
  try {
    const fd = new FormData(form);
    const v = fd.get("cf-turnstile-response");
    return typeof v === "string" ? v.trim() : "";
  } catch (_e) {
    return "";
  }
}

/** Reinicia el widget tras un error o submit fallido (cada token es de un solo uso). */
function resetTurnstile(form) {
  try {
    const widget = form?.querySelector?.(".cf-turnstile");
    if (!widget) return;
    if (widget.dataset) widget.dataset.antaresToken = "";
    if (window.turnstile?.reset) window.turnstile.reset(widget);
  } catch (_e) {}
}

function authView() {
  if (state.authSupabaseRecovery) {
    return `
    <div class="auth-header-premium">
      <h3>Nueva contraseña</h3>
      <p class="muted">Elija una contraseña segura. Quedará aplicada para el inicio de sesión en este portal.</p>
    </div>
    <form id="form-recover-complete" class="form-grid auth-pane auth-form" autocomplete="off">
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.lock, "Nueva contraseña", { required: true })}</span>
        <div class="password-field auth-password-row">
          <div class="auth-input-row auth-input-row--grow">
            <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
            <input class="auth-input-control" type="password" name="password" minlength="10" autocomplete="new-password" autocapitalize="off" spellcheck="false" required />
          </div>
          <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="recover-complete">${IC.eye} Mostrar</button>
        </div>
      </label>
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.shield, "Confirmar contraseña", { required: true })}</span>
        <div class="password-field auth-password-row">
          <div class="auth-input-row auth-input-row--grow">
            <span class="auth-input-prefix" aria-hidden="true">${IC.shield}</span>
            <input class="auth-input-control" type="password" name="passwordConfirm" minlength="10" autocomplete="new-password" autocapitalize="off" spellcheck="false" required />
          </div>
          <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="recover-complete-c">${IC.eye} Mostrar</button>
        </div>
      </label>
      <button class="btn btn-primary full" type="submit">${IC.check} Guardar contraseña e iniciar sesión después</button>
    </form>`;
  }
  const tab = state.authTab;
  const deptOptions = departmentOptions();
  if (tab === "login") {
    const regOk = state.registrationSuccessBanner;
    const regBanner =
      regOk && typeof regOk.message === "string" && regOk.message.trim()
        ? `<div class="auth-register-success-banner" role="status">
        <button type="button" class="auth-register-success-dismiss" data-action="dismiss-reg-success" aria-label="Cerrar aviso">×</button>
        <p class="auth-register-success-title">${IC.check} Solicitud registrada</p>
        <p class="auth-register-success-body">${escapeHtml(regOk.message.trim())}</p>
        ${
          regOk.email
            ? `<p class="muted auth-register-success-email">Correo de contacto: <strong>${escapeHtml(String(regOk.email).trim())}</strong></p>`
            : ""
        }
        <p class="muted auth-register-success-hint">Un administrador revisará su solicitud antes de habilitar el ingreso al portal. <strong>Cuando su cuenta sea aprobada</strong> recibirá un correo con el enlace de activación para definir su contraseña e iniciar sesión. Si no lo ve en su bandeja, revise la carpeta de spam o filtros corporativos.</p>
      </div>`
        : "";
    return `
      <div class="auth-header-premium">
        <h3>Ingreso empresarial seguro</h3>
        <p class="muted">Acceda a su operación con trazabilidad, control de permisos y registro de actividad.</p>
      </div>
      ${regBanner}
      <div class="auth-login-shell">
        <form id="form-login" class="form-grid auth-form auth-pane">
          <label class="full auth-field-stack">
            <span class="auth-plain-label">${fieldLabel(IC.mail, "Correo corporativo")}</span>
            <div class="auth-input-row">
              <span class="auth-input-prefix" aria-hidden="true">${IC.mail}</span>
              <input class="auth-input-control" type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required />
            </div>
          </label>
          <label class="full auth-field-stack">
            <span class="auth-plain-label">${fieldLabel(IC.lock, "Contraseña")}</span>
            <div class="password-field auth-password-row">
              <div class="auth-input-row auth-input-row--grow">
                <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
                <input class="auth-input-control" type="password" name="password" autocomplete="current-password" required />
              </div>
              <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="login">${IC.eye} Mostrar</button>
            </div>
          </label>
          <label class="full auth-remember-row">
            <span class="auth-remember-check">
              <input type="checkbox" name="rememberCredentials" id="login-remember-credentials" value="1" />
              <span>Recordar usuario y contraseña en este equipo</span>
            </span>
            <small class="muted auth-remember-hint">Solo recomendable en su equipo personal. Evite esta opción en dispositivos compartidos o públicos.</small>
          </label>
          ${turnstileWidgetMarkup()}
          <button class="btn btn-primary full" type="submit" data-login-submit>
            <span class="auth-submit-content"><span class="auth-submit-icon">${IC.check}</span><span class="auth-submit-label">Ingresar al portal</span></span>
            <span class="auth-submit-spinner" aria-hidden="true"></span>
          </button>
        </form>
        <div class="auth-login-side auth-pane">
          <h3 class="auth-side-heading"><span class="auth-side-heading-icon" aria-hidden="true">${IC.shield}</span><span class="auth-side-heading-text">Acceso seguro Antares</span></h3>
          <p class="muted">Portal diseñado para equipos de operaciones, administración y recursos humanos.</p>
          <ul class="auth-bullets">
            <li>Control por roles y permisos granulares</li>
            <li>Trazabilidad de aprobaciones y auditoría</li>
            <li>Operación alineada a flujos empresariales</li>
          </ul>
          <div class="auth-side-pills">
            <span>${IC.lock} Sesión cifrada</span>
            <span>${IC.activity} Historial de cambios</span>
            <span>${IC.bell} Soporte corporativo</span>
          </div>
        </div>
      </div>
      <p class="muted auth-help">${IC.alertTriangle} Use credenciales corporativas. Evite ingresar desde equipos compartidos o redes públicas.</p>
    `;
  }

  if (tab === "register") {
    return `
      <div class="auth-header-premium">
        <h3>Registro al portal</h3>
        <p class="muted">Complete sus datos con cuidado e indique si es <strong>cliente externo</strong> o <strong>empleado interno</strong>. Un administrador revisará y aprobará su cuenta antes de que pueda ingresar. Tras enviar el formulario recibirá un correo con la confirmación.</p>
      </div>
      <form id="form-register" class="form-grid auth-form auth-register-form auth-pane">
        <div class="register-kind-field full">
          <span class="register-kind-label">${fieldLabel(IC.users, "Tipo de vínculo")}</span>
          <div class="register-kind-options" role="radiogroup" aria-label="Tipo de vínculo con Antares">
            <label class="register-kind-option">
              <input type="radio" name="registrationKind" value="cliente" required checked />
              <span>Cliente externo</span>
            </label>
            <label class="register-kind-option">
              <input type="radio" name="registrationKind" value="empleado_interno" required />
              <span>Empleado interno</span>
            </label>
          </div>
          <small class="muted register-kind-hint">Cliente: empresas u organizaciones que contratan el servicio. Empleado interno: personal de Transportes Antares.</small>
        </div>
        <label>${fieldLabel(IC.user, "Primer nombre")}<input name="firstName" required autocomplete="given-name" /></label>
        <label>${fieldLabel(IC.user, "Segundo nombre")}<input name="middleName" autocomplete="additional-name" /></label>
        <label>${fieldLabel(IC.users, "Primer apellido")}<input name="lastName" required autocomplete="family-name" /></label>
        <label>${fieldLabel(IC.users, "Segundo apellido")}<input name="secondLastName" autocomplete="family-name" /></label>
        <div class="register-doc-section full">
          <label class="register-field-person-type">${fieldLabel(IC.briefcase, "Tipo de persona")}
            <select name="personType" required>
              <option value="">Seleccione...</option>
              <option value="natural">Natural</option>
              <option value="juridica">Jurídica</option>
            </select>
          </label>
          <div id="register-doc-persona" class="register-doc-block register-doc-block--natural">
            <label>${fieldLabel(IC.file, "Tipo de documento")}
              <select name="documentType" required>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </label>
            <label>${fieldLabel(IC.badge, "Número de documento")}<input name="taxId" inputmode="numeric" autocomplete="off" aria-required="true" /></label>
          </div>
          <div id="register-doc-empresa" class="register-doc-block register-doc-block--empresa hidden" hidden>
            <label>${fieldLabel(IC.briefcase, "NIT de la empresa")}
              <input name="companyNit" inputmode="numeric" autocomplete="off" placeholder="Ej. 900123456-7" />
            </label>
            <label>${fieldLabel(IC.file, "Tipo de cédula (representante)")}
              <select name="personalDocumentType">
                <option value="CC">Cédula de ciudadanía</option>
                <option value="CE">Cédula de extranjería</option>
              </select>
            </label>
            <label>${fieldLabel(IC.badge, "Número de cédula")}
              <input name="personalTaxId" inputmode="numeric" autocomplete="off" placeholder="Debe ser única en el portal" />
            </label>
            <p class="muted register-doc-empresa-note">Varios usuarios pueden compartir el NIT de la empresa; la duplicidad se valida solo sobre el número de cédula del representante.</p>
          </div>
        </div>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" required /></label>
        <label>${fieldLabel(IC.users, "Género")}
          <select name="gender" required>
            <option value="">Seleccione...</option>
            <option>Femenino</option>
            <option>Masculino</option>
            <option>No binario</option>
            <option>Prefiero no decirlo</option>
          </select>
        </label>
        <label>${fieldLabel(IC.award, "Cargo")}<input name="position" required /></label>
        <label>${fieldLabel(IC.grid, "Área")}<input name="workArea" required placeholder="Ej.: Operaciones" /></label>
        <label class="phone-field-register">
          ${fieldLabel(IC.phone, "Teléfono")}
          <div class="phone-input-professional" role="group" aria-label="Teléfono celular Colombia">
            <div class="phone-reg-flag-slot">
              <span class="js-register-lang-flag register-lang-flag register-lang-flag--co" aria-hidden="true" title="Colombia"></span>
            </div>
            <select class="js-register-phone-cc phone-cc-select" aria-label="Indicativo +57 (Colombia)" required>
              ${registerPhoneCountryOptionsHtml()}
            </select>
            <input
              type="tel"
              class="js-register-phone-national phone-national-input"
              inputmode="numeric"
              autocomplete="tel-national"
              placeholder="300 123 4567"
              maxlength="14"
              required
              aria-describedby="register-phone-hint"
            />
            <input type="hidden" name="phone" class="js-register-phone-full" value="" />
          </div>
          <small id="register-phone-hint" class="muted phone-field-hint">Celular Colombia: 10 dígitos (empieza por 3).</small>
        </label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}
          <select name="department" id="register-department" required>
            <option value="">Seleccione...</option>
            ${deptOptions}
          </select>
        </label>
        <label>${fieldLabel(IC.building, "Ciudad")}
          <select name="city" id="register-city" required>
            <option value="">Seleccione un departamento...</option>
          </select>
        </label>
        <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" required placeholder="Dirección principal" autocomplete="street-address" /></label>
        <label class="full">${fieldLabel(IC.mail, "Correo electrónico")}<input type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required /></label>
        <label class="full">${fieldLabel(IC.lock, "Contraseña")}
          <div class="password-field">
            <input type="password" minlength="10" name="password" autocomplete="new-password" autocapitalize="off" spellcheck="false" required aria-describedby="password-strength password-hint" class="auth-password-input" />
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="register">${IC.eye} Mostrar</button>
          </div>
        </label>
        <label class="full">${fieldLabel(IC.shield, "Confirmar contraseña")}
          <input type="password" minlength="10" name="passwordConfirm" autocomplete="new-password" autocapitalize="off" spellcheck="false" required class="auth-password-input" />
          <small class="muted register-password-match-hint">Repita la contraseña exactamente igual.</small>
        </label>
        <div id="register-password-strength-suite" class="password-strength-suite full">
          <div class="password-strength-bar-wrap">
            <div class="password-strength-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Progreso de requisitos de contraseña">
              <div class="password-strength-bar-fill password-strength-bar-fill--weak"></div>
            </div>
            <div class="password-strength-meta">
              <span class="password-strength-pill password-strength-pill--weak">0%</span>
              <p id="password-strength" class="password-strength-headline">Indique una contraseña segura</p>
            </div>
          </div>
          <ul class="password-rule-grid" role="list" aria-label="Requisitos de contraseña">
            <li data-rule="len"><span class="password-rule-dot" aria-hidden="true"></span><span>10+ caracteres</span></li>
            <li data-rule="lower"><span class="password-rule-dot" aria-hidden="true"></span><span>Minúscula (a-z)</span></li>
            <li data-rule="upper"><span class="password-rule-dot" aria-hidden="true"></span><span>Mayúscula (A-Z)</span></li>
            <li data-rule="digit"><span class="password-rule-dot" aria-hidden="true"></span><span>Número (0-9)</span></li>
            <li data-rule="special"><span class="password-rule-dot" aria-hidden="true"></span><span>Símbolo (!@#$…)</span></li>
          </ul>
          <p id="password-hint" class="muted password-policy-hint">Mínimo 10 caracteres con mayúscula, minúscula, número y símbolo. Escriba la contraseña como prefiera: en pantalla se muestra tal cual (mayúsculas y minúsculas). En el servidor se almacena de forma segura (hash), no en texto plano.</p>
        </div>
        <label class="full register-terms-card">
          <span class="register-terms-title">${fieldLabel(IC.file, "Términos y condiciones")}</span>
          <span class="register-terms-copy muted">
            Al crear su cuenta acepta los
            <a class="register-terms-link" href="${REGISTER_TERMS_URL}" target="_blank" rel="noopener noreferrer">Términos de uso</a>,
            la
            <a class="register-terms-link" href="${REGISTER_PRIVACY_URL}" target="_blank" rel="noopener noreferrer">Política de privacidad</a>
            y el tratamiento de datos (Habeas Data), y confirma que la información registrada es veraz.
          </span>
          <span class="checkbox-inline register-terms-check">
            <input type="checkbox" name="acceptTerms" required />
            Acepto los términos y la política para continuar con la solicitud.
          </span>
        </label>
        <div class="full auth-inline-note">
          <small class="muted">${IC.shield} Su solicitud quedará pendiente hasta que un administrador apruebe y asocie una empresa.</small>
        </div>
        ${turnstileWidgetMarkup()}
        <button class="btn btn-primary full" type="submit">${IC.userPlus} Enviar solicitud de registro</button>
      </form>
    `;
  }

    return `
    <div class="auth-header-premium">
      <h3>Recuperación de acceso</h3>
      <p class="muted">Indique el <strong>correo corporativo asociado a su cuenta</strong>. Si el usuario está activo en el sistema, recibirá un mensaje con las instrucciones para restablecer su contraseña de forma segura.</p>
    </div>
    <form id="form-recover" class="form-grid auth-pane auth-form auth-form-recover">
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.mail, "Correo registrado")}</span>
        <div class="auth-input-row">
          <span class="auth-input-prefix" aria-hidden="true">${IC.mail}</span>
          <input class="auth-input-control" type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required />
        </div>
      </label>
      <div class="auth-recover-hint" role="note">
        <div class="auth-recover-hint-inner">
          <span class="auth-recover-hint-icon" aria-hidden="true">${IC.shield}</span>
          <div class="auth-recover-hint-body">
            <p class="auth-recover-hint-title">Enlace seguro y de vigencia limitada</p>
            <p class="auth-recover-hint-text">Recibirá un enlace personalizado y cifrado. Por estándares de seguridad, el enlace caduca transcurrido un plazo breve y solo puede utilizarse para completar el restablecimiento; si expira, podrá solicitar uno nuevo desde esta misma pantalla.</p>
            <p class="auth-recover-hint-text">Una vez actualizada la contraseña, podrá ingresar al portal con <strong>el mismo correo</strong> y sus nuevas credenciales. Si no ve el mensaje en unos minutos, revise la carpeta de spam o correo no deseado y confirme que el correo indicado coincide con el registrado. Para escalamiento técnico, diríjase al equipo de soporte de su organización.</p>
          </div>
        </div>
      </div>
      ${turnstileWidgetMarkup()}
      <div class="auth-recover-actions">
        <button class="btn btn-primary full auth-recover-submit" type="submit">${IC.send} Enviar enlace al correo</button>
      </div>
    </form>
  `;
}

function showAuth() {
  const modal = nodes.authModal || document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderAuthTab();
}

function hideAuth() {
  const modal = nodes.authModal || document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function renderAuthTab() {
  const tabsWrap = document.querySelector("#auth-modal .tabs");
  if (tabsWrap) tabsWrap.classList.toggle("hidden", Boolean(state.authSupabaseRecovery));
  const tabs = nodes.authTabs.length ? nodes.authTabs : [...document.querySelectorAll("#auth-modal .tab")];
  const content = nodes.authContent || document.getElementById("auth-content");
  tabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.tab === state.authTab);
  });
  if (!content) return;
  content.innerHTML = authView();
  bindAuthForms();
  ensureTurnstileWidgets();
}

function bindAuthForms() {
  document.querySelector("[data-action='dismiss-reg-success']")?.addEventListener("click", () => {
    state.registrationSuccessBanner = null;
    renderAuthTab();
  });
  const login = document.getElementById("form-login");
  const register = document.getElementById("form-register");
  const recover = document.getElementById("form-recover");
  const togglePassword = document.querySelectorAll("[data-action='toggle-password']");
  togglePassword.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetForm = String(btn.dataset.target || "");
      let input = null;
      if (targetForm === "register") input = register?.querySelector("input[name='password']");
      else if (targetForm === "admin-create") input = document.querySelector("#form-admin-user-create input[name='password']");
      else if (targetForm === "recover-complete")
        input = document.querySelector("#form-recover-complete input[name='password']");
      else if (targetForm === "recover-complete-c")
        input = document.querySelector("#form-recover-complete input[name='passwordConfirm']");
      else input = login?.querySelector("input[name='password']");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      const eye = typeof IC !== "undefined" && IC.eye ? `${IC.eye} ` : "";
      btn.innerHTML = `${eye}${visible ? "Mostrar" : "Ocultar"}`;
    });
  });

  if (login) {
    const remembered = readRememberedLoginCredentials();
    if (remembered) {
      const em = login.querySelector("input[name='email']");
      const pw = login.querySelector("input[name='password']");
      const cb = login.querySelector("#login-remember-credentials");
      if (em) em.value = remembered.email;
      if (pw) pw.value = remembered.password;
      if (cb) cb.checked = true;
    }
    const loginSubmitBtn = login.querySelector("[data-login-submit]");
    const setLoginSubmitLoading = (loading) => {
      if (!loginSubmitBtn) return;
      if (loading) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.classList.add("is-loading");
        loginSubmitBtn.setAttribute("aria-busy", "true");
        const labelEl = loginSubmitBtn.querySelector(".auth-submit-label");
        if (labelEl) labelEl.textContent = "Ingresando…";
      } else {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.classList.remove("is-loading");
        loginSubmitBtn.removeAttribute("aria-busy");
        const labelEl = loginSubmitBtn.querySelector(".auth-submit-label");
        if (labelEl) labelEl.textContent = "Ingresar al portal";
      }
    };
    login.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (Date.now() < state.authSecurity.lockUntil) {
        const secs = Math.ceil((state.authSecurity.lockUntil - Date.now()) / 1000);
        notify(userMessage("authLoginLock", secs), "error");
        return;
      }
      const data = Object.fromEntries(new FormData(login).entries());
      const passwordRaw = String(data.password || "");

      setLoginSubmitLoading(true);
      try {
        /**
         * Si hay URL de API, la autenticacion es SOLO contra el servidor (PostgreSQL).
         * No se usa fallback local respecto a credenciales guardadas solo en el navegador.
         */
        if (window.AntaresApi?.getBase?.()) {
          try {
            const base = String(window.AntaresApi.getBase()).replace(/\/+$/, "");
            const turnstileToken = await waitForTurnstileToken(login);
            const res = await fetch(`${base}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ email: data.email, password: passwordRaw, turnstileToken })
            });
            const body = await res.json().catch(() => null);
            if (res.ok && body?.accessToken) {
              const refreshTok = String(body.refreshToken || "").trim();
              window.AntaresApi.setAccessToken(body.accessToken);
              const payload = decodeJwtPayload(body.accessToken);
              const uid = payload?.sub;
              let usersAfter = read(KEYS.users, []);
              let userApi = usersAfter.find((u) => String(u.id) === String(uid));
              if (!userApi) {
                try {
                  const me = await window.AntaresApi.getJson("/portal/me");
                  if (me?.id) {
                    upsertPortalUserRowIntoCache(me);
                    usersAfter = read(KEYS.users, []);
                    userApi = usersAfter.find((u) => String(u.id) === String(uid));
                  }
                } catch (_meErr) {
                  /* el stub del JWT rellena el minimo hasta que llegue bootstrap en segundo plano */
                }
              }
              if (!userApi) {
                userApi = upsertPortalUserStubFromJwtPayload(payload);
              }
              if (!userApi) {
                notify(userMessage("authProfileLoadFailed"), "error");
                return;
              }
              /** La API solo devuelve tokens si estado_cuenta es aprobado; no bloquear por caché local desactualizado. */
              state.authSecurity.failedAttempts = 0;
              state.authSecurity.lockUntil = 0;
              state.registrationSuccessBanner = null;
              setSession({
                userId: userApi.id,
                role: userApi.role,
                token: buildToken(userApi),
                accessToken: body.accessToken,
                refreshToken: refreshTok,
                lastActivityAt: Date.now(),
                tokenIssuedAt: Date.now(),
                profileSnapshot: buildProfileSnapshotFromUserRow(userApi)
              });
              if (data.rememberCredentials) writeRememberedLoginCredentials(data.email, passwordRaw);
              else clearRememberedLoginCredentials();
              hideAuth();
              startSessionSecurityWatch();
              renderPortal();
              void startPortalBootstrapForInteractiveSession();
              return;
            }
            const apiMsg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
            notify(String(apiMsg || userMessage("authInvalidServer")), "error");
            state.authSecurity.failedAttempts += 1;
            if (state.authSecurity.failedAttempts >= 5) {
              state.authSecurity.lockUntil = Date.now() + 60_000;
              state.authSecurity.failedAttempts = 0;
            }
            return;
          } catch (_e) {
            notify(userMessage("authNoConnection"), "error");
            return;
          }
        }

        const users = read(KEYS.users, []);
        const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
        const valid = user ? await verifyPassword(passwordRaw, user.password) : false;
        if (!valid || !user) {
          state.authSecurity.failedAttempts += 1;
          if (state.authSecurity.failedAttempts >= 5) {
            state.authSecurity.lockUntil = Date.now() + 60_000;
            state.authSecurity.failedAttempts = 0;
          }
          notify(userMessage("authInvalidLocal"), "error");
          return;
        }
        state.authSecurity.failedAttempts = 0;
        state.authSecurity.lockUntil = 0;
        if (isPortalUserPendingApproval(user)) {
          notify(userMessage("authPendingApproval"), "info");
          return;
        }
        if (user.accountStatus === ACCOUNT_STATUS.RECHAZADO) {
          notify(userMessage("authRejected"), "error");
          return;
        }
        setSession({
          userId: user.id,
          role: user.role,
          token: buildToken(user),
          lastActivityAt: Date.now(),
          tokenIssuedAt: Date.now(),
          profileSnapshot: buildProfileSnapshotFromUserRow(user)
        });
        void tryApiLoginBridge(user, passwordRaw);
        if (data.rememberCredentials) writeRememberedLoginCredentials(data.email, passwordRaw);
        else clearRememberedLoginCredentials();
        hideAuth();
        startSessionSecurityWatch();
        renderPortal();
      } finally {
        setLoginSubmitLoading(false);
        // Cada token Turnstile es de un solo uso: si la sesión no se cerró (error o bloqueo), refrescamos.
        if (!state.session) resetTurnstile(login);
      }
    });
  }

  if (register) {
    attachDepartmentCitySelects(register, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    const personTypeSel = register.querySelector("select[name='personType']");
    const docTypeSel = register.querySelector("#register-doc-persona select[name='documentType']");
    const blockPersona = register.querySelector("#register-doc-persona");
    const blockEmpresa = register.querySelector("#register-doc-empresa");
    const inputTaxPersona = register.querySelector("input[name='taxId']");
    const inputCompanyNit = register.querySelector("input[name='companyNit']");
    const inputPersonalTax = register.querySelector("input[name='personalTaxId']");
    const syncRegisterDocLayout = () => {
      const isJuridica = isPersonTypeJuridica(personTypeSel?.value);
      if (blockPersona) {
        blockPersona.classList.toggle("hidden", isJuridica);
        blockPersona.toggleAttribute("hidden", isJuridica);
      }
      if (blockEmpresa) {
        blockEmpresa.classList.toggle("hidden", !isJuridica);
        blockEmpresa.toggleAttribute("hidden", !isJuridica);
      }
      if (docTypeSel) {
        if (isJuridica) {
          docTypeSel.removeAttribute("required");
        } else {
          docTypeSel.setAttribute("required", "required");
        }
      }
      if (inputTaxPersona) {
        if (isJuridica) {
          inputTaxPersona.removeAttribute("required");
          inputTaxPersona.value = "";
        } else {
          inputTaxPersona.setAttribute("required", "required");
        }
      }
      if (inputCompanyNit) {
        if (isJuridica) inputCompanyNit.setAttribute("required", "required");
        else {
          inputCompanyNit.removeAttribute("required");
          inputCompanyNit.value = "";
        }
      }
      if (inputPersonalTax) {
        if (isJuridica) inputPersonalTax.setAttribute("required", "required");
        else {
          inputPersonalTax.removeAttribute("required");
          inputPersonalTax.value = "";
        }
      }
    };
    personTypeSel?.addEventListener("change", syncRegisterDocLayout);
    syncRegisterDocLayout();

    const registerPhoneNat = register.querySelector(".js-register-phone-national");
    const registerPhoneCc = register.querySelector(".js-register-phone-cc");
    if (registerPhoneNat) {
      registerPhoneNat.addEventListener("input", () => syncPhoneHiddenFull(register, "register"));
    }
    if (registerPhoneCc) {
      registerPhoneCc.addEventListener("change", () => {
        clearFieldError(registerPhoneNat);
        updatePhoneFieldForCountry(register, "register");
        syncPhoneHiddenFull(register, "register");
      });
    }
    updatePhoneFieldForCountry(register, "register");
    syncPhoneHiddenFull(register, "register");
    const regPass = register.querySelector("input[name='password']");
    const regPassConfirm = register.querySelector("input[name='passwordConfirm']");
    const syncRegisterPasswordMatchState = () => {
      if (!regPass || !regPassConfirm) return;
      regPass.classList.remove("password-match-ok", "password-match-bad");
      regPassConfirm.classList.remove("password-match-ok", "password-match-bad");
      const p1 = String(regPass.value || "");
      const p2 = String(regPassConfirm.value || "");
      if (!p1 && !p2) return;
      const same = p1.length > 0 && p1 === p2;
      regPass.classList.add(same ? "password-match-ok" : "password-match-bad");
      regPassConfirm.classList.add(same ? "password-match-ok" : "password-match-bad");
    };
    regPass?.addEventListener("input", syncRegisterPasswordMatchState);
    regPassConfirm?.addEventListener("input", syncRegisterPasswordMatchState);
    bindPasswordStrengthSuite(regPass, register.querySelector("#register-password-strength-suite"));
    register.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (register.dataset.submitting === "1") return;
      register.dataset.submitting = "1";
      const submitBtn = register.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      try {
      syncPhoneHiddenFull(register, "register");
      const data = Object.fromEntries(new FormData(register).entries());
      const fullName = [
        normalizeLatinUpperForDb(data.firstName),
        normalizeLatinUpperForDb(data.middleName),
        normalizeLatinUpperForDb(data.lastName),
        normalizeLatinUpperForDb(data.secondLastName)
      ]
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .join(" ");
      if (!fullName) {
        notify(userMessage("registerNamesInvalid"), "error");
        return;
      }
      data.personType = normalizePersonTypeForDb(data.personType);
      const isJuridica = data.personType === "Juridica";
      const docTypeUpper = String(data.documentType || "").toUpperCase();
      let personalDocStored = "";
      if (isJuridica) {
        const personalDocType = String(data.personalDocumentType || "CC").toUpperCase() === "CE" ? "CE" : "CC";
        const nitVal = validateColombianDocument("NIT", data.companyNit || "");
        const personalVal = validateColombianDocument(personalDocType, data.personalTaxId || "");
        if (!nitVal.ok) {
          notify(nitVal.message, "error");
          return;
        }
        if (!personalVal.ok) {
          notify(personalVal.message, "error");
          return;
        }
        data.companyNit = nitVal.normalized;
        data.personalTaxId = personalVal.normalized;
        data.taxId = nitVal.normalized;
        data.documentType = "NIT";
        personalDocStored = String(personalVal.normalized || "")
          .replace(/[.\s]/g, "")
          .replace(/\D/g, "");
      } else {
        const docValidation = validateColombianDocument(data.documentType, data.taxId);
        if (!docValidation.ok) {
          notify(docValidation.message, "error");
          return;
        }
        data.taxId = docValidation.normalized;
        data.companyNit = "";
        data.personalTaxId = "";
        if (docTypeUpper === "PAS") {
          personalDocStored = String(docValidation.normalized || "").trim().toUpperCase();
        } else {
          personalDocStored = String(docValidation.normalized || "")
            .replace(/[.\s]/g, "")
            .replace(/\D/g, "");
        }
      }
      if (String(data.password || "") !== String(data.passwordConfirm || "")) {
        notify(userMessage("registerPasswordMismatch"), "error");
        return;
      }
      const policy = validatePasswordPolicy(data.password);
      if (!policy.ok) {
        notify(userMessage(policy.key), "error");
        return;
      }
      if (!data.acceptTerms) {
        notify(userMessage("registerTerms"), "error");
        return;
      }
      const birthDateValue = new Date(String(data.birthDate || ""));
      if (!Number.isFinite(birthDateValue.getTime())) {
        notify(userMessage("registerBirthInvalid"), "error");
        return;
      }
      const ageYears = Math.floor((Date.now() - birthDateValue.getTime()) / 31557600000);
      if (ageYears < 18) {
        notify(userMessage("registerMinor"), "error");
        return;
      }
      const meta = getSelectedPhoneCountry(register, "register");
      const phoneDigitsAll = String(data.phone || "").replace(/\D/g, "");
      if (!phoneDigitsAll.startsWith(meta.dial)) {
        notify("El teléfono no coincide con el país seleccionado.", "error");
        return;
      }
      const nationalLen = phoneDigitsAll.length - meta.dial.length;
      if (nationalLen < meta.minNat || nationalLen > meta.maxNat) {
        notify(
          meta.style === "co"
            ? "Ingrese un celular colombiano válido (10 dígitos después de +57)."
            : `Ingrese entre ${meta.minNat} y ${meta.maxNat} dígitos del número local para ${meta.label}.`,
          "error"
        );
        return;
      }
      if (meta.style === "co") {
        const nat = phoneDigitsAll.slice(meta.dial.length);
        if (!nat.startsWith("3")) {
          notify("El celular en Colombia debe ser móvil (empieza por 3).", "error");
          return;
        }
      }

      if (window.AntaresApi?.getBase?.() && typeof window.AntaresApi.postJsonPublic === "function") {
        try {
          const turnstileToken = await waitForTurnstileToken(register);
          const body = await window.AntaresApi.postJsonPublic("/auth/register-portal", {
            firstName: normalizeLatinUpperForDb(data.firstName),
            middleName: normalizeLatinUpperForDb(data.middleName || ""),
            lastName: normalizeLatinUpperForDb(data.lastName),
            secondLastName: normalizeLatinUpperForDb(data.secondLastName || ""),
            personType: data.personType,
            documentType: normalizeLatinUpperForDb(data.documentType),
            taxId: data.taxId,
            companyNit: data.companyNit || "",
            personalTaxId: data.personalTaxId || "",
            personalDocumentType: isJuridica
              ? String(data.personalDocumentType || "CC").trim().toUpperCase()
              : undefined,
            birthDate: data.birthDate,
            gender: normalizeLatinUpperForDb(data.gender),
            position: normalizeLatinUpperForDb(data.position),
            workArea: normalizeLatinUpperForDb(data.workArea),
            phone: normalizeLatinUpperForDb(data.phone),
            department: normalizeLatinForDb(data.department),
            city: normalizeLatinForDb(data.city),
            address: normalizeLatinUpperForDb(data.address),
            email: data.email,
            registrationKind: normalizeRegistrationKindForDb(data.registrationKind),
            password: data.password,
            acceptTerms: Boolean(data.acceptTerms),
            turnstileToken
          });
          const serverMsg =
            typeof body === "object" && body !== null && typeof body.message === "string"
              ? body.message.trim()
              : "";
          const successMsg = serverMsg || userMessage("registerSuccess");
          state.registrationSuccessBanner = {
            message: successMsg,
            email: String(data.email || "").trim(),
            pendingApproval: !(typeof body === "object" && body !== null && body.pendingApproval === false)
          };
          notify(userMessage("registerToastSuccess"), "success", 12000);
          state.authTab = "login";
          renderAuthTab();
          return;
        } catch (err) {
          const rawMsg = String(err?.message || "");
          const msg = /failed to fetch/i.test(rawMsg)
            ? "No fue posible conectar con la API. Verifica CORS_ORIGINS en Render y que la API este activa."
            : rawMsg || userMessage("genericError");
          notify(msg, "error");
          resetTurnstile(register);
          return;
        }
      }

      const users = read(KEYS.users, []);
      if (users.some((u) => normalizeEmail(u.email) === normalizeEmail(data.email))) {
        notify(userMessage("registerEmailExists"), "error");
        return;
      }
      if (personalDocStored && users.some((u) => getPersonalRegistrationKey(u) === personalDocStored)) {
        notify(userMessage("registerPersonalDocExists"), "error");
        return;
      }
      const { passwordConfirm, acceptTerms, companyNit, personalTaxId, personalDocumentType, ...profileData } =
        data;
      const newUser = {
        id: newUuidV4(),
        ...profileData,
        firstName: normalizeLatinUpperForDb(data.firstName),
        middleName: normalizeLatinUpperForDb(data.middleName || ""),
        lastName: normalizeLatinUpperForDb(data.lastName),
        secondLastName: normalizeLatinUpperForDb(data.secondLastName || ""),
        personType: data.personType,
        documentType: normalizeLatinUpperForDb(data.documentType),
        companyNit: isJuridica ? normalizeLatinUpperForDb(data.companyNit || "") : "",
        personalTaxId: isJuridica ? normalizeLatinUpperForDb(data.personalTaxId || "") : "",
        personalDoc: String(personalDocStored || ""),
        gender: normalizeLatinUpperForDb(data.gender),
        position: normalizeLatinUpperForDb(data.position),
        workArea: normalizeLatinUpperForDb(data.workArea),
        phone: normalizeLatinUpperForDb(data.phone),
        department: normalizeLatinForDb(data.department),
        city: normalizeLatinForDb(data.city),
        address: normalizeLatinUpperForDb(data.address),
        registrationKind: normalizeRegistrationKindForDb(data.registrationKind),
        name: fullName,
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: ROLES.CLIENT,
        accountStatus: ACCOUNT_STATUS.PENDIENTE,
        companyId: null,
        company: "",
        permissions: defaultPermissionsForRole(ROLES.CLIENT),
        profileQualityChecklist: {
          idVerified: true,
          acceptedTermsAt: nowIso(),
          requiredFieldsCompleted: true,
          termsOfUseAccepted: true,
          privacyPolicyAccepted: true,
          habeasDataAcknowledged: true,
          registrationKind: normalizeRegistrationKindForDb(data.registrationKind),
          ...(isJuridica
            ? {
                representativeDocumentType: String(data.personalDocumentType || "CC")
                  .trim()
                  .toUpperCase()
              }
            : {})
        },
        registeredAt: nowIso()
      };
      users.push(newUser);
      write(KEYS.users, users);
      sendEmail({
        to: data.email,
        subject: "Registro recibido - Antares Portal",
        body: "Tu solicitud de registro fue recibida. Un administrador revisara tu cuenta y te notificaremos cuando sea aprobada."
      });
      const adminUsers = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
      adminUsers.forEach((admin) => {
        saveNotification({
          userId: admin.id,
          title: "Nuevo registro de cliente pendiente",
          body: `${fullName} solicita acceso al portal. Falta asociar empresa en aprobacion.`
        });
        sendEmail({
          to: admin.email,
          subject: "Nuevo registro de cliente pendiente de aprobacion",
          body: `Cliente: ${fullName} | Documento: ${data.documentType || "-"} ${data.taxId || "-"} | Correo: ${data.email}`
        });
      });
      const offlineMsg = userMessage("registerSuccess");
      state.registrationSuccessBanner = {
        message: offlineMsg,
        email: String(data.email || "").trim(),
        pendingApproval: true
      };
      notify(userMessage("registerOfflineToast"), "success", 12000);
      state.authTab = "login";
      renderAuthTab();
      } finally {
        register.dataset.submitting = "0";
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (recover) {
    recover.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(recover).entries());
      const email = normalizeEmail(String(data.email || ""));
      if (!email) {
        notify(userMessage("validationStep"), "error");
        return;
      }

      const api = window.AntaresApi;
      const apiBase = typeof api?.getBase === "function" ? api.getBase() : "";
      if (apiBase && typeof api?.postJsonPublic === "function") {
        try {
          const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
          const turnstileToken = await waitForTurnstileToken(recover);
          const body = await api.postJsonPublic("/auth/password-recovery/request", {
            email,
            redirectTo,
            turnstileToken
          });
          notify(String(body?.message || userMessage("recoverSentSupabase")), "info");
        } catch (err) {
          notify(String(err?.message || userMessage("recoverSupabaseError")), "error");
          resetTurnstile(recover);
        }
        return;
      }

      const supabase = await waitForAntaresSupabaseClient(15000);
      if (supabase) {
        try {
          const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
          if (error) {
            notify(String(error.message || userMessage("recoverSupabaseError")), "error");
            return;
          }
          notify(userMessage("recoverSentSupabase"), "info");
        } catch (err) {
          notify(String(err?.message || userMessage("recoverSupabaseError")), "error");
        }
        return;
      }

      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === email);
      if (!user) {
        notify(userMessage("recoverNoUser"), "error");
        return;
      }
      sendEmail({
        to: user.email,
        subject: "Recuperacion de contrasena",
        body: `Hola ${user.name}, se solicito recuperacion de acceso. Por seguridad, solicita a un administrador restablecer tu contrasena.`
      });
      notify(userMessage("recoverSent"), "info");
    });
  }

  const recoverComplete = document.getElementById("form-recover-complete");
  if (recoverComplete) {
    recoverComplete.addEventListener("submit", async (event) => {
      event.preventDefault();
      const apiBase = window.AntaresApi?.getBase?.();
      if (!apiBase) {
        notify(userMessage("recoverCompleteNeedsApi"), "error");
        return;
      }
      const fd = new FormData(recoverComplete);
      const p1 = String(fd.get("password") || "");
      const p2 = String(fd.get("passwordConfirm") || "");
      if (p1 !== p2) {
        notify(userMessage("registerPasswordMismatch"), "error");
        return;
      }
      const policy = validatePasswordPolicy(p1);
      if (!policy.ok) {
        notify(userMessage(policy.key), "error");
        return;
      }
      const supabase = window.antaresSupabase || (await waitForAntaresSupabaseClient(5000));
      if (!supabase) {
        notify(userMessage("recoverSupabaseUnavailable"), "error");
        return;
      }
      const { data: sessWrap } = await supabase.auth.getSession();
      const token = sessWrap?.session?.access_token;
      if (!token) {
        notify(userMessage("recoverSessionMissing"), "error");
        return;
      }
      try {
        const base = String(apiBase).replace(/\/+$/, "");
        const res = await fetch(`${base}/api/auth/password-recovery/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ password: p1 })
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
          notify(String(msg || userMessage("recoverCompleteError")), "error");
          return;
        }
        await supabase.auth.signOut();
        try {
          sessionStorage.removeItem("antares_pw_recovery_pending");
        } catch (_e0) {}
        state.authSupabaseRecovery = false;
        state.authTab = "login";
        notify(String(body?.message || userMessage("recoverCompleteSuccess")), "success", 8000);
        renderAuthTab();
      } catch (_e) {
        notify(userMessage("authNoConnection"), "error");
      }
    });
  }
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function diffMinutes(fromIso) {
  return (Date.now() - new Date(fromIso).getTime()) / 60000;
}

function intervalsOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  if (![aStart, aEnd, bStart, bEnd].every(Number.isFinite)) return false;
  return aStart < bEnd && bStart < aEnd;
}

function activeTripStatuses() {
  return [STATUS.VIAJE_ASIGNADO, STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY];
}

function getActiveTrips() {
  const requests = reqRead();
  return requests.filter((r) => r.trip && activeTripStatuses().includes(r.status));
}

function recalculateResourceAvailability() {
  const activeTrips = getActiveTrips();
  const busyVehicleIds = new Set(activeTrips.map((r) => r.trip?.vehicleId).filter(Boolean));
  const busyDriverIds = new Set(activeTrips.map((r) => r.trip?.driverId).filter(Boolean));

  const vehicles = read(KEYS.vehicles, []);
  const drivers = read(KEYS.drivers, []);

  let vehiclesChanged = false;
  const nextVehicles = vehicles.map((vehicle) => {
    if (busyVehicleIds.has(vehicle.id)) {
      if (vehicle.available === false && vehicle.autoBusy === true) return vehicle;
      vehiclesChanged = true;
      return { ...vehicle, available: false, autoBusy: true };
    }
    if (vehicle.autoBusy) {
      vehiclesChanged = true;
      return { ...vehicle, available: true, autoBusy: false };
    }
    return vehicle;
  });

  let driversChanged = false;
  const nextDrivers = drivers.map((driver) => {
    if (busyDriverIds.has(driver.id)) {
      if (driver.available === false && driver.autoBusy === true) return driver;
      driversChanged = true;
      return { ...driver, available: false, autoBusy: true };
    }
    if (driver.autoBusy) {
      driversChanged = true;
      return { ...driver, available: true, autoBusy: false };
    }
    return driver;
  });

  if (vehiclesChanged || driversChanged) {
    void (async () => {
      try {
        if (vehiclesChanged) await writeAwaitServer(KEYS.vehicles, nextVehicles);
        if (driversChanged) await writeAwaitServer(KEYS.drivers, nextDrivers);
      } catch (_e) {}
    })();
  }
}

function buildTripInvoice(request) {
  if (!request?.trip) return null;
  if (request.trip.invoice) return request.trip.invoice;
  const base = parseNum(request.tripValue || request.insuredValue || 0);
  const standby = parseNum(request.standbyChargeTotal || 0);
  const subtotal = base + standby;
  const ivaRate = 0.19;
  const iva = Math.round(subtotal * ivaRate);
  const total = subtotal + iva;
  return {
    number: `FAC-${String(nextCounter("invoice")).padStart(6, "0")}`,
    generatedAt: nowLocalIso(),
    currency: "COP",
    baseValue: base,
    standbyValue: standby,
    subtotal,
    ivaRate,
    ivaValue: iva,
    total,
    issuer: "Antares Tecnologia SAS"
  };
}

function closeCompletedTripsAndGenerateInvoices() {
  const requests = reqRead();
  let changed = false;
  const oneHourMs = 60 * 60 * 1000;
  const now = Date.now();
  const next = requests.map((request) => {
    if (!request?.trip || request.status !== STATUS.COMPLETADA || !request.deliveredAt) return request;
    const deliveredTs = new Date(request.deliveredAt).getTime();
    if (!Number.isFinite(deliveredTs) || now - deliveredTs < oneHourMs) return request;
    changed = true;
    return {
      ...request,
      status: STATUS.CERRADA,
      closedAt: nowLocalIso(),
      trip: {
        ...request.trip,
        realtimeStatus: STATUS.CERRADA,
        invoice: buildTripInvoice(request)
      }
    };
  });
  if (changed) {
    void (async () => {
      try {
        await reqWriteAwait(next);
      } catch (_e) {}
      recalculateResourceAvailability();
    })();
  }
}

function openTripInvoicePdf(requestId) {
  const request = reqRead().find((r) => r.id === requestId);
  if (!request?.trip) {
    notify(userMessage("invoiceNoTrip"), "error");
    return;
  }
  const invoice = request.trip.invoice || buildTripInvoice(request);
  const requests = reqRead();
  void (async () => {
    try {
      await reqWriteAwait(requests.map((r) => (r.id === requestId ? { ...r, trip: { ...r.trip, invoice } } : r)));
    } catch (_e) {}
  })();

  const html = `<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Factura ${invoice.number}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:24px;background:#f8fafc}
      .sheet{max-width:900px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:26px}
      .head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:18px}
      h1{font-size:24px;margin:0;color:#0b3f8a}
      .muted{color:#64748b;font-size:12px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}
      .box{border:1px solid #e2e8f0;border-radius:10px;padding:12px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px}
      th{background:#eff6ff;color:#1e3a8a}
      .totals{margin-top:16px;max-width:320px;margin-left:auto}
      .totals div{display:flex;justify-content:space-between;padding:6px 0}
      .grand{font-size:18px;font-weight:700;color:#0b3f8a;border-top:1px solid #cbd5e1;margin-top:6px;padding-top:10px}
      @media print{body{background:#fff;padding:0}.sheet{border:none;border-radius:0;max-width:none;padding:0}}
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="head">
        <div>
          <h1>Factura de viaje ${invoice.number}</h1>
          <div class="muted">Generada: ${fmtDate(invoice.generatedAt)}</div>
        </div>
        <div>
          <strong>${invoice.issuer}</strong><br />
          <span class="muted">NIT 900.000.000-0</span>
        </div>
      </div>
      <div class="grid">
        <div class="box">
          <strong>Cliente</strong><br />
          ${request.clientName || "-"}<br />
          <span class="muted">Solicitud: ${request.requestNumber || request.id}</span>
        </div>
        <div class="box">
          <strong>Viaje</strong><br />
          ${request.trip.tripNumber || "-"}<br />
          <span class="muted">${request.trip.vehiclePlate || "-"} · ${request.trip.driverName || "-"}</span>
        </div>
      </div>
      <table>
        <thead><tr><th>Concepto</th><th>Detalle</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Servicio de transporte</td><td>${formatRoute(request)}</td><td>$${invoice.baseValue.toLocaleString("es-CO")}</td></tr>
          <tr><td>Standby</td><td>Cargos por espera</td><td>$${invoice.standbyValue.toLocaleString("es-CO")}</td></tr>
        </tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>$${invoice.subtotal.toLocaleString("es-CO")}</strong></div>
        <div><span>IVA (${Math.round(invoice.ivaRate * 100)}%)</span><strong>$${invoice.ivaValue.toLocaleString("es-CO")}</strong></div>
        <div class="grand"><span>Total</span><span>$${invoice.total.toLocaleString("es-CO")}</span></div>
      </div>
      <p class="muted" style="margin-top:18px">Documento generado automaticamente por Antares. Esta factura refleja el cierre operacional del viaje.</p>
    </div>
    <script>window.print()</script>
  </body>
  </html>`;
  const win = window.open("", "_blank");
  if (!win) {
    notify(userMessage("invoicePopupBlocked"), "error");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

function canClientManageRequest(request) {
  if (!request) return false;
  return currentUser()?.role === ROLES.ADMIN && request.status === STATUS.PENDIENTE;
}

function hasUnsavedPortalFormData() {
  const modal = document.getElementById("crud-modal");
  if (modal && !modal.classList.contains("hidden")) return true;
  if (!nodes.viewRoot) return false;
  const forms = [...nodes.viewRoot.querySelectorAll("form")];
  if (!forms.length) return false;
  if (document.activeElement && nodes.viewRoot.contains(document.activeElement) && document.activeElement.closest("form")) {
    return true;
  }
  return forms.some((form) => {
    const fields = [...form.querySelectorAll("input, select, textarea")];
    return fields.some((field) => {
      const el = field;
      if (el.disabled || el.readOnly) return false;
      const type = String(el.type || "").toLowerCase();
      if (["hidden", "submit", "button", "reset"].includes(type)) return false;
      if (type === "checkbox" || type === "radio") return !!el.checked;
      if (type === "file") return !!el.files?.length;
      return String(el.value || "").trim() !== "";
    });
  });
}

function applyStandbyCharge(request, actorName) {
  const hoursRaw = prompt("Horas en standby:", "1");
  if (!hoursRaw) return null;
  const rateRaw = prompt("Valor por hora standby:", "50000");
  if (!rateRaw) return null;
  const hours = Math.max(1, parseNum(hoursRaw));
  const rate = Math.max(0, parseNum(rateRaw));
  const value = hours * rate;
  const currentTotal = parseNum(request.standbyChargeTotal);
  const event = {
    id: newUuidV4(),
    hours,
    rate,
    value,
    createdAt: nowIso(),
    createdBy: actorName
  };
  return {
    standbyChargeTotal: currentTotal + value,
    standbyEvents: [...(request.standbyEvents || []), event]
  };
}

function transitionRequestStatus(requestId, nextStatus, actorName = "Sistema") {
  const requests = reqRead();
  const target = requests.find((request) => request.id === requestId);
  if (!target) return false;

  if (!canTransitionStatus(target.status, nextStatus)) {
    notify(userMessage("tripTransitionDenied", target.status, nextStatus), "error");
    return false;
  }

  let extra = {};
  if (nextStatus === STATUS.ESPERA_STANDBY) {
    const standbyData = applyStandbyCharge(target, actorName);
    if (!standbyData) return false;
    extra = standbyData;
  }

  const updated = requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status: nextStatus,
          ...extra,
          deliveredAt: nextStatus === STATUS.COMPLETADA ? nowIso() : request.deliveredAt,
          closedAt: nextStatus === STATUS.CERRADA ? nowLocalIso() : request.closedAt,
          trip: request.trip
            ? {
                ...request.trip,
                realtimeStatus: nextStatus,
                invoice: nextStatus === STATUS.CERRADA ? request.trip.invoice || buildTripInvoice(request) : request.trip.invoice
              }
            : request.trip
        }
      : request
  );
  void (async () => {
    try {
      await reqWriteAwait(updated);
    } catch (_e) {}
    recalculateResourceAvailability();
  })();
  return true;
}

function isVehicleBusyAtHour(vehicle, pickupAt, etaDelivery, currentRequestId = null) {
  return getActiveTrips().some((request) => {
    if (currentRequestId && request.id === currentRequestId) return false;
    const tripStart = request.trip?.etaPickup;
    const tripEnd = request.trip?.etaDelivery || tripStart;
    const conflict = intervalsOverlap(tripStart, tripEnd, pickupAt, etaDelivery);
    if (!conflict) return false;
    return request.trip.vehicleId
      ? request.trip.vehicleId === vehicle.id
      : request.trip.vehiclePlate === vehicle.plate;
  });
}

function isDriverBusyAtHour(driver, pickupAt, etaDelivery, currentRequestId = null) {
  return getActiveTrips().some((request) => {
    if (currentRequestId && request.id === currentRequestId) return false;
    const tripStart = request.trip?.etaPickup;
    const tripEnd = request.trip?.etaDelivery || tripStart;
    const conflict = intervalsOverlap(tripStart, tripEnd, pickupAt, etaDelivery);
    if (!conflict) return false;
    return request.trip.driverId
      ? request.trip.driverId === driver.id
      : request.trip.driverName === driver.name;
  });
}

function selectBestVehicle(requiredType, weight, pickupAt, etaDelivery, currentRequestId = null, options = {}) {
  const requiresRefrigeration = Boolean(options.requiresRefrigeration);
  const vehicles = read(KEYS.vehicles, []);
  const matchesThermal = (v) => !requiresRefrigeration || v.refrigerated;
  const filtered = vehicles.filter(
    (v) =>
      v.available &&
      matchesThermal(v) &&
      (!requiredType || v.type === requiredType) &&
      !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
  );
  const pick =
    filtered.find((v) => v.capacityKg >= weight) ||
    filtered[0] ||
    vehicles.find(
      (v) => v.available && matchesThermal(v) && !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
    ) ||
    null;
  return pick || null;
}

function selectDriver(pickupAt, etaDelivery, currentRequestId = null) {
  const drivers = read(KEYS.drivers, []);
  return (
    drivers.find((d) => d.available && !isDriverBusyAtHour(d, pickupAt, etaDelivery, currentRequestId)) ||
    null
  );
}

/** Solicitud con Thermo King o valores legacy que implican refrigeración. */
function serviceTypeRequiresRefrigeration(serviceType) {
  const s = String(serviceType || "").toLowerCase();
  return (
    s.includes("termoking") ||
    s.includes("thermo king") ||
    s.includes("refrigerada") ||
    s.includes("refrigerado")
  );
}

function getCompatibleVehiclesForRequest(request, currentRequestId = null) {
  const requiresRefrigeration = serviceTypeRequiresRefrigeration(request?.serviceType);
  return read(KEYS.vehicles, []).filter((vehicle) => {
    if (!vehicle.available) return false;
    if (request?.vehicleType && vehicle.type !== request.vehicleType) return false;
    if (parseNum(vehicle.capacityKg) < parseNum(request?.weightKg)) return false;
    if (requiresRefrigeration && !vehicle.refrigerated) return false;
    if (docExpiryStatus(vehicle.soatExpeditionDate).days < 0) return false;
    if (docExpiryStatus(vehicle.techInspectionExpeditionDate).days < 0) return false;
    if (isVehicleBusyAtHour(vehicle, request?.pickupAt, request?.etaDelivery || request?.pickupAt, currentRequestId)) return false;
    return true;
  });
}

function getCompatibleDriversForRequest(request, currentRequestId = null) {
  return read(KEYS.drivers, []).filter(
    (driver) =>
      driver.available &&
      daysUntil(driver.licenseExpiry) >= 0 &&
      !isDriverBusyAtHour(driver, request?.pickupAt, request?.etaDelivery || request?.pickupAt, currentRequestId)
  );
}

function getVehicleCandidatesForRequest(request, currentRequestId = null) {
  const requiresRefrigeration = serviceTypeRequiresRefrigeration(request?.serviceType);
  return read(KEYS.vehicles, [])
    .filter((vehicle) => {
      if (request?.vehicleType && vehicle.type !== request.vehicleType) return false;
      if (parseNum(vehicle.capacityKg) < parseNum(request?.weightKg)) return false;
      if (requiresRefrigeration && !vehicle.refrigerated) return false;
      return true;
    })
    .map((vehicle) => {
      const soatDays = docExpiryStatus(vehicle.soatExpeditionDate).days;
      const techDays = docExpiryStatus(vehicle.techInspectionExpeditionDate).days;
      const busy = isVehicleBusyAtHour(vehicle, request?.pickupAt, request?.etaDelivery || request?.pickupAt, currentRequestId);
      return {
        ...vehicle,
        isBusy: busy || !vehicle.available,
        hasExpiredDocs: soatDays < 0 || techDays < 0
      };
    });
}

function getDriverCandidatesForRequest(request, currentRequestId = null) {
  return read(KEYS.drivers, []).map((driver) => {
    const expiredLicense = daysUntil(driver.licenseExpiry) < 0;
    const busy = isDriverBusyAtHour(driver, request?.pickupAt, request?.etaDelivery || request?.pickupAt, currentRequestId);
    return {
      ...driver,
      isBusy: busy || !driver.available,
      hasExpiredDocs: expiredLicense
    };
  });
}

function makeTripNumber(existingNumbers = new Set()) {
  let code = `VIA-${String(nextCounter("trip")).padStart(6, "0")}`;
  while (existingNumbers.has(code)) {
    code = `VIA-${String(nextCounter("trip")).padStart(6, "0")}`;
  }
  return code;
}

async function setVehicleAvailability(vehicleId, available) {
  const vehicles = read(KEYS.vehicles, []);
  const next = vehicles.map((v) => (v.id === vehicleId ? { ...v, available } : v));
  try {
    await writeAwaitServer(KEYS.vehicles, next);
  } catch (_e) {}
}

async function setDriverAvailability(driverId, available) {
  const drivers = read(KEYS.drivers, []);
  const next = drivers.map((d) => (d.id === driverId ? { ...d, available } : d));
  try {
    await writeAwaitServer(KEYS.drivers, next);
  } catch (_e) {}
}

function approveRequest(requestId, actorName = "Sistema", auto = false, selectedVehicleId = "", selectedDriverId = "", selectedTripValue = null) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  const canAssignTrip = current && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(current.status);
  if (!current || !canAssignTrip) return false;

  if (auto) {
    const systemTimerApprove = String(actorName || "").trim() === "Sistema";
    const mapped = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
            approvedAt: nowIso(),
            approvedBy: actorName,
            autoApproved: systemTimerApprove,
            rejectionReason: ""
          }
        : r
    );
    void (async () => {
      try {
        await reqWriteAwait(mapped);
      } catch (_e) {}
      if (current.apiSynced && window.DomainModules?.requests?.approveViaApi) {
        void window.DomainModules.requests.approveViaApi(requestId).catch(() => {});
      }
      const targetUser = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
      if (targetUser) {
        saveNotification({
          userId: targetUser.id,
          title: systemTimerApprove ? "Solicitud aprobada automáticamente" : "Solicitud aprobada",
          body: systemTimerApprove
            ? `Su solicitud ${current.requestNumber || current.id} fue aprobada por el tiempo de respuesta configurado y queda pendiente de asignación de viaje.`
            : `Su solicitud ${current.requestNumber || current.id} fue aprobada y queda pendiente de asignación de viaje.`
        });
        try {
          await writeAwaitServer(KEYS.notifications, read(KEYS.notifications, []));
        } catch (_e) {}
      }
    })();
    return true;
  }

  const compatibleVehicles = getCompatibleVehiclesForRequest(current, requestId);
  const compatibleDrivers = getCompatibleDriversForRequest(current, requestId);

  const vehicle = selectedVehicleId
    ? compatibleVehicles.find((item) => item.id === selectedVehicleId) || null
    : selectBestVehicle(
      current.vehicleType,
      parseNum(current.weightKg),
      current.pickupAt,
      current.etaDelivery || current.pickupAt,
      requestId,
      { requiresRefrigeration: serviceTypeRequiresRefrigeration(current.serviceType) }
    );
  const driver = selectedDriverId
    ? compatibleDrivers.find((item) => item.id === selectedDriverId) || null
    : selectDriver(current.pickupAt, current.etaDelivery || current.pickupAt, requestId);

  if (!vehicle || !driver) {
    notify(userMessage("noCompatibleResources"), "error");
    return false;
  }

  const usedTripNumbers = new Set(
    requests.map((request) => String(request.trip?.tripNumber || "").trim()).filter(Boolean)
  );
  const trip = {
    id: newUuidV4(),
    tripNumber: makeTripNumber(usedTripNumbers),
    vehicleId: vehicle.id,
    vehiclePlate: vehicle ? vehicle.plate : "SIN-DISP",
    vehicleType: vehicle ? vehicle.type : current.vehicleType,
    driverId: driver.id,
    driverName: driver ? driver.name : "Por definir",
    driverPhone: driver ? driver.phone : "-",
    route: formatRoute(current),
    etaPickup: current.pickupAt,
    etaDelivery: current.etaDelivery || current.pickupAt,
    assignedBy: actorName,
    assignedAt: nowLocalIso(),
    realtimeStatus: STATUS.VIAJE_ASIGNADO
  };

  const next = requests.map((r) =>
    r.id === requestId
      ? {
          ...r,
          tripValue: parseNum(selectedTripValue ?? r.tripValue),
          status: STATUS.VIAJE_ASIGNADO,
          approvedAt: nowLocalIso(),
          approvedBy: actorName,
          autoApproved: auto,
          rejectionReason: "",
          trip
        }
      : r
  );
  void (async () => {
    try {
      await reqWriteAwait(next);
    } catch (_e) {}

    const users = read(KEYS.users, []);
    const target = users.find((u) => u.id === current.clientUserId);
    if (target) {
      saveNotification({
        userId: target.id,
        title: "Solicitud aprobada",
        body: `Su solicitud ${current.requestNumber || current.id} fue aprobada${auto ? " automáticamente" : ""}. Viaje ${trip.tripNumber}.`
      });
      sendEmail({
        to: target.email,
        subject: "Solicitud aprobada",
        body: `Viaje ${trip.tripNumber} · Vehículo ${trip.vehiclePlate} · Conductor ${trip.driverName}`
      });
      try {
        await writeAwaitServer(KEYS.notifications, read(KEYS.notifications, []));
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
    }
  })();
  return true;
}

async function rejectRequest(requestId, reason, actorName) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  if (!current) return;
  const next = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: STATUS.RECHAZADA, approvedAt: nowIso(), approvedBy: actorName, rejectionReason: reason }
      : r
  );
  await reqWriteAwait(next);

  const user = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
  if (user) {
    saveNotification({ userId: user.id, title: "Solicitud rechazada", body: `Su solicitud fue rechazada. Motivo: ${reason}` });
    sendEmail({ to: user.email, subject: "Solicitud rechazada", body: reason });
    try {
      await writeAwaitServer(KEYS.notifications, read(KEYS.notifications, []));
      await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
    } catch (_e) {}
  }
}

function updateAutoApprove() {
  const requests = reqRead();
  let changed = false;
  requests
    .filter((r) => r.status === STATUS.PENDIENTE)
    .forEach((r) => {
      if (diffMinutes(r.createdAt) >= AUTO_APPROVE_MINUTES) {
        if (approveRequest(r.id, "Sistema", true)) changed = true;
      }
    });
  return changed;
}

function minutesRemaining(createdAt) {
  const left = AUTO_APPROVE_MINUTES - diffMinutes(createdAt);
  return Math.max(0, Math.ceil(left));
}

function currentUser() {
  const users = read(KEYS.users, []);
  const sid = state.session?.userId;
  if (sid === undefined || sid === null) return null;
  return users.find((u) => String(u.id) === String(sid)) || null;
}

/** Si `name` es stub JWT/local-part del correo pero hay partes de registro en BD, no usar ese placeholder. */
function portalUserNameLooksLikeEmailPlaceholder(nameStr, emailStr) {
  const raw = String(nameStr ?? "").trim();
  const em = String(emailStr ?? "").trim().toLowerCase();
  if (!raw || !em) return !raw;
  if (raw.toLowerCase() === em) return true;
  const local = em.split("@")[0] || "";
  if (!local) return false;
  const fold = (s) => String(s || "").replace(/[.\s_-]+/g, "").toLowerCase();
  return fold(raw) === fold(local);
}

/** Nombre para UI: prioriza nombre legal coherente (PostgreSQL o partes de registro); evita mostrar solo el local-part del correo si hay datos reales. */
function getPortalUserDisplayName(user) {
  if (!user) return "Usuario";
  const composed = [user.firstName, user.middleName, user.lastName, user.secondLastName]
    .map((x) => String(x ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  const raw = String(user.name ?? "").trim();
  const em = String(user.email ?? "").trim();
  const placeholder = portalUserNameLooksLikeEmailPlaceholder(raw, em);
  if (composed && (!raw || placeholder)) return composed;
  if (raw && !placeholder && !raw.includes("@")) return raw;
  if (composed) return composed;
  if (raw) {
    if (raw.includes("@")) {
      const lp = raw.split("@")[0];
      return lp.replace(/[._-]+/g, " ").trim() || raw;
    }
    return raw;
  }
  const eml = em.toLowerCase();
  if (eml) {
    const local = eml.split("@")[0] || eml;
    const nicer = local.replace(/[._-]+/g, " ").trim();
    return nicer || em;
  }
  return "Usuario";
}

function formatPortalRoleLabel(role) {
  const r = String(role || "").toLowerCase();
  if (r === ROLES.ADMIN) return "Administrador";
  if (r === ROLES.CLIENT) return "Cliente";
  if (r === ROLES.RRHH) return "Recursos humanos";
  if (r === ROLES.ADMINISTRACION) return "Administración";
  if (r === ROLES.AUXILIAR_ADMINISTRATIVO) return "Auxiliar administrativo";
  if (r === ROLES.LIDER_ADMINISTRATIVO) return "Líder administrativo";
  return String(role || "usuario").toUpperCase();
}

function updatePortalSidebarSessionMeta() {
  if (!nodes.sessionMeta) return;
  const user = currentUser();
  if (!user) {
    nodes.sessionMeta.textContent = "";
    return;
  }
  nodes.sessionMeta.textContent = `${getPortalUserDisplayName(user)} · ${formatPortalRoleLabel(user.role)}`;
}

function getVisibleRequestsForUser(user) {
  const requests = reqRead();
  if (!user) return [];
  if (user.role === ROLES.ADMIN) return requests;
  return requests.filter((request) => request.clientCompanyId === user.companyId);
}

function hasPermission(user, permission) {
  if (!permission) return true;
  if (user?.role === ROLES.ADMIN) return true;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes(permission);
}

/**
 * Verificación rápida de rol administrador para condicionar render de botones destructivos.
 * Acepta un usuario opcional; por defecto lee el actor de la sesión actual.
 * Cualquier acción destructiva (delete-*) debe envolverse con esto en el HTML para no
 * exponer botones a usuarios que no son admin (defensa en profundidad junto a
 * `PORTAL_NON_ADMIN_BLOCKED_ACTIONS`).
 */
function isAdminActor(user) {
  const actor = user || currentUser();
  return actor?.role === ROLES.ADMIN;
}

function canAccessView(user, view) {
  return hasPermission(user, VIEW_PERMISSIONS[view]);
}

function canAccessRRHH(role) {
  return [
    ROLES.ADMIN,
    ROLES.RRHH,
    ROLES.ADMINISTRACION,
    ROLES.AUXILIAR_ADMINISTRATIVO,
    ROLES.LIDER_ADMINISTRATIVO
  ].includes(role);
}

function requiresAdminHrApproval(role) {
  return [
    ROLES.RRHH,
    ROLES.ADMINISTRACION,
    ROLES.AUXILIAR_ADMINISTRATIVO,
    ROLES.LIDER_ADMINISTRATIVO
  ].includes(role);
}

function isViewAllowedForUser(user, view) {
  return PortalAccessCore.isViewAllowed({
    user,
    view,
    canAccessView,
    portalArch: PortalArch,
    ROLES,
    canAccessRRHH
  });
}

function viewFromPortalHash() {
  const h = String(window.location.hash || "").split("?")[0].replace(/\/+$/, "");
  if (h === "#portal/transport-requests") {
    history.replaceState(null, "", "#portal/authorizations");
    return PortalArch.isKnownView("authorizations") ? "authorizations" : "";
  }
  return PortalRouterCore.getViewFromHash({
    hash: window.location.hash,
    isKnownView: PortalArch.isKnownView
  });
}

function syncPortalHash(view) {
  PortalRouterCore.syncHash({
    view,
    isKnownView: PortalArch.isKnownView,
    fallbackView: "dashboard"
  });
}

function enforcePortalViewFromUrl(user) {
  PortalRouterCore.enforceViewFromUrl({
    state,
    user,
    getViewFromHashFn: viewFromPortalHash,
    syncHashFn: syncPortalHash,
    isViewAllowed: isViewAllowedForUser,
    fallbackView: "dashboard",
    onUnauthorized: () => alert("Ruta no autorizada. Se redirigio al dashboard.")
  });
}

function setView(view) {
  const user = currentUser();
  if (!user) return;
  if (!isViewAllowedForUser(user, view)) {
    alert("No tienes permisos para acceder a este módulo.");
    return;
  }
  state.currentView = view;
  syncPortalHash(view);
  PortalRouterCore.activateSideLinks(nodes.sideLinks, view);
  renderPortalView();
}

function setPortalDrawerOpen(open) {
  if (typeof document === "undefined") return;
  const on = Boolean(open);
  document.body.classList.toggle("portal-drawer-open", on);
  const btn = document.getElementById("portal-menu-btn");
  const bd = document.getElementById("portal-nav-backdrop");
  if (btn) {
    btn.setAttribute("aria-expanded", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Cerrar menu de modulos" : "Abrir menu de modulos");
  }
  if (bd) bd.setAttribute("aria-hidden", on ? "false" : "true");
}

function renderPortal() {
  let session = getSession();
  if (!session) {
    stopSessionSecurityWatch();
    stopNotificationsPolling();
    setPortalDrawerOpen(false);
    document.body.classList.remove("portal-mode");
    document.body.classList.remove("public-nav-open");
    /** Quitamos el guard de booting: el usuario no tiene sesión, debe ver el sitio público. */
    document.documentElement.classList.remove("antares-booting-portal");
    const pubNav = document.getElementById("main-nav");
    if (pubNav) pubNav.classList.remove("nav-open");
    const pubHam = document.getElementById("hamburger-btn");
    if (pubHam) pubHam.setAttribute("aria-expanded", "false");
    nodes.publicApp.classList.remove("hidden");
    nodes.portalApp.classList.add("hidden");
    return;
  }
  const ts = Date.now();
  if (typeof session.lastActivityAt !== "number") {
    /**
     * F5 sin bump previo: la sesión existe pero le falta `lastActivityAt`. La consideramos
     * activa "ahora" para no expulsar al usuario por culpa de un timestamp ausente, y
     * persistimos el cambio para que la próxima recarga ya tenga marca consistente.
     */
    session = {
      ...session,
      lastActivityAt: ts,
      tokenIssuedAt: typeof session.tokenIssuedAt === "number" ? session.tokenIssuedAt : ts
    };
    setSession(session);
  } else if (ts - getEffectiveLastActivityAt() > SESSION_IDLE_MS) {
    /** Solo aquí cerramos sesión: > 30 min sin interacción real (regla de inactividad). */
    clearSession();
    notify(userMessage("sessionIdle"), "info");
    renderPortal();
    return;
  }
  state.session = session;
  document.body.classList.remove("public-nav-open");
  const pubNavOpen = document.getElementById("main-nav");
  if (pubNavOpen) pubNavOpen.classList.remove("nav-open");
  const pubHamOpen = document.getElementById("hamburger-btn");
  if (pubHamOpen) pubHamOpen.setAttribute("aria-expanded", "false");
  document.body.classList.add("portal-mode");
  setPortalDrawerOpen(false);
  nodes.publicApp.classList.add("hidden");
  nodes.portalApp.classList.remove("hidden");
  /** El portal ya está en pantalla: liberamos la regla anti-flash del boot guard inline. */
  document.documentElement.classList.remove("antares-booting-portal");
  const user = materializePortalUserFromSession(session);
  if (!user) {
    /**
     * Materialización falló (caso muy raro: sesión sin userId+role+snapshot). En vez de
     * expulsar al usuario, mostramos aviso y dejamos visible el portal vacío para que pueda
     * reintentar (recargar manualmente o esperar al bootstrap diferido). Cerrar sesión aquí
     * provocaba "deslogueo" al pulsar F5 cuando la API tarda en responder.
     */
    devWarn("Portal: no se pudo materializar usuario tras F5; se mantiene la sesión.");
    notify(userMessage("authProfileLoadFailed") || "Cargando perfil…", "info");
    return;
  }

  updatePortalSidebarSessionMeta();
  document.querySelectorAll(".admin-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.ADMIN));
  document.querySelectorAll(".client-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.CLIENT));
  document.querySelectorAll(".rrhh-only").forEach((n) => n.classList.toggle("hidden", !canAccessRRHH(user.role)));
  nodes.sideLinks.forEach((link) => {
    const isRoleHidden =
      (link.classList.contains("admin-only") && user.role !== ROLES.ADMIN) ||
      (link.classList.contains("client-only") && user.role !== ROLES.CLIENT) ||
      (link.classList.contains("rrhh-only") && !canAccessRRHH(user.role));
    const view = link.dataset.view;
    const allowedByPermission = isViewAllowedForUser(user, view);
    link.classList.toggle("hidden", isRoleHidden || !allowedByPermission);
  });
  renderKpis();
  /**
   * Si tras F5 caímos en stub (cache de usuarios todavía no rehidratado y permisos vacíos para no-admin),
   * no reescribimos la URL todavía: respetamos el hash original (`#portal/...`) y dejamos que
   * `__portalRefreshAfterBootstrap` re-evalúe permisos cuando la API responda. Así el usuario no
   * pierde su vista actual aunque el bootstrap esté lento o falle temporalmente.
   */
  const userPermsArr = Array.isArray(user.permissions) ? user.permissions : [];
  const userIsAdmin = user.role === ROLES.ADMIN;
  const hydratingStub = !userIsAdmin && userPermsArr.length === 0;
  if (hydratingStub) {
    const urlView = viewFromPortalHash();
    if (urlView && PortalArch.isKnownView(urlView)) {
      state.currentView = urlView;
    }
  } else {
    enforcePortalViewFromUrl(user);
    if (!isViewAllowedForUser(user, state.currentView)) {
      state.currentView = "dashboard";
      syncPortalHash("dashboard");
    }
  }
  renderPortalView();
  updateNotificationBadge();
  startNotificationsPolling();
  startSessionSecurityWatch();
}

let __notificationsPollHandle = null;
let __lastSeenNotificationIds = null;

function stopNotificationsPolling() {
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", __onNotificationsVisibilityChange);
  }
  if (__notificationsPollHandle != null) {
    clearInterval(__notificationsPollHandle);
    __notificationsPollHandle = null;
  }
  __lastSeenNotificationIds = null;
}

function __notificationsPollIntervalMs() {
  return typeof document !== "undefined" && document.hidden ? 50000 : 8000;
}

function __onNotificationsVisibilityChange() {
  if (__notificationsPollHandle == null) return;
  clearInterval(__notificationsPollHandle);
  __notificationsPollHandle = null;
  __notificationsPollHandle = setInterval(__tickNotificationsPoll, __notificationsPollIntervalMs());
}

/**
 * Ejecuta una rutina automática del sistema (auto-aprobación, cierres por
 * timer, etc.) y marca como "ya vistas" cualquier notificación que esa
 * rutina haya generado, para que el poll de la bandeja NO las re-toaste.
 *
 * Motivación: el usuario reportó que al entrar al módulo de Solicitudes
 * salían múltiples toasts de "Solicitud aprobada automáticamente"
 * cada vez que navegaba, porque el render dispara `updateAutoApprove()`
 * y el siguiente tick del poll las leía como "nuevas". El cambio ya queda
 * reflejado en el badge de la campana y en la lista de notificaciones,
 * por lo que un toast intrusivo por cada navegación es ruido.
 */
function runAsSilentSystemNotifications(callback) {
  let result;
  try {
    const before = new Set(read(KEYS.notifications, []).map((n) => n.id));
    result = typeof callback === "function" ? callback() : undefined;
    const after = read(KEYS.notifications, []);
    let added = false;
    for (const n of after) {
      if (before.has(n.id)) continue;
      if (!__lastSeenNotificationIds) {
        __lastSeenNotificationIds = new Set(after.map((m) => m.id));
        added = true;
        break;
      }
      __lastSeenNotificationIds.add(n.id);
      added = true;
    }
    if (added) {
      try { updateNotificationBadge(); } catch (_e) {}
    }
  } catch (_err) {
    /** Si la captura de IDs falla, no bloqueamos la rutina del sistema. */
    if (typeof callback === "function" && result === undefined) {
      try { result = callback(); } catch (_e) {}
    }
  }
  return result;
}

function __tickNotificationsPoll() {
  const user = currentUser();
  if (!user) return;
  const current = getCurrentNotifications();
  const seen = __lastSeenNotificationIds || new Set();
  /**
   * Solo avisar en toast las notificaciones dirigidas al usuario de la sesión. Los admins ven en
   * la bandeja las de otros (p. ej. "Cuenta aprobada" para un cliente), pero no deben duplicar el
   * mensaje explícito que ya muestra la acción (Aprobar usuario, etc.).
   */
  const suppressUntil = Number(state.portalSuppressSelfPollToastUntil || 0);
  const now = Date.now();
  const selfNew = current.filter((n) => !seen.has(n.id) && String(n.userId || "") === String(user.id || ""));
  const toToast = [];
  /**
   * Solo se notifica en toast lo que ocurre en tiempo real (≤ 30s). Las notificaciones
   * viejas que se materializan ahora — porque vinieron del servidor en un bootstrap
   * tardío, porque la auto-aprobación cruzó su umbral en una sesión anterior o porque
   * el usuario nunca leyó la campana — siguen visibles en la bandeja, pero no se
   * vuelven a "tirar a la cara" cada vez que entra a un módulo.
   */
  const FRESH_TOAST_WINDOW_MS = 30_000;
  for (const n of selfNew) {
    const createdTs = new Date(n.createdAt || 0).getTime();
    const age = Number.isFinite(createdTs) ? now - createdTs : Number.POSITIVE_INFINITY;
    if (!Number.isFinite(age) || age < 0 || age >= FRESH_TOAST_WINDOW_MS) continue;
    const skipDuplicateExplicitSuccess = suppressUntil > now && age < 6500;
    if (skipDuplicateExplicitSuccess) continue;
    toToast.push(n);
  }
  if (toToast.length) {
    toToast.forEach((n) => {
      if (typeof notify === "function") {
        const message = `${n.title}${n.body ? " — " + n.body : ""}`;
        notify(message, "info");
      }
    });
  }
  if (selfNew.length) {
    __lastSeenNotificationIds = new Set(current.map((n) => n.id));
    updateNotificationBadge();
    if (state.currentView === "notifications") {
      scheduleRenderPortalView();
    }
  }
}

function getCurrentNotifications() {
  const user = currentUser();
  if (!user) return [];
  return read(KEYS.notifications, []).filter((n) => n.userId === user.id || user.role === ROLES.ADMIN);
}

function updateNotificationBadge() {
  const link = document.querySelector('.side-link[data-view="notifications"]');
  if (!link) return;
  const list = getCurrentNotifications();
  const unread = list.filter((n) => !n.readAt).length;
  let badge = link.querySelector(".side-link-badge");
  if (unread > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "side-link-badge";
      link.appendChild(badge);
    }
    badge.textContent = unread > 99 ? "99+" : String(unread);
  } else if (badge) {
    badge.remove();
  }
}

function startNotificationsPolling() {
  if (__notificationsPollHandle != null) return;
  __lastSeenNotificationIds = new Set(getCurrentNotifications().map((n) => n.id));
  __notificationsPollHandle = setInterval(__tickNotificationsPoll, __notificationsPollIntervalMs());
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", __onNotificationsVisibilityChange);
  }
}

function buildHeaderKpiCardsForView(view, user) {
  return [];
}

function renderKpis() {
  if (!nodes.kpiCards) return;
  const user = currentUser();
  if (!user) {
    nodes.kpiCards.innerHTML = "";
    return;
  }
  const view = String(state.currentView || "dashboard");
  const cards = buildHeaderKpiCardsForView(view, user);
  nodes.kpiCards.innerHTML = cards.map((c) => `
    <article class="kpi">
      <div class="kpi-icon ${c.color}">${c.icon}</div>
      <div class="kpi-data"><span>${c.label}</span><b class="kpi-value">${c.value}</b></div>
    </article>
  `).join("");
}

function viewDashboard() {
  const user = currentUser();
  const list = getVisibleRequestsForUser(user);
  const byVehicle = {};
  list.forEach((r) => {
    const key = r.vehicleType?.trim() || r.trip?.vehicleType?.trim() || "Sin tipo";
    byVehicle[key] = (byVehicle[key] || 0) + 1;
  });
  const colors = {
    Turbo: "#F59F00",
    Tractomula: "#1B8E5F",
    Bus: "#377cc0",
    Camion: "#377cc0",
    Tractocamion: "#1B8E5F",
    "Sin tipo": "#94A3B8"
  };
  const vehicleStats = Object.entries(byVehicle)
    .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label"><span class="dash-stat-dot" style="background:${colors[k] || '#94A3B8'}"></span>${k}</div><div class="dash-stat-value">${v}</div></div>`)
    .join("");

  const byStatus = {};
  list.forEach((r) => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
  const statusStats = Object.entries(byStatus)
    .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label">${prettyStatus(k)}</div><div class="dash-stat-value">${v}</div></div>`)
    .join("");

  const users = user?.role === ROLES.CLIENT
    ? read(KEYS.users, []).filter((u) => u.companyId === user.companyId)
    : read(KEYS.users, []);
  const drivers = user?.role === ROLES.CLIENT
    ? read(KEYS.drivers, []).filter((d) => d.companyId === user.companyId)
    : read(KEYS.drivers, []);
  const vehicles = user?.role === ROLES.CLIENT
    ? read(KEYS.vehicles, []).filter((vehicle) => {
      const companyTrips = list.filter((request) => request.trip?.vehicleId === vehicle.id);
      return companyTrips.length > 0;
    })
    : read(KEYS.vehicles, []);
  const avg = (rows) => (rows.length ? Math.round(rows.reduce((acc, val) => acc + val, 0) / rows.length) : 0);
  const userQuality = avg(
    users.map((u) => {
      const required = ["name", "email", "documentType", "taxId", "phone", "city", "address", "companyId"];
      const done = required.filter((field) => String(u[field] ?? "").trim() !== "").length;
      return Math.round((done / required.length) * 100);
    })
  );
  const driverQuality = avg(
    drivers.map((d) => {
      const required = ["name", "documentType", "idDoc", "phone", "license", "licenseExpiry", "licenseCategory", "city", "companyId"];
      const done = required.filter((field) => String(d[field] ?? "").trim() !== "").length;
      return Math.round((done / required.length) * 100);
    })
  );
  const vehicleQuality = avg(
    vehicles.map((v) => {
      const required = ["plate", "brand", "model", "year", "type", "capacityKg", "mileageKm", "soatExpeditionDate", "techInspectionExpeditionDate"];
      const done = required.filter((field) => String(v[field] ?? "").trim() !== "").length;
      return Math.round((done / required.length) * 100);
    })
  );
  const qualityBody = `
    <div class="quality-row"><span>Usuarios</span><div class="quality-bar"><i style="width:${userQuality}%"></i></div><b>${userQuality}%</b></div>
    <div class="quality-row"><span>Conductores</span><div class="quality-bar"><i style="width:${driverQuality}%"></i></div><b>${driverQuality}%</b></div>
    <div class="quality-row"><span>Vehiculos</span><div class="quality-bar"><i style="width:${vehicleQuality}%"></i></div><b>${vehicleQuality}%</b></div>
  `;

  const qualityCard = user?.role === ROLES.CLIENT
    ? ""
    : pcardWrap("shield", "Calidad de datos", "Completitud de registros", qualityBody);

  const pendientes = list.filter((r) =>
    [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status)
  ).length;
  const conViaje = list.filter((r) => r.trip).length;
  const enOperacion = list.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
  const dashHero = moduleFleetHeroStrip([
    { label: "Solicitudes visibles", value: list.length },
    { label: "Con viaje", value: conViaje },
    { label: "En operacion", value: enOperacion },
    { label: "Pendientes / asignacion", value: pendientes, tone: pendientes ? "warn" : undefined }
  ]);

  return `${dashHero}<div class="dash-grid">
    ${pcardWrap("truck", "Por tipo de vehiculo", list.length + " solicitudes registradas", vehicleStats || emptyState("Sin datos de vehiculos aun"))}
    ${pcardWrap("activity", "Por estado", "Distribucion de solicitudes", statusStats || emptyState("Sin solicitudes aun"))}
    ${qualityCard}
  </div>`;
}

/** Selector de empresa en nueva solicitud: obligatorio; cliente solo su empresa; admin elige de la lista. */
function buildRequestCompanySelectHtml(user) {
  const companies = read(KEYS.companies, []);
  if (user?.role === ROLES.CLIENT) {
    const cid = String(user?.companyId || "").trim();
    if (!cid) {
      return `<div class="full">
        <p class="muted" role="alert">Su cuenta no tiene empresa asociada. Solicite al administrador que vincule su usuario a una empresa antes de crear solicitudes.</p>
        <input type="hidden" name="companyId" value="" />
      </div>`;
    }
    const c = getCompanyById(cid);
    const label = c?.name || user.company || "Mi empresa";
    return `<label class="full">${fieldLabel(IC.briefcase, "Empresa asociada", { required: true })}
      <select name="companyId" id="request-company-id" required>
        <option value="${escapeAttr(cid)}">${escapeHtml(label)}</option>
      </select>
    </label>`;
  }
  if (!companies.length) {
    return `<div class="full">
      <p class="muted" role="alert">No hay empresas registradas. Cree una empresa en <strong>Administración · Usuarios</strong> antes de solicitar viajes.</p>
      <input type="hidden" name="companyId" value="" />
    </div>`;
  }
  const opts = companies
    .map((c) => {
      const id = String(c.id || "");
      return `<option value="${escapeAttr(id)}">${escapeHtml(String(c.name || ""))}${c.taxId ? ` (${escapeHtml(String(c.taxId))})` : ""}</option>`;
    })
    .join("");
  return `<label class="full">${fieldLabel(IC.briefcase, "Empresa asociada", { required: true })}
    <select name="companyId" id="request-company-id" required>
      <option value="">Seleccione empresa...</option>
      ${opts}
    </select>
  </label>`;
}

function requestFormHtml() {
  if (window.AppModules?.solicitudes?.requestFormHtml) {
    return window.AppModules.solicitudes.requestFormHtml();
  }
  const user = currentUser();
  const list = getVisibleRequestsForUser(user);
  const pend = list.filter((r) => [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status)).length;
  const conViaje = list.filter((r) => r.trip).length;
  const enOp = list.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
  const clientHero = moduleFleetHeroStrip([
    { label: "Mis solicitudes", value: list.length },
    { label: "Con viaje", value: conViaje },
    { label: "En operacion", value: enOp },
    { label: "Pendientes", value: pend, tone: pend ? "warn" : undefined }
  ]);
  const departments = Object.keys(COLOMBIA_LOCATIONS)
    .map((dept) => `<option value="${dept}">${dept}</option>`)
    .join("");
  const body = `<form id="form-request" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.briefcase} Empresa y ruta</legend>
      <div class="form-section-grid">
        ${buildRequestCompanySelectHtml(user)}
        <label>${fieldLabel(IC.mapPin, "Departamento origen")}<select name="originDepartment" id="origin-department" required><option value="">Seleccione...</option>${departments}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad origen")}<select name="originCity" id="origin-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Origen direccion")}<input name="originAddress" required /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento destino")}<select name="destinationDepartment" id="destination-department" required><option value="">Seleccione...</option>${departments}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad destino")}<select name="destinationCity" id="destination-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Destino direccion")}<input name="destinationAddress" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.calendar} Ventanas de servicio</legend>
      <div class="form-section-grid datetime-group">
        <label>${fieldLabel(IC.calendar, "Fecha de recogida")}<input type="date" name="pickupDate" id="pickup-date" required /></label>
        <label>${fieldLabel(IC.clock, "Hora de recogida")}<input type="time" name="pickupTime" id="pickup-time" required /></label>
        <label>${fieldLabel(IC.calendar, "Fecha de entrega")}<input type="date" name="deliveryDate" id="delivery-date" required /></label>
        <label>${fieldLabel(IC.clock, "Hora de entrega")}<input type="time" name="deliveryTime" id="delivery-time" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.truck} Carga y servicio</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.file, "Descripcion carga")}<input name="cargoDescription" required /></label>
        <label>${fieldLabel(IC.briefcase, "Tipo de servicio")}<select name="serviceType" required><option value="">Seleccione...</option><option>Transporte nacional con termoking</option><option>Transporte nacional sin termoking</option><option>Transporte entre sedes del cliente</option></select></label>
        <label>${fieldLabel(IC.grid, "Volumen cajas")}<input type="number" min="0" name="boxes" required /></label>
        <label>${fieldLabel(IC.scale, "Peso kg")}<input type="number" min="0" name="weightKg" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.user} Contacto en sitio</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Contacto en sitio")}<input name="siteContactName" required /></label>
        <label>${fieldLabel(IC.phone, "Telefono contacto")}<input name="siteContactPhone" required /></label>
      </div>
    </fieldset>
    <label class="full">Observaciones <textarea name="notes" rows="3"></textarea></label>
    <label class="full">Adjuntos opcionales <input type="file" name="attachments" multiple /></label>
    <button class="btn btn-primary full" type="submit">${IC.send} Crear solicitud</button>
  </form>`;
  return clientHero + createCollapsibleCard("create-request", "plus", "Nueva solicitud de viaje", "Selecciona origen, destino, fecha y hora de forma guiada", body, "Crear solicitud");
}

function requestListClientHtml(user) {
  if (window.AppModules?.solicitudes?.requestListClientHtml) {
    return window.AppModules.solicitudes.requestListClientHtml(user);
  }
  const requests = getVisibleRequestsForUser(user);
  const rows = requests
    .map((r) => {
      const allowEdit = canClientManageRequest(r);
      const trip = r.trip
        ? `<strong>${r.trip.tripNumber}</strong><br><span class="muted">${r.trip.vehiclePlate} · ${r.trip.driverName}</span>`
        : '<span class="muted">-</span>';
      return `<tr>
        <td><strong>${r.requestNumber || r.id}</strong></td>
        <td>${formatRoute(r)}<br><span class="muted">Creada por: ${r.requestedByName || r.clientName}</span></td>
        <td>${prettyStatus(r.status, "request")}</td>
        <td>${trip}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-action" data-action="detail" data-id="${r.id}">${IC.eye} Ver</button>
          ${allowEdit ? `<button class="btn btn-sm btn-action" data-action="edit" data-id="${r.id}">${IC.edit} Editar</button>` : ""}
          ${allowEdit ? `<button class="btn btn-sm btn-reject" data-action="cancel" data-id="${r.id}">${IC.x} Cancelar</button>` : ""}
          ${user?.role === ROLES.ADMIN ? `<button class="btn btn-sm btn-reject" data-action="delete-admin" data-id="${r.id}">${IC.trash} Eliminar</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("Aun no hay solicitudes creadas.");
  return pcardWrap("file", "Mis solicitudes", requests.length + " registradas", body);
}

function vehiclesHtml() {
  const vehicles = read(KEYS.vehicles, []);
  const isAdmin = isAdminActor();
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.available).length;
  const thermokingCount = vehicles.filter((v) => v.refrigerated).length;
  const documentRiskCount = vehicles.filter((v) => {
    const soat = docExpiryStatus(v.soatExpeditionDate);
    const tec = docExpiryStatus(v.techInspectionExpeditionDate);
    return ["status-vencida", "status-rechazada", "status-pendiente"].includes(soat.cls) ||
      ["status-vencida", "status-rechazada", "status-pendiente"].includes(tec.cls);
  }).length;
  const rows = vehicles
    .map((v) => {
      const soat = docExpiryStatus(v.soatExpeditionDate);
      const tecno = docExpiryStatus(v.techInspectionExpeditionDate);
      const refrigeratedTag = v.refrigerated
        ? '<span class="status status-viaje_asignado">Termoking</span>'
        : '<span class="status status-espera_standby">Carga seca</span>';
      const availabilityTag = v.available
        ? '<span class="status status-viaje_asignado">Disponible</span>'
        : '<span class="status status-rechazada">Ocupado</span>';
      return `<tr>
        <td>
          <div class="vehicle-cell">
            <span class="vehicle-plate">${v.plate}</span>
            <span class="muted">${v.brand || "-"} · ${v.model || "-"} · ${v.year || "-"}</span>
          </div>
        </td>
        <td>${v.type}</td>
        <td><strong>${parseNum(v.capacityKg).toLocaleString("es-CO")}</strong> <span class="muted">kg</span></td>
        <td>${refrigeratedTag}</td>
        <td><span class="muted">${v.soatExpeditionDate || "-"}</span><br><span class="status ${soat.cls}">${soat.label}</span></td>
        <td><span class="muted">${v.techInspectionExpeditionDate || "-"}</span><br><span class="status ${tecno.cls}">${tecno.label}</span></td>
        <td>${availabilityTag}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-outline" data-action="view-vehicle" data-id="${v.id}">${IC.eye} Ver</button>
          <button class="btn btn-sm btn-action" data-action="edit-vehicle" data-id="${v.id}">${IC.edit} Editar</button>
          <button class="btn btn-sm btn-action" data-action="toggle-vehicle" data-id="${v.id}">${IC.toggle} Estado</button>
          ${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="delete-vehicle" data-id="${v.id}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const bodyTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.bodyTypes);
  const fuelTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.fuelTypes);
  const axleOptions = selectOptionsFromCatalog(CO_CATALOGS.axleConfig);
  const colorOptions = selectOptionsFromCatalog(CO_CATALOGS.vehicleColors);
  const formBody = `<form id="form-vehicle" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.truck} Identificación del vehículo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.truck, "Placa")}<input name="plate" required placeholder="ABC123" /></label>
        <label>${fieldLabel(IC.briefcase, "Marca")}<input name="brand" required placeholder="Ej: Kenworth, Chevrolet, Hino" /></label>
        <label>${fieldLabel(IC.grid, "Línea / Modelo")}<input name="model" required placeholder="Ej: T800, NPR" /></label>
        <label>${fieldLabel(IC.calendar, "Año modelo")}<input type="number" min="1990" max="2100" name="year" required placeholder="Ej: ${new Date().getFullYear()}" /></label>
        <label>${fieldLabel(IC.palette, "Color")}<select name="color" required>${colorOptions}</select></label>
        <label>${fieldLabel(IC.truck, "Tipo")}<select name="type" required><option value="">Seleccione...</option><option>Turbo</option><option>Tractomula</option><option>Bus</option></select></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-violet full">
      <legend>${IC.layers} Características del vehículo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.package, "Tipo de carrocería")}<select name="bodyType" required>${bodyTypeOptions}</select></label>
        <label>${fieldLabel(IC.activity, "Termoking (refrigerado)")}<select name="refrigerated" required><option value="true">Sí, equipo Termoking</option><option value="false">No, carga seca</option></select></label>
        <label>${fieldLabel(IC.scale, "Capacidad (kg)")}<input type="number" min="1" name="capacityKg" required placeholder="Ej: 18000" /></label>
        <label>${fieldLabel(IC.fuel, "Tipo de combustible")}<select name="fuelType" required>${fuelTypeOptions}</select></label>
        <label>${fieldLabel(IC.layers, "Configuración de ejes")}<select name="axleConfig" required>${axleOptions}</select></label>
        <label>${fieldLabel(IC.hash, "Número de motor")}<input name="engineNumber" required placeholder="Ej: 6BT5.9" /></label>
        <label>${fieldLabel(IC.hash, "Número de chasis (VIN)")}<input name="vin" required maxlength="17" minlength="11" placeholder="17 caracteres" style="text-transform:uppercase" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-amber full">
      <legend>${IC.shield} Documentación legal vigente (Colombia)</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.card, "Tarjeta de propiedad N°")}<input name="ownershipCard" required placeholder="Ej: 12345678" /></label>
        <label>${fieldLabel(IC.calendar, "Expedición SOAT")}<input type="date" name="soatExpeditionDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Vence SOAT")}<input type="date" name="soatExpiryDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Expedición tecnomecánica")}<input type="date" name="techInspectionExpeditionDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Vence tecnomecánica")}<input type="date" name="techInspectionExpiryDate" required /></label>
        <label>${fieldLabel(IC.shield, "Póliza RC contractual N°")}<input name="rcPolicyContract" placeholder="Ej: 0123456" /></label>
        <label>${fieldLabel(IC.shield, "Póliza RC extracontractual N°")}<input name="rcPolicyExtra" placeholder="Ej: 0654321" /></label>
        <label>${fieldLabel(IC.calendar, "Vence pólizas RCP")}<input type="date" name="rcPolicyExpiry" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.satellite} Equipos y trazabilidad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.satellite, "GPS satelital")}<select name="hasGps"><option value="true">Sí, GPS activo</option><option value="false">Sin GPS</option></select></label>
        <label>${fieldLabel(IC.briefcase, "Proveedor GPS")}<input name="gpsProvider" placeholder="Ej: Detektor, Skyangel, Geolocator" /></label>
        <label>${fieldLabel(IC.user, "Propietario / Empresa")}<input name="ownerName" placeholder="Persona o razón social del titular" /></label>
        <label>${fieldLabel(IC.badge, "NIT / Cédula propietario")}<input name="ownerTaxId" placeholder="Ej: 900123456-7" /></label>
      </div>
    </fieldset>

    <button class="btn btn-primary full" type="submit">${IC.plus} Registrar vehículo</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Placa</th><th>Tipo</th><th>Capacidad</th><th>Equipo</th><th>SOAT</th><th>Tecnomecánica</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay vehículos registrados.");
  const heroStrip = `<div class="fleet-hero-strip fleet-hero-strip--solo">
      <div class="fleet-hero-metrics">
        <div class="fleet-hero-metric"><span>Total flota</span><strong>${totalCount}</strong></div>
        <div class="fleet-hero-metric"><span>Disponibles</span><strong>${availableCount}</strong></div>
        <div class="fleet-hero-metric"><span>Termoking</span><strong>${thermokingCount}</strong></div>
        <div class="fleet-hero-metric fleet-hero-metric-alert"><span>Docs. en riesgo</span><strong>${documentRiskCount}</strong></div>
      </div>
    </div>`;
  return heroStrip
    + createCollapsibleCard("create-vehicle", "plus", "Registrar vehículo", "Datos legales, capacidad y equipo de frío", formBody, "Registrar vehículo")
    + pcardWrap("truck", "Flota de camiones", vehicles.length + " vehículos", tableBody);
}

function driversHtml() {
  const drivers = read(KEYS.drivers, []);
  const isAdmin = isAdminActor();
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter((d) => d.available).length;
  const expiringSoon = drivers.filter((d) => {
    if (!d.licenseExpiry) return false;
    const days = Math.ceil((new Date(`${d.licenseExpiry}T12:00:00`).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 60;
  }).length;
  const expired = drivers.filter((d) => {
    if (!d.licenseExpiry) return false;
    return new Date(`${d.licenseExpiry}T12:00:00`).getTime() < Date.now();
  }).length;
  const cards = drivers
    .map((d) => {
      const initials = String(d.name || "C")
        .split(/\s+/)
        .map((p) => p.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
      const statusTag = d.available
        ? '<span class="status status-viaje_asignado">Disponible</span>'
        : '<span class="status status-rechazada">Ocupado</span>';
      const licStatus = (() => {
        if (!d.licenseExpiry) return '<span class="status status-pendiente">Sin fecha</span>';
        const days = Math.ceil((new Date(`${d.licenseExpiry}T12:00:00`).getTime() - Date.now()) / 86400000);
        if (days < 0) return '<span class="status status-rechazada">Vencida</span>';
        if (days <= 60) return `<span class="status status-pendiente">Vence en ${days}d</span>`;
        return '<span class="status status-viaje_asignado">Vigente</span>';
      })();
      return `<article class="driver-card">
        <header class="driver-card-head">
          <div class="driver-avatar">${initials}</div>
          <div class="driver-card-title">
            <h4>${d.name || "Conductor"}</h4>
            <p class="muted">${getCompanyById(d.companyId)?.name || "-"}</p>
          </div>
          <div class="driver-card-status">${statusTag}</div>
        </header>
        <div class="driver-card-body">
          <div class="driver-info-row"><span>${IC.phone}</span><span>${d.phone || "-"}</span></div>
          <div class="driver-info-row"><span>${IC.file}</span><span>${d.license || "-"} · ${d.licenseCategory || "-"}</span></div>
          <div class="driver-info-row"><span>${IC.calendar}</span><span>Vence: ${d.licenseExpiry || "-"} ${licStatus}</span></div>
        </div>
        <footer class="driver-card-actions">
          <button class="btn btn-sm btn-outline" data-action="view-driver" data-id="${d.id}">${IC.eye} Ver</button>
          <button class="btn btn-sm btn-action" data-action="edit-driver" data-id="${d.id}">${IC.edit} Editar</button>
          <button class="btn btn-sm btn-action" data-action="toggle-driver" data-id="${d.id}">${IC.toggle} Estado</button>
          ${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="delete-driver" data-id="${d.id}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
        </footer>
      </article>`;
    })
    .join("");
  const heroStrip = moduleFleetHeroStrip([
    { label: "Total", value: totalDrivers },
    { label: "Disponibles", value: availableDrivers },
    { label: "Lic. 60 d", value: expiringSoon, tone: expiringSoon ? "warn" : undefined },
    { label: "Vencidas", value: expired, tone: expired ? "alert" : undefined }
  ]);
  const grid = cards
    ? `<div class="drivers-grid">${cards}</div>`
    : emptyState("No hay conductores registrados.");
  const info = `<p class="muted" style="margin:0 0 0.6rem">Los conductores se crean automáticamente desde <strong>Contratación</strong> o desde <strong>Empleados</strong> cuando el cargo es de conductor.</p>`;
  return heroStrip + pcardWrap("user", "Conductores", drivers.length + " registrados", info + grid);
}

function transportTripsHtml() {
  const isAdmin = isAdminActor();
  const rates = getTripRouteRatesNormalized();
  const companiesForRates = read(KEYS.companies, []);
  const rateCompanyOptions = companiesForRates
    .map(
      (c) =>
        `<option value="${escapeAttr(String(c.id || ""))}">${escapeHtml(String(c.name || ""))}${c.taxId ? ` (${escapeHtml(String(c.taxId))})` : ""}</option>`
    )
    .join("");
  const rateEntries = Object.entries(rates)
    .map(([storageKey, entry]) => ({ storageKey, ...entry, value: parseNum(entry.value) }))
    .sort((a, b) => String(a.storageKey).localeCompare(String(b.storageKey)));
  const pendingForTrip = reqRead().filter(
    (r) => [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status) && !r.trip
  );
  const trips = reqRead().filter((r) => r.trip);
  const activeOps = trips.filter((r) => activeTripStatuses().includes(r.status)).length;
  const departmentsOpts = departmentOptions();
  const rows = trips
    .map((r) => {
      const currentStatus = r.status;
      const transitions = [currentStatus, ...(STATUS_TRANSITIONS[currentStatus] || [])];
      return `<tr>
      <td><strong>${r.trip.tripNumber}</strong></td>
      <td>${r.requestNumber || r.id}</td>
      <td>${r.clientName}</td>
      <td>${formatRoute(r)}<br><span class="muted">${r.cargoDescription || "-"} · $${parseNum(r.tripValue || r.insuredValue || 0).toLocaleString("es-CO")}</span></td>
      <td>${r.trip.vehiclePlate}</td>
      <td>${r.trip.driverName}<br><span class="muted">Asignado por: ${r.trip.assignedBy || r.approvedBy || "-"}</span></td>
      <td>${fmtDate(r.trip.etaPickup)}</td>
      <td>${prettyStatus(r.status, "trip")}${parseNum(r.standbyChargeTotal) > 0 ? `<br><span class="muted" style="font-size:0.78rem">Standby: $${parseNum(r.standbyChargeTotal).toLocaleString("es-CO")}</span>` : ""}</td>
      <td><div class="toolbar"><select data-action="trip-status" data-id="${r.id}" style="padding:0.4rem 0.6rem;border-radius:8px;border:1px solid var(--line);font-size:0.82rem">
        ${transitions.map((s) => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}
      </select><button class="btn btn-sm btn-action" data-action="trip-detail" data-id="${r.id}">${IC.eye} Detalle</button>${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="delete-trip" data-id="${r.id}" title="Solo administradores">${IC.trash} Eliminar viaje</button>` : ""}${[STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status) ? `<button class="btn btn-sm btn-approve" data-action="trip-invoice" data-id="${r.id}">${IC.file} Factura PDF</button>` : ""}</div></td>
    </tr>`;
    })
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Viaje</th><th>Solicitud</th><th>Cliente</th><th>Ruta y carga</th><th>Camion</th><th>Conductor</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay viajes asignados.");

  const formatRateRowLabel = (storageKey) => {
    const sepIdx = String(storageKey).lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routeOnly = sepIdx === -1 ? String(storageKey) : String(storageKey).slice(0, sepIdx);
    const [orig, dest] = String(routeOnly).split("->");
    const [od, oc] = String(orig || "").split("|");
    const [dd, dc] = String(dest || "").split("|");
    return `${escapeHtml(od || "-")} · ${escapeHtml(oc || "-")} → ${escapeHtml(dd || "-")} · ${escapeHtml(dc || "-")}`;
  };
  const formatRateClientsLabel = (companyIds) => {
    const ids = Array.isArray(companyIds) ? companyIds : [];
    if (!ids.length) return '<span class="muted">Todos los clientes</span>';
    return ids.map((id) => escapeHtml(getCompanyById(id)?.name || String(id))).join(", ");
  };
  const ratesRows = rateEntries.length
    ? rateEntries
        .map(({ storageKey, value: val, companyIds }) => {
          const safeKey = encodeURIComponent(storageKey);
          return `<tr>
          <td><strong>${formatRateRowLabel(storageKey)}</strong></td>
          <td>${formatRateClientsLabel(companyIds)}</td>
          <td><strong>$${parseNum(val).toLocaleString("es-CO")}</strong></td>
          <td>${isAdmin ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-route-rate" data-rate-key="${safeKey}" title="Solo administradores">${IC.trash} Quitar</button>` : '<span class="muted">—</span>'}</td>
        </tr>`;
        })
        .join("")
    : "";
  const ratesTable = ratesRows
    ? `<div class="table-wrap"><table><thead><tr><th>Trayecto</th><th>Clientes</th><th>Tarifa (COP)</th><th></th></tr></thead><tbody>${ratesRows}</tbody></table></div>`
    : emptyState("No hay tarifas por trayecto. Define rutas para autocompletar precios al asignar.");

  const routeRateForm = `<form id="form-route-rate" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.mapPin} Origen del trayecto</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="originDepartment" id="route-rate-origin-dept" required><option value="">Seleccione...</option>${departmentsOpts}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="originCity" id="route-rate-origin-city" required><option value="">Seleccione departamento...</option></select></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.mapPin} Destino</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="destinationDepartment" id="route-rate-dest-dept" required><option value="">Seleccione...</option>${departmentsOpts}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="destinationCity" id="route-rate-dest-city" required><option value="">Seleccione departamento...</option></select></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.dollar} Tarifa sugerida</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.dollar, "Valor del viaje (COP)")}<input type="number" name="tripRateCop" min="1" step="1" required placeholder="Ej: 4200000" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.briefcase} Clientes (negociación)</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.briefcase, "Aplicar a clientes (multi-selección)", { required: false })}
          <select name="rateClientCompanies" id="route-rate-clients" multiple size="5" class="route-rate-clients-select">
            ${rateCompanyOptions}
          </select>
        </label>
        <p class="muted full" style="margin:0;line-height:1.45">Sin seleccionar ninguno: la tarifa vale para <strong>todos</strong> los clientes. Con una o varias empresas: solo autocompleta precio cuando la solicitud es de esa empresa. Use Ctrl o Cmd para elegir varios.</p>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.plus} Guardar tarifa de trayecto</button>
  </form>`;

  const pendingSelectOpts = pendingForTrip
    .map(
      (r) =>
        `<option value="${escapeAttr(r.id)}" data-createdby="${escapeAttr(r.requestedByName || "-")}" data-route="${escapeAttr(`${r.originDepartment ? `${r.originDepartment}, ` : ""}${r.originCity} → ${r.destinationDepartment ? `${r.destinationDepartment}, ` : ""}${r.destinationCity}`)}" data-company="${escapeAttr(r.clientName || "-")}">${escapeHtml(String(r.requestNumber || r.id))} · ${escapeHtml(r.clientName || "")} · ${escapeHtml(r.originCity || "")} → ${escapeHtml(r.destinationCity || "")}</option>`
    )
    .join("");
  const createTripForm = `<form id="form-create-trip" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.compass} Solicitud</legend>
      <label class="full">${fieldLabel(IC.compass, "Solicitud pendiente de asignacion")}
        <select name="requestId" id="create-trip-request-select" ${pendingForTrip.length ? "required" : "disabled"}>
          <option value="">${pendingForTrip.length ? "Seleccione..." : "No hay solicitudes pendientes"}</option>
          ${pendingSelectOpts}
        </select>
      </label>
      <div id="trip-request-preview" class="trip-preview full">
        <p><strong>Solicitante:</strong> <span data-preview="createdBy">-</span></p>
        <p><strong>Cliente:</strong> <span data-preview="company">-</span></p>
        <p><strong>Ruta:</strong> <span data-preview="route">-</span></p>
      </div>
    </fieldset>
    <p class="muted full">${pendingForTrip.length ? "Al enviar se abrira el selector de camion, conductor y precio del viaje." : "Apruebe solicitudes desde Transporte · Solicitudes o aguarde la aprobacion automatica por tiempo de respuesta (si esta configurada)."}</p>
    <button class="btn btn-primary full" type="submit" ${pendingForTrip.length ? "" : "disabled"}>${IC.plus} Crear viaje desde solicitud</button>
  </form>`;

  const heroStrip = `<div class="fleet-hero-strip fleet-hero-strip--solo">
      <div class="fleet-hero-metrics">
        <div class="fleet-hero-metric"><span>Viajes</span><strong>${trips.length}</strong></div>
        <div class="fleet-hero-metric"><span>En operacion</span><strong>${activeOps}</strong></div>
        <div class="fleet-hero-metric fleet-hero-metric-warn"><span>Sin asignar</span><strong>${pendingForTrip.length}</strong></div>
        <div class="fleet-hero-metric"><span>Tarifas trayecto</span><strong>${rateEntries.length}</strong></div>
      </div>
    </div>`;

  const actionGrid = `<div class="dash-grid trips-actions-row--two">
    ${createCollapsibleCard("create-trip", "plus", "Crear viaje", "Asigna camión y conductor a una solicitud aprobada", createTripForm, "Asignar viaje")}
    ${createCollapsibleCard("create-route-rate", "dollar", "Tarifas por trayecto", "Precios sugeridos por ruta (origen y destino)", routeRateForm, "Nueva tarifa")}
  </div>`;

  return `${heroStrip}${actionGrid}${pcardWrap("compass", "Viajes operativos", `${trips.length} viajes`, body)}${pcardWrap("mapPin", "Rutas y tarifas configuradas", `${rateEntries.length} rutas`, ratesTable)}`;
}

function transportCalendarHtml() {
  const filters = state.calendarFilters || { driver: "", vehicle: "", status: "" };
  const allTrips = reqRead().filter((r) => r.trip);
  const requests = allTrips
    .filter((r) => {
      if (filters.driver && String(r.trip.driverId || "") !== filters.driver) return false;
      if (filters.vehicle && String(r.trip.vehicleId || "") !== filters.vehicle) return false;
      if (filters.status && String(r.status || "") !== filters.status) return false;
      return true;
    })
    .sort((a, b) => new Date(a.trip.etaPickup).getTime() - new Date(b.trip.etaPickup).getTime());

  const driversList = read(KEYS.drivers, []);
  const vehiclesList = read(KEYS.vehicles, []);
  const statusList = [...new Set(allTrips.map((r) => r.status))];

  const focus = state.calendarFocus instanceof Date && !Number.isNaN(state.calendarFocus.getTime())
    ? new Date(state.calendarFocus)
    : new Date();
  focus.setHours(12, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = focus.getFullYear();
  const month = focus.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const eventsByDay = new Map();
  requests.forEach((r) => {
    const d = new Date(r.trip.etaPickup);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key).push(r);
  });

  const monthLabel = focus.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const buildCell = (day, monthOffset) => {
    const cellDate = new Date(year, month + monthOffset, day);
    cellDate.setHours(0, 0, 0, 0);
    const key = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
    const dayEvents = eventsByDay.get(key) || [];
    const isOther = monthOffset !== 0;
    const isToday = cellDate.getTime() === today.getTime();
    const dotPalette = ["dot-blue", "dot-teal", "dot-violet", "dot-orange"];
    const eventList = dayEvents
      .slice(0, 3)
      .map((r, idx) => {
        const time = new Date(r.trip.etaPickup).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
        const dot = dotPalette[idx % dotPalette.length];
        return `<button type="button" class="cal-event ${dot}" data-action="cal-event" data-id="${r.id}">
          <span class="cal-event-time">${time}</span>
          <span class="cal-event-title">${r.trip.tripNumber || "-"} · ${r.clientName || ""}</span>
        </button>`;
      })
      .join("");
    const more = dayEvents.length > 3 ? `<span class="cal-more">+${dayEvents.length - 3} más</span>` : "";
    return `<div class="cal-cell ${isOther ? "cal-cell-other" : ""} ${isToday ? "cal-cell-today" : ""} ${dayEvents.length ? "cal-cell-has-events" : ""}">
      <div class="cal-day">${day}${isToday ? '<span class="cal-today-pill">Hoy</span>' : ""}</div>
      <div class="cal-events">${eventList}${more}</div>
    </div>`;
  };

  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push(buildCell(daysInPrevMonth - i, -1));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(buildCell(d, 0));
  }
  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push(buildCell(nextDay, 1));
  }

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const weekdayHeaders = weekDays.map((d) => `<div class="cal-weekday">${d}</div>`).join("");

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const todayEvents = eventsByDay.get(todayKey) || [];
  const upcoming = requests
    .filter((r) => new Date(r.trip.etaPickup).getTime() >= today.getTime())
    .slice(0, 8);

  const todayList = todayEvents.length
    ? todayEvents
        .map((r) => {
          const time = new Date(r.trip.etaPickup).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
          return `<div class="cal-day-event">
            <div class="cal-day-event-time">${time}</div>
            <div class="cal-day-event-info">
              <strong>${r.trip.tripNumber || "-"}</strong>
              <span class="muted">${r.trip.driverName || "-"} · ${r.trip.vehiclePlate || "-"}</span>
              <span class="muted">${r.trip.route || formatRoute(r)}</span>
            </div>
            <div class="cal-day-event-status">${prettyStatus(r.status, "trip")}</div>
          </div>`;
        })
        .join("")
    : `<p class="muted">Sin viajes para hoy.</p>`;

  const upcomingList = upcoming.length
    ? upcoming
        .map((r) => {
          const date = new Date(r.trip.etaPickup);
          const dateLabel = date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
          const time = date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
          return `<div class="cal-upcoming-item">
            <div class="cal-upcoming-date">
              <strong>${dateLabel}</strong>
              <span class="muted">${time}</span>
            </div>
            <div class="cal-upcoming-info">
              <strong>${r.trip.tripNumber || "-"}</strong>
              <span class="muted">${r.clientName || "-"}</span>
              <span class="muted">${r.trip.driverName || "-"} · ${r.trip.vehiclePlate || "-"}</span>
            </div>
            <div>${prettyStatus(r.status, "trip")}</div>
          </div>`;
        })
        .join("")
    : `<p class="muted">No hay programación próxima.</p>`;

  const calendarShell = `<section class="calendar-shell">
    <div class="calendar-toolbar">
      <div class="calendar-title-block">
        <h2>${monthLabelCap}</h2>
      </div>
      <div class="calendar-controls">
        <button type="button" class="btn btn-action btn-sm" data-action="cal-nav" data-step="-1">${IC.chevronLeft || ""} Anterior</button>
        <button type="button" class="btn btn-action btn-sm" data-action="cal-today">Hoy</button>
        <button type="button" class="btn btn-action btn-sm" data-action="cal-nav" data-step="1">Siguiente ${IC.chevronRight || ""}</button>
      </div>
    </div>
    <form id="calendar-filters" class="calendar-filters-bar">
      <label>${fieldLabel(IC.user, "Conductor")}<select name="driver"><option value="">Todos</option>${driversList.map((d) => `<option value="${d.id}" ${filters.driver === d.id ? "selected" : ""}>${d.name}</option>`).join("")}</select></label>
      <label>${fieldLabel(IC.truck, "Camión")}<select name="vehicle"><option value="">Todos</option>${vehiclesList.map((v) => `<option value="${v.id}" ${filters.vehicle === v.id ? "selected" : ""}>${v.plate} · ${v.type}</option>`).join("")}</select></label>
      <label>${fieldLabel(IC.activity, "Estado")}<select name="status"><option value="">Todos</option>${statusList.map((s) => `<option value="${s}" ${filters.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>
      <button type="button" class="btn btn-sm btn-action" data-action="cal-clear-filters">${IC.x} Limpiar</button>
    </form>
    <div class="calendar-legend">
      <span class="cal-legend-item"><span class="cal-dot dot-blue"></span>En curso</span>
      <span class="cal-legend-item"><span class="cal-dot dot-teal"></span>Programado</span>
      <span class="cal-legend-item"><span class="cal-dot dot-violet"></span>Asignado</span>
      <span class="cal-legend-item"><span class="cal-dot dot-orange"></span>Otros</span>
    </div>
    <div class="calendar-grid">
      <div class="cal-weekdays">${weekdayHeaders}</div>
      <div class="cal-days">${cells.join("")}</div>
    </div>
    <div class="calendar-side-grid">
      ${pcardWrap("clock", "Hoy", `${todayEvents.length} viajes programados`, `<div class="cal-day-list">${todayList}</div>`)}
      ${pcardWrap("calendar", "Próximas programaciones", upcoming.length + " viajes", `<div class="cal-upcoming-list">${upcomingList}</div>`)}
    </div>
  </section>`;

  const calHero = moduleFleetHeroStrip([
    { label: "Viajes en sistema", value: allTrips.length },
    { label: "Tras filtros", value: requests.length },
    { label: "Hoy", value: todayEvents.length },
    { label: "Proximos", value: upcoming.length }
  ]);

  return calHero + calendarShell;
}

function adminUsersHtml(current) {
  const isAdmin = isAdminActor(current);
  const users = read(KEYS.users, []);
  const companies = read(KEYS.companies, []);
  const ui = state.adminUsersUi || { panel: "", editUserId: "", editCompanyId: "" };
  const editingUser = ui.editUserId ? users.find((u) => u.id === ui.editUserId) : null;
  const editingCompany = ui.editCompanyId ? companies.find((c) => String(c.id) === String(ui.editCompanyId)) : null;

  const companiesAssignable = companies.filter((c) => isCompanyRecordActive(c));

  const companyOptions = companiesAssignable
    .map(
      (c) =>
        `<option value="${c.id}">${escapeHtml(String(c.name || ""))} (${escapeHtml(companyKindLabel(c.companyKind))})</option>`
    )
    .join("");
  const companyEditOptions = editingUser
    ? companies
        .map((c) => {
          const id = String(c.id ?? "");
          const selected = String(editingUser.companyId ?? "") === id ? " selected" : "";
          const inactiveMark = !isCompanyRecordActive(c) ? " · Inactiva" : "";
          return `<option value="${escapeAttr(id)}"${selected}>${escapeHtml(String(c.name || ""))}${c.taxId ? ` (${escapeHtml(String(c.taxId))})` : ""} · ${escapeHtml(companyKindLabel(c.companyKind))}${inactiveMark}</option>`;
        })
        .join("")
    : "";

  const genderOptsEdit = editingUser
    ? `<option value="">— Sin especificar —</option>${CO_CATALOGS.genders.map((g) => {
        const ug = String(editingUser.gender || "").trim().toUpperCase();
        const sel = ug === g.trim().toUpperCase() ? " selected" : "";
        return `<option value="${escapeAttr(g)}"${sel}>${escapeHtml(g)}</option>`;
      }).join("")}`
    : "";

  const userOptions = users
    .map((u) => `<option value="${u.id}">${u.name} (${u.role})${u.id === current.id ? " · tu perfil" : ""}</option>`)
    .join("");

  const permissionChecks = (selected = []) => ALL_PERMISSIONS.map((permission) => {
    const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
    return `<label class="perm-check">
      <input type="checkbox" name="permissions" value="${permission}" ${selected.includes(permission) ? "checked" : ""} />
      <span><strong>${meta.title}</strong><small>${meta.desc}</small></span>
    </label>`;
  }).join("");

  const statusBadge = (s) => {
    if (s === ACCOUNT_STATUS.APROBADO) return `<span class="status status-viaje_asignado">Aprobado</span>`;
    if (s === ACCOUNT_STATUS.PENDIENTE) return `<span class="status status-pendiente">Pendiente</span>`;
    if (s === ACCOUNT_STATUS.RECHAZADO) return `<span class="status status-rechazada">Rechazado</span>`;
    return `<span class="status status-viaje_asignado">Aprobado</span>`;
  };

  const roleBadge = (r) => {
    const colors = {
      admin: "#377cc0",
      rrhh: "#7C3AED",
      administracion: "#1D4ED8",
      auxiliar_administrativo: "#0EA5E9",
      lider_administrativo: "#4F46E5",
      client: "#0E7490"
    };
    return `<span class="role-chip" style="--role-color:${colors[r] || '#64748B'}">${r}</span>`;
  };

  const renderUserCard = (u, mode = "active") => {
    const namedPerms = (u.permissions || []).map((p) => PERMISSION_META[p]?.title || p);
    const visiblePerms = namedPerms.slice(0, 3);
    const hiddenCount = Math.max(0, namedPerms.length - visiblePerms.length);
    const permList = [
      ...visiblePerms.map((label) => `<span class="perm-tag">${escapeHtml(label)}</span>`),
      hiddenCount > 0 ? `<span class="perm-tag perm-tag-more">+${hiddenCount} mas</span>` : ""
    ].join("");
    const isMe = u.id === current.id;
    const isPending = mode === "pending";
    const note = isPending
      ? `<p class="user-card-pending-note"><strong>Pendiente de aprobación.</strong> Asigne empresa, rol y permisos para activar la cuenta.</p>`
      : "";
    const actions = isPending
      ? `<div class="user-card-actions">
          ${isAdmin ? `<button class="btn btn-sm btn-primary" data-action="approve-registration" data-id="${escapeAttr(String(u.id))}">${IC.check} Aprobar</button>` : ""}
          ${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${escapeAttr(String(u.id))}">${IC.x} Rechazar</button>` : ""}
        </div>`
      : `<div class="user-card-actions">
          <button class="btn btn-sm btn-outline" data-action="view-user" data-id="${escapeAttr(String(u.id))}">${IC.eye} Ver</button>
          ${isAdmin ? `<button class="btn btn-sm btn-action" data-action="open-edit-user" data-id="${escapeAttr(String(u.id))}">${IC.edit} Editar</button>` : ""}
          ${isAdmin && !isMe ? `<button class="btn btn-sm btn-action" data-action="toggle-user-active" data-id="${escapeAttr(String(u.id))}">${u.accountStatus === ACCOUNT_STATUS.RECHAZADO ? `${IC.check} Activar` : `${IC.x} Desactivar`}</button>` : ""}
          ${isAdmin && !isMe ? `<button class="btn btn-sm btn-reject" data-action="delete-user" data-id="${escapeAttr(String(u.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
        </div>`;
    return `<div class="user-card${isPending ? " user-card--pending" : ""}">
      <div class="user-card-top">
        <div class="user-avatar">${escapeHtml(getPortalUserDisplayName(u).charAt(0).toUpperCase() || "?")}</div>
        <div class="user-card-info">
          <h4>${escapeHtml(getPortalUserDisplayName(u))}${isMe ? ' <span class="muted" style="font-weight:400;font-size:0.78rem">(tu)</span>' : ""}</h4>
          <p>${escapeHtml(String(u.email || ""))}</p>
        </div>
        <div class="user-card-badges">
          ${roleBadge(u.role)}
          ${statusBadge(u.accountStatus)}
        </div>
      </div>
      <div class="user-card-meta">
        <span>${IC.briefcase} ${escapeHtml(getCompanyById(u.companyId)?.name || u.company || "Sin empresa")}</span>
        ${u.phone ? `<span>${IC.user} ${escapeHtml(String(u.phone))}</span>` : ""}
        ${u.city ? `<span>${IC.mapPin} ${escapeHtml(String(u.city))}${u.department ? `, ${escapeHtml(String(u.department))}` : ""}</span>` : ""}
        ${u.registrationKind ? `<span>${IC.shield} ${escapeHtml(registrationKindLabel(u.registrationKind))}</span>` : ""}
      </div>
      ${note}
      ${permList ? `<div class="user-card-perms">${permList}</div>` : ""}
      ${actions}
    </div>`;
  };

  const renderCompanyCard = (c) => {
    const active = isCompanyRecordActive(c);
    const usersCount = users.filter((u) => String(u.companyId || "") === String(c.id)).length;
    const initial = escapeHtml(String((c.name || "?").trim().charAt(0).toUpperCase() || "?"));
    const nit = String(c.taxId || c.nit || "").trim();
    const subtitle = nit
      ? `${IC.badge} NIT ${escapeHtml(nit)}`
      : `<span class="muted">${IC.badge} Sin NIT registrado</span>`;
    const coStatusBadge = active
      ? `<span class="status status-viaje_asignado">Activa</span>`
      : `<span class="status status-rechazada">Inactiva</span>`;
    const coActions = `<div class="user-card-actions">
      <button type="button" class="btn btn-sm btn-outline" data-action="view-company" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
      ${isAdmin ? `<button type="button" class="btn btn-sm btn-action" data-action="open-edit-company" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
      ${isAdmin ? `<button type="button" class="btn btn-sm btn-action" data-action="toggle-company-active" data-id="${escapeAttr(String(c.id))}">${active ? `${IC.x} Desactivar` : `${IC.check} Activar`}</button>` : ""}
      ${isAdmin ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-company" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
    </div>`;
    const phoneDisp = c.phone ? formatPortalPhoneForDisplay(String(c.phone)) : "";
    const metaParts = [
      phoneDisp
        ? `${IC.phone} ${escapeHtml(phoneDisp)}`
        : `<span class="muted">${IC.phone} Sin teléfono</span>`,
      `${IC.user} ${usersCount} usuario${usersCount === 1 ? "" : "s"}`
    ];
    const kindForUi =
      patchOperatorCompanyKindIfNeeded([{ ...c }])[0]?.companyKind ?? c.companyKind;
    return `<div class="user-card user-card--company${active ? "" : " user-card--company-inactive"}">
      <div class="user-card-top">
        <div class="user-avatar user-avatar--company" aria-hidden="true">${initial}</div>
        <div class="user-card-info">
          <h4>${escapeHtml(String(c.name || ""))}</h4>
          <p class="muted">${subtitle}</p>
        </div>
        <div class="user-card-badges">
          ${companyKindChipHtml(kindForUi)}
          ${coStatusBadge}
        </div>
      </div>
      <div class="user-card-meta">${metaParts.map((x) => `<span>${x}</span>`).join("")}</div>
      ${coActions}
    </div>`;
  };

  const pendingUsers = users.filter((u) => isPortalUserPendingApproval(u));
  const pendingIdSet = new Set(pendingUsers.map((u) => u.id));
  const activeUsers = users.filter((u) => !pendingIdSet.has(u.id));
  const pendingCardsHtml = pendingUsers.map((u) => renderUserCard(u, "pending")).join("");
  const userCards = activeUsers.map((u) => renderUserCard(u, "active")).join("");

  const fUser = `<form id="form-admin-user-create" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.user} Datos personales</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required placeholder="Ej.: Laura Castañeda" /></label>
        <label>${fieldLabel(IC.mail, "Correo corporativo")}<input type="email" name="email" required placeholder="correo@empresa.com" /></label>
        <label class="full">${fieldLabel(IC.lock, "Contraseña")}
          <div class="password-field auth-password-row">
            <div class="auth-input-row auth-input-row--grow">
              <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
              <input type="password" name="password" minlength="10" required placeholder="Mín. 10 caracteres, mayúscula, minúscula, número y símbolo" aria-describedby="admin-create-password-hint admin-create-password-strength" autocomplete="new-password" />
            </div>
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="admin-create">${IC.eye} Mostrar</button>
          </div>
          <div id="admin-password-strength-suite" class="password-strength-suite">
            <div class="password-strength-bar-wrap">
              <div class="password-strength-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Progreso de requisitos de contraseña">
                <div class="password-strength-bar-fill password-strength-bar-fill--weak"></div>
              </div>
              <div class="password-strength-meta">
                <span class="password-strength-pill password-strength-pill--weak">0%</span>
                <p id="admin-create-password-strength" class="password-strength-headline">Indique una contraseña segura</p>
              </div>
            </div>
            <ul class="password-rule-grid" role="list" aria-label="Requisitos de contraseña">
              <li data-rule="len"><span class="password-rule-dot" aria-hidden="true"></span><span>10+ caracteres</span></li>
              <li data-rule="lower"><span class="password-rule-dot" aria-hidden="true"></span><span>Minúscula (a-z)</span></li>
              <li data-rule="upper"><span class="password-rule-dot" aria-hidden="true"></span><span>Mayúscula (A-Z)</span></li>
              <li data-rule="digit"><span class="password-rule-dot" aria-hidden="true"></span><span>Número (0-9)</span></li>
              <li data-rule="special"><span class="password-rule-dot" aria-hidden="true"></span><span>Símbolo (!@#$…)</span></li>
            </ul>
          </div>
          <p id="admin-create-password-hint" class="muted password-policy-hint">Mismo estándar que el alta público del sitio (10+ caracteres, mayúscula, minúscula, número y símbolo). La contraseña se muestra tal cual al escribirla; se guarda con hash seguro.</p>
        </label>
        <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType" required>
          <option value="CC">Cédula de ciudadanía</option>
          <option value="CE">Cédula de extranjería</option>
          <option value="NIT">NIT</option>
          <option value="PAS">Pasaporte</option>
        </select></label>
        <label>${fieldLabel(IC.badge, "Documento / NIT")}<input name="taxId" value="900000001-0" required /></label>
        <label>${fieldLabel(IC.phone, "Teléfono")}<input name="phone" required placeholder="+57 300 000 0000" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-violet full">
      <legend>${IC.shield} Acceso y rol</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.shield, "Rol")}<select name="role" required>
          <option value="${ROLES.ADMIN}">Administrador</option>
          <option value="${ROLES.RRHH}">Recursos Humanos</option>
          <option value="${ROLES.ADMINISTRACION}">Administración</option>
          <option value="${ROLES.AUXILIAR_ADMINISTRATIVO}">Auxiliar administrativo</option>
          <option value="${ROLES.LIDER_ADMINISTRATIVO}">Líder administrativo</option>
          <option value="${ROLES.CLIENT}">Cliente</option>
        </select></label>
        <label>${fieldLabel(IC.shield, "Tipo de vínculo")}<select name="registrationKind" required>
          <option value="cliente">Cliente externo</option>
          <option value="empleado_interno">Empleado interno</option>
        </select></label>
        <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required>
          <option value="">Seleccione...</option>
          ${companyOptions}
        </select></label>
        <label>${fieldLabel(IC.lock, "Autenticación 2FA")}<select name="twoFactorEnabled">
          <option value="false">Deshabilitada</option>
          <option value="true">Habilitada (recomendado)</option>
        </select></label>
        <label>${fieldLabel(IC.calendar, "Fecha de ingreso al sistema")}<input type="date" name="systemJoinDate" value="${colombiaTodayIsoDate()}" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.mapPin} Ubicación</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="admin-create-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="admin-create-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label>${fieldLabel(IC.compass, "Dirección")}<input name="address" required placeholder="Dirección principal" /></label>
        <label>${fieldLabel(IC.building || IC.briefcase, "Nombre comercial")}<input name="company" value="Antares" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-amber full">
      <legend>${IC.upload} Avatar (opcional)</legend>
      <label class="full">${fieldLabel(IC.upload, "Foto del usuario")}<input type="file" name="avatarFile" accept="image/*" /></label>
    </fieldset>

    <fieldset class="full perm-fieldset">
      <legend>${IC.shield} Permisos del usuario</legend>
      <div class="perm-grid">${permissionChecks([...ALL_PERMISSIONS])}</div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.userPlus} Crear usuario</button>
  </form>`;

  const fComp = `<form id="form-admin-company-create" class="p-form">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.briefcase} Datos de la empresa</legend>
      <p class="muted full" style="margin:0 0 0.85rem;line-height:1.45">
        Razón social o nombre legal, NIT único en el sistema y teléfono de contacto opcional.
      </p>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.shield, "Clasificación de la empresa")}
          <select name="companyKind" required>
            <option value="cliente">Cliente (contrata servicios)</option>
            <option value="tercero">Tercero (proveedor u otro vínculo)</option>
            <option value="propia">Empresa propia — Antares (operador)</option>
          </select>
        </label>
        <label class="full">
          ${fieldLabel(IC.briefcase, "Nombre o razón social", { required: true })}
          <span class="muted" style="display:block;font-size:0.85rem;font-weight:400;margin:0.15rem 0 0.25rem">
            Obligatorio · hasta 255 caracteres
          </span>
          <input name="name" required maxlength="255" autocomplete="organization" placeholder="Ej. Flores del Valle S.A.S." />
        </label>
        <label>
          ${fieldLabel(IC.badge, "NIT / RUT", { required: true })}
          <span class="muted" style="display:block;font-size:0.85rem;font-weight:400;margin:0.15rem 0 0.25rem">
            Obligatorio · único en el sistema
          </span>
          <input name="taxId" required maxlength="32" inputmode="numeric" autocomplete="off" placeholder="900123456-7" />
        </label>
        <label>
          ${fieldLabel(IC.phone, "Teléfono")}
          <span class="muted" style="display:block;font-size:0.85rem;font-weight:400;margin:0.15rem 0 0.25rem">
            Opcional · solo dígitos, 7 a 15
          </span>
          <input name="phone" maxlength="15" inputmode="tel" autocomplete="tel" placeholder="Ej. 6011234567" />
        </label>
      </div>
      <button class="btn btn-primary full" type="submit">${IC.plus} Registrar empresa</button>
    </fieldset>
  </form>`;

  const fCompanyEdit = editingCompany
    ? `<form id="form-admin-company-edit" class="p-form p-form-colored">
    <input type="hidden" name="id" value="${escapeAttr(String(editingCompany.id || ""))}" />
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.briefcase} Datos de la empresa</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.shield, "Clasificación de la empresa")}
          <select name="companyKind" required>
            <option value="cliente" ${normalizeCompanyKindForDb(editingCompany.companyKind) === "cliente" ? "selected" : ""}>Cliente (contrata servicios)</option>
            <option value="tercero" ${normalizeCompanyKindForDb(editingCompany.companyKind) === "tercero" ? "selected" : ""}>Tercero (proveedor u otro vínculo)</option>
            <option value="propia" ${normalizeCompanyKindForDb(editingCompany.companyKind) === "propia" ? "selected" : ""}>Empresa propia — Antares (operador)</option>
          </select>
        </label>
        <label class="full">
          ${fieldLabel(IC.briefcase, "Nombre o razón social", { required: true })}
          <input name="name" required maxlength="255" autocomplete="organization" value="${escapeAttr(String(editingCompany.name || ""))}" />
        </label>
        <label>
          ${fieldLabel(IC.badge, "NIT / RUT", { required: true })}
          <input name="taxId" required maxlength="32" inputmode="numeric" autocomplete="off" value="${escapeAttr(String(editingCompany.taxId ?? editingCompany.nit ?? ""))}" />
        </label>
        <label>
          ${fieldLabel(IC.phone, "Teléfono")}
          <input name="phone" maxlength="32" inputmode="tel" autocomplete="tel" placeholder="+57 300 000 0000" value="${escapeAttr(String(editingCompany.phone ?? ""))}" />
        </label>
      </div>
    </fieldset>
    <div class="toolbar full">
      <button class="btn btn-primary" type="submit">${IC.save} Guardar cambios</button>
      <button class="btn btn-action" type="button" data-action="close-edit-company">${IC.x} Cancelar</button>
    </div>
  </form>`
    : "";

  const fPerm = `<form id="form-admin-user-permissions" class="p-form">
    <label class="full">${fieldLabel(IC.user, "Seleccionar usuario")}
      <select name="userId" required>
        <option value="">Seleccione un usuario...</option>
        ${userOptions}
      </select>
    </label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos a asignar</legend>
      <div class="perm-grid">${permissionChecks([])}</div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.save} Guardar permisos</button>
  </form>`;

  const fEdit = editingUser
    ? `<form id="form-admin-user-edit" class="p-form p-form-colored">
    <input type="hidden" name="id" value="${escapeAttr(String(editingUser.id || ""))}" />
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.user} Nombre y datos del registro</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.user, "Nombre completo")}<input name="name" value="${escapeAttr(getPortalUserDisplayName(editingUser))}" required autocomplete="name" /></label>
        <label>${fieldLabel(IC.user, "Primer nombre")}<input name="firstName" value="${escapeAttr(String(editingUser.firstName ?? ""))}" autocomplete="given-name" /></label>
        <label>${fieldLabel(IC.user, "Segundo nombre")}<input name="middleName" value="${escapeAttr(String(editingUser.middleName ?? ""))}" autocomplete="additional-name" /></label>
        <label>${fieldLabel(IC.users, "Primer apellido")}<input name="lastName" value="${escapeAttr(String(editingUser.lastName ?? ""))}" autocomplete="family-name" /></label>
        <label>${fieldLabel(IC.users, "Segundo apellido")}<input name="secondLastName" value="${escapeAttr(String(editingUser.secondLastName ?? ""))}" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.file} Persona y documento</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.file, "Tipo de persona")}
          <select name="personType">
            <option value="Natural" ${!isPersonTypeJuridica(editingUser.personType) ? "selected" : ""}>Natural</option>
            <option value="Juridica" ${isPersonTypeJuridica(editingUser.personType) ? "selected" : ""}>Jurídica</option>
          </select>
        </label>
        <label>${fieldLabel(IC.file, "Tipo documento")}
          <select name="documentType" required>
            <option value="CC" ${String(editingUser.documentType || "").toUpperCase() === "CC" ? "selected" : ""}>Cédula de ciudadanía</option>
            <option value="CE" ${String(editingUser.documentType || "").toUpperCase() === "CE" ? "selected" : ""}>Cédula de extranjería</option>
            <option value="NIT" ${String(editingUser.documentType || "").toUpperCase() === "NIT" ? "selected" : ""}>NIT</option>
            <option value="PAS" ${String(editingUser.documentType || "").toUpperCase() === "PAS" ? "selected" : ""}>Pasaporte</option>
          </select>
        </label>
        <label>${fieldLabel(IC.badge, "Número de documento / NIT")}<input name="taxId" value="${escapeAttr(String(editingUser.taxId ?? editingUser.personalDoc ?? ""))}" required /></label>
        <label>${fieldLabel(IC.calendar, "Fecha de nacimiento")}<input type="date" name="birthDate" value="${escapeAttr(String(editingUser.birthDate || "").slice(0, 10))}" /></label>
        <label>${fieldLabel(IC.users, "Género")}<select name="gender">${genderOptsEdit}</select></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.mail} Acceso y rol</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mail, "Correo")}<input type="email" name="email" value="${escapeAttr(String(editingUser.email || ""))}" required autocomplete="email" /></label>
        <label>${fieldLabel(IC.lock, "Contraseña")}<input type="password" name="password" placeholder="Dejar vacío para conservar" autocomplete="new-password" /></label>
        <label>${fieldLabel(IC.shield, "Rol")}
          <select name="role" required>
            <option value="${ROLES.ADMIN}" ${editingUser.role === ROLES.ADMIN ? "selected" : ""}>Administrador</option>
            <option value="${ROLES.RRHH}" ${editingUser.role === ROLES.RRHH ? "selected" : ""}>Recursos Humanos</option>
            <option value="${ROLES.ADMINISTRACION}" ${editingUser.role === ROLES.ADMINISTRACION ? "selected" : ""}>Administración</option>
            <option value="${ROLES.AUXILIAR_ADMINISTRATIVO}" ${editingUser.role === ROLES.AUXILIAR_ADMINISTRATIVO ? "selected" : ""}>Auxiliar administrativo</option>
            <option value="${ROLES.LIDER_ADMINISTRATIVO}" ${editingUser.role === ROLES.LIDER_ADMINISTRATIVO ? "selected" : ""}>Líder administrativo</option>
            <option value="${ROLES.CLIENT}" ${editingUser.role === ROLES.CLIENT ? "selected" : ""}>Cliente</option>
          </select>
        </label>
        <label class="full">${fieldLabel(IC.users, "Cliente o usuario interno")}
          <select name="registrationKind" id="admin-edit-registration-kind" required aria-label="Cliente externo o usuario interno Antares">
            <option value="cliente" ${normalizeRegistrationKindForDb(editingUser.registrationKind ?? editingUser.profileQualityChecklist?.registrationKind) === "cliente" ? "selected" : ""}>Cliente (persona de empresa externa)</option>
            <option value="empleado_interno" ${normalizeRegistrationKindForDb(editingUser.registrationKind ?? editingUser.profileQualityChecklist?.registrationKind) === "empleado_interno" ? "selected" : ""}>Usuario interno (personal Antares)</option>
          </select>
        </label>
        <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required>
          <option value="">Seleccione...</option>
          ${companyEditOptions}
        </select></label>
        <label>${fieldLabel(IC.lock, "Autenticación 2FA")}<select name="twoFactorEnabled">
          <option value="false" ${!editingUser.twoFactorEnabled ? "selected" : ""}>Deshabilitada</option>
          <option value="true" ${editingUser.twoFactorEnabled ? "selected" : ""}>Habilitada (recomendado)</option>
        </select></label>
        <label>${fieldLabel(IC.calendar, "Fecha de ingreso al sistema")}<input type="date" name="systemJoinDate" value="${escapeAttr(String(editingUser.systemJoinDate || (editingUser.createdAt ? String(editingUser.createdAt).slice(0, 10) : "")))}" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.mapPin} Ubicación y contacto operativo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.phone, "Teléfono")}<input name="phone" value="${escapeAttr(String(editingUser.phone ?? ""))}" autocomplete="tel" inputmode="tel" maxlength="32" placeholder="+57 300 000 0000" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}
          <select name="department" id="admin-edit-department"><option value="">Seleccione...</option>${departmentOptions(editingUser.department || "")}</select>
        </label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}
          <select name="city" id="admin-edit-city"><option value="">Seleccione...</option>${cityOptionsFromDepartment(editingUser.department || "", editingUser.city || "")}</select>
        </label>
        <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" value="${escapeAttr(String(editingUser.address ?? ""))}" /></label>
        <label>${fieldLabel(IC.user, "Cargo (registro)")}<input name="position" value="${escapeAttr(String(editingUser.position ?? ""))}" placeholder="Ej. Gerente comercial" /></label>
        <label>${fieldLabel(IC.briefcase, "Área de trabajo")}<input name="workArea" value="${escapeAttr(String(editingUser.workArea ?? ""))}" /></label>
        <label>${fieldLabel(IC.building || IC.briefcase, "Nombre comercial / razón corta")}<input name="company" value="${escapeAttr(String(editingUser.company ?? ""))}" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section full perm-fieldset">
      <legend>${IC.upload} Avatar</legend>
      <label class="full">${fieldLabel(IC.upload, "Cambiar foto")}<input type="file" name="avatarFile" accept="image/*" /></label>
    </fieldset>
    <fieldset class="full perm-fieldset">
      <legend>Permisos granulares</legend>
      <div class="perm-grid">${permissionChecks(editingUser.permissions || [])}</div>
    </fieldset>
    <div class="toolbar full">
      <button class="btn btn-primary" type="submit">${IC.save} Guardar cambios</button>
      <button class="btn btn-action" type="button" data-action="close-edit-user">${IC.x} Cancelar</button>
    </div>
  </form>`
    : "";

  const companiesSorted = [...companies].sort((a, b) => {
    const aa = isCompanyRecordActive(a) ? 0 : 1;
    const bb = isCompanyRecordActive(b) ? 0 : 1;
    if (aa !== bb) return aa - bb;
    return String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base" });
  });
  const companyCardsHtml = companiesSorted.map((c) => renderCompanyCard(c)).join("");

  let html = "";
  const approvedCount = users.filter((u) => u.accountStatus === ACCOUNT_STATUS.APROBADO).length;

  html += moduleFleetHeroStrip([
    { label: "Usuarios", value: users.length },
    { label: "Aprobados", value: approvedCount },
    { label: "Registro pendiente", value: pendingUsers.length, tone: pendingUsers.length ? "warn" : undefined },
    { label: "Empresas", value: companies.length }
  ]);

  html += `<div class="users-hero-strip users-hero-strip--solo">
    <div class="users-hero-actions">
      <button class="btn btn-primary btn-sm" data-action="toggle-admin-panel" data-panel="create-user">${IC.userPlus} Nuevo usuario</button>
      <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="create-company">${IC.building || IC.briefcase} Nueva empresa</button>
      <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="set-permissions">${IC.shield} Asignar permisos</button>
    </div>
  </div>`;

  if (ui.panel === "create-user") html += pcardWrap("userPlus", "Crear nuevo usuario", "Completa los datos y permisos", fUser);
  if (ui.panel === "create-company") html += pcardWrap("plus", "Registrar empresa", "Agregar nueva empresa al sistema", fComp);
  if (ui.panel === "set-permissions") html += pcardWrap("save", "Asignar permisos", "Selecciona usuario y permisos", fPerm);
  if (editingUser)
    html += pcardWrap(
      "edit",
      "Editar usuario",
      `Actualiza los datos de ${escapeHtml(getPortalUserDisplayName(editingUser))}`,
      fEdit
    );
  if (editingCompany)
    html += pcardWrap(
      "briefcase",
      "Editar empresa",
      escapeHtml(String(editingCompany.name || "")),
      fCompanyEdit
    );

  if (pendingUsers.length > 0) {
    const pendingSubtitle = `${pendingUsers.length} registro${pendingUsers.length === 1 ? "" : "s"} pendiente${pendingUsers.length === 1 ? "" : "s"}`;
    const pendingHelper = `<p class="muted user-grid-pending-help">Las cuentas creadas por el formulario público quedan inactivas hasta que un administrador les asigne empresa, rol y permisos.</p>`;
    html += pcardWrap(
      "shield",
      "Pendientes de aprobación",
      pendingSubtitle,
      pendingHelper + `<div class="user-grid user-grid-pending">${pendingCardsHtml}</div>`
    );
  }

  html += pcardWrap(
    "shield",
    "Usuarios del sistema",
    `${activeUsers.length} activo${activeUsers.length === 1 ? "" : "s"}${pendingUsers.length ? ` · ${pendingUsers.length} pendiente${pendingUsers.length === 1 ? "" : "s"}` : ""}`,
    userCards ? `<div class="user-grid user-grid-main">${userCards}</div>` : emptyState("Sin usuarios registrados.")
  );

  if (companies.length > 0) {
    html += pcardWrap(
      "briefcase",
      "Empresas registradas",
      `${companies.length} empresa${companies.length === 1 ? "" : "s"}`,
      `<div class="user-grid user-grid-main user-grid-companies">${companyCardsHtml}</div>`
    );
  }

  return html;
}

function historyHtml() {
  const requests = reqRead();
  const histHero = moduleFleetHeroStrip([
    { label: "Registros", value: requests.length },
    {
      label: "Finalizadas",
      value: requests.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length
    },
    {
      label: "En curso",
      value: requests.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length
    },
    {
      label: "Sin viaje",
      value: requests.filter((r) => !r.trip).length,
      tone: requests.some((r) => !r.trip && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status))
        ? "warn"
        : undefined
    }
  ]);
  const users = read(KEYS.users, []);
  const drivers = read(KEYS.drivers, []);
  const vehicles = read(KEYS.vehicles, []);
  const rules = read(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 });
  const options = users
    .filter((u) => u.role === ROLES.CLIENT)
    .map((u) => `<option value="${u.id}">${u.company}</option>`)
    .join("");
  const driverOptions = drivers.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
  const vehicleOptions = vehicles.map((v) => `<option value="${v.id}">${v.plate} · ${v.type}</option>`).join("");
  const renderHistoryRow = (r) => {
    const number = String(r.requestNumber || r.id || "").trim();
    const client = String(r.clientName || "").trim();
    const vehicle = String(r.vehicleType || r.trip?.vehicleType || "—").trim();
    const trip = String(r.trip?.tripNumber || "").trim();
    const haystack = `${number} ${client} ${vehicle} ${trip}`.toLowerCase();
    return `<tr data-history-row data-haystack="${escapeAttr(haystack)}">
      <td>${fmtDate(r.createdAt)}</td>
      <td><strong>${escapeHtml(number)}</strong></td>
      <td>${escapeHtml(client)}</td>
      <td>${escapeHtml(vehicle)}</td>
      <td>${prettyStatus(r.status)}</td>
      <td>${trip ? escapeHtml(trip) : '<span class="muted">—</span>'}</td>
    </tr>`;
  };
  const rows = requests.map(renderHistoryRow).join("");

  const filterBody = `<form id="history-filter" class="p-form p-form-colored history-filter-form">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.filter} Periodo y criterios</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.search || IC.filter, "Búsqueda libre")}<input type="search" name="q" placeholder="Buscar por número de solicitud, cliente, viaje o vehículo..." autocomplete="off" /></label>
        <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
        <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
        <label>${fieldLabel(IC.user, "Cliente")}<select name="client"><option value="">Todos</option>${options}</select></label>
        <label>${fieldLabel(IC.activity, "Estado")}<select name="status"><option value="">Todos</option>${Object.values(STATUS).map((s) => `<option>${s}</option>`).join("")}</select></label>
      </div>
    </fieldset>
    <div class="history-filter-actions">
      <button class="btn btn-primary" type="submit">${IC.filter} Aplicar filtro</button>
      <button class="btn btn-action" type="reset" data-action="history-clear-filter">${IC.x} Limpiar</button>
    </div>
  </form>`;
  const driverReportBody = `<form id="driver-month-report-form" class="p-form p-form-colored">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.activity} Reporte conductor</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Conductor")}<select name="driverId" required><option value="">Seleccione...</option>${driverOptions}</select></label>
        <label>${fieldLabel(IC.calendar, "Mes")}<input type="month" name="month" required /></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.activity} Generar reporte mensual</button>
  </form>
  <div id="driver-month-report-output" class="muted" style="margin-top:0.75rem">Selecciona conductor y mes para ver viaticos, combustible y viajes realizados.</div>`;
  const fuelForm = `<form id="form-fuel-log" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.calendar} Carga de combustible</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.calendar, "Fecha")}<input type="date" name="date" required /></label>
        <label>${fieldLabel(IC.truck, "Camion")}<select name="vehicleId" required><option value="">Seleccione...</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(IC.user, "Conductor")}<select name="driverId" required><option value="">Seleccione...</option>${driverOptions}</select></label>
        <label>${fieldLabel(IC.file, "Viaje (opcional)")}<input name="tripNumber" placeholder="VIA-000123" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.dollar} Montos y trazabilidad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.activity, "Litros")}<input type="number" step="0.01" min="0.01" name="liters" required /></label>
        <label>${fieldLabel(IC.dollar, "Valor total")}<input type="number" min="0" name="totalCost" required /></label>
        <label>${fieldLabel(IC.clock, "Odometro km")}<input type="number" min="0" name="odometerKm" /></label>
        <label>${fieldLabel(IC.mapPin, "Estacion")}<input name="station" placeholder="EDS..." /></label>
        <label>${fieldLabel(IC.briefcase, "Pagado por")}
          <select name="paidBy">
            <option value="empresa">Empresa</option>
            <option value="conductor">Conductor (reembolso nomina)</option>
          </select>
        </label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.plus} Registrar combustible</button>
  </form>`;
  const technicalForm = `<form id="form-technical-log" class="p-form p-form-colored">
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.truck} Novedad de taller</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.calendar, "Fecha")}<input type="date" name="date" required /></label>
        <label>${fieldLabel(IC.truck, "Camion")}<select name="vehicleId" required><option value="">Seleccione...</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo")}
          <select name="type">
            <option value="preventivo">Mantenimiento preventivo</option>
            <option value="correctivo">Mantenimiento correctivo</option>
            <option value="falla">Falla tecnica</option>
          </select>
        </label>
        <label>${fieldLabel(IC.file, "Descripcion")}<input name="description" required /></label>
        <label>${fieldLabel(IC.dollar, "Costo")}<input type="number" min="0" name="cost" required /></label>
        <label>${fieldLabel(IC.clock, "Horas fuera de servicio")}<input type="number" min="0" step="0.5" name="downtimeHours" value="0" /></label>
        <label>${fieldLabel(IC.check, "Estado")}
          <select name="status">
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Resuelto</option>
          </select>
        </label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.plus} Registrar novedad tecnica</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Solicitud</th><th>Cliente</th><th>Vehiculo</th><th>Estado</th><th>Viaje</th></tr></thead><tbody id="history-body">${rows}</tbody></table></div>`
    : emptyState("Sin registros.");
  const reportBody = `<div class="dash-grid history-insights-grid">
    ${pcardWrap("user", "Clientes mas activos", null, `<p>${topClients(requests).join(", ") || "Sin datos"}</p>`)}
    ${pcardWrap("truck", "Vehiculos mas usados", null, `<p>${topVehicles(requests).join(", ") || "Sin datos"}</p>`)}
    ${pcardWrap("dollar", "Regla actual de viaticos", null, `<p>$${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")} por viaje entre departamentos</p>`)}
  </div>`;
  return histHero
    + pcardWrap("filter", "Filtros", null, filterBody)
    + pcardWrap("clock", "Historial de viajes", requests.length + " registros", tableBody)
    + pcardWrap("activity", "Reporte mensual por conductor (viaticos)", null, driverReportBody)
    + `<div class="dash-grid history-ops-grid">${createCollapsibleCard("create-fuel-log", "plus", "Combustibles", "Control de costos y reembolsos de conductor", fuelForm, "Registrar combustible")}${createCollapsibleCard("create-technical-log", "plus", "Novedades tecnicas de camiones", "Mantenimiento, fallas y disponibilidad operativa", technicalForm, "Registrar novedad tecnica")}</div>`
    + reportBody;
}

function topClients(requests) {
  const acc = {};
  requests.forEach((r) => {
    acc[r.clientName] = (acc[r.clientName] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function topVehicles(requests) {
  const acc = {};
  requests.forEach((r) => {
    const key = r.vehicleType?.trim() || r.trip?.vehicleType?.trim() || "Sin tipo";
    acc[key] = (acc[key] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function toCsv(rows = [], columns = []) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const header = columns.map((col) => esc(col.label)).join(",");
  const body = rows.map((row) => columns.map((col) => esc(row[col.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

const REPORT_RULES = {
  executive_control_tower: { permission: PERMISSIONS.DASHBOARD_VIEW, rrhhAllowed: true },
  service_levels: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  fleet_summary: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  trips_operations: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  requests_lifecycle: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  drivers_performance: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  payroll_summary: { permission: PERMISSIONS.PAYROLL_MANAGE, rrhhAllowed: true },
  hiring_pipeline: { permission: PERMISSIONS.HIRING_MANAGE, rrhhAllowed: true },
  labor_compliance: { permission: PERMISSIONS.SST_COMPLIANCE, rrhhAllowed: true },
  users_access: { permission: PERMISSIONS.USERS_MANAGE, adminOnly: true },
  authorizations_traceability: { permission: PERMISSIONS.AUTHORIZATIONS_MANAGE, adminOnly: true }
};

function canAccessReport(user, reportId) {
  if (!user) return false;
  if (user.role === ROLES.CLIENT) return false;
  const rule = REPORT_RULES[reportId];
  if (!rule) return false;
  if (!hasPermission(user, rule.permission)) return false;
  if (rule.adminOnly) return user.role === ROLES.ADMIN;
  if (rule.rrhhAllowed) return canAccessRRHH(user.role) || user.role === ROLES.ADMIN;
  return true;
}

function downloadCsv(filename, rows = [], columns = []) {
  const csv = toCsv(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function openReportPdf(title, columns = [], rows = []) {
  const thead = `<tr>${columns.map((col) => `<th>${col.label}</th>`).join("")}</tr>`;
  const tbody = rows.length
    ? rows
        .map((row) => `<tr>${columns.map((col) => `<td>${String(row[col.key] ?? "-")}</td>`).join("")}</tr>`)
        .join("")
    : `<tr><td colspan="${Math.max(1, columns.length)}">Sin datos para el periodo seleccionado.</td></tr>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"/><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}
      h1{margin:0 0 8px;font-size:22px;color:#0b3f8a}
      .m{color:#64748b;font-size:12px;margin-bottom:14px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #dbe3ee;padding:7px 8px;text-align:left}
      th{background:#eef4ff;color:#1e3a8a}
      @media print{body{padding:0}}
    </style></head><body>
      <h1>${title}</h1><div class="m">Generado: ${fmtDate(nowIso())}</div>
      <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
      <script>window.print()</script>
    </body></html>`;
  const pop = window.open("", "_blank");
  if (!pop) {
    notify(userMessage("reportPdfBlocked"), "error");
    return;
  }
  pop.document.open();
  pop.document.write(html);
  pop.document.close();
}

function deriveRequestOperationalValue(request) {
  const invoiceTotal = parseNum(request?.trip?.invoice?.total || 0);
  if (invoiceTotal > 0) return invoiceTotal;
  const base = parseNum(request?.insuredValue || request?.tripValue || 0);
  const standby = parseNum(request?.standbyChargeTotal || 0);
  return base + standby;
}

function minutesBetween(startDate, endDate) {
  const startTs = new Date(startDate || "").getTime();
  const endTs = new Date(endDate || "").getTime();
  if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs < startTs) return 0;
  return Math.round((endTs - startTs) / 60000);
}

function hoursBetween(startDate, endDate) {
  const mins = minutesBetween(startDate, endDate);
  return Number((mins / 60).toFixed(2));
}

function slaStatusForRequest(request) {
  if (!request?.trip) return "Sin viaje";
  const etaTs = new Date(request.trip.etaDelivery || "").getTime();
  const deliveredTs = new Date(request.deliveredAt || request.closedAt || request.trip.etaDelivery || "").getTime();
  if (!Number.isFinite(etaTs) || !Number.isFinite(deliveredTs)) return "Sin dato";
  return deliveredTs <= etaTs ? "Cumple SLA" : "Incumple SLA";
}

function buildReportDataset(reportId, actor = currentUser()) {
  if (!canAccessReport(actor, reportId)) {
    return {
      title: "Reporte restringido",
      columns: [{ key: "message", label: "Detalle" }],
      rows: [{ message: "No tienes permisos para generar este reporte." }],
      fileName: "reporte_restringido.csv"
    };
  }
  const requests = reqRead();
  if (reportId === "executive_control_tower") {
    const trips = requests.filter((request) => request.trip);
    const closedTrips = requests.filter((request) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status));
    const pendingApprovals = requests.filter((request) => request.status === STATUS.PENDIENTE).length;
    const sstControls = read(KEYS.sstCompliance, []);
    const payrollRuns = read(KEYS.payrollRuns, []);
    const contracts = read(KEYS.contracts, []);
    const totalRevenue = requests.reduce((acc, request) => acc + deriveRequestOperationalValue(request), 0);
    const paidPayroll = payrollRuns.filter((run) => run.paid).reduce((acc, run) => acc + parseNum(run.net), 0);
    const openApprovals = read(KEYS.approvals, []).filter((approval) => approval.status === "pendiente").length;
    const rows = [
      { metric: "Solicitudes totales", value: requests.length, detail: "Acumulado histórico", category: "Operación" },
      { metric: "Solicitudes pendientes", value: pendingApprovals, detail: "Esperando gestión operativa", category: "Operación" },
      { metric: "Viajes cerrados", value: closedTrips.length, detail: `${trips.length} viajes creados`, category: "Operación" },
      { metric: "Ingresos operativos estimados", value: `$${parseNum(totalRevenue).toLocaleString("es-CO")}`, detail: "Incluye standby e invoice", category: "Finanzas" },
      { metric: "Nómina neta pagada", value: `$${parseNum(paidPayroll).toLocaleString("es-CO")}`, detail: `${payrollRuns.length} liquidaciones`, category: "Finanzas" },
      { metric: "Contratos emitidos", value: contracts.length, detail: "Formalización laboral", category: "RRHH" },
      { metric: "Controles SST activos", value: sstControls.length, detail: "Seguridad social y documental", category: "Cumplimiento" },
      { metric: "Aprobaciones abiertas", value: openApprovals, detail: "Solicitudes por decidir", category: "Gobierno" }
    ];
    return {
      title: "Control Tower ejecutivo",
      columns: [
        { key: "category", label: "Categoría" },
        { key: "metric", label: "Métrica" },
        { key: "value", label: "Valor" },
        { key: "detail", label: "Detalle" }
      ],
      rows,
      fileName: "reporte_control_tower.csv"
    };
  }
  if (reportId === "service_levels") {
    const rows = requests
      .filter((request) => request.trip)
      .map((request) => ({
        requestNumber: request.requestNumber || request.id,
        tripNumber: request.trip?.tripNumber || "-",
        client: request.clientName || "-",
        route: formatRoute(request),
        pickupAt: fmtDate(request.trip?.etaPickup || request.pickupAt),
        etaDelivery: fmtDate(request.trip?.etaDelivery || request.etaDelivery),
        deliveredAt: fmtDate(request.deliveredAt || request.closedAt || request.trip?.etaDelivery),
        cycleHours: hoursBetween(request.createdAt, request.deliveredAt || request.closedAt || request.trip?.etaDelivery),
        approvalMinutes: minutesBetween(request.createdAt, request.approvedAt),
        slaStatus: slaStatusForRequest(request)
      }));
    return {
      title: "Reporte de niveles de servicio (SLA)",
      columns: [
        { key: "requestNumber", label: "Solicitud" },
        { key: "tripNumber", label: "Viaje" },
        { key: "client", label: "Cliente" },
        { key: "route", label: "Ruta" },
        { key: "pickupAt", label: "Recogida" },
        { key: "etaDelivery", label: "ETA entrega" },
        { key: "deliveredAt", label: "Entrega real" },
        { key: "cycleHours", label: "Ciclo (h)" },
        { key: "approvalMinutes", label: "Aprobación (min)" },
        { key: "slaStatus", label: "SLA" }
      ],
      rows,
      fileName: "reporte_sla_servicio.csv"
    };
  }
  if (reportId === "fleet_summary") {
    const rows = read(KEYS.vehicles, []).map((vehicle) => {
      const trips = requests.filter((r) => r.trip?.vehicleId === vehicle.id);
      const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
      const utilizationPct = trips.length ? Number(((completed / trips.length) * 100).toFixed(1)) : 0;
      const soatRisk = docExpiryStatus(vehicle.soatExpeditionDate);
      const techRisk = docExpiryStatus(vehicle.techInspectionExpeditionDate);
      return {
        plate: vehicle.plate,
        type: vehicle.type,
        capacityKg: parseNum(vehicle.capacityKg),
        available: vehicle.available ? "Disponible" : "Ocupado",
        trips: trips.length,
        completedTrips: completed,
        utilizationPct: `${utilizationPct}%`,
        riskLevel: soatRisk.days < 0 || techRisk.days < 0 ? "Crítico" : (soatRisk.days <= 30 || techRisk.days <= 30 ? "Atención" : "Controlado"),
        soat: vehicle.soatExpeditionDate || "-",
        tech: vehicle.techInspectionExpeditionDate || "-"
      };
    });
    return {
      title: "Reporte de camiones y utilización",
      columns: [
        { key: "plate", label: "Placa" },
        { key: "type", label: "Tipo" },
        { key: "capacityKg", label: "Capacidad kg" },
        { key: "available", label: "Estado" },
        { key: "trips", label: "Viajes totales" },
        { key: "completedTrips", label: "Viajes finalizados" },
        { key: "utilizationPct", label: "Utilización" },
        { key: "riskLevel", label: "Riesgo documental" },
        { key: "soat", label: "SOAT" },
        { key: "tech", label: "Tecnomecanica" }
      ],
      rows,
      fileName: "reporte_camiones.csv"
    };
  }
  if (reportId === "trips_operations") {
    const rows = requests.filter((r) => r.trip).map((request) => ({
      tripNumber: request.trip.tripNumber,
      requestNumber: request.requestNumber || request.id,
      client: request.clientName,
      driver: request.trip.driverName,
      vehicle: request.trip.vehiclePlate,
      route: formatRoute(request),
      status: request.status,
      slaStatus: slaStatusForRequest(request),
      cycleHours: hoursBetween(request.createdAt, request.deliveredAt || request.closedAt || request.trip.etaDelivery),
      assignedAt: fmtDate(request.trip.assignedAt || request.approvedAt || request.createdAt),
      deliveredAt: fmtDate(request.deliveredAt || request.closedAt || request.trip.etaDelivery)
    }));
    return {
      title: "Reporte operativo de viajes",
      columns: [
        { key: "tripNumber", label: "Viaje" },
        { key: "requestNumber", label: "Solicitud" },
        { key: "client", label: "Cliente" },
        { key: "driver", label: "Conductor" },
        { key: "vehicle", label: "Camion" },
        { key: "route", label: "Ruta" },
        { key: "status", label: "Estado" },
        { key: "slaStatus", label: "SLA" },
        { key: "cycleHours", label: "Ciclo (h)" },
        { key: "assignedAt", label: "Asignado" },
        { key: "deliveredAt", label: "Entrega/Cierre" }
      ],
      rows,
      fileName: "reporte_viajes.csv"
    };
  }
  if (reportId === "requests_lifecycle") {
    const rows = requests.map((request) => ({
      requestNumber: request.requestNumber || request.id,
      client: request.clientName,
      company: getCompanyById(request.clientCompanyId)?.name || "-",
      route: formatRoute(request),
      value: parseNum(deriveRequestOperationalValue(request)),
      status: request.status,
      approvalMinutes: minutesBetween(request.createdAt, request.approvedAt),
      hasTrip: request.trip ? "Sí" : "No",
      createdAt: fmtDate(request.createdAt),
      approvedAt: fmtDate(request.approvedAt)
    }));
    return {
      title: "Reporte de solicitudes",
      columns: [
        { key: "requestNumber", label: "Solicitud" },
        { key: "client", label: "Solicitante" },
        { key: "company", label: "Empresa" },
        { key: "route", label: "Ruta" },
        { key: "value", label: "Valor viaje" },
        { key: "status", label: "Estado" },
        { key: "approvalMinutes", label: "Aprobación (min)" },
        { key: "hasTrip", label: "Tiene viaje" },
        { key: "createdAt", label: "Creada" },
        { key: "approvedAt", label: "Aprobada" }
      ],
      rows,
      fileName: "reporte_solicitudes.csv"
    };
  }
  if (reportId === "drivers_performance") {
    const rows = read(KEYS.drivers, []).map((driver) => {
      const trips = requests.filter((r) => r.trip?.driverId === driver.id);
      const licenseDays = daysUntil(driver.licenseExpiry);
      return {
        name: driver.name,
        doc: driver.idDoc || "-",
        phone: driver.phone || "-",
        company: getCompanyById(driver.companyId)?.name || "-",
        license: `${driver.license || "-"} (${driver.licenseCategory || "-"})`,
        licenseDays: Number.isFinite(licenseDays) ? licenseDays : "-",
        trips: trips.length,
        completedTrips: trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length
      };
    });
    return {
      title: "Reporte de conductores",
      columns: [
        { key: "name", label: "Conductor" },
        { key: "doc", label: "Documento" },
        { key: "phone", label: "Telefono" },
        { key: "company", label: "Empresa" },
        { key: "license", label: "Licencia" },
        { key: "licenseDays", label: "Días vigencia licencia" },
        { key: "trips", label: "Viajes totales" },
        { key: "completedTrips", label: "Viajes finalizados" }
      ],
      rows,
      fileName: "reporte_conductores.csv"
    };
  }
  if (reportId === "payroll_summary") {
    const rows = read(KEYS.payrollRuns, []).map((run) => ({
      month: run.month,
      employee: run.employeeName,
      gross: parseNum(run.gross),
      travelAllowance: parseNum(run.travelAllowance || 0),
      fuelReimbursement: parseNum(run.fuelReimbursement || 0),
      deductions: parseNum(run.deductions),
      net: parseNum(run.net),
      status: run.paid ? "Pagado" : "Pendiente"
    }));
    return {
      title: "Reporte de nomina",
      columns: [
        { key: "month", label: "Mes" },
        { key: "employee", label: "Empleado" },
        { key: "gross", label: "Devengado" },
        { key: "travelAllowance", label: "Viaticos" },
        { key: "fuelReimbursement", label: "Reembolso combustible" },
        { key: "deductions", label: "Deducciones" },
        { key: "net", label: "Neto" },
        { key: "status", label: "Estado" }
      ],
      rows,
      fileName: "reporte_nomina.csv"
    };
  }
  if (reportId === "hiring_pipeline") {
    const interviews = read(KEYS.interviews, []);
    const contracts = read(KEYS.contracts, []);
    const rows = read(KEYS.candidates, []).map((candidate) => {
      const ai = portalCandidateAgeFromBirthIso(candidate.birthDate);
      return {
        name: candidate.name,
        vacancy: candidate.vacancyTitle,
        source: candidate.source || "-",
        status: candidate.status,
        birthDate: ai.birthLabel === "—" ? "-" : ai.birthLabel,
        ageYears: ai.age != null ? String(ai.age) : "-",
        expCargoYears: parseNum(candidate.experienceYears || 0),
        expectedSalary: parseNum(candidate.expectedSalary || 0),
        hasInterview: interviews.some((item) => String(item.candidateId || "") === String(candidate.id)) ? "Sí" : "No",
        hasContract: contracts.some((item) => String(item.candidateId || "") === String(candidate.id)) ? "Sí" : "No",
        stageAgeDays: Math.max(0, Math.floor((Date.now() - new Date(candidate.createdAt || nowIso()).getTime()) / 86400000)),
        createdAt: fmtDate(candidate.createdAt)
      };
    });
    return {
      title: "Reporte de contratacion y pipeline",
      columns: [
        { key: "name", label: "Candidato" },
        { key: "vacancy", label: "Vacante" },
        { key: "source", label: "Fuente" },
        { key: "status", label: "Estado proceso" },
        { key: "birthDate", label: "Fecha nacimiento" },
        { key: "ageYears", label: "Edad" },
        { key: "expCargoYears", label: "Años exp. cargo" },
        { key: "expectedSalary", label: "Aspiracion" },
        { key: "hasInterview", label: "Entrevista" },
        { key: "hasContract", label: "Contrato" },
        { key: "stageAgeDays", label: "Edad etapa (días)" },
        { key: "createdAt", label: "Fecha" }
      ],
      rows,
      fileName: "reporte_contratacion.csv"
    };
  }
  if (reportId === "labor_compliance") {
    const records = read(KEYS.sstCompliance, []);
    const rows = records.map((item) => ({
      employee: item.employeeName || "-",
      control: item.recordType || "-",
      provider: item.provider || "-",
      dueDate: item.dueDate || "-",
      daysToDue: Number.isFinite(daysUntil(item.dueDate)) ? daysUntil(item.dueDate) : "-",
      riskLevel: Number.isFinite(daysUntil(item.dueDate)) ? (daysUntil(item.dueDate) < 0 ? "Vencido" : daysUntil(item.dueDate) <= 30 ? "Próximo a vencer" : "Controlado") : "Sin fecha",
      status: item.status || "-",
      documentCode: item.documentCode || "-",
      createdAt: fmtDate(item.createdAt)
    }));
    return {
      title: "Reporte de cumplimiento laboral y SST",
      columns: [
        { key: "employee", label: "Empleado" },
        { key: "control", label: "Control" },
        { key: "provider", label: "Entidad" },
        { key: "dueDate", label: "Vencimiento" },
        { key: "daysToDue", label: "Días al vencimiento" },
        { key: "riskLevel", label: "Riesgo" },
        { key: "status", label: "Estado" },
        { key: "documentCode", label: "Codigo" },
        { key: "createdAt", label: "Registro" }
      ],
      rows,
      fileName: "reporte_cumplimiento_sst.csv"
    };
  }
  if (reportId === "users_access") {
    const rows = read(KEYS.users, []).map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      company: getCompanyById(user.companyId)?.name || user.company || "-",
      status: user.accountStatus || "aprobado",
      permissions: (user.permissions || []).length
    }));
    return {
      title: "Reporte de usuarios y accesos",
      columns: [
        { key: "name", label: "Nombre" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol" },
        { key: "company", label: "Empresa" },
        { key: "status", label: "Estado cuenta" },
        { key: "permissions", label: "Permisos" }
      ],
      rows,
      fileName: "reporte_usuarios.csv"
    };
  }
  if (reportId === "authorizations_traceability") {
    const rows = read(KEYS.approvals, []).map((approval) => ({
      title: approval.title,
      type: approval.type,
      status: approval.status,
      requestedBy: approval.requestedByName,
      requestedAt: fmtDate(approval.requestedAt),
      reviewedBy: approval.reviewedBy || "-",
      reviewedAt: fmtDate(approval.reviewedAt),
      resolutionHours: approval.reviewedAt ? hoursBetween(approval.requestedAt, approval.reviewedAt) : "-"
    }));
    return {
      title: "Reporte de autorizaciones",
      columns: [
        { key: "title", label: "Titulo" },
        { key: "type", label: "Tipo" },
        { key: "status", label: "Estado" },
        { key: "requestedBy", label: "Solicitante" },
        { key: "requestedAt", label: "Fecha solicitud" },
        { key: "reviewedBy", label: "Aprobador" },
        { key: "reviewedAt", label: "Fecha revision" },
        { key: "resolutionHours", label: "Resolución (h)" }
      ],
      rows,
      fileName: "reporte_autorizaciones.csv"
    };
  }
  return {
    title: "Reporte",
    columns: [{ key: "message", label: "Detalle" }],
    rows: [{ message: "Reporte no definido." }],
    fileName: "reporte.csv"
  };
}

function reportsHtml() {
  const user = currentUser();
  const cards = [
    { id: "executive_control_tower", icon: "activity", title: "Control Tower ejecutivo" },
    { id: "service_levels", icon: "clock", title: "Niveles de servicio (SLA)" },
    { id: "fleet_summary", icon: "truck", title: "Camiones y utilización" },
    { id: "trips_operations", icon: "compass", title: "Viajes operativos" },
    { id: "requests_lifecycle", icon: "file", title: "Solicitudes" },
    { id: "drivers_performance", icon: "user", title: "Conductores" },
    { id: "payroll_summary", icon: "dollar", title: "Nómina consolidada" },
    { id: "hiring_pipeline", icon: "briefcase", title: "Contratación y pipeline" },
    { id: "labor_compliance", icon: "shield", title: "Cumplimiento laboral y SST" },
    { id: "users_access", icon: "shield", title: "Usuarios y accesos" },
    { id: "authorizations_traceability", icon: "check", title: "Autorizaciones" }
  ];
  const visibleCards = cards.filter((card) => canAccessReport(user, card.id));
  const reportsHero = moduleFleetHeroStrip([
    { label: "Disponibles para ti", value: visibleCards.length },
    { label: "Catalogo total", value: cards.length },
    { label: "Sin acceso", value: cards.length - visibleCards.length, tone: cards.length - visibleCards.length ? "warn" : undefined },
    { label: "Formatos", value: "PDF + XLSX" }
  ]);
  const body = visibleCards.length
    ? `<div class="dash-grid">
    ${visibleCards
      .map((card) => `
      <article class="p-card">
        <div class="p-card-header">
          <div class="p-card-header-left"><div class="p-card-icon">${IC[card.icon] || IC.activity}</div><div><h2>${card.title}</h2></div></div>
        </div>
        <div class="p-card-body">
          <div class="toolbar">
            <button class="btn btn-sm btn-action" data-action="generate-report" data-report="${card.id}" data-format="pdf">${IC.file} PDF</button>
            <button class="btn btn-sm btn-approve" data-action="generate-report" data-report="${card.id}" data-format="excel">${IC.download} Excel</button>
          </div>
        </div>
      </article>`)
      .join("")}
  </div>`
    : `<p class="muted">Tu perfil no tiene reportes habilitados. Solicita permisos al administrador.</p>`;
  return reportsHero + pcardWrap("activity", "Reportería", null, body);
}

function monthRange(month) {
  const m = String(month || "").trim();
  if (/^\d{4}-\d{2}$/.test(m)) {
    const [year, monthNum] = m.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { start, end };
  }
  const ext = /^(\d{4})-(\d{2})(-.+)?$/.exec(m);
  if (ext) {
    const year = Number(ext[1]);
    const monthNum = Number(ext[2]);
    const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { start, end };
  }
  return null;
}

function dateInRange(value, range) {
  if (!range) return false;
  const ts = new Date(value || "").getTime();
  if (!Number.isFinite(ts)) return false;
  return ts >= range.start.getTime() && ts <= range.end.getTime();
}

function resolveDriverForEmployee(employee) {
  if (!employee) return null;
  const drivers = read(KEYS.drivers, []);
  const doc = String(employee.idDoc || "").trim();
  if (doc) {
    const byDoc = drivers.find((d) => String(d.idDoc || "").trim() === doc);
    if (byDoc) return byDoc;
  }
  const name = String(employee.name || "").trim().toLowerCase();
  if (!name) return null;
  return drivers.find((d) => String(d.name || "").trim().toLowerCase() === name) || null;
}

async function syncDriverFromEmployee(employee, extraDriverData = {}) {
  if (!employee || String(employee.workerRole || "") !== "conductor") return;
  const drivers = read(KEYS.drivers, []);
  const doc = String(employee.idDoc || "").trim();
  const existing = drivers.find((d) => String(d.idDoc || "").trim() === doc);
  const nextDriver = {
    name: employee.name,
    documentType: employee.documentType || "CC",
    idDoc: doc,
    phone: employee.phone || "",
    license: String(extraDriverData.license || employee.license || "").trim(),
    licenseCategory: String(extraDriverData.licenseCategory || employee.licenseCategory || "C2").trim(),
    licenseExpiry: String(extraDriverData.licenseExpiry || employee.licenseExpiry || "").trim(),
    city: employee.city || "",
    department: employee.department || "",
    address: employee.address || "",
    emergencyContact: employee.emergencyContact || "",
    emergencyPhone: employee.emergencyPhone || "",
    companyId: employee.companyId || "",
    available: true,
    hiredAt: existing?.hiredAt || nowIso()
  };
  if (!nextDriver.license || !nextDriver.licenseExpiry) {
    notify(userMessage("payrollDriverLicenseSync"), "error");
    return;
  }
  if (new Date(nextDriver.licenseExpiry).getTime() <= Date.now()) {
    notify(userMessage("payrollLicenseExpired"), "error");
    return;
  }
  if (existing) {
    const nextDrivers = drivers.map((d) => (d.id === existing.id ? { ...d, ...nextDriver } : d));
    try {
      await writeAwaitServer(KEYS.drivers, nextDrivers);
    } catch (_e) {}
    return;
  }
  try {
    await writeAwaitServer(KEYS.drivers, [{ id: newUuidV4(), ...nextDriver }, ...drivers]);
  } catch (_e) {}
}

function contractDedupKey(row) {
  if (!row) return "";
  const empKey =
    String(row.employeeId || "").trim().toLowerCase() ||
    String(row.idDocSnapshot || "").trim().toLowerCase() ||
    String(row.candidateId || "").trim().toLowerCase();
  const tpl = String(row.contractTemplateKind || "").trim().toLowerCase();
  const start = String(row.startDate || "").trim();
  if (!empKey) return "";
  return `${empKey}::${tpl}::${start}`;
}

function dedupContracts(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Map();
  const result = [];
  for (const row of list) {
    if (!row) continue;
    const key = contractDedupKey(row);
    if (!key) {
      result.push(row);
      continue;
    }
    if (!seen.has(key)) {
      seen.set(key, result.length);
      result.push(row);
      continue;
    }
    const idx = seen.get(key);
    const prev = result[idx];
    const prevTs = new Date(prev?.updatedAt || prev?.createdAt || 0).getTime() || 0;
    const curTs = new Date(row.updatedAt || row.createdAt || 0).getTime() || 0;
    result[idx] = curTs > prevTs ? { ...prev, ...row, id: prev.id || row.id } : { ...row, ...prev, id: prev.id || row.id };
  }
  return result;
}

function purgeDuplicateContracts() {
  const before = read(KEYS.contracts, []);
  const after = dedupContracts(before);
  if (after.length !== before.length) {
    write(KEYS.contracts, after);
  }
}

async function deleteEmployeesCascade(employeeIds = []) {
  const ids = [...new Set(employeeIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!ids.length) return 0;
  const employees = read(KEYS.payrollEmployees, []);
  const targets = employees.filter((employee) => ids.includes(String(employee.id)));
  const targetDocSet = new Set(targets.map((employee) => String(employee.idDoc || "").trim()).filter(Boolean));

  try {
    await writeAwaitServer(
      KEYS.payrollEmployees,
      employees.filter((employee) => !ids.includes(String(employee.id)))
    );
    await writeAwaitServer(KEYS.payrollRuns, read(KEYS.payrollRuns, []).filter((run) => !ids.includes(String(run.employeeId || ""))));
    await writeAwaitServer(
      KEYS.hrAbsences,
      read(KEYS.hrAbsences, []).filter((absence) => !ids.includes(String(absence.employeeId || "")))
    );
    await writeAwaitServer(
      KEYS.contracts,
      read(KEYS.contracts, []).filter((contract) => {
        const employeeId = String(contract.employeeId || "");
        const doc = String(contract.employeeIdDoc || "").trim();
        if (ids.includes(employeeId)) return false;
        if (doc && targetDocSet.has(doc)) return false;
        return true;
      })
    );
    await writeAwaitServer(
      KEYS.drivers,
      read(KEYS.drivers, []).filter((driver) => {
        const doc = String(driver.idDoc || "").trim();
        return !targetDocSet.has(doc);
      })
    );
  } catch (_e) {}
  return targets.length;
}

function mountUniversalModuleFilters() {
  if (!nodes.viewRoot) return;
  const moduleView = String(state.currentView || "");
  if (["profile"].includes(moduleView)) return;
  const tableBodies = [...nodes.viewRoot.querySelectorAll(".table-wrap table tbody")];
  const tableRows = tableBodies.flatMap((tbody) => [...tbody.querySelectorAll("tr")]);
  const cards = [...nodes.viewRoot.querySelectorAll(".user-card, .careers-card")];
  if (!tableRows.length && !cards.length) return;

  const firstTable = nodes.viewRoot.querySelector(".table-wrap table");
  const headers = firstTable ? [...firstTable.querySelectorAll("thead th")].map((th) => String(th.textContent || "").trim()) : [];
  const moduleLabels = {
    requests: "Solicitudes",
    "transport-trips": "Viajes",
    "transport-vehicles": "Flota",
    "transport-drivers": "Conductores",
    "transport-calendar": "Calendario",
    history: "Historial",
    payroll: "Gestión humana",
    hiring: "Contratacion",
    "admin-users": "Usuarios",
    authorizations: "Centro de aprobaciones",
    notifications: "Notificaciones",
    reports: "Reporteria"
  };
  const moduleLabel = moduleLabels[moduleView] || "Modulo";

  const toIsoDateSafe = (textValue) => {
    const text = String(textValue || "");
    const localDateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (localDateMatch) {
      const day = Number(localDateMatch[1]);
      const month = Number(localDateMatch[2]);
      const year = Number(localDateMatch[3].length === 2 ? `20${localDateMatch[3]}` : localDateMatch[3]);
      if (day > 0 && month > 0 && month <= 12 && year >= 2000) {
        return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
    const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    return isoMatch ? `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}` : "";
  };

  const statusValues = [...new Set(
    tableRows
      .map((row) => row.querySelector(".status, .status-pretty"))
      .filter(Boolean)
      .map((node) => String(node.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
  )];

  const host = document.createElement("section");
  host.className = "module-filters";
  host.innerHTML = `
    <div class="module-filters-head">
      <div class="module-filters-title">${IC.filter} Filtros inteligentes · ${moduleLabel}</div>
      <div class="module-filters-count" id="module-filter-count">0 resultados</div>
    </div>
    <div class="module-filters-grid">
      <label class="module-filter-field">
        <span>Busqueda general</span>
        <input id="module-filter-text" type="search" placeholder="Ej: cliente, placa, conductor, solicitud..." />
      </label>
      <label class="module-filter-field">
        <span>Campo</span>
        <select id="module-filter-column">
          <option value="">Todos los campos</option>
          ${headers.map((header, idx) => `<option value="${idx}">${header}</option>`).join("")}
        </select>
      </label>
      <label class="module-filter-field">
        <span>Valor exacto/parcial</span>
        <input id="module-filter-value" type="search" placeholder="Valor del campo seleccionado..." />
      </label>
      <label class="module-filter-field">
        <span>Estado</span>
        <select id="module-filter-status">
          <option value="">Todos</option>
          ${statusValues.map((status) => `<option value="${status.toLowerCase()}">${status}</option>`).join("")}
        </select>
      </label>
      <label class="module-filter-field">
        <span>Fecha desde</span>
        <input id="module-filter-date-from" type="date" />
      </label>
      <label class="module-filter-field">
        <span>Fecha hasta</span>
        <input id="module-filter-date-to" type="date" />
      </label>
    </div>
    <div class="module-filters-actions">
      <div class="module-filter-quick-status" id="module-filter-quick-status"></div>
      <button id="module-filter-clear" type="button" class="btn btn-sm btn-action">${IC.x} Limpiar filtros</button>
    </div>
  `;
  nodes.viewRoot.prepend(host);

  const input = host.querySelector("#module-filter-text");
  const colSelect = host.querySelector("#module-filter-column");
  const valueInput = host.querySelector("#module-filter-value");
  const statusSelect = host.querySelector("#module-filter-status");
  const fromInput = host.querySelector("#module-filter-date-from");
  const toInput = host.querySelector("#module-filter-date-to");
  const clearBtn = host.querySelector("#module-filter-clear");
  const resultCounter = host.querySelector("#module-filter-count");
  const quickStatusHost = host.querySelector("#module-filter-quick-status");

  if (quickStatusHost && statusValues.length) {
    quickStatusHost.innerHTML = statusValues
      .map((status) => `<button type="button" class="filter-pill" data-status-pill="${status.toLowerCase()}">${status}</button>`)
      .join("");
  }

  const apply = () => {
    const needle = String(input?.value || "").toLowerCase().trim();
    const colIndex = Number(colSelect?.value || NaN);
    const colNeedle = String(valueInput?.value || "").toLowerCase().trim();
    const selectedStatus = String(statusSelect?.value || "").toLowerCase().trim();
    const fromDate = String(fromInput?.value || "").trim();
    const toDate = String(toInput?.value || "").trim();
    let visibleRows = 0;
    let visibleCards = 0;

    tableRows.forEach((row) => {
      const text = String(row.textContent || "").toLowerCase();
      const cells = [...row.querySelectorAll("td")];
      const colText = Number.isFinite(colIndex) && cells[colIndex] ? String(cells[colIndex].textContent || "").toLowerCase() : "";
      const statusText = String(row.querySelector(".status, .status-pretty")?.textContent || "").toLowerCase().trim();
      const rowDate = toIsoDateSafe(row.textContent || "");
      const passGlobal = !needle || text.includes(needle);
      const passColumn = !colNeedle || (Number.isFinite(colIndex) ? colText.includes(colNeedle) : text.includes(colNeedle));
      const passStatus = !selectedStatus || statusText.includes(selectedStatus);
      const passFrom = !fromDate || (rowDate && rowDate >= fromDate);
      const passTo = !toDate || (rowDate && rowDate <= toDate);
      const visible = passGlobal && passColumn && passStatus && passFrom && passTo;
      row.style.display = visible ? "" : "none";
      if (visible) visibleRows += 1;
    });

    cards.forEach((card) => {
      const text = String(card.textContent || "").toLowerCase();
      const passGlobal = !needle || text.includes(needle);
      const passColumn = !colNeedle || text.includes(colNeedle);
      const passStatus = !selectedStatus || text.includes(selectedStatus);
      const visible = passGlobal && passColumn && passStatus;
      card.style.display = visible ? "" : "none";
      if (visible) visibleCards += 1;
    });

    const totalVisible = visibleRows + visibleCards;
    if (resultCounter) {
      resultCounter.textContent = `${totalVisible} resultado${totalVisible === 1 ? "" : "s"}`;
    }
  };

  input?.addEventListener("input", apply);
  colSelect?.addEventListener("change", apply);
  valueInput?.addEventListener("input", apply);
  statusSelect?.addEventListener("change", apply);
  fromInput?.addEventListener("change", apply);
  toInput?.addEventListener("change", apply);
  clearBtn?.addEventListener("click", () => {
    if (input) input.value = "";
    if (valueInput) valueInput.value = "";
    if (colSelect) colSelect.value = "";
    if (statusSelect) statusSelect.value = "";
    if (fromInput) fromInput.value = "";
    if (toInput) toInput.value = "";
    apply();
  });

  quickStatusHost?.querySelectorAll("[data-status-pill]").forEach((pill) => {
    pill.addEventListener("click", () => {
      const value = String(pill.getAttribute("data-status-pill") || "");
      const current = String(statusSelect?.value || "");
      if (statusSelect) statusSelect.value = current === value ? "" : value;
      quickStatusHost.querySelectorAll("[data-status-pill]").forEach((node) => {
        node.classList.toggle("active", node.getAttribute("data-status-pill") === statusSelect?.value);
      });
      apply();
    });
  });

  apply();
}

function tripsForDriverMonth(driver, month) {
  const range = monthRange(month);
  if (!range || !driver) return [];
  return reqRead().filter((request) => {
    if (!request?.trip || ![STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status)) return false;
    if (String(request.trip.driverId || "") !== String(driver.id || "")) return false;
    const refDate = request.closedAt || request.deliveredAt || request.trip.etaDelivery || request.trip.etaPickup || request.createdAt;
    return dateInRange(refDate, range);
  });
}

function calculateDriverTripReport(driverId, month) {
  const range = monthRange(month);
  if (!range || !driverId) {
    return { trips: [], tripCount: 0, interDepartmentTrips: 0, viaticTotal: 0, fuelTotal: 0, technicalTotal: 0, kmEstimated: 0 };
  }
  const driver = read(KEYS.drivers, []).find((d) => String(d.id) === String(driverId));
  if (!driver) {
    return { trips: [], tripCount: 0, interDepartmentTrips: 0, viaticTotal: 0, fuelTotal: 0, technicalTotal: 0, kmEstimated: 0 };
  }
  const trips = tripsForDriverMonth(driver, month);
  const rules = read(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 });
  const interDepartmentTrips = trips.filter((trip) => String(trip.originDepartment || "") !== String(trip.destinationDepartment || "")).length;
  const viaticTotal = interDepartmentTrips * parseNum(rules.interDepartmentTripAmount);
  const fuelLogs = read(KEYS.fuelLogs, []).filter((log) => String(log.driverId || "") === String(driver.id) && dateInRange(log.date, range));
  const fuelTotal = fuelLogs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const technicalTotal = read(KEYS.vehicleTechnicalLogs, [])
    .filter((log) => dateInRange(log.date, range) && trips.some((t) => String(t.trip?.vehicleId || "") === String(log.vehicleId || "")))
    .reduce((acc, log) => acc + parseNum(log.cost), 0);
  const kmEstimated = trips.reduce((acc, trip) => acc + Math.max(0, parseNum(trip.distanceKm || 0)), 0);
  return { trips, tripCount: trips.length, interDepartmentTrips, viaticTotal, fuelTotal, technicalTotal, kmEstimated };
}

function payrollHtml() {
  const employees = read(KEYS.payrollEmployees, []);
  const companies = read(KEYS.companies, []);
  const rules = read(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 });
  const positions = getActivePositions();
  const positionOpts = positions.map((p) => `<option value="${p.id}">${p.name} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}</option>`).join("");
  const companyOptions = companies
    .filter((c) => isCompanyRecordActive(c))
    .map((c) => `<option value="${c.id}">${escapeHtml(String(c.name || ""))} (${escapeHtml(companyKindLabel(c.companyKind))})</option>`)
    .join("");
  const allRuns = read(KEYS.payrollRuns, []);
  const absences = read(KEYS.hrAbsences, []);
  const filters = state.payrollFilters || { period: "all", employee: "", status: "all" };
  const payrollUi = state.payrollUi || { runSort: "recent", workspace: "overview" };
  const runSort = String(payrollUi.runSort || "recent");
  const payrollWorkspace = String(payrollUi.workspace || "overview");
  const filterPeriod = String(filters.period || "all");
  const filterEmployee = String(filters.employee || "");
  const filterStatus = String(filters.status || "all");
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastYm = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}`;
  const runs = allRuns.filter((r) => {
    const matchPeriod =
      filterPeriod === "all" ||
      (filterPeriod === "current" && String(r.month || "") === currentYm) ||
      (filterPeriod === "previous" && String(r.month || "") === lastYm);
    const matchEmployee = !filterEmployee || String(r.employeeId || "") === filterEmployee;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "paid" && r.paid) ||
      (filterStatus === "pending" && !r.paid);
    return matchPeriod && matchEmployee && matchStatus;
  });
  const sortedRuns = [...runs].sort((a, b) => {
    if (runSort === "pending_first") {
      if (Boolean(a.paid) !== Boolean(b.paid)) return a.paid ? 1 : -1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (runSort === "net_desc") return parseNum(b.net) - parseNum(a.net);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  const pending = allRuns.filter((r) => !r.paid).length;
  const totalPayrollMonth = allRuns
    .filter((r) => String(r.month || "") === currentYm)
    .reduce((acc, run) => acc + parseNum(run.net), 0);
  const pendingAbsenceApprovals = read(KEYS.approvals, []).filter((a) => a.status === "pendiente" && a.type === "register_hr_absence").length;
  const hrAdminDeletes = currentUser()?.role === ROLES.ADMIN;
  const employeeRows = employees
    .map((e) => {
      const avCss = employeeAvatarCssUrl(e.avatarUrl);
      const avatar = avCss
        ? `<span class="emp-avatar" style="background-image:url('${avCss}')" role="img" aria-label=""></span>`
        : `<span class="emp-avatar emp-avatar-letter" aria-hidden="true">${escapeHtml(String(e.name || "E").charAt(0).toUpperCase())}</span>`;
      return `<tr>
      ${hrAdminDeletes ? `<td><input type="checkbox" data-employee-select value="${e.id}" /></td>` : ""}
      <td><div class="emp-cell-name">${avatar}<div><strong>${escapeHtml(e.name || "")}</strong><br><span class="muted">${e.workerRole === "conductor" ? "Conductor" : "Empleado"}</span></div></div></td><td>${escapeHtml(String(e.idDoc || ""))}</td><td>${escapeHtml(String(e.position || ""))}</td><td>${escapeHtml(String(e.contractType || ""))}</td><td>${escapeHtml(getCompanyById(e.companyId)?.name || "-")}</td><td>$${parseNum(e.baseSalary).toLocaleString("es-CO")}</td><td>${fmtDate(e.startDate)}</td>
      <td><div class="toolbar employee-table-actions">
        <button type="button" class="btn btn-sm btn-outline" data-action="view-employee" data-id="${escapeAttr(String(e.id))}">${IC.eye} Perfil</button>
        <button type="button" class="btn btn-sm btn-action" data-action="edit-employee" data-id="${escapeAttr(String(e.id))}">${IC.edit} Editar</button>
        <button type="button" class="btn btn-sm btn-outline" data-action="employee-generate-contract" data-id="${escapeAttr(String(e.id))}">${IC.file} Contrato Word</button>
        ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${escapeAttr(String(e.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`;
    })
    .join("");
  const runRows = sortedRuns
    .map((r) => {
      const state = r.paid ? "paid" : "pending";
      const monthLabel = String(r.month || "").trim();
      const pk = String(r.payrollKind || "mensual");
      const typeCell = (() => {
        if (pk === "terminacion") return '<span class="status status-viaje_asignado">Terminación</span>';
        const bits = [];
        const orig = String(r.liquidacionOrigin || r.origenLiquidacion || "manual").toLowerCase();
        if (orig === "automatica") bits.push('<span class="status status-pendiente" title="Generada por el servidor (cron día 13)">Automática</span>');
        if (parseNum(r.primaServiciosCop) > 0) bits.push("Prima");
        if (parseNum(r.interesesCesantiasCop) > 0) bits.push("Int. cesantías");
        return bits.length
          ? `<span class="muted">Nómina</span><br><span class="muted" style="font-size:0.76rem">${bits.join(" · ")} incl.</span>`
          : `<span class="muted">Nómina</span>`;
      })();
      return `<tr data-payroll-state="${state}">
        <td><strong>${escapeHtml(monthLabel)}</strong></td>
        <td>${typeCell}</td>
        <td>${escapeHtml(String(r.employeeName || "—"))}</td>
        <td>$${parseNum(r.gross).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.travelAllowance || 0).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.fuelReimbursement || 0).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.deductions).toLocaleString("es-CO")}</td>
        <td><strong>$${parseNum(r.net).toLocaleString("es-CO")}</strong></td>
        <td>${r.paid ? '<span class="status status-viaje_asignado">Pagado</span>' : '<span class="status status-pendiente">Pendiente</span>'}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-action" data-action="payslip" data-id="${escapeAttr(String(r.id))}">${IC.printer} Desprendible</button>
          ${!r.paid ? `<button class="btn btn-sm btn-approve" data-action="mark-payroll-paid" data-id="${escapeAttr(String(r.id))}">${IC.check} Marcar pagado</button>` : ""}
          ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-payroll-run" data-id="${escapeAttr(String(r.id))}" title="Eliminar esta liquidacion (solo administradores)">${IC.trash} Eliminar liquidacion</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");

  const licenseCategoryOptions = selectOptionsFromCatalog(CO_CATALOGS.licenseCategories);
  const epsOptions = selectOptionsFromCatalog(CO_CATALOGS.eps);
  const arlOptions = selectOptionsFromCatalog(CO_CATALOGS.arl);
  const bloodTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.bloodTypes);
  const pensionFundOptions = selectOptionsFromCatalog(CO_CATALOGS.pensionFunds);
  const docTypeOptions = CO_CATALOGS.documentTypes.map((d) => `<option value="${d}">${d === "CC" ? "Cédula de ciudadanía" : d === "CE" ? "Cédula de extranjería" : d === "PAS" ? "Pasaporte" : d === "PEP" ? "Permiso especial (PEP)" : "Tarjeta de identidad"}</option>`).join("");
  const contractTypeOpts = CO_CATALOGS.contractTypes.map((c) => `<option>${c}</option>`).join("");
  const severanceOpts = selectOptionsFromCatalog(CO_CATALOGS.severanceFunds);
  const compensationOpts = selectOptionsFromCatalog(CO_CATALOGS.compensationFunds);
  const arlRiskOpts = selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels);
  const contributorOpts = selectOptionsFromCatalog(CO_CATALOGS.contributorTypes);
  const banksOpts = selectOptionsFromCatalog(CO_CATALOGS.banks);
  const accountTypeOpts = selectOptionsFromCatalog(CO_CATALOGS.accountTypes);
  const educationOpts = selectOptionsFromCatalog(CO_CATALOGS.educationLevel);
  const maritalOpts = selectOptionsFromCatalog(CO_CATALOGS.maritalStatus);
  const genderOpts = selectOptionsFromCatalog(CO_CATALOGS.genders);
  const payFreqOpts = selectOptionsFromCatalog(CO_CATALOGS.payFrequency);
  const formEmp = `<form id="form-employee" class="p-form p-form-colored hr-form-flow">
    <div class="hr-form-wizard" data-hr-wizard="employee" aria-label="Registro de empleado por pasos">
      <div class="hr-form-wizard-toolbar">
        <div>
          <p class="hr-form-wizard-kicker">Flujo guiado</p>
          <p class="hr-form-wizard-lead">Un bloque por pantalla; menos campos simultáneos y menos errores al pasar a guardar.</p>
        </div>
        <div class="hr-form-wizard-meta">
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:16.666667%"></span></div>
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 6</span>
        </div>
      </div>
      <div class="hr-form-wizard-dots" role="tablist" aria-label="Secciones del formulario">
        <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Paso 1: datos personales"><span class="hr-dot-num">1</span><small>Persona</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Paso 2: contacto"><span class="hr-dot-num">2</span><small>Contacto</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="2" aria-label="Paso 3: laboral"><span class="hr-dot-num">3</span><small>Laboral</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="3" aria-label="Paso 4: seguridad social"><span class="hr-dot-num">4</span><small>Seg. social</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="4" aria-label="Paso 5: banco"><span class="hr-dot-num">5</span><small>Banco</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="5" aria-label="Paso 6: conductor y cierre"><span class="hr-dot-num">6</span><small>Extras</small></button>
      </div>

      <div class="hr-form-step is-active" data-step-index="0">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.user} Datos personales</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required placeholder="Nombres y apellidos completos" /></label>
        <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType" required>${docTypeOptions}</select></label>
        <label>${fieldLabel(IC.badge, "N° documento")}<input name="idDoc" required /></label>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" /></label>
        <label>${fieldLabel(IC.users, "Género")}<select name="gender">${genderOpts}</select></label>
        <label>${fieldLabel(IC.heart, "Estado civil")}<select name="maritalStatus">${maritalOpts}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo de sangre (RH)")}<select name="bloodType" required>${bloodTypeOptions}</select></label>
        <label>${fieldLabel(IC.graduation, "Nivel educativo")}<select name="educationLevel">${educationOpts}</select></label>
        <label>${fieldLabel(IC.heart, "¿Sufre alguna enfermedad o condición médica?")}<select name="hasIllness" id="emp-has-illness" required>
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select></label>
        <label class="full hidden" id="emp-illness-detail-label">${fieldLabel(IC.alertTriangle, "¿Cuál? (descripción libre)")}<textarea name="illnessDescription" id="emp-illness-detail" rows="2" placeholder="Detalle breve para uso médico/HR (alergias, condiciones crónicas, medicación regular, etc.)"></textarea></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="1">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.mapPin} Contacto y residencia</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="employee-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="employee-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Dirección de residencia")}<input name="address" required placeholder="Carrera 15 # 6-56, Apto 302, Barrio La Floresta" /></label>
        <label>${fieldLabel(IC.phone, "Teléfono celular")}<input name="phone" required placeholder="3001234567" /></label>
        <label>${fieldLabel(IC.mail, "Correo personal")}<input type="email" name="personalEmail" placeholder="empleado@correo.com" /></label>
        <label>${fieldLabel(IC.user, "Contacto de emergencia")}<input name="emergencyContact" required /></label>
        <label>${fieldLabel(IC.phone, "Teléfono emergencia")}<input name="emergencyPhone" required /></label>
        <label>${fieldLabel(IC.heart, "Parentesco emergencia")}<input name="emergencyRelation" placeholder="Cónyuge, padre, hermano(a)..." /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="2">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.briefcase} Datos laborales</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required><option value="">Seleccione</option>${companyOptions}</select></label>
        <label>${fieldLabel(IC.briefcase, "Cargo (catálogo)")}<select name="positionId" id="emp-position-select" required><option value="">Seleccione un cargo creado en Contratación</option>${positionOpts}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo de contrato")}<select name="contractType" id="emp-contract-type" required>${contractTypeOpts}</select></label>
        <label>${fieldLabel(IC.calendar, "Duración del contrato")}<input name="contractDuration" required placeholder="Ej: 12 meses, indefinido" /></label>
        <label>${fieldLabel(IC.calendar, "Fecha ingreso")}<input type="date" name="startDate" required /></label>
        <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="number" name="baseSalary" id="emp-base-salary" min="${CO_HR_RULES.minMonthlySalary}" required placeholder="Mín. SMMLV ${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")}" /></label>
        <label>${fieldLabel(IC.dollar, "Auxilio de transporte")}<input type="number" name="transportAllowance" value="${CO_HR_RULES.transportAllowance}" min="0" /></label>
        <label>${fieldLabel(IC.clock, "Periodicidad de pago")}<select name="payFrequency">${payFreqOpts}</select></label>
        <label>${fieldLabel(IC.layers, "Centro de costos")}<input name="costCenter" placeholder="Ej: CC-OPERACIONES-01" /></label>
        <label>${fieldLabel(IC.shield, "Tipo de cotizante")}<select name="contributorType">${contributorOpts}</select></label>
        <label>${fieldLabel(IC.alertTriangle, "Nivel de riesgo ARL")}<select name="arlRiskLevel">${arlRiskOpts}</select></label>
        <label>${fieldLabel(IC.file, "Plantilla de contrato Word")}<select name="contractTemplateKind" required>
          <option value="oficina">Contrato trabajo personal oficina</option>
          <option value="fijo">Contrato personal término fijo</option>
          <option value="prestacion">Contrato prestación de servicios conductores</option>
        </select></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="3">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.shield} Seguridad social y parafiscales</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.heart, "EPS")}<select name="eps" required>${epsOptions}</select></label>
        <label>${fieldLabel(IC.shield, "Fondo de pensión")}<select name="pensionFund" required>${pensionFundOptions}</select></label>
        <label>${fieldLabel(IC.shield, "ARL")}<select name="arl" required>${arlOptions}</select></label>
        <label>${fieldLabel(IC.shield, "Fondo de cesantías")}<select name="severanceFund">${severanceOpts}</select></label>
        <label>${fieldLabel(IC.users, "Caja de compensación")}<select name="compensationFund">${compensationOpts}</select></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="4">
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.bank} Datos bancarios</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.bank, "Banco")}<select name="bankName" required>${banksOpts}</select></label>
        <label>${fieldLabel(IC.card, "Tipo de cuenta")}<select name="bankAccountType">${accountTypeOpts}</select></label>
        <label>${fieldLabel(IC.hash, "Número de cuenta")}<input name="bankAccount" required placeholder="Ej: 1234567890" /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="5">
    <fieldset class="form-section form-section-rose full hr-conductor-fields" id="hr-conductor-fields">
      <legend>${IC.truck} Si el cargo es CONDUCTOR (datos adicionales)</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.file, "N° licencia de conducción")}<input name="license" placeholder="Ej: 12C34567890" /></label>
        <label>${fieldLabel(IC.activity, "Categoría licencia")}<select name="licenseCategory">${licenseCategoryOptions}</select></label>
        <label>${fieldLabel(IC.calendar, "Vence licencia")}<input type="date" name="licenseExpiry" /></label>
        <label>${fieldLabel(IC.calendar, "Examen psicosensométrico")}<input type="date" name="psychoTestDate" /></label>
        <label>${fieldLabel(IC.calendar, "Vence psicosensométrico")}<input type="date" name="psychoTestExpiry" /></label>
        <label>${fieldLabel(IC.award, "Curso conducción defensiva (Res. 17220)")}<select name="defensiveCourse">
          <option value="">Seleccione...</option>
          <option value="vigente">Vigente</option>
          <option value="vencido">Vencido</option>
          <option value="no_aplica">No aplica</option>
        </select></label>
      </div>
    </fieldset>

    <label class="full">${fieldLabel(IC.upload, "Foto del empleado")}<input type="file" name="avatarFile" accept="image/*" /></label>

      </div>

      <div class="hr-form-wizard-footer">
        <div class="hr-form-wizard-footer-nav">
          <button type="button" class="btn btn-outline btn-sm" data-hr-wizard-prev disabled>Anterior</button>
          <button type="button" class="btn btn-action btn-sm" data-hr-wizard-next>Siguiente</button>
        </div>
        <p class="hr-form-wizard-hint muted" data-hr-wizard-hint>Avance hasta el último paso para habilitar guardar.</p>
        <div class="hr-form-wizard-submit-row toolbar" style="justify-content:flex-end;flex-wrap:wrap;gap:0.5rem">
          <button type="button" class="btn btn-outline btn-sm hr-form-wizard-contract-draft" data-action="employee-form-generate-contract-draft" data-hr-wizard-submit-sync disabled aria-disabled="true">${IC.file} Generar contrato Word</button>
          <button class="btn btn-primary hr-form-wizard-submit" type="submit" disabled aria-disabled="true">${IC.save} Guardar empleado</button>
        </div>
      </div>
    </div>
  </form>`;
  const formPay = `<form id="form-payroll" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.user} Periodo y persona</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.workerRole === "conductor" ? "Conductor" : "Empleado"}</option>`).join("")}</select></label>
        <label>${fieldLabel(IC.calendar, "Mes a liquidar")}<input type="month" name="month" required /></label>
      </div>
    </fieldset>
    <fieldset id="payroll-prima-fieldset" class="form-section form-section-amber full hidden" aria-hidden="true">
      <legend>${IC.award} Prima de servicios (semestral)</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.65rem">
        Junio y diciembre pueden incluir prima. Cálculo orientativo: (salario base × días trabajados en el semestre) ÷ 360 (CST). Revise siempre con contador antes de pagar.
      </p>
      <div class="form-section-grid">
        <label class="full" style="align-items:flex-start;display:flex;gap:0.5rem;flex-wrap:wrap">
          <input type="checkbox" name="payPrimaServicios" value="1" id="payroll-pay-prima" style="margin-top:0.2rem" />
          <span>Sí, incluir prima de servicios en esta liquidación</span>
        </label>
        <label>${fieldLabel(IC.clock, "Días laborados en el semestre")}
          <input type="number" name="primaServiciosDays" min="1" max="183" placeholder="Ej. 180" disabled /></label>
        <label>${fieldLabel(IC.dollar, "Valor prima (COP)")}
          <input type="number" name="primaServiciosCop" min="0" step="100" disabled /></label>
      </div>
    </fieldset>
    <fieldset id="payroll-cesantias-int-fieldset" class="form-section form-section-violet full hidden" aria-hidden="true">
      <legend>${IC.dollar} Intereses sobre cesantías (enero o febrero)</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.65rem">
        <strong>Ley 52 de 1975:</strong> el trabajador tiene derecho a intereses del <strong>12% anual</strong> sobre sus cesantías; el legislador prevé el pago al trabajador <strong>en enero</strong> del año siguiente al causado (y reglas especiales en retiros o ceses). Este bloque aparece si el mes liquidado es enero (01) o febrero (02): use enero para coincidir con el plazo habitual, o febrero solo si así lo acuerda política interna y contabilidad sin omitir cumplimiento. Coordine fecha y base con extracto del fondo o contador.
      </p>
      <div class="form-section-grid">
        <label class="full" style="align-items:flex-start;display:flex;gap:0.5rem;flex-wrap:wrap">
          <input type="checkbox" name="payInteresesCesantias" value="1" id="payroll-pay-int-cesantias" style="margin-top:0.2rem" />
          <span>Incluir en esta liquidación el pago de intereses sobre cesantías</span>
        </label>
        <label>${fieldLabel(IC.dollar, "Base cesantías (COP)")}
          <input type="number" name="cesantiasInterestBaseCop" min="0" step="100" placeholder="Saldo/consignación año referencia" disabled /></label>
        <label>${fieldLabel(IC.clock, "Días (sobre 360 para proporcional)")}
          <input type="number" name="cesantiasInterestDays" min="1" max="366" value="360" disabled /></label>
        <label>${fieldLabel(IC.dollar, "Valor intereses (COP)")}
          <input type="number" name="interesesCesantiasCopMonthly" min="0" step="100" disabled /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.dollar} Pagos y deducciones variables</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.dollar, "Viáticos manuales (COP)")}<input type="number" name="travelAllowanceManual" value="0" min="0" /></label>
        <label>${fieldLabel(IC.dollar, "Reembolso combustible manual (COP)")}<input type="number" name="fuelReimbursementManual" value="0" min="0" /></label>
        <label>${fieldLabel(IC.clock, "Horas extras")}<input type="number" name="extras" value="0" min="0" /></label>
        <label>${fieldLabel(IC.truck, "Auxilio transporte (COP)")}<input type="number" name="aux" value="${CO_HR_RULES.transportAllowance}" min="0" /></label>
        <label>${fieldLabel(IC.award, "Bonificaciones (COP)")}<input type="number" name="bonus" value="0" min="0" /></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.dollar} Generar liquidación</button>
  </form>`;
  const payrollEmpOptionsSettlement = `<option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.workerRole === "conductor" ? "Conductor" : "Empleado"}</option>`).join("")}`;
  const formPayrollSettlement = `<form id="form-payroll-settlement" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.activity} Liquidación contractual (terminación)</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.75rem">
        Para renuncia, despido u otras causas de terminación. Montos orientativos (cesantías, intereses proporcionales, prima proporcional, vacaciones según ordenamiento laboral colombiano). Ajuste cada rubro y consolide con contabilidad y fondos.
      </p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required>${payrollEmpOptionsSettlement}</select></label>
        <label>${fieldLabel(IC.calendar, "Mes de retiro (periodo)")}<input type="month" name="month" required /></label>
        <label>${fieldLabel(IC.calendar, "Fecha de terminación")}<input type="date" name="terminationDate" required /></label>
        <label>${fieldLabel(IC.file, "Motivo de terminación")}
          <select name="terminationCause" required>
            <option value="renuncia_voluntaria">Renuncia voluntaria</option>
            <option value="despido_sin_justa">Despido sin justa causa</option>
            <option value="despido_justa">Despido con justa causa</option>
            <option value="mutuo_acuerdo">Mutuo acuerdo</option>
            <option value="vencimiento_contrato">Vencimiento de contrato</option>
            <option value="otro">Otro</option>
          </select>
        </label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.clock} Referencias para el cálculo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.clock, "Días (año 360 — cesantías)")}<input type="number" name="days360Year" min="0" max="360" value="360" /></label>
        <label>${fieldLabel(IC.clock, "Días proporcional prima")}<input type="number" name="primaPropDays" min="0" max="360" value="0" /></label>
        <label>${fieldLabel(IC.calendar, "Días vacaciones a compensar (÷720)")}<input type="number" name="vacationDays" min="0" max="366" step="1" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Indemnización (COP)")}<input type="number" name="indemnization" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Otros conceptos (COP)")}<input type="number" name="otrosSettlement" min="0" value="0" /></label>
        <div class="full toolbar" style="justify-content:flex-start">
          <button type="button" class="btn btn-sm btn-outline" data-action="settlement-recalc">${IC.activity} Calcular rubros sugeridos</button>
        </div>
        <label>${fieldLabel(IC.dollar, "Cesantías (COP)")}<input type="number" name="cesantiasCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Intereses cesantías (COP)")}<input type="number" name="interesesCesantiasCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Prima proporcional (COP)")}<input type="number" name="primaPropCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Vacaciones (COP)")}<input type="number" name="vacacionesCop" min="0" value="0" /></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.save} Registrar liquidación contractual</button>
  </form>`;
  const formAbsence = `<form id="form-hr-absence" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.calendar} Datos de la novedad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.idDoc}</option>`).join("")}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo de ausencia")}
          <select name="absenceType" required>
            <option value="incapacidad">Incapacidad (EPS / enfermedad general o accidente)</option>
            <option value="vacaciones">Vacaciones remuneradas</option>
            <option value="licencia">Licencia (maternidad/paternidad u otra)</option>
            <option value="calamidad">Licencia por calamidad doméstica (3 días/calendario año)</option>
          </select>
        </label>
        <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="startDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="endDate" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.file} Soporte</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.hash, "No. incapacidad o soporte")}<input name="supportNumber" placeholder="Código EPS / radicado" /></label>
        <label class="full">${fieldLabel(IC.heart, "EPS o entidad")}<select name="epsEntity">${epsOptions}<option value="Otra">Otra</option></select></label>
        <label class="full">${fieldLabel(IC.file, "Observaciones")}<textarea name="notes" rows="2" placeholder="Detalle para archivo de personal"></textarea></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.save} Registrar ausencia</button>
  </form>`;
  const absenceRows = absences
    .map(
      (a) => `<tr>
      <td>${fmtDate(a.createdAt)}</td>
      <td>${a.employeeName}</td>
      <td>${a.absenceType === "incapacidad" ? "Incapacidad" : a.absenceType === "vacaciones" ? "Vacaciones" : a.absenceType === "licencia" ? "Licencia" : "Calamidad"}</td>
      <td>${a.startDate} → ${a.endDate}</td>
      <td>${a.days}</td>
      <td><span class="muted">${a.supportNumber || "-"}</span></td>
      <td><div class="toolbar">
        <button type="button" class="btn btn-sm btn-outline" data-action="view-hr-absence" data-id="${escapeAttr(String(a.id))}">${IC.eye} Ver</button>
        ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-hr-absence" data-id="${escapeAttr(String(a.id))}">${IC.edit} Editar</button>` : ""}
        ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-hr-absence" data-id="${escapeAttr(String(a.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`
    )
    .join("");
  const absenceTable = absenceRows
    ? `<div class="table-wrap"><table><thead><tr><th>Registro</th><th>Empleado</th><th>Tipo</th><th>Periodo</th><th>Días</th><th>Soporte</th><th style="min-width:11rem">Acciones</th></tr></thead><tbody>${absenceRows}</tbody></table></div>`
    : emptyState("Sin incapacidades ni vacaciones registradas.");
  const empTable = employeeRows
    ? `<div style="margin-bottom:0.8rem" class="toolbar">${hrAdminDeletes ? `<button id="employees-select-all" class="btn btn-sm btn-action">${IC.check} Seleccionar todo</button><button id="employees-delete-selected" class="btn btn-sm btn-reject" title="Solo administradores">${IC.trash} Eliminar seleccionados (cascada)</button>` : ""}</div><div class="table-wrap"><table><thead><tr>${hrAdminDeletes ? "<th></th>" : ""}<th>Nombre/Rol</th><th>Cedula</th><th>Cargo</th><th>Contrato</th><th>Empresa</th><th>Base</th><th>Ingreso</th><th>Acciones</th></tr></thead><tbody>${employeeRows}</tbody></table></div>`
    : emptyState("No hay empleados registrados.");
  const runTable = runRows
    ? `<div style="margin-bottom:0.8rem"><button id="export-payroll" class="btn btn-sm btn-action">${IC.download} Exportar CSV</button></div><div class="table-wrap"><table><thead><tr><th>Mes</th><th>Tipo</th><th>Empleado</th><th>Devengado</th><th>Viaticos</th><th>Reembolso combustible</th><th>Deducciones</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${runRows}</tbody></table></div>`
    : emptyState("Sin liquidaciones registradas.");
  const employeeOpts = employees
    .map((e) => `<option value="${e.id}" ${filterEmployee === e.id ? "selected" : ""}>${e.name}</option>`)
    .join("");
  const filtersHtml = `<form id="payroll-filters" class="payroll-filters-bar">
      <label>${fieldLabel(IC.calendar, "Periodo")}<select name="period">
        <option value="all" ${filterPeriod === "all" ? "selected" : ""}>Todos los periodos</option>
        <option value="current" ${filterPeriod === "current" ? "selected" : ""}>Mes actual</option>
        <option value="previous" ${filterPeriod === "previous" ? "selected" : ""}>Mes anterior</option>
      </select></label>
      <label>${fieldLabel(IC.user, "Empleado")}<select name="employee">
        <option value="">Todos</option>${employeeOpts}
      </select></label>
      <label>${fieldLabel(IC.activity, "Estado")}<select name="status">
        <option value="all" ${filterStatus === "all" ? "selected" : ""}>Todos</option>
        <option value="paid" ${filterStatus === "paid" ? "selected" : ""}>Pagado</option>
        <option value="pending" ${filterStatus === "pending" ? "selected" : ""}>Pendiente</option>
      </select></label>
      <button type="button" class="btn btn-action btn-sm" data-action="payroll-clear-filters">${IC.x} Limpiar</button>
    </form>`;
  const payrollHead = `<div class="ops-module-head ops-module-head--rich">
      <div class="ops-module-title">
        <span class="ops-module-kicker">Personal · Recursos humanos</span>
        <h2>Personal y nómina</h2>
        <p class="ops-module-subtitle">Administra empleados, calcula la nómina del mes y registra ausencias o incapacidades. Todo queda con respaldo para tu equipo contable.</p>
      </div>
      <div class="ops-module-chips">
        <span class="ops-chip"><strong>${employees.length}</strong> colaboradores</span>
        <span class="ops-chip"><strong>${pending}</strong> pagos pendientes</span>
        <span class="ops-chip"><strong>${pendingAbsenceApprovals}</strong> ausencias por revisar</span>
      </div>
    </div>`;
  const payrollActions = `<div class="ops-command-bar">
      <div class="ops-command-cluster">
        <p class="ops-command-cluster-label">Crear nuevo</p>
        <div class="ops-command-group">
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-employee">${IC.userPlus} Agregar empleado</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-payroll-settlement">${IC.file} Liquidación contractual</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-hr-absence">${IC.calendar} Registrar ausencia</button>
        </div>
      </div>
      <div class="ops-command-cluster">
        <p class="ops-command-cluster-label">Filtrar historial</p>
        <div class="ops-command-group">
        <button class="btn btn-sm btn-outline ${filterStatus === "pending" ? "is-active" : ""}" type="button" data-action="payroll-focus-pending">${IC.alertTriangle} Solo pendientes</button>
        <button class="btn btn-sm btn-outline ${filterStatus === "all" ? "is-active" : ""}" type="button" data-action="payroll-focus-all">${IC.layers} Ver todo</button>
        <button class="btn btn-sm btn-outline ${runSort === "pending_first" ? "is-active" : ""}" type="button" data-action="payroll-sort-runs" data-sort="pending_first">${IC.activity} Pendientes primero</button>
        <button class="btn btn-sm btn-outline ${runSort === "net_desc" ? "is-active" : ""}" type="button" data-action="payroll-sort-runs" data-sort="net_desc">${IC.dollar} Mayor monto</button>
        </div>
      </div>
    </div>`;
  const payrollExecutionBlock = `<section class="ops-block ops-block--payroll-flow">
      <header class="ops-block-head">
        <h3>¿Qué deseas registrar?</h3>
        <p class="ops-block-lead muted">Selecciona la tarjeta correspondiente: agregar un empleado, calcular la nómina del mes o cargar una ausencia.</p>
      </header>
      <div class="dash-grid payroll-actions-grid">${createCollapsibleCard("create-employee", "userPlus", "Agregar empleado", null, formEmp, "Guardar empleado")}${createCollapsibleCard("create-payroll", "dollar", "Calcular nómina del mes", null, formPay, "Generar liquidación")}${createCollapsibleCard("create-payroll-settlement", "hash", "Liquidación por terminación", "Cesantías, prima proporcional y vacaciones (orientativo Ley colombiana).", formPayrollSettlement, "Abrir liquidación")}${createCollapsibleCard("create-hr-absence", "calendar", "Registrar ausencia o incapacidad", null, formAbsence, "Guardar ausencia")}</div>
    </section>`;
  const payrollDataBlock = `<section class="ops-block ops-block--payroll-data">
      <header class="ops-block-head">
        <h3>Información del personal</h3>
        <p class="ops-block-lead muted">Listas de empleados, ausencias e historial de nóminas pagadas. Puedes filtrar por mes, empleado y estado.</p>
      </header>
      <div class="payroll-data-grid">
        ${pcardWrap("user", "Lista de empleados", employees.length + " colaboradores" + (pending > 0 ? ` · ${pending} pagos pendientes` : ""), empTable)}
        ${pcardWrap("activity", "Ausencias registradas", absences.length + " registros", absenceTable)}
        ${pcardWrap("clock", "Nóminas pagadas", runs.length + " liquidaciones", runTable)}
      </div>
    </section>`;
  const payrollFleetHero = moduleFleetHeroStrip(
    [
      { label: "Colaboradores", value: employees.length },
      { label: "Pagos pendientes", value: pending, tone: pending ? "warn" : undefined },
      { label: "Pagado este mes", value: `$${parseNum(totalPayrollMonth).toLocaleString("es-CO")}` },
      {
        label: "Ausencias por revisar",
        value: pendingAbsenceApprovals,
        tone: pendingAbsenceApprovals ? "warn" : undefined
      }
    ],
    "payroll"
  );
  const payrollTabsNav = renderHrWorkspaceTabs({
    module: "payroll",
    ariaLabel: "Secciones del módulo Personal y nómina",
    activeId: payrollWorkspace,
    tabs: [
      { id: "overview", label: "Inicio", icon: "compass" },
      { id: "operate", label: "Nuevos registros", icon: "userPlus" },
      { id: "data", label: "Información y reportes", icon: "layers" }
    ]
  });
  const payrollWorkspaceJumps = `<div class="hr-workspace-jumps">
      <button type="button" class="btn btn-primary hr-workspace-jump-btn" data-action="hr-workspace-tab" data-module="payroll" data-tab="operate">${IC.userPlus} Crear nuevo registro</button>
      <button type="button" class="btn btn-primary hr-workspace-jump-btn" data-action="hr-workspace-tab" data-module="payroll" data-tab="data">${IC.layers} Ver listas y reportes</button>
    </div>`;
  const payrollOverviewPanel = `<div class="hr-workspace-panel${payrollWorkspace === "overview" ? "" : " hidden"}" role="tabpanel" data-payroll-panel="overview">
      ${payrollHead}
      ${hrModuleOverviewGuide("payroll")}
      <div class="hr-workspace-quicknav">
        <p class="hr-workspace-quicknav-label">Atajos para empezar</p>
        ${payrollWorkspaceJumps}
      </div>
    </div>`;
  const payrollOperatePanel = `<div class="hr-workspace-panel${payrollWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-payroll-panel="operate">
      ${payrollActions}
      ${payrollExecutionBlock}
    </div>`;
  const payrollDataPanel = `<div class="hr-workspace-panel${payrollWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-payroll-panel="data">
      <section class="ops-block">
        <header class="ops-block-head">
          <h3>Buscar y filtrar</h3>
          <p class="ops-block-lead muted">Aplica filtros antes de exportar o revisar los datos del personal y los pagos.</p>
        </header>
        ${pcardWrap("filter", "Filtros disponibles", null, filtersHtml)}
      </section>
      ${payrollDataBlock}
    </div>`;
  return `<section class="payroll-shell payroll-shell--workspace hr-flow-shell hr-module-pro hr-module-pro--payroll" data-hr-workspace="${escapeAttr(payrollWorkspace)}">${payrollFleetHero}${payrollTabsNav}
      <div class="hr-workspace-panels">
        ${payrollOverviewPanel}
        ${payrollOperatePanel}
        ${payrollDataPanel}
      </div>
    </section>`;
}

/** Tamaño máximo para incrustar CV en adjuntos_json sin R2 (coincide con API). */
const HR_CANDIDATE_CV_INLINE_MAX_BYTES = 1_500_000;

/** Convierte los archivos del formulario RRHH en objetos `cv_blob` para sync con API. */
async function readCandidateHrAttachmentsFromInput(fileInput) {
  if (!fileInput || !fileInput.files?.length) return [];
  const max = HR_CANDIDATE_CV_INLINE_MAX_BYTES;
  const out = [];
  for (const f of [...fileInput.files]) {
    if (f.size > max) {
      notify(
        `"${String(f.name)}" supera ${Math.round(max / 1024 / 1024)} MB. Adjunte un archivo más liviano o reduzca el tamaño.`,
        "error"
      );
      return null;
    }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error("file"));
        fr.readAsDataURL(f);
      });
      const m = typeof dataUrl === "string" ? dataUrl.match(/^data:([^;]+);base64,(.+)$/) : null;
      if (!m) continue;
      out.push({
        kind: "cv_blob",
        name: String(f.name || "archivo").trim().slice(0, 240),
        mime: m[1],
        data: m[2]
      });
    } catch (_e) {
      notify("No se pudo leer un archivo adjunto. Reintente o use otro formato.", "error");
      return null;
    }
  }
  return out;
}

/** Edad cumplida desde fecha de nacimiento YYYY-MM-DD (null si inválida). */
function portalCandidateAgeFromBirthIso(birthIso) {
  const s = String(birthIso ?? "")
    .trim()
    .slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { age: null, birthLabel: "—" };
  const [y, mo, d] = s.split("-").map((x) => Number(x));
  const birth = new Date(y, mo - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== mo - 1 || birth.getDate() !== d) {
    return { age: null, birthLabel: s };
  }
  const today = new Date();
  let age = today.getFullYear() - y;
  const md = today.getMonth() - (mo - 1);
  if (md < 0 || (md === 0 && today.getDate() < d)) age -= 1;
  return { age, birthLabel: s };
}

function hiringHtml() {
  const vacancies = read(KEYS.vacancies, []);
  const candidates = read(KEYS.candidates, []);
  const positions = read(KEYS.positions, []);
  const activePositions = positions.filter((p) => p.active !== false);
  const interviews = read(KEYS.interviews, []);
  const contracts = read(KEYS.contracts, []);
  const employees = read(KEYS.payrollEmployees, []);
  const positionOptions = activePositions.map((p) => `<option value="${p.id}">${p.name} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}</option>`).join("");
  const today = new Date();
  const openVacancies = vacancies.filter((v) => v.status === "Publicada");
  const activeCandidates = candidates.filter((c) => !["Contratado", "Descartado"].includes(c.status));
  const hiringUi = state.hiringUi || {
    candidateFilter: "active",
    vacancyFilter: "open",
    candidateSort: "recent",
    workspace: "overview"
  };
  const candidateFilter = String(hiringUi.candidateFilter || "active");
  const vacancyFilter = String(hiringUi.vacancyFilter || "open");
  const candidateSort = String(hiringUi.candidateSort || "recent");
  const hiringWorkspace = String(hiringUi.workspace || "overview");
  const contractsThisMonth = contracts.filter((c) => {
    const d = new Date(c.createdAt || "");
    return Number.isFinite(d.getTime()) && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const soonClosingVacancies = openVacancies.filter((v) => {
    if (!v.deadline) return false;
    const days = Math.ceil((new Date(`${v.deadline}T12:00:00`).getTime() - today.getTime()) / 86400000);
    return days >= 0 && days <= 7;
  });
  const contractsEndingSoon = contracts.filter((c) => {
    if (!c.endDate) return false;
    const days = Math.ceil((new Date(`${c.endDate}T12:00:00`).getTime() - today.getTime()) / 86400000);
    return days >= 0 && days <= 30;
  });

  const positionAdminEdits = isAdminActor();
  const positionRows = positions
    .map((p) => `<tr>
      <td><strong>${escapeHtml(String(p.name || ""))}</strong></td>
      <td>${p.workerRole === "conductor" ? "Conductor" : "Empleado"}</td>
      <td>$${parseNum(p.baseSalary).toLocaleString("es-CO")}</td>
      <td>${escapeHtml(String(p.contractTypeDefault || "-"))}</td>
      <td>${escapeHtml(String(p.legalBasis || "CST"))}</td>
      <td>${p.active === false ? '<span class="status status-rechazada">Inactivo</span>' : '<span class="status status-viaje_asignado">Activo</span>'}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-outline" data-action="view-position" data-id="${escapeAttr(String(p.id))}">${IC.eye} Ver</button>
        ${positionAdminEdits ? `<button class="btn btn-sm btn-action" data-action="edit-position" data-id="${escapeAttr(String(p.id))}">${IC.edit} Editar</button>` : ""}
        <button class="btn btn-sm btn-action" data-action="toggle-position" data-id="${escapeAttr(String(p.id))}">${IC.toggle} Estado</button>
        ${positionAdminEdits ? `<button class="btn btn-sm btn-reject" data-action="delete-position" data-id="${escapeAttr(String(p.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`)
    .join("");

  const filteredVacancies = vacancies.filter((v) => (vacancyFilter === "open" ? v.status === "Publicada" : true));
  const vacancyAdminDeletes = currentUser()?.role === ROLES.ADMIN;
  const filteredCandidates = candidates.filter((c) => {
    if (candidateFilter === "active") return !["Contratado", "Descartado"].includes(String(c.status || ""));
    if (candidateFilter === "finalized") return ["Contratado", "Descartado"].includes(String(c.status || ""));
    return true;
  });
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (candidateSort === "pipeline") return PIPELINE.indexOf(String(a.status || PIPELINE[0])) - PIPELINE.indexOf(String(b.status || PIPELINE[0]));
    if (candidateSort === "experience") return parseNum(b.experienceYears || 0) - parseNum(a.experienceYears || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  const vacRows = filteredVacancies
    .map((v) => {
      const delCell = vacancyAdminDeletes
        ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-vacancy" data-id="${escapeAttr(String(v.id))}" title="Solo administradores del sistema">${IC.trash} Eliminar</button>`
        : `<span class="muted" title="Eliminar solo con rol administrador">—</span>`;
      const statusHtml =
        v.status === "Publicada"
          ? '<span class="status status-viaje_asignado">Publicada</span>'
          : '<span class="status status-rechazada">Cerrada</span>';
      return `<tr>
      <td><strong>${escapeHtml(String(v.title || ""))}</strong></td>
      <td>${escapeHtml(String(v.positionName || "-"))}</td>
      <td>${escapeHtml(String(v.city || "-"))} · ${escapeHtml(String(v.modality || "-"))}</td>
      <td>${escapeHtml(String(v.openings ?? 1))}</td>
      <td>$${parseNum(v.salaryOffer).toLocaleString("es-CO")}</td>
      <td>${escapeHtml(String(v.deadline || "-"))}</td>
      <td>${statusHtml}</td>
      <td><div class="toolbar vacancy-row-actions">${[
        `<button type="button" class="btn btn-sm btn-outline" data-action="view-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.eye} Ver</button>`,
        vacancyAdminDeletes ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.edit} Editar</button>` : "",
        `<button type="button" class="btn btn-sm btn-action" data-action="close-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.x} Cerrar</button>`,
        delCell
      ].filter(Boolean).join("")}</div></td>
    </tr>`;
    })
    .join("");
  const hiringAdminMutates = isAdminActor();
  const candRows = sortedCandidates
    .map((c) => {
      const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
      const ageStr = ageInfo.age != null ? `${ageInfo.age} años` : "—";
      const expCargo = parseNum(c.experienceYears || 0);
      return `<tr>
      <td><strong>${escapeHtml(String(c.name || ""))}</strong></td>
      <td>${escapeHtml(String(c.email || ""))}<br><span class="muted">${escapeHtml(String(c.phone || "-"))}</span></td>
      <td>${escapeHtml(String(c.vacancyTitle || "-"))}</td>
      <td><strong>${expCargo} años</strong> en el cargo<br><span class="muted">Edad: ${escapeHtml(ageStr)} · Nac.: ${escapeHtml(ageInfo.birthLabel)}</span><br><span class="muted">Disp.: ${escapeHtml(String(c.availabilityDate || "-"))}</span></td>
      <td><span class="muted">${escapeHtml(String(c.source || "Portal"))}</span></td>
      <td><span class="status status-en_transito">${escapeHtml(String(c.status || ""))}</span></td>
      <td><select data-action="candidate-status" data-id="${escapeAttr(String(c.id))}" style="padding:0.4rem;border-radius:8px;border:1px solid var(--line);font-size:0.82rem">${PIPELINE.map((p) => `<option ${c.status === p ? "selected" : ""}>${escapeHtml(p)}</option>`).join("")}</select></td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-outline" data-action="view-candidate" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
        ${hiringAdminMutates ? `<button class="btn btn-sm btn-action" data-action="edit-candidate" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
        ${hiringAdminMutates ? `<button class="btn btn-sm btn-reject" data-action="delete-candidate" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`;
    })
    .join("");
  const interviewRows = interviews
    .map((i) => `<tr>
      <td><strong>${escapeHtml(String(i.candidateName || "-"))}</strong></td>
      <td>${escapeHtml(String(i.when || "-"))}</td>
      <td>${escapeHtml(String(i.interviewer || "-"))}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-outline" data-action="view-interview" data-id="${escapeAttr(String(i.id))}">${IC.eye} Ver</button>
        ${hiringAdminMutates ? `<button class="btn btn-sm btn-action" data-action="edit-interview" data-id="${escapeAttr(String(i.id))}">${IC.edit} Editar</button>` : ""}
        ${hiringAdminMutates ? `<button class="btn btn-sm btn-reject" data-action="delete-interview" data-id="${escapeAttr(String(i.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`)
    .join("");
  const contractRows = contracts
    .map((c) => `<tr>
      <td><strong>${escapeHtml(String(c.candidateName || c.employeeName || "-"))}</strong></td>
      <td>${escapeHtml(String(c.position || ""))}</td>
      <td>$${parseNum(c.salary).toLocaleString("es-CO")}</td>
      <td>${escapeHtml(String(c.contractType || "-"))}${c.endDate ? `<br><span class="muted">Fin: ${escapeHtml(String(c.endDate))}</span>` : ""}</td>
      <td>${escapeHtml(String(c.source || "Candidato"))}</td>
      <td>${fmtDate(c.createdAt)}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-outline" data-action="view-contract-detail" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
        <button class="btn btn-sm btn-action" data-action="view-contract" data-id="${escapeAttr(String(c.id))}" title="Descargar Word">${IC.download} Word</button>
        ${hiringAdminMutates ? `<button class="btn btn-sm btn-reject" data-action="delete-contract" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`)
    .join("");

  const arlRiskOpts = selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels);
  const workScheduleOpts = selectOptionsFromCatalog(CO_CATALOGS.workSchedule);
  const fPosition = `<form id="form-position" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.briefcase} Definición del cargo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.briefcase, "Nombre del cargo")}<input name="name" required placeholder="Ej: Coordinador de transporte" /></label>
        <label>${fieldLabel(IC.users, "Rol del cargo")}<select name="workerRole" required>
          <option value="empleado">Empleado</option>
          <option value="conductor">Conductor</option>
        </select></label>
        <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="number" name="baseSalary" min="${CO_HR_RULES.minMonthlySalary}" required placeholder="Mín. SMMLV ${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")}" /></label>
        <label>${fieldLabel(IC.activity, "Tipo de contrato sugerido")}<select name="contractTypeDefault" required>
          ${CO_CATALOGS.contractTypes.map((c) => `<option>${c}</option>`).join("")}
        </select></label>
        <label>${fieldLabel(IC.clock, "Jornada laboral")}<select name="workSchedule">${workScheduleOpts}</select></label>
        <label>${fieldLabel(IC.alertTriangle, "Nivel de riesgo ARL")}<select name="arlRiskLevel">${arlRiskOpts}</select></label>
        <label>${fieldLabel(IC.shield, "Salario integral")}<select name="integralSalary">
          <option value="false">No (10+ prestaciones)</option>
          <option value="true">Sí (≥ 13 SMMLV + 30% factor prestacional)</option>
        </select></label>
        <label class="full">${fieldLabel(IC.file, "Base legal")}<input name="legalBasis" value="CST art. 45-46, Ley 50/1990 y normatividad laboral vigente" /></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.plus} Crear cargo</button>
  </form>`;
  const fVac = `<form id="form-vacancy" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.send} Publicación de la vacante</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.briefcase, "Cargo publicado")}<select name="positionId" required><option value="">Seleccione</option>${positionOptions}</select></label>
        <label>${fieldLabel(IC.file, "Título visible")}<input name="title" required placeholder="Ej: Conductor C2 Bogotá Sabana" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="vacancy-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="vacancy-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label>${fieldLabel(IC.globe, "Modalidad")}<select name="modality" required><option value="Presencial">Presencial</option><option value="Hibrido">Híbrido</option><option value="Remoto">Remoto</option></select></label>
        <label>${fieldLabel(IC.clock, "Jornada")}<select name="workday" required><option value="Tiempo completo">Tiempo completo</option><option value="Turnos">Turnos</option><option value="Medio tiempo">Medio tiempo</option></select></label>
        <label>${fieldLabel(IC.users, "Cupos")}<input type="number" min="1" name="openings" value="1" required /></label>
        <label>${fieldLabel(IC.dollar, "Salario ofrecido")}<input type="number" min="${CO_HR_RULES.minMonthlySalary}" name="salaryOffer" required placeholder="Mín. SMMLV" /></label>
        <label>${fieldLabel(IC.calendar, "Fecha límite")}<input type="date" name="deadline" required /></label>
        <label class="full">${fieldLabel(IC.file, "Requisitos")}<textarea name="requirements" rows="3" required placeholder="Ej: Licencia C2 vigente, 3 años de experiencia, curso defensivo..."></textarea></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.plus} Publicar vacante</button>
  </form>`;
  const educationOptsCand = selectOptionsFromCatalog(CO_CATALOGS.educationLevel);
  const docTypeCand = CO_CATALOGS.documentTypes.map((d) => `<option value="${d}">${d === "CC" ? "Cédula de ciudadanía" : d === "CE" ? "Cédula de extranjería" : d === "PAS" ? "Pasaporte" : d === "PEP" ? "Permiso especial (PEP)" : "Tarjeta de identidad"}</option>`).join("");
  const fCand = `<form id="form-candidate" class="p-form p-form-colored hr-form-flow">
    <div class="hr-form-wizard" data-hr-wizard="candidate" aria-label="Registro de candidato por pasos">
      <div class="hr-form-wizard-toolbar">
        <div>
          <p class="hr-form-wizard-kicker">Registro en dos pasos</p>
          <p class="hr-form-wizard-lead">Primero identidad y ubicación; luego perfil, vacante y adjuntos.</p>
        </div>
        <div class="hr-form-wizard-meta">
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:50%"></span></div>
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 2</span>
        </div>
      </div>
      <div class="hr-form-wizard-dots hr-form-wizard-dots--few" role="tablist" aria-label="Secciones">
        <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Paso 1: datos personales"><span class="hr-dot-num">1</span><small>Identidad</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Paso 2: perfil profesional"><span class="hr-dot-num">2</span><small>Perfil</small></button>
      </div>

      <div class="hr-form-step is-active" data-step-index="0">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.user} Datos personales del candidato</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required /></label>
        <label>${fieldLabel(IC.mail, "Correo electrónico")}<input type="email" name="email" required /></label>
        <label>${fieldLabel(IC.phone, "Teléfono celular")}<input name="phone" required placeholder="3001234567" /></label>
        <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType" required>${docTypeCand}</select></label>
        <label>${fieldLabel(IC.badge, "N° documento")}<input name="idDoc" required /></label>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" required /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="candidate-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="candidate-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" required /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="1">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.briefcase} Perfil profesional</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.graduation, "Nivel educativo")}<select name="educationLevel">${educationOptsCand}</select></label>
        <label>${fieldLabel(IC.star, "Años de experiencia en el cargo")}<input type="number" min="0" step="1" name="experienceYears" value="0" required /></label>
        <label>${fieldLabel(IC.dollar, "Aspiración salarial (COP)")}<input type="number" min="${CO_HR_RULES.minMonthlySalary}" name="expectedSalary" required placeholder="Mín. SMMLV" /></label>
        <label>${fieldLabel(IC.calendar, "Disponibilidad ingreso")}<input type="date" name="availabilityDate" required /></label>
        <label>${fieldLabel(IC.send, "Vacante")}<select name="vacancyId" required><option value="">Seleccione</option>${vacancies.filter((v) => v.status === "Publicada").map((v) => `<option value="${v.id}">${v.title}</option>`).join("")}</select></label>
        <label class="full">${fieldLabel(IC.upload, "Adjunto hoja de vida")}<input type="file" name="attachments" multiple /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-wizard-footer">
        <div class="hr-form-wizard-footer-nav">
          <button type="button" class="btn btn-outline btn-sm" data-hr-wizard-prev disabled>Anterior</button>
          <button type="button" class="btn btn-action btn-sm" data-hr-wizard-next>Siguiente</button>
        </div>
        <p class="hr-form-wizard-hint muted" data-hr-wizard-hint>Avance hasta el último paso para habilitar guardar.</p>
        <button class="btn btn-primary hr-form-wizard-submit" type="submit" disabled aria-disabled="true">${IC.userPlus} Registrar candidato</button>
      </div>
    </div>
  </form>`;
  const fInt = `<form id="form-interview" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.calendar} Programación de entrevista</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Candidato")}<select name="candidateId" required><option value="">Seleccione</option>${candidates.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label>
        <label>${fieldLabel(IC.calendar, "Fecha y hora")}<input type="datetime-local" name="when" required /></label>
        <label>${fieldLabel(IC.user, "Entrevistador")}<input name="interviewer" required placeholder="Nombre del entrevistador" /></label>
        <label>${fieldLabel(IC.globe, "Modalidad")}<select name="mode">
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="telefonica">Telefónica</option>
        </select></label>
        <label class="full">${fieldLabel(IC.mapPin, "Lugar / Link")}<input name="place" placeholder="Sala 1 / link Google Meet / Teams..." /></label>
        <label class="full">${fieldLabel(IC.file, "Notas previas")}<textarea name="notes" rows="2"></textarea></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.calendar} Guardar entrevista</button>
  </form>`;
  const signDateDefault = colombiaTodayIsoDate();
  const fCon = `<form id="form-contract" class="p-form p-form-colored hr-form-flow">
    <div class="hr-form-wizard" data-hr-wizard="contract" aria-label="Generación de contrato por pasos">
      <div class="hr-form-wizard-toolbar">
        <div>
          <p class="hr-form-wizard-kicker">Contrato Word</p>
          <p class="hr-form-wizard-lead">Primero datos de firma; en el siguiente paso puede probar las plantillas.</p>
        </div>
        <div class="hr-form-wizard-meta">
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:50%"></span></div>
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 2</span>
        </div>
      </div>
      <div class="hr-form-wizard-dots hr-form-wizard-dots--few" role="tablist">
        <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Datos de descarga"><span class="hr-dot-num">1</span><small>Datos</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Pruebas y referencia"><span class="hr-dot-num">2</span><small>Plantillas</small></button>
      </div>

      <div class="hr-form-step is-active" data-step-index="0">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.file} Descargar contrato Word</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.position || "-"} · CC ${e.idDoc || "-"}</option>`).join("")}</select></label>
        <label>${fieldLabel(IC.file, "Plantilla Word")}<select name="contractTemplateKind">
          <option value="">Automatica segun tipo de contrato y rol</option>
          <option value="oficina">CONTRATO_TRABAJO_PERSONAL_OFICINA.docx</option>
          <option value="fijo">CONTRATO_PERSONAL_TERMINO_FIJO.docx</option>
          <option value="prestacion">CONTRATO_PRESTACION_DE_SERVICIOS_CONDUCTORES.docx</option>
        </select></label>
        <label>${fieldLabel(IC.calendar, "Fecha de firma (constancia)")}<input type="date" name="signDate" required value="${signDateDefault}" /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="1">
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.download} Vista previa de plantilla</legend>
      <div class="form-section-grid hr-form-contract-tests">
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="oficina">${IC.file} Prueba · Oficina</button>
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="fijo">${IC.file} Prueba · Termino fijo</button>
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="prestacion">${IC.file} Prueba · Prestacion servicios</button>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-wizard-footer">
        <div class="hr-form-wizard-footer-nav">
          <button type="button" class="btn btn-outline btn-sm" data-hr-wizard-prev disabled>Anterior</button>
          <button type="button" class="btn btn-action btn-sm" data-hr-wizard-next>Siguiente</button>
        </div>
        <p class="hr-form-wizard-hint muted" data-hr-wizard-hint>Use el siguiente paso si desea revisar una plantilla antes de descargar.</p>
        <button class="btn btn-primary hr-form-wizard-submit" type="submit" aria-disabled="false">${IC.file} Generar y descargar contrato Word</button>
      </div>
    </div>
  </form>`;

  const tPos = positionRows ? `<div class="table-wrap"><table><thead><tr><th>Cargo</th><th>Rol</th><th>Salario</th><th>Contrato</th><th>Base legal</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${positionRows}</tbody></table></div>` : emptyState("Sin cargos definidos");
  const tVac = vacRows ? `<div class="table-wrap"><table><thead><tr><th>Vacante</th><th>Cargo base</th><th>Ubicacion</th><th>Cupos</th><th>Salario</th><th>Limite</th><th>Estado</th><th style="min-width:11rem">Acciones</th></tr></thead><tbody>${vacRows}</tbody></table></div>` : emptyState("Sin vacantes");
  const tCand = candRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Contacto</th><th>Vacante</th><th>Experiencia / edad</th><th>Origen</th><th>Estado</th><th>Cambiar</th><th>Acciones</th></tr></thead><tbody>${candRows}</tbody></table></div>` : emptyState("Sin candidatos");
  const tInt = interviewRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Fecha</th><th>Entrevistador</th><th>Acciones</th></tr></thead><tbody>${interviewRows}</tbody></table></div>` : emptyState("Sin entrevistas");
  const tCon = contractRows ? `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Cargo</th><th>Salario</th><th>Tipo contrato</th><th>Origen</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>${contractRows}</tbody></table></div>` : emptyState("Sin contratos");
  const alertsBody = renderHrAlertCards([
    {
      icon: IC.alertTriangle,
      label: "Vacantes por cerrar (≤ 7 días)",
      value: soonClosingVacancies.length,
      help: "Publicadas con fecha límite cercana. Revísalas o extiéndelas.",
      tone: soonClosingVacancies.length ? "warn" : "ok"
    },
    {
      icon: IC.calendar,
      label: "Contratos por vencer (≤ 30 días)",
      value: contractsEndingSoon.length,
      help: "Anticipa renovaciones, prórrogas o liquidaciones.",
      tone: contractsEndingSoon.length ? "warn" : "ok"
    },
    {
      icon: IC.users,
      label: "Candidatos activos en pipeline",
      value: activeCandidates.length,
      help: "Personas en proceso (no contratados ni descartados).",
      tone: "info"
    },
    {
      icon: IC.file,
      label: "Contratos generados este mes",
      value: contractsThisMonth.length,
      help: "Documentos de contratación cerrados en el mes en curso.",
      tone: "ok"
    }
  ]);
  const candidateConversion = candidates.length ? Math.round((contracts.length / Math.max(candidates.length, 1)) * 100) : 0;
  const urgentItems = soonClosingVacancies.length + contractsEndingSoon.length;

  const hiringHead = `<div class="ops-module-head ops-module-head-hiring ops-module-head--rich">
      <div class="ops-module-title">
        <span class="ops-module-kicker">Selección · Recursos humanos</span>
        <h2>Selección y contratación</h2>
        <p class="ops-module-subtitle">Define cargos, publica vacantes, evalúa candidatos y formaliza contratos. Recibirás alertas cuando haya plazos por vencer.</p>
      </div>
      <div class="ops-module-chips">
        <span class="ops-chip"><strong>${openVacancies.length}</strong> vacantes abiertas</span>
        <span class="ops-chip"><strong>${activeCandidates.length}</strong> candidatos en proceso</span>
        <span class="ops-chip"><strong>${contractsThisMonth.length}</strong> contratos del mes</span>
      </div>
    </div>`;
  const hiringActions = `<div class="ops-command-bar">
      <div class="ops-command-cluster">
        <p class="ops-command-cluster-label">Crear nuevo</p>
        <div class="ops-command-group">
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-position">${IC.briefcase} Definir cargo</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-vacancy">${IC.plus} Publicar vacante</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-candidate">${IC.userPlus} Agregar candidato</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-contract">${IC.file} Generar contrato</button>
        </div>
      </div>
      <div class="ops-command-cluster">
        <p class="ops-command-cluster-label">Filtrar resultados</p>
        <div class="ops-command-group">
        <button class="btn btn-sm btn-outline ${candidateFilter === "active" ? "is-active" : ""}" type="button" data-action="hiring-candidates-active">${IC.activity} Solo candidatos activos</button>
        <button class="btn btn-sm btn-outline ${candidateFilter === "all" ? "is-active" : ""}" type="button" data-action="hiring-candidates-all">${IC.layers} Ver todos los candidatos</button>
        <button class="btn btn-sm btn-outline ${vacancyFilter === "open" ? "is-active" : ""}" type="button" data-action="hiring-vacancies-open">${IC.briefcase} Vacantes abiertas</button>
        <button class="btn btn-sm btn-outline ${candidateSort === "pipeline" ? "is-active" : ""}" type="button" data-action="hiring-sort-candidates" data-sort="pipeline">${IC.filter} Ordenar por etapa</button>
        </div>
      </div>
    </div>`;
  const hiringExecutionBlock = `<section class="ops-block ops-block--hiring-flow">
      <header class="ops-block-head">
        <h3>Pasos para contratar</h3>
        <p class="ops-block-lead muted">Sigue el orden recomendado: primero busca al talento adecuado y luego evalúalo y formaliza el contrato.</p>
      </header>
      <div class="hr-flow-block hr-flow-block--step" data-flow-step="1">
        <div class="hr-flow-step-head">
          <span class="hr-flow-step-num" aria-hidden="true">1</span>
          <div>
            <h3>Busca al talento</h3>
            <p class="hr-flow-step-lead muted">Define el cargo, abre la vacante y registra a los candidatos que se postulen.</p>
          </div>
        </div>
        <div class="hiring-actions-grid hiring-actions-row--three">${createCollapsibleCard("create-position", "briefcase", "Definir cargo", null, fPosition, "Guardar cargo")}${createCollapsibleCard("create-vacancy", "plus", "Publicar vacante", null, fVac, "Publicar vacante")}${createCollapsibleCard("create-candidate", "userPlus", "Agregar candidato", null, fCand, "Guardar candidato")}</div>
      </div>
      <div class="hr-flow-block hr-flow-block--step" data-flow-step="2">
        <div class="hr-flow-step-head">
          <span class="hr-flow-step-num" aria-hidden="true">2</span>
          <div>
            <h3>Evalúa y formaliza</h3>
            <p class="hr-flow-step-lead muted">Programa entrevistas y, cuando estés listo, genera el contrato en Word.</p>
          </div>
        </div>
        <div class="hiring-actions-grid hiring-actions-row--two">${createCollapsibleCard("create-interview", "calendar", "Programar entrevista", null, fInt, "Agendar entrevista")}${createCollapsibleCard("create-contract", "file", "Generar contrato (Word)", null, fCon, "Generar contrato")}</div>
      </div>
    </section>`;
  const hiringDataBlock = `<section class="ops-block ops-block--hiring-data">
      <header class="ops-block-head">
        <h3>Tu panel de seguimiento</h3>
        <p class="ops-block-lead muted">Aquí ves, de un vistazo, qué necesita atención hoy: alertas de plazos, candidatos en proceso, vacantes activas, entrevistas agendadas y contratos firmados. Cada bloque ocupa el ancho completo para que puedas leer las tablas sin tener que deslizarte de lado a lado.</p>
      </header>
      <div class="hiring-data-grid hiring-results-grid hiring-results-grid--stacked">
        ${pcardWrap("activity", "Lo que necesita atención hoy", "Alertas y plazos clave", alertsBody)}
        ${pcardWrap("users", "Candidatos en proceso", sortedCandidates.length + " personas en seguimiento", tCand)}
        ${pcardWrap("briefcase", "Vacantes activas", filteredVacancies.length + " visibles para postular", tVac)}
        ${pcardWrap("calendar", "Próximas entrevistas", interviews.length + " agendadas", tInt)}
        ${pcardWrap("file", "Contratos firmados", contracts.length + " en el histórico", tCon)}
        ${pcardWrap("briefcase", "Catálogo de cargos", `${positions.length} cargos (${activePositions.length} activos)`, tPos)}
      </div>
    </section>`;
  const hiringFleetHero = moduleFleetHeroStrip(
    [
      { label: "Vacantes abiertas", value: openVacancies.length },
      { label: "Candidatos en proceso", value: activeCandidates.length },
      { label: "Contratos del mes", value: contractsThisMonth.length },
      {
        label: "Alertas y conversión",
        value: `${urgentItems} · ${candidateConversion}%`,
        tone: urgentItems ? "warn" : undefined
      }
    ],
    "hiring"
  );
  const hiringTabsNav = renderHrWorkspaceTabs({
    module: "hiring",
    ariaLabel: "Secciones del módulo Selección y contratación",
    activeId: hiringWorkspace,
    tabs: [
      { id: "overview", label: "Inicio", icon: "compass" },
      { id: "operate", label: "Proceso", icon: "briefcase" },
      { id: "track", label: "Seguimiento del proceso", icon: "activity" }
    ]
  });
  const hiringWorkspaceJumps = `<div class="hr-workspace-jumps">
      <button type="button" class="btn btn-primary hr-workspace-jump-btn" data-action="hr-workspace-tab" data-module="hiring" data-tab="operate">${IC.briefcase} Empezar contratación</button>
      <button type="button" class="btn btn-primary hr-workspace-jump-btn" data-action="hr-workspace-tab" data-module="hiring" data-tab="track">${IC.activity} Ver estado y alertas</button>
    </div>`;
  const hiringOverviewPanel = `<div class="hr-workspace-panel${hiringWorkspace === "overview" ? "" : " hidden"}" role="tabpanel" data-hiring-panel="overview">
      ${hiringHead}
      ${hrModuleOverviewGuide("hiring")}
      <div class="hr-workspace-quicknav">
        <p class="hr-workspace-quicknav-label">Atajos para empezar</p>
        ${hiringWorkspaceJumps}
      </div>
    </div>`;
  const hiringOperatePanel = `<div class="hr-workspace-panel${hiringWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-hiring-panel="operate">
      ${hiringActions}
      ${hiringExecutionBlock}
    </div>`;
  const hiringTrackPanel = `<div class="hr-workspace-panel${hiringWorkspace === "track" ? "" : " hidden"}" role="tabpanel" data-hiring-panel="track">
      ${hiringDataBlock}
    </div>`;
  return `<section class="hiring-shell hiring-shell--workspace hr-flow-shell hr-module-pro hr-module-pro--hiring" data-hr-workspace="${escapeAttr(hiringWorkspace)}">${hiringFleetHero}${hiringTabsNav}
      <div class="hr-workspace-panels">
        ${hiringOverviewPanel}
        ${hiringOperatePanel}
        ${hiringTrackPanel}
      </div>
    </section>`;
}

function laborComplianceHtml() {
  const employees = read(KEYS.payrollEmployees, []);
  const contracts = read(KEYS.contracts, []);
  const records = read(KEYS.sstCompliance, []);
  const todayTs = Date.now();
  const dueSoonDays = 30;
  const expiringContracts = contracts.filter((contract) => {
    if (!contract.endDate) return false;
    const endTs = new Date(`${contract.endDate}T12:00:00`).getTime();
    if (!Number.isFinite(endTs) || endTs < todayTs) return false;
    return (endTs - todayTs) / 86400000 <= dueSoonDays;
  });
  const missingSocialSecurity = employees.filter((employee) => !employee.eps || !employee.pensionFund || !employee.arl);
  const expiringLicenses = employees.filter((employee) => {
    if (!employee.licenseExpiry) return false;
    const expTs = new Date(`${employee.licenseExpiry}T12:00:00`).getTime();
    if (!Number.isFinite(expTs) || expTs < todayTs) return false;
    return (expTs - todayTs) / 86400000 <= dueSoonDays;
  });
  const employeeOptions = employees.map((employee) => `<option value="${employee.id}">${employee.name} · ${employee.position || "-"}</option>`).join("");
  const statusBadgeForCompliance = (status, dueDate) => {
    const s = String(status || "Pendiente").trim().toLowerCase();
    if (s.startsWith("cumpl")) return `<span class="status status-completada">Cumplido</span>`;
    if (s.startsWith("en gest")) return `<span class="status status-en_transito">En gestión</span>`;
    if (dueDate) {
      const ts = new Date(`${dueDate}T12:00:00`).getTime();
      if (Number.isFinite(ts) && ts < Date.now()) return `<span class="status status-vencida">Vencido</span>`;
      if (Number.isFinite(ts) && (ts - Date.now()) / 86400000 <= 30) {
        return `<span class="status status-pendiente">Próximo</span>`;
      }
    }
    return `<span class="status status-pendiente">Pendiente</span>`;
  };
  const sstAdminMutates = isAdminActor();
  const recordRows = records
    .map((record) => {
      const employee = employees.find((item) => String(item.id) === String(record.employeeId || ""));
      const stateKey = String(record.status || "Pendiente").trim().toLowerCase().replace(/\s+/g, "-");
      return `<tr data-sst-state="${escapeAttr(stateKey)}">
        <td><strong>${escapeHtml(String(record.recordType || "-"))}</strong><br><span class="muted">${escapeHtml(String(record.documentCode || "Sin código"))}</span></td>
        <td>${escapeHtml(String(employee?.name || record.employeeName || "-"))}</td>
        <td>${escapeHtml(String(record.provider || "-"))}</td>
        <td>${escapeHtml(String(record.dueDate || "-"))}</td>
        <td>${statusBadgeForCompliance(record.status, record.dueDate)}</td>
        <td>${escapeHtml(String(record.notes || "-"))}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-outline" data-action="view-sst-record" data-id="${escapeAttr(String(record.id))}">${IC.eye} Ver</button>
          ${sstAdminMutates ? `<button class="btn btn-sm btn-action" data-action="edit-sst-record" data-id="${escapeAttr(String(record.id))}">${IC.edit} Editar</button>` : ""}
          ${sstAdminMutates ? `<button class="btn btn-sm btn-reject" data-action="delete-sst-record" data-id="${escapeAttr(String(record.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const alertsBody = renderHrAlertCards([
    {
      icon: IC.calendar,
      label: "Contratos por vencer (30 días)",
      value: expiringContracts.length,
      help: "Anticipa la renovación o el reemplazo del personal.",
      tone: expiringContracts.length ? "warn" : "ok"
    },
    {
      icon: IC.shield,
      label: "Seguridad social incompleta",
      value: missingSocialSecurity.length,
      help: "Empleados sin EPS, pensión o ARL en su ficha.",
      tone: missingSocialSecurity.length ? "alert" : "ok"
    },
    {
      icon: IC.alertTriangle,
      label: "Licencias por vencer (30 días)",
      value: expiringLicenses.length,
      help: "Licencias de conducción próximas a expirar.",
      tone: expiringLicenses.length ? "warn" : "ok"
    },
    {
      icon: IC.file,
      label: "Registros documentales",
      value: records.length,
      help: "Controles SST y de cumplimiento en auditoría.",
      tone: "info"
    }
  ]);
  const complianceForm = `<form id="form-sst-compliance" class="p-form p-form-colored">
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.user} Empleado y tipo</legend>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required><option value="">Seleccione...</option>${employeeOptions}</select></label>
          <label class="full">${fieldLabel(IC.file, "Tipo de control")}
            <select name="recordType" required>
              <option value="">Seleccione...</option>
              <option value="Afiliacion EPS">Afiliacion EPS</option>
              <option value="Afiliacion pension">Afiliacion pension</option>
              <option value="Afiliacion ARL">Afiliacion ARL</option>
              <option value="Examen medico ocupacional">Examen medico ocupacional</option>
              <option value="Capacitacion SST">Capacitacion SST</option>
              <option value="Inspeccion documental">Inspeccion documental</option>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.shield} Seguimiento</legend>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.briefcase, "Entidad / proveedor")}<input name="provider" required placeholder="EPS, fondo, ARL o entidad auditora" /></label>
          <label>${fieldLabel(IC.calendar, "Vencimiento / control")}<input type="date" name="dueDate" required /></label>
          <label>${fieldLabel(IC.activity, "Estado")}
            <select name="status" required>
              <option value="Pendiente">Pendiente</option>
              <option value="En gestion">En gestion</option>
              <option value="Cumplido">Cumplido</option>
            </select>
          </label>
          <label>${fieldLabel(IC.hash, "Codigo documental")}<input name="documentCode" required placeholder="Ej: SST-2026-001" /></label>
        </div>
      </fieldset>
      <label class="full">${fieldLabel(IC.file, "Evidencia / observaciones")}<textarea name="notes" rows="3" required placeholder="Detalle de soporte, auditoría y responsable"></textarea></label>
      <button class="btn btn-primary full" type="submit">${IC.plus} Registrar control legal/SST</button>
    </form>`;
  const recordsTable = recordRows
    ? `<div class="table-wrap"><table><thead><tr><th>Control</th><th>Empleado</th><th>Entidad</th><th>Vencimiento</th><th>Estado</th><th>Notas</th><th style="min-width:11rem">Acciones</th></tr></thead><tbody>${recordRows}</tbody></table></div>`
    : emptyState("No hay controles de cumplimiento registrados.");
  const laborHero = moduleFleetHeroStrip([
    { label: "Controles", value: records.length },
    {
      label: "Contratos por vencer",
      value: expiringContracts.length,
      tone: expiringContracts.length ? "warn" : undefined
    },
    {
      label: "SS incompleta",
      value: missingSocialSecurity.length,
      tone: missingSocialSecurity.length ? "warn" : undefined
    },
    {
      label: "Licencias prox.",
      value: expiringLicenses.length,
      tone: expiringLicenses.length ? "warn" : undefined
    }
  ]);
  return laborHero
    + pcardWrap("activity", "Alertas", null, alertsBody)
    + createCollapsibleCard("create-sst-control", "shield", "Nuevo control SST / legal", null, complianceForm, "Registrar")
    + pcardWrap("file", "Auditoria documental", `${records.length} registros`, recordsTable);
}

function notificationsHtml() {
  const user = currentUser();
  const list = read(KEYS.notifications, [])
    .filter((n) => n.userId === user.id || user.role === ROLES.ADMIN)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unread = list.filter((n) => !n.readAt).length;
  const items = list
    .map((n) => {
      const tag = String(n.title || "").toLowerCase().includes("solicitud")
        ? '<span class="notif-tag notif-tag-blue">Solicitud</span>'
        : String(n.title || "").toLowerCase().includes("autoriza")
          ? '<span class="notif-tag notif-tag-violet">Autorización</span>'
          : '<span class="notif-tag notif-tag-slate">Sistema</span>';
      const dot = n.readAt ? "" : '<span class="notif-dot"></span>';
      const safeId = escapeAttr(n.id);
      return `<article class="notif-card ${n.readAt ? "" : "notif-card-unread"}">
        <div class="notif-leading">${dot}<span class="notif-icon">${IC.bell}</span></div>
        <div class="notif-content">
          <div class="notif-head">${tag}<span class="muted notif-time">${fmtDate(n.createdAt)}</span></div>
          <h4>${n.title || "Notificación"}</h4>
          <p>${n.body || ""}</p>
        </div>
        <div class="notif-actions">
          ${n.readAt ? '<span class="status status-completada">Leída</span>' : `<button type="button" class="btn btn-sm btn-action" data-action="notif-read" data-id="${safeId}">${IC.check} Marcar leída</button>`}
          <button type="button" class="btn btn-sm btn-action btn-danger-soft" data-action="notif-delete" data-id="${safeId}" title="Eliminar notificación" aria-label="Eliminar notificación">${IC.trash} Eliminar</button>
        </div>
      </article>`;
    })
    .join("");
  const readCount = list.length - unread;
  const readPct = list.length ? Math.round((readCount / list.length) * 100) : 100;
  const body = list.length
    ? `<div class="notif-toolbar">
        <button type="button" class="btn btn-sm btn-action" data-action="notif-read-all">${IC.check} Marcar todas como leídas</button>
        ${readCount ? `<button type="button" class="btn btn-sm btn-action" data-action="notif-clear-read">${IC.trash} Eliminar leídas</button>` : ""}
        <button type="button" class="btn btn-sm btn-action btn-danger-soft" data-action="notif-clear-all">${IC.trash} Vaciar bandeja</button>
      </div>
      <div class="notif-list">${items}</div>`
    : emptyState("No tienes notificaciones.");
  const heroStrip = moduleFleetHeroStrip([
    { label: "Total", value: list.length },
    { label: "Sin leer", value: unread, tone: unread ? "warn" : undefined },
    { label: "Leidas", value: readCount },
    { label: "% leidas", value: `${readPct}%` }
  ]);
  return heroStrip + pcardWrap("bell", "Notificaciones", list.length + " mensajes · " + unread + " sin leer", body);
}

function profileSystemJoinDateValue(user) {
  if (!user || typeof user !== "object") return "";
  const candidates = [user.createdAt, user.registeredAt, user.portalSince, user.systemJoinDate];
  for (const raw of candidates) {
    if (!raw) continue;
    const s = String(raw).trim();
    if (!s) continue;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (Number.isFinite(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return "";
}

function profileHtml(user) {
  const companyName = getCompanyById(user.companyId)?.name || user.company || "-";
  const joinedDate = user.createdAt ? fmtDate(user.createdAt) : "No disponible";
  const displayName = getPortalUserDisplayName(user);
  const profileFields = [
    "name",
    "phone",
    "taxId",
    "documentType",
    "birthDate",
    "emergencyContact",
    "emergencyPhone",
    "city",
    "department"
  ];
  const filled = profileFields.filter((f) => String(user[f] ?? "").trim()).length;
  const profilePct = Math.round((filled / profileFields.length) * 100);
  const daysInPortal = user.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
    : 0;
  const profileHero = moduleFleetHeroStrip([
    {
      label: "Perfil completo",
      value: `${profilePct}%`,
      tone: profilePct < 70 ? "warn" : undefined
    },
    { label: "Dias en portal", value: daysInPortal },
    {
      label: "Cuenta",
      value: user.accountStatus === ACCOUNT_STATUS.APROBADO ? "Activa" : "Revision",
      tone: user.accountStatus !== ACCOUNT_STATUS.APROBADO ? "warn" : undefined
    },
    { label: "Permisos", value: (user.permissions || []).length }
  ]);
  const profileAvatarCss = employeeAvatarCssUrl(user.avatarUrl);
  const body = `<section class="profile-shell profile-shell-centered">
    <article class="profile-hero-card profile-hero-card-centered">
      <label for="profile-avatar-input" class="profile-avatar profile-avatar-lg profile-avatar-upload ${profileAvatarCss ? "has-image" : ""}" style="${profileAvatarCss ? `background-image:url('${profileAvatarCss}');` : ""}" title="Cambiar foto de perfil">
        <span class="profile-avatar-initial">${profileAvatarCss ? "" : (displayName || "U").charAt(0).toUpperCase()}</span>
        <span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>Cambiar foto</span></span></span>
      </label>
      <div class="profile-hero-info profile-hero-info-centered">
        <h3>${escapeHtml(displayName)}</h3>
        <p>${user.email || "-"}</p>
        <div class="profile-hero-chips">
          <span>${String(user.role || "perfil").toUpperCase()}</span>
          <span>${String(user.accountStatus || "activo").toUpperCase()}</span>
          <span>${companyName}</span>
        </div>
      </div>
    </article>
    <div class="profile-stats-strip">
      <article class="profile-stat-card"><p>Estado de cuenta</p><strong>${user.accountStatus || "Activo"}</strong></article>
      <article class="profile-stat-card"><p>Privacidad</p><strong>Datos sensibles ocultos</strong></article>
      <article class="profile-stat-card"><p>Rol asignado</p><strong>${user.role || "Usuario"}</strong></article>
    </div>
    <section class="profile-key-data">
      <article class="profile-key-item"><p>Documento / NIT</p><strong>${user.taxId || "Sin registrar"}</strong></article>
      <article class="profile-key-item"><p>Telefono</p><strong>${user.phone || "Sin registrar"}</strong></article>
      <article class="profile-key-item"><p>Empresa</p><strong>${companyName}</strong></article>
      <article class="profile-key-item"><p>Fecha de registro</p><strong>${joinedDate}</strong></article>
    </section>
    <form id="form-profile" class="p-form p-form-colored profile-form profile-form-centered">
      <input type="file" id="profile-avatar-input" name="avatarFile" accept="image/*" class="profile-avatar-file-input" aria-label="Cambiar foto de perfil" />
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.user} Información personal</legend>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" value="${escapeAttr(displayName)}" required /></label>
          <label>${fieldLabel(IC.mail, "Correo corporativo")}<input type="email" value="${user.email || ""}" disabled /></label>
          <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType">
            <option value="CC" ${user.documentType === "CC" ? "selected" : ""}>Cédula de ciudadanía</option>
            <option value="CE" ${user.documentType === "CE" ? "selected" : ""}>Cédula de extranjería</option>
            <option value="NIT" ${user.documentType === "NIT" ? "selected" : ""}>NIT</option>
            <option value="PAS" ${user.documentType === "PAS" ? "selected" : ""}>Pasaporte</option>
          </select></label>
          <label>${fieldLabel(IC.badge, "Documento / NIT")}<input name="taxId" value="${user.taxId || ""}" placeholder="Ej: 900123456-7" /></label>
          <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" value="${user.birthDate || ""}" /></label>
          <label>${fieldLabel(IC.phone, "Teléfono celular")}<input name="phone" value="${user.phone || ""}" placeholder="Ej: 3001234567" /></label>
        </div>
      </fieldset>

      <fieldset class="form-section form-section-cyan full">
        <legend>${IC.heart} Contacto de emergencia</legend>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.user, "Nombre")}<input name="emergencyContact" value="${user.emergencyContact || ""}" placeholder="Nombre completo" /></label>
          <label>${fieldLabel(IC.phone, "Teléfono")}<input name="emergencyPhone" value="${user.emergencyPhone || ""}" placeholder="Ej: 3001234567" /></label>
          <label>${fieldLabel(IC.heart, "Parentesco")}<input name="emergencyRelation" value="${escapeAttr(user.emergencyRelationship || user.emergencyRelation || "")}" placeholder="Cónyuge, padre..." /></label>
        </div>
      </fieldset>

      <fieldset class="form-section form-section-amber full">
        <legend>${IC.calendar} Ingreso al portal</legend>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.calendar, "Fecha de ingreso al sistema")}<input type="date" name="systemJoinDate" value="${escapeAttr(profileSystemJoinDateValue(user))}" disabled aria-readonly="true" /></label>
        </div>
      </fieldset>

      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.briefcase} Empresa asociada</legend>
        <label class="full">
          <input value="${companyName}" disabled />
          <input type="hidden" name="companyId" value="${user.companyId || ""}" />
        </label>
      </fieldset>

      <button class="btn btn-primary full" type="submit">${IC.save} Guardar perfil</button>
    </form>
  </section>`;
  return profileHero + pcardWrap("user", "Mi perfil", null, body, "p-card-profile");
}

function buildAuthorizationsPortalRegistrationsSection(pendingUsers) {
  const list = Array.isArray(pendingUsers) ? pendingUsers : [];
  const n = list.length;
  const countBadge = `<span class="auth-section-count">${n} en bandeja</span>`;
  const body = n
    ? buildPortalRegistrationPendingTableHtml(list)
    : `<div class="auth-inbox-empty">${emptyState(
        "Nadie en cola con estado pendiente. Si acaba de registrarse un cliente, espere unos segundos o salga y vuelva a entrar a Autorizaciones."
      )}</div>`;
  return `<section class="auth-queue-section auth-queue-section--portal" data-auth-section="portal_registrations" aria-label="Registro de clientes en el portal">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">Bandeja de altas (portal web)</h3>
          ${countBadge}
        </div>
        <p class="muted auth-queue-section-desc">Solicitudes nuevas pendientes de aprobación. Revise identidad y asigne empresa antes de activar el acceso.</p>
      </header>
      <div class="auth-queue-section-body">${body}</div>
    </section>`;
}

function authorizationsHtml() {
  const approvals = read(KEYS.approvals, []);
  const pending = approvals.filter((a) => a.status === "pendiente");
  const approvedCt = approvals.filter((a) => a.status === "aprobado").length;
  const rejectedCt = approvals.filter((a) => a.status === "rechazado").length;
  const pendingUsers = read(KEYS.users, []).filter((u) => isPortalUserPendingApproval(u));
  const pendingTransportRequests = sortAuthQueueByDateDesc(
    reqRead().filter((r) => r.status === STATUS.PENDIENTE),
    (r) => r.createdAt
  );
  const totalOpen = pending.length + pendingUsers.length + pendingTransportRequests.length;

  const groups = new Map();
  APPROVAL_UI_BLOCKS.forEach((b) => {
    if (b.kind === "queue") groups.set(b.key, []);
  });
  groups.set("misc", []);

  pending.forEach((a) => {
    const key = APPROVAL_TYPE_META[a.type]?.sectionKey;
    const safeKey = key && groups.has(key) ? key : "misc";
    groups.get(safeKey).push(a);
  });

  ["portal_access", "transport_fleet", "workforce", "hr_absences", "payroll_pay", "misc"].forEach((gk) => {
    const arr = groups.get(gk);
    if (Array.isArray(arr) && arr.length > 1) {
      arr.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    }
  });

  const authHero = moduleFleetHeroStrip([
    { label: "Bandeja total", value: totalOpen, tone: totalOpen ? "warn" : undefined },
    { label: "Nuevas cuentas web", value: pendingUsers.length, tone: pendingUsers.length ? "warn" : undefined },
    { label: "Solicitudes pendientes", value: pendingTransportRequests.length, tone: pendingTransportRequests.length ? "warn" : undefined },
    { label: "Cola interna (aprobaciones)", value: pending.length, tone: pending.length ? "warn" : undefined }
  ]);

  const transportSection = buildAuthorizationsTransportRequestsSection(pendingTransportRequests);
  const portalRegHtml = buildAuthorizationsPortalRegistrationsSection(pendingUsers);

  const miscRows = groups.get("misc") || [];
  const miscSectionHtml =
    miscRows.length > 0
      ? `<section class="auth-queue-section auth-queue-section--misc" data-auth-section="misc">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">Otras solicitudes (tipo no catalogado o histórico)</h3>
          <span class="auth-section-count">${miscRows.length} pendiente(s)</span>
        </div>
        <p class="muted auth-queue-section-desc">Ítems que no coinciden con una categoría definida (por ejemplo datos migrados o tipos reservados). Revise el detalle antes de aprobar.</p>
      </header>
      <div class="auth-queue-section-body">${buildPendingApprovalsTableHtml(miscRows)}</div>
    </section>`
      : "";

  const tabDefs = [
    {
      id: "portal_registrations",
      label: "Nuevas cuentas",
      count: pendingUsers.length,
      html: portalRegHtml
    },
    {
      id: "transport_requests",
      label: "Solicitudes pendientes",
      count: pendingTransportRequests.length,
      html: transportSection
    }
  ];
  APPROVAL_UI_BLOCKS.forEach((section) => {
    if (section.kind !== "queue") return;
    const rows = groups.get(section.key) || [];
    const countBadge = `<span class="auth-section-count">${rows.length} pendiente(s)</span>`;
    const tableOrEmpty = rows.length
      ? buildPendingApprovalsTableHtml(rows)
      : emptyState("No hay autorizaciones pendientes en esta categoría.");
    const html = `<section class="auth-queue-section" data-auth-section="${section.key}" aria-label="${escapeAttr(section.title)}">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">${section.title}</h3>
          ${countBadge}
        </div>
        <p class="muted auth-queue-section-desc">${section.description}</p>
      </header>
      <div class="auth-queue-section-body"><div class="auth-queue-scroll">${tableOrEmpty}</div></div>
    </section>`;
    tabDefs.push({
      id: section.key,
      label: AUTH_QUEUE_SHORT_TAB_LABELS[section.key] || section.title,
      count: rows.length,
      html
    });
  });
  if (miscRows.length) {
    tabDefs.push({ id: "misc", label: "Otras colas", count: miscRows.length, html: miscSectionHtml });
  }

  const tabBar = `<div class="auth-tabs-bar" data-auth-tabs-bar role="tablist">${tabDefs
    .map(
      (t, i) =>
        `<button type="button" role="tab" class="auth-tab-btn ${i === 0 ? "is-active" : ""}" data-auth-tab="${escapeAttr(
          t.id
        )}" aria-selected="${i === 0 ? "true" : "false"}">${escapeHtml(t.label)} <span class="auth-tab-badge">${t.count}</span></button>`
    )
    .join("")}</div>`;
  const tabPanels = `<div class="auth-tab-panels">${tabDefs
    .map(
      (t, i) =>
        `<div class="auth-tab-panel ${i === 0 ? "is-active" : ""}" data-auth-panel="${escapeAttr(t.id)}" role="tabpanel" ${i === 0 ? "" : "hidden"}>${t.html}</div>`
    )
    .join("")}</div>`;
  const tabsWrap = `<div class="auth-tabs-layout">${tabBar}${tabPanels}</div>`;

  const infoSectionsHtml = APPROVAL_UI_BLOCKS.filter((s) => s.kind === "info")
    .map(
      (section) =>
        `<section class="auth-queue-section auth-queue-section--info" data-auth-section="${section.key}">
      <header class="auth-queue-section-head">
        <h3 class="auth-queue-section-title">${section.title}</h3>
        <p class="muted auth-queue-section-desc">${section.description}</p>
      </header>
    </section>`
    )
    .join("");

  portalEnsureApiTokensAligned();

  const syncBanner = state.authorizationsSyncError
    ? `<div class="auth-sync-banner ${state.authorizationsSyncError.code === "PARCIAL" ? "auth-sync-banner--warn" : "auth-sync-banner--err"}" role="status">
        <strong>${escapeHtml(String(state.authorizationsSyncError.code || "Aviso"))}</strong>
        <span>${escapeHtml(String(state.authorizationsSyncError.message || ""))}</span>
      </div>`
    : "";
  const bodyInner = `${syncBanner}${tabsWrap}${
    infoSectionsHtml ? `<div class="auth-info-blocks">${infoSectionsHtml}</div>` : ""
  }`;
  return (
    authHero +
    pcardWrap(
      "shield",
      "Centro de aprobaciones",
      `${totalOpen} ítem(s) abierto(s) · Histórico cola local: ${approvedCt} aprob. / ${rejectedCt} rech.`,
      bodyInner
    )
  );
}

function contactLeadsHtml() {
  const user = currentUser();
  if (!hasPermission(user, PERMISSIONS.CONTACT_B2B_VIEW)) {
    return emptyState("No tiene permiso para ver las solicitudes de contacto del sitio web.");
  }

  const loading = Boolean(state.contactLeadsLoading);
  const list = (Array.isArray(state.portalContacts) ? state.portalContacts : []).slice().sort((a, b) => {
    const ta = new Date(b.createdAt || 0).getTime();
    const tb = new Date(a.createdAt || 0).getTime();
    return ta - tb;
  });

  portalEnsureApiTokensAligned();
  const apiLive = portalCanRefreshFromApi();

  const hero = moduleFleetHeroStrip([
    { label: "Prospectos", value: loading ? "…" : String(list.length) },
    { label: "Pipeline", value: loading ? "…" : "Web → Equipo" },
    { label: "Estado", value: apiLive ? "Activo" : "Sin conexión" }
  ]);

  if (loading) {
    const shell = `<div class="b2b-leads-loading" role="status" aria-live="polite" aria-busy="true">
      <div class="b2b-leads-spinner" aria-hidden="true"></div>
      <div class="b2b-leads-loading-text">
        <strong>Cargando solicitudes</strong>
        <span class="muted">Un momento, estamos trayendo la bandeja de prospectos.</span>
      </div>
    </div>`;
    return hero + pcardWrap("mail", "Solicitudes de contacto web (B2B)", "Sincronizando datos…", shell);
  }

  if (!list.length) {
    const hint = apiLive
      ? "Todavía no hay solicitudes recibidas. Cuando un prospecto envíe el formulario aparecerá aquí."
      : "Sin conexión activa. Reintente en unos segundos o vuelva a iniciar sesión.";
    return hero + pcardWrap("mail", "Solicitudes de contacto web (B2B)", "0 prospectos visibles", emptyState(hint));
  }

  const cards = list
    .map((c, ix) => {
      const hueClass = ["b2b-accent-a", "b2b-accent-b", "b2b-accent-c"][ix % 3];
      const rawName = String(c.contactName || "").trim();
      const name = escapeHtml(rawName || "Contacto sin nombre");
      const av = escapeHtml((rawName || "?").slice(0, 1).toUpperCase());
      const company = escapeHtml(String(c.companyName || "").trim());
      const emailRaw = String(c.email || "").trim();
      const phoneRaw = String(c.phone || "").trim();
      const email = escapeHtml(emailRaw);
      const phone = escapeHtml(phoneRaw);
      const svc = escapeHtml(String(c.serviceType || "").trim()) || "—";
      const op = escapeHtml(String(c.operationType || "").trim()) || "—";
      const role = escapeHtml(String(c.role || "").trim()) || "—";
      const nit = escapeHtml(String(c.nit || "").trim()) || "—";
      const freq = escapeHtml(String(c.frequency || "").trim()) || "—";
      const win = escapeHtml(String(c.serviceWindow || "").trim()) || "—";
      const volNum = parseNum(c.monthlyVolumeKg);
      const vol =
        typeof c.monthlyVolumeKg !== "undefined" && c.monthlyVolumeKg !== null && String(c.monthlyVolumeKg).trim() !== ""
          ? `${volNum.toLocaleString("es-CO")} kg / mes`
          : "—";
      const brief = escapeHtml(String(c.message || "").trim() || "(Sin mensaje corporativo)");
      const briefHtml = brief.replace(/\r\n|\r|\n/g, "<br />");
      const mailHref = escapeAttr(emailRaw);
      const telHref = escapeAttr(phoneRaw.replace(/\s+/g, ""));

      return `<article class="b2b-leads-card ${hueClass}">
        <header class="b2b-leads-card-top">
          <div class="b2b-leads-card-identity">
            <span class="b2b-leads-avatar">${av}</span>
            <div>
              <h3 class="b2b-leads-title">${name}</h3>
              ${company ? `<p class="b2b-leads-company muted">${company}</p>` : ""}
              <div class="b2b-leads-chip-row">
                <span class="b2b-chip b2b-chip-strong">${svc}</span>
                <span class="b2b-chip">${op}</span>
              </div>
            </div>
          </div>
          <time class="b2b-leads-when">${fmtDate(c.createdAt)}</time>
        </header>
        <dl class="b2b-leads-meta">
          <div><dt>Correo</dt><dd>${emailRaw ? `<a href="mailto:${mailHref}" class="b2b-leads-link">${email}</a>` : "—"}</dd></div>
          <div><dt>Teléfono</dt><dd>${phoneRaw ? `<a href="tel:${telHref}" class="b2b-leads-link">${phone}</a>` : "—"}</dd></div>
          <div><dt>Cargo contacto</dt><dd>${role}</dd></div>
          <div><dt>NIT</dt><dd>${nit}</dd></div>
          <div><dt>Frecuencia</dt><dd>${freq}</dd></div>
          <div><dt>Inicio esperado</dt><dd>${win}</dd></div>
          <div><dt>Volumen ref.</dt><dd>${escapeHtml(vol)}</dd></div>
        </dl>
        <section class="b2b-leads-brief" aria-label="Mensaje del prospecto"><h4 class="b2b-leads-brief-title">Brief de la solicitud</h4><div class="b2b-leads-brief-body">${briefHtml}</div></section>
      </article>`;
    })
    .join("");

  const mosaic = `<div class="b2b-leads-mosaic">${cards}</div>`;
  const subtitle = `${list.length} prospecto${list.length === 1 ? "" : "s"} · vista enriquecida`;
  return hero + pcardWrap("mail", "Solicitudes de contacto web (B2B)", subtitle, mosaic);
}

function renderFromModule(moduleName, exportName, ...args) {
  const moduleFn = window.AppModules?.[moduleName]?.[exportName];
  if (typeof moduleFn === "function") return moduleFn(...args);
  const legacyFn = window.AppLegacyViews?.[exportName];
  if (typeof legacyFn === "function") return legacyFn(...args);
  return "";
}

const PortalArch = window.PortalArchitecture || {
  isKnownView: (view) => Boolean(VIEW_PERMISSIONS[String(view || "")]),
  shouldUseShell: () => true,
  getTitle: (view) => String(view || "Dashboard"),
  getLayoutPlan: () => null,
  isAllowedByRole: () => true,
  resolveContent: ({ accessDeniedFactory }) => accessDeniedFactory()
};

const PortalAccessCore = window.PortalCoreAccess || {
  isViewAllowed: ({ user, view, canAccessView, portalArch, ROLES, canAccessRRHH }) =>
    Boolean(user) && canAccessView(user, view) && portalArch.isAllowedByRole(user, view, { ROLES, canAccessRRHH })
};

const PortalRouterCore = window.PortalCoreRouter || {
  getViewFromHash: ({ hash, isKnownView }) => {
    const raw = String(hash || "");
    if (!raw.startsWith("#portal/")) return "";
    const view = raw.slice("#portal/".length).trim();
    return isKnownView(view) ? view : "";
  },
  syncHash: ({ view, isKnownView, fallbackView = "dashboard" }) => {
    const safeView = isKnownView(view) ? view : fallbackView;
    const nextHash = `#portal/${safeView}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  },
  enforceViewFromUrl: ({ state, user, getViewFromHashFn, syncHashFn, isViewAllowed, fallbackView = "dashboard", onUnauthorized }) => {
    if (!state?.session || !user) return;
    const candidate = getViewFromHashFn();
    if (!candidate) {
      syncHashFn(state.currentView || fallbackView);
      return;
    }
    if (!isViewAllowed(user, candidate)) {
      state.currentView = fallbackView;
      syncHashFn(fallbackView);
      if (typeof onUnauthorized === "function") onUnauthorized(candidate);
      return;
    }
    state.currentView = candidate;
  },
  activateSideLinks: (sideLinks, view) =>
    (sideLinks || []).forEach((link) => link.classList.toggle("active", link.dataset.view === view))
};

const PortalRendererCore = window.PortalCoreRenderer || {
  resolveViewContent: ({ user, view, isViewAllowed, resolveContent, accessDeniedFactory }) =>
    !isViewAllowed(user, view) ? accessDeniedFactory() : resolveContent(user, view),
  safeResolve: ({ view, resolver, onError, fallbackFactory }) => {
    try {
      return resolver();
    } catch (error) {
      if (typeof onError === "function") onError({ view, error });
      return fallbackFactory();
    }
  },
  applyManualLayout: ({ viewRoot, plan }) => {
    if (!viewRoot || !plan) return;
    plan.forEach(({ container, order }) => {
      const nodesToOrder = [...viewRoot.querySelectorAll(container)];
      nodesToOrder.forEach((containerNode) => {
        const children = [...containerNode.children];
        if (children.length < 2 || !Array.isArray(order) || !order.length) return;
        const ordered = [];
        const used = new Set();
        order.forEach((selector) => {
          children.forEach((child) => {
            if (used.has(child) || !child.matches(selector)) return;
            ordered.push(child);
            used.add(child);
          });
        });
        children.forEach((child) => {
          if (used.has(child)) return;
          ordered.push(child);
        });
        const changed = ordered.some((child, idx) => child !== children[idx]);
        if (changed) ordered.forEach((child) => containerNode.appendChild(child));
      });
    });
  }
};

function renderModuleShell(view, _title, bodyHtml) {
  if (!PortalArch.shouldUseShell(view)) return bodyHtml;
  return `<section class="module-shell" data-module-view="${view}">
    <div class="module-shell-body">${bodyHtml}</div>
  </section>`;
}

function accessDeniedModuleCard() {
  return pcardWrap("shield", "Acceso restringido", null, emptyState("No tienes autorizacion para esta vista."));
}

function getPortalViewContent(user, view) {
  return PortalArch.resolveContent({
    user,
    view,
    renderFromModule,
    accessDeniedFactory: accessDeniedModuleCard
  });
}

function applyManualModuleLayout() {
  if (!nodes.viewRoot || state.currentView === "profile") return;
  const view = String(state.currentView || "");
  const plan = PortalArch.getLayoutPlan(view);
  if (!plan) return;
  PortalRendererCore.applyManualLayout({ viewRoot: nodes.viewRoot, plan });
}

function enforceColombianFormStandards() {
  const setAttr = (selector, attrs = {}) => {
    const node = document.querySelector(selector);
    if (!node) return;
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      node.setAttribute(key, String(value));
    });
  };
  const ensureSelectOptions = (selector, values = [], placeholder = "Seleccione...") => {
    const select = document.querySelector(selector);
    if (!select || select.tagName !== "SELECT") return;
    const currentValue = String(select.value || "");
    select.innerHTML = selectOptionsFromCatalog(values, currentValue, placeholder);
    if (currentValue && values.includes(currentValue)) {
      select.value = currentValue;
    }
  };

  setAttr("#form-vehicle input[name='plate']", { pattern: "[A-Z]{3}[0-9]{3}", maxlength: "6", placeholder: "ABC123" });
  setAttr("#form-vehicle input[name='year']", { min: "1990", max: String(new Date().getFullYear() + 1) });
  ensureSelectOptions("#form-driver select[name='licenseCategory']", CO_CATALOGS.licenseCategories, "Seleccione categoria...");

  setAttr("#form-admin-company-create input[name='taxId']", {
    pattern: "[0-9\\-]{6,32}",
    minlength: "6",
    maxlength: "32",
    placeholder: "900123456-7"
  });
  setAttr("#form-admin-company-create input[name='phone']", { maxlength: "32", inputmode: "tel", autocomplete: "tel", placeholder: "+57 601 234 5678" });

  setAttr("#form-admin-company-edit input[name='taxId']", {
    pattern: "[0-9\\-]{6,32}",
    minlength: "6",
    maxlength: "32",
    placeholder: "900123456-7"
  });
  setAttr("#form-admin-company-edit input[name='phone']", {
    maxlength: "32",
    inputmode: "tel",
    autocomplete: "tel",
    placeholder: "+57 300 000 0000"
  });
  setAttr("#form-admin-user-create input[name='phone']", { maxlength: "32", inputmode: "tel", autocomplete: "tel", placeholder: "+57 300 000 0000" });
  setAttr("#form-admin-user-edit input[name='phone']", { maxlength: "32", inputmode: "tel", autocomplete: "tel", placeholder: "+57 300 000 0000" });

  setAttr("#form-employee input[name='idDoc']", { pattern: "[0-9]{6,12}", minlength: "6", maxlength: "12" });
  setAttr("#form-employee input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-employee input[name='emergencyPhone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-employee input[name='bankAccount']", { minlength: "8", maxlength: "24", placeholder: "Cuenta bancaria del trabajador" });
  ensureSelectOptions("#form-employee select[name='bloodType']", CO_CATALOGS.bloodTypes, "Seleccione tipo de sangre...");
  ensureSelectOptions("#form-employee select[name='licenseCategory']", CO_CATALOGS.licenseCategories, "Seleccione categoria...");
  ensureSelectOptions("#form-employee select[name='eps']", CO_CATALOGS.eps, "Seleccione EPS...");
  ensureSelectOptions("#form-employee select[name='pensionFund']", CO_CATALOGS.pensionFunds, "Seleccione fondo...");
  ensureSelectOptions("#form-employee select[name='arl']", CO_CATALOGS.arl, "Seleccione ARL...");

  setAttr("#form-position input[name='baseSalary']", { min: String(CO_HR_RULES.minMonthlySalary) });

  setAttr("#form-vacancy input[name='openings']", { min: "1" });
  setAttr("#form-vacancy input[name='deadline']", { min: nowIso().slice(0, 10) });

  setAttr("#form-candidate input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-candidate input[name='idDoc']", { pattern: "[0-9]{6,12}", minlength: "6", maxlength: "12" });

  setAttr("#form-interview input[name='when']", { min: colombiaDatetimeLocalString() });

  setAttr("#form-hr-absence input[name='supportNumber']", { minlength: "4", maxlength: "40", placeholder: "Radicado incapacidad/vacaciones" });
  ensureSelectOptions("#form-hr-absence select[name='epsEntity']", [...CO_CATALOGS.eps, "Otra"], "Seleccione EPS/entidad...");

  setAttr("#form-sst-compliance input[name='documentCode']", { minlength: "4", maxlength: "32" });

  const requestPrice = document.querySelector("#form-request input[name='tripValue']");
  if (requestPrice) {
    requestPrice.value = "0";
    requestPrice.setAttribute("readonly", "true");
    requestPrice.setAttribute("aria-readonly", "true");
  }
}

let __schedulePortalViewMicrotask = null;
let __schedulePortalViewWanted = false;

function scheduleRenderPortalView() {
  __schedulePortalViewWanted = true;
  if (__schedulePortalViewMicrotask != null) return;
  __schedulePortalViewMicrotask = queueMicrotask(() => {
    __schedulePortalViewMicrotask = null;
    if (!__schedulePortalViewWanted) return;
    __schedulePortalViewWanted = false;
    renderPortalViewImpl();
  });
}

function renderPortalViewImpl() {
  /**
   * Las rutinas de fondo (auto-aprobación / cierres) corren dentro de un
   * envoltorio que silencia el toast del poll para las notificaciones
   * nuevas que generen aquí: la campana sigue sumando y la lista de
   * notificaciones las muestra, pero al usuario no se le interrumpe con
   * múltiples toasts cada vez que navega entre módulos.
   */
  runAsSilentSystemNotifications(() => {
    updateAutoApprove();
    closeCompletedTripsAndGenerateInvoices();
    recalculateResourceAvailability();
  });
  renderKpis();

  const user = currentUser();
  const view = state.currentView;
  const prevPortalView = state.__portalPrevViewForSync;
  state.__portalPrevViewForSync = view;

  if (view === "authorizations") {
    const canAuthSync = portalCanRefreshFromApi();
    if (prevPortalView !== "authorizations" && canAuthSync) {
      /** Sin pantalla bloqueante: se pintan primero datos en caché; el servidor actualiza en segundo plano. */
      state.authorizationsSyncError = null;
      void (async () => {
        let bootstrapOk = false;
        try {
          bootstrapOk = await applyPortalBootstrapFromApi();
        } catch (_e) {
          bootstrapOk = false;
        }
        let pendingOk = false;
        if (currentUser()?.role === ROLES.ADMIN) {
          try {
            pendingOk = await applyPendingUserRegistrationsFromApi();
          } catch (_e2) {
            pendingOk = false;
          }
        }
        if (bootstrapOk) {
          state.authorizationsSyncError = null;
        } else if (currentUser()?.role === ROLES.ADMIN && pendingOk) {
          state.authorizationsSyncError = {
            code: "PARCIAL",
            message:
              "El volcado general de datos no se completó; la lista de usuarios pendientes de alta sí se actualizó desde el servidor."
          };
        } else {
          state.authorizationsSyncError = {
            code: "SYNC-API",
            message:
              "No se pudo sincronizar con el servidor. Revise conexión, sesión JWT (cierre sesión y vuelva a entrar) o que su usuario sea administrador con acceso a la API."
          };
        }
        scheduleRenderPortalView();
      })();
    }
  }

  if (view === "contact-leads" && hasPermission(user, PERMISSIONS.CONTACT_B2B_VIEW)) {
    const canSync = portalCanRefreshFromApi();
    if (prevPortalView !== "contact-leads" && canSync) {
      state.contactLeadsLoading = true;
      void refreshContactB2bProspectsFromApi()
        .catch(() => {})
        .finally(() => {
          state.contactLeadsLoading = false;
          scheduleRenderPortalView();
        });
    } else if (prevPortalView !== "contact-leads") {
      state.contactLeadsLoading = false;
    }
  }
  const viewTitle = PortalArch.getTitle(view);
  nodes.viewTitle.textContent = viewTitle;
  const content = PortalRendererCore.safeResolve({
    view,
    resolver: () =>
      PortalRendererCore.resolveViewContent({
        user,
        view,
        isViewAllowed: isViewAllowedForUser,
        resolveContent: getPortalViewContent,
        accessDeniedFactory: accessDeniedModuleCard
      }),
    onError: ({ view: failedView, error }) => {
      devError("portal-render-error", failedView, error && error.message ? String(error.message) : "");
    },
    fallbackFactory: () =>
      pcardWrap(
        "activity",
        "Error de renderizado",
        "Se detectó un problema en el módulo",
        `<p class="muted">Recarga la vista o cambia de módulo para continuar. Si persiste, revisa consola y registra el incidente.</p>`
      )
  });
  nodes.viewRoot.innerHTML = renderModuleShell(view, viewTitle, content);

  applyManualModuleLayout();
  mountUniversalModuleFilters();
  bindDynamicEvents();
  /** Debe ir tras cada render: innerHTML descarta los listeners de Ver/Editar en tablas (candidatos, vehículos, etc.). */
  bindExtendedViewEditHandlers();
  enforceColombianFormStandards();
  applyModuleMicroAnimations();
}

function renderPortalView() {
  renderPortalViewImpl();
}

function describeContractDurationForDocx(data) {
  const ct = String(data.contractType || "");
  const start = String(data.startDate || "").trim();
  const end = String(data.endDate || "").trim();
  if (ct === "Termino fijo" && start && end) return `Término fijo: ${start} a ${end}`;
  if (ct === "Termino fijo") return "Término fijo (plazo contractual en cláusulas)";
  if (ct === "Prestacion de servicios") return "Prestación de servicios";
  return start ? `Vigencia desde ${start} · ${ct || "según anexo"}` : String(ct || "Según cláusulas y normativa aplicable");
}

/** Alta empleado (wizard): objeto listo para guardar Word o persistir (sin id). */
/**
 * Resuelve el avatar de un empleado: si Cloudflare R2 está disponible vía el
 * backend (`POST /uploads/avatar/presign`) sube el archivo directo a R2 y
 * devuelve la URL pública del bucket. Si no hay backend o el endpoint falla,
 * regresa al método anterior basado en `FileReader` → `data:` URL.
 *
 * Devuelve la URL final (`https://...` o `data:image/...`) o cadena vacía si
 * no hay archivo.
 */
async function resolveEmployeeAvatarUrl(file, fallbackDataUrl = "") {
  if (!file) return String(fallbackDataUrl || "").trim();
  const api = window.AntaresApi;
  const canUseBackend =
    api && typeof api.postJson === "function" && typeof api.getBase === "function" && api.getBase();
  if (canUseBackend) {
    try {
      const presign = await api.postJson("/uploads/avatar/presign", {
        fileName: String(file.name || "avatar.jpg"),
        contentType: String(file.type || "image/jpeg")
      });
      const uploadUrl = String(presign?.uploadUrl || "").trim();
      const publicUrl = String(presign?.publicUrl || "").trim();
      if (uploadUrl) {
        const resp = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": String(file.type || "image/jpeg") },
          body: file
        });
        if (!resp.ok) throw new Error(`R2 PUT respondió ${resp.status}`);
        if (publicUrl) return publicUrl;
      }
    } catch (err) {
      devWarn?.("avatar-upload-r2-failed", err);
    }
  }
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onerror = () => resolve(String(fallbackDataUrl || "").trim());
    r.onload = () => resolve(String(r.result || "").trim());
    r.readAsDataURL(file);
  });
}

function buildPayrollEmployeePayloadFromWizard(raw, docNormalized, avatarOpts = {}) {
  const stripLargeAvatar = Boolean(avatarOpts.stripLargeAvatar);
  let merged = String(avatarOpts.avatarUrl ?? raw.avatarUrl ?? "").trim();
  if (stripLargeAvatar && merged.startsWith("data:")) merged = "";
  const avatarUrl = merged;
  const position = getPositionById(String(raw.positionId || ""));
  if (!position || position.active === false) {
    return { ok: false, msg: userMessage("recruitSelectActivePosition") };
  }
  const baseSalary = parseNum(raw.baseSalary);
  if (baseSalary < CO_HR_RULES.minMonthlySalary) {
    return {
      ok: false,
      msg: userMessage("recruitSalaryMinRef", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO"))
    };
  }
  return {
    ok: true,
    payload: {
      name: String(raw.name || "").trim(),
      documentType: raw.documentType,
      idDoc: docNormalized,
      birthDate: String(raw.birthDate || "").trim(),
      gender: String(raw.gender || "").trim(),
      maritalStatus: String(raw.maritalStatus || "").trim(),
      educationLevel: String(raw.educationLevel || "").trim(),
      personalEmail: String(raw.personalEmail || "").trim(),
      emergencyRelation: String(raw.emergencyRelation || "").trim(),
      hasIllness: String(raw.hasIllness || "no").toLowerCase() === "si" ? "si" : "no",
      illnessDescription:
        String(raw.hasIllness || "no").toLowerCase() === "si"
          ? String(raw.illnessDescription || "").trim()
          : "",
      positionId: position.id,
      position: position.name,
      workerRole: position.workerRole || "empleado",
      contractType: raw.contractType || position.contractTypeDefault || "Termino indefinido",
      city: String(raw.city || "").trim(),
      department: String(raw.department || "").trim(),
      address: String(raw.address || "").trim(),
      phone: String(raw.phone || "").trim(),
      emergencyContact: String(raw.emergencyContact || "").trim(),
      emergencyPhone: String(raw.emergencyPhone || "").trim(),
      bloodType: String(raw.bloodType || "").trim(),
      companyId: raw.companyId,
      eps: String(raw.eps || "").trim(),
      pensionFund: String(raw.pensionFund || "").trim(),
      arl: String(raw.arl || "").trim(),
      severanceFund: String(raw.severanceFund || "").trim(),
      compensationFund: String(raw.compensationFund || "").trim(),
      arlRiskLevel: String(raw.arlRiskLevel || "").trim(),
      contributorType: String(raw.contributorType || "").trim(),
      costCenter: String(raw.costCenter || "").trim(),
      payFrequency: String(raw.payFrequency || "Mensual").trim(),
      baseSalary,
      transportAllowance: parseNum(raw.transportAllowance) || CO_HR_RULES.transportAllowance,
      contractTemplateKind: String(raw.contractTemplateKind || "").trim(),
      contractDuration: String(raw.contractDuration || "").trim(),
      bankName: String(raw.bankName || "").trim(),
      bankAccount: String(raw.bankAccount || "").trim(),
      bankAccountType: String(raw.bankAccountType || "Ahorros").trim(),
      startDate: raw.startDate,
      license: String(raw.license || "").trim(),
      licenseCategory: String(raw.licenseCategory || "").trim(),
      licenseExpiry: String(raw.licenseExpiry || "").trim(),
      psychoTestDate: String(raw.psychoTestDate || "").trim(),
      psychoTestExpiry: String(raw.psychoTestExpiry || "").trim(),
      defensiveCourse: String(raw.defensiveCourse || "").trim(),
      avatarUrl
    }
  };
}

function validateEmployeeContractDocFields(emp) {
  const miss = [];
  if (!String(emp.name || "").trim()) miss.push("nombre completo");
  if (!String(emp.idDoc || "").trim()) miss.push("numero de documento");
  if (!String(emp.city || "").trim()) miss.push("ciudad de residencia");
  if (!String(emp.bankName || "").trim()) miss.push("banco");
  if (!String(emp.bankAccount || "").trim()) miss.push("numero de cuenta");
  if (parseNum(emp.baseSalary) < CO_HR_RULES.minMonthlySalary) miss.push("salario base (minimo legal)");
  if (!String(emp.contractDuration || "").trim()) miss.push("duracion del contrato");
  if (!String(emp.contractType || "").trim()) miss.push("tipo de contrato");
  const pos = getPositionById(String(emp.positionId || ""));
  if (!String(emp.position || "").trim() && !pos?.name) miss.push("cargo");
  return miss;
}

function employeeAvatarCssUrl(av) {
  const u = String(av || "").trim();
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u.replace(/'/g, "\\'");
  return "";
}

function fmtProfileCell(value) {
  const s = value == null || String(value).trim() === "" ? "—" : String(value);
  return escapeHtml(s);
}

function employeeProfileKvRow(label, value) {
  return `<div class="employee-profile-kv"><span>${escapeHtml(label)}</span><strong>${fmtProfileCell(value)}</strong></div>`;
}

function buildEmployeePayrollProfileBodyHtml(emp) {
  if (!emp) return `<p class="muted">Sin datos.</p>`;
  const css = employeeAvatarCssUrl(emp.avatarUrl);
  const initial = escapeHtml(String(emp.name || "E").charAt(0).toUpperCase());
  const heroBanner = css
    ? `<div class="employee-profile-hero-photo" style="background-image:url('${css}')" role="img" aria-label="Foto del colaborador"></div>`
    : `<div class="employee-profile-hero-photo employee-profile-hero-photo--letter" aria-hidden="true"><span>${initial}</span></div>`;
  const heroAvatar = css
    ? `<div class="employee-profile-hero-avatar" role="img" aria-label="Foto del colaborador"><img src="${escapeAttr(emp.avatarUrl)}" alt="Foto de ${escapeAttr(String(emp.name || "Empleado"))}" loading="lazy" /></div>`
    : `<div class="employee-profile-hero-avatar employee-profile-hero-avatar--letter" aria-hidden="true"><span>${initial}</span></div>`;
  const hero = `${heroBanner}<div class="employee-profile-hero-photo-wrap">${heroAvatar}<p class="employee-profile-hero-photo-caption muted">${css ? "Foto del colaborador" : "Sin foto cargada — recomendamos subirla al editar el empleado."}</p></div>`;
  const docs = `${String(emp.documentType || "").trim()} ${String(emp.idDoc || "").trim()}`.trim();
  const companyName = getCompanyById(emp.companyId)?.name || "—";
  const isDriver = String(emp.workerRole || "").toLowerCase() === "conductor";
  const driverBlock = isDriver
    ? `
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Conductor</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("N° licencia", emp.license)}
      ${employeeProfileKvRow("Categoría licencia", emp.licenseCategory)}
      ${employeeProfileKvRow("Vence licencia", emp.licenseExpiry)}
      ${employeeProfileKvRow("Psicosensometría (examen)", emp.psychoTestDate)}
      ${employeeProfileKvRow("Vence psicosensometría", emp.psychoTestExpiry)}
      ${employeeProfileKvRow("Curso conducción defensiva", emp.defensiveCourse)}
    </div></section>`
    : "";
  return `
  <article class="employee-profile-card">${hero}<div class="employee-profile-intro">
      <h3 class="employee-profile-name">${escapeHtml(String(emp.name || "").trim())}</h3>
      <p class="employee-profile-intro-meta muted">${escapeHtml(String(emp.position || "").trim())} · ${escapeHtml(String(emp.contractType || "").trim())}${isDriver ? ` · ${escapeHtml("Conductor")}` : ""}</p>
      <span class="employee-profile-chip">${fmtProfileCell(`${parseNum(emp.baseSalary).toLocaleString("es-CO")} COP · salario base`)}</span>
    </div>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Identidad</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Documento", docs)}
      ${employeeProfileKvRow("Fecha de nacimiento", emp.birthDate)}
      ${employeeProfileKvRow("Género", emp.gender)}
      ${employeeProfileKvRow("Estado civil", emp.maritalStatus)}
      ${employeeProfileKvRow("Nivel educativo", emp.educationLevel)}
      ${employeeProfileKvRow("Tipo sangre RH", emp.bloodType)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Contacto</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Departamento", emp.department)}
      ${employeeProfileKvRow("Ciudad", emp.city)}
      ${employeeProfileKvRow("Dirección", emp.address)}
      ${employeeProfileKvRow("Teléfono celular", emp.phone)}
      ${employeeProfileKvRow("Correo personal", emp.personalEmail)}
      ${employeeProfileKvRow("Contacto emergencia", emp.emergencyContact)}
      ${employeeProfileKvRow("Tel. emergencia", emp.emergencyPhone)}
      ${employeeProfileKvRow("Parentesco emergencia", emp.emergencyRelation)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Salud</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow(
        "¿Condición médica?",
        String(emp.hasIllness || "").toLowerCase() === "si" ? "Sí" : "No"
      )}
      ${
        String(emp.hasIllness || "").toLowerCase() === "si"
          ? employeeProfileKvRow("Detalle médico", emp.illnessDescription || "Sin detalle")
          : ""
      }
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Laboral</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Empresa", companyName)}
      ${employeeProfileKvRow("Fecha ingreso", emp.startDate)}
      ${employeeProfileKvRow("Duración contrato", emp.contractDuration)}
      ${employeeProfileKvRow("Centro costos", emp.costCenter)}
      ${employeeProfileKvRow("Periodicidad", emp.payFrequency)}
      ${employeeProfileKvRow("Aux. transporte (COP)", emp.transportAllowance != null ? parseNum(emp.transportAllowance).toLocaleString("es-CO") : "")}
      ${employeeProfileKvRow("Tipo cotizante", emp.contributorType)}
      ${employeeProfileKvRow("ARL nivel riesgo", emp.arlRiskLevel)}
      ${employeeProfileKvRow("Plantilla contrato Word", emp.contractTemplateKind)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Seguridad social</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("EPS", emp.eps)}
      ${employeeProfileKvRow("Fondo pensión", emp.pensionFund)}
      ${employeeProfileKvRow("ARL", emp.arl)}
      ${employeeProfileKvRow("Cesantías", emp.severanceFund)}
      ${employeeProfileKvRow("Caja compensación", emp.compensationFund)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Pagos</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Banco", emp.bankName)}
      ${employeeProfileKvRow("Tipo cuenta", emp.bankAccountType)}
      ${employeeProfileKvRow("N° cuenta", emp.bankAccount)}
    </div></section>
    ${driverBlock}</article>`;
}

function buildPayrollEmployeeEditModalFields(emp) {
  const e = emp || {};
  const empId = escapeAttr(String(e.id || ""));
  const deps = `<option value="">${escapeHtml("Seleccione...")}</option>${departmentOptions(e.department || "")}`;
  const docSel = CO_CATALOGS.documentTypes.map((d) => {
    const lab =
      d === "CC"
        ? "Cédula de ciudadanía"
        : d === "CE"
          ? "Cédula de extranjería"
          : d === "PAS"
            ? "Pasaporte"
            : d === "PEP"
              ? "Permiso especial (PEP)"
              : "Tarjeta de identidad";
    return `<option value="${escapeAttr(d)}" ${String(e.documentType || "") === d ? "selected" : ""}>${escapeHtml(lab)}</option>`;
  }).join("");
  const genderSel = CO_CATALOGS.genders.map(
    (g) => `<option value="${escapeAttr(g)}" ${String(e.gender || "") === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const maritalSel = CO_CATALOGS.maritalStatus.map(
    (g) =>
      `<option value="${escapeAttr(g)}" ${String(e.maritalStatus || "").trim() === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const eduSel = CO_CATALOGS.educationLevel.map(
    (g) =>
      `<option value="${escapeAttr(g)}" ${String(e.educationLevel || "").trim() === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const contractSel = CO_CATALOGS.contractTypes.map(
    (c) =>
      `<option value="${escapeAttr(c)}" ${String(e.contractType || "").trim() === c ? "selected" : ""}>${escapeHtml(c)}</option>`
  ).join("");
  const tmplSel = [`oficina`, `fijo`, `prestacion`]
    .map((k) => {
      const lab =
        k === "oficina" ? "Contrato trabajo personal oficina" : k === "fijo" ? "Contrato personal término fijo" : "Contrato prestación servicios conductores";
      const cur = String(e.contractTemplateKind || "").trim().toLowerCase();
      return `<option value="${escapeAttr(k)}" ${cur === k ? "selected" : ""}>${escapeHtml(lab)}</option>`;
    })
    .join("");
  const payFreqSel = selectOptionsFromCatalog(CO_CATALOGS.payFrequency, e.payFrequency || "Mensual", "Seleccione...");
  const companyOptsInner = [`<option value="">${escapeHtml("Seleccione")}</option>`]
    .concat(
      read(KEYS.companies, [])
        .filter((c) => isCompanyRecordActive(c))
        .map(
          (c) =>
            `<option value="${escapeAttr(c.id)}" ${String(e.companyId || "") === String(c.id || "") ? "selected" : ""}>${escapeHtml(String(c.name || ""))}</option>`
        )
    )
    .join("");
  const posOptsInner = [`<option value="">${escapeHtml("Seleccione")}</option>`]
    .concat(
      getActivePositions().map(
        (p) =>
          `<option value="${escapeAttr(p.id)}" ${String(e.positionId || "") === String(p.id || "") ? "selected" : ""}>${escapeHtml(`${p.name} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}`)}</option>`
      )
    )
    .join("");
  const tplKind = escapeAttr(String(e.contractTemplateKind || "oficina").toLowerCase());
  const defCourse = escapeAttr(String(e.defensiveCourse || ""));
  const existingAvatar = escapeAttr(String(e.avatarUrl || ""));
  return [
    {
      type: "hidden",
      name: "__employee_edit_id",
      value: empId
    },
    {
      type: "custom",
      label: "Identidad",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Nombre completo")}</span><input name="name" required value="${escapeAttr(e.name || "")}" /></label>
<label><span>${escapeHtml("Tipo documento")}</span><select name="documentType" required>${docSel}</select></label>
<label><span>${escapeHtml("N° documento")}</span><input name="idDoc" required value="${escapeAttr(e.idDoc || "")}" /></label>
<label><span>${escapeHtml("Fecha nacimiento")}</span><input type="date" name="birthDate" value="${escapeAttr(e.birthDate || "")}" /></label>
<label><span>${escapeHtml("Género")}</span><select name="gender">${genderSel}</select></label>
<label><span>${escapeHtml("Estado civil")}</span><select name="maritalStatus">${maritalSel}</select></label>
<label><span>${escapeHtml("Nivel educativo")}</span><select name="educationLevel">${eduSel}</select></label>
<label><span>${escapeHtml("Tipo de sangre RH")}</span><select name="bloodType" required>${selectOptionsFromCatalog(CO_CATALOGS.bloodTypes, e.bloodType || "", "Seleccione tipo de sangre...")}</select></label>
<label><span>${escapeHtml("¿Sufre alguna enfermedad o condición médica?")}</span><select name="hasIllness" data-emp-edit-illness required>
<option value="no" ${String(e.hasIllness || "").toLowerCase() !== "si" ? "selected" : ""}>${escapeHtml("No")}</option>
<option value="si" ${String(e.hasIllness || "").toLowerCase() === "si" ? "selected" : ""}>${escapeHtml("Sí")}</option>
</select></label>
<label class="full" data-emp-edit-illness-detail ${String(e.hasIllness || "").toLowerCase() === "si" ? "" : "hidden"}><span>${escapeHtml("¿Cuál? (descripción libre)")}</span><textarea name="illnessDescription" rows="2" placeholder="Detalle breve para uso médico/HR">${escapeHtml(e.illnessDescription || "")}</textarea></label>
</div>`
    },
    {
      type: "custom",
      label: "Contacto y ubicación",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Departamento")}</span><select name="department" id="employee-modal-department" required>${deps}</select></label>
<label><span>${escapeHtml("Ciudad")}</span><select name="city" id="employee-modal-city" required><option value="">${escapeHtml("Seleccione un departamento...")}</option></select></label>
<label class="full"><span>${escapeHtml("Dirección")}</span><input name="address" required value="${escapeAttr(e.address || "")}" /></label>
<label><span>${escapeHtml("Teléfono celular")}</span><input name="phone" required value="${escapeAttr(e.phone || "")}" /></label>
<label><span>${escapeHtml("Correo personal")}</span><input type="email" name="personalEmail" value="${escapeAttr(e.personalEmail || "")}" /></label>
<label><span>${escapeHtml("Contacto emergencia")}</span><input name="emergencyContact" required value="${escapeAttr(e.emergencyContact || "")}" /></label>
<label><span>${escapeHtml("Tel. emergencia")}</span><input name="emergencyPhone" required value="${escapeAttr(e.emergencyPhone || "")}" /></label>
<label class="full"><span>${escapeHtml("Parentesco emergencia")}</span><input name="emergencyRelation" value="${escapeAttr(e.emergencyRelation || "")}" /></label>
</div>`
    },
    {
      type: "custom",
      label: "Laboral",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Empresa")}</span><select name="companyId" required>${companyOptsInner}</select></label>
<label><span>${escapeHtml("Cargo")}</span><select name="positionId" id="employee-modal-position" required>${posOptsInner}</select></label>
<label><span>${escapeHtml("Tipo contrato")}</span><select name="contractType" required>${contractSel}</select></label>
<label class="full"><span>${escapeHtml("Duración del contrato")}</span><input name="contractDuration" required value="${escapeAttr(e.contractDuration || "")}" /></label>
<label><span>${escapeHtml("Fecha ingreso")}</span><input type="date" name="startDate" required value="${escapeAttr(e.startDate || "")}" /></label>
<label><span>${escapeHtml("Salario base (COP)")}</span><input type="number" name="baseSalary" id="employee-modal-salary" min="${CO_HR_RULES.minMonthlySalary}" required value="${escapeAttr(parseNum(e.baseSalary))}" /></label>
<label><span>${escapeHtml("Auxilio transporte")}</span><input type="number" name="transportAllowance" min="0" value="${escapeAttr(parseNum(e.transportAllowance) || CO_HR_RULES.transportAllowance)}" /></label>
<label><span>${escapeHtml("Periodicidad pago")}</span><select name="payFrequency">${payFreqSel}</select></label>
<label><span>${escapeHtml("Centro de costos")}</span><input name="costCenter" value="${escapeAttr(e.costCenter || "")}" /></label>
<label><span>${escapeHtml("Tipo cotizante")}</span><select name="contributorType">${selectOptionsFromCatalog(CO_CATALOGS.contributorTypes, e.contributorType || "")}</select></label>
<label><span>${escapeHtml("Nivel riesgo ARL")}</span><select name="arlRiskLevel">${selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels, e.arlRiskLevel || "")}</select></label>
<label><span>${escapeHtml("Plantilla contrato Word")}</span><select name="contractTemplateKind" required>${tmplSel}</select></label>
</div>`
    },
    {
      type: "custom",
      label: "Seguridad social",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("EPS")}</span><select name="eps" required>${selectOptionsFromCatalog(CO_CATALOGS.eps, e.eps || "", "Seleccione EPS...")}</select></label>
<label><span>${escapeHtml("Pensión")}</span><select name="pensionFund" required>${selectOptionsFromCatalog(CO_CATALOGS.pensionFunds, e.pensionFund || "", "Seleccione fondo...")}</select></label>
<label><span>${escapeHtml("ARL")}</span><select name="arl" required>${selectOptionsFromCatalog(CO_CATALOGS.arl, e.arl || "", "Seleccione ARL...")}</select></label>
<label><span>${escapeHtml("Fondo cesantías")}</span><select name="severanceFund">${selectOptionsFromCatalog(CO_CATALOGS.severanceFunds, e.severanceFund || "")}</select></label>
<label><span>${escapeHtml("Caja compensación")}</span><select name="compensationFund">${selectOptionsFromCatalog(CO_CATALOGS.compensationFunds, e.compensationFund || "")}</select></label>
</div>`
    },
    {
      type: "custom",
      label: "Datos bancarios",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Banco")}</span><select name="bankName" required>${selectOptionsFromCatalog(CO_CATALOGS.banks, e.bankName || "", "Seleccione...")}</select></label>
<label><span>${escapeHtml("Tipo cuenta")}</span><select name="bankAccountType">${selectOptionsFromCatalog(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros")}</select></label>
<label class="full"><span>${escapeHtml("Número cuenta")}</span><input name="bankAccount" required value="${escapeAttr(e.bankAccount || "")}" /></label>
</div>`
    },
    {
      type: "custom",
      label: "Conductor",
      html: `<div class="form-section-grid employee-edit-grid hr-modal-conductor-block">
<label><span>${escapeHtml("N° licencia")}</span><input name="license" value="${escapeAttr(e.license || "")}" /></label>
<label><span>${escapeHtml("Categoría licencia")}</span><select name="licenseCategory">${selectOptionsFromCatalog(CO_CATALOGS.licenseCategories, e.licenseCategory || "", "Seleccione categoría...")}</select></label>
<label><span>${escapeHtml("Vence licencia")}</span><input type="date" name="licenseExpiry" value="${escapeAttr(e.licenseExpiry || "")}" /></label>
<label><span>${escapeHtml("Psicosensométrico")}</span><input type="date" name="psychoTestDate" value="${escapeAttr(e.psychoTestDate || "")}" /></label>
<label><span>${escapeHtml("Vence psicosensométrico")}</span><input type="date" name="psychoTestExpiry" value="${escapeAttr(e.psychoTestExpiry || "")}" /></label>
<label><span>${escapeHtml("Conducción defensiva")}</span><select name="defensiveCourse">
<option value="">${escapeHtml("Seleccione...")}</option>
<option value="vigente" ${defCourse === "vigente" ? "selected" : ""}>${escapeHtml("Vigente")}</option>
<option value="vencido" ${defCourse === "vencido" ? "selected" : ""}>${escapeHtml("Vencido")}</option>
<option value="no_aplica" ${defCourse === "no_aplica" ? "selected" : ""}>${escapeHtml("No aplica")}</option>
</select></label>
<p class="full muted modal-field-hint" style="grid-column:1/-1;font-size:0.82rem">Si el cargo no es conductor, puede dejar esta sección en blanco.</p>
</div>`
    },
    {
      type: "custom",
      label: "Foto",
      html: `<div class="form-section-grid employee-edit-grid">
<label class="full"><span>${escapeHtml("Nueva foto (opcional)")}</span><input type="file" name="avatarFile" accept="image/*" /></label>
<input type="hidden" name="avatarUrlExisting" value="${existingAvatar}" />
<p class="full muted modal-field-hint" style="font-size:0.82rem">${escapeHtml("Si no selecciona archivo, se mantiene la foto actual.")}</p>
</div>`
    }
  ];
}

function buildEmployeeContractDocxPayload(employee, opts = {}) {
  let kind = String(opts.contractTemplateKind || "").trim().toLowerCase();
  const signDate = String(opts.signDate || employee.startDate || colombiaTodayIsoDate()).trim();
  const positionName = getPositionById(String(employee.positionId || ""))?.name || String(employee.position || "").trim();
  const wr = String(employee.workerRole || (String(positionName).toLowerCase().includes("conductor") ? "conductor" : "empleado"));
  const ct = String(employee.contractType || "Termino indefinido");
  const templates = window.RecruitmentDomain?.TEMPLATE_BY_KIND || {};
  if (!kind || !templates[kind]) {
    kind = window.RecruitmentDomain?.inferTemplateKind ? window.RecruitmentDomain.inferTemplateKind(ct, wr) : "oficina";
  }
  const base = parseNum(employee.baseSalary);
  const wordsSalary =
    window.RecruitmentDomain?.formatSalarioLetrasPesos
      ? window.RecruitmentDomain.formatSalarioLetrasPesos(base)
      : "";
  return {
    contractTemplateKind: kind,
    contractType: ct,
    workerRole: wr,
    nombre_empleado: String(employee.name || "").trim(),
    cedula_empleado: String(employee.idDoc || "").trim(),
    ciudad_empleado: String(employee.city || "").trim(),
    banco_cuenta_bancaria: String(employee.bankName || "").trim(),
    cuenta_bancaria: String(employee.bankAccount || "").trim(),
    salario: base,
    salario_letras: wordsSalary,
    duracion_contrato:
      String(employee.contractDuration || "").trim() ||
      describeContractDurationForDocx({ contractType: ct, startDate: signDate, endDate: employee.endDate || "" }),
    cargo_empleado: positionName,
    signDate
  };
}

async function generateOfficialWordContract(payload) {
  if (!window.RecruitmentDomain?.generateEmployeeContractDocx) {
    throw new Error("Módulo de contratos Word no disponible (recarga la página).");
  }
  return window.RecruitmentDomain.generateEmployeeContractDocx(payload);
}

/** Valores de ejemplo para generar un Word de prueba sin persistir contrato. */
function buildContractDocxTestPayload(templateKind) {
  const kind = String(templateKind || "oficina").toLowerCase();
  const contractType =
    kind === "prestacion" ? "Prestacion de servicios" : kind === "fijo" ? "Termino fijo" : "Termino indefinido";
  const workerRole = kind === "prestacion" ? "conductor" : "empleado";
  const today = colombiaTodayIsoDate();
  const endDate = kind === "fijo" ? "2027-12-31" : "";
  return {
    contractTemplateKind: kind,
    contractType,
    workerRole,
    nombre_empleado: "Nombre Apellido Ejemplo",
    cedula_empleado: "1000000000",
    ciudad_empleado: "Bogota D.C.",
    banco_cuenta_bancaria: "Bancolombia",
    cuenta_bancaria: "000000000000",
    salario: CO_HR_RULES.minMonthlySalary,
    salario_letras: "",
    duracion_contrato: describeContractDurationForDocx({ contractType, startDate: today, endDate }),
    cargo_empleado: kind === "prestacion" ? "Conductor nacional (ejemplo C2)" : "Auxiliar administrativo (ejemplo)",
    signDate: today
  };
}

function mountAuthorizationsTabs() {
  const shell = nodes.viewRoot && nodes.viewRoot.querySelector('.module-shell[data-module-view="authorizations"]');
  if (!shell) return;
  const bar = shell.querySelector("[data-auth-tabs-bar]");
  if (!bar) return;
  const activate = (id) => {
    const sid = String(id || "");
    bar.querySelectorAll("[data-auth-tab]").forEach((btn) => {
      const on = String(btn.getAttribute("data-auth-tab") || "") === sid;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    shell.querySelectorAll("[data-auth-panel]").forEach((panel) => {
      const on = String(panel.getAttribute("data-auth-panel") || "") === sid;
      panel.classList.toggle("is-active", on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    try {
      localStorage.setItem("antares_auth_tab", sid);
    } catch (_) {}
  };
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-auth-tab]");
    if (!btn || !bar.contains(btn)) return;
    e.preventDefault();
    activate(btn.getAttribute("data-auth-tab"));
  });
  let initial =
    bar.querySelector(".auth-tab-btn.is-active")?.getAttribute("data-auth-tab") ||
    bar.querySelector("[data-auth-tab]")?.getAttribute("data-auth-tab") ||
    "";
  try {
    const saved = localStorage.getItem("antares_auth_tab");
    if (saved && shell.querySelector(`[data-auth-panel="${saved}"]`)) initial = saved;
  } catch (_) {}
  if (initial) activate(initial);
}

/** Acciones que los usuarios que no son administrador no pueden ejecutar (listeners capture en `viewRoot`, una sola vez). */
const PORTAL_NON_ADMIN_BLOCKED_ACTIONS = new Set([
  "edit",
  "cancel",
  "approve",
  "reject",
  "edit-admin",
  "delete-admin",
  "trip-status",
  "delete-trip",
  "edit-vehicle",
  "toggle-vehicle",
  "delete-vehicle",
  "edit-driver",
  "toggle-driver",
  "delete-driver",
  "delete-route-rate",
  "delete-employee",
  "delete-vacancy",
  "toggle-position",
  "candidate-status",
  "open-edit-user",
  "delete-user",
  "approve-registration",
  "reject-registration",
  "approval-approve",
  "approval-reject",
  "open-edit-company",
  "close-edit-company",
  "toggle-company-active",
  "delete-company",
  "delete-payroll-run",
  "delete-hr-absence",
  "edit-hr-absence",
  "edit-vacancy",
  "edit-position",
  "delete-position",
  "edit-candidate",
  "delete-candidate",
  "edit-interview",
  "delete-interview",
  "delete-contract",
  "edit-sst-record",
  "delete-sst-record"
]);

function portalNonAdminRestrictedCaptureClick(event) {
  if (isAdminActor()) return;
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

function portalNonAdminRestrictedCaptureChange(event) {
  if (isAdminActor()) return;
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

/**
 * Guarda dura para handlers destructivos. Aunque la barrera de captura cubre el camino feliz,
 * si alguien manipula el DOM (devtools, extensión) o re-renderea sin pasar por viewRoot, este
 * check rechaza la acción antes de tocar localStorage o la API.
 * @returns {boolean} true si se debe abortar la acción.
 */
function abortIfNotAdmin(reason = "adminOnlyModule") {
  if (isAdminActor()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function bindDynamicEvents() {
  const actor = currentUser();
  const isAdmin = actor?.role === ROLES.ADMIN;
  const restrictedActions = PORTAL_NON_ADMIN_BLOCKED_ACTIONS;

  if (!isAdmin) {
    nodes.viewRoot.querySelectorAll("[data-action]").forEach((node) => {
      const action = String(node.dataset.action || "");
      if (!restrictedActions.has(action)) return;
      if (node.matches("button")) node.classList.add("hidden");
      if (node.matches("select")) {
        node.setAttribute("disabled", "true");
        node.style.opacity = "0.6";
        node.style.cursor = "not-allowed";
      }
    });
    if (!state.portalNonAdminCaptureBound) {
      state.portalNonAdminCaptureBound = true;
      nodes.viewRoot.addEventListener("click", portalNonAdminRestrictedCaptureClick, true);
      nodes.viewRoot.addEventListener("change", portalNonAdminRestrictedCaptureChange, true);
    }
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-create-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panelId = String(btn.dataset.panel || "");
      if (!panelId) return;
      const PAYROLL_CREATE_IDS = ["create-employee", "create-payroll", "create-hr-absence"];
      const HIRING_CREATE_IDS = ["create-position", "create-vacancy", "create-candidate", "create-interview", "create-contract"];
      const payrollSet = new Set(PAYROLL_CREATE_IDS);
      const hiringSet = new Set(HIRING_CREATE_IDS);
      const wasOpen = Boolean(state.createPanels?.[panelId]);
      const nextOpen = !wasOpen;
      state.createPanels = { ...(state.createPanels || {}) };

      if (payrollSet.has(panelId)) {
        PAYROLL_CREATE_IDS.forEach((id) => {
          state.createPanels[id] = nextOpen && id === panelId;
        });
      } else if (hiringSet.has(panelId)) {
        HIRING_CREATE_IDS.forEach((id) => {
          state.createPanels[id] = nextOpen && id === panelId;
        });
      } else {
        state.createPanels[panelId] = nextOpen;
      }

      if (payrollSet.has(panelId) && nextOpen) {
        state.payrollUi = { ...(state.payrollUi || {}), workspace: "operate" };
        persistHrWorkspace("payroll", "operate");
      }
      if (hiringSet.has(panelId) && nextOpen) {
        state.hiringUi = { ...(state.hiringUi || {}), workspace: "operate" };
        persistHrWorkspace("hiring", "operate");
      }
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "");
      const moduleId = String(btn.dataset.module || "");
      if (!tab || !moduleId) return;
      if (moduleId === "payroll") {
        if (!HR_VALID_PAYROLL_WS.has(tab)) return;
        state.payrollUi = { ...(state.payrollUi || {}), workspace: tab };
        persistHrWorkspace("payroll", tab);
      } else if (moduleId === "hiring") {
        if (!HR_VALID_HIRING_WS.has(tab)) return;
        state.hiringUi = { ...(state.hiringUi || {}), workspace: tab };
        persistHrWorkspace("hiring", tab);
      }
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = String(btn.dataset.panel || "");
      const currentPanel = state.adminUsersUi?.panel || "";
      state.adminUsersUi = {
        panel: currentPanel === panel ? "" : panel,
        editUserId: "",
        editCompanyId: ""
      };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='open-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      state.adminUsersUi = { panel: "", editUserId: id, editCompanyId: "" };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='open-edit-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: id };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-edit-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-company-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const companyId = String(btn.dataset.id || "");
      if (!companyId) return;
      const companies = read(KEYS.companies, []);
      const target = companies.find((c) => String(c.id) === companyId);
      if (!target) return;
      const active = isCompanyRecordActive(target);
      const verb = active ? "desactivar" : "activar";
      openConfirmModal({
        title: `${active ? "Desactivar" : "Activar"} empresa`,
        message: `Se va a ${verb} "${String(target.name || "").trim()}". Las empresas inactivas no aparecen al asignar usuarios nuevos.`,
        confirmText: active ? "Desactivar" : "Activar",
        onConfirm: async () => {
          const next = companies.map((c) =>
            String(c.id) === companyId ? { ...c, active: !active } : c
          );
          await writeAwaitServer(KEYS.companies, next);
          notify(userMessage(active ? "companyDeactivated" : "companyActivated"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const companyId = String(btn.dataset.id || "");
      if (!companyId) return;
      const companies = read(KEYS.companies, []);
      const target = companies.find((c) => String(c.id) === companyId);
      if (!target) return;
      const linkedUsers = read(KEYS.users, []).filter((u) => String(u.companyId || "") === companyId);
      if (linkedUsers.length > 0) {
        notify(userMessage("companyDeleteBlockedUsers"), "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar empresa",
        message: `Eliminar permanentemente "${String(target.name || "").trim()}" del sistema.`,
        confirmText: "Eliminar",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-company-delete", { companyId });
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
          const rest = read(KEYS.companies, []).filter((c) => String(c.id) !== companyId);
          await writeAwaitServer(KEYS.companies, rest);
          state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
          notify(userMessage("companyDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  const adminUserCreate = document.getElementById("form-admin-user-create");
  if (adminUserCreate) {
    attachDepartmentCitySelects(adminUserCreate, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    bindPasswordStrengthSuite(
      adminUserCreate.querySelector("input[name='password']"),
      adminUserCreate.querySelector("#admin-password-strength-suite")
    );
    adminUserCreate.addEventListener("submit", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(adminUserCreate).entries());
      const permissions = [...adminUserCreate.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      if (users.some((item) => normalizeEmail(item.email) === normalizeEmail(data.email))) {
        notify(userMessage("userEmailExists"), "error");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.taxId);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.taxId = docValidation.normalized;
      const company = getCompanyById(data.companyId);
      if (!company) {
        notify(userMessage("userSelectCompany"), "error");
        return;
      }
      const passPolicy = validatePasswordPolicy(data.password);
      if (!passPolicy.ok) {
        notify(userMessage(passPolicy.key), "error");
        return;
      }
      if (actor?.role !== ROLES.ADMIN) {
        await queueApproval({
          type: "create_user",
          title: `Creacion de usuario ${data.name}`,
          payload: { ...data, companyName: company.name, permissions },
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify(userMessage("userApprovalQueued"), "info");
        renderPortalView();
        return;
      }
      const registrationKindCreate = normalizeRegistrationKindForDb(data.registrationKind);
      users.push({
        id: newUuidV4(),
        name: normalizeLatinForDb(data.name),
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: data.role,
        documentType: data.documentType,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        personType: normalizePersonTypeForDb(data.personType),
        documentIssuedAt: data.documentIssuedAt || "",
        company: normalizeLatinForDb(data.company || company.name),
        companyId: company.id,
        taxId: data.taxId,
        phone: normalizePortalPhoneForStorage(data.phone),
        city: normalizeLatinForDb(data.city),
        department: normalizeLatinForDb(data.department),
        address: normalizeLatinForDb(data.address),
        registrationKind: registrationKindCreate,
        profileQualityChecklist: {
          registrationKind: registrationKindCreate
        },
        twoFactorEnabled: String(data.twoFactorEnabled || "false") === "true",
        systemJoinDate: data.systemJoinDate || nowIso().slice(0, 10),
        createdAt: nowIso(),
        permissions:
          data.role === ROLES.ADMIN
            ? [...ALL_PERMISSIONS]
            : permissions.length
              ? permissions
              : defaultPermissionsForRole(data.role)
      });
      await writeAwaitServer(KEYS.users, users);
      notify(userMessage("userCreated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
      renderPortalView();
    });
  }

  const adminCompanyCreate = document.getElementById("form-admin-company-create");
  if (adminCompanyCreate) {
    adminCompanyCreate.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminCompanyCreate).entries());
      const nitValidation = validateColombianDocument("NIT", data.taxId);
      if (!nitValidation.ok) {
        notify(userMessage("companyNitInvalid", nitValidation.message), "error");
        return;
      }
      const nameTrim = normalizeLatinForDb(String(data.name || "").trim());
      if (!nameTrim) {
        notify(userMessage("validationStep"), "error");
        return;
      }
      if (nameTrim.length > 255) {
        notify(userMessage("companyNameTooLong"), "error");
        return;
      }
      const phoneStored = normalizePortalPhoneForStorage(String(data.phone || ""));
      const phoneDigits = phoneStored.replace(/\D/g, "");
      if (phoneStored && phoneDigits.length < 7) {
        notify(userMessage("companyPhoneInvalid"), "error");
        return;
      }
      const companies = read(KEYS.companies, []);
      const nitNorm = nitValidation.normalized;
      const nameLc = nameTrim.toLowerCase();
      if (companies.some((c) => String(c.name || "").trim().toLowerCase() === nameLc)) {
        notify(userMessage("companyNameDuplicate"), "error");
        return;
      }
      if (companies.some((c) => String(c.taxId || c.nit || "").trim() === nitNorm)) {
        notify(userMessage("companyNitDuplicate"), "error");
        return;
      }
      const kind = normalizeCompanyKindForDb(data.companyKind);
      if (kind === "propia" && companies.some((c) => normalizeCompanyKindForDb(c.companyKind) === "propia")) {
        notify(userMessage("companyPropiaDuplicate"), "error");
        return;
      }
      companies.push({
        id: newUuidV4(),
        name: nameTrim,
        taxId: nitNorm,
        nit: nitNorm,
        phone: phoneStored,
        companyKind: kind,
        active: true,
        createdAt: nowIso()
      });
      await writeAwaitServer(KEYS.companies, companies);
      notify(userMessage("companyCreated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
      renderPortalView();
    });
  }

  const adminCompanyEdit = document.getElementById("form-admin-company-edit");
  if (adminCompanyEdit) {
    adminCompanyEdit.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminCompanyEdit).entries());
      const companyId = String(data.id || "");
      if (!companyId) return;
      const companies = read(KEYS.companies, []);
      const existing = companies.find((c) => String(c.id) === companyId);
      if (!existing) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const nitValidation = validateColombianDocument("NIT", data.taxId);
      if (!nitValidation.ok) {
        notify(userMessage("companyNitInvalid", nitValidation.message), "error");
        return;
      }
      const nameTrim = normalizeLatinForDb(String(data.name || "").trim());
      if (!nameTrim) {
        notify(userMessage("validationStep"), "error");
        return;
      }
      if (nameTrim.length > 255) {
        notify(userMessage("companyNameTooLong"), "error");
        return;
      }
      const nitNorm = nitValidation.normalized;
      const nameLc = nameTrim.toLowerCase();
      if (companies.some((c) => String(c.id) !== companyId && String(c.name || "").trim().toLowerCase() === nameLc)) {
        notify(userMessage("companyNameDuplicate"), "error");
        return;
      }
      if (companies.some((c) => String(c.id) !== companyId && String(c.taxId || c.nit || "").trim() === nitNorm)) {
        notify(userMessage("companyNitDuplicate"), "error");
        return;
      }
      const kind = normalizeCompanyKindForDb(data.companyKind);
      if (
        kind === "propia" &&
        companies.some((c) => String(c.id) !== companyId && normalizeCompanyKindForDb(c.companyKind) === "propia")
      ) {
        notify(userMessage("companyPropiaDuplicate"), "error");
        return;
      }
      const phoneStored = normalizePortalPhoneForStorage(String(data.phone || ""));
      const phoneDigits = phoneStored.replace(/\D/g, "");
      if (phoneStored && phoneDigits.length < 7) {
        notify(userMessage("companyPhoneInvalid"), "error");
        return;
      }
      const nextCompanies = companies.map((c) =>
        String(c.id) === companyId
          ? {
              ...c,
              name: nameTrim,
              taxId: nitNorm,
              nit: nitNorm,
              phone: phoneStored,
              companyKind: kind
            }
          : c
      );
      try {
        await writeAwaitServer(KEYS.companies, nextCompanies);
      } catch (err) {
        notify(String(err?.message || "La empresa no se pudo guardar en el servidor."), "error");
        return;
      }
      notify(userMessage("companyUpdated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
      renderPortalView();
    });
  }

  const adminUserPermissions = document.getElementById("form-admin-user-permissions");
  if (adminUserPermissions) {
    adminUserPermissions.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(adminUserPermissions);
      const userId = String(form.get("userId") || "");
      if (!userId) {
        notify(userMessage("userPick"), "error");
        return;
      }
      const permissions = [...adminUserPermissions.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      const nextUsers = users.map((user) =>
        user.id === userId
          ? {
              ...user,
              permissions:
                user.role === ROLES.ADMIN
                  ? [...ALL_PERMISSIONS]
                  : permissions.filter((permission) => ALL_PERMISSIONS.includes(permission))
            }
          : user
      );
      try {
        await writeAwaitServer(KEYS.users, nextUsers);
      } catch (_) {
        return;
      }
      if (state.session?.userId === userId) {
        const refreshed = read(KEYS.users, []).find((item) => item.id === userId);
        if (refreshed && !hasPermission(refreshed, PERMISSIONS.USERS_MANAGE)) {
          notify(userMessage("permissionsChangedLogout"), "error");
          clearSession();
          renderPortal();
          return;
        }
      }
      notify(userMessage("permissionsUpdated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
      renderPortalView();
    });
  }

  const adminUserEdit = document.getElementById("form-admin-user-edit");
  if (adminUserEdit) {
    attachDepartmentCitySelects(adminUserEdit, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']",
      initialDepartment: String(adminUserEdit.querySelector("select[name='department']")?.value || ""),
      initialCity: String(adminUserEdit.querySelector("select[name='city']")?.value || "")
    });
    adminUserEdit.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminUserEdit).entries());
      const userId = String(data.id || "");
      if (!userId) return;
      const users = read(KEYS.users, []);
      const existing = users.find((u) => u.id === userId);
      if (!existing) {
        notify(userMessage("userNotFound"), "error");
        return;
      }
      const duplicated = users.some((u) => u.id !== userId && normalizeEmail(u.email) === normalizeEmail(data.email));
      if (duplicated) {
        notify(userMessage("userEmailDuplicate"), "error");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.taxId);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.taxId = docValidation.normalized;
      const company = getCompanyById(String(data.companyId || ""));
      if (!company) {
        notify(userMessage("userSelectCompany"), "error");
        return;
      }
      const permissions = [...adminUserEdit.querySelectorAll("input[name='permissions']:checked")].map((input) => input.value);
      let nextPassword = existing.password;
      if (String(data.password || "").trim()) {
        const pp = validatePasswordPolicy(data.password);
        if (!pp.ok) {
          notify(userMessage(pp.key), "error");
          return;
        }
        nextPassword = await hashPassword(String(data.password || "").trim());
      }
      const fn = normalizeLatinForDb(String(data.firstName ?? "").trim());
      const mn = normalizeLatinForDb(String(data.middleName ?? "").trim());
      const ln = normalizeLatinForDb(String(data.lastName ?? "").trim());
      const sln = normalizeLatinForDb(String(data.secondLastName ?? "").trim());
      const composedFromParts = [fn, mn, ln, sln].filter(Boolean).join(" ").trim();
      const nameFromInput = normalizeLatinForDb(String(data.name ?? "").trim());
      const resolvedFullName = nameFromInput || composedFromParts || normalizeLatinForDb(String(existing.name ?? "").trim());
      const birthIn = String(data.birthDate ?? "").trim();
      const birthStored =
        !birthIn
          ? ""
          : /^\d{4}-\d{2}-\d{2}$/.test(birthIn.slice(0, 10))
            ? birthIn.slice(0, 10)
            : String(existing.birthDate || "").slice(0, 10) || "";
      const gRaw = String(data.gender ?? "").trim();
      const genderStored = gRaw ? normalizeLatinUpperForDb(gRaw) : "";
      const registrationKindStored = normalizeRegistrationKindForDb(data.registrationKind);
      const nextEdited = users.map((u) =>
        u.id === userId
          ? {
              ...u,
              name: resolvedFullName,
              firstName: fn || undefined,
              middleName: mn || undefined,
              lastName: ln || undefined,
              secondLastName: sln || undefined,
              email: normalizeEmail(data.email),
              password: nextPassword,
              role: String(data.role || u.role),
              documentType: String(data.documentType || u.documentType || "CC"),
              personType: normalizePersonTypeForDb(String(data.personType || u.personType || "")),
              documentIssuedAt: String(data.documentIssuedAt || u.documentIssuedAt || ""),
              birthDate: birthStored,
              gender: genderStored,
              companyId: company.id,
              company: normalizeLatinForDb(String(data.company || company.name).trim()),
              taxId: String(data.taxId || "").trim(),
              phone: normalizePortalPhoneForStorage(String(data.phone || "").trim()),
              city: normalizeLatinForDb(String(data.city || "").trim()),
              department: normalizeLatinForDb(String(data.department || u.department || "").trim()),
              address: normalizeLatinForDb(String(data.address || u.address || "").trim()),
              position: normalizeLatinForDb(String(data.position ?? u.position ?? "").trim()),
              workArea: normalizeLatinForDb(String(data.workArea ?? u.workArea ?? "").trim()),
              registrationKind: registrationKindStored,
              profileQualityChecklist: {
                ...(u.profileQualityChecklist && typeof u.profileQualityChecklist === "object"
                  ? u.profileQualityChecklist
                  : {}),
                registrationKind: registrationKindStored
              },
              twoFactorEnabled: String(data.twoFactorEnabled || "false") === "true",
              systemJoinDate: String(data.systemJoinDate || u.systemJoinDate || ""),
              permissions:
                String(data.role || u.role) === ROLES.ADMIN
                  ? [...ALL_PERMISSIONS]
                  : permissions.length
                    ? permissions.filter((p) => ALL_PERMISSIONS.includes(p))
                    : defaultPermissionsForRole(String(data.role || u.role))
            }
          : u
      );
      try {
        await writeAwaitServer(KEYS.users, nextEdited);
      } catch (_e) {
        return;
      }
      notify(userMessage("userUpdated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "", editCompanyId: "" };
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='approve-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyApprove"), "error");
        return;
      }
      const userId = btn.dataset.id;
      if (!userId) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => String(u.id) === String(userId));
      if (!target) return;
      const isOrphan = pendingUserOrigin(target) === "supabase_auth_only";
      const companiesAll = read(KEYS.companies, []);
      const apiOn = Boolean(window.AntaresApi?.isConfigured?.());
      const companies = apiOn
        ? companiesAll.filter((c) => isUuidString(String(c.id || "")))
        : companiesAll;
      if (!companies.length) {
        if (apiOn && companiesAll.length) {
          notify(
            "Las empresas en lista no tienen id compatible con el servidor (deben ser UUID). Registre la empresa de nuevo con «Nueva empresa» o cargue datos desde el servidor.",
            "error"
          );
        } else {
          notify(userMessage("noCompaniesForUser"), "error");
        }
        return;
      }
      // El modal muestra los datos completos al admin (acción auditada);
      // las tarjetas de bandeja siguen enmascaradas para limitar exposición.
      const modalSubtitleLines = [
        `${getPortalUserDisplayName(target)} · ${target.email || "—"}`
      ];
      if (target.registrationKind) {
        modalSubtitleLines.push(`Tipo de vínculo: ${registrationKindLabel(target.registrationKind)}`);
      }
      if (target.documentType || target.taxId || target.personalDoc) {
        const docPart = [
          String(target.documentType || "").trim(),
          String(target.taxId || target.personalDoc || "").trim()
        ]
          .filter(Boolean)
          .join(" ");
        if (docPart) modalSubtitleLines.push(`Documento: ${docPart}`);
      }
      if (target.phone) modalSubtitleLines.push(`Tel.: ${String(target.phone).trim()}`);
      const initialRole = target.role || ROLES.CLIENT;
      const initialPerms = Array.isArray(target.permissions) && target.permissions.length
        ? target.permissions.filter((p) => ALL_PERMISSIONS.includes(p))
        : defaultPermissionsForRole(initialRole);
      const renderPermsChecklistHtml = (selected) => {
        const setSel = new Set(selected);
        const items = ALL_PERMISSIONS.map((permission) => {
          const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
          const checked = setSel.has(permission) ? "checked" : "";
          return `<label class="perm-check perm-check--compact">
            <input type="checkbox" name="permissions" value="${escapeAttr(permission)}" ${checked} />
            <span><strong>${escapeHtml(meta.title)}</strong>${meta.desc ? `<small>${escapeHtml(meta.desc)}</small>` : ""}</span>
          </label>`;
        }).join("");
        return `<div class="approve-perms-shell" data-approve-perms-shell>
          <div class="approve-perms-head">
            <p class="muted approve-perms-help">Marca o desmarca lo que el usuario podrá ver/usar. Se prellena con los permisos típicos del rol seleccionado, pero puedes ajustarlos antes de aprobar.</p>
            <div class="approve-perms-actions">
              <button type="button" class="btn btn-action btn-sm" data-perm-bulk="all">${IC.check} Marcar todos</button>
              <button type="button" class="btn btn-action btn-sm" data-perm-bulk="none">${IC.x} Desmarcar todos</button>
              <button type="button" class="btn btn-action btn-sm" data-perm-bulk="role">${IC.shield} Volver al rol</button>
            </div>
          </div>
          <div class="approve-perms-grid perm-grid" data-approve-perms-grid>${items}</div>
          <p class="muted approve-perms-counter" data-approve-perms-counter></p>
        </div>`;
      };

      openEditModal({
        title: "Aprobar usuario y asociar empresa",
        subtitle: modalSubtitleLines.join(" · "),
        submitText: "Aprobar cuenta",
        fields: [
          {
            name: "companyId",
            label: "Empresa a asociar",
            type: "select",
            required: true,
            value:
              target.companyId && (!apiOn || isUuidString(String(target.companyId)))
                ? target.companyId
                : "",
            options: companies.map((c) => ({ value: c.id, label: `${c.name} (${c.taxId || "Sin NIT"})` }))
          },
          {
            name: "role",
            label: "Rol en el sistema",
            type: "select",
            required: true,
            value: initialRole,
            options: [
              { value: ROLES.CLIENT, label: "Cliente" },
              { value: ROLES.RRHH, label: "Recursos Humanos" },
              { value: ROLES.ADMINISTRACION, label: "Administración" },
              { value: ROLES.AUXILIAR_ADMINISTRATIVO, label: "Auxiliar administrativo" },
              { value: ROLES.LIDER_ADMINISTRATIVO, label: "Líder administrativo" },
              { value: ROLES.ADMIN, label: "Administrador" }
            ]
          },
          {
            name: "__permissions_block",
            type: "custom",
            label: "Permisos del usuario",
            id: "approve-permissions-block",
            html: renderPermsChecklistHtml(initialPerms)
          }
        ],
        afterMount: (form) => {
          if (!form) return;
          const roleSelect = form.querySelector("select[name='role']");
          const shell = form.querySelector("[data-approve-perms-shell]");
          if (!shell) return;
          const refreshCounter = () => {
            const counter = shell.querySelector("[data-approve-perms-counter]");
            if (!counter) return;
            const total = ALL_PERMISSIONS.length;
            const marked = shell.querySelectorAll("input[name='permissions']:checked").length;
            counter.textContent = `${marked} de ${total} permisos seleccionados`;
          };
          const repaintForRole = (role, opts = {}) => {
            const grid = shell.querySelector("[data-approve-perms-grid]");
            if (!grid) return;
            const base = defaultPermissionsForRole(role);
            const next = opts.preserveSelection
              ? base
              : base;
            const setNext = new Set(next);
            grid.innerHTML = ALL_PERMISSIONS.map((permission) => {
              const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
              const checked = setNext.has(permission) ? "checked" : "";
              return `<label class="perm-check perm-check--compact">
                <input type="checkbox" name="permissions" value="${escapeAttr(permission)}" ${checked} />
                <span><strong>${escapeHtml(meta.title)}</strong>${meta.desc ? `<small>${escapeHtml(meta.desc)}</small>` : ""}</span>
              </label>`;
            }).join("");
            refreshCounter();
          };
          if (roleSelect) {
            roleSelect.addEventListener("change", () => {
              repaintForRole(roleSelect.value || ROLES.CLIENT);
            });
          }
          shell.addEventListener("click", (event) => {
            const trigger = event.target.closest("[data-perm-bulk]");
            if (!trigger) return;
            const mode = trigger.getAttribute("data-perm-bulk");
            const inputs = [...shell.querySelectorAll("input[name='permissions']")];
            if (mode === "all") inputs.forEach((i) => { i.checked = true; });
            else if (mode === "none") inputs.forEach((i) => { i.checked = false; });
            else if (mode === "role") repaintForRole(roleSelect?.value || ROLES.CLIENT);
            refreshCounter();
          });
          shell.addEventListener("change", (event) => {
            if (event.target?.name === "permissions") refreshCounter();
          });
          refreshCounter();
        },
        onSubmit: async (form, formEl) => {
          const selected = getCompanyById(String(form.companyId || ""));
          if (!selected) {
            notify(userMessage("userSelectCompany"), "error");
            return false;
          }
          const chosenRole = String(form.role || ROLES.CLIENT).trim();
          if (!Object.values(ROLES).includes(chosenRole)) {
            notify("Seleccione un rol válido.", "error");
            return false;
          }
          /**
           * Lectura de permisos manual (varios checkboxes con el mismo `name`): FormData solo trae
           * la última coincidencia, así que extraemos los marcados directamente del DOM. Si el
           * admin desmarcó todos, conservamos al menos los mínimos del rol para no dejar la cuenta
           * sin acceso a Dashboard / Mi perfil / Notificaciones.
           */
          const checkedPerms = formEl
            ? [...formEl.querySelectorAll("input[name='permissions']:checked")]
                .map((el) => el.value)
                .filter((p) => ALL_PERMISSIONS.includes(p))
            : [];
          const finalPerms = checkedPerms.length
            ? [...new Set(checkedPerms)]
            : defaultPermissionsForRole(chosenRole);
          const api = window.AntaresApi;
          if (api?.isConfigured?.()) {
            try {
              await api.postJson("/portal/approve-pending-user", {
                userId: String(target.id),
                companyId: String(selected.id),
                role: chosenRole,
                permissions: finalPerms
              });
              /**
               * Proyección local alineada al servidor: si /portal/bootstrap falla, antes quedaba el usuario
               * como pendiente hasta un volcado exitoso (y tras F5 seguía la cola mal).
               */
              portalPatchUsersCacheWithoutSyncKey(() => {
                write(
                  KEYS.users,
                  read(KEYS.users, []).map((u) =>
                    String(u.id) === String(target.id)
                      ? {
                          ...u,
                          accountStatus: ACCOUNT_STATUS.APROBADO,
                          companyId: selected.id,
                          company: selected.name,
                          role: chosenRole,
                          permissions: finalPerms,
                          source: "portal_db"
                        }
                      : u
                  )
                );
              });
              await portalRefreshBootstrapThenPendingRegistrations();
            } catch (err) {
              notify(String(err?.message || userMessage("registerServerError")), "error");
              return false;
            }
          } else {
            write(
              KEYS.users,
              read(KEYS.users, []).map((u) =>
                u.id === userId
                  ? {
                      ...u,
                      accountStatus: ACCOUNT_STATUS.APROBADO,
                      companyId: selected.id,
                      company: selected.name,
                      role: chosenRole,
                      permissions: finalPerms
                    }
                  : u
              )
            );
          }
          saveNotification({
            userId: target.id,
            title: "Cuenta aprobada",
            body: `Su cuenta ha sido aprobada con el rol asignado y asociada a ${selected.name}. Revise su correo para definir la contraseña y entrar al portal.`
          });
          sendEmail({
            to: target.email,
            subject: "Cuenta aprobada - Antares Portal",
            body: `Hola ${target.name}, su cuenta fue aprobada y asociada a ${selected.name}. Le hemos enviado un correo con el enlace para definir su contraseña e iniciar sesión.`
          });
          /**
           * Correo de activación real. Al aprobar reutilizamos el flujo de recuperación de contraseña
           * (POST /auth/password-recovery/request), que en Supabase manda un email con un enlace
           * único. Así el usuario recibe la activación aunque su contraseña original ya esté en BD.
           */
          if (api?.postJsonPublic && target?.email) {
            try {
              const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
              await api.postJsonPublic("/auth/password-recovery/request", {
                email: String(target.email).trim(),
                redirectTo
              });
            } catch (err) {
              devWarn("approve-registration: password-recovery email no enviado.", err?.message || err);
            }
          }
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(target.id);
          notify(userMessage("accountApproved", target.name), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyApprove"), "error");
        return;
      }
      const userId = btn.dataset.id;
      if (!userId) return;
      openEditModal({
        title: "Rechazar registro",
        subtitle: "Ingresa motivo de rechazo",
        submitText: "Rechazar",
        fields: [{ name: "reason", label: "Motivo", value: "", required: true }],
        onSubmit: async (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          const users = read(KEYS.users, []);
          const target = users.find((u) => String(u.id) === String(userId));
          if (!target) return false;
          const api = window.AntaresApi;
          if (api?.isConfigured?.()) {
            try {
              await api.postJson("/portal/admin-user-status", { userId: String(target.id), status: "rechazado" });
              portalPatchUsersCacheWithoutSyncKey(() => {
                write(
                  KEYS.users,
                  read(KEYS.users, []).map((u) =>
                    String(u.id) === String(target.id)
                      ? { ...u, accountStatus: ACCOUNT_STATUS.RECHAZADO, rejectionReason: reason }
                      : u
                  )
                );
              });
              await portalRefreshBootstrapThenPendingRegistrations();
            } catch (err) {
              notify(String(err?.message || "No se pudo rechazar en el servidor."), "error");
              return false;
            }
          } else {
            write(
              KEYS.users,
              users.map((u) =>
                String(u.id) === String(userId) ? { ...u, accountStatus: ACCOUNT_STATUS.RECHAZADO, rejectionReason: reason } : u
              )
            );
          }
          saveNotification({
            userId: target.id,
            title: "Registro rechazado",
            body: `Su solicitud de registro fue rechazada. Motivo: ${reason}`
          });
          sendEmail({
            to: target.email,
            subject: "Registro rechazado - Antares Portal",
            body: `Hola ${target.name}, su solicitud de registro fue rechazada. Motivo: ${reason}. Contacte a soporte para más información.`
          });
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(target.id);
          notify(userMessage("accountRejected", target.name), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const userId = btn.dataset.id;
      if (!userId) return;
      if (state.session?.userId === userId) {
        notify(userMessage("userSelfDelete"), "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar usuario",
        message: "Esta accion eliminara el usuario de forma permanente.",
        confirmText: "Eliminar",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-user-delete", { userId });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar el usuario."), "error");
            return;
          }
          try {
            await writeAwaitServer(KEYS.users, read(KEYS.users, []).filter((user) => user.id !== userId));
          } catch (_e) {
            return;
          }
          notify(userMessage("userDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-user-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = String(btn.dataset.id || "");
      if (!userId) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => String(u.id) === String(userId));
      if (!target) return;
      const nextStatus = target.accountStatus === ACCOUNT_STATUS.RECHAZADO
        ? ACCOUNT_STATUS.APROBADO
        : ACCOUNT_STATUS.RECHAZADO;
      const nextLabel = nextStatus === ACCOUNT_STATUS.RECHAZADO ? "desactivar" : "activar";
      openConfirmModal({
        title: `${nextStatus === ACCOUNT_STATUS.RECHAZADO ? "Desactivar" : "Activar"} usuario`,
        message: `Se va a ${nextLabel} la cuenta de ${target.name}.`,
        confirmText: nextStatus === ACCOUNT_STATUS.RECHAZADO ? "Desactivar" : "Activar",
        onConfirm: async () => {
          const api = window.AntaresApi;
          if (api?.isConfigured?.() && typeof api.postJson === "function") {
            try {
              await api.postJson("/portal/admin-user-status", {
                userId,
                status: nextStatus
              });
            } catch (err) {
              notify(String(err?.message || "No fue posible actualizar el estado de la cuenta."), "error");
              return;
            }
          }
          portalPatchUsersCacheWithoutSyncKey(() => {
            write(
              KEYS.users,
              read(KEYS.users, []).map((u) =>
                String(u.id) === String(userId) ? { ...u, accountStatus: nextStatus } : u
              )
            );
          });
          try {
            await writeAwaitServer(KEYS.users, read(KEYS.users, []));
          } catch (_e) {
            return;
          }
          notify(`Usuario ${nextStatus === ACCOUNT_STATUS.RECHAZADO ? "desactivado" : "activado"} correctamente.`, "success");
          renderPortalView();
        }
      });
    });
  });

  const requestForm = document.getElementById("form-request");
  if (requestForm) {
    const originDepartment = requestForm.querySelector("#origin-department");
    const originCity = requestForm.querySelector("#origin-city");
    const destinationDepartment = requestForm.querySelector("#destination-department");
    const destinationCity = requestForm.querySelector("#destination-city");
    const pickupDate = requestForm.querySelector("#pickup-date");
    const pickupTime = requestForm.querySelector("#pickup-time");
    const deliveryDate = requestForm.querySelector("#delivery-date");
    const deliveryTime = requestForm.querySelector("#delivery-time");

    const fillCityOptions = (departmentSelect, citySelect) => {
      const department = String(departmentSelect?.value || "");
      const cities = COLOMBIA_LOCATIONS[department] || [];
      citySelect.innerHTML = `<option value="">Seleccione...</option>${cities
        .map((c) => `<option value="${c}">${c}</option>`)
        .join("")}`;
    };

    if (originDepartment && originCity) {
      originDepartment.addEventListener("change", () => fillCityOptions(originDepartment, originCity));
    }
    if (destinationDepartment && destinationCity) {
      destinationDepartment.addEventListener("change", () => fillCityOptions(destinationDepartment, destinationCity));
    }
    if (pickupDate) {
      const today = colombiaTodayIsoDate();
      pickupDate.min = today;
      if (deliveryDate) deliveryDate.min = today;
    }

    requestForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const user = currentUser();
      const data = Object.fromEntries(new FormData(requestForm).entries());
      const requestCompanyId = String(data.companyId || "").trim();
      if (!requestCompanyId) {
        notify("Debe seleccionar la empresa asociada.", "error");
        return;
      }
      const reqCompany =
        read(KEYS.companies, []).find((c) => String(c.id) === requestCompanyId) || null;
      if (!reqCompany) {
        notify("La empresa seleccionada no es válida.", "error");
        return;
      }
      if (user?.role === ROLES.CLIENT) {
        const ucid = String(user.companyId || "").trim();
        if (ucid && ucid !== requestCompanyId) {
          notify("No puede crear solicitudes para otra empresa.", "error");
          return;
        }
      }
      const pickupDateValue = String(data.pickupDate || "");
      const pickupTimeValue = String(data.pickupTime || "");
      const deliveryDateValue = String(data.deliveryDate || "");
      const deliveryTimeValue = String(data.deliveryTime || "");
      if (!pickupDateValue || !pickupTimeValue || !deliveryDateValue || !deliveryTimeValue) {
        notify(userMessage("requestDatetimeMissing"), "error");
        return;
      }
      const pickupAt = buildColombiaOffsetDateTime(pickupDateValue, pickupTimeValue);
      const etaDelivery = buildColombiaOffsetDateTime(deliveryDateValue, deliveryTimeValue);
      const pickupDateTime = new Date(pickupAt);
      const deliveryDateTime = new Date(etaDelivery);
      if (pickupDateTime.getTime() < Date.now()) {
        notify(userMessage("requestPastDatetime"), "error");
        return;
      }
      if (deliveryDateTime.getTime() <= pickupDateTime.getTime()) {
        notify(userMessage("requestDeliveryAfterPickup"), "error");
        return;
      }
      const {
        pickupDate,
        pickupTime,
        deliveryDate,
        deliveryTime,
        siteContactName,
        siteContactPhone,
        boxes,
        notes,
        ...payloadRest
      } = data;
      payloadRest.tripValue = 0;
      const contactName = String(siteContactName ?? "").trim();
      const contactPhone = String(siteContactPhone ?? "").trim();
      const boxesCount = Math.max(0, Number(boxes) || 0);
      const notesTrim = String(notes ?? "").trim();
      const files = requestForm.querySelector("input[name='attachments']").files;
      const attachments = [...files].map((f) => f.name);
      const all = reqRead();
      const usedRequestNumbers = new Set(all.map((r) => String(r.requestNumber || "").trim()).filter(Boolean));
      const requestNumber = makeRequestNumber(usedRequestNumbers);
      const localRow = {
        id: newUuidV4(),
        requestNumber,
        clientUserId: user.id,
        clientName: reqCompany.name || user.company || "",
        clientCompanyId: reqCompany.id,
        requestedByName: user.name,
        ...payloadRest,
        contactName,
        contactPhone,
        siteContactName: contactName,
        siteContactPhone: contactPhone,
        boxesCount,
        boxes: boxesCount,
        notes: notesTrim,
        observations: notesTrim || null,
        vehicleType: "",
        pickupAt,
        etaDelivery,
        attachments,
        status: STATUS.PENDIENTE,
        createdAt: nowIso(),
        approvedAt: null,
        approvedBy: null,
        trip: null,
        standbyChargeTotal: 0,
        standbyEvents: [],
        rejectionReason: ""
      };
      let rowToSave = localRow;
      if (window.AntaresApi?.isConfigured?.() && window.DomainModules?.requests?.createViaApi) {
        try {
          rowToSave = await window.DomainModules.requests.createViaApi(localRow, pickupAt);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
      }
      all.unshift(rowToSave);
      try {
        await reqWriteAwait(all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la solicitud en el servidor."), "error");
        return;
      }

      const adminUsers = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
      adminUsers.forEach((admin) => {
        saveNotification({
          userId: admin.id,
          title: "Nueva solicitud pendiente",
          body: `Solicitud ${requestNumber} de ${rowToSave.clientName || user.name || ""}`
        });
        sendEmail({
          to: admin.email,
          subject: "Nueva solicitud de viaje",
          body: `Revisar solicitud ${requestNumber}`
        });
      });
      try {
        await writeAwaitServer(KEYS.notifications, read(KEYS.notifications, []));
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}

      const actingUser = currentUser();
      if (actingUser?.role === ROLES.ADMIN) {
        suppressSelfInboxPollToastIfRecipientIsCurrentUser(actingUser.id);
      }
      notify(userMessage("requestCreated"), "success");
      renderPortalView();
    });
  }

  const payrollFiltersForm = document.getElementById("payroll-filters");
  if (payrollFiltersForm) {
    payrollFiltersForm.querySelectorAll("select").forEach((select) => {
      select.addEventListener("change", () => {
        state.payrollFilters = state.payrollFilters || { period: "all", employee: "", status: "all" };
        const key = String(select.name || "");
        if (!key) return;
        state.payrollFilters[key] = String(select.value || "");
        renderPortalView();
      });
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='payroll-clear-filters']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollFilters = { period: "all", employee: "", status: "all" };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-focus-pending']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollFilters = { ...(state.payrollFilters || {}), status: "pending" };
      state.payrollUi = { ...(state.payrollUi || {}), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-focus-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollFilters = { ...(state.payrollFilters || {}), status: "all" };
      state.payrollUi = { ...(state.payrollUi || {}), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-sort-runs']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollUi = state.payrollUi || { runSort: "recent", workspace: "overview" };
      state.payrollUi.runSort = String(btn.dataset.sort || "recent");
      state.payrollUi.workspace = "data";
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='notif-read']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = String(btn.dataset.id || "");
      const list = read(KEYS.notifications, []);
      try {
        await writeAwaitServer(
          KEYS.notifications,
          list.map((n) => (n.id === id ? { ...n, readAt: nowIso() } : n))
        );
      } catch (_e) {
        return;
      }
      renderPortalView();
      updateNotificationBadge();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='notif-read-all']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const list = read(KEYS.notifications, []);
      const ts = nowIso();
      try {
        await writeAwaitServer(
          KEYS.notifications,
          list.map((n) => (n.readAt ? n : { ...n, readAt: ts }))
        );
      } catch (_e) {
        return;
      }
      renderPortalView();
      updateNotificationBadge();
    });
  });

  /** Eliminar una notificación puntual (solo borrado local, no sale de la bandeja a otros usuarios). */
  nodes.viewRoot.querySelectorAll("[data-action='notif-delete']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      openConfirmModal({
        title: "Eliminar notificación",
        message: "¿Quieres eliminar esta notificación de tu bandeja? Esta acción no se puede deshacer.",
        confirmText: "Eliminar",
        onConfirm: async () => {
          const list = read(KEYS.notifications, []);
          await writeAwaitServer(KEYS.notifications, list.filter((n) => n.id !== id));
          notify("Notificación eliminada.", "success");
          renderPortalView();
          updateNotificationBadge();
        }
      });
    });
  });

  /** Eliminar todas las notificaciones ya leídas (mantiene las pendientes). */
  nodes.viewRoot.querySelectorAll("[data-action='notif-clear-read']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirmModal({
        title: "Eliminar leídas",
        message: "¿Eliminar todas las notificaciones ya leídas de tu bandeja?",
        confirmText: "Eliminar leídas",
        onConfirm: async () => {
          const list = read(KEYS.notifications, []);
          const user = currentUser();
          const isOwn = (n) => user && (String(n.userId || "") === String(user.id || "") || user.role === ROLES.ADMIN);
          const remaining = list.filter((n) => !(n.readAt && isOwn(n)));
          const removed = list.length - remaining.length;
          await writeAwaitServer(KEYS.notifications, remaining);
          notify(removed ? `${removed} notificaciones eliminadas.` : "No había notificaciones leídas.", "success");
          renderPortalView();
          updateNotificationBadge();
        }
      });
    });
  });

  /** Vaciar bandeja completa del usuario (admins limpian todas; otros, las propias). */
  nodes.viewRoot.querySelectorAll("[data-action='notif-clear-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirmModal({
        title: "Vaciar bandeja",
        message: "¿Eliminar todas las notificaciones (leídas y sin leer)? Esta acción no se puede deshacer.",
        confirmText: "Vaciar bandeja",
        onConfirm: async () => {
          const list = read(KEYS.notifications, []);
          const user = currentUser();
          const isOwn = (n) => user && (String(n.userId || "") === String(user.id || "") || user.role === ROLES.ADMIN);
          const remaining = list.filter((n) => !isOwn(n));
          const removed = list.length - remaining.length;
          await writeAwaitServer(KEYS.notifications, remaining);
          notify(removed ? `${removed} notificaciones eliminadas.` : "Bandeja ya estaba vacía.", "success");
          renderPortalView();
          updateNotificationBadge();
        }
      });
    });
  });

  const calendarFiltersForm = document.getElementById("calendar-filters");
  if (calendarFiltersForm) {
    calendarFiltersForm.querySelectorAll("select").forEach((select) => {
      select.addEventListener("change", () => {
        state.calendarFilters = state.calendarFilters || { driver: "", vehicle: "", status: "" };
        const key = String(select.name || "");
        if (!key) return;
        state.calendarFilters[key] = String(select.value || "");
        renderPortalView();
      });
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='cal-clear-filters']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.calendarFilters = { driver: "", vehicle: "", status: "" };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cal-nav']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.dataset.step || "0", 10) || 0;
      const base = state.calendarFocus instanceof Date && !Number.isNaN(state.calendarFocus.getTime())
        ? new Date(state.calendarFocus)
        : new Date();
      base.setHours(12, 0, 0, 0);
      base.setMonth(base.getMonth() + step);
      state.calendarFocus = base;
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cal-today']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.calendarFocus = new Date();
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cal-event']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      const req = reqRead().find((r) => r.id === id);
      if (!req?.trip) return;
      openInfoModal({
        title: `Viaje ${req.trip.tripNumber || ""}`,
        subtitle: `${req.clientName || ""} · ${prettyStatus(req.status, "trip")}`,
        bodyHtml: `<div class="dash-grid">
          <div><strong>Cliente:</strong> ${req.clientName || "-"}</div>
          <div><strong>Ruta:</strong> ${req.trip.route || formatRoute(req)}</div>
          <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
          <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
          <div><strong>Camión:</strong> ${req.trip.vehiclePlate} (${req.trip.vehicleType || "-"})</div>
          <div><strong>Conductor:</strong> ${req.trip.driverName} · ${req.trip.driverPhone || "-"}</div>
        </div>`
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = reqRead().find((r) => r.id === btn.dataset.id);
      if (!req) return;
      const tripDetail = req.trip
        ? `<div class="dash-grid" style="margin-top:0.6rem">
            <div><strong>Viaje:</strong> ${req.trip.tripNumber}</div>
            <div><strong>Camion:</strong> ${req.trip.vehiclePlate} (${req.trip.vehicleType || "-"})</div>
            <div><strong>Conductor:</strong> ${req.trip.driverName} · ${req.trip.driverPhone || "-"}</div>
            <div><strong>Asignado por:</strong> ${req.trip.assignedBy || req.approvedBy || "-"}</div>
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
          </div>`
        : `<p class="muted">Aun no tiene viaje asignado.</p>`;
      openInfoModal({
        title: `Solicitud ${req.requestNumber || req.id}`,
        subtitle: `${prettyStatus(req.status, "request")}`,
        bodyHtml: `
          <div class="dash-grid">
            <div><strong>Ruta:</strong> ${formatRoute(req)}</div>
            <div><strong>Creada por:</strong> ${req.requestedByName || "-"}</div>
            <div><strong>Carga:</strong> ${req.cargoDescription}</div>
            <div><strong>Peso/Volumen:</strong> ${parseNum(req.weightKg).toLocaleString("es-CO")} kg · ${parseNum(req.boxes).toLocaleString("es-CO")} cajas</div>
            <div><strong>Valor viaje:</strong> $${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}</div>
            <div><strong>Adjuntos:</strong> ${(req.attachments || []).join(", ") || "Ninguno"}</div>
            ${parseNum(req.standbyChargeTotal) > 0 ? `<div><strong>Standby:</strong> $${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</div>` : ""}
            ${req.rejectionReason ? `<div class="full"><strong>Motivo rechazo:</strong> ${req.rejectionReason}</div>` : ""}
          </div>
          <hr style="border:0;border-top:1px solid var(--line);margin:0.8rem 0;" />
          <h3 style="margin:0 0 0.4rem;">Detalle del viaje</h3>
          ${tripDetail}
        `
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = reqRead();
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req || req.status !== STATUS.PENDIENTE) return;
      openEditModal({
        title: "Editar observaciones de solicitud",
        subtitle: req.requestNumber || req.id,
        submitText: "Guardar observaciones",
        fields: [{ name: "notes", label: "Observaciones", value: req.notes || "", required: false }],
        onSubmit: async (form) => {
          const updated = requests.map((r) => (r.id === req.id ? { ...r, notes: String(form.notes || "").trim() } : r));
          try {
            await reqWriteAwait(updated);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar las observaciones en el servidor."), "error");
            return false;
          }
          recalculateResourceAvailability();
          notify(userMessage("observationsUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cancel']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const requests = reqRead();
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req || req.status !== STATUS.PENDIENTE) return;
      const updated = requests.map((r) => (r.id === req.id ? { ...r, status: STATUS.CANCELADA } : r));
      try {
        await reqWriteAwait(updated);
      } catch (err) {
        notify(String(err?.message || "No fue posible cancelar la solicitud en el servidor."), "error");
        return;
      }
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approve']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actor = currentUser();
      const requestId = String(btn.dataset.id || "");
      const request = reqRead().find((item) => item.id === requestId);
      if (!request) return;
      const needsTermoking = serviceTypeRequiresRefrigeration(request.serviceType);
      const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
      const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
      const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
      const driverCandidates = getDriverCandidatesForRequest(request, requestId);
      const tripRateUi = buildTripRateModalFields(request, { required: false });
      openEditModal({
        title: "Aprobar solicitud",
        subtitle: `${request.requestNumber || request.id} · ${parseNum(request.weightKg).toLocaleString("es-CO")} kg`,
        submitText: "Confirmar aprobacion",
        afterMount: tripRateUi.afterMount,
        fields: [
          {
            name: "mode",
            label: "Modo de aprobacion",
            type: "select",
            required: true,
            value: "pending",
            options: [
              { value: "pending", label: "Aprobar y dejar pendiente asignacion manual" },
              { value: "assign_now", label: "Aprobar y asignar camion + conductor ahora" }
            ]
          },
          {
            name: "vehicleId",
            label: needsTermoking ? "Camion con Termoking (refrigerado)" : "Selecciona camion compatible",
            type: "select",
            required: false,
            options: [
              {
                value: "",
                label: vehicleCandidates.length
                  ? "Sin asignar por ahora"
                  : needsTermoking
                    ? "No hay camiones Termoking disponibles para tipo/peso/fecha"
                    : "No hay camiones compatibles para el tipo/peso"
              },
              ...vehicleCandidates.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.plate} · ${vehicle.type} · ${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg · ${vehicle.refrigerated ? "Refrigerado" : "Seco"} · SOAT ${docExpiryStatus(vehicle.soatExpeditionDate).label} · Tec ${docExpiryStatus(vehicle.techInspectionExpeditionDate).label}${vehicle.isBusy ? " · OCUPADO" : ""}${vehicle.hasExpiredDocs ? " · DOCUMENTOS VENCIDOS" : ""}`
              }))
            ]
          },
          {
            name: "driverId",
            label: "Selecciona conductor disponible",
            type: "select",
            required: false,
            options: [
              { value: "", label: driverCandidates.length ? "Sin asignar por ahora" : "No hay conductores registrados" },
              ...driverCandidates.map((driver) => ({
              value: driver.id,
              label: `${driver.name} · Lic ${driver.license || "-"} · vence ${driver.licenseExpiry || "-"} · ${driver.phone || ""}${driver.isBusy ? " · OCUPADO" : ""}${driver.hasExpiredDocs ? " · LICENCIA VENCIDA" : ""}`
              }))
            ]
          },
          ...tripRateUi.fields
        ],
        onSubmit: (form) => {
          const selectedMode = String(form.mode || "pending");
          const vehicleId = String(form.vehicleId || "").trim();
          const driverId = String(form.driverId || "").trim();
          const tripValue = parseNum(form.tripValue);
          const mode = vehicleId && driverId ? "assign_now" : selectedMode;
          if (mode === "assign_now" && (!vehicleId || !driverId)) {
            notify(userMessage("assignSelectResources"), "error");
            return false;
          }
          if (mode === "assign_now" && tripValue <= 0) {
            notify(userMessage("assignPriceRequired"), "error");
            return false;
          }
          if (mode === "assign_now" && (!compatibleVehicles.some((v) => v.id === vehicleId) || !compatibleDrivers.some((d) => d.id === driverId))) {
            notify(userMessage("assignResourcesBusy"), "error");
            return false;
          }
          const ok = mode === "assign_now"
            ? approveRequest(requestId, actor?.name || "Administrador", false, vehicleId, driverId, tripValue)
            : approveRequest(requestId, actor?.name || "Administrador", true);
          if (!ok) return false;
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(request.clientUserId);
          notify(
            mode === "assign_now"
              ? userMessage("requestApprovedAssigned")
              : userMessage("requestApprovedPending"),
            "success"
          );
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-route-rate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const encoded = String(btn.dataset.rateKey || "");
      const key = decodeURIComponent(encoded);
      if (!key) return;
      openConfirmModal({
        title: "Quitar tarifa de trayecto",
        message: "Esta ruta dejara de sugerir precio al asignar viajes.",
        confirmText: "Quitar tarifa",
        onConfirm: async () => {
          const rates = { ...getTripRouteRatesNormalized() };
          delete rates[key];
          try {
            await writeAwaitServer(KEYS.tripRouteRates, rates);
          } catch (err) {
            notify(String(err?.message || "No se pudo actualizar las tarifas en el servidor."), "error");
            return;
          }
          notify(userMessage("routeRateDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  const createTripForm = document.getElementById("form-create-trip");
  if (createTripForm) {
    const select = createTripForm.querySelector("select[name='requestId']");
    const preview = createTripForm.querySelector("#trip-request-preview");
    const setPreview = () => {
      const option = select?.selectedOptions?.[0];
      if (!option || !preview) return;
      const createdBy = option.getAttribute("data-createdby") || "-";
      const company = option.getAttribute("data-company") || "-";
      const route = option.getAttribute("data-route") || "-";
      const createdByNode = preview.querySelector("[data-preview='createdBy']");
      const companyNode = preview.querySelector("[data-preview='company']");
      const routeNode = preview.querySelector("[data-preview='route']");
      if (createdByNode) createdByNode.textContent = createdBy;
      if (companyNode) companyNode.textContent = company;
      if (routeNode) routeNode.textContent = route;
    };
    if (select) {
      select.addEventListener("change", setPreview);
      setPreview();
    }

    createTripForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(createTripForm).entries());
      const requestId = String(data.requestId || "");
      if (!requestId) {
        notify(userMessage("bulkSelectPending"), "error");
        return;
      }
      const request = reqRead().find((item) => item.id === requestId);
      if (!request) {
        notify(userMessage("bulkRequestMissing"), "error");
        return;
      }
      const needsTermoking = serviceTypeRequiresRefrigeration(request.serviceType);
      const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
      const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
      const tripRateUi = buildTripRateModalFields(request, { required: true });
      openEditModal({
        title: "Asignar viaje",
        subtitle: `${request.requestNumber || request.id} · ${String(request.serviceType || "").trim() || "Servicio"}`,
        submitText: "Crear viaje",
        afterMount: tripRateUi.afterMount,
        fields: [
          {
            name: "vehicleId",
            label: needsTermoking ? "Camion (solo Termoking / refrigerado)" : "Camion",
            type: "select",
            required: true,
            options: compatibleVehicles.length
              ? compatibleVehicles.map((vehicle) => ({
                value: vehicle.id,
                label: `${vehicle.plate} · ${vehicle.type} · ${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg · ${vehicle.refrigerated ? "Refrigerado" : "Seco"} · SOAT ${docExpiryStatus(vehicle.soatExpeditionDate).label} · Tec ${docExpiryStatus(vehicle.techInspectionExpeditionDate).label}`
              }))
              : [
                  {
                    value: "",
                    label: needsTermoking
                      ? "No hay camiones Termoking disponibles"
                      : "No hay camiones compatibles disponibles"
                  }
                ]
          },
          {
            name: "driverId",
            label: "Conductor",
            type: "select",
            required: true,
            options: compatibleDrivers.length
              ? compatibleDrivers.map((driver) => ({
                value: driver.id,
                label: `${driver.name} · Lic ${driver.license || "-"} · vence ${driver.licenseExpiry || "-"}`
              }))
              : [{ value: "", label: "No hay conductores compatibles disponibles" }]
          },
          ...tripRateUi.fields
        ],
        onSubmit: (form) => {
          if (!compatibleVehicles.length || !compatibleDrivers.length) {
            notify(userMessage("tripAssignNoMatch"), "error");
            return false;
          }
          const tripValue = parseNum(form.tripValue);
          if (tripValue <= 0) {
            notify(userMessage("assignPriceRequired"), "error");
            return false;
          }
          const ok = approveRequest(
            requestId,
            currentUser()?.name || "Administrador",
            false,
            String(form.vehicleId || ""),
            String(form.driverId || ""),
            tripValue
          );
          if (!ok) return false;
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(request.clientUserId);
          notify(userMessage("tripCreatedAssigned"), "success");
          renderPortalView();
          return true;
        }
      });
      return;
    });
  }

  const routeRateFormEl = document.getElementById("form-route-rate");
  if (routeRateFormEl) {
    const originDept = routeRateFormEl.querySelector("#route-rate-origin-dept");
    const originCity = routeRateFormEl.querySelector("#route-rate-origin-city");
    const destDept = routeRateFormEl.querySelector("#route-rate-dest-dept");
    const destCity = routeRateFormEl.querySelector("#route-rate-dest-city");
    const fillRouteRateCities = (departmentSelect, citySelect) => {
      const department = String(departmentSelect?.value || "");
      const cities = COLOMBIA_LOCATIONS[department] || [];
      citySelect.innerHTML = `<option value="">Seleccione...</option>${cities
        .map((c) => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`)
        .join("")}`;
    };
    if (originDept && originCity) {
      originDept.addEventListener("change", () => fillRouteRateCities(originDept, originCity));
    }
    if (destDept && destCity) {
      destDept.addEventListener("change", () => fillRouteRateCities(destDept, destCity));
    }
    routeRateFormEl.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(routeRateFormEl).entries());
      const companyIds = [...new FormData(routeRateFormEl).getAll("rateClientCompanies")]
        .map((v) => String(v || "").trim())
        .filter(Boolean);
      const od = String(data.originDepartment || "").trim();
      const oc = String(data.originCity || "").trim();
      const dd = String(data.destinationDepartment || "").trim();
      const dc = String(data.destinationCity || "").trim();
      const tripRateCop = parseNum(data.tripRateCop);
      if (!od || !oc || !dd || !dc) {
        notify(userMessage("routeRateSelectRoute"), "error");
        return;
      }
      if (tripRateCop <= 0) {
        notify(userMessage("routeRateInvalidCop"), "error");
        return;
      }
      const routeKey = buildTripRouteRateKey(od, oc, dd, dc);
      const normalized = getTripRouteRatesNormalized();
      const storageKey = tripRateStorageKey(routeKey, companyIds);
      const next = { ...normalized, [storageKey]: { value: tripRateCop, companyIds } };
      try {
        await writeAwaitServer(KEYS.tripRouteRates, next);
      } catch (err) {
        notify(String(err?.message || userMessage("genericError")), "error");
        return;
      }
      notify(userMessage("routeRateSaved"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='trip-detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = reqRead().find((r) => r.id === btn.dataset.id);
      if (!req || !req.trip) return;
      openInfoModal({
        title: `Viaje ${req.trip.tripNumber}`,
        subtitle: prettyStatus(req.status, "trip"),
        bodyHtml: `
          <div class="dash-grid">
            <div><strong>Solicitud:</strong> ${req.requestNumber || req.id}</div>
            <div><strong>Cliente:</strong> ${req.clientName || "-"}</div>
            <div><strong>Ruta:</strong> ${formatRoute(req)}</div>
            <div><strong>Carga:</strong> ${req.cargoDescription || "-"} · ${parseNum(req.weightKg).toLocaleString("es-CO")} kg</div>
            <div><strong>Valor viaje:</strong> $${parseNum(req.tripValue || 0).toLocaleString("es-CO")}</div>
            <div><strong>Camion:</strong> ${req.trip.vehiclePlate} (${req.trip.vehicleType || "-"})</div>
            <div><strong>Conductor:</strong> ${req.trip.driverName} · ${req.trip.driverPhone || "-"}</div>
            <div><strong>Asignado por:</strong> ${req.trip.assignedBy || req.approvedBy || "-"}</div>
            <div><strong>Fecha asignacion:</strong> ${fmtDate(req.trip.assignedAt || req.approvedAt || req.createdAt)}</div>
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
            ${req.closedAt ? `<div><strong>Cierre:</strong> ${fmtDate(req.closedAt)}</div>` : ""}
            ${req.trip.invoice ? `<div><strong>Factura:</strong> ${req.trip.invoice.number} · $${parseNum(req.trip.invoice.total).toLocaleString("es-CO")}</div>` : ""}
          </div>
          ${parseNum(req.standbyChargeTotal) > 0 ? `<p><strong>Standby acumulado:</strong> $${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</p>` : ""}
        `
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='trip-invoice']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openTripInvoicePdf(String(btn.dataset.id || ""));
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='generate-report']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = String(btn.dataset.report || "");
      const format = String(btn.dataset.format || "pdf");
      const actor = currentUser();
      if (!canAccessReport(actor, reportId)) {
        notify(userMessage("reportNoPermission"), "error");
        return;
      }
      const report = buildReportDataset(reportId, actor);
      if (format === "excel") {
        downloadCsv(report.fileName || "reporte.csv", report.rows || [], report.columns || []);
        notify(userMessage("reportCsvExported"), "success");
        return;
      }
      openReportPdf(report.title || "Reporte", report.columns || [], report.rows || []);
      notify(userMessage("reportPdfOk"), "success");
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='trip-status']").forEach((select) => {
    select.addEventListener("change", () => {
      const actor = currentUser();
      transitionRequestStatus(select.dataset.id, select.value, actor?.name || "Operación");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openEditModal({
        title: "Rechazar solicitud",
        subtitle: "Indica motivo para trazabilidad",
        submitText: "Rechazar solicitud",
        fields: [{ name: "reason", label: "Motivo", value: "", required: true }],
        onSubmit: async (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          try {
            await rejectRequest(btn.dataset.id, reason, currentUser().name);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el rechazo en el servidor."), "error");
            return false;
          }
          const rejectedReq = reqRead().find((r) => r.id === btn.dataset.id);
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(rejectedReq?.clientUserId);
          notify(userMessage("requestRejected"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = reqRead();
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req) return;
      const [pickupDate, pickupTime] = String(toInputDate(req.pickupAt) || "").split("T");
      const [deliveryDate, deliveryTime] = String(toInputDate(req.etaDelivery || req.pickupAt) || "").split("T");
      openEditModal({
        title: "Editar solicitud",
        subtitle: req.requestNumber || req.id,
        submitText: "Actualizar solicitud",
        fields: [
          { name: "pickupDate", label: "Fecha de recogida", type: "date", value: pickupDate, required: true },
          { name: "pickupTime", label: "Hora de recogida", type: "time", value: pickupTime, required: true },
          { name: "deliveryDate", label: "Fecha de entrega", type: "date", value: deliveryDate, required: true },
          { name: "deliveryTime", label: "Hora de entrega", type: "time", value: deliveryTime, required: true }
        ],
        onSubmit: async (form) => {
          const newPickup = `${form.pickupDate}T${form.pickupTime}`;
          const newDelivery = `${form.deliveryDate}T${form.deliveryTime}`;
          if (new Date(newDelivery).getTime() <= new Date(newPickup).getTime()) {
            notify(userMessage("requestScheduleInvalid"), "error");
            return false;
          }
          try {
            await reqWriteAwait(requests.map((r) => (r.id === req.id ? { ...r, pickupAt: newPickup, etaDelivery: newDelivery } : r)));
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar los cambios en el servidor."), "error");
            return false;
          }
          notify(userMessage("requestUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const requestId = String(btn.dataset.id || "");
      openConfirmModal({
        title: "Eliminar solicitud",
        message: "Se eliminara la solicitud seleccionada.",
        confirmText: "Eliminar",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-request-delete", { requestId });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar la solicitud en el servidor."), "error");
            return;
          }
          await reqWriteAwait(reqRead().filter((r) => String(r.id) !== requestId));
          recalculateResourceAvailability();
          notify(userMessage("requestDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-trip']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const requestId = String(btn.dataset.id || "");
      if (!requestId) return;
      openConfirmModal({
        title: "Eliminar viaje",
        message: "La solicitud quedara aprobada pendiente de asignacion manual.",
        confirmText: "Eliminar viaje",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-clear-trip", { requestId });
          } catch (err) {
            notify(String(err?.message || "No fue posible quitar el viaje en el servidor."), "error");
            return;
          }
          await reqWriteAwait(
            reqRead().map((request) =>
              request.id === requestId
                ? {
                  ...request,
                  status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
                  trip: null,
                  deliveredAt: null,
                  closedAt: null
                }
                : request
            )
          );
          recalculateResourceAvailability();
          notify(userMessage("tripRemoved"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const vehicleId = String(btn.dataset.id || "");
      if (!vehicleId) return;
      openConfirmModal({
        title: "Eliminar camion",
        message: "Se eliminara del catalogo y se limpiara su referencia en viajes historicos.",
        confirmText: "Eliminar camion",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-vehicle-delete", { vehicleId });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar el vehiculo en el servidor."), "error");
            return;
          }
          const nextVehicleList = read(KEYS.vehicles, []).filter((vehicle) => String(vehicle.id) !== vehicleId);
          try {
            await writeAwaitServer(KEYS.vehicles, nextVehicleList);
          } catch (_e) {
            return;
          }
          await reqWriteAwait(
            reqRead().map((request) => {
              if (!request.trip || String(request.trip.vehicleId || "") !== vehicleId) return request;
              return {
                ...request,
                trip: {
                  ...request.trip,
                  vehicleId: null,
                  vehiclePlate: "CAMION ELIMINADO"
                }
              };
            })
          );
          recalculateResourceAvailability();
          notify(userMessage("vehicleDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const driverId = String(btn.dataset.id || "");
      if (!driverId) return;
      openConfirmModal({
        title: "Eliminar conductor",
        message: "Se eliminara del catalogo y se limpiara su referencia en viajes historicos.",
        confirmText: "Eliminar conductor",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-driver-delete", { driverId });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar el conductor en el servidor."), "error");
            return;
          }
          const nextDrivers = read(KEYS.drivers, []).filter((driver) => String(driver.id) !== driverId);
          try {
            await writeAwaitServer(KEYS.drivers, nextDrivers);
          } catch (_e) {
            return;
          }
          await reqWriteAwait(
            reqRead().map((request) => {
              if (!request.trip || String(request.trip.driverId || "") !== driverId) return request;
              return {
                ...request,
                trip: {
                  ...request.trip,
                  driverId: null,
                  driverName: "CONDUCTOR ELIMINADO",
                  driverPhone: "-"
                }
              };
            })
          );
          recalculateResourceAvailability();
          notify(userMessage("driverDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  const vehicleForm = document.getElementById("form-vehicle");
  if (vehicleForm) {
    bindVehicleDocExpiryAutoFill(vehicleForm);
    vehicleForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(vehicleForm).entries());
      const plate = String(data.plate || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!/^[A-Z]{3}[0-9]{3}$/.test(plate)) {
        notify(userMessage("vehiclePlateInvalid"), "error");
        return;
      }
      const modelYear = parseNum(data.year);
      const currentYear = new Date().getFullYear();
      if (modelYear < 1990 || modelYear > currentYear + 1) {
        notify(userMessage("vehicleYearInvalid"), "error");
        return;
      }
      let soatExpeditionDate = data.soatExpeditionDate;
      let soatExpiryDate = data.soatExpiryDate;
      if (soatExpeditionDate && (!soatExpiryDate || !String(soatExpiryDate).trim())) {
        soatExpiryDate = addCalendarYearsIsoDate(soatExpeditionDate, 1) || soatExpiryDate;
      }
      let techInspectionExpeditionDate = data.techInspectionExpeditionDate;
      let techInspectionExpiryDate = data.techInspectionExpiryDate;
      if (techInspectionExpeditionDate && (!techInspectionExpiryDate || !String(techInspectionExpiryDate).trim())) {
        techInspectionExpiryDate = addCalendarYearsIsoDate(techInspectionExpeditionDate, 1) || techInspectionExpiryDate;
      }
      const list = read(KEYS.vehicles, []);
      list.push({
        id: newUuidV4(),
        plate,
        brand: String(data.brand || "").trim(),
        model: String(data.model || "").trim(),
        year: modelYear,
        type: data.type,
        color: String(data.color || "").trim(),
        capacityKg: parseNum(data.capacityKg),
        refrigerated: data.refrigerated === "true",
        bodyType: String(data.bodyType || "").trim(),
        fuelType: String(data.fuelType || "").trim(),
        axleConfig: String(data.axleConfig || "").trim(),
        engineNumber: String(data.engineNumber || "").trim(),
        vin: String(data.vin || "").trim().toUpperCase(),
        ownershipCard: String(data.ownershipCard || "").trim(),
        soatExpeditionDate,
        soatExpiryDate,
        techInspectionExpeditionDate,
        techInspectionExpiryDate,
        rcPolicyContract: String(data.rcPolicyContract || "").trim(),
        rcPolicyExtra: String(data.rcPolicyExtra || "").trim(),
        rcPolicyExpiry: data.rcPolicyExpiry || "",
        hasGps: data.hasGps === "true",
        gpsProvider: String(data.gpsProvider || "").trim(),
        ownerName: String(data.ownerName || "").trim(),
        ownerTaxId: String(data.ownerTaxId || "").trim(),
        available: true,
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.vehicles, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
        return;
      }
      notify(userMessage("vehicleRegistered"), "success");
      renderPortalView();
    });
  }

  const driverForm = document.getElementById("form-driver");
  if (driverForm) {
    attachDepartmentCitySelects(driverForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    driverForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(driverForm).entries());
      if (!/^\d{10,15}$/.test(String(data.phone || "").trim())) {
        notify(userMessage("driverPhoneInvalid"), "error");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.idDoc = docValidation.normalized;
      if (new Date(String(data.licenseExpiry || "")).getTime() <= Date.now()) {
        notify(userMessage("driverLicenseRegister"), "error");
        return;
      }
      if (actor?.role !== ROLES.ADMIN) {
        await queueApproval({
          type: "create_driver",
          title: `Creacion de conductor ${data.name}`,
          payload: data,
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify(userMessage("driverApprovalQueued"), "info");
        renderPortalView();
        return;
      }
      const list = read(KEYS.drivers, []);
      list.push({ id: newUuidV4(), ...data, available: true, hiredAt: nowIso() });
      try {
        await writeAwaitServer(KEYS.drivers, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el conductor en el servidor."), "error");
        return;
      }
      const employees = read(KEYS.payrollEmployees, []);
      const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(data.idDoc || ""));
      if (!existsEmployee) {
        employees.push({
          id: newUuidV4(),
          name: data.name,
          idDoc: data.idDoc,
          documentType: data.documentType,
          position: "Conductor",
          contractType: data.contractType || "Indefinido",
          workerRole: "conductor",
          city: data.city || "",
          address: data.address || "",
          phone: data.phone || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || "",
          companyId: data.companyId || "",
          baseSalary: parseNum(data.baseSalary),
          startDate: data.startDate || nowIso().slice(0, 10)
        });
        try {
          await writeAwaitServer(KEYS.payrollEmployees, employees);
        } catch (err) {
          notify(String(err?.message || "Conductor guardado; no fue posible crear el vínculo de empleado en el servidor."), "error");
        }
      }
      notify(userMessage("driverCreated"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-vehicle']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const all = read(KEYS.vehicles, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      await setVehicleAvailability(target.id, !target.available);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vehicles, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      const colorOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.vehicleColors.map((c) => ({ value: c, label: c }))];
      const bodyOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.bodyTypes.map((b) => ({ value: b, label: b }))];
      const fuelOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.fuelTypes.map((f) => ({ value: f, label: f }))];
      const axleOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.axleConfig.map((a) => ({ value: a, label: a }))];
      openEditModal({
        title: "Editar camión",
        subtitle: target.plate,
        submitText: "Guardar cambios",
        fields: [
          { name: "plate", label: "Placa", value: target.plate, required: true },
          { name: "brand", label: "Marca", value: target.brand || "", required: true },
          { name: "model", label: "Línea/Modelo", value: target.model || "", required: true },
          { name: "year", label: "Año modelo", type: "number", value: target.year || "", required: true },
          { name: "color", label: "Color", type: "select", value: target.color || "", options: colorOpts },
          { name: "capacityKg", label: "Capacidad (kg)", type: "number", value: target.capacityKg, required: true },
          { name: "bodyType", label: "Carrocería", type: "select", value: target.bodyType || "", options: bodyOpts },
          { name: "fuelType", label: "Combustible", type: "select", value: target.fuelType || "", options: fuelOpts },
          { name: "axleConfig", label: "Ejes", type: "select", value: target.axleConfig || "", options: axleOpts },
          { name: "engineNumber", label: "N° motor", value: target.engineNumber || "" },
          { name: "vin", label: "Chasis (VIN)", value: target.vin || "" },
          { name: "ownershipCard", label: "Tarjeta propiedad N°", value: target.ownershipCard || "" },
          {
            name: "refrigerated",
            label: "Termoking (refrigerado)",
            type: "select",
            value: target.refrigerated ? "true" : "false",
            options: [
              { value: "true", label: "Sí, equipo Termoking" },
              { value: "false", label: "No, carga seca" }
            ]
          },
          { name: "soatExpeditionDate", label: "Expedición SOAT", type: "date", value: target.soatExpeditionDate, required: true },
          { name: "soatExpiryDate", label: "Vence SOAT", type: "date", value: target.soatExpiryDate || "" },
          { name: "techInspectionExpeditionDate", label: "Expedición tecnomecánica", type: "date", value: target.techInspectionExpeditionDate, required: true },
          { name: "techInspectionExpiryDate", label: "Vence tecnomecánica", type: "date", value: target.techInspectionExpiryDate || "" },
          { name: "rcPolicyContract", label: "Póliza RC contractual N°", value: target.rcPolicyContract || "" },
          { name: "rcPolicyExtra", label: "Póliza RC extracontractual N°", value: target.rcPolicyExtra || "" },
          { name: "rcPolicyExpiry", label: "Vence pólizas RCP", type: "date", value: target.rcPolicyExpiry || "" },
          {
            name: "hasGps",
            label: "GPS satelital",
            type: "select",
            value: target.hasGps ? "true" : "false",
            options: [{ value: "true", label: "Sí" }, { value: "false", label: "No" }]
          },
          { name: "gpsProvider", label: "Proveedor GPS", value: target.gpsProvider || "" },
          { name: "ownerName", label: "Propietario", value: target.ownerName || "" },
          { name: "ownerTaxId", label: "NIT/Cédula propietario", value: target.ownerTaxId || "" }
        ],
        afterMount: (formEl) => bindVehicleDocExpiryAutoFill(formEl),
        onSubmit: async (form) => {
          let soatExpiryDate = form.soatExpiryDate || "";
          if (form.soatExpeditionDate && (!soatExpiryDate || !String(soatExpiryDate).trim())) {
            soatExpiryDate = addCalendarYearsIsoDate(form.soatExpeditionDate, 1) || soatExpiryDate;
          }
          let techInspectionExpiryDate = form.techInspectionExpiryDate || "";
          if (
            form.techInspectionExpeditionDate &&
            (!techInspectionExpiryDate || !String(techInspectionExpiryDate).trim())
          ) {
            techInspectionExpiryDate =
              addCalendarYearsIsoDate(form.techInspectionExpeditionDate, 1) || techInspectionExpiryDate;
          }
          const nextVehicles = all.map((v) =>
              v.id === target.id
                ? {
                    ...v,
                    plate: String(form.plate || "").toUpperCase(),
                    brand: String(form.brand || "").trim(),
                    model: String(form.model || "").trim(),
                    year: parseNum(form.year),
                    color: String(form.color || "").trim(),
                    capacityKg: parseNum(form.capacityKg),
                    bodyType: String(form.bodyType || "").trim(),
                    fuelType: String(form.fuelType || "").trim(),
                    axleConfig: String(form.axleConfig || "").trim(),
                    engineNumber: String(form.engineNumber || "").trim(),
                    vin: String(form.vin || "").trim().toUpperCase(),
                    ownershipCard: String(form.ownershipCard || "").trim(),
                    refrigerated: String(form.refrigerated || "false") === "true",
                    soatExpeditionDate: form.soatExpeditionDate,
                    soatExpiryDate,
                    techInspectionExpeditionDate: form.techInspectionExpeditionDate,
                    techInspectionExpiryDate,
                    rcPolicyContract: String(form.rcPolicyContract || "").trim(),
                    rcPolicyExtra: String(form.rcPolicyExtra || "").trim(),
                    rcPolicyExpiry: form.rcPolicyExpiry || "",
                    hasGps: String(form.hasGps || "false") === "true",
                    gpsProvider: String(form.gpsProvider || "").trim(),
                    ownerName: String(form.ownerName || "").trim(),
                    ownerTaxId: String(form.ownerTaxId || "").trim()
                  }
                : v
            );
          try {
            await writeAwaitServer(KEYS.vehicles, nextVehicles);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
            return false;
          }
          notify(userMessage("vehicleUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-driver']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const all = read(KEYS.drivers, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      await setDriverAvailability(target.id, !target.available);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.drivers, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      const licenseCatOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.licenseCategories.map((item) => ({ value: item, label: item }))];
      const bloodOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.bloodTypes.map((item) => ({ value: item, label: item }))];
      const epsOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.eps.map((item) => ({ value: item, label: item }))];
      const arlOpts = [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.arl.map((item) => ({ value: item, label: item }))];
      openEditModal({
        title: "Editar conductor",
        subtitle: target.name,
        submitText: "Actualizar conductor",
        fields: [
          { name: "name", label: "Nombre completo", value: target.name, required: true },
          { name: "phone", label: "Teléfono celular", value: target.phone, required: true, placeholder: "Ej: 3001234567" },
          { name: "emergencyContact", label: "Contacto de emergencia", value: target.emergencyContact || "" },
          { name: "emergencyPhone", label: "Tel. emergencia", value: target.emergencyPhone || "" },
          { name: "bloodType", label: "Tipo de sangre (RH)", type: "select", value: target.bloodType || "", options: bloodOpts },
          { name: "license", label: "N° licencia de conducción", value: target.license || "", placeholder: "Ej: 12345678" },
          { name: "licenseCategory", label: "Categoría licencia", type: "select", value: target.licenseCategory || "", options: licenseCatOpts },
          { name: "licenseExpiry", label: "Vence licencia", type: "date", value: target.licenseExpiry || "" },
          { name: "psychoTestDate", label: "Examen psicosensométrico (fecha)", type: "date", value: target.psychoTestDate || "" },
          { name: "psychoTestExpiry", label: "Vence psicosensométrico", type: "date", value: target.psychoTestExpiry || "" },
          {
            name: "defensiveCourse",
            label: "Curso conducción defensiva (Res. 17220)",
            type: "select",
            value: target.defensiveCourse || "",
            options: [
              { value: "", label: "Seleccione..." },
              { value: "vigente", label: "Vigente" },
              { value: "vencido", label: "Vencido" },
              { value: "no_aplica", label: "No aplica" }
            ]
          },
          { name: "defensiveCourseExpiry", label: "Vence curso defensivo", type: "date", value: target.defensiveCourseExpiry || "" },
          { name: "eps", label: "EPS", type: "select", value: target.eps || "", options: epsOpts },
          { name: "arl", label: "ARL", type: "select", value: target.arl || "", options: arlOpts },
          { name: "comparendos", label: "Comparendos pendientes (SIMIT)", type: "number", value: target.comparendos || 0 },
          { name: "experienceYears", label: "Años de experiencia conduciendo", type: "number", value: target.experienceYears || 0 }
        ],
        onSubmit: async (form) => {
          const expiryValue = String(form.licenseExpiry || "").trim();
          if (expiryValue && new Date(expiryValue).getTime() <= Date.now()) {
            notify(userMessage("driverLicenseFutureEdit"), "error");
            return false;
          }
          const nextDrivers = all.map((d) =>
              d.id === target.id
                ? {
                    ...d,
                    name: String(form.name || "").trim(),
                    phone: String(form.phone || "").trim(),
                    emergencyContact: String(form.emergencyContact || "").trim(),
                    emergencyPhone: String(form.emergencyPhone || "").trim(),
                    bloodType: String(form.bloodType || "").trim(),
                    license: String(form.license || "").trim(),
                    licenseCategory: String(form.licenseCategory || "").trim(),
                    licenseExpiry: expiryValue,
                    psychoTestDate: form.psychoTestDate || "",
                    psychoTestExpiry: form.psychoTestExpiry || "",
                    defensiveCourse: String(form.defensiveCourse || "").trim(),
                    defensiveCourseExpiry: form.defensiveCourseExpiry || "",
                    eps: String(form.eps || "").trim(),
                    arl: String(form.arl || "").trim(),
                    comparendos: parseNum(form.comparendos),
                    experienceYears: parseNum(form.experienceYears)
                  }
                : d
            );
          try {
            await writeAwaitServer(KEYS.drivers, nextDrivers);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el conductor en el servidor."), "error");
            return false;
          }
          notify(userMessage("driverUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  const historyFilter = document.getElementById("history-filter");
  if (historyFilter) {
    /**
     * Filtrado del módulo Historial: combina criterios estructurados (cliente, estado, rango de
     * fechas) con búsqueda libre (`q`) sobre número de solicitud, cliente, viaje y tipo de
     * vehículo. Mantiene los pills de estado (`prettyStatus`) para conservar la UX.
     */
    const filterRows = () => {
      const data = Object.fromEntries(new FormData(historyFilter).entries());
      const q = String(data.q || "").trim().toLowerCase();
      let items = reqRead();
      if (data.client) items = items.filter((i) => i.clientUserId === data.client);
      if (data.status) items = items.filter((i) => i.status === data.status);
      if (data.from) items = items.filter((i) => new Date(i.createdAt) >= new Date(`${data.from}T00:00`));
      if (data.to) items = items.filter((i) => new Date(i.createdAt) <= new Date(`${data.to}T23:59`));
      if (q) {
        items = items.filter((i) => {
          const hay = `${i.requestNumber || i.id || ""} ${i.clientName || ""} ${i.vehicleType || i.trip?.vehicleType || ""} ${i.trip?.tripNumber || ""}`.toLowerCase();
          return hay.includes(q);
        });
      }
      const body = document.getElementById("history-body");
      if (!body) return;
      body.innerHTML = items.length
        ? items
            .map((r) => {
              const number = String(r.requestNumber || r.id || "").trim();
              const client = String(r.clientName || "").trim();
              const vehicle = String(r.vehicleType || r.trip?.vehicleType || "—").trim();
              const trip = String(r.trip?.tripNumber || "").trim();
              return `<tr>
                <td>${fmtDate(r.createdAt)}</td>
                <td><strong>${escapeHtml(number)}</strong></td>
                <td>${escapeHtml(client)}</td>
                <td>${escapeHtml(vehicle)}</td>
                <td>${prettyStatus(r.status)}</td>
                <td>${trip ? escapeHtml(trip) : '<span class="muted">—</span>'}</td>
              </tr>`;
            })
            .join("")
        : "<tr><td colspan='6'><div class='history-empty-row'>Sin registros para los filtros aplicados.</div></td></tr>";
    };
    historyFilter.addEventListener("submit", (event) => {
      event.preventDefault();
      filterRows();
    });
    const liveSearch = historyFilter.querySelector("input[name='q']");
    if (liveSearch) {
      liveSearch.addEventListener("input", () => filterRows());
    }
    historyFilter.addEventListener("reset", () => {
      window.requestAnimationFrame(() => filterRows());
    });
  }

  const driverMonthReportForm = document.getElementById("driver-month-report-form");
  if (driverMonthReportForm) {
    driverMonthReportForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(driverMonthReportForm).entries());
      const output = document.getElementById("driver-month-report-output");
      if (!output) return;
      const driver = read(KEYS.drivers, []).find((d) => String(d.id) === String(data.driverId || ""));
      if (!driver || !monthRange(data.month)) {
        output.innerHTML = `<p class="muted">Selecciona conductor y mes valido.</p>`;
        return;
      }
      const report = calculateDriverTripReport(driver.id, data.month);
      const rows = report.trips
        .map((trip) => `<tr>
          <td>${trip.trip?.tripNumber || "-"}</td>
          <td>${fmtDate(trip.deliveredAt || trip.closedAt || trip.trip?.etaDelivery || trip.trip?.etaPickup || trip.createdAt)}</td>
          <td>${trip.originDepartment || "-"} → ${trip.destinationDepartment || "-"}</td>
          <td>${trip.trip?.vehiclePlate || "-"}</td>
          <td>${prettyStatus(trip.status, "trip")}</td>
        </tr>`)
        .join("");
      output.innerHTML = `
        <div class="dash-grid">
          <div class="p-card"><h4 style="margin:0 0 0.4rem">Viajes del mes</h4><strong>${report.tripCount}</strong></div>
          <div class="p-card"><h4 style="margin:0 0 0.4rem">Interdepartamentales</h4><strong>${report.interDepartmentTrips}</strong></div>
          <div class="p-card"><h4 style="margin:0 0 0.4rem">Viaticos sugeridos</h4><strong>$${parseNum(report.viaticTotal).toLocaleString("es-CO")}</strong></div>
          <div class="p-card"><h4 style="margin:0 0 0.4rem">Combustible registrado</h4><strong>$${parseNum(report.fuelTotal).toLocaleString("es-CO")}</strong></div>
          <div class="p-card"><h4 style="margin:0 0 0.4rem">Costo tecnico flota asociada</h4><strong>$${parseNum(report.technicalTotal).toLocaleString("es-CO")}</strong></div>
        </div>
        ${rows
          ? `<div class="table-wrap" style="margin-top:0.7rem"><table><thead><tr><th>Viaje</th><th>Fecha cierre</th><th>Ruta departamentos</th><th>Camion</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div>`
          : `<p class="muted">No hay viajes finalizados para ese periodo.</p>`}
      `;
    });
  }

  const fuelLogForm = document.getElementById("form-fuel-log");
  if (fuelLogForm) {
    fuelLogForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(fuelLogForm).entries());
      const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
      const driver = read(KEYS.drivers, []).find((d) => String(d.id) === String(data.driverId || ""));
      if (!vehicle || !driver) {
        notify(userMessage("fuelSelectBoth"), "error");
        return;
      }
      const liters = parseNum(data.liters);
      const totalCost = parseNum(data.totalCost);
      if (liters <= 0 || totalCost < 0) {
        notify(userMessage("fuelInvalidAmounts"), "error");
        return;
      }
      const list = read(KEYS.fuelLogs, []);
      list.unshift({
        id: newUuidV4(),
        date: data.date || nowIso().slice(0, 10),
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
        driverId: driver.id,
        driverName: driver.name,
        tripNumber: String(data.tripNumber || "").trim(),
        liters,
        totalCost,
        costPerLiter: liters > 0 ? Math.round(totalCost / liters) : 0,
        odometerKm: parseNum(data.odometerKm),
        station: String(data.station || "").trim(),
        paidBy: String(data.paidBy || "empresa"),
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.fuelLogs, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el combustible en el servidor."), "error");
        return;
      }
      notify(userMessage("fuelLogged"), "success");
      renderPortalView();
    });
  }

  const technicalLogForm = document.getElementById("form-technical-log");
  if (technicalLogForm) {
    technicalLogForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(technicalLogForm).entries());
      const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
      if (!vehicle) {
        notify(userMessage("fuelSelectVehicle"), "error");
        return;
      }
      const list = read(KEYS.vehicleTechnicalLogs, []);
      list.unshift({
        id: newUuidV4(),
        date: data.date || nowIso().slice(0, 10),
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
        type: String(data.type || "preventivo"),
        description: String(data.description || "").trim(),
        cost: parseNum(data.cost),
        downtimeHours: parseNum(data.downtimeHours),
        status: String(data.status || "Pendiente"),
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.vehicleTechnicalLogs, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el mantenimiento en el servidor."), "error");
        return;
      }
      notify(userMessage("technicalLogged"), "success");
      renderPortalView();
    });
  }

  const employeeForm = document.getElementById("form-employee");
  if (employeeForm) {
    attachDepartmentCitySelects(employeeForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    const empPosSelect = employeeForm.querySelector("#emp-position-select");
    const empSalary = employeeForm.querySelector("#emp-base-salary");
    const empContract = employeeForm.querySelector("#emp-contract-type");
    const syncEmpFromPosition = () => {
      const position = getPositionById(String(empPosSelect?.value || ""));
      if (!position || !empSalary || !empContract) return;
      empSalary.value = String(parseNum(position.baseSalary));
      empContract.value = position.contractTypeDefault || "Termino indefinido";
    };
    if (empPosSelect) {
      empPosSelect.addEventListener("change", syncEmpFromPosition);
      syncEmpFromPosition();
    }
    const empIllnessSelect = employeeForm.querySelector("#emp-has-illness");
    const empIllnessDetailLabel = employeeForm.querySelector("#emp-illness-detail-label");
    const empIllnessDetail = employeeForm.querySelector("#emp-illness-detail");
    const syncIllnessVisibility = () => {
      if (!empIllnessSelect || !empIllnessDetailLabel || !empIllnessDetail) return;
      const yes = String(empIllnessSelect.value || "").toLowerCase() === "si";
      empIllnessDetailLabel.classList.toggle("hidden", !yes);
      empIllnessDetailLabel.toggleAttribute("hidden", !yes);
      if (yes) {
        empIllnessDetail.setAttribute("required", "required");
      } else {
        empIllnessDetail.removeAttribute("required");
        empIllnessDetail.value = "";
      }
    };
    if (empIllnessSelect) {
      empIllnessSelect.addEventListener("change", syncIllnessVisibility);
      syncIllnessVisibility();
    }
    bindHrFormWizard(employeeForm);
    employeeForm.querySelectorAll("[data-action='employee-form-generate-contract-draft']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const raw = Object.fromEntries(new FormData(employeeForm).entries());
        const docValidation = validateColombianDocument(raw.documentType, raw.idDoc);
        if (!docValidation.ok) {
          notify(docValidation.message, "error");
          return;
        }
        const packed = buildPayrollEmployeePayloadFromWizard(raw, docValidation.normalized, {
          avatarUrl: "",
          stripLargeAvatar: false
        });
        if (!packed.ok) {
          notify(packed.msg, "error");
          return;
        }
        const payload = packed.payload;
        const miss = validateEmployeeContractDocFields(payload);
        if (miss.length) {
          notify(userMessage("contractEmployeeMissingFields", miss.join(", ")), "error");
          return;
        }
        if (payload.workerRole === "conductor") {
          if (!payload.license || !payload.licenseCategory || !payload.licenseExpiry) {
            notify(userMessage("employeeDriverFieldsRequired"), "error");
            return;
          }
          if (new Date(payload.licenseExpiry).getTime() <= Date.now()) {
            notify(userMessage("payrollLicenseExpired"), "error");
            return;
          }
        }
        try {
          await generateOfficialWordContract(
            buildEmployeeContractDocxPayload(payload, { contractTemplateKind: payload.contractTemplateKind })
          );
          notify(userMessage("employeeContractWordOk"), "success");
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
        }
      });
    });
    employeeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      const raw = Object.fromEntries(new FormData(employeeForm).entries());
      const docValidation = validateColombianDocument(raw.documentType, raw.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      const fileInput = employeeForm.querySelector("input[name='avatarFile']");
      const file = fileInput?.files?.[0];
      const avatarBaseFromForm = String(raw.avatarUrl || "").trim();
      let resolvedAvatar = avatarBaseFromForm;
      try {
        resolvedAvatar = await resolveEmployeeAvatarUrl(file, avatarBaseFromForm);
      } catch (err) {
        devWarn?.("avatar-upload-failed", err);
      }
      // Si el avatar terminó como `data:` URL (R2 no disponible), recortarlo
      // para no-admin para evitar colmar localStorage.
      const stripAvatar =
        actor?.role !== ROLES.ADMIN && String(resolvedAvatar || "").startsWith("data:");
      const saveEmployee = async (avatarUrlValue) => {
        const packed = buildPayrollEmployeePayloadFromWizard(raw, docValidation.normalized, {
          avatarUrl: avatarUrlValue,
          stripLargeAvatar: stripAvatar
        });
        if (!packed.ok) {
          notify(packed.msg, "error");
          return;
        }
        const payload = packed.payload;
        if (actor?.role !== ROLES.ADMIN) {
          await queueApproval({
            type: "create_employee",
            title: `Creacion de empleado ${payload.name}`,
            payload,
            requestedByUserId: actor?.id || "",
            requestedByName: actor?.name || "Usuario"
          });
          notify(userMessage("employeeRequestQueued"), "info");
          renderPortalView();
          return;
        }
        if (payload.workerRole === "conductor") {
          if (!payload.license || !payload.licenseCategory || !payload.licenseExpiry) {
            notify(userMessage("employeeDriverFieldsRequired"), "error");
            return;
          }
          if (new Date(payload.licenseExpiry).getTime() <= Date.now()) {
            notify(userMessage("payrollLicenseExpired"), "error");
            return;
          }
        }
        const all = read(KEYS.payrollEmployees, []);
        all.push({ id: newUuidV4(), ...payload });
        try {
          await writeAwaitServer(KEYS.payrollEmployees, all);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el empleado en el servidor."), "error");
          return;
        }
        await syncDriverFromEmployee(payload, {
          license: payload.license,
          licenseCategory: payload.licenseCategory,
          licenseExpiry: payload.licenseExpiry
        });
        state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
        persistHrWorkspace("payroll", "data");
        state.createPanels = { ...(state.createPanels || {}), "create-employee": false };
        notify(userMessage("employeeCreatedOk"), "success");
        renderPortalView();
      };
      await saveEmployee(resolvedAvatar);
    });
  }

  const absenceForm = document.getElementById("form-hr-absence");
  if (absenceForm) {
    absenceForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(absenceForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) {
        notify(userMessage("absencePickEmployee"), "error");
        return;
      }
      const start = new Date(`${data.startDate}T12:00:00`);
      const end = new Date(`${data.endDate}T12:00:00`);
      if (end.getTime() < start.getTime()) {
        notify(userMessage("absenceDateOrder"), "error");
        return;
      }
      const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
      const list = read(KEYS.hrAbsences, []);
      const absencePayload = {
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        absenceType: data.absenceType,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        supportNumber: String(data.supportNumber || "").trim(),
        epsEntity: String(data.epsEntity || "").trim(),
        notes: String(data.notes || "").trim(),
        createdAt: nowIso()
      };
      if (requiresAdminHrApproval(actor?.role || "")) {
        await queueApproval({
          type: "register_hr_absence",
          title: `Registro de ausencia de ${employee.name}`,
          payload: absencePayload,
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify(userMessage("absenceApprovalQueued"), "info");
        renderPortalView();
        return;
      }
      list.unshift(absencePayload);
      try {
        await writeAwaitServer(KEYS.hrAbsences, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible registrar la ausencia en el servidor."), "error");
        return;
      }
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      state.createPanels = { ...(state.createPanels || {}), "create-hr-absence": false };
      notify(userMessage("absenceRecorded"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='view-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(btn.dataset.id || ""));
      if (!target) {
        notify(userMessage("employeeDeleteNotFound"), "error");
        return;
      }
      openInfoModal({
        title: "Ficha del colaborador",
        subtitle: `${String(target.position || "Colaborador").trim()} · ${String(target.idDoc || "").trim()}`,
        bodyHtml: buildEmployeePayrollProfileBodyHtml(target),
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.payrollEmployees, []);
      const target = all.find((e) => String(e.id) === String(btn.dataset.id || ""));
      if (!target) return;
      openEditModal({
        title: "Editar colaborador",
        subtitle: String(target.name || "").trim(),
        submitText: "Guardar cambios",
        extraModalCardClass: "modal-card-edit--employee",
        fields: buildPayrollEmployeeEditModalFields(target),
        afterMount: (formEl) => {
          attachDepartmentCitySelects(formEl, {
            departmentSelector: "select[name='department']",
            citySelector: "select[name='city']",
            initialDepartment: target.department || "",
            initialCity: target.city || ""
          });
          const pos = formEl.querySelector("#employee-modal-position");
          const salary = formEl.querySelector("#employee-modal-salary");
          const contract = formEl.querySelector("select[name='contractType']");
          const syncFromPos = () => {
            const p = getPositionById(String(pos?.value || ""));
            if (!p || !salary) return;
            salary.value = String(parseNum(p.baseSalary));
            if (contract && p.contractTypeDefault) contract.value = p.contractTypeDefault;
          };
          pos?.addEventListener("change", syncFromPos);
          const illnessSel = formEl.querySelector("[data-emp-edit-illness]");
          const illnessDetailLabel = formEl.querySelector("[data-emp-edit-illness-detail]");
          const illnessDetailField = illnessDetailLabel?.querySelector("textarea[name='illnessDescription']");
          const syncIllness = () => {
            if (!illnessSel || !illnessDetailLabel || !illnessDetailField) return;
            const yes = String(illnessSel.value || "").toLowerCase() === "si";
            illnessDetailLabel.toggleAttribute("hidden", !yes);
            illnessDetailLabel.classList.toggle("hidden", !yes);
            if (yes) {
              illnessDetailField.setAttribute("required", "required");
            } else {
              illnessDetailField.removeAttribute("required");
              illnessDetailField.value = "";
            }
          };
          illnessSel?.addEventListener("change", syncIllness);
          syncIllness();
        },
        onSubmit: async (payload, formEl) => {
          const docValidation = validateColombianDocument(payload.documentType, payload.idDoc);
          if (!docValidation.ok) {
            notify(docValidation.message, "error");
            return false;
          }
          let nextAvatar = String(payload.avatarUrlExisting || "").trim();
          try {
            const file = formEl?.querySelector?.("input[name='avatarFile']")?.files?.[0];
            if (file) {
              nextAvatar = await resolveEmployeeAvatarUrl(file, nextAvatar);
            }
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return false;
          }
          const raw = { ...payload, avatarUrl: nextAvatar };
          const packed = buildPayrollEmployeePayloadFromWizard(raw, docValidation.normalized, {
            avatarUrl: nextAvatar,
            stripLargeAvatar: false
          });
          if (!packed.ok) {
            notify(packed.msg, "error");
            return false;
          }
          const nextPayload = packed.payload;
          if (nextPayload.workerRole === "conductor") {
            if (!nextPayload.license || !nextPayload.licenseCategory || !nextPayload.licenseExpiry) {
              notify(userMessage("employeeDriverFieldsRequired"), "error");
              return false;
            }
            if (new Date(nextPayload.licenseExpiry).getTime() <= Date.now()) {
              notify(userMessage("payrollLicenseExpired"), "error");
              return false;
            }
          }
          const nextEmployees = all.map((empRow) =>
              String(empRow.id) !== String(target.id)
                ? empRow
                : {
                    ...empRow,
                    ...nextPayload,
                    id: empRow.id,
                    avatarUrl:
                      typeof nextAvatar === "string" && nextAvatar.trim()
                        ? nextAvatar.trim()
                        : empRow.avatarUrl || nextPayload.avatarUrl
                  }
            );
          try {
            await writeAwaitServer(KEYS.payrollEmployees, nextEmployees);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el empleado en el servidor."), "error");
            return false;
          }
          const refreshed = read(KEYS.payrollEmployees, []).find((empRow) => String(empRow.id) === String(target.id));
          if (refreshed && refreshed.workerRole === "conductor") await syncDriverFromEmployee(refreshed);
          notify(userMessage("employeeUpdatedOk"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      openConfirmModal({
        title: "Eliminar empleado",
        message: "El empleado sera removido en cascada (nomina, ausencias, contratos y conductor relacionado).",
        confirmText: "Eliminar",
        onConfirm: async () => {
          const empId = String(btn.dataset.id || "");
          try {
            await postPortalAuthorized("/portal/admin-employee-delete", { employeeId: empId });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar el empleado en el servidor."), "error");
            return;
          }
          const removed = await deleteEmployeesCascade([empId]);
          notify(
            removed ? userMessage("employeeDeletedCascade") : userMessage("employeeDeleteNotFound"),
            removed ? "success" : "error"
          );
          renderPortalView();
        }
      });
    });
  });

  const employeesSelectAll = document.getElementById("employees-select-all");
  if (employeesSelectAll) {
    employeesSelectAll.addEventListener("click", (event) => {
      event.preventDefault();
      const checks = [...nodes.viewRoot.querySelectorAll("[data-employee-select]")];
      const allSelected = checks.length > 0 && checks.every((check) => check.checked);
      checks.forEach((check) => {
        check.checked = !allSelected;
      });
    });
  }

  const employeesDeleteSelected = document.getElementById("employees-delete-selected");
  if (employeesDeleteSelected) {
    employeesDeleteSelected.addEventListener("click", (event) => {
      event.preventDefault();
      if (!isAdminActor()) {
        notify(userMessage("adminOnlyModule"), "error");
        return;
      }
      const selectedIds = [...nodes.viewRoot.querySelectorAll("[data-employee-select]:checked")].map((check) => String(check.value || ""));
      if (!selectedIds.length) {
        notify(userMessage("employeesBulkSelect"), "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar empleados seleccionados",
        message: `Se eliminaran ${selectedIds.length} empleados en cascada (nomina, ausencias, contratos y conductores asociados).`,
        confirmText: "Eliminar en cascada",
        onConfirm: async () => {
          try {
            for (const employeeId of selectedIds) {
              await postPortalAuthorized("/portal/admin-employee-delete", { employeeId });
            }
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar un empleado en el servidor."), "error");
            return;
          }
          const removed = await deleteEmployeesCascade(selectedIds);
          notify(userMessage("employeesBulkRemoved", removed), "success");
          renderPortalView();
        }
      });
    });
  }

  const payrollForm = document.getElementById("form-payroll");
  if (payrollForm) {
    wireMonthlyPayrollConcepts(payrollForm);
    payrollForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(payrollForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) {
        notify(userMessage("contractPickEmployee"), "error");
        return;
      }
      if (!monthRange(data.month)) {
        notify(userMessage("payrollSelectMonth"), "error");
        return;
      }
      const payPrima = Boolean(data.payPrimaServicios);
      if (payPrima && !payrollMonthIsPrimaSemester(data.month)) {
        notify("La prima de servicios solo se parametriza cuando el mes liquidado es junio (06) o diciembre (12).", "error");
        return;
      }
      const payInteresesCesantias = Boolean(data.payInteresesCesantias);
      if (payInteresesCesantias && !payrollMonthIsCesantiasInterestMonth(data.month)) {
        notify(
          "Los intereses sobre cesantías (Ley 52/1975) solo se parametrizan cuando el mes liquidado es enero (01) o febrero (02), períodos donde suele consignarse o pagarse ese concepto cercano al cierre legal de enero. Ajuste con su contador.",
          "error"
        );
        return;
      }
      const primaDaysRounded = Math.floor(parseNum(data.primaServiciosDays));
      let primaServiciosCop = payPrima ? Math.max(0, parseNum(data.primaServiciosCop)) : 0;
      if (payPrima && (!Number.isFinite(primaDaysRounded) || primaDaysRounded < 1)) {
        notify("Indique los días laborados en el semestre para calcular o validar la prima de servicios.", "error");
        return;
      }
      if (payPrima && primaServiciosCop <= 0 && primaDaysRounded >= 1) {
        primaServiciosCop = calcColombiaPrimaServiciosCop(parseNum(employee.baseSalary), primaDaysRounded);
      }
      let cesantiasInterestBaseCop = payInteresesCesantias ? Math.max(0, parseNum(data.cesantiasInterestBaseCop)) : 0;
      const diasIntFloored = payInteresesCesantias ? Math.floor(parseNum(data.cesantiasInterestDays)) : null;
      const cesantiasInterestDays = !payInteresesCesantias
        ? null
        : Number.isFinite(diasIntFloored) && diasIntFloored > 0
          ? Math.min(366, diasIntFloored)
          : 360;
      let interesesCesantiasCop = payInteresesCesantias ? Math.max(0, parseNum(data.interesesCesantiasCopMonthly)) : 0;
      if (payInteresesCesantias && cesantiasInterestBaseCop <= 0) {
        notify("Indique la base en pesos de las cesantías (p. ej. consignaciones del año anterior) para calcular o registrar los intereses.", "error");
        return;
      }
      if (
        payInteresesCesantias &&
        interesesCesantiasCop <= 0 &&
        cesantiasInterestBaseCop > 0 &&
        cesantiasInterestDays != null
      ) {
        interesesCesantiasCop = calcColombiaInteresesCesantiasCop(cesantiasInterestBaseCop, cesantiasInterestDays);
      }
      const linkedDriver = employee.workerRole === "conductor" ? resolveDriverForEmployee(employee) : null;
      const monthlyDriver = linkedDriver ? calculateDriverTripReport(linkedDriver.id, data.month) : null;
      const autoTravelAllowance = monthlyDriver ? monthlyDriver.viaticTotal : 0;
      const autoFuelReimbursement = linkedDriver
        ? read(KEYS.fuelLogs, [])
            .filter((log) => String(log.driverId || "") === String(linkedDriver.id) && String(log.paidBy || "empresa") === "conductor" && dateInRange(log.date, monthRange(data.month)))
            .reduce((acc, log) => acc + parseNum(log.totalCost), 0)
        : 0;
      const travelAllowanceManual = parseNum(data.travelAllowanceManual);
      const fuelReimbursementManual = parseNum(data.fuelReimbursementManual);
      const travelAllowance = autoTravelAllowance + travelAllowanceManual;
      const fuelReimbursement = autoFuelReimbursement + fuelReimbursementManual;
      const baseSalary = parseNum(employee.baseSalary);
      const extras = parseNum(data.extras);
      const aux = parseNum(data.aux);
      const bonus = parseNum(data.bonus);
      const grossMonthlyBase = baseSalary + extras + aux + bonus + travelAllowance + fuelReimbursement;
      const gross =
        grossMonthlyBase +
        (payPrima ? primaServiciosCop : 0) +
        (payInteresesCesantias ? interesesCesantiasCop : 0);
      const ibc = baseSalary + extras + bonus;
      const health = ibc * CO_PAYROLL.healthEmployeeRate;
      const pension = ibc * CO_PAYROLL.pensionEmployeeRate;
      const solidarity = ibc > CO_PAYROLL.smmlv * CO_PAYROLL.solidarityThresholdSmmlv ? ibc * CO_PAYROLL.solidarityRate : 0;
      const deductions = health + pension + solidarity;
      const net = gross - deductions;
      const run = {
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        month: data.month,
        gross,
        ibc,
        travelAllowance,
        fuelReimbursement,
        travelAllowanceAuto: autoTravelAllowance,
        fuelReimbursementAuto: autoFuelReimbursement,
        travelAllowanceManual,
        fuelReimbursementManual,
        tripCount: monthlyDriver?.tripCount || 0,
        interDepartmentTrips: monthlyDriver?.interDepartmentTrips || 0,
        health,
        pension,
        solidarity,
        deductions,
        net,
        paid: false,
        createdAt: nowIso(),
        payrollKind: "mensual",
        payPrimaServicios: payPrima,
        primaServiciosDays: payPrima ? primaDaysRounded : null,
        primaServiciosCop: payPrima ? primaServiciosCop : 0,
        payInteresesCesantias,
        interesesCesantiasCop: payInteresesCesantias ? interesesCesantiasCop : 0,
        cesantiasInterestBaseCop: payInteresesCesantias ? cesantiasInterestBaseCop : null,
        cesantiasInterestDays: payInteresesCesantias ? cesantiasInterestDays : null,
        settlementDetail: null
      };
      const runs = read(KEYS.payrollRuns, []);
      runs.unshift(run);
      try {
        await writeAwaitServer(KEYS.payrollRuns, runs);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la nómina en el servidor."), "error");
        return;
      }
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      state.createPanels = { ...(state.createPanels || {}), "create-payroll": false };
      notify(userMessage("payrollSaved"), "success");
      renderPortalView();
    });
  }

  const settlementForm = document.getElementById("form-payroll-settlement");
  if (settlementForm) {
    wireTerminationSettlementForm(settlementForm);
    settlementForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(settlementForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) {
        notify(userMessage("contractPickEmployee"), "error");
        return;
      }
      if (!monthRange(data.month)) {
        notify(userMessage("payrollSelectMonth"), "error");
        return;
      }
      const termDate = String(data.terminationDate || "").trim();
      if (!termDate) {
        notify("Seleccione la fecha de terminación del contrato.", "error");
        return;
      }
      const cesantias = Math.max(0, parseNum(data.cesantiasCop));
      const interesesCesantias = Math.max(0, parseNum(data.interesesCesantiasCop));
      const primaProp = Math.max(0, parseNum(data.primaPropCop));
      const vacaciones = Math.max(0, parseNum(data.vacacionesCop));
      const indemnization = Math.max(0, parseNum(data.indemnization));
      const otrosSettlement = Math.max(0, parseNum(data.otrosSettlement));
      const gross =
        cesantias + interesesCesantias + primaProp + vacaciones + indemnization + otrosSettlement;
      if (gross <= 0) {
        notify("Ingrese valores en los rubros de liquidación; el total debe ser mayor que cero.", "error");
        return;
      }
      const settlementDetail = {
        terminationDate: termDate,
        terminationCause: String(data.terminationCause || ""),
        cesantias,
        interesesCesantias,
        primaProporcional: primaProp,
        vacaciones,
        indemnization,
        otrosSettlement,
        referenceDays360: parseNum(data.days360Year),
        primaPropDaysReference: parseNum(data.primaPropDays),
        vacationDaysReference: parseNum(data.vacationDays),
        legalDisclaimer:
          "Cálculos orientativos conforme prácticas usuales CST y normativa colombiana sobre cesantías, intereses proporcionales, prima y vacaciones. No sustituye asesoría legal ni contable."
      };
      const run = {
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        month: data.month,
        gross,
        ibc: 0,
        travelAllowance: 0,
        fuelReimbursement: 0,
        travelAllowanceAuto: 0,
        fuelReimbursementAuto: 0,
        travelAllowanceManual: 0,
        fuelReimbursementManual: 0,
        extras: 0,
        aux: 0,
        bonus: 0,
        tripCount: 0,
        interDepartmentTrips: 0,
        health: 0,
        pension: 0,
        solidarity: 0,
        deductions: 0,
        net: gross,
        paid: false,
        createdAt: nowIso(),
        payrollKind: "terminacion",
        payPrimaServicios: false,
        primaServiciosDays: null,
        primaServiciosCop: 0,
        payInteresesCesantias: false,
        interesesCesantiasCop: 0,
        cesantiasInterestBaseCop: null,
        cesantiasInterestDays: null,
        settlementDetail
      };
      const runs = read(KEYS.payrollRuns, []);
      runs.unshift(run);
      try {
        await writeAwaitServer(KEYS.payrollRuns, runs);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la liquidación en el servidor."), "error");
        return;
      }
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      state.createPanels = { ...(state.createPanels || {}), "create-payroll-settlement": false };
      notify("Liquidación contractual registrada. Revise montos antes de marcar pagado.", "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='payslip']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const run = read(KEYS.payrollRuns, []).find((r) => r.id === btn.dataset.id);
      if (!run) return;
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === run.employeeId);
      const company = employee ? getCompanyById(employee.companyId) : null;
      const pop = window.open("", "_blank", "width=720,height=900");
      const netStr = `$${parseNum(run.net).toLocaleString("es-CO")}`;
      const isTerm = String(run.payrollKind || "mensual") === "terminacion";
      const causeLabels = {
        renuncia_voluntaria: "Renuncia voluntaria",
        despido_sin_justa: "Despido sin justa causa",
        despido_justa: "Despido con justa causa",
        mutuo_acuerdo: "Mutuo acuerdo",
        vencimiento_contrato: "Vencimiento de contrato",
        otro: "Otro"
      };
      const fmtPay = (v) => `$${parseNum(v).toLocaleString("es-CO")}`;
      const cL = "padding:8px;border-bottom:1px solid #e9ecef";
      const cR = "padding:8px;border-bottom:1px solid #e9ecef;text-align:right;font-variant-numeric:tabular-nums";
      const theadP = `<thead><tr style="background:#E8EEF5"><th style="text-align:left;padding:8px">Concepto</th><th style="text-align:right;padding:8px">Valor (COP)</th></tr></thead>`;

      let payslipBodyBlocks = "";
      if (isTerm && run.settlementDetail && typeof run.settlementDetail === "object") {
        const sd = run.settlementDetail;
        const c = parseNum(sd.cesantias);
        const ic = parseNum(sd.interesesCesantias);
        const pp = parseNum(sd.primaProporcional);
        const vac = parseNum(sd.vacaciones);
        const ind = parseNum(sd.indemnization);
        const otros = parseNum(sd.otrosSettlement);
        const devRows =
          `<tr><td style="${cL}"><strong>Cesantías definitivas / saldo a favor (referencia CST)</strong></td><td style="${cR}"><strong>${fmtPay(c)}</strong></td></tr>` +
          `<tr><td style="${cL}">Intereses moratorios sobre cesantías (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual — Ley 52/1975, orientativo)</td><td style="${cR}">${fmtPay(ic)}</td></tr>` +
          `<tr><td style="${cL}">Prima de servicios proporcional (CST)</td><td style="${cR}">${fmtPay(pp)}</td></tr>` +
          `<tr><td style="${cL}">Indemnización compensatoria de vacaciones u holgura (÷720 referencia)</td><td style="${cR}">${fmtPay(vac)}</td></tr>` +
          (ind > 0
            ? `<tr><td style="${cL}">Indemnización sustitutiva u otros (orden judicial / pacto)</td><td style="${cR}">${fmtPay(ind)}</td></tr>`
            : "") +
          (otros > 0
            ? `<tr><td style="${cL}">Otros conceptos de finiquito</td><td style="${cR}">${fmtPay(otros)}</td></tr>`
            : "") +
          `<tr><td style="${cL}"><strong>Total devengos liquidación</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;

        const ded = parseNum(run.deductions);
        const dedRows =
          ded > 0
            ? `<tr><td style="${cL}">Retenciones y aportes asociados (detalle en nómina extraordinaria)</td><td style="${cR}">${fmtPay(ded)}</td></tr>`
            : `<tr><td colspan="2" style="padding:8px;color:#495057;font-size:0.88rem">Sin deducciones registradas en esta liquidación. Informe retención en la fuente, embargos u obligaciones con su contador.</td></tr>`;

        payslipBodyBlocks = `
          <h2 style="font-size:1rem;margin:1.25rem 0 0.35rem">I. Devengos (finiquito / liquidación)</h2>
          <p style="margin:0 0 0.5rem;font-size:0.86rem;color:#495057">Ítems típicos por terminación conforme ordenamiento laboral colombiano (valores editables en el registro del sistema).</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${devRows}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">II. Deducciones</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${dedRows}</tbody></table>
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:0.5rem"><tbody>
            <tr><td style="padding:12px 8px"><strong>Total neto a consignar / pagar</strong></td><td style="padding:12px 8px;text-align:right;font-size:1.12rem"><strong>${netStr}</strong></td></tr>
          </tbody></table>`;
      } else {
        const ex = parseNum(run.extras);
        const au = parseNum(run.aux);
        const bo = parseNum(run.bonus);
        const via = parseNum(run.travelAllowance);
        const comb = parseNum(run.fuelReimbursement);
        const prima = parseNum(run.primaServiciosCop);
        const intCe = parseNum(run.interesesCesantiasCop);
        const salarioBasicoDevengo = Math.max(
          0,
          parseNum(run.gross) - ex - au - bo - via - comb - prima - intCe
        );
        const baseInt = parseNum(run.cesantiasInterestBaseCop);
        const diasInt = run.cesantiasInterestDays != null ? run.cesantiasInterestDays : "—";
        const intLabel =
          baseInt > 0
            ? `Intereses sobre cesantías (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual Ley 52/1975; base ref. ${fmtPay(baseInt)}, ${diasInt} días/360)`
            : `Intereses sobre cesantías (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual Ley 52/1975)`;

        const devRowsMes =
          `<tr><td style="${cL}">Salario básico mensual (devengo ordinario)</td><td style="${cR}">${fmtPay(salarioBasicoDevengo)}</td></tr>` +
          (ex > 0
            ? `<tr><td style="${cL}">Horas extras, dominicales o recargos nocturnos</td><td style="${cR}">${fmtPay(ex)}</td></tr>`
            : "") +
          `<tr><td style="${cL}">Auxilio legal de transporte (no constitutivo de salario)</td><td style="${cR}">${fmtPay(au)}</td></tr>` +
          (bo > 0
            ? `<tr><td style="${cL}">Bonificaciones y pagos ocasionales gravables (devengo)</td><td style="${cR}">${fmtPay(bo)}</td></tr>`
            : "") +
          `<tr><td style="${cL}">Viáticos y anticipos de viaje (reintegro / no salario)</td><td style="${cR}">${fmtPay(via)}</td></tr>` +
          `<tr><td style="${cL}">Reembolso combustible y gastos de ruta deducibles</td><td style="${cR}">${fmtPay(comb)}</td></tr>` +
          (prima > 0
            ? `<tr><td style="${cL}">Prima de servicios semestral (CST arts. 244–249 — ${run.primaServiciosDays ?? "—"} días semestre)</td><td style="${cR}">${fmtPay(prima)}</td></tr>`
            : "") +
          (intCe > 0 ? `<tr><td style="${cL}">${escapeHtml(intLabel)}</td><td style="${cR}">${fmtPay(intCe)}</td></tr>` : "") +
          `<tr><td style="${cL}"><strong>Total devengos del periodo</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;

        const dedRowsMes =
          `<tr><td style="${cL}">Salario integral de cotización — IBC (base aportes empleador/empleado)</td><td style="${cR}">${fmtPay(run.ibc)}</td></tr>` +
          `<tr><td style="${cL}">Aporte obligatorio salud — empleado (4% sobre IBC)</td><td style="${cR}">${fmtPay(run.health)}</td></tr>` +
          `<tr><td style="${cL}">Aporte pensión obligatoria — empleado (4% sobre IBC)</td><td style="${cR}">${fmtPay(run.pension)}</td></tr>` +
          `<tr><td style="${cL}">Fondo de solidaridad pensional FSP (cuando aplique rangos Ley 797/2003)</td><td style="${cR}">${fmtPay(run.solidarity)}</td></tr>` +
          `<tr><td style="${cL}"><strong>Total deducciones al empleado</strong></td><td style="${cR}"><strong>${fmtPay(run.deductions)}</strong></td></tr>`;

        payslipBodyBlocks = `
          <h2 style="font-size:1rem;margin:1.25rem 0 0.35rem">I. Devengos e ingresos período</h2>
          <p style="margin:0 0 0.45rem;font-size:0.86rem;color:#495057">Ingresos y conceptos pagados por el empleador; prima e intereses de cesantías solo si se liquidaron en este comprobante.</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${devRowsMes}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">II. Deducciones (aportes del trabajador)</h2>
          <p style="margin:0 0 0.45rem;font-size:0.86rem;color:#495057">Descuentos legales incidentes sobre nómina; prima e intereses de cesantías no integran habitualmente esta base de cotización en este modelo simplificado.</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${dedRowsMes}</tbody></table>
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:0.5rem"><tbody>
            <tr><td style="padding:12px 8px"><strong>Neto pagado / a pagar al trabajador</strong></td><td style="padding:12px 8px;text-align:right;font-size:1.12rem"><strong>${netStr}</strong></td></tr>
          </tbody></table>`;
      }
      const docTitle =
        isTerm && run.settlementDetail && typeof run.settlementDetail === "object"
          ? `Liquidacion contractual ${run.employeeName}`
          : `Desprendible ${run.employeeName}`;
      const h1Title = isTerm ? "Liquidación contractual" : "Desprendible de nómina";
      let metaExtra = "";
      if (isTerm && run.settlementDetail && typeof run.settlementDetail === "object") {
        const sd = run.settlementDetail;
        metaExtra += `<tr><td style="padding:4px 0"><strong>Fecha terminación</strong></td><td>${escapeHtml(String(sd.terminationDate || "-"))}</td></tr>`;
        metaExtra += `<tr><td style="padding:4px 0"><strong>Motivo</strong></td><td>${escapeHtml(String(causeLabels[sd.terminationCause] || sd.terminationCause || "-"))}</td></tr>`;
      }
      const disclaimerPieces = [];
      if (!isTerm) {
        const ori = String(run.liquidacionOrigin || run.origenLiquidacion || "manual").toLowerCase();
        if (ori === "automatica") {
          disclaimerPieces.push(
            "Liquidación generada automáticamente en servidor (cron día 13, mes causación anterior Bogotá). Validar incapacidades, vacaciones y bases de cotización con RRHH y contador."
          );
          const nv = run.noveltiesDetail;
          if (nv && typeof nv === "object" && Array.isArray(nv.disclaimers)) {
            const top = nv.disclaimers.slice(0, 2).map((x) => String(x)).join(" ");
            if (top) disclaimerPieces.push(top);
          }
        }
        if (parseNum(run.primaServiciosCop) > 0)
          disclaimerPieces.push(
            "Prima de servicios (CST): cálculo orientativo; validar política empresarial y contador."
          );
        if (parseNum(run.interesesCesantiasCop) > 0)
          disclaimerPieces.push(
            `Intereses de cesantías (Ley 52/1975, ${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual): el texto legal establece que deben pagarse al trabajador en enero del año siguiente al período causado (y reglas especiales en retiros o ceses antes de ese cierre). Lo habitual es liquidarlos con la nómina de enero del año siguiente o, si su política lo retrasa hasta febrero, documente ese desfase con contador para no omitir obligaciones ya exigidas.`
          );
      }
      const disclaimer =
        isTerm &&
        run.settlementDetail &&
        typeof run.settlementDetail === "object" &&
        run.settlementDetail.legalDisclaimer
          ? `<p style="font-size:0.82rem;color:#495057;margin-top:1rem;line-height:1.45">${escapeHtml(String(run.settlementDetail.legalDisclaimer))}</p>`
          : disclaimerPieces.length
            ? `<p style="font-size:0.82rem;color:#495057;margin-top:1rem;line-height:1.45">${escapeHtml(disclaimerPieces.join(" "))}</p>`
            : "";
      pop.document.write(`
        <html><head><meta charset="utf-8"/><title>${escapeHtml(docTitle)}</title></head>
        <body style="font-family:system-ui,Segoe UI,Arial,sans-serif;padding:28px;color:#0B1D33;line-height:1.5">
          <div style="border-bottom:2px solid #0B1D33;padding-bottom:12px;margin-bottom:20px">
            <h1 style="margin:0;font-size:1.35rem">${escapeHtml(h1Title)}</h1>
          </div>
          <table style="width:100%;font-size:0.92rem;margin-bottom:1.2rem">
            <tr><td style="padding:4px 0"><strong>Empleador</strong></td><td>${escapeHtml(String(company?.name || "Antares"))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Trabajador</strong></td><td>${escapeHtml(String(run.employeeName || ""))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Documento</strong></td><td>${escapeHtml(String(employee?.idDoc || "-"))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Cargo</strong></td><td>${escapeHtml(String(employee?.position || "-"))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Periodo registrado</strong></td><td>${escapeHtml(String(run.month || ""))}</td></tr>
            ${metaExtra}
            <tr><td style="padding:4px 0"><strong>Estado</strong></td><td>${run.paid ? "Pagado" : "Pendiente de pago"}</td></tr>
          </table>
          <h2 style="font-size:1rem;margin:1.05rem 0 0">Comprobante de pago</h2>
          ${payslipBodyBlocks}
          ${disclaimer}
          <p style="margin-top:1.5rem"><button onclick="window.print()" style="padding:10px 18px;border-radius:8px;border:none;background:#0B1D33;color:#fff;cursor:pointer">Imprimir / PDF</button></p>
        </body></html>
      `);
      pop.document.close();
    });
  });


  nodes.viewRoot.querySelectorAll("[data-action='mark-payroll-paid']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const actor = currentUser();
      const id = String(btn.dataset.id || "");
      const all = read(KEYS.payrollRuns, []);
      const run = all.find((r) => r.id === id);
      if (!run || run.paid) return;
      if (requiresAdminHrApproval(actor?.role || "")) {
        await queueApproval({
          type: "mark_payroll_paid",
          title: `Aprobar pago de nomina ${run.employeeName} (${run.month})`,
          payload: { payrollRunId: run.id, employeeName: run.employeeName, month: run.month },
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify(userMessage("payrollMarkPaidApprovalAdmin"), "info");
        renderPortalView();
        return;
      }
      openConfirmModal({
        title: "Confirmar pago de nomina",
        message: `Marcar como pagada la liquidacion de ${run.employeeName} (${run.month}) por ${parseNum(run.net).toLocaleString("es-CO")} COP neto.`,
        confirmText: "Marcar pagado",
        onConfirm: async () => {
          try {
            await writeAwaitServer(
              KEYS.payrollRuns,
              all.map((item) => (item.id === id ? { ...item, paid: true, paidAt: nowIso() } : item))
            );
          } catch (err) {
            notify(String(err?.message || "No fue posible marcar el pago en el servidor."), "error");
            return;
          }
          notify(userMessage("payrollPaidMarked"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='employee-generate-contract']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = String(btn.dataset.id || "").trim();
      const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === id);
      if (!emp) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const miss = validateEmployeeContractDocFields(emp);
      if (miss.length) {
        notify(userMessage("contractEmployeeMissingFields", miss.join(", ")), "error");
        return;
      }
      try {
        await generateOfficialWordContract(
          buildEmployeeContractDocxPayload(emp, { contractTemplateKind: emp.contractTemplateKind })
        );
        notify(userMessage("employeeContractWordOk"), "success");
      } catch (err) {
        notify(String(err?.message || userMessage("genericError")), "error");
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-hr-absence']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyDeleteHrPayrollRecord"), "error");
        return;
      }
      const id = String(btn.dataset.id || "").trim();
      if (!id) return;
      openConfirmModal({
        title: "Eliminar ausencia",
        message: "Se eliminara este registro de ausencia del expediente digital.",
        confirmText: "Eliminar",
        onConfirm: async () => {
          try {
            await writeAwaitServer(
              KEYS.hrAbsences,
              read(KEYS.hrAbsences, []).filter((a) => String(a.id) !== id)
            );
          } catch (_e) {
            return;
          }
          notify(userMessage("hrAbsenceDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-payroll-run']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyDeleteHrPayrollRecord"), "error");
        return;
      }
      const id = String(btn.dataset.id || "").trim();
      if (!id) return;
      const run = read(KEYS.payrollRuns, []).find((r) => String(r.id) === id);
      openConfirmModal({
        title: "Eliminar liquidacion",
        message: run
          ? `Eliminar el registro de liquidacion (${run.month} · ${run.employeeName}). Solo administradores; no hay deshacer automatico si ya se sincrono con servidor.`
          : "Eliminar este registro de liquidacion.",
        confirmText: "Eliminar liquidacion",
        onConfirm: async () => {
          try {
            await writeAwaitServer(
              KEYS.payrollRuns,
              read(KEYS.payrollRuns, []).filter((r) => String(r.id) !== id)
            );
          } catch (_e) {
            return;
          }
          notify(userMessage("payrollRunDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  const exportPayroll = document.getElementById("export-payroll");
  if (exportPayroll) {
    exportPayroll.addEventListener("click", () => {
      const rows = read(KEYS.payrollRuns, []);
      const csv = [
        "Mes,Tipo,Empleado,Devengado,PrimaServicios,InteresesCesantias,BaseCesantíasIntereses,DíasInterés360,Viaticos,ReembolsoCombustible,IBC,Salud,Pension,Solidaridad,Deducciones,Neto,Estado"
      ]
        .concat(
          rows.map((r) => {
            const tipo =
              String(r.payrollKind || "mensual") === "terminacion" ? "terminacion" : "mensual";
            const esc = (v) =>
              `"${String(v ?? "")
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '""')}"`;
            return [
              r.month,
              tipo,
              r.employeeName,
              r.gross,
              r.primaServiciosCop ?? 0,
              r.interesesCesantiasCop ?? 0,
              r.cesantiasInterestBaseCop ?? "",
              r.cesantiasInterestDays ?? "",
              r.travelAllowance || 0,
              r.fuelReimbursement || 0,
              r.ibc || 0,
              r.health || 0,
              r.pension || 0,
              r.solidarity || 0,
              r.deductions,
              r.net,
              r.paid ? "Pagado" : "Pendiente"
            ]
              .map((cell) =>
                typeof cell === "number" ? cell : esc(cell)
              )
              .join(",");
          })
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nomina_resumen.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const vacancyForm = document.getElementById("form-vacancy");
  if (vacancyForm) {
    attachDepartmentCitySelects(vacancyForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    const positionSelect = vacancyForm.querySelector("select[name='positionId']");
    const titleInput = vacancyForm.querySelector("input[name='title']");
    if (positionSelect && titleInput) {
      const syncTitleFromPosition = () => {
        if (titleInput.value.trim()) return;
        const position = getPositionById(String(positionSelect.value || ""));
        if (position) titleInput.value = `Vacante ${position.name}`;
      };
      positionSelect.addEventListener("change", syncTitleFromPosition);
      syncTitleFromPosition();
    }

    vacancyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(vacancyForm).entries());
      const deadlineOk = (() => {
        const s = String(data.deadline || "").trim();
        const parts = s.split("-");
        if (parts.length !== 3) return false;
        const cand = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
        if (!Number.isFinite(cand)) return false;
        const t = new Date();
        const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
        return cand >= t0;
      })();
      if (!deadlineOk) {
        notify(userMessage("vacancyDeadlineFuture"), "error");
        return;
      }
      const position = getPositionById(String(data.positionId || ""));
      if (!position || position.active === false) {
        notify(userMessage("vacancySelectPosition"), "error");
        return;
      }
      const salaryOffer = parseNum(data.salaryOffer);
      if (salaryOffer < CO_HR_RULES.minMonthlySalary) {
        notify(userMessage("recruitSalaryBelowMin", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")), "error");
        return;
      }
      const all = read(KEYS.vacancies, []);
      all.unshift({
        id: newUuidV4(),
        ...data,
        openings: Math.max(1, parseNum(data.openings || 1)),
        salaryOffer,
        positionName: position.name,
        workerRole: position.workerRole || "empleado",
        contractTypeDefault: position.contractTypeDefault || "Termino indefinido",
        status: "Publicada",
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.vacancies, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la vacante en el servidor."), "error");
        return;
      }
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.vacancyFilter = "open";
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      state.createPanels = { ...(state.createPanels || {}), "create-vacancy": false };
      notify(userMessage("vacancyPublishedOk"), "success");
      renderPortalView();
    });
  }

  const positionForm = document.getElementById("form-position");
  if (positionForm) {
    positionForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(positionForm).entries());
      const minSalary = CO_HR_RULES.minMonthlySalary;
      if (parseNum(data.baseSalary) < minSalary) {
        notify(userMessage("positionSalaryBaseMin", minSalary.toLocaleString("es-CO")), "error");
        return;
      }
      const all = read(KEYS.positions, []);
      all.unshift({
        id: newUuidV4(),
        name: String(data.name || "").trim(),
        workerRole: String(data.workerRole || "empleado"),
        baseSalary: parseNum(data.baseSalary),
        contractTypeDefault: String(data.contractTypeDefault || "Termino indefinido"),
        legalBasis: String(data.legalBasis || "CST art. 45-46 y normatividad laboral vigente"),
        active: true,
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.positions, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el cargo en el servidor."), "error");
        return;
      }
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      state.createPanels = { ...(state.createPanels || {}), "create-position": false };
      notify(userMessage("positionCreatedOk"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-position']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const all = read(KEYS.positions, []);
      const target = all.find((p) => p.id === btn.dataset.id);
      if (!target) return;
      const nextPositions = all.map((p) => (p.id === target.id ? { ...p, active: target.active === false } : p));
      try {
        await writeAwaitServer(KEYS.positions, nextPositions);
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar el cargo en el servidor."), "error");
        return;
      }
      notify(target.active === false ? userMessage("positionActivated") : userMessage("positionDeactivated"), "info");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-vacancy']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const all = read(KEYS.vacancies, []);
      const nextVacancies = all.map((v) => (v.id === btn.dataset.id ? { ...v, status: "Cerrada" } : v));
      try {
        await writeAwaitServer(KEYS.vacancies, nextVacancies);
      } catch (err) {
        notify(String(err?.message || "No fue posible cerrar la vacante en el servidor."), "error");
        return;
      }
      notify(userMessage("vacancyClosed"), "success");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='view-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = read(KEYS.vacancies, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!v) return;
      const sal = parseNum(v.salaryOffer);
      const reqs = escapeHtml(String(v.requirements || "").trim() || "Sin requisitos detallados.");
      const body = `<div class="vacancy-detail-sheet">
        <div class="vacancy-detail-pills">
          <span class="vacancy-pill">${escapeHtml(String(v.positionName || "Cargo"))}</span>
          <span class="vacancy-pill">${escapeHtml(String(v.city || "Ciudad"))}</span>
          <span class="vacancy-pill">${escapeHtml(String(v.modality || "Modalidad"))}</span>
          <span class="vacancy-pill">$${sal.toLocaleString("es-CO")} COP</span>
          <span class="vacancy-pill">Cupos: ${escapeHtml(String(v.openings ?? 1))}</span>
        </div>
        <p><strong>Cierre postulaciones:</strong> ${escapeHtml(String(v.deadline || "—"))}</p>
        <div class="vacancy-detail-reqs"><strong>Requisitos y perfil</strong><p class="muted" style="margin:0.35rem 0 0;white-space:pre-wrap">${reqs}</p></div>
      </div>`;
      openInfoModal({
        title: String(v.title || "Vacante"),
        subtitle: `${String(v.department || "").trim()} · ${String(v.workerRole || "").trim() || "RR.HH."}`,
        bodyHtml: body,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyModule"), "error");
        return;
      }
      const id = String(btn.dataset.id || "").trim();
      if (!id) return;
      openConfirmModal({
        title: "Eliminar vacante",
        message:
          "Se eliminara la vacante del listado. Esta accion no borra candidatos ya postulados en el pipeline, pero puede dejar registros con referencia huérfana.",
        confirmText: "Eliminar vacante",
        onConfirm: async () => {
          try {
            await writeAwaitServer(
              KEYS.vacancies,
              read(KEYS.vacancies, []).filter((v) => String(v.id) !== id)
            );
          } catch (_e) {
            return;
          }
          notify(userMessage("vacancyDeletedOk"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.candidateFilter = "active";
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.candidateFilter = "all";
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-vacancies-open']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.vacancyFilter = state.hiringUi.vacancyFilter === "open" ? "all" : "open";
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-sort-candidates']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.candidateSort = String(btn.dataset.sort || "recent");
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      renderPortalView();
    });
  });

  const candidateForm = document.getElementById("form-candidate");
  if (candidateForm) {
    attachDepartmentCitySelects(candidateForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    bindHrFormWizard(candidateForm);
    candidateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(candidateForm).entries());
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.idDoc = docValidation.normalized;
      const birthRaw = String(data.birthDate || "").trim().slice(0, 10);
      const candAgeInfo = portalCandidateAgeFromBirthIso(birthRaw);
      if (candAgeInfo.age === null) {
        notify("Indique una fecha de nacimiento válida.", "error");
        return;
      }
      if (candAgeInfo.age < 18) {
        notify("El candidato debe ser mayor de 18 años.", "error");
        return;
      }
      const vac = read(KEYS.vacancies, []).find((v) => v.id === data.vacancyId);
      if (!vac) {
        notify(userMessage("hireSelectVacancy"), "error");
        return;
      }
      const filesFromInput = await readCandidateHrAttachmentsFromInput(candidateForm.querySelector("input[name='attachments']"));
      if (filesFromInput === null) return;
      const attachmentList =
        filesFromInput.length > 0
          ? filesFromInput
          : [...(candidateForm.querySelector("input[name='attachments']")?.files ?? [])].map((f) => f.name);
      const expectedSalary = parseNum(data.expectedSalary);
      if (expectedSalary < CO_HR_RULES.minMonthlySalary) {
        notify(
          userMessage("candidateSalaryAspirationMin", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")),
          "error"
        );
        return;
      }
      const availabilityTs = new Date(`${String(data.availabilityDate || "")}T12:00:00`).getTime();
      if (!Number.isFinite(availabilityTs) || availabilityTs < new Date(new Date().toDateString()).getTime()) {
        notify(userMessage("candidateAvailabilityFuture"), "error");
        return;
      }
      const all = read(KEYS.candidates, []);
      all.unshift({
        id: newUuidV4(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        documentType: data.documentType,
        idDoc: data.idDoc,
        birthDate: birthRaw,
        department: data.department || "",
        city: data.city,
        address: data.address,
        experienceYears: Math.max(0, parseNum(data.experienceYears || 0)),
        expectedSalary,
        availabilityDate: data.availabilityDate || "",
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        status: PIPELINE[0],
        attachments: attachmentList,
        source: "Portal RRHH",
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.candidates, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el candidato en el servidor."), "error");
        return;
      }
      sendEmail({ to: data.email, subject: "Registro recibido", body: "Gracias por aplicar." });
      try {
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.candidateFilter = "active";
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      state.createPanels = { ...(state.createPanels || {}), "create-candidate": false };
      notify(userMessage("candidateRegisteredOk"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='candidate-status']").forEach((select) => {
    select.addEventListener("change", async () => {
      const all = read(KEYS.candidates, []);
      const currentCandidate = all.find((c) => c.id === select.dataset.id);
      if (!currentCandidate) return;
      const statusValidation = validateCandidatePipelineTransition(currentCandidate, select.value);
      if (!statusValidation.ok) {
        notify(statusValidation.message, "error");
        renderPortalView();
        return;
      }
      const updated = all.map((c) => (c.id === select.dataset.id ? { ...c, status: select.value } : c));
      try {
        await writeAwaitServer(KEYS.candidates, updated);
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar el candidato en el servidor."), "error");
        renderPortalView();
        return;
      }
      const current = updated.find((c) => c.id === select.dataset.id);
      if (current) {
        sendEmail({
          to: current.email,
          subject: "Actualizacion de proceso",
          body: `Tu estado cambio a: ${current.status}`
        });
        try {
          await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
        } catch (_e) {}
      }
      notify(userMessage("candidateUpdated"), "success");
      renderPortalView();
    });
  });

  const interviewForm = document.getElementById("form-interview");
  if (interviewForm) {
    interviewForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(interviewForm).entries());
      const interviewTs = new Date(String(data.when || "")).getTime();
      if (!Number.isFinite(interviewTs) || interviewTs < Date.now()) {
        notify(userMessage("interviewScheduleFuture"), "error");
        return;
      }
      const candidate = read(KEYS.candidates, []).find((c) => c.id === data.candidateId);
      if (!candidate) {
        notify(userMessage("interviewCandidateMissing"), "error");
        return;
      }
      if (["Descartado", "Contratado"].includes(String(candidate.status || ""))) {
        notify(userMessage("interviewInvalidCandidate"), "error");
        return;
      }
      const all = read(KEYS.interviews, []);
      all.unshift({
        id: newUuidV4(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        when: data.when,
        interviewer: data.interviewer,
        modality: data.mode || "",
        locationOrLink: data.place || "",
        notes: data.notes || ""
      });
      try {
        await writeAwaitServer(KEYS.interviews, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la entrevista en el servidor."), "error");
        return;
      }
      const candidateList = read(KEYS.candidates, []);
      const nextCandidates = candidateList.map((item) =>
        item.id === candidate.id && ["Recibido", "Preseleccionado"].includes(String(item.status || ""))
          ? { ...item, status: "Entrevistado" }
          : item
      );
      try {
        await writeAwaitServer(KEYS.candidates, nextCandidates);
      } catch (err) {
        notify(String(err?.message || "Entrevista guardada; no fue posible actualizar el estado del candidato en el servidor."), "error");
        renderPortalView();
        return;
      }
      sendEmail({ to: candidate.email, subject: "Entrevista programada", body: `Fecha: ${data.when}` });
      try {
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
      state.hiringUi.workspace = "track";
      persistHrWorkspace("hiring", "track");
      state.createPanels = { ...(state.createPanels || {}), "create-interview": false };
      notify(userMessage("interviewScheduledOk"), "success");
      renderPortalView();
    });
  }

  const contractForm = document.getElementById("form-contract");
  if (contractForm) {
    contractForm.querySelectorAll("[data-action='contract-test-docx']").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        const kind = String(btn.dataset.template || "oficina");
        try {
          await generateOfficialWordContract(buildContractDocxTestPayload(kind));
          notify(userMessage("contractTestDownloaded", kind), "success");
        } catch (err) {
          notify(userMessage("contractWordError", String(err?.message || err)), "error");
        }
      });
    });
    const templateSelect = contractForm.querySelector("select[name='contractTemplateKind']");
    const employeeSelect = contractForm.querySelector("select[name='employeeId']");
    const syncTemplateFromEmployee = () => {
      if (!templateSelect || !employeeSelect || !window.RecruitmentDomain?.inferTemplateKind) return;
      if (String(templateSelect.value || "").trim()) return;
      const employee = read(KEYS.payrollEmployees, []).find((item) => String(item.id) === String(employeeSelect.value || ""));
      if (!employee) return;
      const wr = employee.workerRole || (String(employee.position || "").toLowerCase().includes("conductor") ? "conductor" : "empleado");
      templateSelect.value = window.RecruitmentDomain.inferTemplateKind(employee.contractType || "Termino indefinido", wr);
    };
    if (employeeSelect) {
      employeeSelect.addEventListener("change", syncTemplateFromEmployee);
    }

    bindHrFormWizard(contractForm);

    contractForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (contractForm.dataset.submitting === "1") return;
      const data = Object.fromEntries(new FormData(contractForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(data.employeeId || ""));
      if (!employee) {
        notify(userMessage("contractPickEmployee"), "error");
        return;
      }
      const missing = validateEmployeeContractDocFields(employee);
      if (missing.length) {
        notify(userMessage("contractEmployeeMissingFields", missing.join(", ")), "error");
        return;
      }
      const signDate = String(data.signDate || "").trim();
      if (!signDate) {
        notify(userMessage("contractSignDateRequired"), "error");
        return;
      }
      const payload = buildEmployeeContractDocxPayload(employee, {
        contractTemplateKind: data.contractTemplateKind,
        signDate
      });
      const contractText =
        `CONTRATO LABORAL\n` +
        `Empleado: ${employee.name}\n` +
        `Cedula: ${employee.idDoc}\n` +
        `Cargo: ${payload.cargo_empleado}\n` +
        `Tipo: ${payload.contractType}\n` +
        `Plantilla: ${payload.contractTemplateKind}\n` +
        `Salario: ${payload.salario}\n` +
        `Firma constancia: ${signDate}\n`;
      const submitBtn = contractForm.querySelector("button[type='submit']");
      const restoreSubmitState = () => {
        contractForm.dataset.submitting = "";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
        }
      };
      contractForm.dataset.submitting = "1";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
      }
      try {
        await generateOfficialWordContract(payload);
        const all = read(KEYS.contracts, []);
        const empId = String(employee.id || "").trim();
        const empDoc = String(employee.idDoc || "").trim();
        const tplKind = String(payload.contractTemplateKind || "").trim().toLowerCase();
        const matchesExisting = (row) => {
          if (!row) return false;
          const sameEmployee =
            (empId && String(row.employeeId || "") === empId) ||
            (empDoc && String(row.idDocSnapshot || "").trim() === empDoc);
          if (!sameEmployee) return false;
          const sameTemplate =
            String(row.contractTemplateKind || "").trim().toLowerCase() === tplKind;
          const sameStart = String(row.startDate || "").trim() === signDate;
          return sameTemplate && sameStart;
        };
        const existingIdx = all.findIndex(matchesExisting);
        const recordBase = {
          employeeId: employee.id,
          employeeName: employee.name,
          position: payload.cargo_empleado,
          salary: payload.salario,
          startDate: signDate,
          contractType: payload.contractType,
          contractTemplateKind: payload.contractTemplateKind,
          idDocSnapshot: empDoc,
          workerRole: payload.workerRole,
          source: "Empleado",
          content: contractText
        };
        if (existingIdx >= 0) {
          const previous = all[existingIdx];
          all.splice(existingIdx, 1, {
            ...previous,
            ...recordBase,
            id: previous.id,
            createdAt: previous.createdAt || nowIso(),
            updatedAt: nowIso()
          });
          notify("Contrato actualizado (mismo empleado, plantilla y fecha).", "info");
        } else {
          all.unshift({
            id: newUuidV4(),
            ...recordBase,
            createdAt: nowIso()
          });
          notify(userMessage("contractWordSaved"), "success");
        }
        const deduped = dedupContracts(all);
        try {
          await writeAwaitServer(KEYS.contracts, deduped);
          state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "overview" };
          state.hiringUi.workspace = "track";
          persistHrWorkspace("hiring", "track");
          state.createPanels = { ...(state.createPanels || {}), "create-contract": false };
        } catch (persistErr) {
          notify(String(persistErr?.message || "No fue posible guardar el contrato en el servidor."), "error");
        }
      } catch (wordErr) {
        notify(userMessage("contractWordError", String(wordErr?.message || "error")), "error");
      } finally {
        restoreSubmitState();
      }
      renderPortalView();
    });
  }

  const sstComplianceForm = document.getElementById("form-sst-compliance");
  if (sstComplianceForm) {
    sstComplianceForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(sstComplianceForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((item) => String(item.id) === String(data.employeeId || ""));
      if (!employee) {
        notify(userMessage("sstPickEmployee"), "error");
        return;
      }
      const dueDate = String(data.dueDate || "");
      if (!dueDate) {
        notify(userMessage("sstDueDateRequired"), "error");
        return;
      }
      const list = read(KEYS.sstCompliance, []);
      list.unshift({
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        recordType: String(data.recordType || "").trim(),
        provider: String(data.provider || "").trim(),
        dueDate,
        status: String(data.status || "Pendiente"),
        documentCode: String(data.documentCode || "").trim().toUpperCase(),
        notes: String(data.notes || "").trim(),
        createdAt: nowIso(),
        createdBy: currentUser()?.name || "Sistema"
      });
      try {
        await writeAwaitServer(KEYS.sstCompliance, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el registro SST en el servidor."), "error");
        return;
      }
      notify(userMessage("sstRecorded"), "success");
      renderPortalView();
    });
  }

  const profileForm = document.getElementById("form-profile");
  if (profileForm) {
    const profileAvatarInput = document.getElementById("profile-avatar-input");
    const profileAvatarLabel = document.querySelector('label[for="profile-avatar-input"]');
    if (profileAvatarInput && profileAvatarLabel) {
      profileAvatarInput.addEventListener("change", () => {
        const f = profileAvatarInput.files?.[0];
        if (!f || !String(f.type || "").startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = () => {
          const url = String(reader.result || "").trim();
          const cssSafe = employeeAvatarCssUrl(url);
          profileAvatarLabel.style.backgroundImage = cssSafe ? `url('${cssSafe}')` : "";
          profileAvatarLabel.classList.toggle("has-image", Boolean(cssSafe));
          const initial = profileAvatarLabel.querySelector(".profile-avatar-initial");
          if (initial) initial.textContent = "";
        };
        reader.readAsDataURL(f);
      });
    }
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      if (!actor) return;
      const data = Object.fromEntries(new FormData(profileForm).entries());
      const fileInput = profileForm.querySelector("input[name='avatarFile']");
      const file = fileInput?.files?.[0];
      const persistProfile = async (avatarUrlValue = "") => {
        const users = read(KEYS.users, []);
        const company = getCompanyById(String(data.companyId || ""));
        const nextUsers = users.map((u) =>
          u.id === actor.id
            ? {
                ...u,
                name: String(data.name || u.name).trim(),
                phone: normalizePortalPhoneForStorage(String(data.phone || "").trim()),
                taxId: String(data.taxId || "").trim(),
                documentType: String(data.documentType || u.documentType || "CC"),
                birthDate: String(data.birthDate || "").trim(),
                emergencyContact: String(data.emergencyContact || "").trim(),
                emergencyPhone: String(data.emergencyPhone || "").trim(),
                emergencyRelation: String(data.emergencyRelation || "").trim(),
                emergencyRelationship: String(data.emergencyRelation || "").trim(),
                // La fecha de ingreso al sistema es solo lectura: se deriva
                // siempre de la fecha de creación del usuario en el registro
                // (createdAt). Si no existiera todavía en cache, respaldamos
                // con valores previos. Nunca se sobreescribe desde Mi perfil.
                systemJoinDate: profileSystemJoinDateValue(u),
                portalSince: profileSystemJoinDateValue(u),
                companyId: company?.id || u.companyId,
                company: company?.name || u.company,
                avatarUrl: avatarUrlValue || u.avatarUrl || ""
              }
            : u
        );
        try {
          await writeAwaitServer(KEYS.users, nextUsers);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el perfil en el servidor."), "error");
          return;
        }
        notify(userMessage("profileUpdatedOk"), "success");
        renderPortal();
      };
      try {
        if (file) {
          let nextAvatar = "";
          try {
            nextAvatar = await resolveEmployeeAvatarUrl(file, String(actor.avatarUrl || "").trim());
          } catch (presignErr) {
            devWarn?.("profile-avatar-resolve", presignErr);
            notify(String(presignErr?.message || "No fue posible subir la foto. Intente de nuevo."), "error");
            return;
          }
          const trimmed = String(nextAvatar || "").trim();
          if (!trimmed) {
            notify("No se obtuvo una imagen válida para el perfil.", "error");
            return;
          }
          await persistProfile(trimmed);
        } else {
          await persistProfile("");
        }
      } catch (err) {
        if (err && String(err.message || err).trim()) {
          notify(String(err.message || err), "error");
        }
      }
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='approval-approve']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = String(btn.dataset.id || "");
      const approvals = read(KEYS.approvals, []);
      const approval = approvals.find((a) => a.id === id && a.status === "pendiente");
      const actor = currentUser();
      if (!approval || !actor || actor.role !== ROLES.ADMIN) return;

      if (approval.type === "create_user") {
        const pwPol = validatePasswordPolicy(approval.payload.password || "");
        if (!pwPol.ok) {
          notify(userMessage(pwPol.key), "error");
          return;
        }
        const users = read(KEYS.users, []);
        if (!users.some((u) => normalizeEmail(u.email) === normalizeEmail(approval.payload.email))) {
          const p = approval.payload;
          const compName = p.companyName || getCompanyById(p.companyId)?.name || "";
          users.push({
            id: newUuidV4(),
            name: normalizeLatinForDb(p.name),
            email: normalizeEmail(p.email),
            password: await hashPassword(p.password),
            role: p.role,
            documentType: p.documentType || "CC",
            personType: normalizePersonTypeForDb(p.personType),
            documentIssuedAt: p.documentIssuedAt || "",
            accountStatus: ACCOUNT_STATUS.APROBADO,
            company: normalizeLatinForDb(compName),
            companyId: p.companyId,
            taxId: p.taxId,
            phone: normalizePortalPhoneForStorage(p.phone || ""),
            city: normalizeLatinForDb(p.city || ""),
            department: normalizeLatinForDb(p.department || ""),
            address: normalizeLatinForDb(p.address || ""),
            permissions:
              p.role === ROLES.ADMIN
                ? [...ALL_PERMISSIONS]
                : (p.permissions || defaultPermissionsForRole(p.role))
          });
          try {
            await writeAwaitServer(KEYS.users, users);
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
        }
      } else if (approval.type === "create_employee") {
        const employees = read(KEYS.payrollEmployees, []);
        const payload = { ...approval.payload };
        const pos = payload.positionId ? getPositionById(String(payload.positionId)) : null;
        if (pos) {
          payload.position = pos.name;
          payload.workerRole = pos.workerRole || payload.workerRole || "empleado";
          payload.contractType = payload.contractType || pos.contractTypeDefault || "Termino indefinido";
        }
        employees.push({ id: newUuidV4(), workerRole: payload.workerRole || "empleado", ...payload });
        try {
          await writeAwaitServer(KEYS.payrollEmployees, employees);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
      } else if (approval.type === "create_driver") {
        const drivers = read(KEYS.drivers, []);
        drivers.push({ id: newUuidV4(), ...approval.payload, available: true, hiredAt: nowIso() });
        try {
          await writeAwaitServer(KEYS.drivers, drivers);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
        const employees = read(KEYS.payrollEmployees, []);
        const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(approval.payload.idDoc || ""));
        if (!existsEmployee) {
          employees.push({
            id: newUuidV4(),
            name: approval.payload.name,
            idDoc: approval.payload.idDoc,
            documentType: approval.payload.documentType || "CC",
            position: "Conductor",
            contractType: approval.payload.contractType || "Indefinido",
            workerRole: "conductor",
            city: approval.payload.city || "",
            address: approval.payload.address || "",
            phone: approval.payload.phone || "",
            emergencyContact: approval.payload.emergencyContact || "",
            emergencyPhone: approval.payload.emergencyPhone || "",
            companyId: approval.payload.companyId || "",
            baseSalary: parseNum(approval.payload.baseSalary),
            payFrequency: "Mensual",
            startDate: approval.payload.startDate || nowIso().slice(0, 10)
          });
          try {
            await writeAwaitServer(KEYS.payrollEmployees, employees);
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
        }
      } else if (approval.type === "register_hr_absence") {
        const absences = read(KEYS.hrAbsences, []);
        absences.unshift({
          ...approval.payload,
          id: isUuidString(approval.payload?.id) ? String(approval.payload.id).trim() : newUuidV4(),
          approvedBy: actor.name,
          approvedAt: nowIso()
        });
        try {
          await writeAwaitServer(KEYS.hrAbsences, absences);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
      } else if (approval.type === "mark_payroll_paid") {
        const payrollRunId = String(approval.payload?.payrollRunId || "");
        if (!payrollRunId) {
          notify(userMessage("paymentNoSettlement"), "error");
          return;
        }
        const runs = read(KEYS.payrollRuns, []);
        const targetRun = runs.find((r) => r.id === payrollRunId);
        if (!targetRun) {
          notify(userMessage("settlementNotFound"), "error");
          return;
        }
        try {
          await writeAwaitServer(
            KEYS.payrollRuns,
            runs.map((r) => (r.id === payrollRunId ? { ...r, paid: true, paidAt: nowIso(), paidApprovedBy: actor.name } : r))
          );
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
      } else if (approval.type === "approve_trip_request") {
        const requestId = String(approval.payload.requestId || "");
        const request = reqRead().find((item) => item.id === requestId);
        if (!request) {
          notify(userMessage("approvalLinkedRequestMissing"), "error");
          return;
        }

        const needsTermoking = serviceTypeRequiresRefrigeration(request.serviceType);
        const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
        const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
        const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
        const driverCandidates = getDriverCandidatesForRequest(request, requestId);
        const tripRateUi = buildTripRateModalFields(request, { required: false });

        openEditModal({
          title: "Aprobar solicitud de viaje",
          subtitle: "Puede asignar camión y conductor ahora, o dejar pendiente para asignación manual.",
          submitText: "Aprobar",
          afterMount: tripRateUi.afterMount,
          fields: [
            {
              name: "vehicleId",
              label: needsTermoking ? "Camion con Termoking (opcional)" : "Camion (opcional)",
              type: "select",
              options: [
                { value: "", label: "Dejar sin asignar por ahora" },
                ...vehicleCandidates.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.plate} · ${vehicle.type} · ${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg · ${vehicle.refrigerated ? "Refrigerado" : "Seco"}${vehicle.isBusy ? " · OCUPADO" : ""}${vehicle.hasExpiredDocs ? " · DOCUMENTOS VENCIDOS" : ""}`
                }))
              ]
            },
            {
              name: "driverId",
              label: "Conductor (opcional)",
              type: "select",
              options: [
                { value: "", label: "Dejar sin asignar por ahora" },
                ...driverCandidates.map((driver) => ({
                  value: driver.id,
                  label: `${driver.name} · Lic ${driver.license || "-"} · vence ${driver.licenseExpiry || "-"}${driver.isBusy ? " · OCUPADO" : ""}${driver.hasExpiredDocs ? " · LICENCIA VENCIDA" : ""}`
                }))
              ]
            },
            ...tripRateUi.fields
          ],
          onSubmit: async (form) => {
            const vehicleId = String(form.vehicleId || "").trim();
            const driverId = String(form.driverId || "").trim();
            const tripValue = parseNum(form.tripValue);

            if ((vehicleId && !driverId) || (!vehicleId && driverId)) {
              notify(userMessage("assignAutoPickResources"), "error");
              return false;
            }
            if (vehicleId && driverId && tripValue <= 0) {
              notify(userMessage("assignPriceRequired"), "error");
              return false;
            }
            if (vehicleId && driverId && (!compatibleVehicles.some((v) => v.id === vehicleId) || !compatibleDrivers.some((d) => d.id === driverId))) {
              notify(userMessage("assignResourcesBusy"), "error");
              return false;
            }

            const ok = vehicleId && driverId
              ? approveRequest(requestId, actor.name, false, vehicleId, driverId, tripValue)
              : approveRequest(requestId, actor.name, true);

            if (!ok) {
              notify(userMessage("approvalResourcesFailed"), "error");
              return false;
            }

            const latestApprovals = read(KEYS.approvals, []);
            try {
              await writeAwaitServer(
                KEYS.approvals,
                latestApprovals.map((a) =>
                  a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
                )
              );
            } catch (err) {
              notify(String(err?.message || "No fue posible guardar la autorización en el servidor."), "error");
              return false;
            }

            suppressSelfInboxPollToastIfRecipientIsCurrentUser(request?.clientUserId);
            notify(
              vehicleId && driverId ? userMessage("authApprovalWithTrip") : userMessage("authApprovalPendingManual"),
              "success"
            );
            renderPortalView();
            return true;
          }
        });
        return;
      }

      try {
        await writeAwaitServer(
          KEYS.approvals,
          approvals.map((a) =>
            a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
          )
        );
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la autorización en el servidor."), "error");
        return;
      }
      notify(userMessage("authApprovalOk"), "success");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approval-reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      openEditModal({
        title: "Rechazar autorización",
        subtitle: "Motivo obligatorio",
        submitText: "Rechazar",
        fields: [{ name: "reason", label: "Motivo", value: "", required: true }],
        onSubmit: async (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          const actor = currentUser();
          const approvals = read(KEYS.approvals, []);
          try {
            await writeAwaitServer(
              KEYS.approvals,
              approvals.map((a) =>
                a.id === id
                  ? { ...a, status: "rechazado", reviewedAt: nowIso(), reviewedBy: actor?.name || "Admin", rejectionReason: reason }
                  : a
              )
            );
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el rechazo en el servidor."), "error");
            return false;
          }
          notify(userMessage("authRejectOk"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='view-contract']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const c = read(KEYS.contracts, []).find((x) => x.id === btn.dataset.id);
      if (!c) return;
      const employee = c.employeeId ? read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(c.employeeId)) : null;
      const displayName = c.candidateName || c.employeeName || employee?.name || "Contrato";
      const docId = String(c.idDocSnapshot || employee?.idDoc || "").trim();
      const salaryVal = parseNum(c.salary);
      const templateKind = String(c.contractTemplateKind || "").trim().toLowerCase();
      const contractType = String(c.contractType || employee?.contractType || "").trim();
      const workerRole = String(c.workerRole || employee?.workerRole || "empleado");

      try {
        if (employee && validateEmployeeContractDocFields(employee).length === 0) {
          await generateOfficialWordContract(
            buildEmployeeContractDocxPayload(employee, {
              contractTemplateKind: templateKind,
              signDate: c.startDate || employee.startDate
            })
          );
        } else {
          const salLet =
            salaryVal > 0 && window.RecruitmentDomain?.formatSalarioLetrasPesos
              ? window.RecruitmentDomain.formatSalarioLetrasPesos(salaryVal)
              : "";
          await generateOfficialWordContract({
            contractTemplateKind: templateKind,
            contractType,
            workerRole,
            nombre_empleado: displayName,
            cedula_empleado: docId,
            ciudad_empleado: String(employee?.city || c.companyName || "").trim(),
            banco_cuenta_bancaria: String(employee?.bankName || "").trim(),
            cuenta_bancaria: String(employee?.bankAccount || "").trim(),
            salario: salaryVal,
            salario_letras: salLet || "",
            duracion_contrato: describeContractDurationForDocx({
              contractType: contractType || "Termino indefinido",
              startDate: c.startDate || "",
              endDate: c.endDate || ""
            }),
            cargo_empleado: String(c.position || employee?.position || ""),
            signDate: c.startDate
          });
        }
        notify(userMessage("wordTemplatesRedownloaded"), "success");
      } catch (err) {
        const popup = window.open("", "_blank", "width=800,height=900");
        popup.document.write(`
        <html>
          <head><title>Contrato</title></head>
          <body style="font-family:Arial;padding:28px">
            <h1>Contrato laboral (resumen interno)</h1>
            <p class="muted">No se pudo regenerar el Word: ${String(err?.message || err).replace(/</g, "&lt;")}</p>
            <pre style="white-space:pre-wrap;font-size:15px;line-height:1.6">${c.content}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
        popup.document.close();
      }
    });
  });

  mountAuthorizationsTabs();
}

function initGlobalEvents() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const opener = target.closest("#open-auth, #open-auth-hero");
    if (!opener) return;
    event.preventDefault();
    showAuth();
  });

  const savedTheme = String(localStorage.getItem(UI_PREFS.theme) || "light");
  const savedLang = String(localStorage.getItem(UI_PREFS.publicLang) || "es");
  applyTheme(savedTheme);
  state.publicLang = savedLang === "en" ? "en" : "es";
  applyPublicLanguage(state.publicLang);

  nodes.closeAuth?.addEventListener("click", hideAuth);

  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav");
  if (hamburgerBtn && mainNav) {
    const syncPublicNavDrawer = () => {
      const open = mainNav.classList.contains("nav-open");
      document.body.classList.toggle("public-nav-open", open);
      hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    hamburgerBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      mainNav.classList.toggle("nav-open");
      syncPublicNavDrawer();
    });
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("nav-open");
        syncPublicNavDrawer();
      });
    });
    document.addEventListener("click", (event) => {
      if (!mainNav.classList.contains("nav-open")) return;
      const t = event.target;
      if (mainNav.contains(t) || hamburgerBtn.contains(t)) return;
      mainNav.classList.remove("nav-open");
      syncPublicNavDrawer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !mainNav.classList.contains("nav-open")) return;
      mainNav.classList.remove("nav-open");
      syncPublicNavDrawer();
      hamburgerBtn.focus();
    });
    window.addEventListener("resize", () => {
      if (!window.matchMedia("(min-width: 921px)").matches) return;
      if (!mainNav.classList.contains("nav-open")) return;
      mainNav.classList.remove("nav-open");
      syncPublicNavDrawer();
    });
  }

  const portalMenuBtn = document.getElementById("portal-menu-btn");
  const portalBackdrop = document.getElementById("portal-nav-backdrop");
  if (portalMenuBtn && portalBackdrop) {
    portalMenuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      setPortalDrawerOpen(!document.body.classList.contains("portal-drawer-open"));
    });
    portalBackdrop.addEventListener("click", () => setPortalDrawerOpen(false));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) setPortalDrawerOpen(false);
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !document.body.classList.contains("portal-drawer-open")) return;
    setPortalDrawerOpen(false);
    document.getElementById("portal-menu-btn")?.focus();
  });

  if (nodes.themeButtonsPublic.length || nodes.themeButtonsPortal.length) {
    [...nodes.themeButtonsPublic, ...nodes.themeButtonsPortal].forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(String(btn.dataset.themeOption || "light"));
      });
    });
  }

  if (nodes.langButtonsPublic.length) {
    nodes.langButtonsPublic.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.publicLang = String(btn.dataset.langOption || "es") === "en" ? "en" : "es";
        localStorage.setItem(UI_PREFS.publicLang, state.publicLang);
        applyPublicLanguage(state.publicLang);
        initPublicCareers();
      });
    });
  }
  if (nodes.langTogglePublic) {
    nodes.langTogglePublic.addEventListener("change", () => {
      state.publicLang = String(nodes.langTogglePublic.value || "es") === "en" ? "en" : "es";
      localStorage.setItem(UI_PREFS.publicLang, state.publicLang);
      applyPublicLanguage(state.publicLang);
      initPublicCareers();
    });
  }
  nodes.authTabs.forEach((tabBtn) =>
    tabBtn.addEventListener("click", () => {
      if (state.authSupabaseRecovery) return;
      state.authTab = tabBtn.dataset.tab;
      renderAuthTab();
    })
  );

  wireSupabasePasswordRecoveryUi();

  nodes.b2bForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    syncPhoneHiddenFull(nodes.b2bForm, "b2b");
    nodes.b2bForm.querySelectorAll("input,select,textarea").forEach((field) => clearFieldError(field));
    const data = Object.fromEntries(new FormData(nodes.b2bForm).entries());
    const emailValue = normalizeEmail(data.email);
    const messageValue = String(data.message || "").trim();
    const monthlyVolume = parseNum(data.monthlyVolumeKg);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(emailValue);
    const meta = getSelectedPhoneCountry(nodes.b2bForm, "b2b");
    const phoneDigitsAll = String(data.phone || "").replace(/\D/g, "");

    const errors = [];
    const jumpToStepForField = (selector) => {
      const field = nodes.b2bForm.querySelector(selector);
      const pane = field?.closest("[data-step-pane]");
      const paneIndex = pane ? Number(pane.getAttribute("data-step-pane")) : 0;
      if (typeof nodes.b2bForm.__setB2BStep === "function" && Number.isFinite(paneIndex)) {
        nodes.b2bForm.__setB2BStep(paneIndex);
      }
    };
    if (!emailValid) {
      setFieldError(nodes.b2bForm.querySelector("input[name='email']"), "Ingresa un correo corporativo valido.");
      errors.push("email");
    }
    const natPhoneField = nodes.b2bForm.querySelector(".js-b2b-phone-national");
    let phoneErrMsg = "";
    if (!phoneDigitsAll.startsWith(meta.dial)) {
      phoneErrMsg = "El telefono no coincide con el pais seleccionado en el indicativo.";
    } else {
      const nationalLen = phoneDigitsAll.length - meta.dial.length;
      if (nationalLen < meta.minNat || nationalLen > meta.maxNat) {
        phoneErrMsg =
          meta.style === "co"
            ? "Ingrese un celular colombiano valido (10 digitos nacionales; puede incluir +57 en el mismo campo o usar solo el numero local)."
            : `Ingrese entre ${meta.minNat} y ${meta.maxNat} digitos del numero local para ${meta.label}.`;
      } else if (meta.style === "co") {
        const nat = phoneDigitsAll.slice(meta.dial.length);
        if (!nat.startsWith("3")) {
          phoneErrMsg = "El celular en Colombia debe ser movil (empieza por 3).";
        }
      }
    }
    if (phoneErrMsg) {
      setFieldError(natPhoneField, phoneErrMsg);
      errors.push("phone");
    }
    if (messageValue.length < 30) {
      setFieldError(nodes.b2bForm.querySelector("textarea[name='message']"), "Cuéntanos un poco mas del requerimiento (minimo 30 caracteres).");
      errors.push("message");
    }
    if (monthlyVolume < 100) {
      setFieldError(nodes.b2bForm.querySelector("input[name='monthlyVolumeKg']"), "Ingresa un volumen mensual mayor o igual a 100 kg.");
      errors.push("volume");
    }
    if (errors.length) {
      const firstError = errors[0];
      if (firstError === "email") jumpToStepForField("input[name='email']");
      if (firstError === "phone") jumpToStepForField(".js-b2b-phone-national");
      if (firstError === "message") jumpToStepForField("textarea[name='message']");
      if (firstError === "volume") jumpToStepForField("input[name='monthlyVolumeKg']");
      notify(userMessage("b2bFieldsInvalid"), "error");
      return;
    }

    data.email = emailValue;
    data.phone = String(data.phone || "").trim();
    data.message = messageValue;
    data.monthlyVolumeKg = monthlyVolume;

    const api = window.AntaresApi;
    const apiBase = typeof api?.getBase === "function" ? api.getBase() : "";
    if (!apiBase || typeof api?.postJsonPublic !== "function") {
      notify(userMessage("b2bApiMissing"), "error");
      return;
    }
    try {
      await api.postJsonPublic("/public/b2b-prospect", {
        name: data.name,
        company: data.company,
        taxId: data.taxId,
        position: data.position,
        phone: data.phone,
        email: data.email,
        serviceType: data.serviceType,
        operationType: data.operationType,
        operationFrequency: data.operationFrequency,
        startWindow: data.startWindow,
        monthlyVolumeKg: monthlyVolume,
        message: messageValue
      });
      nodes.b2bForm.reset();
      if (typeof nodes.b2bForm.__setB2BStep === "function") nodes.b2bForm.__setB2BStep(0);
      notify(userMessage("b2bContactSent"), "success");
    } catch (err) {
      notify(String(err?.message || userMessage("b2bServerError")), "error");
    }
  });

  nodes.sideLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setView(link.dataset.view);
      setPortalDrawerOpen(false);
    });
  });

  window.addEventListener("hashchange", () => {
    const user = currentUser();
    if (!state.session || !user) return;
    const urlView = viewFromPortalHash();
    if (!urlView) return;
    if (!isViewAllowedForUser(user, urlView)) {
      state.currentView = "dashboard";
      syncPortalHash("dashboard");
      renderPortalView();
      return;
    }
    state.currentView = urlView;
    renderPortalView();
  });

  nodes.logout?.addEventListener("click", () => {
    clearSession();
    state.currentView = "dashboard";
    history.replaceState(null, "", window.location.pathname + window.location.search);
    renderPortal();
  });

  initRequiredFieldIndicators();
  initB2BFormExperience();
}

function bindExtendedViewEditHandlers() {
  const renderDetailRows = (pairs) =>
    pairs
      .filter((p) => p && p[1] !== null && p[1] !== undefined && String(p[1]).trim() !== "")
      .map(
        ([label, value]) =>
          `<div class="detail-row"><span class="detail-row-label">${escapeHtml(String(label))}</span><span class="detail-row-value">${value}</span></div>`
      )
      .join("");

  const buildDetailGrid = (sections) =>
    sections
      .filter((sec) => sec && sec.rows && sec.rows.trim())
      .map(
        (sec) =>
          `<section class="detail-section"><h4 class="detail-section-title">${IC[sec.icon] || ""}<span>${escapeHtml(sec.title)}</span></h4><div class="detail-section-grid">${sec.rows}</div></section>`
      )
      .join("");

  const fmtMoney = (val) => `$${parseNum(val).toLocaleString("es-CO")}`;
  const fmtBool = (val) => (val ? "Sí" : "No");
  const fmtDateOr = (val, fallback = "—") => {
    const s = String(val || "").trim();
    return s ? escapeHtml(s) : fallback;
  };

  /** Postulación web (API/R2): adjuntos_json con kind cv_file | cv_blob | cv_filename · Local: solo nombres o cv_blob desde RRHH. */
  const parseCandidateAttachmentsForView = (raw) => {
    let experienceFromJson = "";
    /** @type {string[]} */
    const parts = [];

    const safeHttps = (u) => {
      const s = String(u || "").trim();
      return /^https:\/\/.+/i.test(s) ? s : "";
    };
    /** MIME permitido conservador para armar data: URL desde JSON almacenado. */
    const safeMimeForDataUrl = (m) => {
      const base = String(m || "application/octet-stream")
        .split(";")[0]
        ?.trim()
        .toLowerCase();
      if (/^[\w/+.-]+$/.test(base) && base.length < 96) return base;
      return "application/octet-stream";
    };

    const walk = (arr) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (item == null) continue;
        if (typeof item === "string") {
          const n = String(item).trim();
          if (n) parts.push(`<span class="perm-tag" title="${escapeAttr(n)}">${IC.file}<span>${escapeHtml(n)}</span></span>`);
          continue;
        }
        if (typeof item !== "object") continue;
        const k = String(item.kind || "");
        if (k === "experience_notes" && item.text) {
          experienceFromJson = String(item.text || "").trim();
          continue;
        }
        if (k === "cv_filename" && item.name) {
          const n = escapeHtml(String(item.name).trim());
          parts.push(`<span class="perm-tag">${IC.file}<span>${n}</span></span>`);
          continue;
        }
        if (k === "cv_file") {
          const displayName = escapeHtml(String(item.name || "Hoja de vida").trim());
          const url = safeHttps(item.url);
          if (url) {
            parts.push(
              `<a class="btn btn-sm btn-outline" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" download>${IC.download} Ver / descargar</a> <span class="muted">${displayName}</span>`
            );
          } else if (item.storageKey) {
            parts.push(
              `<span class="perm-tag">${IC.file}<span>${displayName}</span></span> <span class="muted" title="${escapeAttr(String(item.storageKey))}">(objeto guardado sin URL publica configurada)</span>`
            );
          } else {
            parts.push(`<span class="perm-tag">${IC.file}<span>${displayName}</span></span>`);
          }
          continue;
        }
        if (k === "cv_blob" && item.data && item.mime) {
          const dn = escapeAttr(String(item.name || "hoja-de-vida").slice(0, 120));
          const mime = safeMimeForDataUrl(item.mime);
          const href = `data:${mime};base64,${String(item.data)}`;
          parts.push(
            `<a class="btn btn-sm btn-outline" href="${escapeAttr(href)}" download="${dn}">${IC.download} Descargar</a> <span class="muted">${escapeHtml(String(item.name || "Adjunto"))}</span>`
          );
          continue;
        }
      }
    };

    if (Array.isArray(raw)) walk(raw);
    else if (raw != null && typeof raw === "object" && typeof raw !== "bigint") walk([raw]);
    else if (typeof raw === "string" && raw.trim()) {
      try {
        walk(JSON.parse(raw));
      } catch (_e) {
        const n = raw.trim();
        parts.push(`<span class="perm-tag">${escapeHtml(n)}</span>`);
      }
    }

    return {
      attachmentsHtml: parts.filter(Boolean).join(" "),
      experienceFromJson
    };
  };

  /* ============= VEHÍCULO: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = read(KEYS.vehicles, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!v) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const soat = docExpiryStatus(v.soatExpeditionDate);
      const tec = docExpiryStatus(v.techInspectionExpeditionDate);
      const sections = [
        {
          icon: "truck",
          title: "Identificación",
          rows: renderDetailRows([
            ["Placa", `<strong>${escapeHtml(String(v.plate || ""))}</strong>`],
            ["Marca", escapeHtml(String(v.brand || "-"))],
            ["Línea/Modelo", escapeHtml(String(v.model || "-"))],
            ["Año", escapeHtml(String(v.year || "-"))],
            ["Color", escapeHtml(String(v.color || "-"))],
            ["Tipo", escapeHtml(String(v.type || "-"))]
          ])
        },
        {
          icon: "layers",
          title: "Características",
          rows: renderDetailRows([
            ["Carrocería", escapeHtml(String(v.bodyType || "-"))],
            ["Refrigerado", fmtBool(v.refrigerated)],
            ["Capacidad", `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg`],
            ["Combustible", escapeHtml(String(v.fuelType || "-"))],
            ["Ejes", escapeHtml(String(v.axleConfig || "-"))],
            ["N° motor", escapeHtml(String(v.engineNumber || "-"))],
            ["Chasis (VIN)", escapeHtml(String(v.vin || "-"))]
          ])
        },
        {
          icon: "shield",
          title: "Documentos legales",
          rows: renderDetailRows([
            ["Tarjeta propiedad", escapeHtml(String(v.ownershipCard || "-"))],
            ["SOAT expedido", `${fmtDateOr(v.soatExpeditionDate)} <span class="status ${soat.cls}">${soat.label}</span>`],
            ["SOAT vence", fmtDateOr(v.soatExpiryDate)],
            ["Tecnomecánica expedida", `${fmtDateOr(v.techInspectionExpeditionDate)} <span class="status ${tec.cls}">${tec.label}</span>`],
            ["Tecnomecánica vence", fmtDateOr(v.techInspectionExpiryDate)],
            ["Póliza RC contractual", escapeHtml(String(v.rcPolicyContract || "-"))],
            ["Póliza RC extracontractual", escapeHtml(String(v.rcPolicyExtra || "-"))],
            ["Vence pólizas RCP", fmtDateOr(v.rcPolicyExpiry)]
          ])
        },
        {
          icon: "mapPin",
          title: "Operación y propietario",
          rows: renderDetailRows([
            ["GPS satelital", fmtBool(v.hasGps)],
            ["Proveedor GPS", escapeHtml(String(v.gpsProvider || "-"))],
            ["Disponibilidad", v.available ? '<span class="status status-viaje_asignado">Disponible</span>' : '<span class="status status-rechazada">Ocupado</span>'],
            ["Propietario", escapeHtml(String(v.ownerName || "-"))],
            ["NIT/Cédula propietario", escapeHtml(String(v.ownerTaxId || "-"))]
          ])
        }
      ];
      openInfoModal({
        title: `Camión ${String(v.plate || "")}`,
        subtitle: `${String(v.brand || "")} · ${String(v.model || "")} · ${String(v.year || "")}`,
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  /* ============= CONDUCTOR: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = read(KEYS.drivers, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!d) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const company = getCompanyById(d.companyId);
      const sections = [
        {
          icon: "user",
          title: "Datos personales",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(String(d.name || "-"))}</strong>`],
            ["Documento", escapeHtml(String(d.idDoc || "-"))],
            ["Teléfono", escapeHtml(String(d.phone || "-"))],
            ["Tipo de sangre", escapeHtml(String(d.bloodType || "-"))],
            ["Contacto emergencia", escapeHtml(String(d.emergencyContact || "-"))],
            ["Tel. emergencia", escapeHtml(String(d.emergencyPhone || "-"))],
            ["Empresa", escapeHtml(String(company?.name || "-"))]
          ])
        },
        {
          icon: "file",
          title: "Licencia y formación",
          rows: renderDetailRows([
            ["N° licencia", escapeHtml(String(d.license || "-"))],
            ["Categoría", escapeHtml(String(d.licenseCategory || "-"))],
            ["Vence licencia", fmtDateOr(d.licenseExpiry)],
            ["Examen psicosensométrico", fmtDateOr(d.psychoTestDate)],
            ["Vence psicosensométrico", fmtDateOr(d.psychoTestExpiry)],
            ["Curso defensivo", escapeHtml(String(d.defensiveCourse || "-"))],
            ["Vence curso defensivo", fmtDateOr(d.defensiveCourseExpiry)],
            ["Años experiencia", String(parseNum(d.experienceYears || 0))]
          ])
        },
        {
          icon: "shield",
          title: "Seguridad social y disciplina",
          rows: renderDetailRows([
            ["EPS", escapeHtml(String(d.eps || "-"))],
            ["ARL", escapeHtml(String(d.arl || "-"))],
            ["Comparendos pendientes", String(parseNum(d.comparendos || 0))],
            ["Disponible", fmtBool(d.available)]
          ])
        }
      ];
      openInfoModal({
        title: `Conductor ${String(d.name || "")}`,
        subtitle: `${String(d.licenseCategory || "")} · ${String(d.idDoc || "")}`,
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  /* ============= EMPRESA: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.companies, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const usersCount = read(KEYS.users, []).filter((u) => String(u.companyId || "") === String(c.id)).length;
      const phoneDisp = c.phone ? formatPortalPhoneForDisplay(String(c.phone)) : "";
      const sections = [
        {
          icon: "briefcase",
          title: "Identificación",
          rows: renderDetailRows([
            ["Razón social", `<strong>${escapeHtml(String(c.name || "-"))}</strong>`],
            ["NIT", escapeHtml(String(c.taxId || c.nit || "-"))],
            ["Tipo", escapeHtml(String(companyKindLabel(c.companyKind) || c.companyKind || "-"))],
            ["Estado", isCompanyRecordActive(c) ? '<span class="status status-viaje_asignado">Activa</span>' : '<span class="status status-rechazada">Inactiva</span>']
          ])
        },
        {
          icon: "mapPin",
          title: "Contacto",
          rows: renderDetailRows([
            ["Teléfono", escapeHtml(String(phoneDisp || "-"))],
            ["Correo", escapeHtml(String(c.email || "-"))],
            ["Dirección", escapeHtml(String(c.address || "-"))],
            ["Ciudad", escapeHtml(String(c.city || "-"))],
            ["Departamento", escapeHtml(String(c.department || "-"))]
          ])
        },
        {
          icon: "users",
          title: "Vínculos",
          rows: renderDetailRows([
            ["Usuarios asociados", `${usersCount}`],
            ["Creada", fmtDateOr(c.createdAt)]
          ])
        }
      ];
      openInfoModal({
        title: String(c.name || "Empresa"),
        subtitle: c.taxId ? `NIT ${String(c.taxId)}` : "",
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  /* ============= USUARIO: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const u = read(KEYS.users, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!u) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const company = getCompanyById(u.companyId);
      const permsHtml = (u.permissions || [])
        .map((p) => `<span class="perm-tag">${escapeHtml(PERMISSION_META[p]?.title || String(p))}</span>`)
        .join(" ");
      const phoneDisp = u.phone ? formatPortalPhoneForDisplay(String(u.phone)) : "";
      const sections = [
        {
          icon: "user",
          title: "Identidad",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(getPortalUserDisplayName(u))}</strong>`],
            ["Correo", escapeHtml(String(u.email || "-"))],
            ["Documento", escapeHtml(String(u.idDoc || u.taxId || "-"))],
            ["Teléfono", escapeHtml(String(phoneDisp || "-"))],
            ["Ciudad", escapeHtml(String(u.city || "-"))],
            ["Departamento", escapeHtml(String(u.department || "-"))]
          ])
        },
        {
          icon: "shield",
          title: "Cuenta y rol",
          rows: renderDetailRows([
            ["Rol", escapeHtml(String(formatPortalRoleLabel(u.role) || u.role || "-"))],
            ["Estado", escapeHtml(String(u.accountStatus || "-"))],
            ["Tipo de vínculo", escapeHtml(String(registrationKindLabel(u.registrationKind) || "-"))],
            ["Empresa", escapeHtml(String(company?.name || u.company || "-"))],
            ["Creado", fmtDateOr(u.createdAt)]
          ])
        },
        {
          icon: "layers",
          title: "Permisos asignados",
          rows: permsHtml ? `<div class="detail-perms-list">${permsHtml}</div>` : `<span class="muted">Sin permisos asignados.</span>`
        }
      ];
      openInfoModal({
        title: getPortalUserDisplayName(u) || "Usuario",
        subtitle: String(u.email || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  /* ============= AUSENCIA: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-hr-absence']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = read(KEYS.hrAbsences, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!a) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const typeLabel = a.absenceType === "incapacidad" ? "Incapacidad" : a.absenceType === "vacaciones" ? "Vacaciones" : a.absenceType === "licencia" ? "Licencia" : "Calamidad";
      const sections = [
        {
          icon: "calendar",
          title: "Detalle",
          rows: renderDetailRows([
            ["Empleado", `<strong>${escapeHtml(String(a.employeeName || "-"))}</strong>`],
            ["Tipo", escapeHtml(typeLabel)],
            ["Inicio", fmtDateOr(a.startDate)],
            ["Fin", fmtDateOr(a.endDate)],
            ["Días", String(parseNum(a.days || 0))],
            ["Soporte (N°)", escapeHtml(String(a.supportNumber || "-"))],
            ["Entidad/EPS", escapeHtml(String(a.epsEntity || "-"))],
            ["Registrado", fmtDateOr(a.createdAt)]
          ])
        },
        {
          icon: "file",
          title: "Observaciones",
          rows: a.notes
            ? `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(String(a.notes))}</p>`
            : `<span class="muted">Sin observaciones.</span>`
        }
      ];
      openInfoModal({
        title: `Ausencia · ${typeLabel}`,
        subtitle: String(a.employeeName || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  /* ============= AUSENCIA: EDITAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='edit-hr-absence']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.hrAbsences, []);
      const target = all.find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!target) return;
      openEditModal({
        title: "Editar ausencia",
        subtitle: String(target.employeeName || ""),
        submitText: "Guardar cambios",
        fields: [
          {
            name: "absenceType",
            label: "Tipo",
            type: "select",
            value: target.absenceType || "incapacidad",
            options: [
              { value: "incapacidad", label: "Incapacidad" },
              { value: "vacaciones", label: "Vacaciones" },
              { value: "licencia", label: "Licencia" },
              { value: "calamidad", label: "Calamidad" }
            ]
          },
          { name: "startDate", label: "Fecha de inicio", type: "date", value: target.startDate || "", required: true },
          { name: "endDate", label: "Fecha de fin", type: "date", value: target.endDate || "", required: true },
          { name: "supportNumber", label: "N° soporte / radicado", value: target.supportNumber || "" },
          { name: "epsEntity", label: "EPS o entidad", value: target.epsEntity || "" },
          { name: "notes", label: "Observaciones", type: "textarea", value: target.notes || "", rows: 3 }
        ],
        onSubmit: (form) => {
          const start = new Date(`${form.startDate}T12:00:00`);
          const end = new Date(`${form.endDate}T12:00:00`);
          if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
            notify("Fechas inválidas.", "error");
            return false;
          }
          if (end.getTime() < start.getTime()) {
            notify(userMessage("absenceDateOrder"), "error");
            return false;
          }
          const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
          write(
            KEYS.hrAbsences,
            all.map((a) =>
              String(a.id) !== String(target.id)
                ? a
                : {
                    ...a,
                    absenceType: String(form.absenceType || a.absenceType),
                    startDate: form.startDate,
                    endDate: form.endDate,
                    days,
                    supportNumber: String(form.supportNumber || "").trim(),
                    epsEntity: String(form.epsEntity || "").trim(),
                    notes: String(form.notes || "").trim()
                  }
            )
          );
          notify("Ausencia actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  /* ============= VACANTE: EDITAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='edit-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.vacancies, []);
      const target = all.find((v) => String(v.id) === String(btn.dataset.id || ""));
      if (!target) return;
      const positions = read(KEYS.positions, []).filter((p) => p.active !== false);
      const positionOpts = [
        { value: "", label: "Seleccione cargo..." },
        ...positions.map((p) => ({ value: p.id, label: `${p.name} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}` }))
      ];
      openEditModal({
        title: "Editar vacante",
        subtitle: String(target.title || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "title", label: "Título de la vacante", value: target.title || "", required: true },
          { name: "positionId", label: "Cargo base", type: "select", value: target.positionId || "", options: positionOpts, required: true },
          { name: "city", label: "Ciudad", value: target.city || "" },
          { name: "department", label: "Departamento", value: target.department || "" },
          {
            name: "modality",
            label: "Modalidad",
            type: "select",
            value: target.modality || "Presencial",
            options: [
              { value: "Presencial", label: "Presencial" },
              { value: "Remoto", label: "Remoto" },
              { value: "Híbrido", label: "Híbrido" }
            ]
          },
          { name: "openings", label: "Cupos", type: "number", value: parseNum(target.openings || 1), required: true },
          { name: "salaryOffer", label: "Salario ofrecido (COP)", type: "number", value: parseNum(target.salaryOffer || 0), required: true },
          { name: "deadline", label: "Cierre postulaciones", type: "date", value: target.deadline || "", required: true },
          { name: "requirements", label: "Requisitos y perfil", type: "textarea", value: target.requirements || "", rows: 4 },
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status || "Publicada",
            options: [
              { value: "Publicada", label: "Publicada" },
              { value: "Cerrada", label: "Cerrada" }
            ]
          }
        ],
        onSubmit: (form) => {
          const salaryOffer = parseNum(form.salaryOffer);
          if (salaryOffer < CO_HR_RULES.minMonthlySalary) {
            notify(userMessage("recruitSalaryBelowMin", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")), "error");
            return false;
          }
          const position = getPositionById(String(form.positionId || ""));
          if (!position) {
            notify(userMessage("vacancySelectPosition"), "error");
            return false;
          }
          write(
            KEYS.vacancies,
            all.map((v) =>
              String(v.id) !== String(target.id)
                ? v
                : {
                    ...v,
                    title: String(form.title || "").trim(),
                    positionId: position.id,
                    positionName: position.name,
                    workerRole: position.workerRole || v.workerRole || "empleado",
                    contractTypeDefault: position.contractTypeDefault || v.contractTypeDefault,
                    city: String(form.city || "").trim(),
                    department: String(form.department || "").trim(),
                    modality: String(form.modality || "").trim(),
                    openings: Math.max(1, parseNum(form.openings || 1)),
                    salaryOffer,
                    deadline: form.deadline || "",
                    requirements: String(form.requirements || "").trim(),
                    status: String(form.status || "Publicada")
                  }
            )
          );
          notify("Vacante actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  /* ============= CARGO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = read(KEYS.positions, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!p) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "briefcase",
          title: "Cargo",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(String(p.name || ""))}</strong>`],
            ["Rol", p.workerRole === "conductor" ? "Conductor" : "Empleado"],
            ["Salario base", fmtMoney(p.baseSalary)],
            ["Tipo de contrato", escapeHtml(String(p.contractTypeDefault || "-"))],
            ["Estado", p.active === false ? '<span class="status status-rechazada">Inactivo</span>' : '<span class="status status-viaje_asignado">Activo</span>'],
            ["Jornada", escapeHtml(String(p.workSchedule || "-"))],
            ["Riesgo ARL", escapeHtml(String(p.arlRiskLevel || "-"))],
            ["Salario integral", fmtBool(String(p.integralSalary) === "true" || p.integralSalary === true)],
            ["Base legal", escapeHtml(String(p.legalBasis || "CST"))],
            ["Creado", fmtDateOr(p.createdAt)]
          ])
        }
      ];
      openInfoModal({
        title: `Cargo: ${String(p.name || "")}`,
        subtitle: p.workerRole === "conductor" ? "Conductor" : "Empleado",
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.positions, []);
      const target = all.find((p) => String(p.id) === String(btn.dataset.id || ""));
      if (!target) return;
      const contractOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.contractTypes.map((c) => ({ value: c, label: c }))
      ];
      const scheduleOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.workSchedule.map((s) => ({ value: s, label: s }))
      ];
      const arlOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.arlRiskLevels.map((s) => ({ value: s, label: s }))
      ];
      openEditModal({
        title: "Editar cargo",
        subtitle: String(target.name || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "name", label: "Nombre del cargo", value: target.name || "", required: true },
          {
            name: "workerRole",
            label: "Rol del cargo",
            type: "select",
            value: target.workerRole || "empleado",
            options: [
              { value: "empleado", label: "Empleado" },
              { value: "conductor", label: "Conductor" }
            ]
          },
          { name: "baseSalary", label: "Salario base (COP)", type: "number", value: parseNum(target.baseSalary || 0), required: true },
          { name: "contractTypeDefault", label: "Contrato sugerido", type: "select", value: target.contractTypeDefault || "", options: contractOpts },
          { name: "workSchedule", label: "Jornada", type: "select", value: target.workSchedule || "", options: scheduleOpts },
          { name: "arlRiskLevel", label: "Nivel ARL", type: "select", value: target.arlRiskLevel || "", options: arlOpts },
          {
            name: "integralSalary",
            label: "Salario integral",
            type: "select",
            value: String(target.integralSalary) === "true" || target.integralSalary === true ? "true" : "false",
            options: [
              { value: "false", label: "No" },
              { value: "true", label: "Sí" }
            ]
          },
          { name: "legalBasis", label: "Base legal", value: target.legalBasis || "CST art. 45-46 y normatividad laboral vigente" }
        ],
        onSubmit: async (form) => {
          const baseSalary = parseNum(form.baseSalary);
          if (baseSalary < CO_HR_RULES.minMonthlySalary) {
            notify(userMessage("positionSalaryBaseMin", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")), "error");
            return false;
          }
          const nextPos = all.map((p) =>
              String(p.id) !== String(target.id)
                ? p
                : {
                    ...p,
                    name: String(form.name || "").trim(),
                    workerRole: String(form.workerRole || "empleado"),
                    baseSalary,
                    contractTypeDefault: String(form.contractTypeDefault || "").trim(),
                    workSchedule: String(form.workSchedule || "").trim(),
                    arlRiskLevel: String(form.arlRiskLevel || "").trim(),
                    integralSalary: String(form.integralSalary || "false") === "true",
                    legalBasis: String(form.legalBasis || "").trim()
                  }
            );
          try {
            await writeAwaitServer(KEYS.positions, nextPos);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el cargo en el servidor."), "error");
            return false;
          }
          notify("Cargo actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.positions, []).find((p) => String(p.id) === id);
      if (!target) return;
      const linkedVacancies = read(KEYS.vacancies, []).filter((v) => String(v.positionId || "") === id).length;
      if (linkedVacancies > 0) {
        notify(`No se puede eliminar: hay ${linkedVacancies} vacante(s) que referencian este cargo. Cierra o reasigna primero.`, "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar cargo",
        message: `Se eliminará permanentemente el cargo "${String(target.name || "")}" del catálogo. Esta acción no afecta empleados o contratos ya guardados.`,
        confirmText: "Eliminar cargo",
        onConfirm: async () => {
          try {
            await writeAwaitServer(KEYS.positions, read(KEYS.positions, []).filter((p) => String(p.id) !== id));
          } catch (_e) {
            return;
          }
          notify("Cargo eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= CANDIDATO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.candidates, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const { attachmentsHtml: attHtml, experienceFromJson } = parseCandidateAttachmentsForView(c.attachments);
      const experienceSummary = String(c.experienceNotes || experienceFromJson || "").trim();
      const ageDisp = portalCandidateAgeFromBirthIso(c.birthDate);
      const attachmentsInner =
        String(attHtml || "").trim() !== ""
          ? attHtml
          : `<span class="muted">Sin archivos adjuntos registrados para este candidato.</span>`;
      const salaryShow = parseNum(c.expectedSalary ?? c.salaryExpectation ?? c.aspiration ?? 0);
      const availShow = String(c.availabilityDate || c.availableFrom || "").trim();
      const statusShow = String(c.status || c.pipelineStage || "").trim();
      const postulationRows = [
        ["Vacante", escapeHtml(String(c.vacancyTitle || "-"))],
        ["Estado", statusShow ? `<span class="status status-en_transito">${escapeHtml(statusShow)}</span>` : ""],
        ["Origen", escapeHtml(String(c.source || "Portal"))],
        ["Años de experiencia en el cargo", `${String(parseNum(c.experienceYears || 0))} años`]
      ];
      if (experienceSummary) {
        postulationRows.push(["Experiencia (resumen)", `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(experienceSummary)}</p>`]);
      }
      postulationRows.push(
        ["Aspiración salarial", fmtMoney(salaryShow)],
        ["Disponibilidad", fmtDateOr(availShow)],
        ["Registrado", fmtDateOr(c.createdAt)]
      );
      const sections = [
        {
          icon: "user",
          title: "Identificación",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(String(c.name || ""))}</strong>`],
            ["Documento", `${escapeHtml(String(c.documentType || "-"))} ${escapeHtml(String(c.idDoc || ""))}`],
            ["Fecha de nacimiento", fmtDateOr(ageDisp.birthLabel === "—" ? "" : ageDisp.birthLabel)],
            ["Edad", ageDisp.age != null ? `${String(ageDisp.age)} años` : "—"],
            ["Correo", escapeHtml(String(c.email || "-"))],
            ["Teléfono", escapeHtml(String(c.phone || "-"))],
            ["Ciudad", escapeHtml(String(c.city || "-"))],
            ["Departamento", escapeHtml(String(c.department || "-"))],
            ["Dirección", escapeHtml(String(c.address || "-"))]
          ])
        },
        {
          icon: "briefcase",
          title: "Postulación",
          rows: renderDetailRows(postulationRows)
        },
        {
          icon: "file",
          title: "Adjuntos",
          rows: `<div class="detail-perms-list">${attachmentsInner}</div>`
        }
      ];
      openInfoModal({
        title: String(c.name || "Candidato"),
        subtitle: String(c.vacancyTitle || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.candidates, []);
      const target = all.find((c) => String(c.id) === String(btn.dataset.id || ""));
      if (!target) return;
      const vacancyOpts = [
        { value: "", label: "Seleccione vacante..." },
        ...read(KEYS.vacancies, []).map((v) => ({ value: v.id, label: `${v.title || "Vacante"}${v.positionName ? ` (${v.positionName})` : ""}` }))
      ];
      const docTypeOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.documentTypes.map((d) => ({ value: d, label: d }))
      ];
      const statusOpts = PIPELINE.map((s) => ({ value: s, label: s }));
      openEditModal({
        title: "Editar candidato",
        subtitle: String(target.name || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "name", label: "Nombre completo", value: target.name || "", required: true },
          { name: "email", label: "Correo", type: "email", value: target.email || "", required: true },
          { name: "phone", label: "Teléfono", value: target.phone || "" },
          { name: "documentType", label: "Tipo documento", type: "select", value: target.documentType || "CC", options: docTypeOpts, required: true },
          { name: "idDoc", label: "N° documento", value: target.idDoc || "", required: true },
          { name: "birthDate", label: "Fecha de nacimiento", type: "date", value: String(target.birthDate || "").slice(0, 10), required: true },
          { name: "city", label: "Ciudad", value: target.city || "" },
          { name: "department", label: "Departamento", value: target.department || "" },
          { name: "address", label: "Dirección", value: target.address || "" },
          { name: "experienceYears", label: "Años de experiencia en el cargo", type: "number", value: parseNum(target.experienceYears || 0), min: 0, max: 65, required: true },
          { name: "expectedSalary", label: "Aspiración salarial", type: "number", value: parseNum(target.expectedSalary || 0) },
          { name: "availabilityDate", label: "Disponibilidad", type: "date", value: target.availabilityDate || "" },
          { name: "vacancyId", label: "Vacante", type: "select", value: target.vacancyId || "", options: vacancyOpts, required: true },
          { name: "status", label: "Estado pipeline", type: "select", value: target.status || PIPELINE[0], options: statusOpts },
          { name: "source", label: "Origen", value: target.source || "Portal RRHH" }
        ],
        onSubmit: async (form) => {
          const docValidation = validateColombianDocument(form.documentType, form.idDoc);
          if (!docValidation.ok) {
            notify(docValidation.message, "error");
            return false;
          }
          const birthCand = String(form.birthDate || "")
            .trim()
            .slice(0, 10);
          const editAgeInfo = portalCandidateAgeFromBirthIso(birthCand);
          if (editAgeInfo.age === null) {
            notify("Indique una fecha de nacimiento válida.", "error");
            return false;
          }
          if (editAgeInfo.age < 18) {
            notify("El candidato debe ser mayor de 18 años.", "error");
            return false;
          }
          const expectedSalary = parseNum(form.expectedSalary);
          if (expectedSalary && expectedSalary < CO_HR_RULES.minMonthlySalary) {
            notify(
              userMessage("candidateSalaryAspirationMin", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")),
              "error"
            );
            return false;
          }
          const vac = read(KEYS.vacancies, []).find((v) => String(v.id) === String(form.vacancyId));
          if (!vac) {
            notify(userMessage("hireSelectVacancy"), "error");
            return false;
          }
          const nextCandidates = all.map((c) =>
              String(c.id) !== String(target.id)
                ? c
                : {
                    ...c,
                    name: String(form.name || "").trim(),
                    email: String(form.email || "").trim(),
                    phone: String(form.phone || "").trim(),
                    documentType: form.documentType,
                    idDoc: docValidation.normalized,
                    birthDate: String(form.birthDate || "").trim().slice(0, 10),
                    city: String(form.city || "").trim(),
                    department: String(form.department || "").trim(),
                    address: String(form.address || "").trim(),
                    experienceYears: Math.max(0, parseNum(form.experienceYears || 0)),
                    expectedSalary,
                    availabilityDate: form.availabilityDate || "",
                    vacancyId: vac.id,
                    vacancyTitle: vac.title,
                    status: String(form.status || c.status || PIPELINE[0]),
                    source: String(form.source || "Portal RRHH")
                  }
            );
          try {
            await writeAwaitServer(KEYS.candidates, nextCandidates);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el candidato en el servidor."), "error");
            return false;
          }
          notify("Candidato actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.candidates, []).find((c) => String(c.id) === id);
      if (!target) return;
      const linkedInterviews = read(KEYS.interviews, []).filter((i) => String(i.candidateId || "") === id).length;
      openConfirmModal({
        title: "Eliminar candidato",
        message: `Se eliminará al candidato "${String(target.name || "")}" del pipeline${linkedInterviews ? ` y sus ${linkedInterviews} entrevista(s) asociada(s)` : ""}.`,
        confirmText: "Eliminar candidato",
        onConfirm: async () => {
          try {
            await writeAwaitServer(
              KEYS.candidates,
              read(KEYS.candidates, []).filter((c) => String(c.id) !== id)
            );
            if (linkedInterviews > 0) {
              await writeAwaitServer(
                KEYS.interviews,
                read(KEYS.interviews, []).filter((i) => String(i.candidateId || "") !== id)
              );
            }
          } catch (_e) {
            return;
          }
          notify("Candidato eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= ENTREVISTA: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = read(KEYS.interviews, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!i) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "calendar",
          title: "Programación",
          rows: renderDetailRows([
            ["Candidato", `<strong>${escapeHtml(String(i.candidateName || "-"))}</strong>`],
            ["Fecha y hora", escapeHtml(String(i.when || "-"))],
            ["Entrevistador", escapeHtml(String(i.interviewer || "-"))],
            ["Modalidad", escapeHtml(String(i.modality || "-"))],
            ["Lugar / enlace", escapeHtml(String(i.locationOrLink || "-"))]
          ])
        },
        {
          icon: "file",
          title: "Notas",
          rows: i.notes
            ? `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(String(i.notes))}</p>`
            : `<span class="muted">Sin notas.</span>`
        }
      ];
      openInfoModal({
        title: `Entrevista · ${String(i.candidateName || "")}`,
        subtitle: String(i.when || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.interviews, []);
      const target = all.find((i) => String(i.id) === String(btn.dataset.id || ""));
      if (!target) return;
      openEditModal({
        title: "Editar entrevista",
        subtitle: String(target.candidateName || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "when", label: "Fecha y hora", type: "datetime-local", value: target.when || "", required: true },
          { name: "interviewer", label: "Entrevistador(a)", value: target.interviewer || "", required: true },
          {
            name: "modality",
            label: "Modalidad",
            type: "select",
            value: target.modality || "Presencial",
            options: [
              { value: "Presencial", label: "Presencial" },
              { value: "Virtual", label: "Virtual" },
              { value: "Telefónica", label: "Telefónica" }
            ]
          },
          { name: "locationOrLink", label: "Lugar o enlace", value: target.locationOrLink || "" },
          { name: "notes", label: "Notas", type: "textarea", value: target.notes || "", rows: 3 }
        ],
        onSubmit: async (form) => {
          const ts = new Date(String(form.when || "")).getTime();
          if (!Number.isFinite(ts)) {
            notify("Fecha y hora inválidas.", "error");
            return false;
          }
          const nextInterviews = all.map((i) =>
              String(i.id) !== String(target.id)
                ? i
                : {
                    ...i,
                    when: form.when,
                    interviewer: String(form.interviewer || "").trim(),
                    modality: String(form.modality || ""),
                    locationOrLink: String(form.locationOrLink || "").trim(),
                    notes: String(form.notes || "").trim()
                  }
            );
          try {
            await writeAwaitServer(KEYS.interviews, nextInterviews);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar la entrevista en el servidor."), "error");
            return false;
          }
          notify("Entrevista actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.interviews, []).find((i) => String(i.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar entrevista",
        message: `Se eliminará la entrevista de "${String(target.candidateName || "")}".`,
        confirmText: "Eliminar entrevista",
        onConfirm: async () => {
          await writeAwaitServer(KEYS.interviews, read(KEYS.interviews, []).filter((i) => String(i.id) !== id));
          notify("Entrevista eliminada.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= CONTRATO: VER (DETALLE) / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-contract-detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.contracts, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const employee = c.employeeId
        ? read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(c.employeeId))
        : null;
      const sections = [
        {
          icon: "user",
          title: "Persona",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(String(c.candidateName || c.employeeName || employee?.name || "-"))}</strong>`],
            ["Documento", escapeHtml(String(c.idDocSnapshot || employee?.idDoc || "-"))],
            ["Cargo", escapeHtml(String(c.position || employee?.position || "-"))],
            ["Origen", escapeHtml(String(c.source || "Candidato"))]
          ])
        },
        {
          icon: "file",
          title: "Contrato",
          rows: renderDetailRows([
            ["Tipo", escapeHtml(String(c.contractType || "-"))],
            ["Plantilla", escapeHtml(String(c.contractTemplateKind || "-"))],
            ["Salario", fmtMoney(c.salary)],
            ["Inicio", fmtDateOr(c.startDate)],
            ["Fin", fmtDateOr(c.endDate)],
            ["Generado", fmtDateOr(c.createdAt)]
          ])
        }
      ];
      const contentHtml = c.content
        ? `<section class="detail-section"><h4 class="detail-section-title">${IC.file || ""}<span>Resumen interno</span></h4><pre class="detail-pre">${escapeHtml(String(c.content))}</pre></section>`
        : "";
      openInfoModal({
        title: `Contrato · ${String(c.candidateName || c.employeeName || "")}`,
        subtitle: String(c.position || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>${contentHtml}`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-contract']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.contracts, []).find((c) => String(c.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar contrato",
        message: `Se eliminará el registro del contrato de "${String(target.candidateName || target.employeeName || "")}". El archivo Word ya descargado no se borrará automáticamente.`,
        confirmText: "Eliminar contrato",
        onConfirm: async () => {
          await writeAwaitServer(KEYS.contracts, read(KEYS.contracts, []).filter((c) => String(c.id) !== id));
          notify("Contrato eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= SST / CUMPLIMIENTO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = read(KEYS.sstCompliance, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!r) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "shield",
          title: "Control",
          rows: renderDetailRows([
            ["Tipo", `<strong>${escapeHtml(String(r.recordType || "-"))}</strong>`],
            ["Código documental", escapeHtml(String(r.documentCode || "-"))],
            ["Empleado", escapeHtml(String(r.employeeName || "-"))],
            ["Entidad / proveedor", escapeHtml(String(r.provider || "-"))],
            ["Vencimiento", fmtDateOr(r.dueDate)],
            ["Estado", escapeHtml(String(r.status || "-"))],
            ["Registrado", fmtDateOr(r.createdAt)],
            ["Responsable", escapeHtml(String(r.createdBy || "-"))]
          ])
        },
        {
          icon: "file",
          title: "Evidencia / observaciones",
          rows: r.notes
            ? `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(String(r.notes))}</p>`
            : `<span class="muted">Sin observaciones.</span>`
        }
      ];
      openInfoModal({
        title: `Control SST · ${String(r.recordType || "")}`,
        subtitle: String(r.employeeName || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.sstCompliance, []);
      const target = all.find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!target) return;
      openEditModal({
        title: "Editar control SST",
        subtitle: String(target.recordType || ""),
        submitText: "Guardar cambios",
        fields: [
          {
            name: "recordType",
            label: "Tipo de control",
            type: "select",
            value: target.recordType || "",
            options: [
              { value: "", label: "Seleccione..." },
              { value: "Afiliacion EPS", label: "Afiliacion EPS" },
              { value: "Afiliacion pension", label: "Afiliacion pension" },
              { value: "Afiliacion ARL", label: "Afiliacion ARL" },
              { value: "Examen medico ocupacional", label: "Examen medico ocupacional" },
              { value: "Capacitacion SST", label: "Capacitacion SST" },
              { value: "Inspeccion documental", label: "Inspeccion documental" }
            ]
          },
          { name: "provider", label: "Entidad / proveedor", value: target.provider || "", required: true },
          { name: "dueDate", label: "Vencimiento", type: "date", value: target.dueDate || "", required: true },
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status || "Pendiente",
            options: [
              { value: "Pendiente", label: "Pendiente" },
              { value: "En gestion", label: "En gestion" },
              { value: "Cumplido", label: "Cumplido" }
            ]
          },
          { name: "documentCode", label: "Código documental", value: target.documentCode || "" },
          { name: "notes", label: "Observaciones", type: "textarea", value: target.notes || "", rows: 3 }
        ],
        onSubmit: async (form) => {
          if (!form.dueDate) {
            notify(userMessage("sstDueDateRequired"), "error");
            return false;
          }
          const nextList = all.map((r) =>
              String(r.id) !== String(target.id)
                ? r
                : {
                    ...r,
                    recordType: String(form.recordType || r.recordType || "").trim(),
                    provider: String(form.provider || "").trim(),
                    dueDate: form.dueDate,
                    status: String(form.status || "Pendiente"),
                    documentCode: String(form.documentCode || "").trim().toUpperCase(),
                    notes: String(form.notes || "").trim()
                  }
            );
          try {
            await writeAwaitServer(KEYS.sstCompliance, nextList);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el control SST en el servidor."), "error");
            return false;
          }
          notify("Control SST actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.sstCompliance, []).find((r) => String(r.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar control SST",
        message: `Se eliminará el control "${String(target.recordType || "")}" del expediente.`,
        confirmText: "Eliminar control",
        onConfirm: async () => {
          await writeAwaitServer(KEYS.sstCompliance, read(KEYS.sstCompliance, []).filter((r) => String(r.id) !== id));
          notify("Control SST eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });
}

function initRequiredFieldIndicators() {
  const markerClass = "required-marker";

  const placeMarker = (label) => {
    if (!label || label.querySelector(`.${markerClass}`)) return;
    const marker = document.createElement("span");
    marker.className = markerClass;
    marker.textContent = "*";
    marker.setAttribute("aria-hidden", "true");

    const labelTextNode = label.querySelector("span");
    if (labelTextNode) {
      labelTextNode.classList.add("required-with-marker");
      labelTextNode.append(" ", marker);
      return;
    }

    label.classList.add("required-with-marker");
    label.append(" ", marker);
  };

  const scanRequiredFields = (root = document) => {
    const requiredFields = root.querySelectorAll("input[required], select[required], textarea[required]");
    requiredFields.forEach((field) => {
      if (field.type === "hidden") return;
      const label = field.closest("label");
      placeMarker(label);
    });
  };

  scanRequiredFields(document);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("input[required], select[required], textarea[required]")) {
          const label = node.closest("label");
          placeMarker(label);
        }
        scanRequiredFields(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/** Carreras públicas: combina GET /api/public/vacancies con vacantes publicadas en este navegador. */
let publicCareersVacanciesSource = "local";
let publicCareersVacanciesFromApi = null;

function normalizeVacancyForCareersPublic(v) {
  if (!v) return null;
  return {
    id: v.id,
    title: String(v.title || ""),
    department: String(v.department || ""),
    city: String(v.city || ""),
    deadline: v.deadline || "",
    salaryOffer: parseNum(v.salaryOffer),
    requirements: String(v.requirements || ""),
    status: String(v.status || ""),
    positionName: String(v.positionName || ""),
    modality: String(v.modality || ""),
    openings: v.openings != null ? v.openings : 1,
    workerRole: String(v.workerRole || "")
  };
}

function vacancyPublicationDeadlineOk(isoDateStr) {
  const s = String(isoDateStr || "").trim();
  if (!s) return true;
  const parts = s.split("-");
  if (parts.length !== 3) return false;
  const cand = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  if (!Number.isFinite(cand)) return false;
  const t = new Date();
  const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return cand >= t0;
}

function mergeApiVacanciesWithLocalPublished(apiList, localRawList) {
  const out = [];
  const seen = new Set();
  (apiList || []).forEach((row) => {
    const norm = normalizeVacancyForCareersPublic(row);
    if (norm == null || norm.id === undefined || norm.id === null || String(norm.id).trim() === "") return;
    const id = String(norm.id);
    out.push(norm);
    seen.add(id);
  });
  (localRawList || []).forEach((row) => {
    if (String(row?.status || "") !== "Publicada") return;
    const norm = normalizeVacancyForCareersPublic(row);
    if (norm == null || norm.id === undefined || norm.id === null || String(norm.id).trim() === "") return;
    const id = String(norm.id);
    if (seen.has(id)) return;
    out.push(norm);
    seen.add(id);
  });
  return out;
}

function getPublicPublishedVacancies() {
  const rows =
    publicCareersVacanciesSource === "api" && publicCareersVacanciesFromApi !== null && Array.isArray(publicCareersVacanciesFromApi)
      ? publicCareersVacanciesFromApi
      : (read(KEYS.vacancies, []) || []).map((v) => normalizeVacancyForCareersPublic(v)).filter(Boolean);
  return rows.filter((v) => String(v.status || "") === "Publicada" && vacancyPublicationDeadlineOk(v.deadline));
}

function openPublicVacancyApplyModal(vacancy) {
  openEditModal({
    title: "Postulacion en linea",
    subtitle: `${vacancy.title} — ${vacancy.positionName || "Vacante Antares"}`,
    submitText: "Enviar candidatura",
    fields: [
      { type: "hidden", name: "vacancyId", value: vacancy.id },
      { name: "name", label: "Nombre completo", required: true },
      { name: "email", label: "Correo electronico", type: "email", required: true },
      { name: "phone", label: "Telefono", required: true },
      {
        name: "documentType",
        label: "Tipo de documento",
        type: "select",
        required: true,
        value: "CC",
        options: [
          { value: "CC", label: "Cedula de ciudadania" },
          { value: "CE", label: "Cedula de extranjeria" },
          { value: "PAS", label: "Pasaporte" }
        ]
      },
      { name: "idDoc", label: "Numero de documento", required: true },
      { name: "birthDate", label: "Fecha de nacimiento", type: "date", required: true },
      {
        name: "experienceYears",
        label: "Años de experiencia en el cargo o similar",
        type: "number",
        value: "0",
        min: 0,
        max: 65,
        required: true
      },
      { name: "city", label: "Ciudad de residencia", required: true },
      { name: "address", label: "Direccion", required: true },
      {
        name: "experience",
        label: "Experiencia y competencias (resumen)",
        type: "textarea",
        required: true,
        rows: 4
      },
      {
        name: "attachment",
        label: "Hoja de vida (PDF, Word o imagen)",
        type: "file",
        accept: ".pdf,.doc,.docx,image/*",
        required: true
      }
    ],
    onSubmit: async (_payload, formEl) => {
      if (!formEl) return false;
      const vac = vacancy;
      if (!vac || vac.status !== "Publicada") {
        notify(userMessage("vacancyPublicClosed"), "error");
        return false;
      }
      const fd = new FormData(formEl);
      const docValidation = validateColombianDocument(String(fd.get("documentType") || ""), String(fd.get("idDoc") || ""));
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return false;
      }
      fd.set("idDoc", docValidation.normalized);
      const birth = String(fd.get("birthDate") || "")
        .trim()
        .slice(0, 10);
      const pubAgeInfo = portalCandidateAgeFromBirthIso(birth);
      if (pubAgeInfo.age === null) {
        notify("Indique una fecha de nacimiento válida.", "error");
        return false;
      }
      if (pubAgeInfo.age < 18) {
        notify("Debe tener al menos 18 años para postularse.", "error");
        return false;
      }
      const expY = Math.min(65, Math.max(0, parseNum(String(fd.get("experienceYears") ?? "0"))));
      fd.set("experienceYears", String(expY));
      const attachInput = formEl.querySelector("input[name='attachment']");
      if (!attachInput?.files?.[0]) {
        notify("Adjunte la hoja de vida (PDF, Word o imagen).", "error");
        return false;
      }
      fd.set("email", normalizeEmail(String(fd.get("email") || "")));
      const apiPub = window.AntaresApi;
      if (apiPub?.hasBase?.() && typeof apiPub.postFormDataPublic === "function") {
        try {
          await apiPub.postFormDataPublic("/public/job-application", fd);
          notify(userMessage("candidacySentOk"), "success");
          return true;
        } catch (err) {
          notify(String(err?.message || err), "error");
          return false;
        }
      }
      const vacancyIdFd = String(fd.get("vacancyId") || "");
      const vacLocal = read(KEYS.vacancies, []).find((x) => String(x.id) === vacancyIdFd);
      if (!vacLocal || vacLocal.status !== "Publicada") {
        notify(userMessage("vacancyPublicClosed"), "error");
        return false;
      }
      const nm = String(fd.get("name") || "").trim();
      const attachName = attachInput.files[0].name;
      const all = read(KEYS.candidates, []);
      all.unshift({
        id: newUuidV4(),
        name: nm,
        email: normalizeEmail(String(fd.get("email") || "")),
        phone: String(fd.get("phone") || "").trim(),
        documentType: String(fd.get("documentType") || ""),
        idDoc: docValidation.normalized,
        birthDate: birth,
        experienceYears: expY,
        city: String(fd.get("city") || "").trim(),
        address: String(fd.get("address") || "").trim(),
        vacancyId: vacLocal.id,
        vacancyTitle: vacLocal.title,
        experienceNotes: String(fd.get("experience") || "").trim(),
        expectedSalary: 0,
        availabilityDate: "",
        status: PIPELINE[0],
        attachments: attachName ? [attachName] : [],
        source: "Sitio web",
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.candidates, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible registrar la postulación en el servidor."), "error");
        return false;
      }
      sendEmail({
        to: normalizeEmail(String(fd.get("email") || "")),
        subject: "Postulacion recibida - Antares",
        body: `Hola ${nm}, registramos tu postulacion a "${vacLocal.title}". Nuestro equipo de seleccion revisara tu perfil.`
      });
      try {
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
      notifyHrUsers(
        "Nueva postulacion (web)",
        `${nm} aplico a "${vacLocal.title}". Revise Contratacion · Pipeline de candidatos.`
      );
      try {
        await writeAwaitServer(KEYS.notifications, read(KEYS.notifications, []));
      } catch (_e) {}
      notify(userMessage("candidacySentOk"), "success");
      return true;
    }
  });
}

function initPublicCareers() {
  const grid = document.getElementById("careers-vacancies-grid");
  if (!grid) return;
  const render = () => {
    const list = getPublicPublishedVacancies();
    if (!list.length) {
      grid.innerHTML =
        `<div class="careers-card"><p class="muted" style="margin:0">${tPublic("No hay vacantes publicadas en este momento. Vuelve pronto o escribenos en Contacto.")}</p></div>`;
      return;
    }
    grid.innerHTML = list
      .map((v) => {
        const salary = parseNum(v.salaryOffer);
        const salaryStr = `$${salary.toLocaleString("es-CO")}`;
        const deadline = v.deadline ? `${tPublic("Cierre")}: ${v.deadline}` : tPublic("Sin fecha limite");
        const req = String(v.requirements || "").slice(0, 180);
        const more = String(v.requirements || "").length > 180 ? "…" : "";
        return `<article class="careers-card lift-card">
          <h3>${v.title}</h3>
          <div class="careers-meta">${v.positionName || tPublic("Cargo")} · ${salaryStr} · ${deadline}</div>
          <p class="careers-req muted">${req}${more}</p>
          <button type="button" class="btn btn-primary full" data-careers-apply data-id="${v.id}">${tPublic("Aplicar")}</button>
        </article>`;
      })
      .join("");
    grid.querySelectorAll("[data-careers-apply]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const vac = getPublicPublishedVacancies().find((x) => x.id === btn.dataset.id);
        if (vac) openPublicVacancyApplyModal(vac);
      });
    });
  };

  const api = window.AntaresApi;
  if (api?.hasBase?.()) {
    publicCareersVacanciesSource = "api";
    publicCareersVacanciesFromApi = null;
    grid.innerHTML =
      `<div class="careers-card"><p class="muted" style="margin:0">${state.publicLang === "en" ? "Loading openings…" : "Cargando vacantes…"}</p></div>`;
    void api
      .getJsonPublic("/public/vacancies")
      .then((rows) => {
        const mapped = Array.isArray(rows)
          ? rows.map((row) => ({
              id: row.id,
              title: row.title,
              department: row.department,
              city: row.city,
              deadline: row.deadline,
              salaryOffer: row.salaryOffer,
              requirements: row.requirements,
              status: row.status || "Publicada",
              positionName: row.positionName,
              modality: row.modality,
              openings: row.openings,
              workerRole: row.workerRole
            }))
          : [];
        publicCareersVacanciesFromApi = mergeApiVacanciesWithLocalPublished(mapped, read(KEYS.vacancies, []));
      })
      .catch((err) => {
        devWarn("Carreras: error al cargar vacantes desde la API.", err?.message || err);
        publicCareersVacanciesSource = "local";
        publicCareersVacanciesFromApi = null;
      })
      .finally(() => {
        render();
      });
    return;
  }

  publicCareersVacanciesSource = "local";
  publicCareersVacanciesFromApi = null;
  render();
}

function initPublicScrollSpy() {
  const mainNav = document.getElementById("main-nav");
  if (!mainNav) return;
  const links = [...mainNav.querySelectorAll("a[href^='#']")];
  if (!links.length) return;

  const sectionIds = links
    .map((link) => String(link.getAttribute("href") || "").replace("#", "").trim())
    .filter(Boolean);
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const targetId = String(link.getAttribute("href") || "").replace("#", "").trim();
      link.classList.toggle("active", targetId === id);
    });
  };

  const visibleRatioById = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        visibleRatioById.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      const best = [...visibleRatioById.entries()].sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > 0) setActive(best[0]);
    },
    { threshold: [0.2, 0.35, 0.5, 0.7], rootMargin: "-18% 0px -55% 0px" }
  );

  sections.forEach((section) => {
    visibleRatioById.set(section.id, 0);
    observer.observe(section);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = String(link.getAttribute("href") || "").replace("#", "").trim();
      if (targetId) setActive(targetId);
    });
  });

  setActive(sectionIds[0]);
}

function initPublicEffects() {
  initPublicCareers();
  initPublicScrollSpy();

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 40, 280)}ms`;
    observer.observe(item);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.getElementById("hero");
  if (!hero || prefersReducedMotion) return;

  window.addEventListener(
    "scroll",
    () => {
      const offset = window.scrollY * 0.15;
      hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
    },
    { passive: true }
  );

  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateY = ((x / bounds.width) - 0.5) * 7;
      const rotateX = (0.5 - y / bounds.height) * 7;
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

}

window.AppLegacyViews = {
  viewDashboard,
  requestFormHtml,
  requestListClientHtml,
  transportTripsHtml,
  vehiclesHtml,
  driversHtml,
  transportCalendarHtml,
  historyHtml,
  reportsHtml,
  payrollHtml,
  hiringHtml,
  laborComplianceHtml,
  adminUsersHtml,
  authorizationsHtml,
  profileHtml,
  notificationsHtml,
  contactLeadsHtml
};

/** Tras bootstrap remoto (p. ej. al volver a la pestaña): repinta vista y badge sin duplicar lógica en cada módulo. */
window.__portalRefreshAfterBootstrap = function __portalRefreshAfterCacheFromApi() {
  if (!getSession()) return;
  try {
    syncSessionProfileSnapshotFromCache();
    updatePortalSidebarSessionMeta();
  } catch (_e) {
    /* noop */
  }
  /**
   * Tras la rehidratación, el usuario ya tiene permisos reales. Re-evaluamos la vista de la URL
   * para que, si en F5 caímos a `dashboard` por permisos en blanco, podamos volver a la vista
   * previa (#portal/...) sin que el usuario tenga que renavegar.
   */
  try {
    const u = currentUser();
    if (u) {
      enforcePortalViewFromUrl(u);
    }
  } catch (_e) {
    /* noop */
  }
  if (!hasUnsavedPortalFormData()) {
    scheduleRenderPortalView();
  }
  updateNotificationBadge();
};

initPortalClientStorage();
initGlobalEvents();
initPublicEffects();

/**
 * Pintamos el portal de forma SÍNCRONA usando la sesión persistida en `localStorage` y el
 * `profileSnapshot` capturado al login. Así, tras F5, el usuario ve su portal en milisegundos
 * (no espera al refresh JWT ni a `/portal/bootstrap`, que en Render cold-start podían tardar
 * 10-30 s y mostrar el sitio público todo ese tiempo, dando sensación de "deslogueo").
 *
 * Después, en segundo plano, refrescamos token y bootstrap; cuando llegan, repintamos vista y
 * permisos vía `__portalRefreshAfterBootstrap` sin que el usuario pierda contexto.
 */
renderPortal();

void (async function bootApplicationFromDatabaseThenUi() {
  /**
   * Política de arranque (post-F5):
   *   1) Render síncrono inmediato a partir de la sesión cacheada → el portal se ve "al
   *      instante" (combinado con el guard inline en <head> que oculta el sitio público
   *      mientras app.js termina de cargar).
   *   2) Bootstrap (refresh JWT + /portal/bootstrap) en segundo plano: cuando termina,
   *      llamamos a `__portalRefreshAfterBootstrap` para repintar la vista con datos frescos
   *      sin sacar al usuario del módulo en el que estaba.
   *   3) Si no hay sesión guardada, mostramos el sitio público desde el primer paint.
   */
  const hadSessionAtBoot = Boolean(getSession());
  try {
    renderPortal();
  } catch (err) {
    devWarn("renderPortal síncrono falló al arrancar:", err);
  }

  /** Tras F5 el access JWT puede estar vencido; sin refresh /portal/bootstrap devuelve 401 y se vacía la proyección en RAM. */
  try {
    const s0 = getSession();
    if (s0?.refreshToken && window.AntaresApi?.getBase?.()) {
      await tryApiRefreshBridge();
    }
  } catch (_e) {
    /* tryApiRefreshBridge ya tolera fallos */
  }
  try {
    await startPortalBootstrapForInteractiveSession();
  } catch (_e) {
    /* startPortalBootstrapForInteractiveSession ya tolera fallos */
  }
  try {
    await ensureUsersPasswordHashing();
  } catch (_e) {
    /* no fatal: rehidratación no debe tirar la sesión */
  }
  if (window.DomainRegistry?.list) {
    const missingDomains = window.DomainRegistry.list().filter((name) => !window.DomainRegistry.get(name));
    if (missingDomains.length) {
      devWarn("Dominios sin inicializar:", missingDomains.join(", "));
    }
  }
  /**
   * Tras el bootstrap async: si seguimos con sesión válida, repintamos para reflejar permisos
   * y datos definitivos sin perder la URL (#portal/<modulo>). Si la sesión expiró durante el
   * bootstrap (refresh fallido), `renderPortal()` mostrará automáticamente el sitio público.
   */
  if (getSession()) {
    try {
      window.__portalRefreshAfterBootstrap?.();
    } catch (_e) {
      /* noop */
    }
    if (!document.body.classList.contains("portal-mode")) {
      renderPortal();
    }
  } else if (hadSessionAtBoot) {
    /** Tenía sesión y se invalidó durante el bootstrap → caer al sitio público sin parpadeo extra. */
    renderPortal();
  }
  try {
    syncSessionProfileSnapshotFromCache();
  } catch (_e) {}
  window.PortalDataLayer?.enableVisibilityRefresh?.();
  setInterval(() => {
    if (!state.session) return;
    /**
     * Marca las notificaciones generadas por la auto-aprobación de fondo
     * como ya vistas para el poll: la campana sigue mostrándolas, pero
     * no se disparan toasts por procesos que el usuario no inició.
     */
    const changed = runAsSilentSystemNotifications(() => updateAutoApprove());
    if (changed && !hasUnsavedPortalFormData()) {
      scheduleRenderPortalView();
    }
  }, 30000);
})();
