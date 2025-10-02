"use client";

import { useState, type CSSProperties } from "react";

export default function ExpandableDescription({
  text,
  initialLines = 2,
  className = "",
}: {
  text: string;
  initialLines?: 2 | 3 | 4;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const mobileClamp =
    initialLines === 4
      ? "line-clamp-4"
      : initialLines === 3
      ? "line-clamp-3"
      : "line-clamp-2";
  const desktopClamp =
    initialLines === 4
      ? "md:line-clamp-5"
      : initialLines === 3
      ? "md:line-clamp-4"
      : "md:line-clamp-3";
  const clampClass = expanded ? "" : `${mobileClamp} ${desktopClamp}`;

  const fallbackStyle: CSSProperties | undefined = expanded
    ? undefined
    : {
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: initialLines,
        overflow: "hidden",
      };

  const isLong = (text ?? "").length > 140;

  return (
    <div className={className}>
      <p
        className={`text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-line ${clampClass}`}
        style={!expanded ? fallbackStyle : undefined}
        title={!expanded ? text : undefined}
      >
        {text || "No description"}
      </p>

      {isLong && (
        <button
          type="button"
          className="mt-1 text-xs text-primary hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
