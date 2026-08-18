import { initials } from "../lib/people";

type Props = { name: string; tone: string; size: number };

export default function Avatar({ name, tone, size }: Props) {
  return (
    <div
      className="avatar"
      style={{ "--tone": tone, "--size": `${size}px` } as React.CSSProperties}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
