const paths = {
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
  tasks: 'm3 6 2 2 4-4m3 3h9M3 13h4m5 0h9M3 19h4m5 0h9',
  chart: 'M4 3v17h17M9 16v-5m5 5V6m5 10v-8',
  note: 'M5 3h14v18H5V3Zm4 5h6m-6 4h6m-6 4h4',
  export: 'M12 15V3m-4 4 4-4 4 4M4 13v7h16v-7',
  menu: 'M4 6h16M4 12h16M4 18h16',
};

export default function Icon({ name }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
