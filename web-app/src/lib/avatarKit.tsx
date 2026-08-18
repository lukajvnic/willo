import type { ReactNode } from "react";

/** the whole avatar is drawn in this one coordinate space, so every item lines up */
export const VIEW = { w: 300, h: 420 };

export type Category = "accessory" | "shirt" | "pants" | "shoes";

export type Item = {
  id: string;
  name: string;
  paint: (c: string, skin: string) => ReactNode;
  /** drawn above every other layer — overall bibs and the like */
  over?: (c: string) => ReactNode;
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

export const SKINS = ["#F2D5BE", "#E0B593", "#C08D62", "#96603C", "#6B4229", "#452A1C"];

const CLOTH = ["#D6CCBE", "#C09A6B", "#B4674C", "#7E6A5A", "#5E7A6C", "#4C6A85", "#6A5B78", "#2E2C2A"];
const DENIM = ["#4C6A85", "#3B5064", "#8A97A3", "#7E6A5A", "#5E7A6C", "#2E2C2A"];
const SHOE = ["#E4DED4", "#2E2C2A", "#B4674C", "#4C6A85", "#7E6A5A", "#5E7A6C"];
const TRIM = ["#C8A24A", "#B4674C", "#4C6A85", "#5E7A6C", "#D6CCBE", "#2E2C2A"];

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

const TORSO = "M96 196C96 170 112 162 128 160L172 160C188 162 204 170 204 196L197 266C166 274 134 274 103 266Z";

/** the bare figure everything else is layered onto */
export function drawBody(skin: string): ReactNode {
  const shade = dark(skin, 0.16);
  return (
    <g>
      <rect x={134} y={124} width={32} height={46} rx={15} fill={skin} />
      <path d="M134 132Q150 150 166 132L166 124L134 124Z" fill={shade} />
      {pair(
        <>
          <rect x={48} y={162} width={54} height={46} rx={23} fill={skin} />
          <rect x={52} y={166} width={36} height={106} rx={18} fill={skin} />
          <circle cx={70} cy={278} r={15} fill={skin} />
        </>,
      )}
      <path d={TORSO} fill={skin} />
      <path d="M104 248L196 248L198 300L102 300Z" fill={skin} />
      {pair(
        <>
          <rect x={103} y={260} width={45} height={114} rx={14} fill={skin} />
          <ellipse cx={124} cy={376} rx={25} ry={12} fill={shade} />
        </>,
      )}
    </g>
  );
}

function face(skin: string): ReactNode {
  const ink = dark(skin, 0.58);
  return (
    <>
      <circle cx={150} cy={92} r={50} fill={skin} />
      <circle cx={132} cy={86} r={5} fill={ink} />
      <circle cx={168} cy={86} r={5} fill={ink} />
      <path d="M130 108Q150 124 170 108" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
    </>
  );
}

export function drawHead(photo: string | null, skin: string): ReactNode {
  return (
    <g>
      <ellipse cx={150} cy={140} rx={17} ry={9} fill="rgba(0,0,0,0.3)" />
      {photo ? (
        <>
          <clipPath id="ac-head-clip">
            <circle cx={150} cy={92} r={50} />
          </clipPath>
          <image
            href={photo}
            x={100}
            y={42}
            width={100}
            height={100}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#ac-head-clip)"
          />
        </>
      ) : (
        face(skin)
      )}
      <circle cx={150} cy={92} r={50} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
    </g>
  );
}

/* ---------- shared clothing parts ---------- */

const shoulder = (c: string) => <rect x={48} y={162} width={54} height={46} rx={23} fill={c} />;
const sleeveLong = (c: string) =>
  pair(
    <>
      {shoulder(c)}
      <rect x={50} y={168} width={38} height={102} rx={18} fill={c} />
    </>,
  );
const sleeveShort = (c: string) =>
  pair(
    <>
      {shoulder(c)}
      <rect x={50} y={168} width={38} height={42} rx={18} fill={c} />
    </>,
  );
const cuffs = (c: string) => pair(<rect x={50} y={248} width={38} height={22} rx={11} fill={c} />);
const neckHole = (skin: string) => <ellipse cx={150} cy={160} rx={21} ry={10} fill={skin} />;
const hem = (c: string) => (
  <path d="M103 258C134 266 166 266 197 258" fill="none" stroke={dark(c, 0.22)} strokeWidth={3} />
);

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
    paint: (c) => (
      <>
        <path d="M100 84Q100 38 150 38Q200 38 200 84Z" fill={c} />
        <path d="M150 38L150 84" stroke={dark(c, 0.22)} strokeWidth={2} />
        <ellipse cx={150} cy={84} rx={58} ry={12} fill={dark(c, 0.3)} />
        <circle cx={150} cy={40} r={5} fill={dark(c, 0.3)} />
      </>
    ),
  },
  {
    id: "shades",
    name: "sunglasses",
    paint: (c) => (
      <>
        <rect x={100} y={87} width={16} height={6} rx={3} fill={dark(c, 0.3)} />
        <rect x={184} y={87} width={16} height={6} rx={3} fill={dark(c, 0.3)} />
        <rect x={144} y={89} width={12} height={5} rx={2} fill={c} />
        <rect x={112} y={82} width={33} height={23} rx={9} fill={c} />
        <rect x={155} y={82} width={33} height={23} rx={9} fill={c} />
        <path d="M117 100L131 85L138 85L120 102Z" fill="rgba(255,255,255,0.28)" />
        <path d="M160 100L174 85L181 85L163 102Z" fill="rgba(255,255,255,0.28)" />
      </>
    ),
  },
  {
    id: "crown",
    name: "crown",
    paint: (c) => (
      <>
        <path d="M106 68L106 42L128 58L150 28L172 58L194 42L194 68Z" fill={c} />
        <rect x={104} y={60} width={92} height={13} rx={5} fill={dark(c, 0.24)} />
        <circle cx={106} cy={42} r={5} fill={light(c, 0.5)} />
        <circle cx={150} cy={28} r={6} fill={light(c, 0.5)} />
        <circle cx={194} cy={42} r={5} fill={light(c, 0.5)} />
        <circle cx={128} cy={67} r={3.5} fill={light(c, 0.35)} />
        <circle cx={172} cy={67} r={3.5} fill={light(c, 0.35)} />
      </>
    ),
  },
  {
    id: "band",
    name: "headband",
    paint: (c) => (
      <>
        <path d="M102 68Q150 44 198 68L198 84Q150 60 102 84Z" fill={c} />
        <path d="M102 74Q150 50 198 74" fill="none" stroke={light(c, 0.28)} strokeWidth={3} />
      </>
    ),
  },
  {
    id: "bow",
    name: "hair bow",
    paint: (c) => (
      <>
        <path d="M188 50L166 36L166 64Z" fill={c} />
        <path d="M188 50L210 36L210 64Z" fill={c} />
        <path d="M188 50L166 36L172 50Z" fill={dark(c, 0.22)} />
        <path d="M188 50L210 36L204 50Z" fill={dark(c, 0.22)} />
        <circle cx={188} cy={50} r={7} fill={light(c, 0.2)} />
      </>
    ),
  },
  {
    id: "flowers",
    name: "flower crown",
    paint: (c) => (
      <>
        <path d="M100 79Q150 34 200 79" fill="none" stroke={dark(c, 0.5)} strokeWidth={4} />
        {FLOWERS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={i % 2 ? light(c, 0.34) : c} />
            <circle cx={x} cy={y} r={3.4} fill="#E8D9A6" />
          </g>
        ))}
      </>
    ),
  },
];

/* ---------- shirts ---------- */

const SHIRTS: Item[] = [
  {
    id: "tee",
    name: "t-shirt",
    paint: (c, skin) => (
      <>
        {sleeveShort(c)}
        <path d={TORSO} fill={c} />
        {hem(c)}
        {neckHole(skin)}
        <path d="M129 159Q150 178 171 159" fill="none" stroke={dark(c, 0.24)} strokeWidth={3} />
      </>
    ),
  },
  {
    id: "polo",
    name: "polo",
    paint: (c, skin) => (
      <>
        {sleeveShort(c)}
        {pair(<rect x={50} y={198} width={38} height={12} rx={6} fill={dark(c, 0.22)} />)}
        <path d={TORSO} fill={c} />
        {hem(c)}
        {neckHole(skin)}
        <rect x={145} y={172} width={10} height={34} rx={3} fill={light(c, 0.12)} />
        <path d="M136 157L150 180L133 188L126 160Z" fill={light(c, 0.16)} />
        <path d="M164 157L150 180L167 188L174 160Z" fill={light(c, 0.16)} />
        <circle cx={150} cy={184} r={2.8} fill={dark(c, 0.4)} />
        <circle cx={150} cy={198} r={2.8} fill={dark(c, 0.4)} />
      </>
    ),
  },
  {
    id: "hoodie",
    name: "hoodie",
    paint: (c) => (
      <>
        <circle cx={150} cy={102} r={64} fill={dark(c, 0.18)} />
        {sleeveLong(c)}
        {cuffs(dark(c, 0.22))}
        <path d={TORSO} fill={c} />
        <ellipse cx={150} cy={160} rx={27} ry={13} fill={dark(c, 0.34)} />
        <rect x={139} y={166} width={5} height={28} rx={2.5} fill={light(c, 0.44)} />
        <rect x={156} y={166} width={5} height={28} rx={2.5} fill={light(c, 0.44)} />
        <rect x={114} y={212} width={72} height={38} rx={9} fill={dark(c, 0.14)} />
      </>
    ),
  },
  {
    id: "jacket",
    name: "jacket",
    paint: (c) => (
      <>
        {sleeveLong(c)}
        {cuffs(dark(c, 0.28))}
        <path d={TORSO} fill={c} />
        <rect x={138} y={158} width={24} height={110} fill={dark(c, 0.46)} />
        <rect x={147} y={158} width={6} height={110} fill={light(c, 0.34)} />
        <path d="M138 158L118 158L136 202Z" fill={light(c, 0.12)} />
        <path d="M162 158L182 158L164 202Z" fill={light(c, 0.12)} />
        <rect x={110} y={224} width={22} height={7} rx={3} fill={dark(c, 0.3)} />
        <rect x={168} y={224} width={22} height={7} rx={3} fill={dark(c, 0.3)} />
      </>
    ),
  },
  {
    id: "dress",
    name: "dress shirt",
    paint: (c, skin) => (
      <>
        {sleeveLong(c)}
        {cuffs(dark(c, 0.16))}
        <path d={TORSO} fill={c} />
        {neckHole(skin)}
        <path d="M132 156L150 184L168 156L162 153L150 170L138 153Z" fill={light(c, 0.16)} />
        <rect x={146} y={168} width={8} height={98} fill={dark(c, 0.12)} />
        <circle cx={150} cy={196} r={2.6} fill={dark(c, 0.34)} />
        <circle cx={150} cy={220} r={2.6} fill={dark(c, 0.34)} />
        <circle cx={150} cy={244} r={2.6} fill={dark(c, 0.34)} />
        <rect x={114} y={196} width={22} height={19} rx={3} fill={dark(c, 0.1)} />
      </>
    ),
  },
  {
    id: "sweater",
    name: "sweater",
    paint: (c, skin) => (
      <>
        {sleeveLong(c)}
        {cuffs(dark(c, 0.24))}
        <path d={TORSO} fill={c} />
        <path d="M103 250C134 258 166 258 197 250L197 266C166 274 134 274 103 266Z" fill={dark(c, 0.24)} />
        <path d="M124 254L122 270M150 257L150 273M176 254L178 270" stroke={dark(c, 0.4)} strokeWidth={2} />
        <ellipse cx={150} cy={160} rx={25} ry={12} fill={dark(c, 0.24)} />
        {neckHole(skin)}
      </>
    ),
  },
  {
    id: "tank",
    name: "tank top",
    paint: (c) => (
      <>
        <path
          d="M118 158L134 158Q150 184 166 158L182 158L189 202L197 266C166 274 134 274 103 266L111 202Z"
          fill={c}
        />
        {hem(c)}
      </>
    ),
  },
];

/* ---------- pants ---------- */

const PANTS: Item[] = [
  {
    id: "jeans",
    name: "jeans",
    paint: (c) => (
      <>
        <path d="M104 252L196 252L198 292L102 292Z" fill={c} />
        {pair(
          <>
            <rect x={103} y={260} width={45} height={114} rx={12} fill={c} />
            <path d="M112 274Q127 285 135 273" fill="none" stroke={dark(c, 0.34)} strokeWidth={2.5} strokeLinecap="round" />
          </>,
        )}
        <rect x={102} y={250} width={96} height={16} rx={6} fill={dark(c, 0.26)} />
        <rect x={144} y={250} width={12} height={16} rx={3} fill={dark(c, 0.4)} />
        <rect x={148} y={266} width={4} height={106} fill={dark(c, 0.2)} />
      </>
    ),
  },
  {
    id: "shorts",
    name: "shorts",
    paint: (c) => (
      <>
        <path d="M104 252L196 252L198 292L102 292Z" fill={c} />
        {pair(
          <>
            <rect x={102} y={260} width={47} height={62} rx={12} fill={c} />
            <path d="M105 312L146 312" stroke={dark(c, 0.3)} strokeWidth={3} />
          </>,
        )}
        <rect x={102} y={250} width={96} height={15} rx={6} fill={dark(c, 0.28)} />
        <rect x={148} y={266} width={4} height={52} fill={dark(c, 0.2)} />
      </>
    ),
  },
  {
    id: "skirt",
    name: "skirt",
    paint: (c) => (
      <>
        <path d="M102 252L198 252L216 330Q150 348 84 330Z" fill={c} />
        <path d="M124 258L112 334M150 258L150 342M176 258L188 334" stroke={dark(c, 0.24)} strokeWidth={2.5} />
        <rect x={100} y={248} width={100} height={16} rx={6} fill={dark(c, 0.3)} />
      </>
    ),
  },
  {
    id: "sweats",
    name: "sweatpants",
    paint: (c) => (
      <>
        <path d="M102 252L198 252L200 296L100 296Z" fill={c} />
        {pair(
          <>
            <rect x={100} y={260} width={49} height={114} rx={18} fill={c} />
            <rect x={100} y={352} width={49} height={22} rx={10} fill={dark(c, 0.26)} />
          </>,
        )}
        <rect x={100} y={248} width={100} height={17} rx={8} fill={dark(c, 0.22)} />
        <path d="M143 258Q150 268 157 258" fill="none" stroke={light(c, 0.4)} strokeWidth={3.5} strokeLinecap="round" />
        <rect x={148} y={266} width={4} height={92} fill={dark(c, 0.16)} />
      </>
    ),
  },
  {
    id: "formal",
    name: "formal pants",
    paint: (c) => (
      <>
        <path d="M106 254L194 254L196 292L104 292Z" fill={c} />
        {pair(
          <>
            <rect x={106} y={260} width={41} height={114} rx={8} fill={c} />
            <rect x={125} y={272} width={2.5} height={98} fill={light(c, 0.22)} />
          </>,
        )}
        <rect x={102} y={248} width={96} height={14} rx={4} fill="#241F1C" />
        <rect x={143} y={247} width={16} height={16} rx={3} fill="#B9A46B" />
        <rect x={147} y={251} width={8} height={8} rx={2} fill="#241F1C" />
      </>
    ),
  },
  {
    id: "overalls",
    name: "overalls",
    paint: (c) => (
      <>
        <path d="M102 252L198 252L200 294L100 294Z" fill={c} />
        {pair(<rect x={102} y={260} width={47} height={114} rx={11} fill={c} />)}
        <rect x={148} y={266} width={4} height={106} fill={dark(c, 0.2)} />
      </>
    ),
    over: (c) => (
      <>
        <path d="M120 168L132 200L128 208L110 176Z" fill={c} />
        <path d="M180 168L168 200L172 208L190 176Z" fill={c} />
        <rect x={116} y={196} width={68} height={62} rx={7} fill={c} />
        <rect x={130} y={210} width={40} height={30} rx={4} fill={dark(c, 0.18)} />
        <circle cx={124} cy={204} r={4} fill="#B9A46B" />
        <circle cx={176} cy={204} r={4} fill="#B9A46B" />
      </>
    ),
  },
];

/* ---------- shoes ---------- */

const SHOES: Item[] = [
  {
    id: "sneakers",
    name: "sneakers",
    paint: (c) =>
      pair(
        <>
          <rect x={96} y={352} width={52} height={28} rx={10} fill={c} />
          <rect x={94} y={372} width={54} height={14} rx={7} fill="#EFE9DF" />
          <path d="M110 358L136 358M110 365L136 365" stroke={light(c, 0.55)} strokeWidth={3} strokeLinecap="round" />
          <path d="M96 370Q112 352 134 350" fill="none" stroke={dark(c, 0.28)} strokeWidth={4} strokeLinecap="round" />
        </>,
      ),
  },
  {
    id: "boots",
    name: "boots",
    paint: (c) =>
      pair(
        <>
          <rect x={96} y={330} width={52} height={52} rx={10} fill={c} />
          <rect x={94} y={324} width={54} height={15} rx={7} fill={light(c, 0.3)} />
          <rect x={96} y={350} width={52} height={9} rx={3} fill={dark(c, 0.35)} />
          <circle cx={140} cy={354} r={3.5} fill="#B9A46B" />
          <rect x={94} y={374} width={54} height={13} rx={5} fill={dark(c, 0.45)} />
        </>,
      ),
  },
  {
    id: "sandals",
    name: "sandals",
    paint: (c, skin) =>
      pair(
        <>
          <ellipse cx={122} cy={366} rx={26} ry={16} fill={skin} />
          <rect x={96} y={372} width={52} height={14} rx={7} fill={c} />
          <rect x={100} y={356} width={44} height={8} rx={4} fill={c} />
          <path d="M122 364L128 374" stroke={c} strokeWidth={4} strokeLinecap="round" />
        </>,
      ),
  },
  {
    id: "loafers",
    name: "loafers",
    paint: (c) =>
      pair(
        <>
          <path d="M96 366Q96 354 112 354L136 354Q152 360 149 378Q124 388 96 382Z" fill={c} />
          <rect x={108} y={358} width={28} height={7} rx={3.5} fill={light(c, 0.28)} />
          <path d="M96 380Q124 386 149 377" fill="none" stroke={dark(c, 0.45)} strokeWidth={5} strokeLinecap="round" />
        </>,
      ),
  },
  {
    id: "slippers",
    name: "slippers",
    paint: (c) =>
      pair(
        <>
          <rect x={94} y={358} width={54} height={28} rx={13} fill={c} />
          <circle cx={112} cy={358} r={9} fill={light(c, 0.38)} />
          <circle cx={128} cy={356} r={9} fill={light(c, 0.38)} />
          <circle cx={143} cy={359} r={8} fill={light(c, 0.38)} />
          <circle cx={106} cy={374} r={5} fill={light(c, 0.5)} />
        </>,
      ),
  },
  {
    id: "hitops",
    name: "hi-tops",
    paint: (c) =>
      pair(
        <>
          <rect x={96} y={334} width={52} height={46} rx={9} fill={c} />
          <rect x={94} y={370} width={54} height={16} rx={8} fill="#EFE9DF" />
          <path d="M112 342L136 348M112 352L136 358M112 362L136 368" stroke={light(c, 0.5)} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={116} cy={352} r={7} fill={light(c, 0.85)} />
          <circle cx={116} cy={352} r={3} fill={c} />
        </>,
      ),
  },
];

/* ---------- the kit ---------- */

export const KITS: Kit[] = [
  { key: "accessory", label: "accessory", span: 150, band: [22, 152], colors: TRIM, fallback: "#C8A24A", items: ACCESSORIES },
  { key: "shirt", label: "shirt", span: 110, band: [152, 262], colors: CLOTH, fallback: "#5E7A6C", items: SHIRTS },
  { key: "pants", label: "pants", span: 92, band: [262, 350], colors: DENIM, fallback: "#4C6A85", items: PANTS },
  { key: "shoes", label: "shoes", span: 68, band: [322, 398], colors: SHOE, fallback: "#E4DED4", items: SHOES },
];
