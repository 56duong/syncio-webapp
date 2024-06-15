import { Sticker } from "./sticker";

export interface StickerGroup {
  id?: number;
  name?: string;
  createdDate?: string;
  flag?: boolean;
  createdBy?: string;
  stickers?: Sticker[];
}
