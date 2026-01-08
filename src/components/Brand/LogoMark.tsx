type Props = { className?: string; title?: string };

export default function LogoMark({ className, title = "BreezyBrief" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
    >
      {/* soft rounded tile */}
      <rect x="5" y="5" width="38" height="38" rx="12" />

      {/* route arc */}
      <path
        d="M12 30 C18 18, 30 18, 36 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />

      {/* A/B dots */}
      <circle cx="12" cy="30" r="2.4" fill="currentColor" />
      <circle cx="36" cy="26" r="2.4" fill="currentColor" />

      {/* breeze lines */}
      <path
        d="M14 18 C20 16, 25 16, 30 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M16 22 C22 20, 27 20, 32 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
