function Mark({ size = 14, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      {children}
    </svg>
  )
}

export function InstagramIcon({ size }) {
  return (
    <Mark size={size}>
      <defs>
        <radialGradient id="dg-ig" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="40%" stopColor="#fa7e1e" />
          <stop offset="70%" stopColor="#d62976" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#dg-ig)" />
      <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.6" cy="7.5" r="1" fill="#fff" />
    </Mark>
  )
}

export function FacebookIcon({ size }) {
  return (
    <Mark size={size}>
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path fill="#fff" d="M13.6 19v-5.1h1.7l.3-2h-2v-1.3c0-.6.2-1 .9-1H15.7V7.6c-.3 0-.9-.1-1.7-.1-1.7 0-2.8 1-2.8 2.9V11.9H9.4v2h1.8V19h2.4z" />
    </Mark>
  )
}

export function WhatsAppIcon({ size }) {
  return (
    <Mark size={size}>
      <rect width="24" height="24" rx="6" fill="#25D366" />
      <path fill="#fff" d="M12 6.2a5.7 5.7 0 0 0-4.9 8.6L6.4 17.6l2.9-.8A5.7 5.7 0 1 0 12 6.2zm3.3 8.1c-.1.4-.7.7-1.1.8-.3 0-.6.1-2-.5-1.7-.7-2.7-2.3-2.8-2.4-.1-.1-.8-1-.8-1.9s.5-1.3.7-1.5.3-.2.5-.2h.3c.1 0 .3 0 .4.3.1.4.5 1.3.5 1.4.1.1 0 .2 0 .3l-.2.3-.3.3c-.1.1-.2.2-.1.4.2.3.7 1.1 1.5 1.7.9.7 1.6.9 1.9 1 .2.1.4 0 .5-.1l.6-.7c.1-.2.3-.1.5-.1l1.2.6c.2.1.3.2.4.3.1.3 0 .6-.1.8z" />
    </Mark>
  )
}

export function GoogleIcon({ size }) {
  return (
    <Mark size={size}>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
      <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6z" />
      <path fill="#EA4335" d="M12 6.2c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 8 9.4 6.2 12 6.2z" />
    </Mark>
  )
}

export function GooglePinIcon({ size }) {
  return (
    <Mark size={size}>
      <path fill="#EA4335" d="M12 2.5a6.2 6.2 0 0 0-6.2 6.2c0 4.6 6.2 12.8 6.2 12.8s6.2-8.2 6.2-12.8A6.2 6.2 0 0 0 12 2.5z" />
      <circle cx="12" cy="8.6" r="2.4" fill="#fff" />
    </Mark>
  )
}

export function ReferralIcon({ size }) {
  return (
    <Mark size={size}>
      <rect width="24" height="24" rx="6" fill="#D97706" />
      <path fill="#fff" d="M8.2 11.2a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2zm7.6 0a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2zM5.4 17.4c.3-1.8 1.8-3 3.6-3 .5 0 1 .1 1.4.3-.7.6-1.1 1.5-1.1 2.5v.2H5.4zm8.2-.2c0-1 .4-1.9 1.1-2.5.4-.2.9-.3 1.4-.3 1.8 0 3.3 1.2 3.6 3h-6.1zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4zm-2.6 5.4c.2-2 1.7-3.4 3.6-3.4s3.4 1.4 3.6 3.4H9.4z" />
    </Mark>
  )
}

export function WalkInIcon({ size }) {
  return (
    <Mark size={size}>
      <rect width="24" height="24" rx="6" fill="#EA580C" />
      <path fill="#fff" d="M5 10.2 12 5.5l7 4.7V19H5V10.2zm3.2 7.2h2.4v-3.2h3.2v3.2h2.4v-5.4L12 8.6 8.2 11.9v5.5z" />
    </Mark>
  )
}

export function CustomerIcon({ size }) {
  return (
    <Mark size={size}>
      <rect width="24" height="24" rx="6" fill="#0F766E" />
      <circle cx="12" cy="9" r="2.4" fill="#fff" />
      <path fill="#fff" d="M7.2 17.4c.6-2.2 2.5-3.4 4.8-3.4s4.2 1.2 4.8 3.4H7.2z" />
    </Mark>
  )
}

export function OtherIcon({ size }) {
  return (
    <Mark size={size}>
      <rect width="24" height="24" rx="6" fill="#64748B" />
      <circle cx="7.2" cy="12" r="1.3" fill="#fff" />
      <circle cx="12" cy="12" r="1.3" fill="#fff" />
      <circle cx="16.8" cy="12" r="1.3" fill="#fff" />
    </Mark>
  )
}
