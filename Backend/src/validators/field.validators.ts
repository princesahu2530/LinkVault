import { FieldType, ITEM_LIMITS } from '../types/item.types.js';
import { ValidationError } from '../utils/errors.js';

export function sanitizeUrl(urlStr: string): string {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  if (!trimmed) return '';

  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    throw new ValidationError('Disallowed URL scheme detected.');
  }

  const isHttpOrHttps = /^https?:\/\//i.test(trimmed);
  if (!isHttpOrHttps) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function validateJsonDepth(obj: any, currentDepth = 1, maxDepth = ITEM_LIMITS.MAX_JSON_DEPTH): boolean {
  if (currentDepth > maxDepth) return false;
  if (obj !== null && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (!validateJsonDepth(obj[key], currentDepth + 1, maxDepth)) {
        return false;
      }
    }
  }
  return true;
}

export function validateAndSanitizeFieldValue(
  type: FieldType,
  value: any,
  options?: string[],
  required?: boolean,
  extraConfig?: { maxRating?: number; currencyCode?: string }
): any {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`This field is required.`);
    }
    return type === 'boolean' ? false : type === 'multiSelect' || type === 'relation' ? [] : '';
  }

  switch (type) {
    case 'text': {
      const str = String(value).trim();
      if (str.length > ITEM_LIMITS.MAX_TEXT_LENGTH) {
        throw new ValidationError(`Text field exceeds maximum length of ${ITEM_LIMITS.MAX_TEXT_LENGTH} chars.`);
      }
      return str;
    }

    case 'longText': {
      const str = String(value);
      if (str.length > ITEM_LIMITS.MAX_LONG_TEXT_LENGTH) {
        throw new ValidationError(`Long text field exceeds maximum length of ${ITEM_LIMITS.MAX_LONG_TEXT_LENGTH} chars.`);
      }
      return str;
    }

    case 'url': {
      if (typeof value !== 'string') throw new ValidationError('URL must be a string');
      return sanitizeUrl(value);
    }

    case 'email': {
      const str = String(value).trim();
      if (!str) return '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(str)) {
        throw new ValidationError(`Invalid email format: "${str}"`);
      }
      return str;
    }

    case 'phone': {
      const str = String(value).trim();
      if (!str) return '';
      // Allow phone characters: +, digits, spaces, hyphens, brackets, dots
      const clean = str.replace(/[^\d+()\s.-]/g, '');
      if (clean.length < 5 || clean.length > 25) {
        throw new ValidationError(`Invalid phone number: "${str}"`);
      }
      return clean;
    }

    case 'currency': {
      if (typeof value === 'object' && value !== null) {
        const amt = Number(value.amount);
        if (isNaN(amt)) throw new ValidationError('Invalid currency amount');
        return {
          amount: amt,
          currency: String(value.currency || extraConfig?.currencyCode || 'USD').toUpperCase().slice(0, 5)
        };
      }
      const num = Number(value);
      if (isNaN(num)) throw new ValidationError(`Value "${value}" is not a valid currency amount.`);
      return {
        amount: num,
        currency: (extraConfig?.currencyCode || 'USD').toUpperCase()
      };
    }

    case 'rating': {
      const max = extraConfig?.maxRating || 5;
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > max) {
        throw new ValidationError(`Rating must be a number between 0 and ${max}.`);
      }
      return num;
    }

    case 'number': {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      const num = Number(value);
      if (isNaN(num)) {
        throw new ValidationError(`Value "${value}" is not a valid number.`);
      }
      return num;
    }

    case 'date': {
      const d = new Date(value);
      if (isNaN(d.getTime())) {
        throw new ValidationError(`Invalid date value "${value}". Must be a valid date.`);
      }
      return typeof value === 'string' ? value : d.toISOString();
    }

    case 'boolean': {
      return Boolean(value);
    }

    case 'select': {
      const str = String(value).trim();
      if (options && options.length > 0 && str) {
        if (!options.includes(str)) {
          throw new ValidationError(`Value "${str}" is not one of the allowed options: ${options.join(', ')}`);
        }
      }
      return str;
    }

    case 'multiSelect': {
      let arr: string[] = [];
      if (Array.isArray(value)) {
        arr = value.map(v => String(v).trim()).filter(Boolean);
      } else if (typeof value === 'string') {
        arr = value.split(',').map(v => v.trim()).filter(Boolean);
      }
      if (options && options.length > 0) {
        for (const item of arr) {
          if (!options.includes(item)) {
            throw new ValidationError(`Option "${item}" is not in allowed options.`);
          }
        }
      }
      return arr;
    }

    case 'relation': {
      if (Array.isArray(value)) {
        return value.map(v => (typeof v === 'object' ? v.id || v._id : String(v)));
      }
      if (typeof value === 'object' && value !== null) {
        return value.id || value._id || '';
      }
      return String(value);
    }

    case 'user': {
      if (typeof value === 'object' && value !== null) {
        return {
          userId: value.userId || value.id || value._id || '',
          name: value.name || '',
          email: value.email || ''
        };
      }
      return String(value);
    }

    case 'code': {
      if (typeof value === 'object' && value !== null) {
        return {
          code: String(value.code || ''),
          language: String(value.language || 'javascript').slice(0, 50)
        };
      }
      return {
        code: String(value),
        language: 'javascript'
      };
    }

    case 'markdown': {
      const str = String(value);
      if (str.length > ITEM_LIMITS.MAX_LONG_TEXT_LENGTH) {
        throw new ValidationError(`Markdown exceeds maximum length.`);
      }
      return str;
    }

    case 'json': {
      let parsedObj: any;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return '{}';
        try {
          parsedObj = JSON.parse(trimmed);
        } catch (err) {
          throw new ValidationError('Invalid JSON string provided.');
        }
      } else if (typeof value === 'object' && value !== null) {
        parsedObj = value;
      } else {
        throw new ValidationError('Invalid JSON payload.');
      }

      if (!validateJsonDepth(parsedObj, 1, ITEM_LIMITS.MAX_JSON_DEPTH)) {
        throw new ValidationError(`JSON structure exceeds maximum nesting depth of ${ITEM_LIMITS.MAX_JSON_DEPTH}.`);
      }

      return typeof value === 'string' ? value : JSON.stringify(parsedObj, null, 2);
    }

    default:
      return String(value);
  }
}
