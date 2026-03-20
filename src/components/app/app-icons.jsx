function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      {children}
    </svg>
  );
}

export function HomeIcon() {
  return (
    <IconBase>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.75v9.25h11V9.75" />
    </IconBase>
  );
}

export function TransactionsIcon() {
  return (
    <IconBase>
      <path d="M5 7.5h14" />
      <path d="M5 12h10" />
      <path d="M5 16.5h14" />
      <path d="m16.5 10.25 2.5 1.75-2.5 1.75" />
    </IconBase>
  );
}

export function CategoriesIcon() {
  return (
    <IconBase>
      <rect x="4.5" y="4.5" width="6.25" height="6.25" rx="1.25" />
      <rect x="13.25" y="4.5" width="6.25" height="6.25" rx="1.25" />
      <rect x="4.5" y="13.25" width="6.25" height="6.25" rx="1.25" />
      <rect x="13.25" y="13.25" width="6.25" height="6.25" rx="1.25" />
    </IconBase>
  );
}

export function PlannedIcon() {
  return (
    <IconBase>
      <rect x="4.5" y="5.5" width="15" height="14" rx="2" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M4.5 9.5h15" />
      <path d="m9.5 13 2 2 4-4" />
    </IconBase>
  );
}

export function SettingsIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.11-1.2l2.03-1.58-2-3.46-2.4.68a7.2 7.2 0 0 0-2.08-1.2L14 2h-4l-.44 3.24a7.2 7.2 0 0 0-2.08 1.2l-2.4-.68-2 3.46 2.03 1.58A7 7 0 0 0 5 12c0 .41.04.81.11 1.2l-2.03 1.58 2 3.46 2.4-.68a7.2 7.2 0 0 0 2.08 1.2L10 22h4l.44-3.24a7.2 7.2 0 0 0 2.08-1.2l2.4.68 2-3.46-2.03-1.58c.07-.39.11-.79.11-1.2Z" />
    </IconBase>
  );
}
