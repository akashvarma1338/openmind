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
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2v20" />
        <path d="M22 12H2" />
        <path d="m20 20-8-8" />
        <path d="m4 20 8-8" />
        <path d="m4 4 8 8" />
        <path d="m20 4-8 8" />
    </svg>
  );
}
