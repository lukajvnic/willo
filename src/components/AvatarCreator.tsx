import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KITS, SKINS, VIEW, drawBody, drawHead, type Category, type Kit } from "../lib/avatarKit";

type Picks = Record<Category, number>;
type Tints = Record<Category, string>;

const START_PICK: Picks = { accessory: 0, shirt: 0, pants: 0, shoes: 0 };
const START_TINT = Object.fromEntries(KITS.map((k) => [k.key, k.fallback])) as Tints;

type Look = { name: string; wear: Record<Category, string>; tint: Tints };

const LOOKS: Look[] = [
  {
    name: "streetwear",
    wear: { accessory: "cap", shirt: "hoodie", pants: "sweats", shoes: "hitops" },
    tint: { accessory: "#B4674C", shirt: "#2E2C2A", pants: "#3B5064", shoes: "#E4DED4" },
  },
  {
    name: "office",
    wear: { accessory: "shades", shirt: "dress", pants: "formal", shoes: "loafers" },
    tint: { accessory: "#2E2C2A", shirt: "#D6CCBE", pants: "#2E2C2A", shoes: "#7E6A5A" },
  },
  {
    name: "beach",
    wear: { accessory: "flowers", shirt: "tank", pants: "shorts", shoes: "sandals" },
    tint: { accessory: "#B4674C", shirt: "#D6CCBE", pants: "#5E7A6C", shoes: "#B4674C" },
  },
  {
    name: "royal",
    wear: { accessory: "crown", shirt: "jacket", pants: "formal", shoes: "boots" },
    tint: { accessory: "#C8A24A", shirt: "#6A5B78", pants: "#2E2C2A", shoes: "#2E2C2A" },
  },
];

const OK_TYPES = ["image/png", "image/jpeg", "image/webp"];

function Chevron({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d={back ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function AvatarCreator() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [skin, setSkin] = useState(SKINS[1]);
  const [pick, setPick] = useState<Picks>(START_PICK);
  const [tint, setTint] = useState<Tints>(START_TINT);
  const [dir, setDir] = useState<Record<Category, number>>({ accessory: 1, shirt: 1, pants: 1, shoes: 1 });
  const [hot, setHot] = useState<Category | null>(null);
  const [dropping, setDropping] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const noteTimer = useRef(0);

  const say = useCallback((msg: string) => {
    setNote(msg);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), 2800);
  }, []);

  useEffect(() => () => window.clearTimeout(noteTimer.current), []);

  const worn = useMemo(
    () => Object.fromEntries(KITS.map((k) => [k.key, k.items[pick[k.key]]])) as Record<Category, Kit["items"][number]>,
    [pick],
  );

  /* ---------- picking ---------- */

  const step = (kit: Kit, d: number) => {
    setDir((p) => ({ ...p, [kit.key]: d }));
    setPick((p) => ({ ...p, [kit.key]: (p[kit.key] + d + kit.items.length) % kit.items.length }));
  };

  const wear = (look: Look) => {
    setPick(
      Object.fromEntries(
        KITS.map((k) => [k.key, Math.max(0, k.items.findIndex((i) => i.id === look.wear[k.key]))]),
      ) as Picks,
    );
    setTint(look.tint);
    setDir({ accessory: 1, shirt: 1, pants: 1, shoes: 1 });
    say(`${look.name} on`);
  };

  const shuffle = () => {
    setPick(Object.fromEntries(KITS.map((k) => [k.key, Math.floor(Math.random() * k.items.length)])) as Picks);
    setTint(
      Object.fromEntries(
        KITS.map((k) => [k.key, k.colors[Math.floor(Math.random() * k.colors.length)]]),
      ) as Tints,
    );
  };

  const reset = () => {
    setPick(START_PICK);
    setTint(START_TINT);
    say("back to basics");
  };

  /* ---------- the photo ---------- */

  const accept = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (!OK_TYPES.includes(file.type)) return say("png or jpg only");
      if (file.size > 8_000_000) return say("that one's over 8mb");
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(String(reader.result));
        say("head swapped");
      };
      reader.onerror = () => say("couldn't read that file");
      reader.readAsDataURL(file);
    },
    [say],
  );

  /* ---------- export ---------- */

  const draw = useCallback(async (scale = 3) => {
    const node = svgRef.current;
    if (!node) throw new Error("no canvas");
    const clone = node.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("class");
    clone.querySelectorAll("[data-strip]").forEach((n) => n.remove());
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    // some renderers still want the xlink form of an embedded image
    clone.querySelectorAll("image").forEach((img) => {
      const href = img.getAttribute("href");
      if (href) img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", href);
    });

    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
    const img = new Image();
    await new Promise((ok, fail) => {
      img.onload = ok;
      img.onerror = () => fail(new Error("render failed"));
      img.src = src;
    });

    const canvas = document.createElement("canvas");
    canvas.width = VIEW.w * scale;
    canvas.height = VIEW.h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((ok, fail) =>
      canvas.toBlob((b) => (b ? ok(b) : fail(new Error("encode failed"))), "image/png"),
    );
  }, []);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await draw();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "willo-avatar.png";
      a.click();
      URL.revokeObjectURL(url);
      say("saved");
    } catch {
      say("export failed");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      const blob = await draw();
      const file = new File([blob], "willo-avatar.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "my willo avatar" });
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        say("copied to clipboard");
      }
    } catch {
      say("sharing isn't available here");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- render ---------- */

  const band = hot ? KITS.find((k) => k.key === hot)?.band : null;
  const summary = KITS.map((k) => `${k.label}: ${worn[k.key].name}`).join(", ");
  const bib = worn.pants.over;

  return (
    <section className="panel maker">
      <div className="panel-head">
        <h2 className="panel-title">avatar</h2>
        <span className="panel-meta">{photo ? "looking good" : "upload a photo to start"}</span>
      </div>

      <div className="maker-grid">
        <div
          className="ac-stage"
          data-drop={dropping}
          onDragOver={(e) => {
            e.preventDefault();
            setDropping(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropping(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDropping(false);
            accept(e.dataTransfer.files?.[0]);
          }}
        >
          <div className="ac-rig" style={{ gridTemplateRows: KITS.map((k) => `${k.span}fr`).join(" ") }}>
            {KITS.map((kit, row) =>
              [-1, 1].map((d) => (
                <button
                  key={`${kit.key}${d}`}
                  type="button"
                  className="ac-arrow"
                  style={{ gridRow: row + 1, gridColumn: d < 0 ? 1 : 3 }}
                  onClick={() => step(kit, d)}
                  onMouseEnter={() => setHot(kit.key)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(kit.key)}
                  onBlur={() => setHot(null)}
                  aria-label={`${d < 0 ? "previous" : "next"} ${kit.label}`}
                >
                  <Chevron back={d < 0} />
                </button>
              )),
            )}

            <svg
              ref={svgRef}
              className="ac-canvas"
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={summary}
            >
              <defs>
                <radialGradient id="ac-glow" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#4B4744" />
                  <stop offset="100%" stopColor="#201E1D" />
                </radialGradient>
              </defs>
              <rect x={0} y={0} width={VIEW.w} height={VIEW.h} rx={24} fill="url(#ac-glow)" />
              {band && (
                <rect
                  data-strip="1"
                  className="ac-lit"
                  x={14}
                  y={band[0]}
                  width={VIEW.w - 28}
                  height={band[1] - band[0]}
                  rx={16}
                  fill="rgba(255,255,255,0.07)"
                />
              )}

              {drawBody(skin)}

              <g key={`pants-${worn.pants.id}`} className="ac-pop" data-dir={dir.pants}>
                {worn.pants.paint(tint.pants, skin)}
              </g>
              <g key={`shirt-${worn.shirt.id}`} className="ac-pop" data-dir={dir.shirt}>
                {worn.shirt.paint(tint.shirt, skin)}
              </g>
              {bib && (
                <g key={`bib-${worn.pants.id}`} className="ac-pop" data-dir={dir.pants}>
                  {bib(tint.pants)}
                </g>
              )}
              <g key={`shoes-${worn.shoes.id}`} className="ac-pop" data-dir={dir.shoes}>
                {worn.shoes.paint(tint.shoes, skin)}
              </g>

              {drawHead(photo, skin)}

              <g key={`acc-${worn.accessory.id}`} className="ac-pop" data-dir={dir.accessory}>
                {worn.accessory.paint(tint.accessory, skin)}
              </g>
            </svg>
          </div>

          <div className="ac-veil" hidden={!dropping}>
            <span>drop to use as the head</span>
          </div>
        </div>

        <div className="ac-side">
          <div className="ac-photo">
            <div className="ac-thumb" data-empty={!photo}>
              {photo ? <img src={photo} alt="your upload" /> : <span>no photo</span>}
            </div>
            <div className="ac-photo-body">
              <button type="button" className="ac-btn" onClick={() => fileRef.current?.click()}>
                {photo ? "change photo" : "upload photo"}
              </button>
              <p className="ac-fine">
                {photo ? (
                  <button type="button" className="ac-link" onClick={() => setPhoto(null)}>
                    remove
                  </button>
                ) : (
                  "png or jpg — or drag one onto the avatar"
                )}
              </p>
              <div className="ac-dots" role="group" aria-label="skin tone">
                {SKINS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="ac-dot"
                    style={{ background: s }}
                    data-on={s === skin}
                    onClick={() => setSkin(s)}
                    aria-label={`skin tone ${s}`}
                  />
                ))}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="ac-file"
              onChange={(e) => {
                accept(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <ul className="ac-list">
            {KITS.map((kit) => (
              <li
                key={kit.key}
                className="ac-item"
                data-hot={hot === kit.key}
                onMouseEnter={() => setHot(kit.key)}
                onMouseLeave={() => setHot(null)}
              >
                <div className="ac-item-head">
                  <span className="ac-cat">{kit.label}</span>
                  <span className="ac-now">{worn[kit.key].name}</span>
                  <span className="ac-count">
                    {pick[kit.key] + 1}/{kit.items.length}
                  </span>
                </div>
                <div className="ac-dots" role="group" aria-label={`${kit.label} colour`}>
                  {kit.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="ac-dot"
                      style={{ background: c }}
                      data-on={c === tint[kit.key]}
                      onClick={() => setTint((p) => ({ ...p, [kit.key]: c }))}
                      aria-label={`${kit.label} in ${c}`}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="ac-looks">
            {LOOKS.map((look) => (
              <button key={look.name} type="button" className="ac-chip" onClick={() => wear(look)}>
                {look.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ac-actions">
        <button type="button" className="ac-btn" data-key onClick={download} disabled={busy}>
          download png
        </button>
        <button type="button" className="ac-btn" onClick={share} disabled={busy}>
          share
        </button>
        <button type="button" className="ac-btn" onClick={shuffle}>
          shuffle
        </button>
        <button type="button" className="ac-btn" onClick={reset}>
          reset
        </button>
        <span className="ac-note" aria-live="polite">
          {note}
        </span>
      </div>
    </section>
  );
}
