import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { KITS, BASE_COLORS, type Category, type Kit } from "./avatarKit";

type Picks = Record<Category, number>;

const START_PICK = Object.fromEntries(KITS.map((k) => [k.key, 0])) as Picks;

type Worn = Record<Category, Kit["items"][number]>;

type AvatarState = {
  photo: string | null;
  setPhoto: (photo: string | null) => void;
  skin: string;
  setSkin: (skin: string) => void;
  pick: Picks;
  setPick: (pick: Picks | ((p: Picks) => Picks)) => void;
  worn: Worn;
};

const AvatarStateContext = createContext<AvatarState | null>(null);

/** avatar state (photo, skin, worn items) lifted above every place that needs to
 * render or edit it — the nav-bar preview, the profile header, and the embedded
 * customization editor all read/write the same state through this. */
export function AvatarProvider({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [skin, setSkin] = useState(BASE_COLORS[0]);
  const [pick, setPick] = useState<Picks>(START_PICK);

  const worn = useMemo(
    () => Object.fromEntries(KITS.map((k) => [k.key, k.items[pick[k.key]]])) as Worn,
    [pick],
  );

  const value = useMemo(
    () => ({ photo, setPhoto, skin, setSkin, pick, setPick, worn }),
    [photo, skin, pick, worn],
  );

  return <AvatarStateContext.Provider value={value}>{children}</AvatarStateContext.Provider>;
}

export function useAvatarState() {
  const ctx = useContext(AvatarStateContext);
  if (!ctx) throw new Error("useAvatarState must be used within an AvatarProvider");
  return ctx;
}

export { START_PICK };
