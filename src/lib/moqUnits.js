export const MOQ_UNIT_OPTIONS = [
  { value: "Kilogram", label: "Kg" },
  { value: "Grams", label: "Gram" },
  { value: "Metric Tons", label: "Metric Ton" },
  { value: "Ton/Tons", label: "Ton" },
  { value: "Piece", label: "Piece" },
  { value: "Pieces", label: "Pieces" },
  { value: "Unit/Units", label: "Unit" },
  { value: "Watt", label: "Watt" },
  { value: "Dozen", label: "Dozen" },
  { value: "Pairs", label: "Pair" },
  { value: "Set/Sets", label: "Set" },
  { value: "Box/Boxes", label: "Box" },
  { value: "Carton/Cartons", label: "Carton" },
  { value: "Bag/Bags", label: "Bag" },
  { value: "Roll/Rolls", label: "Roll" },
  { value: "Sheet/Sheets", label: "Sheet" },
  { value: "Meter/Meters", label: "Meter" },
  { value: "Centimeter", label: "Centimeter" },
  { value: "Inch/Inches", label: "Inch" },
  { value: "Square Feet", label: "Sq. Ft" },
  { value: "Square Meter", label: "Sq. Mtr" },
  { value: "Cubic Feet", label: "Cu. Ft" },
  { value: "Cubic Meter", label: "Cu. Mtr" },
  { value: "Liter/Liters", label: "Liter" },
  { value: "Milliliter", label: "Milliliter" },
  { value: "Gallon/Gallons", label: "Gallon" },
  { value: "Barrel/Barrels", label: "Barrel" },
  { value: "Pack", label: "Pack" },
  { value: "Pouch", label: "Pouch" },
  { value: "Bottle", label: "Bottle" },
];

const LEGACY_MOQ_UNIT_ALIASES = {
  "Piece/Pieces": "Pieces",
  Milliliters: "Milliliter",
  Kg: "Kilogram",
};

const VALID_VALUES = new Set(MOQ_UNIT_OPTIONS.map((o) => o.value));

/** Map stored DB values to a valid select option (handles legacy edit-form values). */
export function normalizeMoqUnit(unit) {
  if (!unit || typeof unit !== "string") return "";
  const trimmed = unit.trim();
  if (!trimmed) return "";
  if (LEGACY_MOQ_UNIT_ALIASES[trimmed]) return LEGACY_MOQ_UNIT_ALIASES[trimmed];
  if (VALID_VALUES.has(trimmed)) return trimmed;
  return trimmed;
}
