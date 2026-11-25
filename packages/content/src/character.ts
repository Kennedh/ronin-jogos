/** Original vector layers for the shared Runner rig. First entry in each slot is its fallback. */
export const CHARACTER_RIG = "rr-rig-2";
export const CATALOG_VERSION = "rr-appearance-1";
export const slotNames = {
  body_palette: ["Tom de pele", "Skin tone"],
  hair_style: ["Penteado", "Hairstyle"],
  hair_color: ["Cor do cabelo", "Hair pigment"],
  eye_style: ["Olhar", "Eyes"],
  face_detail: ["Detalhe do rosto", "Face detail"],
  outfit_id: ["Roupa", "Outfit"],
  head_accessory_id: ["Acessório", "Accessory"],
  katana_visual_id: ["Katana", "Katana"],
  slash_effect_id: ["Rastro da katana", "Blade trail"],
  profile_emblem_id: ["Emblema de perfil", "Profile emblem"],
} as const;
export type Slot = keyof typeof slotNames;
export const characterSlots = Object.keys(slotNames) as Slot[];
export type Appearance = Record<Slot, string>;
export type Part = {
  part_id: string;
  slot: Slot;
  rig_version: string;
  asset_id: string;
  is_basic_free: boolean;
  unlock_requirement_id: string | null;
  labels: { "pt-BR": string; en: string };
};
function group(
  slot: Slot,
  entries: readonly (readonly [string, string, string, string?])[],
): Part[] {
  return entries.map(([part_id, pt, en, requirement]) => ({
    part_id,
    slot,
    rig_version: CHARACTER_RIG,
    asset_id: part_id,
    labels: { "pt-BR": pt, en },
    is_basic_free: requirement === undefined,
    unlock_requirement_id: requirement ?? null,
  }));
}
export const characterParts = [
  ...group("body_palette", [
    ["skin_ochre", "Ocre", "Ochre"],
    ["skin_porcelain", "Porcelana", "Porcelain"],
    ["skin_sand", "Areia", "Sand"],
    ["skin_honey", "Mel", "Honey"],
    ["skin_amber", "Âmbar", "Amber"],
    ["skin_copper", "Cobre", "Copper"],
    ["skin_umber", "Terra", "Umber"],
    ["skin_ebony", "Ébano", "Ebony"],
  ]),
  ...group("hair_style", [
    ["hair_tied", "Preso", "Tied back"],
    ["hair_short", "Curto", "Short"],
    ["hair_ponytail", "Rabo de cavalo", "Ponytail"],
    ["hair_bun", "Coque", "Topknot"],
    ["hair_shaved", "Raspado", "Shaved"],
  ]),
  ...group("hair_color", [
    ["dye_ink", "Tinta preta", "Ink black"],
    ["dye_chestnut", "Castanho", "Chestnut"],
    ["dye_rust", "Ferrugem", "Russet"],
    ["dye_ash", "Cinza", "Ash"],
    ["dye_indigo", "Índigo", "Indigo"],
    ["dye_silver", "Prata", "Silver"],
  ]),
  ...group("eye_style", [
    ["eyes_calm", "Sereno", "Calm"],
    ["eyes_focused", "Atento", "Focused"],
    ["eyes_arched", "Arqueado", "Arched"],
    ["eyes_level", "Reto", "Level"],
  ]),
  ...group("face_detail", [
    ["face_plain", "Sem detalhe", "Plain"],
    ["face_scar", "Cicatriz", "Scar"],
    ["face_freckles", "Sardas", "Freckles"],
    ["face_paint", "Pincelada", "Brushstroke"],
    ["face_beard", "Barba", "Beard"],
  ]),
  ...group("outfit_id", [
    ["robe_moss", "Ronin Errante · musgo", "Wandering Ronin · moss"],
    ["robe_blue", "Ronin Errante · anil", "Wandering Ronin · indigo"],
    ["robe_clay", "Ronin Errante · argila", "Wandering Ronin · clay"],
  ]),
  ...group("head_accessory_id", [
    ["hat_straw", "Chapéu de palha", "Straw hat"],
    ["head_bare", "Sem acessório", "None"],
    ["head_band", "Faixa de tecido", "Cloth headband"],
  ]),
  ...group("katana_visual_id", [
    ["sword_iron", "Ferro", "Iron"],
    ["sword_jade", "Jade", "Jade"],
    ["sword_brass", "Latão", "Brass"],
  ]),
  ...group("slash_effect_id", [
    ["trail_ink", "Tinta", "Ink"],
    ["trail_aurora", "Traço da Aurora", "Aurora Trail", "AURORA_TRAIL"],
  ]),
  ...group("profile_emblem_id", [
    ["emblem_plain", "Sem emblema", "None"],
    ["seal_bamboo", "Selo do bambu", "Bamboo seal", "B01"],
    ["seal_temple", "Selo do templo", "Temple seal", "B02"],
    ["seal_mountains", "Selo da montanha", "Mountain seal", "B03"],
    ["seal_castle", "Selo do castelo", "Castle seal", "B04"],
  ]),
];
export const partsById = new Map(
  characterParts.map((part) => [part.part_id, part]),
);
export const defaultAppearance = Object.freeze(
  Object.fromEntries(
    characterSlots.map((slot) => [
      slot,
      characterParts.find((part) => part.slot === slot)!.part_id,
    ]),
  ) as Appearance,
);
export function resolveAppearance(
  values: Readonly<Record<string, string>>,
): Appearance {
  const result = { ...defaultAppearance };
  for (const slot of characterSlots) {
    const part = partsById.get(values[slot] ?? "");
    if (part?.slot === slot && part.rig_version === CHARACTER_RIG)
      result[slot] = part.part_id;
  }
  return result;
}
