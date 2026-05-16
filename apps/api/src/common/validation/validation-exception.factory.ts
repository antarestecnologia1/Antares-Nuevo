import { BadRequestException, ValidationError } from "@nestjs/common";

/** Mensajes en español para las claves típicas de class-validator (el texto en inglés se ignora). */
const CONSTRAINT_ES: Record<string, string> = {
  isEmail: "Ingrese un correo electrónico válido.",
  isNotEmpty: "Este campo es obligatorio.",
  minLength: "El texto es demasiado corto para este campo.",
  maxLength: "El texto supera el tamaño máximo permitido.",
  isString: "Este campo debe ser texto.",
  isNumber: "Este campo debe ser numérico.",
  isBoolean: "Este campo debe ser sí o no.",
  isIn: "El valor seleccionado no es una opción permitida.",
  isOptional: "Valor opcional no válido.",
  matches: "El formato del valor no es válido.",
  min: "El valor es menor al mínimo permitido.",
  max: "El valor es mayor al máximo permitido.",
  isInt: "Debe ser un número entero.",
  isPositive: "Debe ser un número positivo.",
  isUuid: "El identificador no tiene un formato válido.",
  whitelistValidation: "Se enviaron campos no permitidos en esta solicitud.",
  forbidNonWhitelisted: "Se enviaron campos no permitidos en esta solicitud."
};

function flattenErrors(errors: ValidationError[], parent = ""): string[] {
  const out: string[] = [];
  for (const err of errors) {
    const path = parent ? `${parent}.${err.property}` : err.property;
    if (err.constraints) {
      for (const [key, rawMsg] of Object.entries(err.constraints)) {
        const friendly = CONSTRAINT_ES[key];
        out.push(friendly || rawMsg || `Campo no válido (${path}).`);
      }
    }
    if (err.children?.length) {
      out.push(...flattenErrors(err.children, path));
    }
  }
  return out;
}

/**
 * Respuesta 400 homogénea y legible para el portal (mensajes en español cuando es posible).
 */
export function antaresValidationExceptionFactory(errors: ValidationError[]) {
  const messages = flattenErrors(errors);
  return new BadRequestException(messages.length ? messages : ["Los datos enviados no son válidos. Revise el formulario e intente nuevamente."]);
}
