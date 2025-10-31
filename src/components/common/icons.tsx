import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 13a4.5 4.5 0 0 0-3.4 1.8 4.5 4.5 0 0 0-5.2 0" />
      <path d="M12 17.5V22" />
      <path d="M12 17.5a2.5 2.5 0 0 1-2.5-2.5c0-3.5-1-5-1-5a7.5 7.5 0 0 1 7 0s-1 1.5-1 5a2.5 2.5 0 0 1-2.5 2.5z" />
      <path d="M8.5 11.8a2.5 2.5 0 0 0-2.3 2.7" />
      <path d="M17.8 14.5a2.5 2.5 0 0 0-2.3-2.7" />
      <path d="M12 2.5a2.5 2.5 0 0 1 2.5 2.5c0 3.5 1 5 1 5a7.5 7.5 0 0 1-7 0s1-1.5 1-5A2.5 2.5 0 0 1 12 2.5z" />
      <path d="M9.5 8.2a2.5 2.5 0 0 0 2.3-2.7" />
      <path d="M12.2 5.5a2.5 2.5 0 0 0 2.3 2.7" />
      <path d="M18 10h-1.5" />
      <path d="M7.5 10H6" />
      <path d="M17 17h-2" />
      <path d="M9 17H7" />
    </svg>
  );
}
