"use client";

type InterpolatedTextProps = {
  template: string;
  values: Record<string, string | number>;
  highlightedKey?: string;
  highlightedClassName?: string;
};

/**
 * Renders a template string with placeholders like {count} replaced by values.
 * Optionally wraps a specific value in a span for styling (e.g. bold number).
 */
export function InterpolatedText({
  template,
  values,
  highlightedKey,
  highlightedClassName = "font-bold text-lg",
}: InterpolatedTextProps) {
  const entries = Object.entries(values);
  if (entries.length === 0) return <>{template}</>;

  let result: React.ReactNode = template;
  for (const [key, value] of entries) {
    const placeholder = `{${key}}`;
    if (typeof result === "string" && result.includes(placeholder)) {
      const segments: string[] = result.split(placeholder);
      const isHighlighted = highlightedKey === key;
      const replacement = isHighlighted ? (
        <span key={key} className={highlightedClassName}>
          {value}
        </span>
      ) : (
        value
      );
      result = (
        <>
          {segments[0]}
          {replacement}
          {segments.slice(1).join(placeholder)}
        </>
      );
    }
  }

  return <>{result}</>;
}
