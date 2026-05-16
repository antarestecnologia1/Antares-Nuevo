import { Transform } from "class-transformer";

/** Elimina NULs (riesgo de truncamiento en PG) y recorta espacios en cadenas de entrada. */
export function TransformStripNulTrim() {
  return Transform(({ value }) => {
    if (typeof value !== "string") return value;
    return value.replace(/\u0000/g, "").trim();
  });
}
