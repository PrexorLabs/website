// Line icons on a 16 × 16 grid with square ends, drawn in the current text color like the Prexor menus.
export const icons = {
  home: 'M2.5 7.5 8 2.5l5.5 5v6h-11z',
  projects: 'M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h4v4h-4z',
  lab: 'M6 1.5h4M6.5 1.5v4.5L2.5 13a1 1 0 0 0 .9 1.5h9.2a1 1 0 0 0 .9-1.5L9.5 6V1.5M4.5 10h7',
  heart: 'M8 13.5 2.6 8.1a3.1 3.1 0 0 1 4.4-4.4L8 4.7l1-1a3.1 3.1 0 0 1 4.4 4.4Z',
  discord: 'M3 9.5V6.5a5 5 0 0 1 10 0v3M3 9.5h2v3H3zM11 9.5h2v3h-2z',
  github: 'M4.5 2v12M11.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM11.5 5.5c0 4-7 3-7 6',
  serverList: 'M2.5 2.5h11v3h-11zM2.5 7h11v3h-11zM2.5 12.5h6.5M12.5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  lock: 'M4.5 7.5h7v6h-7zM6 7.5V5a2 2 0 0 1 4 0v2.5',
  download: 'M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11',
  idea: 'M6 12.5h4M6.5 14.5h3M8 1.5a4.5 4.5 0 0 0-2.5 8.2V11h5V9.7A4.5 4.5 0 0 0 8 1.5Z',
  code: 'M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4',
  feedback: 'M2.5 3.5h11v7h-6l-3 3v-3h-2z',
  arrow: 'M2 8h10M8.5 4.5 12 8l-3.5 3.5',
};

export type IconName = keyof typeof icons;
