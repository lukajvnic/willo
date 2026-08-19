import type { ReactNode } from "react";

/** the whole avatar is drawn in this one coordinate space, so every item lines up */
export const VIEW = { w: 300, h: 420 };

export type Category = "accessory";

export type Item = {
  id: string;
  name: string;
  paint: (c: string, base: string) => ReactNode;
};

export type Kit = {
  key: Category;
  label: string;
  /** slice of the 420-unit body this category owns — drives arrow alignment */
  span: number;
  /** y range lit up when the row is hovered */
  band: [number, number];
  colors: string[];
  fallback: string;
  items: Item[];
};

/* ---------- colour ---------- */

function mix(hex: string, target: number, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v + (target - v) * amt);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

export const dark = (hex: string, amt = 0.18) => mix(hex, 0, amt);
export const light = (hex: string, amt = 0.18) => mix(hex, 255, amt);

/** flat body/head colours — the reference's warm tan by default, then any flat accent */
export const BASE_COLORS = ["#F4B06F", "#4A90E2", "#7C4A9E", "#3EAE6B", "#E2574A", "#2E2C2A"];

/** the marker-drawn outline every body part is inked with */
const INK = "#211F1B";
const OUTLINE = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const };

const TRIM = ["#C8A24A", "#B4674C", "#4C6A85", "#5E7A6C", "#D6CCBE", "#2E2C2A"];

/**
 * Proportions below are lifted straight from the reference sketch: an oversized round head
 * (~1.8x the torso width) sitting almost directly on a short, boxy torso, thin stick limbs,
 * and small foot flicks — permanent, bare, no swappable clothing.
 */
const HEAD = { cx: 150, cy: 112, r: 92 };
/** old head accessories (drawn for r=60 at cy=92) scaled uniformly onto the bigger head */
const ACCESSORY_XFORM = "translate(150,112) scale(1.5333) translate(-150,-92)";

/* ---------- body ---------- */

/** the body is symmetric about x=150, so every limb is drawn once and mirrored */
function pair(art: ReactNode) {
  return (
    <>
      {art}
      <g transform="translate(300,0) scale(-1,1)">{art}</g>
    </>
  );
}

/** the bare figure — big flat head, short block torso, thin stick limbs, small foot flicks. No clothing layers. */
export function drawBody(base: string): ReactNode {
  return (
    <g>
      {/* soft ground-contact shadow under the feet, straight out of the reference */}
      <ellipse cx={150} cy={360} rx={58} ry={9} fill="rgba(0,0,0,0.14)" />
      {/* thin black stick arms, gently curved and hanging close to the torso */}
      {pair(<path d="M94 214Q78 228 74 250T68 268" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      <rect x={98} y={200} width={104} height={90} rx={14} fill={base} {...OUTLINE} />
      {/* thin black stick legs — planted at the abdomen's bottom corners, shorter, reaching the ground */}
      {pair(<path d="M104 290L100 350" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      {/* small foot flicks — short, roughly perpendicular to the leg, pointing outward away from the midline */}
      {pair(<path d="M100 350Q90 350 82 349" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
    </g>
  );
}

function face(base: string): ReactNode {
  const ink = dark(base, 0.62);
  return (
    <>
      <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} fill={base} />
      {/* two small round dot eyes, traced from the reference */}
      <circle cx={121} cy={102} r={7} fill={ink} />
      <circle cx={179} cy={102} r={7} fill={ink} />
      {/* one simple curved smile band, no teeth */}
      <path d="M98 141Q150 173 202 141Q150 155 98 141Z" fill={ink} />
    </>
  );
}

/** the big round head — flat colour by default, swappable for an uploaded photo */
export function drawHead(photo: string | null, base: string): ReactNode {
  return (
    <g>
      <ellipse cx={HEAD.cx} cy={200} rx={28} ry={11} fill="rgba(0,0,0,0.22)" />
      {photo ? (
        <>
          <clipPath id="ac-head-clip">
            <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} />
          </clipPath>
          <image
            href={photo}
            x={HEAD.cx - HEAD.r}
            y={HEAD.cy - HEAD.r}
            width={HEAD.r * 2}
            height={HEAD.r * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#ac-head-clip)"
          />
        </>
      ) : (
        face(base)
      )}
      <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
    </g>
  );
}

/** old head-space content, r=60 at cy=92 — wrap any accessory art in this */
const onHead = (art: ReactNode) => <g transform={ACCESSORY_XFORM}>{art}</g>;

/* ---------- accessories ---------- */

const FLOWERS: Array<[number, number]> = [
  [100, 79],
  [110, 59],
  [128, 45],
  [150, 40],
  [172, 45],
  [190, 59],
  [200, 79],
];

const ACCESSORIES: Item[] = [
  { id: "bare", name: "nothing", paint: () => null },
  {
    id: "cap",
    name: "cap",
    paint: (c) =>
      onHead(
        <>
          <path d="M100 77Q100 34 150 34Q200 34 200 77Z" fill={c} {...OUTLINE} />
          <path d="M150 34L150 77" stroke={dark(c, 0.22)} strokeWidth={2} />
          <ellipse cx={150} cy={77} rx={58} ry={12} fill={dark(c, 0.3)} />
          <circle cx={150} cy={36} r={5} fill={dark(c, 0.3)} />
        </>,
      ),
  },
  {
    id: "shades",
    name: "sunglasses",
    paint: (c) =>
      onHead(
        <>
          <rect x={100} y={87} width={16} height={6} rx={3} fill={dark(c, 0.3)} />
          <rect x={184} y={87} width={16} height={6} rx={3} fill={dark(c, 0.3)} />
          <rect x={144} y={89} width={12} height={5} rx={2} fill={c} />
          <rect x={112} y={82} width={33} height={23} rx={9} fill={c} {...OUTLINE} strokeWidth={3} />
          <rect x={155} y={82} width={33} height={23} rx={9} fill={c} {...OUTLINE} strokeWidth={3} />
          <path d="M117 100L131 85L138 85L120 102Z" fill="rgba(255,255,255,0.28)" />
          <path d="M160 100L174 85L181 85L163 102Z" fill="rgba(255,255,255,0.28)" />
        </>,
      ),
  },
  {
    id: "crown",
    name: "crown",
    paint: (c) =>
      onHead(
        <>
          <path d="M106 68L106 42L128 58L150 28L172 58L194 42L194 68Z" fill={c} {...OUTLINE} strokeWidth={3} />
          <rect x={104} y={60} width={92} height={13} rx={5} fill={dark(c, 0.24)} />
          <circle cx={106} cy={42} r={5} fill={light(c, 0.5)} />
          <circle cx={150} cy={28} r={6} fill={light(c, 0.5)} />
          <circle cx={194} cy={42} r={5} fill={light(c, 0.5)} />
          <circle cx={128} cy={67} r={3.5} fill={light(c, 0.35)} />
          <circle cx={172} cy={67} r={3.5} fill={light(c, 0.35)} />
        </>,
      ),
  },
  {
    id: "band",
    name: "headband",
    paint: (c) =>
      onHead(
        <>
          <path d="M102 68Q150 44 198 68L198 84Q150 60 102 84Z" fill={c} />
          <path d="M102 74Q150 50 198 74" fill="none" stroke={light(c, 0.28)} strokeWidth={3} />
        </>,
      ),
  },
  {
    id: "bow",
    name: "hair bow",
    paint: (c) =>
      onHead(
        <>
          <path d="M188 50L166 36L166 64Z" fill={c} />
          <path d="M188 50L210 36L210 64Z" fill={c} />
          <path d="M188 50L166 36L172 50Z" fill={dark(c, 0.22)} />
          <path d="M188 50L210 36L204 50Z" fill={dark(c, 0.22)} />
          <circle cx={188} cy={50} r={7} fill={light(c, 0.2)} />
        </>,
      ),
  },
  {
    id: "flowers",
    name: "flower crown",
    paint: (c) =>
      onHead(
        <>
          <path d="M100 79Q150 34 200 79" fill="none" stroke={dark(c, 0.5)} strokeWidth={4} />
          {FLOWERS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={9} fill={i % 2 ? light(c, 0.34) : c} />
              <circle cx={x} cy={y} r={3.4} fill="#E8D9A6" />
            </g>
          ))}
        </>,
      ),
  },
];

/* ---------- the kit ---------- */

export const KITS: Kit[] = [
  { key: "accessory", label: "accessory", span: 420, band: [10, 204], colors: TRIM, fallback: "#C8A24A", items: ACCESSORIES },
];
