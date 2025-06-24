"use client";

type TokenFallbackIconProps = {
  symbol: string;
  size?: number;
};

export default function TokenFallbackIcon({
  symbol,
  size = 40,
}: TokenFallbackIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke="black"
        strokeWidth="4"
        fill="#60a5fa"
      />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        fill="black"
        fontSize="24"
        fontFamily="Arial"
        dy=".3em"
      >
        {symbol.toUpperCase().slice(0, 4)}
      </text>
    </svg>
  );
}
