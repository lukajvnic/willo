// Imports every avatar item PNG (background already removed) and its size.

import head_cap from "../assets/avatar-items/head/cap.png";
import head_cat_ears from "../assets/avatar-items/head/cat_ears.png";
import head_top_hat from "../assets/avatar-items/head/top_hat.png";
import head_straw_hat from "../assets/avatar-items/head/straw_hat.png";
import shirt_mclovin_tee from "../assets/avatar-items/shirt/mclovin_tee.png";
import shirt_rick_tee from "../assets/avatar-items/shirt/rick_tee.png";

export type RasterAsset = { src: string; w: number; h: number };

export const HEAD_ASSETS: Record<string, RasterAsset> = {
  cap: { src: head_cap, w: 708, h: 315 },
  cat_ears: { src: head_cat_ears, w: 684, h: 344 },
  top_hat: { src: head_top_hat, w: 449, h: 361 },
  straw_hat: { src: head_straw_hat, w: 770, h: 408 },
};

export const SHIRT_ASSETS: Record<string, RasterAsset> = {
  mclovin_tee: { src: shirt_mclovin_tee, w: 429, h: 260 },
  rick_tee: { src: shirt_rick_tee, w: 360, h: 231 },
};
