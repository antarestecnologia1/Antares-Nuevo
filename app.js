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

/** Hero de métricas con el mismo estilo visual que Transporte · Camiones (franja azul + tarjetas). */
function moduleFleetHeroStrip(metrics) {
  const inner = (metrics || [])
    .map(({ label, value, tone }) => {
      const extra =
        tone === "warn" ? " fleet-hero-metric-warn" : tone === "alert" ? " fleet-hero-metric-alert" : "";
      return `<div class="fleet-hero-metric${extra}"><span>${escapeHtml(String(label))}</span><strong>${escapeHtml(String(value))}</strong></div>`;
    })
    .join("");
  return `<div class="fleet-hero-strip fleet-hero-strip--solo"><div class="fleet-hero-metrics">${inner}</div></div>`;
}

function isAntaresDebugEnabled() {
  try {
    return typeof window !== "undefined" && window.__ANTARES_DEBUG__ === true;
  } catch {
    return false;
  }
}

function devWarn() {
  if (!isAntaresDebugEnabled() || typeof console === "undefined" || !console.warn) return;
  console.warn.apply(console, arguments);
}

function devError() {
  if (!isAntaresDebugEnabled() || typeof console === "undefined" || !console.error) return;
  console.error.apply(console, arguments);
}

function createCollapsibleCard(panelId, iconKey, title, subtitle, bodyHtml, expandLabel = "Crear nuevo") {
  const expanded = Boolean(state.createPanels?.[panelId]);
  const toggleText = expanded ? "Ocultar formulario" : expandLabel;
  const cardBody = `<div class="toolbar" style="margin-bottom:0.8rem">
    <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="${escapeAttr(panelId)}">
      ${expanded ? IC.x : IC.plus} ${escapeHtml(toggleText)}
    </button>
  </div>
  <div class="${expanded ? "" : "hidden"}" data-create-panel="${escapeAttr(panelId)}">
    ${bodyHtml}
  </div>`;
  return pcardWrap(iconKey, title, subtitle, cardBody);
}

function notify(message, type = "info") {
  let box = document.getElementById("toast-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-container";
    box.className = "toast-container";
    document.body.appendChild(box);
  }
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.textContent = message;
  box.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => item.remove(), 240);
  }, 3200);
}

/** Mensajes en {@link window.AntaresFeedback} (modules/core/feedback-messages.js). */
function userMessage(key, ...args) {
  const M = window.AntaresFeedback;
  if (!M) return String(key);
  const v = M[key];
  if (typeof v === "function") return v(...args);
  return v != null ? v : String(key);
}

function openEditModal({ title, subtitle = "", fields = [], submitText = "Guardar", onSubmit }) {
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
      const inputType = String(f.type || "text").replace(/[^a-z0-9\-]/gi, "") || "text";
      return `<label><span>${escapeHtml(f.label)}</span><input type="${inputType}" name="${escapeAttr(f.name)}" value="${escapeAttr(String(f.value ?? ""))}" ${f.required ? "required" : ""} /></label>`;
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
  content.querySelector("#crud-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const payload = Object.fromEntries(new FormData(formEl).entries());
    const fileInputs = [...formEl.querySelectorAll("input[type='file']")];
    fileInputs.forEach((input) => {
      if (input.multiple) {
        payload[input.name] = [...input.files].map((file) => file.name).join(", ");
      } else if (input.files?.[0]) {
        payload[input.name] = input.files[0].name;
      }
    });
    let result = onSubmit?.(payload, formEl);
    if (result && typeof result.then === "function") {
      try {
        result = await result;
      } catch (err) {
        devWarn("openEditModal onSubmit", err);
        return;
      }
    }
    if (result === false) return;
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
  content.querySelector("#crud-confirm").addEventListener("click", () => {
    onConfirm?.();
    close();
  });
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) close();
    },
    { once: true }
  );
}

function openInfoModal({ title, subtitle = "", bodyHtml = "" }) {
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
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    <div class="modal-head">
      <h2>${escapeHtml(title)}</h2>
      <button type="button" id="crud-close" class="btn btn-text" aria-label="Cerrar">${IC.x}</button>
    </div>
    ${subtitle ? `<p class="muted">${escapeHtml(subtitle)}</p>` : ""}
    <div class="modal-info-body">${bodyHtml}</div>
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

function chunkBySizes(items, sizes = []) {
  const result = [];
  let cursor = 0;
  sizes.forEach((size) => {
    if (size > 0 && cursor < items.length) {
      result.push(items.slice(cursor, cursor + size));
      cursor += size;
    }
  });
  if (cursor < items.length) result.push(items.slice(cursor));
  return result.filter((group) => group.length);
}

function enhanceFormAsWizard(form, config = {}) {
  if (!form || form.dataset.wizardReady === "true") return;
  const children = [...form.children];
  const submitButtons = children.filter((node) => node.matches?.("button[type='submit']"));
  const baseFields = children.filter((node) => !submitButtons.includes(node));
  if (baseFields.length < 6) return;

  const groups = chunkBySizes(baseFields, config.sizes || []);
  if (!groups.length) return;
  form.innerHTML = "";
  form.classList.add("form-wizard");
  const titles = config.titles || [];

  groups.forEach((group, idx) => {
    const step = document.createElement("section");
    step.className = `wizard-step ${idx === 0 ? "active" : ""}`;
    step.dataset.step = String(idx);
    if (titles[idx]) {
      const head = document.createElement("div");
      head.className = "wizard-step-head";
      head.innerHTML = `<h4>${escapeHtml(titles[idx])}</h4><span>Paso ${idx + 1} de ${groups.length}</span>`;
      step.appendChild(head);
    }
    group.forEach((node) => step.appendChild(node));
    if (idx === groups.length - 1) submitButtons.forEach((btn) => step.appendChild(btn));
    form.appendChild(step);
  });

  const nav = document.createElement("div");
  nav.className = "wizard-nav";
  nav.innerHTML = `<button type="button" class="btn btn-outline" data-wizard-prev>Anterior</button><button type="button" class="btn btn-primary" data-wizard-next>Siguiente</button>`;
  form.appendChild(nav);

  let current = 0;
  const steps = [...form.querySelectorAll(".wizard-step")];
  const prevBtn = nav.querySelector("[data-wizard-prev]");
  const nextBtn = nav.querySelector("[data-wizard-next]");

  const update = () => {
    steps.forEach((step, idx) => step.classList.toggle("active", idx === current));
    prevBtn.disabled = current === 0;
    nextBtn.classList.toggle("hidden", current === steps.length - 1);
    nextBtn.textContent = "Siguiente";
  };
  update();

  nextBtn.addEventListener("click", () => {
    const currentStep = steps[current];
    const requiredInputs = [...currentStep.querySelectorAll("input, select, textarea")].filter((el) => el.required);
    const invalid = requiredInputs.find((el) => !el.value);
    if (invalid) {
      notify(userMessage("validationStep"), "error");
      invalid.focus();
      return;
    }
    if (current < steps.length - 1) current += 1;
    update();
  });
  prevBtn.addEventListener("click", () => {
    if (current > 0) current -= 1;
    update();
  });

  form.dataset.wizardReady = "true";
}

function applyFormWizards() {
  return;
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

const CO_TIMEZONE = "America/Bogota";

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
  [PERMISSIONS.TRANSPORT_REQUESTS]: { title: "Bandeja de transporte", desc: "Aprobar, rechazar y editar solicitudes." },
  [PERMISSIONS.TRANSPORT_TRIPS]: { title: "Gestion de viajes", desc: "Asignar y actualizar estados de viaje." },
  [PERMISSIONS.TRANSPORT_VEHICLES]: { title: "Gestion de camiones", desc: "Registrar y modificar vehiculos." },
  [PERMISSIONS.TRANSPORT_DRIVERS]: { title: "Gestion de conductores", desc: "Registrar y administrar conductores." },
  [PERMISSIONS.TRANSPORT_CALENDAR]: { title: "Calendario operativo", desc: "Ver programacion de viajes." },
  [PERMISSIONS.TRANSPORT_HISTORY]: { title: "Historial y reportes", desc: "Consultar historicos y filtros." },
  [PERMISSIONS.PAYROLL_MANAGE]: { title: "Nomina", desc: "Gestionar empleados y liquidaciones." },
  [PERMISSIONS.HIRING_MANAGE]: { title: "Contratacion", desc: "Gestionar vacantes, candidatos y contratos." },
  [PERMISSIONS.SST_COMPLIANCE]: { title: "Cumplimiento laboral y SST", desc: "Controlar seguridad social, vencimientos y auditoria documental." },
  [PERMISSIONS.USERS_MANAGE]: { title: "Usuarios y permisos", desc: "Crear usuarios y administrar accesos." },
  [PERMISSIONS.AUTHORIZATIONS_MANAGE]: { title: "Autorizaciones", desc: "Aprobar solicitudes de operaciones y personal." },
  [PERMISSIONS.PROFILE_VIEW]: { title: "Mi perfil", desc: "Ver y editar informacion personal." },
  [PERMISSIONS.NOTIFICATIONS_VIEW]: { title: "Notificaciones", desc: "Ver novedades del sistema." },
  [PERMISSIONS.CONTACT_B2B_VIEW]: { title: "Solicitudes contacto web", desc: "Ver prospectos del formulario B2B en PostgreSQL." }
};

const VIEW_PERMISSIONS = {
  dashboard: PERMISSIONS.DASHBOARD_VIEW,
  requests: PERMISSIONS.CLIENT_REQUESTS,
  "transport-requests": PERMISSIONS.TRANSPORT_REQUESTS,
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
  smmlv: 1750905
};
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
  payFrequency: ["Mensual", "Quincenal", "Semanal", "Catorcenal"],
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
          "Para marcar como contratado debe existir un contrato generado (desde nomina, misma cedula) o el registro historico por candidato."
      };
    }
  }
  return { ok: true };
}

let state = {
  session: null,
  currentView: "dashboard",
  /** Prospectos B2B desde GET /portal/bootstrap (solo RAM; no localStorage). */
  portalContacts: [],
  theme: "light",
  publicLang: "es",
  authTab: "login",
  authSecurity: {
    failedAttempts: 0,
    lockUntil: 0
  },
  adminUsersUi: {
    panel: "",
    editUserId: ""
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
    runSort: "recent"
  },
  hiringUi: {
    candidateFilter: "active",
    vacancyFilter: "open",
    candidateSort: "recent"
  }
};

window.__getAntaresPortalContacts = function getAntaresPortalContacts() {
  return Array.isArray(state.portalContacts) ? state.portalContacts : [];
};

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
    if (p[prop] !== undefined) write(key, p[prop]);
  }
}

async function applyPortalBootstrapFromApi() {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || !api.getAccessToken?.()) return false;
  try {
    const p = await api.getJson("/portal/bootstrap");
    applyPortalBootstrapPayload(p);
    return true;
  } catch (err) {
    devWarn("Portal: no se pudo cargar /portal/bootstrap (se usa caché local si existe).", err?.message || err);
    return false;
  }
}

window.applyPortalBootstrapFromApi = applyPortalBootstrapFromApi;

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
  "Transporte refrigerado": "Refrigerated transport",
  "Transporte dedicado": "Dedicated transport",
  "Servicio eventual": "On-demand service",
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
    "#careers .muted": "Las vacantes se sincronizan con el mismo equipo que gestiona candidatos en el portal (misma base local del navegador).",
    "#contact .container > article:nth-child(2) .muted":
      "Con la API configurada, las solicitudes se guardan en PostgreSQL. Sin URL de API, solo en este navegador (riesgo de perdida)."
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
    "#careers .muted": "Vacancies are synchronized with the same team that manages candidates in the portal (same local browser database).",
    "#contact .container > article:nth-child(2) .muted":
      "With the API configured, requests are stored in PostgreSQL. Without an API URL, data stays only in this browser (loss risk)."
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

function uid() {
  return Math.random().toString(36).slice(2, 11);
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

function registerPhoneCountryOptionsHtml() {
  return REGISTER_PHONE_COUNTRIES.map((c, index) => {
    const escLabel = String(c.label || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");
    const selected = index === 0 ? " selected" : "";
    return `<option value="${c.id}" title="${escLabel}"${selected}>+${c.dial}</option>`;
  }).join("");
}

function getSelectedRegisterPhoneCountry(registerForm) {
  const sel = registerForm?.querySelector(".js-register-phone-cc");
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

function updateRegisterPhoneFieldForCountry(registerForm) {
  const meta = getSelectedRegisterPhoneCountry(registerForm);
  const hint = registerForm?.querySelector("#register-phone-hint");
  const nat = registerForm?.querySelector(".js-register-phone-national");
  const wrap = registerForm?.querySelector(".phone-input-professional");
  const ccSel = registerForm?.querySelector(".js-register-phone-cc");
  const langFlag = registerForm?.querySelector(".js-register-lang-flag");
  if (langFlag) {
    const sfx = meta.flag || "co";
    langFlag.className = `js-register-lang-flag register-lang-flag register-lang-flag--${sfx}`;
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

function syncRegisterPhoneHidden(registerForm) {
  const nat = registerForm?.querySelector(".js-register-phone-national");
  const hid = registerForm?.querySelector(".js-register-phone-full");
  if (!nat || !hid) return;
  const meta = getSelectedRegisterPhoneCountry(registerForm);
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
      if (!validateStep(currentStep)) return;
      setStep(currentStep + 1);
    });
  }
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
    });
  }

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    if (currentStep >= panes.length - 1) return;
    event.preventDefault();
    if (!validateStep(currentStep)) return;
    setStep(currentStep + 1);
  });

  setStep(0);

  const phoneInput = form.querySelector("input[name='phone']");
  const emailInput = form.querySelector("input[name='email']");
  const messageInput = form.querySelector("textarea[name='message']");
  const volumeInput = form.querySelector("input[name='monthlyVolumeKg']");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const cursorAtEnd = phoneInput.selectionStart === phoneInput.value.length;
      phoneInput.value = formatColombianPhone(phoneInput.value);
      if (cursorAtEnd) phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
      clearFieldError(phoneInput);
    });
  }

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

function getConfiguredTripValue(request) {
  const rates = read(KEYS.tripRouteRates, {});
  const configured = parseNum(rates[routeRateKeyFromRequest(request)]);
  return configured > 0 ? configured : 0;
}

function buildTripRouteRateKey(originDepartment, originCity, destinationDepartment, destinationCity) {
  const origin = `${String(originDepartment || "").trim()}|${String(originCity || "").trim()}`.toLowerCase();
  const destination = `${String(destinationDepartment || "").trim()}|${String(destinationCity || "").trim()}`.toLowerCase();
  return `${origin}->${destination}`;
}

function slugStatus(value) {
  return value.toLowerCase().replaceAll(" ", "_");
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

function fieldLabel(icon, text) {
  return `<span class="field-label">${icon}<span>${text}</span></span>`;
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
  all.unshift({ id: uid(), userId, title, body, createdAt: nowIso(), readAt: null });
  write(KEYS.notifications, all);
}

function notifyHrUsers(title, body) {
  read(KEYS.users, [])
    .filter((u) => canAccessRRHH(u.role))
    .forEach((u) => saveNotification({ userId: u.id, title, body }));
}

function sendEmail({ to, subject, body }) {
  const outbox = read(KEYS.emails, []);
  outbox.unshift({ id: uid(), to, subject, body, createdAt: nowIso() });
  write(KEYS.emails, outbox);
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
    id: uid(),
    name: companyName,
    taxId: "",
    phone: "",
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
  return read(KEYS.companies, [])
    .map((company) => `<option value="${company.id}" ${company.id === selectedId ? "selected" : ""}>${company.name}</option>`)
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
      id: uid(),
      name: user.company || "Empresa sin nombre",
      taxId: user.taxId || "",
      phone: user.phone || "",
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
  let changed = false;
  const updated = users.map((user) => {
    if (user.accountStatus) return user;
    changed = true;
    return { ...user, accountStatus: ACCOUNT_STATUS.APROBADO };
  });
  if (changed) write(KEYS.users, updated);
}

function queueApproval({ type, title, payload, requestedByUserId, requestedByName }) {
  const approvals = read(KEYS.approvals, []);
  approvals.unshift({
    id: uid(),
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
  write(KEYS.approvals, approvals);
  const admins = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
  admins.forEach((admin) => {
    saveNotification({
      userId: admin.id,
      title: "Nueva autorizacion pendiente",
      body: `${title} solicitada por ${requestedByName}.`
    });
  });
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
    const bootOk = window.PortalDataLayer?.refreshCacheFromApi
      ? await window.PortalDataLayer.refreshCacheFromApi()
      : await applyPortalBootstrapFromApi();
    if (bootOk && state.session && currentUser()) {
      renderPortalView();
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

function authView() {
  const tab = state.authTab;
  const deptOptions = departmentOptions();
  if (tab === "login") {
    return `
      <div class="auth-header-premium">
        <h3>Ingreso empresarial seguro</h3>
        <p class="muted">Acceda a su operación con trazabilidad, control de permisos y registro de actividad.</p>
      </div>
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
          <button class="btn btn-primary full" type="submit">${IC.check} Ingresar al portal</button>
        </form>
        <div class="auth-login-side auth-pane">
          <h3>${IC.shield} Acceso seguro Antares</h3>
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
        <h3>Registro de cliente empresarial</h3>
        <p class="muted">Complete su perfil. <strong>Solo un administrador</strong> puede revisar y aprobar el acceso; hasta entonces no podrá iniciar sesión.</p>
      </div>
      <form id="form-register" class="form-grid auth-form auth-register-form auth-pane">
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
          <div id="register-password-strength-suite" class="password-strength-suite">
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
        </label>
        <label class="full">${fieldLabel(IC.shield, "Confirmar contraseña")}<input type="password" minlength="10" name="passwordConfirm" autocomplete="new-password" autocapitalize="off" spellcheck="false" required class="auth-password-input" /></label>
        <label class="full">${fieldLabel(IC.file, "Términos")}<span class="checkbox-inline"><input type="checkbox" name="acceptTerms" required /> Acepto términos, política de privacidad y tratamiento de datos (Habeas Data).</span></label>
        <div class="full auth-inline-note">
          <small class="muted">${IC.shield} Su solicitud quedará pendiente hasta que un administrador apruebe y asocie una empresa.</small>
        </div>
        <button class="btn btn-primary full" type="submit">${IC.userPlus} Crear cuenta cliente</button>
      </form>
    `;
  }

  return `
    <div class="auth-header-premium">
      <h3>Recuperación de acceso</h3>
      <p class="muted">Validación administrativa; no podrá restablecer la contraseña sin la participación de un administrador.</p>
    </div>
    <form id="form-recover" class="form-grid auth-pane auth-form">
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.mail, "Correo registrado")}</span>
        <div class="auth-input-row">
          <span class="auth-input-prefix" aria-hidden="true">${IC.mail}</span>
          <input class="auth-input-control" type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required />
        </div>
      </label>
      <div class="auth-recover-hint" role="note">
        <span class="auth-recover-hint-icon" aria-hidden="true">${IC.shield}</span>
        <div>
          <strong>Proceso seguro</strong>
          <p class="muted" style="margin:0.25rem 0 0;font-size:0.82rem">Un administrador validará su identidad y gestionará el restablecimiento; recibirá instrucciones por correo si su cuenta existe.</p>
        </div>
      </div>
      <button class="btn btn-primary full" type="submit">${IC.send} Solicitar recuperación</button>
    </form>
  `;
}

function showAuth() {
  nodes.authModal.classList.remove("hidden");
  renderAuthTab();
}

function hideAuth() {
  nodes.authModal.classList.add("hidden");
}

function renderAuthTab() {
  nodes.authTabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.tab === state.authTab);
  });
  nodes.authContent.innerHTML = authView();
  bindAuthForms();
}

function bindAuthForms() {
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
      else input = login?.querySelector("input[name='password']");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      const eye = typeof IC !== "undefined" && IC.eye ? `${IC.eye} ` : "";
      btn.innerHTML = `${eye}${visible ? "Mostrar" : "Ocultar"}`;
    });
  });

  if (login) {
    login.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (Date.now() < state.authSecurity.lockUntil) {
        const secs = Math.ceil((state.authSecurity.lockUntil - Date.now()) / 1000);
        notify(userMessage("authLoginLock", secs), "error");
        return;
      }
      const data = Object.fromEntries(new FormData(login).entries());
      const passwordRaw = String(data.password || "");

      /**
       * Si hay URL de API, la autenticacion es SOLO contra el servidor (PostgreSQL).
       * No se usa fallback local respecto a credenciales guardadas solo en el navegador.
       */
      if (window.AntaresApi?.getBase?.()) {
        try {
          const base = String(window.AntaresApi.getBase()).replace(/\/+$/, "");
          const res = await fetch(`${base}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email: data.email, password: passwordRaw })
          });
          const body = await res.json().catch(() => null);
          if (res.ok && body?.accessToken && body?.refreshToken) {
            window.AntaresApi.setAccessToken(body.accessToken);
            if (window.PortalDataLayer?.refreshCacheFromApi) {
              await window.PortalDataLayer.refreshCacheFromApi();
            } else {
              await applyPortalBootstrapFromApi();
            }
            const payload = decodeJwtPayload(body.accessToken);
            const uid = payload?.sub;
            const usersAfter = read(KEYS.users, []);
            const userApi = usersAfter.find((u) => String(u.id) === String(uid));
            if (!userApi) {
              notify(userMessage("authProfileLoadFailed"), "error");
              return;
            }
            if (userApi.accountStatus === ACCOUNT_STATUS.PENDIENTE) {
              notify(userMessage("authPendingApproval"), "info");
              return;
            }
            if (userApi.accountStatus === ACCOUNT_STATUS.RECHAZADO) {
              notify(userMessage("authRejected"), "error");
              return;
            }
            state.authSecurity.failedAttempts = 0;
            state.authSecurity.lockUntil = 0;
            setSession({
              userId: userApi.id,
              role: userApi.role,
              token: buildToken(userApi),
              accessToken: body.accessToken,
              refreshToken: body.refreshToken,
              lastActivityAt: Date.now(),
              tokenIssuedAt: Date.now()
            });
            hideAuth();
            startSessionSecurityWatch();
            renderPortal();
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
      if (user.accountStatus === ACCOUNT_STATUS.PENDIENTE) {
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
        tokenIssuedAt: Date.now()
      });
      void tryApiLoginBridge(user, passwordRaw);
      hideAuth();
      startSessionSecurityWatch();
      renderPortal();
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
      registerPhoneNat.addEventListener("input", () => syncRegisterPhoneHidden(register));
    }
    if (registerPhoneCc) {
      registerPhoneCc.addEventListener("change", () => {
        clearFieldError(registerPhoneNat);
        updateRegisterPhoneFieldForCountry(register);
        syncRegisterPhoneHidden(register);
      });
    }
    updateRegisterPhoneFieldForCountry(register);
    syncRegisterPhoneHidden(register);
    const regPass = register.querySelector("input[name='password']");
    bindPasswordStrengthSuite(regPass, register.querySelector("#register-password-strength-suite"));
    register.addEventListener("submit", async (event) => {
      event.preventDefault();
      syncRegisterPhoneHidden(register);
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
      const meta = getSelectedRegisterPhoneCountry(register);
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

      if (window.AntaresApi?.getBase?.()) {
        try {
          const base = String(window.AntaresApi.getBase()).replace(/\/+$/, "");
          const res = await fetch(`${base}/api/auth/register-portal`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              firstName: normalizeLatinUpperForDb(data.firstName),
              middleName: normalizeLatinUpperForDb(data.middleName || ""),
              lastName: normalizeLatinUpperForDb(data.lastName),
              secondLastName: normalizeLatinUpperForDb(data.secondLastName || ""),
              personType: data.personType,
              documentType: normalizeLatinUpperForDb(data.documentType),
              taxId: data.taxId,
              companyNit: data.companyNit || "",
              personalTaxId: data.personalTaxId || "",
              birthDate: data.birthDate,
              gender: normalizeLatinUpperForDb(data.gender),
              position: normalizeLatinUpperForDb(data.position),
              workArea: normalizeLatinUpperForDb(data.workArea),
              phone: normalizeLatinUpperForDb(data.phone),
              department: normalizeLatinForDb(data.department),
              city: normalizeLatinForDb(data.city),
              address: normalizeLatinUpperForDb(data.address),
              email: data.email,
              password: data.password,
              acceptTerms: Boolean(data.acceptTerms)
            })
          });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) {
            const msg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message || res.statusText;
            notify(String(msg || userMessage("registerServerError")), "error");
            return;
          }
          notify(body?.message || userMessage("registerSuccess"), "success");
          state.authTab = "login";
          renderAuthTab();
          return;
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
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
        id: uid(),
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
          requiredFieldsCompleted: true
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
      notify(userMessage("registerSuccess"), "success");
      state.authTab = "login";
      renderAuthTab();
    });
  }

  if (recover) {
    recover.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(recover).entries());
      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
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
  applyFormWizards();
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

  write(
    KEYS.vehicles,
    vehicles.map((vehicle) => {
      if (busyVehicleIds.has(vehicle.id)) return { ...vehicle, available: false, autoBusy: true };
      if (vehicle.autoBusy) return { ...vehicle, available: true, autoBusy: false };
      return vehicle;
    })
  );
  write(
    KEYS.drivers,
    drivers.map((driver) => {
      if (busyDriverIds.has(driver.id)) return { ...driver, available: false, autoBusy: true };
      if (driver.autoBusy) return { ...driver, available: true, autoBusy: false };
      return driver;
    })
  );
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
    reqWrite(next);
    recalculateResourceAvailability();
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
  reqWrite(requests.map((r) => (r.id === requestId ? { ...r, trip: { ...r.trip, invoice } } : r)));

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
    id: uid(),
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
  reqWrite(updated);
  recalculateResourceAvailability();
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

function selectBestVehicle(requiredType, weight, pickupAt, etaDelivery, currentRequestId = null) {
  const vehicles = read(KEYS.vehicles, []);
  const filtered = vehicles.filter(
    (v) =>
      v.available &&
      (!requiredType || v.type === requiredType) &&
      !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
  );
  const pick =
    filtered.find((v) => v.capacityKg >= weight) ||
    filtered[0] ||
    vehicles.find((v) => v.available && !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)) ||
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

function getCompatibleVehiclesForRequest(request, currentRequestId = null) {
  const requiresRefrigeration = String(request?.serviceType || "").toLowerCase().includes("refrigerada");
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
  const requiresRefrigeration = String(request?.serviceType || "").toLowerCase().includes("refrigerada");
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

function setVehicleAvailability(vehicleId, available) {
  const vehicles = read(KEYS.vehicles, []);
  const next = vehicles.map((v) => (v.id === vehicleId ? { ...v, available } : v));
  write(KEYS.vehicles, next);
}

function setDriverAvailability(driverId, available) {
  const drivers = read(KEYS.drivers, []);
  const next = drivers.map((d) => (d.id === driverId ? { ...d, available } : d));
  write(KEYS.drivers, next);
}

function approveRequest(requestId, actorName = "Sistema", auto = false, selectedVehicleId = "", selectedDriverId = "", selectedTripValue = null) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  const canAssignTrip = current && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(current.status);
  if (!current || !canAssignTrip) return false;

  if (auto) {
    reqWrite(
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
              approvedAt: nowIso(),
              approvedBy: actorName,
              autoApproved: true,
              rejectionReason: ""
            }
          : r
      )
    );
    if (current.apiSynced && window.DomainModules?.requests?.approveViaApi) {
      void window.DomainModules.requests.approveViaApi(requestId).catch(() => {});
    }
    const targetUser = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
    if (targetUser) {
      saveNotification({
        userId: targetUser.id,
        title: "Solicitud autoaprobada",
        body: `Tu solicitud ${current.requestNumber || current.id} fue autoaprobada y quedo pendiente de asignacion de viaje.`
      });
    }
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
      requestId
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
    id: uid(),
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
  reqWrite(next);

  const users = read(KEYS.users, []);
  const target = users.find((u) => u.id === current.clientUserId);
  if (target) {
    saveNotification({
      userId: target.id,
      title: "Solicitud aprobada",
      body: `Tu solicitud ${current.requestNumber || current.id} fue aprobada${auto ? " automaticamente" : ""}. Viaje ${trip.tripNumber}.`
    });
    sendEmail({
      to: target.email,
      subject: "Solicitud aprobada",
      body: `Viaje ${trip.tripNumber} - Vehiculo ${trip.vehiclePlate} - Conductor ${trip.driverName}`
    });
  }
  return true;
}

function rejectRequest(requestId, reason, actorName) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  if (!current) return;
  const next = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: STATUS.RECHAZADA, approvedAt: nowIso(), approvedBy: actorName, rejectionReason: reason }
      : r
  );
  reqWrite(next);

  const user = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
  if (user) {
    saveNotification({ userId: user.id, title: "Solicitud rechazada", body: `Motivo: ${reason}` });
    sendEmail({ to: user.email, subject: "Solicitud rechazada", body: reason });
  }
}

function updateAutoApprove() {
  const requests = reqRead();
  requests
    .filter((r) => r.status === STATUS.PENDIENTE)
    .forEach((r) => {
      if (diffMinutes(r.createdAt) >= AUTO_APPROVE_MINUTES) {
        approveRequest(r.id, "Sistema", true);
      }
    });
}

function minutesRemaining(createdAt) {
  const left = AUTO_APPROVE_MINUTES - diffMinutes(createdAt);
  return Math.max(0, Math.ceil(left));
}

function currentUser() {
  const users = read(KEYS.users, []);
  return users.find((u) => u.id === state.session?.userId) || null;
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
  if (view === "contact-leads" && user.role === ROLES.ADMIN) {
    void applyPortalBootstrapFromApi().then((ok) => {
      if (ok) scheduleRenderPortalView();
    });
  }
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
    session = {
      ...session,
      lastActivityAt: ts,
      tokenIssuedAt: typeof session.tokenIssuedAt === "number" ? session.tokenIssuedAt : ts
    };
    setSession(session);
  } else if (ts - getEffectiveLastActivityAt() > SESSION_IDLE_MS) {
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
  const user = currentUser();
  if (!user) {
    clearSession();
    renderPortal();
    return;
  }

  nodes.sessionMeta.textContent = `${user.name} - ${user.role.toUpperCase()}`;
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
  enforcePortalViewFromUrl(user);
  if (!isViewAllowedForUser(user, state.currentView)) {
    state.currentView = "dashboard";
    syncPortalHash("dashboard");
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

function __tickNotificationsPoll() {
  const user = currentUser();
  if (!user) return;
  const current = getCurrentNotifications();
  const seen = __lastSeenNotificationIds || new Set();
  const fresh = current.filter((n) => !seen.has(n.id));
    if (fresh.length) {
      fresh.forEach((n) => {
        if (typeof notify === "function") {
          const message = `${n.title}${n.body ? " — " + n.body : ""}`;
          notify(message, "info");
        }
      });
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
    const key = r.vehicleType || "Sin tipo";
    byVehicle[key] = (byVehicle[key] || 0) + 1;
  });
  const colors = { Turbo: "#F59F00", Camion: "#1565C0", Tractocamion: "#1B8E5F", "Sin tipo": "#94A3B8" };
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
  const companyName = getCompanyById(user?.companyId)?.name || user?.company || "-";
  const departments = Object.keys(COLOMBIA_LOCATIONS)
    .map((dept) => `<option value="${dept}">${dept}</option>`)
    .join("");
  const body = `<form id="form-request" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.briefcase} Empresa y ruta</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.briefcase, "Empresa asociada")}
          <input value="${escapeHtml(companyName)}" disabled />
          <input type="hidden" name="companyId" value="${escapeAttr(user?.companyId || "")}" />
        </label>
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
      <legend>${IC.truck} Carga y vehiculo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.truck, "Tipo vehiculo")}<select name="vehicleType" required><option value="">Seleccione...</option><option>Turbo</option><option>Camion</option><option>Tractocamion</option></select></label>
        <label>${fieldLabel(IC.file, "Descripcion carga")}<input name="cargoDescription" required /></label>
        <label>${fieldLabel(IC.briefcase, "Tipo de servicio")}<select name="serviceType" required><option value="">Seleccione...</option><option>Transporte nacional</option><option>Ultima milla</option><option>Carga refrigerada</option><option>Carga seca</option></select></label>
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
    <p class="muted full legal-form-note">La solicitud queda sujeta a aprobacion operativa y disponibilidad de flota.</p>
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

function adminQueueHtml() {
  const allReq = reqRead();
  const requests = allReq.filter((r) => r.status === STATUS.PENDIENTE);
  const pendingAssign = allReq.filter((r) => r.status === STATUS.APROBADA_PENDIENTE_ASIGNACION).length;
  const activeOps = allReq.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
  const queueHero = moduleFleetHeroStrip([
    { label: "Bandeja pendiente", value: requests.length, tone: requests.length ? "warn" : undefined },
    { label: "Total solicitudes", value: allReq.length },
    { label: "Aprob. sin asignar", value: pendingAssign, tone: pendingAssign ? "warn" : undefined },
    { label: "Viajes en operacion", value: activeOps }
  ]);
  const rows = requests
    .map((r) => `<tr>
      <td><strong>${r.requestNumber || r.id}</strong></td>
      <td>${r.clientName}</td>
      <td>${formatRoute(r)}</td>
      <td>${r.vehicleType}</td>
      <td><span class="timer-badge">${IC.clock} ${minutesRemaining(r.createdAt)} min</span></td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-approve" data-action="approve" data-id="${r.id}">${IC.check} Aprobar</button>
        <button class="btn btn-sm btn-reject" data-action="reject" data-id="${r.id}">${IC.x} Rechazar</button>
        <button class="btn btn-sm btn-action" data-action="edit-admin" data-id="${r.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-action" data-action="delete-admin" data-id="${r.id}">${IC.trash} Eliminar</button>
      </div></td>
    </tr>`)
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Cliente</th><th>Ruta</th><th>Vehiculo</th><th>Timer</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay solicitudes pendientes.");
  return `${queueHero}${pcardWrap("inbox", "Bandeja de pendientes", requests.length + " solicitudes por revisar", body, requests.length > 0 ? "p-card-alert" : "")}`;
}

function vehiclesHtml() {
  const vehicles = read(KEYS.vehicles, []);
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
          <button class="btn btn-sm btn-action" data-action="edit-vehicle" data-id="${v.id}">${IC.edit} Editar</button>
          <button class="btn btn-sm btn-action" data-action="toggle-vehicle" data-id="${v.id}">${IC.toggle} Estado</button>
          <button class="btn btn-sm btn-reject" data-action="delete-vehicle" data-id="${v.id}">${IC.trash} Eliminar</button>
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
        <label>${fieldLabel(IC.truck, "Tipo")}<select name="type" required><option value="">Seleccione...</option><option>Turbo</option><option>Camión</option><option>Tractocamión</option></select></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-violet full">
      <legend>${IC.layers} Especificaciones técnicas</legend>
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

    <p class="muted full legal-form-note">Documentación obligatoria en Colombia: tarjeta de propiedad, SOAT, tecnomecánica, RC contractual y extracontractual. Para transporte refrigerado se exige certificación de cadena de frío y registro INVIMA cuando aplique.</p>
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
          <button class="btn btn-sm btn-action" data-action="edit-driver" data-id="${d.id}">${IC.edit} Editar</button>
          <button class="btn btn-sm btn-action" data-action="toggle-driver" data-id="${d.id}">${IC.toggle} Estado</button>
          <button class="btn btn-sm btn-reject" data-action="delete-driver" data-id="${d.id}">${IC.trash} Eliminar</button>
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
  const rates = read(KEYS.tripRouteRates, {});
  const rateEntries = Object.entries(rates).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
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
      </select><button class="btn btn-sm btn-action" data-action="trip-detail" data-id="${r.id}">${IC.eye} Detalle</button><button class="btn btn-sm btn-reject" data-action="delete-trip" data-id="${r.id}">${IC.trash} Eliminar viaje</button>${[STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status) ? `<button class="btn btn-sm btn-approve" data-action="trip-invoice" data-id="${r.id}">${IC.file} Factura PDF</button>` : ""}</div></td>
    </tr>`;
    })
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Viaje</th><th>Solicitud</th><th>Cliente</th><th>Ruta y carga</th><th>Camion</th><th>Conductor</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay viajes asignados.");

  const formatRateRowLabel = (key) => {
    const [orig, dest] = String(key).split("->");
    const [od, oc] = String(orig || "").split("|");
    const [dd, dc] = String(dest || "").split("|");
    return `${escapeHtml(od || "-")} · ${escapeHtml(oc || "-")} → ${escapeHtml(dd || "-")} · ${escapeHtml(dc || "-")}`;
  };
  const ratesRows = rateEntries.length
    ? rateEntries
        .map(([key, val]) => {
          const safeKey = encodeURIComponent(key);
          return `<tr>
          <td><strong>${formatRateRowLabel(key)}</strong></td>
          <td><strong>$${parseNum(val).toLocaleString("es-CO")}</strong></td>
          <td><button type="button" class="btn btn-sm btn-reject" data-action="delete-route-rate" data-rate-key="${safeKey}">${IC.trash} Quitar</button></td>
        </tr>`;
        })
        .join("")
    : "";
  const ratesTable = ratesRows
    ? `<div class="table-wrap"><table><thead><tr><th>Trayecto</th><th>Tarifa (COP)</th><th></th></tr></thead><tbody>${ratesRows}</tbody></table></div>`
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
    <p class="muted full legal-form-note">Misma combinacion origen/destino que en solicitudes de cliente. Si ya existe, se actualiza el valor.</p>
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
    <p class="muted full">${pendingForTrip.length ? "Al enviar se abrira el selector de camion, conductor y precio del viaje." : "Aprobá solicitudes desde Transporte · Solicitudes o esperá la ventana de autoaprobacion."}</p>
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
    ${createCollapsibleCard("create-route-rate", "dollar", "Tarifas por trayecto", "Precios sugeridos por ruta (origen y destino)", routeRateForm, "Nueva tarifa")}
    ${createCollapsibleCard("create-trip", "plus", "Crear viaje", "Asigna camion y conductor a una solicitud aprobada", createTripForm, "Asignar viaje")}
  </div>`;

  return `${heroStrip}${actionGrid}${pcardWrap("mapPin", "Rutas y tarifas configuradas", `${rateEntries.length} rutas`, ratesTable)}${pcardWrap("compass", "Viajes operativos", `${trips.length} viajes`, body)}`;
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
  const users = read(KEYS.users, []);
  const companies = read(KEYS.companies, []);
  const ui = state.adminUsersUi || { panel: "", editUserId: "" };
  const editingUser = ui.editUserId ? users.find((u) => u.id === ui.editUserId) : null;

  const companyOptions = companies
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");

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
      admin: "#1565C0",
      rrhh: "#7C3AED",
      administracion: "#1D4ED8",
      auxiliar_administrativo: "#0EA5E9",
      lider_administrativo: "#4F46E5",
      client: "#0E7490"
    };
    return `<span class="role-chip" style="--role-color:${colors[r] || '#64748B'}">${r}</span>`;
  };

  // --- Usuarios ---
  const userCards = users.map((u) => {
    const namedPerms = (u.permissions || []).map((p) => PERMISSION_META[p]?.title || p);
    const visiblePerms = namedPerms.slice(0, 3);
    const hiddenCount = Math.max(0, namedPerms.length - visiblePerms.length);
    const permList = [
      ...visiblePerms.map((label) => `<span class="perm-tag">${label}</span>`),
      hiddenCount > 0 ? `<span class="perm-tag perm-tag-more">+${hiddenCount} mas</span>` : ""
    ].join("");
    const isMe = u.id === current.id;
    return `<div class="user-card">
      <div class="user-card-top">
        <div class="user-avatar">${u.name.charAt(0).toUpperCase()}</div>
        <div class="user-card-info">
          <h4>${u.name}${isMe ? ' <span class="muted" style="font-weight:400;font-size:0.78rem">(tu)</span>' : ""}</h4>
          <p>${u.email}</p>
        </div>
        <div class="user-card-badges">
          ${roleBadge(u.role)}
          ${statusBadge(u.accountStatus)}
        </div>
      </div>
      <div class="user-card-meta">
        <span>${IC.briefcase} ${getCompanyById(u.companyId)?.name || u.company || "Sin empresa"}</span>
        ${u.phone ? `<span>${IC.user} ${u.phone}</span>` : ""}
        ${u.city ? `<span>${IC.mapPin} ${u.city}${u.department ? `, ${u.department}` : ""}</span>` : ""}
      </div>
      ${permList ? `<div class="user-card-perms">${permList}</div>` : ""}
      <div class="user-card-actions">
        <button class="btn btn-sm btn-action" data-action="open-edit-user" data-id="${u.id}">${IC.edit} Editar</button>
        ${!isMe ? `<button class="btn btn-sm btn-reject" data-action="delete-user" data-id="${u.id}">${IC.trash} Eliminar</button>` : ""}
      </div>
    </div>`;
  }).join("");

  // --- Pendientes ---
  const pendingUsers = users.filter((u) => u.accountStatus === ACCOUNT_STATUS.PENDIENTE);
  const pendingCards = pendingUsers.map((u) => `<div class="user-card pending-card">
    <div class="user-card-top">
      <div class="user-avatar pending-avatar">${u.name.charAt(0).toUpperCase()}</div>
      <div class="user-card-info">
        <h4>${u.name}</h4>
        <p>${u.email}</p>
      </div>
    </div>
    <div class="user-card-meta">
      <span>${IC.briefcase} ${getCompanyById(u.companyId)?.name || u.company || "-"}</span>
      <span>${IC.file} ${String(u.documentType || "Doc")} ${u.taxId || "-"}${u.personalTaxId || u.personalDoc ? ` · pers. ${u.personalTaxId || u.personalDoc}` : ""}</span>
      ${u.phone ? `<span>${IC.user} ${u.phone}</span>` : ""}
      ${u.registeredAt ? `<span>${IC.clock} ${fmtDate(u.registeredAt)}</span>` : ""}
    </div>
    <div class="user-card-actions">
      <button class="btn btn-sm btn-approve" data-action="approve-registration" data-id="${u.id}">${IC.check} Aprobar</button>
      <button class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${u.id}">${IC.x} Rechazar</button>
    </div>
  </div>`).join("");

  // --- Formularios ---
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
          <p id="admin-create-password-hint" class="muted password-policy-hint">Mismo estándar que el registro público (10+ caracteres, mayúscula, minúscula, número y símbolo). La contraseña se muestra tal cual al escribirla; se guarda con hash seguro.</p>
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
    <label>${fieldLabel(IC.briefcase, "Nombre empresa")}<input name="name" required placeholder="Nombre de la empresa" /></label>
    <label>${fieldLabel(IC.badge, "NIT / RUT")}<input name="taxId" required placeholder="900.000.000-0" /></label>
    <label>${fieldLabel(IC.phone, "Teléfono")}<input name="phone" required placeholder="+57 300 000 0000" /></label>
    <button class="btn btn-primary full" type="submit">${IC.plus} Registrar empresa</button>
  </form>`;

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

  const fEdit = editingUser ? `<form id="form-admin-user-edit" class="p-form">
    <input type="hidden" name="id" value="${editingUser.id}" />
    <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" value="${editingUser.name || ""}" required /></label>
    <label>${fieldLabel(IC.mail, "Correo")}<input type="email" name="email" value="${editingUser.email || ""}" required /></label>
    <label>${fieldLabel(IC.lock, "Contraseña")}<input type="password" name="password" placeholder="Dejar vacío para conservar" /></label>
    <label>${fieldLabel(IC.file, "Tipo documento")}
      <select name="documentType" required>
        <option value="CC" ${editingUser.documentType === "CC" ? "selected" : ""}>Cédula de ciudadanía</option>
        <option value="CE" ${editingUser.documentType === "CE" ? "selected" : ""}>Cédula de extranjería</option>
        <option value="NIT" ${editingUser.documentType === "NIT" ? "selected" : ""}>NIT</option>
        <option value="PAS" ${editingUser.documentType === "PAS" ? "selected" : ""}>Pasaporte</option>
      </select>
    </label>
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
    <label>${fieldLabel(IC.briefcase, "Empresa")}
      <input value="${getCompanyById(editingUser.companyId)?.name || editingUser.company || "-"}" disabled />
      <input type="hidden" name="companyId" value="${editingUser.companyId || ""}" />
    </label>
    <label>${fieldLabel(IC.phone, "Teléfono")}<input name="phone" value="${editingUser.phone || ""}" /></label>
    <label>${fieldLabel(IC.mapPin, "Departamento")}
      <select name="department" id="admin-edit-department"><option value="">Seleccione...</option>${departmentOptions(editingUser.department || "")}</select>
    </label>
    <label>${fieldLabel(IC.mapPin, "Ciudad")}
      <select name="city" id="admin-edit-city"><option value="">Seleccione...</option>${cityOptionsFromDepartment(editingUser.department || "", editingUser.city || "")}</select>
    </label>
    <label>${fieldLabel(IC.compass, "Dirección")}<input name="address" value="${editingUser.address || ""}" /></label>
    <label>${fieldLabel(IC.building || IC.briefcase, "Nombre comercial")}<input name="company" value="${editingUser.company || ""}" /></label>
    <label>${fieldLabel(IC.badge, "NIT / RUT")}<input name="taxId" value="${editingUser.taxId || ""}" /></label>
    <label>${fieldLabel(IC.lock, "Autenticación 2FA")}<select name="twoFactorEnabled">
      <option value="false" ${!editingUser.twoFactorEnabled ? "selected" : ""}>Deshabilitada</option>
      <option value="true" ${editingUser.twoFactorEnabled ? "selected" : ""}>Habilitada (recomendado)</option>
    </select></label>
    <label>${fieldLabel(IC.calendar, "Fecha de ingreso al sistema")}<input type="date" name="systemJoinDate" value="${editingUser.systemJoinDate || (editingUser.createdAt ? String(editingUser.createdAt).slice(0,10) : "")}" /></label>
    <label class="full">${fieldLabel(IC.upload, "Cambiar avatar")}<input type="file" name="avatarFile" accept="image/*" /></label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos granulares</legend>
      <div class="perm-grid">${permissionChecks(editingUser.permissions || [])}</div>
    </fieldset>
    <div class="toolbar full">
      <button class="btn btn-primary" type="submit">${IC.save} Guardar cambios</button>
      <button class="btn btn-action" type="button" data-action="close-edit-user">${IC.x} Cancelar</button>
    </div>
  </form>` : "";

  // --- Empresas tabla ---
  const companyRows = companies.map((c) => `<div class="company-chip">
    <strong>${c.name}</strong>
    <span class="muted">${c.taxId || ""} · ${c.phone || ""}</span>
  </div>`).join("");

  // --- Render ---
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

  if (pendingUsers.length > 0) {
    html += pcardWrap("bell", "Solicitudes pendientes (" + pendingUsers.length + ")", "Estos clientes necesitan aprobación para acceder", `<div class="user-grid user-grid-pending">${pendingCards}</div>`, "p-card-alert");
  }

  if (ui.panel === "create-user") html += pcardWrap("userPlus", "Crear nuevo usuario", "Completa los datos y permisos", fUser);
  if (ui.panel === "create-company") html += pcardWrap("plus", "Registrar empresa", "Agregar nueva empresa al sistema", fComp);
  if (ui.panel === "set-permissions") html += pcardWrap("save", "Asignar permisos", "Selecciona usuario y permisos", fPerm);
  if (editingUser) html += pcardWrap("edit", "Editar usuario", `Actualiza los datos de ${editingUser.name}`, fEdit);

  html += pcardWrap("shield", "Usuarios del sistema", users.length + " registrados", userCards ? `<div class="user-grid user-grid-main">${userCards}</div>` : emptyState("Sin usuarios registrados."));

  if (companies.length > 0) {
    html += pcardWrap("briefcase", "Empresas registradas", companies.length + " empresas", `<div class="company-grid">${companyRows}</div>`);
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
  const rows = requests
    .map((r) => `<tr>
      <td>${fmtDate(r.createdAt)}</td>
      <td><strong>${r.requestNumber || r.id}</strong></td>
      <td>${r.clientName}</td>
      <td>${r.vehicleType}</td>
      <td>${prettyStatus(r.status)}</td>
      <td>${r.trip?.tripNumber || '<span class="muted">-</span>'}</td>
    </tr>`)
    .join("");

  const filterBody = `<form id="history-filter" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.filter} Periodo y criterios</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
        <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
        <label>${fieldLabel(IC.user, "Cliente")}<select name="client"><option value="">Todos</option>${options}</select></label>
        <label>${fieldLabel(IC.activity, "Estado")}<select name="status"><option value="">Todos</option>${Object.values(STATUS).map((s) => `<option>${s}</option>`).join("")}</select></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.filter} Aplicar filtro</button>
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
    acc[r.vehicleType] = (acc[r.vehicleType] || 0) + 1;
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
    const rows = read(KEYS.candidates, []).map((candidate) => ({
      name: candidate.name,
      vacancy: candidate.vacancyTitle,
      source: candidate.source || "-",
      status: candidate.status,
      expectedSalary: parseNum(candidate.expectedSalary || 0),
      hasInterview: interviews.some((item) => String(item.candidateId || "") === String(candidate.id)) ? "Sí" : "No",
      hasContract: contracts.some((item) => String(item.candidateId || "") === String(candidate.id)) ? "Sí" : "No",
      stageAgeDays: Math.max(0, Math.floor((Date.now() - new Date(candidate.createdAt || nowIso()).getTime()) / 86400000)),
      createdAt: fmtDate(candidate.createdAt)
    }));
    return {
      title: "Reporte de contratacion y pipeline",
      columns: [
        { key: "name", label: "Candidato" },
        { key: "vacancy", label: "Vacante" },
        { key: "source", label: "Fuente" },
        { key: "status", label: "Estado proceso" },
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
  if (!/^\d{4}-\d{2}$/.test(m)) return null;
  const [year, monthNum] = m.split("-").map(Number);
  const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
  return { start, end };
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

function syncDriverFromEmployee(employee, extraDriverData = {}) {
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
    write(KEYS.drivers, drivers.map((d) => (d.id === existing.id ? { ...d, ...nextDriver } : d)));
    return;
  }
  write(KEYS.drivers, [{ id: uid(), ...nextDriver }, ...drivers]);
}

function deleteEmployeesCascade(employeeIds = []) {
  const ids = [...new Set(employeeIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!ids.length) return 0;
  const employees = read(KEYS.payrollEmployees, []);
  const targets = employees.filter((employee) => ids.includes(String(employee.id)));
  const targetDocSet = new Set(targets.map((employee) => String(employee.idDoc || "").trim()).filter(Boolean));
  write(KEYS.payrollEmployees, employees.filter((employee) => !ids.includes(String(employee.id))));
  write(KEYS.payrollRuns, read(KEYS.payrollRuns, []).filter((run) => !ids.includes(String(run.employeeId || ""))));
  write(KEYS.hrAbsences, read(KEYS.hrAbsences, []).filter((absence) => !ids.includes(String(absence.employeeId || ""))));
  write(
    KEYS.contracts,
    read(KEYS.contracts, []).filter((contract) => {
      const employeeId = String(contract.employeeId || "");
      const doc = String(contract.employeeIdDoc || "").trim();
      if (ids.includes(employeeId)) return false;
      if (doc && targetDocSet.has(doc)) return false;
      return true;
    })
  );
  write(
    KEYS.drivers,
    read(KEYS.drivers, []).filter((driver) => {
      const doc = String(driver.idDoc || "").trim();
      return !targetDocSet.has(doc);
    })
  );
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
    "transport-requests": "Solicitudes transporte",
    "transport-trips": "Viajes",
    "transport-vehicles": "Flota",
    "transport-drivers": "Conductores",
    "transport-calendar": "Calendario",
    history: "Historial",
    payroll: "Nomina",
    hiring: "Contratacion",
    "admin-users": "Usuarios",
    authorizations: "Autorizaciones",
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
  const companyOptions = companies.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  const allRuns = read(KEYS.payrollRuns, []);
  const absences = read(KEYS.hrAbsences, []);
  const filters = state.payrollFilters || { period: "all", employee: "", status: "all" };
  const payrollUi = state.payrollUi || { runSort: "recent" };
  const runSort = String(payrollUi.runSort || "recent");
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
  const employeeRows = employees
    .map((e) => {
      const av = String(e.avatarUrl || "");
      const avatar =
        av && /^https?:\/\//i.test(av)
          ? `<span class="emp-avatar" style="background-image:url('${av.replace(/'/g, "\\'")}')"></span>`
          : `<span class="emp-avatar emp-avatar-letter">${(e.name || "E").charAt(0).toUpperCase()}</span>`;
      return `<tr>
      <td><input type="checkbox" data-employee-select value="${e.id}" /></td>
      <td><div class="emp-cell-name">${avatar}<div><strong>${e.name}</strong><br><span class="muted">${e.workerRole === "conductor" ? "Conductor" : "Empleado"}</span></div></div></td><td>${e.idDoc}</td><td>${e.position}</td><td>${e.contractType}</td><td>${getCompanyById(e.companyId)?.name || "-"}</td><td>$${parseNum(e.baseSalary).toLocaleString("es-CO")}</td><td>${fmtDate(e.startDate)}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="edit-employee" data-id="${e.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${e.id}">${IC.trash} Eliminar</button>
      </div></td>
    </tr>`;
    })
    .join("");
  const runRows = sortedRuns
    .map((r) => `<tr>
      <td>${r.month}</td><td>${r.employeeName}</td><td>$${parseNum(r.gross).toLocaleString("es-CO")}</td><td>$${parseNum(r.travelAllowance || 0).toLocaleString("es-CO")}</td><td>$${parseNum(r.fuelReimbursement || 0).toLocaleString("es-CO")}</td><td>$${parseNum(r.deductions).toLocaleString("es-CO")}</td><td>$${parseNum(r.net).toLocaleString("es-CO")}</td>
      <td>${r.paid ? '<span class="status status-viaje_asignado">Pagado</span>' : '<span class="status status-pendiente">Pendiente</span>'}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="payslip" data-id="${r.id}">${IC.printer} Desprendible</button>
        ${!r.paid ? `<button class="btn btn-sm btn-approve" data-action="mark-payroll-paid" data-id="${r.id}">${IC.check} Marcar pagado</button>` : ""}
      </div></td>
    </tr>`)
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
  const formEmp = `<form id="form-employee" class="p-form p-form-colored">
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
      </div>
    </fieldset>

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

    <fieldset class="form-section form-section-amber full">
      <legend>${IC.bank} Datos bancarios</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.bank, "Banco")}<select name="bankName" required>${banksOpts}</select></label>
        <label>${fieldLabel(IC.card, "Tipo de cuenta")}<select name="bankAccountType">${accountTypeOpts}</select></label>
        <label>${fieldLabel(IC.hash, "Número de cuenta")}<input name="bankAccount" required placeholder="Ej: 1234567890" /></label>
      </div>
    </fieldset>

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
    <p class="muted full legal-form-note">El cargo y salario deben cumplir parámetros mínimos legales (referencia SMMLV ${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")} y auxilio de transporte $${CO_HR_RULES.transportAllowance.toLocaleString("es-CO")}). Aportes patronales (12% pensión, 8.5% salud), parafiscales (SENA 2%, ICBF 3%, Caja 4%) y ARL según nivel de riesgo son obligatorios.</p>
    <button class="btn btn-primary full" type="submit">${IC.save} Guardar empleado</button>
  </form>`;
  const formPay = `<form id="form-payroll" class="p-form">
    <label>Empleado <select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.workerRole === "conductor" ? "Conductor" : "Empleado"}</option>`).join("")}</select></label>
    <label>Mes <input type="month" name="month" required /></label>
    <label>${fieldLabel(IC.dollar, "Viaticos manuales")}<input type="number" name="travelAllowanceManual" value="0" min="0" /></label>
    <label>${fieldLabel(IC.dollar, "Reembolso combustible manual")}<input type="number" name="fuelReimbursementManual" value="0" min="0" /></label>
    <label>Horas extras <input type="number" name="extras" value="0" /></label>
    <label>Aux transporte <input type="number" name="aux" value="${CO_HR_RULES.transportAllowance}" /></label>
    <label>Bonificaciones <input type="number" name="bonus" value="0" /></label>
    <p class="muted full">Para conductores el sistema suma automaticamente viaticos por viajes interdepartamentales ($${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")} por viaje) y reembolsos de combustible pagado por conductor en el mes seleccionado. Puedes ajustar manualmente si hay novedades.</p>
    <p class="muted full">Deducciones empleado (referencia): Salud 4%, Pension 4% sobre IBC; Fondo de Solidaridad Pensional 1% si IBC supera 4 SMMLV. Valores legales definitivos dependen del periodo y norma vigente.</p>
    <button class="btn btn-primary full" type="submit">${IC.dollar} Generar liquidacion</button>
  </form>`;
  const formAbsence = `<form id="form-hr-absence" class="p-form">
    <label>Empleado <select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.idDoc}</option>`).join("")}</select></label>
    <label>Tipo de ausencia
      <select name="absenceType" required>
        <option value="incapacidad">Incapacidad (EPS / enfermedad general o accidente)</option>
        <option value="vacaciones">Vacaciones remuneradas</option>
        <option value="licencia">Licencia (maternidad/paternidad u otra)</option>
        <option value="calamidad">Licencia por calamidad domestica (3 dias/calendario ano)</option>
      </select>
    </label>
    <label>Desde <input type="date" name="startDate" required /></label>
    <label>Hasta <input type="date" name="endDate" required /></label>
    <label class="full">No. incapacidad o soporte (si aplica) <input name="supportNumber" placeholder="Codigo EPS / radicado" /></label>
    <label class="full">EPS o entidad (incapacidad) <select name="epsEntity">${epsOptions}<option value="Otra">Otra</option></select></label>
    <label class="full">Observaciones <textarea name="notes" rows="2" placeholder="Detalle para archivo de personal"></textarea></label>
    <p class="muted full">Registro interno para control de nomina y ausencias. Pagos de incapacidad y causacion de vacaciones en sistema real requieren parametrizacion contable y validacion con normativa vigente (CST, Ley 1562 de 2012, Decreto 2649, entre otros).</p>
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
    </tr>`
    )
    .join("");
  const absenceTable = absenceRows
    ? `<div class="table-wrap"><table><thead><tr><th>Registro</th><th>Empleado</th><th>Tipo</th><th>Periodo</th><th>Dias</th><th>Soporte</th></tr></thead><tbody>${absenceRows}</tbody></table></div>`
    : emptyState("Sin incapacidades ni vacaciones registradas.");
  const empTable = employeeRows
    ? `<div style="margin-bottom:0.8rem" class="toolbar"><button id="employees-select-all" class="btn btn-sm btn-action">${IC.check} Seleccionar todo</button><button id="employees-delete-selected" class="btn btn-sm btn-reject">${IC.trash} Eliminar seleccionados (cascada)</button></div><div class="table-wrap"><table><thead><tr><th></th><th>Nombre/Rol</th><th>Cedula</th><th>Cargo</th><th>Contrato</th><th>Empresa</th><th>Base</th><th>Ingreso</th><th>Acciones</th></tr></thead><tbody>${employeeRows}</tbody></table></div>`
    : emptyState("No hay empleados registrados.");
  const runTable = runRows
    ? `<div style="margin-bottom:0.8rem"><button id="export-payroll" class="btn btn-sm btn-action">${IC.download} Exportar CSV</button></div><div class="table-wrap"><table><thead><tr><th>Mes</th><th>Empleado</th><th>Devengado</th><th>Viaticos</th><th>Reembolso combustible</th><th>Deducciones</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${runRows}</tbody></table></div>`
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
  const payrollHead = `<div class="ops-module-head">
      <div class="ops-module-title">
        <span class="ops-module-kicker">Recursos humanos</span>
        <h2>Nómina y gestión de personal</h2>
      </div>
      <div class="ops-module-chips">
        <span class="ops-chip"><strong>${employees.length}</strong> empleados</span>
        <span class="ops-chip"><strong>${pending}</strong> pendientes</span>
        <span class="ops-chip"><strong>${pendingAbsenceApprovals}</strong> por revisar</span>
      </div>
    </div>`;
  const payrollActions = `<div class="ops-command-bar">
      <div class="ops-command-group">
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-employee">${IC.userPlus} Nuevo empleado</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-payroll">${IC.dollar} Nueva liquidación</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-hr-absence">${IC.calendar} Nueva ausencia</button>
      </div>
      <div class="ops-command-group">
        <button class="btn btn-sm btn-outline ${filterStatus === "pending" ? "is-active" : ""}" type="button" data-action="payroll-focus-pending">${IC.alertTriangle} Solo pendientes</button>
        <button class="btn btn-sm btn-outline ${filterStatus === "all" ? "is-active" : ""}" type="button" data-action="payroll-focus-all">${IC.layers} Ver todo</button>
        <button class="btn btn-sm btn-outline ${runSort === "pending_first" ? "is-active" : ""}" type="button" data-action="payroll-sort-runs" data-sort="pending_first">${IC.activity} Pendientes primero</button>
        <button class="btn btn-sm btn-outline ${runSort === "net_desc" ? "is-active" : ""}" type="button" data-action="payroll-sort-runs" data-sort="net_desc">${IC.dollar} Neto mayor</button>
      </div>
    </div>`;
  const payrollExecutionBlock = `<section class="ops-block">
      <header class="ops-block-head">
        <h3>Ejecución de nómina</h3>
      </header>
      <div class="dash-grid payroll-actions-grid">${createCollapsibleCard("create-employee", "userPlus", "Registro de empleado", null, formEmp, "Registrar empleado")}${createCollapsibleCard("create-payroll", "dollar", "Liquidación mensual", null, formPay, "Generar liquidación")}${createCollapsibleCard("create-hr-absence", "calendar", "Ausencias e incapacidades", null, formAbsence, "Registrar ausencia")}</div>
    </section>`;
  const payrollDataBlock = `<section class="ops-block">
      <header class="ops-block-head">
        <h3>Control y trazabilidad</h3>
      </header>
      <div class="payroll-data-grid">
        ${pcardWrap("user", "Empleados", employees.length + " registrados" + (pending > 0 ? ` · ${pending} pagos pendientes` : ""), empTable)}
        ${pcardWrap("activity", "Ausencias e incapacidades", absences.length + " registros", absenceTable)}
        ${pcardWrap("clock", "Historial de pagos", runs.length + " liquidaciones", runTable)}
      </div>
    </section>`;
  const payrollFleetHero = moduleFleetHeroStrip([
    { label: "Empleados", value: employees.length },
    { label: "Pagos pendientes", value: pending, tone: pending ? "warn" : undefined },
    { label: "Neto liquidado (mes)", value: `$${parseNum(totalPayrollMonth).toLocaleString("es-CO")}` },
    {
      label: "Ausencias por revisar",
      value: pendingAbsenceApprovals,
      tone: pendingAbsenceApprovals ? "warn" : undefined
    }
  ]);
  return `<section class="payroll-shell">${payrollFleetHero}${payrollHead}
      ${payrollActions}
      <section class="ops-block">
        <header class="ops-block-head">
          <h3>Filtro operativo</h3>
        </header>
        ${pcardWrap("filter", "Filtros de nómina", null, filtersHtml)}
      </section>
      ${payrollExecutionBlock}
      ${payrollDataBlock}
    </section>`;
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
  const hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent" };
  const candidateFilter = String(hiringUi.candidateFilter || "active");
  const vacancyFilter = String(hiringUi.vacancyFilter || "open");
  const candidateSort = String(hiringUi.candidateSort || "recent");
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

  const positionRows = positions
    .map((p) => `<tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.workerRole === "conductor" ? "Conductor" : "Empleado"}</td>
      <td>$${parseNum(p.baseSalary).toLocaleString("es-CO")}</td>
      <td>${p.contractTypeDefault || "-"}</td>
      <td>${p.legalBasis || "CST"}</td>
      <td>${p.active === false ? '<span class="status status-rechazada">Inactivo</span>' : '<span class="status status-viaje_asignado">Activo</span>'}</td>
      <td><button class="btn btn-sm btn-action" data-action="toggle-position" data-id="${p.id}">${IC.toggle} Estado</button></td>
    </tr>`)
    .join("");

  const filteredVacancies = vacancies.filter((v) => (vacancyFilter === "open" ? v.status === "Publicada" : true));
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
  const vacRows = filteredVacancies.map((v) => `<tr><td><strong>${v.title}</strong></td><td>${v.positionName || "-"}</td><td>${v.city || "-"} · ${v.modality || "-"}</td><td>${v.openings || 1}</td><td>$${parseNum(v.salaryOffer).toLocaleString("es-CO")}</td><td>${v.deadline}</td><td>${v.status === "Publicada" ? '<span class="status status-viaje_asignado">Publicada</span>' : '<span class="status status-rechazada">Cerrada</span>'}</td><td><button class="btn btn-sm btn-action" data-action="close-vacancy" data-id="${v.id}">${IC.x} Cerrar</button></td></tr>`).join("");
  const candRows = sortedCandidates.map((c) => `<tr><td><strong>${c.name}</strong></td><td>${c.email}<br><span class="muted">${c.phone || "-"}</span></td><td>${c.vacancyTitle || "-"}</td><td>${parseNum(c.experienceYears || 0)} anos · Disp: ${c.availabilityDate || "-"}</td><td><span class="muted">${c.source || "Portal"}</span></td><td><span class="status status-en_transito">${c.status}</span></td><td><select data-action="candidate-status" data-id="${c.id}" style="padding:0.4rem;border-radius:8px;border:1px solid var(--line);font-size:0.82rem">${PIPELINE.map((p) => `<option ${c.status === p ? "selected" : ""}>${p}</option>`).join("")}</select></td></tr>`).join("");
  const interviewRows = interviews.map((i) => `<tr><td><strong>${i.candidateName}</strong></td><td>${i.when}</td><td>${i.interviewer}</td></tr>`).join("");
  const contractRows = contracts.map((c) => `<tr><td><strong>${c.candidateName || c.employeeName || "-"}</strong></td><td>${c.position}</td><td>$${parseNum(c.salary).toLocaleString("es-CO")}</td><td>${c.contractType || "-"}${c.endDate ? `<br><span class="muted">Fin: ${c.endDate}</span>` : ""}</td><td>${c.source || "Candidato"}</td><td>${fmtDate(c.createdAt)}</td><td><button class="btn btn-sm btn-action" data-action="view-contract" data-id="${c.id}">${IC.eye} Ver</button></td></tr>`).join("");

  const arlRiskOpts = selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels);
  const workScheduleOpts = selectOptionsFromCatalog(CO_CATALOGS.workSchedule);
  const fPosition = `<form id="form-position" class="p-form p-form-colored">
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
        <label class="full">${fieldLabel(IC.file, "Base legal (referencia)")}<input name="legalBasis" value="CST art. 45-46, Ley 50/1990 y normatividad laboral vigente" /></label>
      </div>
    </fieldset>
    <p class="muted full legal-form-note">Referencia Colombia: SMMLV ${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")}, jornada ordinaria ${CO_HR_RULES.legalWeeklyHours} h/semana, recargo nocturno 35%, dominical/festivo 75%, hora extra diurna 25%, hora extra nocturna 75%.</p>
    <button class="btn btn-primary full" type="submit">${IC.plus} Crear cargo</button>
  </form>`;
  const fVac = `<form id="form-vacancy" class="p-form p-form-colored">
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
  const fCand = `<form id="form-candidate" class="p-form p-form-colored">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.user} Datos personales del candidato</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required /></label>
        <label>${fieldLabel(IC.mail, "Correo electrónico")}<input type="email" name="email" required /></label>
        <label>${fieldLabel(IC.phone, "Teléfono celular")}<input name="phone" required placeholder="3001234567" /></label>
        <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType" required>${docTypeCand}</select></label>
        <label>${fieldLabel(IC.badge, "N° documento")}<input name="idDoc" required /></label>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="candidate-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="candidate-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.briefcase} Perfil profesional</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.graduation, "Nivel educativo")}<select name="educationLevel">${educationOptsCand}</select></label>
        <label>${fieldLabel(IC.star, "Años de experiencia")}<input type="number" min="0" name="experienceYears" value="0" required /></label>
        <label>${fieldLabel(IC.dollar, "Aspiración salarial (COP)")}<input type="number" min="${CO_HR_RULES.minMonthlySalary}" name="expectedSalary" required placeholder="Mín. SMMLV" /></label>
        <label>${fieldLabel(IC.calendar, "Disponibilidad ingreso")}<input type="date" name="availabilityDate" required /></label>
        <label>${fieldLabel(IC.send, "Vacante")}<select name="vacancyId" required><option value="">Seleccione</option>${vacancies.filter((v) => v.status === "Publicada").map((v) => `<option value="${v.id}">${v.title}</option>`).join("")}</select></label>
        <label class="full">${fieldLabel(IC.upload, "Adjunto hoja de vida")}<input type="file" name="attachments" multiple /></label>
      </div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.userPlus} Registrar candidato</button>
  </form>`;
  const fInt = `<form id="form-interview" class="p-form p-form-colored">
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
  const fCon = `<form id="form-contract" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.file} Descargar contrato Word</legend>
      <p class="muted full">Registre antes el empleado en <strong>Nómina</strong> con nombre, documento, ciudad, banco, cuenta, salario, duración y tipo de contrato. Aquí solo elige la persona, la plantilla (o automática) y la <strong>fecha de firma</strong> del párrafo de constancia.</p>
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
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.download} Vista previa de plantilla</legend>
      <p class="muted full">No utiliza la ficha del empleado; solo comprueba el archivo Word y la descarga.</p>
      <div class="form-section-grid" style="gap:0.6rem">
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="oficina">${IC.file} Prueba · Oficina</button>
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="fijo">${IC.file} Prueba · Termino fijo</button>
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="prestacion">${IC.file} Prueba · Prestacion servicios</button>
      </div>
    </fieldset>
    <p class="muted full legal-form-note">Plantillas en <strong>documentacion/*.docx</strong>: se sustituyen los textos <strong>nombre_empleado</strong>, <strong>cedula_empleado</strong>, <strong>ciudad_empleado</strong>, <strong>banco_cuenta_bancaria</strong>, <strong>cuenta_bancaria</strong>, <strong>salario</strong>, <strong>salario_letras</strong> (o se genera en letras + pesos colombianos), <strong>duracion_contrato</strong>, <strong>cargo_empleado</strong> con los datos del empleado en Nomina. El parrafo &quot;Para constancia se firma… en la ciudad de… a los… dias del mes de… de…&quot; se completa con la ciudad del empleado y la fecha de firma. En la ultima hoja, la linea <strong>Cc.</strong> recibe la <strong>cedula_empleado</strong>.</p>
    <button class="btn btn-primary full" type="submit">${IC.file} Generar y descargar contrato Word</button>
  </form>`;

  const tPos = positionRows ? `<div class="table-wrap"><table><thead><tr><th>Cargo</th><th>Rol</th><th>Salario</th><th>Contrato</th><th>Base legal</th><th>Estado</th><th></th></tr></thead><tbody>${positionRows}</tbody></table></div>` : emptyState("Sin cargos definidos");
  const tVac = vacRows ? `<div class="table-wrap"><table><thead><tr><th>Vacante</th><th>Cargo base</th><th>Ubicacion</th><th>Cupos</th><th>Salario</th><th>Limite</th><th>Estado</th><th></th></tr></thead><tbody>${vacRows}</tbody></table></div>` : emptyState("Sin vacantes");
  const tCand = candRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Contacto</th><th>Vacante</th><th>Perfil</th><th>Origen</th><th>Estado</th><th>Cambiar</th></tr></thead><tbody>${candRows}</tbody></table></div>` : emptyState("Sin candidatos");
  const tInt = interviewRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Fecha</th><th>Entrevistador</th></tr></thead><tbody>${interviewRows}</tbody></table></div>` : emptyState("Sin entrevistas");
  const tCon = contractRows ? `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Cargo</th><th>Salario</th><th>Tipo contrato</th><th>Origen</th><th>Fecha</th><th></th></tr></thead><tbody>${contractRows}</tbody></table></div>` : emptyState("Sin contratos");
  const alertsBody = `
    <div class="hr-alert-list">
      <div class="hr-alert-item"><strong>Vacantes por cerrar (<= 7 dias):</strong> ${soonClosingVacancies.length || 0}</div>
      <div class="hr-alert-item"><strong>Contratos por vencer (<= 30 dias):</strong> ${contractsEndingSoon.length || 0}</div>
      <div class="hr-alert-item"><strong>Candidatos activos en pipeline:</strong> ${activeCandidates.length || 0}</div>
      <div class="hr-alert-item"><strong>Contratos generados este mes:</strong> ${contractsThisMonth.length || 0}</div>
    </div>`;
  const candidateConversion = candidates.length ? Math.round((contracts.length / Math.max(candidates.length, 1)) * 100) : 0;
  const urgentItems = soonClosingVacancies.length + contractsEndingSoon.length;
  const hiringFleetHero = moduleFleetHeroStrip([
    { label: "Vacantes abiertas", value: openVacancies.length },
    { label: "Candidatos activos", value: activeCandidates.length },
    { label: "Contratos del mes", value: contractsThisMonth.length },
    {
      label: "Alertas / conversion",
      value: `${urgentItems} · ${candidateConversion}%`,
      tone: urgentItems ? "warn" : undefined
    }
  ]);

  const hiringHead = `<div class="ops-module-head ops-module-head-hiring">
      <div class="ops-module-title">
        <span class="ops-module-kicker">Recursos humanos</span>
        <h2>Contratación y selección</h2>
      </div>
      <div class="ops-module-chips">
        <span class="ops-chip"><strong>${openVacancies.length}</strong> vacantes</span>
        <span class="ops-chip"><strong>${activeCandidates.length}</strong> candidatos</span>
        <span class="ops-chip"><strong>${contractsThisMonth.length}</strong> contratos mes</span>
      </div>
    </div>`;
  const hiringActions = `<div class="ops-command-bar">
      <div class="ops-command-group">
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-position">${IC.briefcase} Nuevo cargo</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-vacancy">${IC.plus} Nueva vacante</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-candidate">${IC.userPlus} Nuevo candidato</button>
        <button class="btn btn-sm btn-action" type="button" data-action="toggle-create-panel" data-panel="create-contract">${IC.file} Generar contrato</button>
      </div>
      <div class="ops-command-group">
        <button class="btn btn-sm btn-outline ${candidateFilter === "active" ? "is-active" : ""}" type="button" data-action="hiring-candidates-active">${IC.activity} Candidatos activos</button>
        <button class="btn btn-sm btn-outline ${candidateFilter === "all" ? "is-active" : ""}" type="button" data-action="hiring-candidates-all">${IC.layers} Todos candidatos</button>
        <button class="btn btn-sm btn-outline ${vacancyFilter === "open" ? "is-active" : ""}" type="button" data-action="hiring-vacancies-open">${IC.briefcase} Vacantes abiertas</button>
        <button class="btn btn-sm btn-outline ${candidateSort === "pipeline" ? "is-active" : ""}" type="button" data-action="hiring-sort-candidates" data-sort="pipeline">${IC.filter} Orden pipeline</button>
      </div>
    </div>`;
  const hiringExecutionBlock = `<section class="ops-block">
      <header class="ops-block-head">
        <h3>Operación de contratación</h3>
      </header>
      <div class="hr-flow-block">
        <h3>Cargos, vacantes y candidatos</h3>
        <div class="hiring-actions-grid hiring-actions-row--three">${createCollapsibleCard("create-position", "briefcase", "Cargos", null, fPosition, "Crear cargo")}${createCollapsibleCard("create-vacancy", "plus", "Vacantes", null, fVac, "Publicar vacante")}${createCollapsibleCard("create-candidate", "userPlus", "Candidatos", null, fCand, "Registrar candidato")}</div>
      </div>
      <div class="hr-flow-block">
        <h3>Entrevistas y contratos</h3>
        <div class="hiring-actions-grid hiring-actions-row--two">${createCollapsibleCard("create-interview", "calendar", "Entrevistas", null, fInt, "Programar")}${createCollapsibleCard("create-contract", "file", "Contrato Word", null, fCon, "Generar contrato")}</div>
      </div>
    </section>`;
  const hiringDataBlock = `<section class="ops-block">
      <header class="ops-block-head">
        <h3>Seguimiento y resultados</h3>
      </header>
      <div class="hiring-data-grid hiring-results-grid">
        ${pcardWrap("activity", "Alertas", null, alertsBody)}
        ${pcardWrap("activity", "Pipeline de candidatos", sortedCandidates.length + " visibles", tCand)}
        ${pcardWrap("briefcase", "Vacantes", filteredVacancies.length + " visibles", tVac)}
        ${pcardWrap("calendar", "Entrevistas", interviews.length + " programadas", tInt)}
        ${pcardWrap("file", "Contratos generados", contracts.length + " contratos", tCon)}
        ${pcardWrap("briefcase", "Catálogo de cargos", `${positions.length} cargos (${activePositions.length} activos)`, tPos)}
      </div>
    </section>`;
  return `<section class="hiring-shell">${hiringHead}${hiringFleetHero}
    ${hiringActions}
    ${hiringExecutionBlock}
    ${hiringDataBlock}
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
  const recordRows = records
    .map((record) => {
      const employee = employees.find((item) => String(item.id) === String(record.employeeId || ""));
      return `<tr>
        <td><strong>${record.recordType || "-"}</strong><br><span class="muted">${record.documentCode || "Sin codigo"}</span></td>
        <td>${employee?.name || record.employeeName || "-"}</td>
        <td>${record.provider || "-"}</td>
        <td>${record.dueDate || "-"}</td>
        <td>${record.status || "Pendiente"}</td>
        <td>${record.notes || "-"}</td>
      </tr>`;
    })
    .join("");
  const alertsBody = `<div class="hr-alert-list">
      <div class="hr-alert-item"><strong>Contratos por vencer (30 dias):</strong> ${expiringContracts.length}</div>
      <div class="hr-alert-item"><strong>Empleados con seguridad social incompleta:</strong> ${missingSocialSecurity.length}</div>
      <div class="hr-alert-item"><strong>Licencias por vencer (30 dias):</strong> ${expiringLicenses.length}</div>
      <div class="hr-alert-item"><strong>Registros documentales en auditoria:</strong> ${records.length}</div>
    </div>`;
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
      <p class="muted full legal-form-note">Cumplimiento Colombia: valida afiliacion activa a EPS, pension y ARL, soportes SST y trazabilidad de controles por empleado.</p>
      <button class="btn btn-primary full" type="submit">${IC.plus} Registrar control legal/SST</button>
    </form>`;
  const recordsTable = recordRows
    ? `<div class="table-wrap"><table><thead><tr><th>Control</th><th>Empleado</th><th>Entidad</th><th>Vencimiento</th><th>Estado</th><th>Notas</th></tr></thead><tbody>${recordRows}</tbody></table></div>`
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
      return `<article class="notif-card ${n.readAt ? "" : "notif-card-unread"}">
        <div class="notif-leading">${dot}<span class="notif-icon">${IC.bell}</span></div>
        <div class="notif-content">
          <div class="notif-head">${tag}<span class="muted notif-time">${fmtDate(n.createdAt)}</span></div>
          <h4>${n.title || "Notificación"}</h4>
          <p>${n.body || ""}</p>
        </div>
        <div class="notif-actions">
          ${n.readAt ? '<span class="status status-completada">Leída</span>' : `<button type="button" class="btn btn-sm btn-action" data-action="notif-read" data-id="${n.id}">${IC.check} Marcar leída</button>`}
        </div>
      </article>`;
    })
    .join("");
  const readCount = list.length - unread;
  const readPct = list.length ? Math.round((readCount / list.length) * 100) : 100;
  const body = list.length
    ? `<div class="notif-toolbar">
        <button type="button" class="btn btn-sm btn-action" data-action="notif-read-all">${IC.check} Marcar todas como leídas</button>
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

function profileHtml(user) {
  const companyName = getCompanyById(user.companyId)?.name || user.company || "-";
  const joinedDate = user.createdAt ? fmtDate(user.createdAt) : "No disponible";
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
  const body = `<section class="profile-shell profile-shell-centered">
    <article class="profile-hero-card profile-hero-card-centered">
      <label for="profile-avatar-input" class="profile-avatar profile-avatar-lg profile-avatar-upload ${user.avatarUrl ? "has-image" : ""}" style="${user.avatarUrl ? `background-image:url('${user.avatarUrl}');` : ""}" title="Cambiar foto de perfil">
        <span class="profile-avatar-initial">${user.avatarUrl ? "" : (user.name || "U").charAt(0).toUpperCase()}</span>
        <span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>Cambiar foto</span></span></span>
      </label>
      <div class="profile-hero-info profile-hero-info-centered">
        <h3>${user.name || "Usuario"}</h3>
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
          <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" value="${user.name || ""}" required /></label>
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
          <label>${fieldLabel(IC.heart, "Parentesco")}<input name="emergencyRelation" value="${user.emergencyRelation || ""}" placeholder="Cónyuge, padre..." /></label>
        </div>
      </fieldset>

      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.briefcase} Empresa asociada</legend>
        <label class="full">
          <input value="${companyName}" disabled />
          <input type="hidden" name="companyId" value="${user.companyId || ""}" />
        </label>
      </fieldset>

      <p class="muted full">La foto se cambia pulsando el icono circular de arriba (JPG, PNG o WebP). Luego usa <strong>Guardar perfil</strong> para aplicar los cambios.</p>

      <p class="muted full legal-form-note">Mantén datos de contacto y NIT/RUT actualizados para soporte contractual y trazabilidad administrativa.</p>
      <button class="btn btn-primary full" type="submit">${IC.save} Guardar perfil</button>
    </form>
  </section>`;
  return profileHero + pcardWrap("user", "Mi perfil", null, body, "p-card-profile");
}

function authorizationsHtml() {
  const approvals = read(KEYS.approvals, []);
  const pending = approvals.filter((a) => a.status === "pendiente");
  const authHero = moduleFleetHeroStrip([
    { label: "Total registros", value: approvals.length },
    { label: "Pendientes", value: pending.length, tone: pending.length ? "warn" : undefined },
    { label: "Aprobadas", value: approvals.filter((a) => a.status === "aprobado").length },
    { label: "Rechazadas", value: approvals.filter((a) => a.status === "rechazado").length }
  ]);
  const rows = pending.map((a) => `<tr>
    <td><strong>${a.title}</strong></td>
    <td>${a.type}</td>
    <td>${a.requestedByName}</td>
    <td>${fmtDate(a.requestedAt)}</td>
    <td><div class="toolbar">
      <button class="btn btn-sm btn-approve" data-action="approval-approve" data-id="${a.id}">${IC.check} Aprobar</button>
      <button class="btn btn-sm btn-reject" data-action="approval-reject" data-id="${a.id}">${IC.x} Rechazar</button>
    </div></td>
  </tr>`).join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Titulo</th><th>Tipo</th><th>Solicitante</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay autorizaciones pendientes.");
  return authHero + pcardWrap("shield", "Autorizaciones", `${pending.length} pendientes`, body);
}

function contactLeadsHtml() {
  const user = currentUser();
  if (user?.role !== ROLES.ADMIN) {
    return emptyState("Solo el administrador puede ver las solicitudes de contacto del sitio web.");
  }
  const list = (Array.isArray(state.portalContacts) ? state.portalContacts : []).slice().sort((a, b) => {
    const ta = new Date(b.createdAt || 0).getTime();
    const tb = new Date(a.createdAt || 0).getTime();
    return ta - tb;
  });
  const hero = moduleFleetHeroStrip([
    { label: "Registros", value: list.length },
    { label: "Origen", value: "PostgreSQL" },
    { label: "Actualizado", value: "al iniciar sesion o al pulsar Actualizar" }
  ]);
  const toolbar = `<div class="notif-toolbar" style="margin-bottom:0.6rem">
    <button type="button" class="btn btn-sm btn-primary" data-action="contact-leads-refresh">
      ${IC.activity} Actualizar desde servidor
    </button>
    <span class="muted" style="font-size:0.85rem">Los datos no se guardan en el disco del navegador; vienen de la API.</span>
  </div>`;
  if (!list.length) {
    return hero + pcardWrap("mail", "Solicitudes de contacto (web B2B)", "0 prospectos", toolbar + emptyState("Aún no hay solicitudes o la API no devolvió datos."));
  }
  const rows = list
    .map((c) => {
      const msg = String(c.message || "").trim();
      const msgShort = msg.length > 220 ? `${escapeHtml(msg.slice(0, 220))}…` : escapeHtml(msg);
      return `<tr>
        <td>${fmtDate(c.createdAt)}</td>
        <td><strong>${escapeHtml(String(c.contactName || "").trim() || "—")}</strong><br/><span class="muted">${escapeHtml(String(c.companyName || "").trim() || "—")}</span></td>
        <td>${escapeHtml(String(c.email || "").trim() || "—")}<br/><span class="muted">${escapeHtml(String(c.phone || "").trim() || "—")}</span></td>
        <td>${escapeHtml(String(c.serviceType || "").trim() || "—")}</td>
        <td>${escapeHtml(String(c.operationType || "").trim() || "—")}</td>
        <td style="max-width:280px;font-size:0.86rem;line-height:1.35">${msgShort}</td>
      </tr>`;
    })
    .join("");
  const table = `<div class="table-wrap"><table class="table-compact-contact-leads"><thead><tr>
    <th>Fecha</th><th>Contacto / empresa</th><th>Correo / tel.</th><th>Servicio</th><th>Operacion</th><th>Mensaje</th>
  </tr></thead><tbody>${rows}</tbody></table></div>`;
  return hero + pcardWrap("mail", "Solicitudes de contacto (web B2B)", `${list.length} en base de datos`, toolbar + table);
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
  const appendLegalNote = (formId, text) => {
    const form = document.getElementById(formId);
    if (!form || form.querySelector(`[data-legal-note="${formId}"]`)) return;
    const note = document.createElement("p");
    note.className = "muted full legal-form-note";
    note.dataset.legalNote = formId;
    note.textContent = text;
    form.appendChild(note);
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
  appendLegalNote("form-vehicle", "Documentación vigente exigida en Colombia: SOAT y tecnomecánica activa para operación.");
  ensureSelectOptions("#form-driver select[name='licenseCategory']", CO_CATALOGS.licenseCategories, "Seleccione categoria...");

  setAttr("#form-admin-company-create input[name='taxId']", { pattern: "[0-9\\-]{6,20}", minlength: "6", maxlength: "20", placeholder: "900123456-7" });
  setAttr("#form-admin-company-create input[name='phone']", { pattern: "[0-9]{7,15}", minlength: "7", maxlength: "15", placeholder: "6011234567" });
  appendLegalNote("form-admin-company-create", "Registre razón social y NIT/RUT válido para trazabilidad tributaria y contractual.");

  setAttr("#form-admin-user-create input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-admin-user-edit input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  appendLegalNote("form-admin-user-create", "Valide identificación y datos de contacto conforme a políticas de gestión de datos personales.");

  setAttr("#form-employee input[name='idDoc']", { pattern: "[0-9]{6,12}", minlength: "6", maxlength: "12" });
  setAttr("#form-employee input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-employee input[name='emergencyPhone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-employee input[name='bankAccount']", { minlength: "8", maxlength: "24", placeholder: "Cuenta bancaria del trabajador" });
  ensureSelectOptions("#form-employee select[name='bloodType']", CO_CATALOGS.bloodTypes, "Seleccione tipo de sangre...");
  ensureSelectOptions("#form-employee select[name='licenseCategory']", CO_CATALOGS.licenseCategories, "Seleccione categoria...");
  ensureSelectOptions("#form-employee select[name='eps']", CO_CATALOGS.eps, "Seleccione EPS...");
  ensureSelectOptions("#form-employee select[name='pensionFund']", CO_CATALOGS.pensionFunds, "Seleccione fondo...");
  ensureSelectOptions("#form-employee select[name='arl']", CO_CATALOGS.arl, "Seleccione ARL...");
  appendLegalNote("form-employee", "Incluya datos completos de seguridad social y soporte de vinculación según CST y SG-SST.");

  setAttr("#form-position input[name='baseSalary']", { min: String(CO_HR_RULES.minMonthlySalary) });
  appendLegalNote("form-position", "El salario base del cargo no puede ser inferior al mínimo legal vigente.");

  setAttr("#form-vacancy input[name='openings']", { min: "1" });
  setAttr("#form-vacancy input[name='deadline']", { min: nowIso().slice(0, 10) });
  appendLegalNote("form-vacancy", "Defina requisitos y plazo de cierre para soportar auditoría del proceso de selección.");

  setAttr("#form-candidate input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-candidate input[name='idDoc']", { pattern: "[0-9]{6,12}", minlength: "6", maxlength: "12" });
  appendLegalNote("form-candidate", "Para contratación formal en Colombia debe existir identificación válida y soportes verificables.");

  setAttr("#form-interview input[name='when']", { min: colombiaDatetimeLocalString() });
  appendLegalNote("form-interview", "Registre entrevistador y fecha para trazabilidad del proceso de contratación.");

  appendLegalNote(
    "form-contract",
    "El Word se genera con datos del empleado en nómina y plantillas en documentacion/. Si falla la descarga, compruebe conexion (JSZip) y que el empleado tenga ciudad, banco y cuenta completos."
  );

  setAttr("#form-hr-absence input[name='supportNumber']", { minlength: "4", maxlength: "40", placeholder: "Radicado incapacidad/vacaciones" });
  ensureSelectOptions("#form-hr-absence select[name='epsEntity']", [...CO_CATALOGS.eps, "Otra"], "Seleccione EPS/entidad...");
  appendLegalNote("form-hr-absence", "Toda ausencia debe contar con soporte y periodo validado para cumplimiento laboral.");

  setAttr("#form-sst-compliance input[name='documentCode']", { minlength: "4", maxlength: "32" });
  appendLegalNote("form-sst-compliance", "Mantenga trazabilidad documental de SST y seguridad social por empleado.");

  const requestPrice = document.querySelector("#form-request input[name='tripValue']");
  if (requestPrice) {
    requestPrice.value = "0";
    requestPrice.setAttribute("readonly", "true");
    requestPrice.setAttribute("aria-readonly", "true");
    requestPrice.setAttribute("title", "La tarifa la define Antares al asignar el viaje.");
    const requestLabel = requestPrice.closest("label");
    if (requestLabel && !requestLabel.querySelector("[data-price-msg]")) {
      const msg = document.createElement("small");
      msg.className = "muted";
      msg.dataset.priceMsg = "1";
      msg.textContent = "La tarifa final del viaje es definida por Antares en la asignación operativa.";
      requestLabel.appendChild(msg);
    }
  } else {
    appendLegalNote("form-request", "La tarifa final del viaje no la define el cliente; Antares la asigna en la programación del viaje.");
  }
}

let __schedulePortalViewMicrotask = null;
let __schedulePortalViewWanted = false;

/** Evita repintar varias veces en el mismo tick (notificaciones, sync API). El resultado es el mismo que renderPortalView(). */
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
  updateAutoApprove();
  closeCompletedTripsAndGenerateInvoices();
  recalculateResourceAvailability();
  renderKpis();

  const user = currentUser();
  const view = state.currentView;
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
  enforceColombianFormStandards();
  applyFormWizards();
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

function bindDynamicEvents() {
  const actor = currentUser();
  const isAdmin = actor?.role === ROLES.ADMIN;
  const restrictedActions = new Set([
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
    "edit-employee",
    "delete-employee",
    "close-vacancy",
    "toggle-position",
    "candidate-status",
    "open-edit-user",
    "delete-user",
    "approve-registration",
    "reject-registration",
    "approval-approve",
    "approval-reject"
  ]);

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
    nodes.viewRoot.addEventListener(
      "click",
      (event) => {
        const trigger = event.target.closest("[data-action]");
        const action = String(trigger?.dataset?.action || "");
        if (!restrictedActions.has(action)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        notify(userMessage("adminOnlyModule"), "error");
      },
      true
    );
    nodes.viewRoot.addEventListener(
      "change",
      (event) => {
        const trigger = event.target.closest("[data-action]");
        const action = String(trigger?.dataset?.action || "");
        if (!restrictedActions.has(action)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        notify(userMessage("adminOnlyModule"), "error");
      },
      true
    );
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-create-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panelId = String(btn.dataset.panel || "");
      if (!panelId) return;
      state.createPanels = {
        ...(state.createPanels || {}),
        [panelId]: !Boolean(state.createPanels?.[panelId])
      };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = String(btn.dataset.panel || "");
      const currentPanel = state.adminUsersUi?.panel || "";
      state.adminUsersUi = {
        panel: currentPanel === panel ? "" : panel,
        editUserId: ""
      };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='open-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      state.adminUsersUi = { panel: "", editUserId: id };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
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
        queueApproval({
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
      users.push({
        id: uid(),
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
        phone: normalizeLatinForDb(data.phone),
        city: normalizeLatinForDb(data.city),
        department: normalizeLatinForDb(data.department),
        address: normalizeLatinForDb(data.address),
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
      write(KEYS.users, users);
      notify(userMessage("userCreated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminCompanyCreate = document.getElementById("form-admin-company-create");
  if (adminCompanyCreate) {
    adminCompanyCreate.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminCompanyCreate).entries());
      const nitValidation = validateColombianDocument("NIT", data.taxId);
      if (!nitValidation.ok) {
        notify(userMessage("companyNitInvalid", nitValidation.message), "error");
        return;
      }
      const companyPhone = String(data.phone || "").trim();
      if (!/^\d{7,15}$/.test(companyPhone)) {
        notify(userMessage("companyPhoneInvalid"), "error");
        return;
      }
      const companies = read(KEYS.companies, []);
      if (
        companies.some(
          (company) => company.name.toLowerCase() === String(data.name).toLowerCase()
        )
      ) {
        notify(userMessage("companyExists"), "error");
        return;
      }
      companies.push({
        id: uid(),
        name: String(data.name || "").trim(),
        taxId: nitValidation.normalized,
        phone: companyPhone,
        createdAt: nowIso()
      });
      write(KEYS.companies, companies);
      notify(userMessage("companyCreated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminUserPermissions = document.getElementById("form-admin-user-permissions");
  if (adminUserPermissions) {
    adminUserPermissions.addEventListener("submit", (event) => {
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
      write(
        KEYS.users,
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                permissions:
                  user.role === ROLES.ADMIN
                    ? [...ALL_PERMISSIONS]
                    : permissions.filter((permission) => ALL_PERMISSIONS.includes(permission))
              }
            : user
        )
      );
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
      state.adminUsersUi = { panel: "", editUserId: "" };
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
      write(
        KEYS.users,
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                name: normalizeLatinForDb(String(data.name || "").trim()),
                email: normalizeEmail(data.email),
                password: nextPassword,
                role: String(data.role || u.role),
                documentType: String(data.documentType || u.documentType || "CC"),
                personType: normalizePersonTypeForDb(String(data.personType || u.personType || "")),
                documentIssuedAt: String(data.documentIssuedAt || u.documentIssuedAt || ""),
                companyId: company.id,
                company: normalizeLatinForDb(String(data.company || company.name).trim()),
                taxId: String(data.taxId || "").trim(),
                phone: normalizeLatinForDb(String(data.phone || "").trim()),
                city: normalizeLatinForDb(String(data.city || "").trim()),
                department: normalizeLatinForDb(String(data.department || u.department || "").trim()),
                address: normalizeLatinForDb(String(data.address || u.address || "").trim()),
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
        )
      );
      notify(userMessage("userUpdated"), "success");
      state.adminUsersUi = { panel: "", editUserId: "" };
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
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      const companies = read(KEYS.companies, []);
      if (!companies.length) {
        notify(userMessage("noCompaniesForUser"), "error");
        return;
      }
      openEditModal({
        title: "Aprobar usuario y asociar empresa",
        subtitle: `${target.name} · ${target.email}`,
        submitText: "Aprobar cuenta",
        fields: [
          {
            name: "companyId",
            label: "Empresa a asociar",
            type: "select",
            required: true,
            value: target.companyId || "",
            options: companies.map((c) => ({ value: c.id, label: `${c.name} (${c.taxId || "Sin NIT"})` }))
          },
          {
            name: "role",
            label: "Rol en el sistema",
            type: "select",
            required: true,
            value: target.role || ROLES.CLIENT,
            options: [
              { value: ROLES.CLIENT, label: "Cliente" },
              { value: ROLES.RRHH, label: "Recursos Humanos" },
              { value: ROLES.ADMINISTRACION, label: "Administración" },
              { value: ROLES.AUXILIAR_ADMINISTRATIVO, label: "Auxiliar administrativo" },
              { value: ROLES.LIDER_ADMINISTRATIVO, label: "Líder administrativo" },
              { value: ROLES.ADMIN, label: "Administrador" }
            ]
          }
        ],
        onSubmit: async (form) => {
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
          const api = window.AntaresApi;
          if (api?.isConfigured?.()) {
            try {
              await api.postJson("/portal/approve-pending-user", {
                userId: String(target.id),
                companyId: String(selected.id),
                role: chosenRole
              });
              if (window.PortalDataLayer?.refreshCacheFromApi) {
                await window.PortalDataLayer.refreshCacheFromApi();
              } else {
                await applyPortalBootstrapFromApi();
              }
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
                      permissions: defaultPermissionsForRole(chosenRole)
                    }
                  : u
              )
            );
          }
          saveNotification({
            userId: target.id,
            title: "Cuenta aprobada",
            body: `Tu cuenta ha sido aprobada con rol asignado y asociada a ${selected.name}. Ya puedes iniciar sesion.`
          });
          sendEmail({
            to: target.email,
            subject: "Cuenta aprobada - Antares Portal",
            body: `Hola ${target.name}, tu cuenta fue aprobada y asociada a ${selected.name}. Ya puedes iniciar sesion en el portal.`
          });
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
        onSubmit: (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          const users = read(KEYS.users, []);
          const target = users.find((u) => u.id === userId);
          if (!target) return false;
          write(
            KEYS.users,
            users.map((u) => u.id === userId ? { ...u, accountStatus: ACCOUNT_STATUS.RECHAZADO, rejectionReason: reason } : u)
          );
          saveNotification({
            userId: target.id,
            title: "Registro rechazado",
            body: `Tu solicitud de registro fue rechazada. Motivo: ${reason}`
          });
          sendEmail({
            to: target.email,
            subject: "Registro rechazado - Antares Portal",
            body: `Hola ${target.name}, tu solicitud de registro fue rechazada. Motivo: ${reason}. Contacta a soporte para mas informacion.`
          });
          notify(userMessage("accountRejected", target.name), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
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
        onConfirm: () => {
          write(
            KEYS.users,
            read(KEYS.users, []).filter((user) => user.id !== userId)
          );
          notify(userMessage("userDeleted"), "success");
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
      const { pickupDate, pickupTime, deliveryDate, deliveryTime, ...payload } = data;
      payload.tripValue = 0;
      const files = requestForm.querySelector("input[name='attachments']").files;
      const attachments = [...files].map((f) => f.name);
      const all = reqRead();
      const usedRequestNumbers = new Set(all.map((r) => String(r.requestNumber || "").trim()).filter(Boolean));
      const requestNumber = makeRequestNumber(usedRequestNumbers);
      const localRow = {
        id: uid(),
        requestNumber,
        clientUserId: user.id,
        clientName: user.company,
        clientCompanyId: user.companyId,
        requestedByName: user.name,
        ...payload,
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
      reqWrite(all);

      const adminUsers = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
      adminUsers.forEach((admin) => {
        saveNotification({
          userId: admin.id,
          title: "Nueva solicitud pendiente",
          body: `Solicitud ${requestNumber} de ${user.company}`
        });
        sendEmail({
          to: admin.email,
          subject: "Nueva solicitud de viaje",
          body: `Revisar solicitud ${requestNumber}`
        });
      });

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
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-focus-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollFilters = { ...(state.payrollFilters || {}), status: "all" };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-sort-runs']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollUi = state.payrollUi || { runSort: "recent" };
      state.payrollUi.runSort = String(btn.dataset.sort || "recent");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='notif-read']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      const list = read(KEYS.notifications, []);
      write(
        KEYS.notifications,
        list.map((n) => (n.id === id ? { ...n, readAt: nowIso() } : n))
      );
      renderPortalView();
      updateNotificationBadge();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='notif-read-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const list = read(KEYS.notifications, []);
      const ts = nowIso();
      write(
        KEYS.notifications,
        list.map((n) => (n.readAt ? n : { ...n, readAt: ts }))
      );
      renderPortalView();
      updateNotificationBadge();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='contact-leads-refresh']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void applyPortalBootstrapFromApi().then((ok) => {
        if (ok) {
          notify("Lista actualizada desde el servidor.", "success");
          scheduleRenderPortalView();
        } else {
          notify("No se pudo actualizar. Revise conexion y sesion con la API.", "error");
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
        onSubmit: (form) => {
          const updated = requests.map((r) => (r.id === req.id ? { ...r, notes: String(form.notes || "").trim() } : r));
          reqWrite(updated);
  recalculateResourceAvailability();
          notify(userMessage("observationsUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cancel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = reqRead();
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req || req.status !== STATUS.PENDIENTE) return;
      const updated = requests.map((r) => (r.id === req.id ? { ...r, status: STATUS.CANCELADA } : r));
      reqWrite(updated);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approve']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actor = currentUser();
      const requestId = String(btn.dataset.id || "");
      const request = reqRead().find((item) => item.id === requestId);
      if (!request) return;
      const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
      const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
      const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
      const driverCandidates = getDriverCandidatesForRequest(request, requestId);
      const configuredTripValue = getConfiguredTripValue(request);
      openEditModal({
        title: "Aprobar solicitud",
        subtitle: `${request.requestNumber || request.id} · ${request.vehicleType} · ${parseNum(request.weightKg).toLocaleString("es-CO")} kg`,
        submitText: "Confirmar aprobacion",
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
            label: "Selecciona camion compatible",
            type: "select",
            required: false,
            options: [
              { value: "", label: vehicleCandidates.length ? "Sin asignar por ahora" : "No hay camiones compatibles para el tipo/peso" },
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
          {
            name: "tripValue",
            label: configuredTripValue > 0 ? "Precio del viaje (COP) · autocompletado por trayecto" : "Precio del viaje (COP)",
            type: "number",
            required: false,
            value: configuredTripValue > 0 ? configuredTripValue : parseNum(request.tripValue || 0)
          }
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
      const encoded = String(btn.dataset.rateKey || "");
      const key = decodeURIComponent(encoded);
      if (!key) return;
      openConfirmModal({
        title: "Quitar tarifa de trayecto",
        message: "Esta ruta dejara de sugerir precio al asignar viajes.",
        confirmText: "Quitar tarifa",
        onConfirm: () => {
          const rates = read(KEYS.tripRouteRates, {});
          delete rates[key];
          write(KEYS.tripRouteRates, rates);
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
      const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
      const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
      const configuredTripValue = getConfiguredTripValue(request);
      openEditModal({
        title: "Asignar viaje",
        subtitle: `${request.requestNumber || request.id} · ${request.vehicleType}`,
        submitText: "Crear viaje",
        fields: [
          {
            name: "vehicleId",
            label: "Camion",
            type: "select",
            required: true,
            options: compatibleVehicles.length
              ? compatibleVehicles.map((vehicle) => ({
                value: vehicle.id,
                label: `${vehicle.plate} · ${vehicle.type} · ${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg · ${vehicle.refrigerated ? "Refrigerado" : "Seco"} · SOAT ${docExpiryStatus(vehicle.soatExpeditionDate).label} · Tec ${docExpiryStatus(vehicle.techInspectionExpeditionDate).label}`
              }))
              : [{ value: "", label: "No hay camiones compatibles disponibles" }]
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
          {
            name: "tripValue",
            label: configuredTripValue > 0 ? "Precio del viaje (COP) · autocompletado por trayecto" : "Precio del viaje (COP)",
            type: "number",
            required: true,
            value: configuredTripValue > 0 ? configuredTripValue : parseNum(request.tripValue || 0)
          }
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
    routeRateFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(routeRateFormEl).entries());
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
      const key = buildTripRouteRateKey(od, oc, dd, dc);
      const next = { ...read(KEYS.tripRouteRates, {}), [key]: tripRateCop };
      write(KEYS.tripRouteRates, next);
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
        onSubmit: (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          rejectRequest(btn.dataset.id, reason, currentUser().name);
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
        onSubmit: (form) => {
          const newPickup = `${form.pickupDate}T${form.pickupTime}`;
          const newDelivery = `${form.deliveryDate}T${form.deliveryTime}`;
          if (new Date(newDelivery).getTime() <= new Date(newPickup).getTime()) {
            notify(userMessage("requestScheduleInvalid"), "error");
            return false;
          }
          reqWrite(requests.map((r) => (r.id === req.id ? { ...r, pickupAt: newPickup, etaDelivery: newDelivery } : r)));
          notify(userMessage("requestUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirmModal({
        title: "Eliminar solicitud",
        message: "Se eliminara la solicitud seleccionada.",
        confirmText: "Eliminar",
        onConfirm: () => {
          reqWrite(reqRead().filter((r) => r.id !== btn.dataset.id));
          recalculateResourceAvailability();
          notify(userMessage("requestDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-trip']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requestId = String(btn.dataset.id || "");
      if (!requestId) return;
      openConfirmModal({
        title: "Eliminar viaje",
        message: "La solicitud quedara aprobada pendiente de asignacion manual.",
        confirmText: "Eliminar viaje",
        onConfirm: () => {
          reqWrite(
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
      const vehicleId = String(btn.dataset.id || "");
      if (!vehicleId) return;
      openConfirmModal({
        title: "Eliminar camion",
        message: "Se eliminara del catalogo y se limpiara su referencia en viajes historicos.",
        confirmText: "Eliminar camion",
        onConfirm: () => {
          write(
            KEYS.vehicles,
            read(KEYS.vehicles, []).filter((vehicle) => String(vehicle.id) !== vehicleId)
          );
          reqWrite(
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
      const driverId = String(btn.dataset.id || "");
      if (!driverId) return;
      openConfirmModal({
        title: "Eliminar conductor",
        message: "Se eliminara del catalogo y se limpiara su referencia en viajes historicos.",
        confirmText: "Eliminar conductor",
        onConfirm: () => {
          write(
            KEYS.drivers,
            read(KEYS.drivers, []).filter((driver) => String(driver.id) !== driverId)
          );
          reqWrite(
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
    vehicleForm.addEventListener("submit", (event) => {
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
      const list = read(KEYS.vehicles, []);
      list.push({
        id: uid(),
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
        soatExpeditionDate: data.soatExpeditionDate,
        soatExpiryDate: data.soatExpiryDate,
        techInspectionExpeditionDate: data.techInspectionExpeditionDate,
        techInspectionExpiryDate: data.techInspectionExpiryDate,
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
      write(KEYS.vehicles, list);
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
    driverForm.addEventListener("submit", (event) => {
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
        queueApproval({
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
      list.push({ id: uid(), ...data, available: true, hiredAt: nowIso() });
      write(KEYS.drivers, list);
      const employees = read(KEYS.payrollEmployees, []);
      const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(data.idDoc || ""));
      if (!existsEmployee) {
        employees.push({
          id: uid(),
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
        write(KEYS.payrollEmployees, employees);
      }
      notify(userMessage("driverCreated"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vehicles, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      setVehicleAvailability(target.id, !target.available);
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
        onSubmit: (form) => {
          write(
            KEYS.vehicles,
            all.map((v) =>
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
                    soatExpiryDate: form.soatExpiryDate || "",
                    techInspectionExpeditionDate: form.techInspectionExpeditionDate,
                    techInspectionExpiryDate: form.techInspectionExpiryDate || "",
                    rcPolicyContract: String(form.rcPolicyContract || "").trim(),
                    rcPolicyExtra: String(form.rcPolicyExtra || "").trim(),
                    rcPolicyExpiry: form.rcPolicyExpiry || "",
                    hasGps: String(form.hasGps || "false") === "true",
                    gpsProvider: String(form.gpsProvider || "").trim(),
                    ownerName: String(form.ownerName || "").trim(),
                    ownerTaxId: String(form.ownerTaxId || "").trim()
                  }
                : v
            )
          );
          notify(userMessage("vehicleUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.drivers, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      setDriverAvailability(target.id, !target.available);
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
        onSubmit: (form) => {
          const expiryValue = String(form.licenseExpiry || "").trim();
          if (expiryValue && new Date(expiryValue).getTime() <= Date.now()) {
            notify(userMessage("driverLicenseFutureEdit"), "error");
            return false;
          }
          write(
            KEYS.drivers,
            all.map((d) =>
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
            )
          );
          notify(userMessage("driverUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  const historyFilter = document.getElementById("history-filter");
  if (historyFilter) {
    historyFilter.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(historyFilter).entries());
      let items = reqRead();
      if (data.client) items = items.filter((i) => i.clientUserId === data.client);
      if (data.status) items = items.filter((i) => i.status === data.status);
      if (data.from) items = items.filter((i) => new Date(i.createdAt) >= new Date(`${data.from}T00:00`));
      if (data.to) items = items.filter((i) => new Date(i.createdAt) <= new Date(`${data.to}T23:59`));
      document.getElementById("history-body").innerHTML =
        items
          .map(
            (r) =>
              `<tr><td>${fmtDate(r.createdAt)}</td><td>${r.requestNumber || r.id}</td><td>${r.clientName}</td><td>${r.vehicleType}</td><td>${r.status}</td><td>${r.trip?.tripNumber || "-"}</td></tr>`
          )
          .join("") || "<tr><td colspan='6'>Sin registros</td></tr>";
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
    fuelLogForm.addEventListener("submit", (event) => {
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
        id: uid(),
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
      write(KEYS.fuelLogs, list);
      notify(userMessage("fuelLogged"), "success");
      renderPortalView();
    });
  }

  const technicalLogForm = document.getElementById("form-technical-log");
  if (technicalLogForm) {
    technicalLogForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(technicalLogForm).entries());
      const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
      if (!vehicle) {
        notify(userMessage("fuelSelectVehicle"), "error");
        return;
      }
      const list = read(KEYS.vehicleTechnicalLogs, []);
      list.unshift({
        id: uid(),
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
      write(KEYS.vehicleTechnicalLogs, list);
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
    employeeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      const raw = Object.fromEntries(new FormData(employeeForm).entries());
      const docValidation = validateColombianDocument(raw.documentType, raw.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      const position = getPositionById(String(raw.positionId || ""));
      if (!position || position.active === false) {
        notify(userMessage("recruitSelectActivePosition"), "error");
        return;
      }
      const baseSalary = parseNum(raw.baseSalary);
      if (baseSalary < CO_HR_RULES.minMonthlySalary) {
        notify(
          userMessage("recruitSalaryMinRef", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")),
          "error"
        );
        return;
      }
      const fileInput = employeeForm.querySelector("input[name='avatarFile']");
      const file = fileInput?.files?.[0];
      const buildPayload = (avatarUrlValue, opts = {}) => {
        const merged = String(avatarUrlValue ?? raw.avatarUrl ?? "").trim();
        const strip = Boolean(opts.stripLargeAvatar) && merged.startsWith("data:");
        const avatarUrl = strip ? "" : merged;
        return {
          name: String(raw.name || "").trim(),
          documentType: raw.documentType,
          idDoc: docValidation.normalized,
          birthDate: String(raw.birthDate || "").trim(),
          gender: String(raw.gender || "").trim(),
          maritalStatus: String(raw.maritalStatus || "").trim(),
          educationLevel: String(raw.educationLevel || "").trim(),
          personalEmail: String(raw.personalEmail || "").trim(),
          emergencyRelation: String(raw.emergencyRelation || "").trim(),
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
        };
      };
      const saveEmployee = async (avatarUrlValue) => {
        if (actor?.role !== ROLES.ADMIN) {
          const payload = buildPayload(avatarUrlValue, { stripLargeAvatar: true });
          queueApproval({
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
        const payload = buildPayload(avatarUrlValue);
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
        all.push({ id: uid(), ...payload });
        write(KEYS.payrollEmployees, all);
        syncDriverFromEmployee(payload, {
          license: payload.license,
          licenseCategory: payload.licenseCategory,
          licenseExpiry: payload.licenseExpiry
        });
        if (window.RecruitmentDomain?.generateEmployeeContractDocx) {
          try {
            await window.RecruitmentDomain.generateEmployeeContractDocx({
              contractTemplateKind: payload.contractTemplateKind,
              contractType: payload.contractType,
              workerRole: payload.workerRole,
              nombre_empleado: payload.name,
              cedula_empleado: payload.idDoc,
              ciudad_empleado: payload.city,
              banco_cuenta_bancaria: payload.bankName,
              salario: payload.baseSalary,
              salario_letras: "",
              duracion_contrato: payload.contractDuration,
              cuenta_bancaria: payload.bankAccount,
              cargo_empleado: payload.position,
              signDate: payload.startDate
            });
            notify(userMessage("employeeCreatedWithContract"), "success");
          } catch (error) {
            notify(userMessage("employeeCreatedWordFail", error?.message || "Error desconocido"), "error");
          }
        } else {
          notify(userMessage("employeeCreatedOk"), "success");
        }
        renderPortalView();
      };
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          await saveEmployee(String(reader.result || ""));
        };
        reader.readAsDataURL(file);
      } else {
        await saveEmployee(String(raw.avatarUrl || "").trim());
      }
    });
  }

  const absenceForm = document.getElementById("form-hr-absence");
  if (absenceForm) {
    absenceForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const actor = currentUser();
      const data = Object.fromEntries(new FormData(absenceForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) return;
      const start = new Date(`${data.startDate}T12:00:00`);
      const end = new Date(`${data.endDate}T12:00:00`);
      if (end.getTime() < start.getTime()) {
        notify(userMessage("absenceDateOrder"), "error");
        return;
      }
      const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
      const list = read(KEYS.hrAbsences, []);
      const absencePayload = {
        id: uid(),
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
        queueApproval({
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
      write(KEYS.hrAbsences, list);
      notify(userMessage("absenceRecorded"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='edit-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.payrollEmployees, []);
      const target = all.find((e) => e.id === btn.dataset.id);
      if (!target) return;
      const posOpts = getActivePositions().map((p) => ({ value: p.id, label: `${p.name} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}` }));
      openEditModal({
        title: "Editar empleado",
        subtitle: target.name,
        submitText: "Actualizar empleado",
        fields: [
          {
            name: "positionId",
            label: "Cargo (catalogo)",
            type: "select",
            required: true,
            value: target.positionId || "",
            options: [{ value: "", label: "Seleccione..." }, ...posOpts]
          },
          { name: "baseSalary", label: "Salario base", type: "number", value: target.baseSalary, required: true },
          {
            name: "bloodType",
            label: "Tipo de sangre",
            type: "select",
            value: target.bloodType || "",
            options: [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.bloodTypes.map((item) => ({ value: item, label: item }))]
          },
          {
            name: "eps",
            label: "EPS",
            type: "select",
            value: target.eps || "",
            options: [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.eps.map((item) => ({ value: item, label: item }))]
          },
          {
            name: "pensionFund",
            label: "Fondo de pension",
            type: "select",
            value: target.pensionFund || "",
            options: [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.pensionFunds.map((item) => ({ value: item, label: item }))]
          },
          {
            name: "arl",
            label: "ARL",
            type: "select",
            value: target.arl || "",
            options: [{ value: "", label: "Seleccione..." }, ...CO_CATALOGS.arl.map((item) => ({ value: item, label: item }))]
          },
          { name: "avatarUrl", label: "Foto URL (opcional)", value: target.avatarUrl || "" }
        ],
        onSubmit: (form) => {
          const position = getPositionById(String(form.positionId || ""));
          if (!position) {
            notify(userMessage("recruitPickPosition"), "error");
            return false;
          }
          const baseSalary = parseNum(form.baseSalary);
          if (baseSalary < CO_HR_RULES.minMonthlySalary) {
            notify(
              userMessage("recruitSalaryBelowMin", CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")),
              "error"
            );
            return false;
          }
          write(
            KEYS.payrollEmployees,
            all.map((e) =>
              e.id === target.id
                ? {
                    ...e,
                    positionId: position.id,
                    position: position.name,
                    workerRole: position.workerRole || e.workerRole,
                    baseSalary,
                    bloodType: String(form.bloodType || "").trim(),
                    eps: String(form.eps || "").trim(),
                    pensionFund: String(form.pensionFund || "").trim(),
                    arl: String(form.arl || "").trim(),
                    avatarUrl: String(form.avatarUrl || "").trim() || e.avatarUrl
                  }
                : e
            )
          );
          const refreshed = read(KEYS.payrollEmployees, []).find((e) => e.id === target.id);
          if (refreshed && refreshed.workerRole === "conductor") {
            syncDriverFromEmployee(refreshed);
          }
          notify(userMessage("employeeUpdatedOk"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirmModal({
        title: "Eliminar empleado",
        message: "El empleado sera removido en cascada (nomina, ausencias, contratos y conductor relacionado).",
        confirmText: "Eliminar",
        onConfirm: () => {
          const removed = deleteEmployeesCascade([String(btn.dataset.id || "")]);
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
      const selectedIds = [...nodes.viewRoot.querySelectorAll("[data-employee-select]:checked")].map((check) => String(check.value || ""));
      if (!selectedIds.length) {
        notify(userMessage("employeesBulkSelect"), "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar empleados seleccionados",
        message: `Se eliminaran ${selectedIds.length} empleados en cascada (nomina, ausencias, contratos y conductores asociados).`,
        confirmText: "Eliminar en cascada",
        onConfirm: () => {
          const removed = deleteEmployeesCascade(selectedIds);
          notify(userMessage("employeesBulkRemoved", removed), "success");
          renderPortalView();
        }
      });
    });
  }

  const payrollForm = document.getElementById("form-payroll");
  if (payrollForm) {
    payrollForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(payrollForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) return;
      if (!monthRange(data.month)) {
        notify(userMessage("payrollSelectMonth"), "error");
        return;
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
      const gross = baseSalary + extras + aux + bonus + travelAllowance + fuelReimbursement;
      const ibc = baseSalary + extras + bonus;
      const health = ibc * CO_PAYROLL.healthEmployeeRate;
      const pension = ibc * CO_PAYROLL.pensionEmployeeRate;
      const solidarity = ibc > CO_PAYROLL.smmlv * CO_PAYROLL.solidarityThresholdSmmlv ? ibc * CO_PAYROLL.solidarityRate : 0;
      const deductions = health + pension + solidarity;
      const net = gross - deductions;
      const run = {
        id: uid(),
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
        createdAt: nowIso()
      };
      const runs = read(KEYS.payrollRuns, []);
      runs.unshift(run);
      write(KEYS.payrollRuns, runs);
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
      pop.document.write(`
        <html><head><meta charset="utf-8"/><title>Desprendible ${run.employeeName}</title></head>
        <body style="font-family:system-ui,Segoe UI,Arial,sans-serif;padding:28px;color:#0B1D33;line-height:1.5">
          <div style="border-bottom:2px solid #0B1D33;padding-bottom:12px;margin-bottom:20px">
            <h1 style="margin:0;font-size:1.35rem">Desprendible de nomina</h1>
            <p style="margin:0.35rem 0 0;font-size:0.9rem;color:#555">Documento informativo para el trabajador · Colombia</p>
          </div>
          <table style="width:100%;font-size:0.92rem;margin-bottom:1.2rem">
            <tr><td style="padding:4px 0"><strong>Empleador</strong></td><td>${company?.name || "Antares"}</td></tr>
            <tr><td style="padding:4px 0"><strong>Trabajador</strong></td><td>${run.employeeName}</td></tr>
            <tr><td style="padding:4px 0"><strong>Documento</strong></td><td>${employee?.idDoc || "-"}</td></tr>
            <tr><td style="padding:4px 0"><strong>Cargo</strong></td><td>${employee?.position || "-"}</td></tr>
            <tr><td style="padding:4px 0"><strong>Periodo liquidado</strong></td><td>${run.month}</td></tr>
            <tr><td style="padding:4px 0"><strong>Estado</strong></td><td>${run.paid ? "Pagado" : "Pendiente de pago"}</td></tr>
          </table>
          <h2 style="font-size:1rem;margin:1.2rem 0 0.5rem">Devengos y deducciones</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
            <thead><tr style="background:#E8EEF5"><th style="text-align:left;padding:8px">Concepto</th><th style="text-align:right;padding:8px">Valor (COP)</th></tr></thead>
            <tbody>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd">Total devengado</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">$${parseNum(run.gross).toLocaleString("es-CO")}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd">Viaticos</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">$${parseNum(run.travelAllowance || 0).toLocaleString("es-CO")}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd">Reembolso combustible</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">$${parseNum(run.fuelReimbursement || 0).toLocaleString("es-CO")}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd">IBC (base cotizacion)</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">$${parseNum(run.ibc).toLocaleString("es-CO")}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd">Aporte salud empleado (4%)</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">$${parseNum(run.health).toLocaleString("es-CO")}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd">Aporte pension empleado (4%)</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">$${parseNum(run.pension).toLocaleString("es-CO")}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd">Fondo de solidaridad pensional (si aplica)</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">$${parseNum(run.solidarity).toLocaleString("es-CO")}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Total deducciones</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right"><strong>$${parseNum(run.deductions).toLocaleString("es-CO")}</strong></td></tr>
              <tr><td style="padding:10px 8px"><strong>Neto a pagar</strong></td><td style="padding:10px 8px;text-align:right;font-size:1.05rem"><strong>${netStr}</strong></td></tr>
            </tbody>
          </table>
          <p style="font-size:0.78rem;color:#666;margin-top:1.5rem">
            Nota: Los porcentajes de salud y pension aqui mostrados corresponden a la parte a cargo del trabajador en regimen ordinario.
            Parafiscales (SENA, ICBF, caja si aplica) y aportes patronales no estan desglosados en este prototipo.
            ${parseNum(run.interDepartmentTrips || 0) > 0 ? `Incluye ${parseNum(run.interDepartmentTrips || 0)} viaje(s) interdepartamental(es) para viaticos del periodo. ` : ""}
            Conserve este documento para fines de auditoria interna. Generado: ${fmtDate(run.createdAt)}.
          </p>
          <p style="margin-top:1.5rem"><button onclick="window.print()" style="padding:10px 18px;border-radius:8px;border:none;background:#0B1D33;color:#fff;cursor:pointer">Imprimir / PDF</button></p>
        </body></html>
      `);
      pop.document.close();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='mark-payroll-paid']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actor = currentUser();
      const id = String(btn.dataset.id || "");
      const all = read(KEYS.payrollRuns, []);
      const run = all.find((r) => r.id === id);
      if (!run || run.paid) return;
      if (requiresAdminHrApproval(actor?.role || "")) {
        queueApproval({
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
        onConfirm: () => {
          write(
            KEYS.payrollRuns,
            all.map((item) => (item.id === id ? { ...item, paid: true, paidAt: nowIso() } : item))
          );
          notify(userMessage("payrollPaidMarked"), "success");
          renderPortalView();
        }
      });
    });
  });

  const exportPayroll = document.getElementById("export-payroll");
  if (exportPayroll) {
    exportPayroll.addEventListener("click", () => {
      const rows = read(KEYS.payrollRuns, []);
      const csv = ["Mes,Empleado,Devengado,Viaticos,ReembolsoCombustible,IBC,Salud,Pension,Solidaridad,Deducciones,Neto,Estado"]
        .concat(rows.map((r) => `${r.month},${r.employeeName},${r.gross},${r.travelAllowance || 0},${r.fuelReimbursement || 0},${r.ibc || 0},${r.health || 0},${r.pension || 0},${r.solidarity || 0},${r.deductions},${r.net},${r.paid ? "Pagado" : "Pendiente"}`))
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

    vacancyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(vacancyForm).entries());
      const deadlineTs = new Date(`${String(data.deadline || "")}T12:00:00`).getTime();
      if (!Number.isFinite(deadlineTs) || deadlineTs < Date.now()) {
        notify(userMessage("vacancyDeadlineFuture"), "error");
        return;
      }
      const position = getPositionById(String(data.positionId || ""));
      if (!position || position.active === false) {
        notify(userMessage("vacancySelectPosition"), "error");
        return;
      }
      const all = read(KEYS.vacancies, []);
      all.unshift({
        id: uid(),
        ...data,
        openings: Math.max(1, parseNum(data.openings || 1)),
        salaryOffer: parseNum(position.baseSalary),
        positionName: position.name,
        workerRole: position.workerRole || "empleado",
        contractTypeDefault: position.contractTypeDefault || "Termino indefinido",
        status: "Publicada",
        createdAt: nowIso()
      });
      write(KEYS.vacancies, all);
      renderPortalView();
    });
  }

  const positionForm = document.getElementById("form-position");
  if (positionForm) {
    positionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(positionForm).entries());
      const minSalary = CO_HR_RULES.minMonthlySalary;
      if (parseNum(data.baseSalary) < minSalary) {
        notify(userMessage("positionSalaryBaseMin", minSalary.toLocaleString("es-CO")), "error");
        return;
      }
      const all = read(KEYS.positions, []);
      all.unshift({
        id: uid(),
        name: String(data.name || "").trim(),
        workerRole: String(data.workerRole || "empleado"),
        baseSalary: parseNum(data.baseSalary),
        contractTypeDefault: String(data.contractTypeDefault || "Termino indefinido"),
        legalBasis: String(data.legalBasis || "CST art. 45-46 y normatividad laboral vigente"),
        active: true,
        createdAt: nowIso()
      });
      write(KEYS.positions, all);
      notify(userMessage("positionCreatedOk"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.positions, []);
      const target = all.find((p) => p.id === btn.dataset.id);
      if (!target) return;
      write(KEYS.positions, all.map((p) => (p.id === target.id ? { ...p, active: target.active === false } : p)));
      notify(target.active === false ? userMessage("positionActivated") : userMessage("positionDeactivated"), "info");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vacancies, []);
      write(
        KEYS.vacancies,
        all.map((v) => (v.id === btn.dataset.id ? { ...v, status: "Cerrada" } : v))
      );
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent" };
      state.hiringUi.candidateFilter = "active";
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent" };
      state.hiringUi.candidateFilter = "all";
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-vacancies-open']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent" };
      state.hiringUi.vacancyFilter = state.hiringUi.vacancyFilter === "open" ? "all" : "open";
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-sort-candidates']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent" };
      state.hiringUi.candidateSort = String(btn.dataset.sort || "recent");
      renderPortalView();
    });
  });

  const candidateForm = document.getElementById("form-candidate");
  if (candidateForm) {
    attachDepartmentCitySelects(candidateForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    candidateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(candidateForm).entries());
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.idDoc = docValidation.normalized;
      const vac = read(KEYS.vacancies, []).find((v) => v.id === data.vacancyId);
      if (!vac) return;
      const files = [...candidateForm.querySelector("input[name='attachments']").files].map((f) => f.name);
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
        id: uid(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        documentType: data.documentType,
        idDoc: data.idDoc,
        department: data.department || "",
        city: data.city,
        address: data.address,
        experienceYears: Math.max(0, parseNum(data.experienceYears || 0)),
        expectedSalary,
        availabilityDate: data.availabilityDate || "",
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        status: PIPELINE[0],
        attachments: files,
        source: "Portal RRHH",
        createdAt: nowIso()
      });
      write(KEYS.candidates, all);
      sendEmail({ to: data.email, subject: "Registro recibido", body: "Gracias por aplicar." });
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='candidate-status']").forEach((select) => {
    select.addEventListener("change", () => {
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
      write(KEYS.candidates, updated);
      const current = updated.find((c) => c.id === select.dataset.id);
      if (current) {
        sendEmail({
          to: current.email,
          subject: "Actualizacion de proceso",
          body: `Tu estado cambio a: ${current.status}`
        });
      }
      renderPortalView();
    });
  });

  const interviewForm = document.getElementById("form-interview");
  if (interviewForm) {
    interviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(interviewForm).entries());
      const interviewTs = new Date(String(data.when || "")).getTime();
      if (!Number.isFinite(interviewTs) || interviewTs < Date.now()) {
        notify(userMessage("interviewScheduleFuture"), "error");
        return;
      }
      const candidate = read(KEYS.candidates, []).find((c) => c.id === data.candidateId);
      if (!candidate) return;
      if (["Descartado", "Contratado"].includes(String(candidate.status || ""))) {
        notify(userMessage("interviewInvalidCandidate"), "error");
        return;
      }
      const all = read(KEYS.interviews, []);
      all.unshift({
        id: uid(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        when: data.when,
        interviewer: data.interviewer
      });
      write(KEYS.interviews, all);
      const candidateList = read(KEYS.candidates, []);
      write(
        KEYS.candidates,
        candidateList.map((item) =>
          item.id === candidate.id && ["Recibido", "Preseleccionado"].includes(String(item.status || ""))
            ? { ...item, status: "Entrevistado" }
            : item
        )
      );
      sendEmail({ to: candidate.email, subject: "Entrevista programada", body: `Fecha: ${data.when}` });
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

    contractForm.addEventListener("submit", async (event) => {
      event.preventDefault();
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
      try {
        await generateOfficialWordContract(payload);
        const all = read(KEYS.contracts, []);
        all.unshift({
          id: uid(),
          employeeId: employee.id,
          employeeName: employee.name,
          position: payload.cargo_empleado,
          salary: payload.salario,
          startDate: signDate,
          contractType: payload.contractType,
          contractTemplateKind: payload.contractTemplateKind,
          idDocSnapshot: String(employee.idDoc || "").trim(),
          workerRole: payload.workerRole,
          source: "Empleado",
          content: contractText,
          createdAt: nowIso()
        });
        write(KEYS.contracts, all);
        notify(userMessage("contractWordSaved"), "success");
      } catch (wordErr) {
        notify(userMessage("contractWordError", String(wordErr?.message || "error")), "error");
      }
      renderPortalView();
    });
  }

  const sstComplianceForm = document.getElementById("form-sst-compliance");
  if (sstComplianceForm) {
    sstComplianceForm.addEventListener("submit", (event) => {
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
        id: uid(),
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
      write(KEYS.sstCompliance, list);
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
          const url = String(reader.result || "");
          profileAvatarLabel.style.backgroundImage = url ? `url(${JSON.stringify(url)})` : "";
          profileAvatarLabel.classList.toggle("has-image", Boolean(url));
          const initial = profileAvatarLabel.querySelector(".profile-avatar-initial");
          if (initial) initial.textContent = "";
        };
        reader.readAsDataURL(f);
      });
    }
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const actor = currentUser();
      if (!actor) return;
      const data = Object.fromEntries(new FormData(profileForm).entries());
      const fileInput = profileForm.querySelector("input[name='avatarFile']");
      const file = fileInput?.files?.[0];
      const applyProfile = (avatarUrlValue = "") => {
        const users = read(KEYS.users, []);
        const company = getCompanyById(String(data.companyId || ""));
        write(
          KEYS.users,
          users.map((u) =>
            u.id === actor.id
              ? {
                  ...u,
                  name: String(data.name || u.name).trim(),
                  phone: String(data.phone || "").trim(),
                  taxId: String(data.taxId || "").trim(),
                  documentType: String(data.documentType || u.documentType || "CC"),
                  birthDate: String(data.birthDate || "").trim(),
                  emergencyContact: String(data.emergencyContact || "").trim(),
                  emergencyPhone: String(data.emergencyPhone || "").trim(),
                  emergencyRelation: String(data.emergencyRelation || "").trim(),
                  companyId: company?.id || u.companyId,
                  company: company?.name || u.company,
                  avatarUrl: avatarUrlValue || u.avatarUrl || ""
                }
              : u
          )
        );
        notify(userMessage("profileUpdatedOk"), "success");
        renderPortal();
      };
      if (file) {
        const reader = new FileReader();
        reader.onload = () => applyProfile(String(reader.result || ""));
        reader.readAsDataURL(file);
      } else {
        applyProfile("");
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
            id: uid(),
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
            phone: normalizeLatinForDb(p.phone || ""),
            city: normalizeLatinForDb(p.city || ""),
            department: normalizeLatinForDb(p.department || ""),
            address: normalizeLatinForDb(p.address || ""),
            permissions:
              p.role === ROLES.ADMIN
                ? [...ALL_PERMISSIONS]
                : (p.permissions || defaultPermissionsForRole(p.role))
          });
          write(KEYS.users, users);
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
        employees.push({ id: uid(), workerRole: payload.workerRole || "empleado", ...payload });
        write(KEYS.payrollEmployees, employees);
      } else if (approval.type === "create_driver") {
        const drivers = read(KEYS.drivers, []);
        drivers.push({ id: uid(), ...approval.payload, available: true, hiredAt: nowIso() });
        write(KEYS.drivers, drivers);
        const employees = read(KEYS.payrollEmployees, []);
        const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(approval.payload.idDoc || ""));
        if (!existsEmployee) {
          employees.push({
            id: uid(),
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
            startDate: approval.payload.startDate || nowIso().slice(0, 10)
          });
          write(KEYS.payrollEmployees, employees);
        }
      } else if (approval.type === "register_hr_absence") {
        const absences = read(KEYS.hrAbsences, []);
        absences.unshift({
          ...approval.payload,
          id: approval.payload?.id || uid(),
          approvedBy: actor.name,
          approvedAt: nowIso()
        });
        write(KEYS.hrAbsences, absences);
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
        write(
          KEYS.payrollRuns,
          runs.map((r) => (r.id === payrollRunId ? { ...r, paid: true, paidAt: nowIso(), paidApprovedBy: actor.name } : r))
        );
      } else if (approval.type === "approve_trip_request") {
        const requestId = String(approval.payload.requestId || "");
        const request = reqRead().find((item) => item.id === requestId);
        if (!request) {
          notify(userMessage("approvalLinkedRequestMissing"), "error");
          return;
        }

        const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
        const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
        const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
        const driverCandidates = getDriverCandidatesForRequest(request, requestId);
        const configuredTripValue = getConfiguredTripValue(request);

        openEditModal({
          title: "Aprobar solicitud de viaje",
          subtitle: "Puedes asignar camion y conductor ahora, o dejar pendiente para asignacion manual.",
          submitText: "Aprobar",
          fields: [
            {
              name: "vehicleId",
              label: "Camion (opcional)",
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
            {
              name: "tripValue",
              label: configuredTripValue > 0 ? "Precio del viaje (COP) · autocompletado por trayecto" : "Precio del viaje (COP)",
              type: "number",
              required: false,
              value: configuredTripValue > 0 ? configuredTripValue : parseNum(request.tripValue || 0)
            }
          ],
          onSubmit: (form) => {
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
            write(
              KEYS.approvals,
              latestApprovals.map((a) =>
                a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
              )
            );

            notify(
              vehicleId && driverId ? userMessage("authApprovalWithTrip") : userMessage("authApprovalPendingManual"),
              "success"
            );
            renderPortalView();
          }
        });
        return;
      }

      write(
        KEYS.approvals,
        approvals.map((a) =>
          a.id === id ? { ...a, status: "aprobado", reviewedAt: nowIso(), reviewedBy: actor.name } : a
        )
      );
      notify(userMessage("authApprovalOk"), "success");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approval-reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      openEditModal({
        title: "Rechazar autorizacion",
        subtitle: "Motivo obligatorio",
        submitText: "Rechazar",
        fields: [{ name: "reason", label: "Motivo", value: "", required: true }],
        onSubmit: (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          const actor = currentUser();
          const approvals = read(KEYS.approvals, []);
          write(
            KEYS.approvals,
            approvals.map((a) =>
              a.id === id
                ? { ...a, status: "rechazado", reviewedAt: nowIso(), reviewedBy: actor?.name || "Admin", rejectionReason: reason }
                : a
            )
          );
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
}

function initGlobalEvents() {
  const savedTheme = String(localStorage.getItem(UI_PREFS.theme) || "light");
  const savedLang = String(localStorage.getItem(UI_PREFS.publicLang) || "es");
  applyTheme(savedTheme);
  state.publicLang = savedLang === "en" ? "en" : "es";
  applyPublicLanguage(state.publicLang);

  nodes.openAuth.addEventListener("click", showAuth);
  if (nodes.openAuthHero) {
    nodes.openAuthHero.addEventListener("click", showAuth);
  }
  nodes.closeAuth.addEventListener("click", hideAuth);

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
      state.authTab = tabBtn.dataset.tab;
      renderAuthTab();
    })
  );

  nodes.b2bForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    nodes.b2bForm.querySelectorAll("input,select,textarea").forEach((field) => clearFieldError(field));
    const data = Object.fromEntries(new FormData(nodes.b2bForm).entries());
    const emailValue = normalizeEmail(data.email);
    const phoneDigits = String(data.phone || "").replace(/\D/g, "");
    const messageValue = String(data.message || "").trim();
    const monthlyVolume = parseNum(data.monthlyVolumeKg);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(emailValue);

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
    if (phoneDigits.length !== 10 || !phoneDigits.startsWith("3")) {
      setFieldError(nodes.b2bForm.querySelector("input[name='phone']"), "Ingresa un celular colombiano valido (10 digitos).");
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
      if (firstError === "phone") jumpToStepForField("input[name='phone']");
      if (firstError === "message") jumpToStepForField("textarea[name='message']");
      if (firstError === "volume") jumpToStepForField("input[name='monthlyVolumeKg']");
      notify(userMessage("b2bFieldsInvalid"), "error");
      return;
    }

    data.email = emailValue;
    data.phone = formatColombianPhone(data.phone);
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

  nodes.logout.addEventListener("click", () => {
    clearSession();
    state.currentView = "dashboard";
    history.replaceState(null, "", window.location.pathname + window.location.search);
    renderPortal();
  });

  initRequiredFieldIndicators();
  initB2BFormExperience();
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

function getPublicPublishedVacancies() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return read(KEYS.vacancies, []).filter((v) => {
    if (v.status !== "Publicada") return false;
    if (!v.deadline) return true;
    return new Date(`${v.deadline}T12:00:00`).getTime() >= today.getTime();
  });
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
        name: "attachments",
        label: "Hoja de vida (PDF, Word o imagen)",
        type: "file",
        accept: ".pdf,.doc,.docx,image/*",
        required: true
      }
    ],
    onSubmit: (form) => {
      const vac = read(KEYS.vacancies, []).find((x) => x.id === form.vacancyId);
      if (!vac || vac.status !== "Publicada") {
        notify(userMessage("vacancyPublicClosed"), "error");
        return false;
      }
      const docValidation = validateColombianDocument(form.documentType, form.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return false;
      }
      const fileLabel = String(form.attachments || "").trim();
      const all = read(KEYS.candidates, []);
      all.unshift({
        id: uid(),
        name: String(form.name || "").trim(),
        email: normalizeEmail(form.email),
        phone: String(form.phone || "").trim(),
        documentType: form.documentType,
        idDoc: docValidation.normalized,
        city: String(form.city || "").trim(),
        address: String(form.address || "").trim(),
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        experienceNotes: String(form.experience || "").trim(),
        status: PIPELINE[0],
        attachments: fileLabel ? [fileLabel] : [],
        source: "Sitio web",
        createdAt: nowIso()
      });
      write(KEYS.candidates, all);
      sendEmail({
        to: normalizeEmail(form.email),
        subject: "Postulacion recibida - Antares",
        body: `Hola ${form.name}, registramos tu postulacion a "${vac.title}". Nuestro equipo de seleccion revisara tu perfil.`
      });
      notifyHrUsers(
        "Nueva postulacion (web)",
        `${form.name} aplico a "${vac.title}". Revise Contratacion · Pipeline de candidatos.`
      );
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
        const vac = read(KEYS.vacancies, []).find((x) => x.id === btn.dataset.id);
        if (vac) openPublicVacancyApplyModal(vac);
      });
    });
  };
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
  adminQueueHtml,
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
  scheduleRenderPortalView();
  updateNotificationBadge();
};

initPortalClientStorage();
initGlobalEvents();
initPublicEffects();

void (async function bootApplicationFromDatabaseThenUi() {
  try {
    if (window.PortalDataLayer?.refreshCacheFromApi) {
      await window.PortalDataLayer.refreshCacheFromApi();
    } else {
      await applyPortalBootstrapFromApi();
    }
  } catch (_e) {
    /* refreshCacheFromApi / applyPortalBootstrapFromApi ya registran fallos */
  }
  await ensureUsersPasswordHashing();
  if (window.DomainRegistry?.list) {
    const missingDomains = window.DomainRegistry.list().filter((name) => !window.DomainRegistry.get(name));
    if (missingDomains.length) {
      devWarn("Dominios sin inicializar:", missingDomains.join(", "));
    }
  }
  renderPortal();
  window.PortalDataLayer?.enableVisibilityRefresh?.();
  setInterval(() => {
    if (!state.session) return;
    updateAutoApprove();
    if (hasUnsavedPortalFormData()) return;
    renderPortalView();
  }, 30000);
})();
