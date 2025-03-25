const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  PREFIXE: process.env.PREFIXE || "",
  NOM_OWNER: process.env.NOM_OWNER || "Ainz",
  NUMERO_OWNER: process.env.NUMERO_OWNER || "",
  MODE: process.env.MODE || "public",
  MENU: process.env.MENU || "https://i.ibb.co/ynx9QcZ/image.jpg",
  SESSION_ID: process.env.SESSION_ID || "ovl",
  LEVEL_UP: process.env.LEVEL_UP || "non",
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "Wa-sticker",
  STICKER_AUTHOR_NAME: process.env.STICKER_AUTHOR_NAME || "OVL-MD",
  DATABASE: process.env.DATABASE || "postgresql://postgres.qnjvgxwyncnsbpfxwrbq:ovlmdmdpasse@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
  ANTIDELETE: process.env.ANTIDELETE || "non",
  RENDER_API_KEY: process.env.RENDER_API_KEY,
  PRESENCE: process.env.PRESENCE || "off",
  LIKE_STATUS: process.env.LIKE_STATUS || "off",
  ANTI_VUE_UNIQUE: process.env.ANTI_VUE_UNIQUE || "off", 
  DL_STATUS: process.env.DL_STATUS || "off",
  LECTURE_STATUS: process.env.LECTURE_STATUS || "off",
};
