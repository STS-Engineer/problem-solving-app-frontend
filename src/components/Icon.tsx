export function Icon({
  name,
}: {
  name: "check" | "warn" | "close" | "doc" | "chat" | "upload" | "spark";
}) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;
  switch (name) {
    case "check":
      return (
        <svg {...common}>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "warn":
      return (
        <svg {...common}>
          <path
            d="M12 9v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 17h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10.29 3.86l-8.4 14.52A2 2 0 0 0 3.6 21h16.8a2 2 0 0 0 1.71-2.62L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path
            d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 10l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 5v12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path
            d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
