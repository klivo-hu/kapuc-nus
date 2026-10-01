import { z, ZodIssueCode, type ZodErrorMap } from 'zod';

/**
 * Hungarian messages for zod's built-in checks. Validation errors are shown to the café's staff
 * in the admin, so they are written for them rather than for developers. Installed once, on
 * import, by the schema modules.
 */
const hungarian: ZodErrorMap = (issue, context) => {
  switch (issue.code) {
    case ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return {
          message:
            issue.minimum === 1
              ? 'Ez a mező nem lehet üres.'
              : `Legalább ${issue.minimum} karakter legyen.`,
        };
      }
      if (issue.type === 'array') return { message: `Legalább ${issue.minimum} elem kell.` };
      return { message: `Legalább ${issue.minimum} legyen.` };
    case ZodIssueCode.too_big:
      if (issue.type === 'string')
        return { message: `Legfeljebb ${issue.maximum} karakter lehet.` };
      if (issue.type === 'array') return { message: `Legfeljebb ${issue.maximum} elem lehet.` };
      return { message: `Legfeljebb ${issue.maximum} lehet.` };
    case ZodIssueCode.invalid_type:
      return { message: issue.expected === 'number' ? 'Számot adj meg.' : 'Érvénytelen érték.' };
    case ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return { message: 'Érvényes e-mail címet adj meg.' };
      if (issue.validation === 'regex') return { message: 'A formátum nem megfelelő.' };
      return { message: 'Érvénytelen szöveg.' };
    case ZodIssueCode.invalid_enum_value:
      return { message: 'Válassz a felsoroltak közül.' };
    default:
      return { message: context.defaultError };
  }
};

z.setErrorMap(hungarian);

export { z };
