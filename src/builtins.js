var {BuiltinError} = require('./error');
var fromNow = require('./from-now');
var {
  isString, isNumber, isBool,
  isInteger, isArray, isObject,
  isNull, isFunction,
} = require('./type-utils');

let types = {
  string: isString,
  number: isNumber,
  integer: isInteger,
  boolean: isBool,
  array: isArray,
  object: isObject,
  null: isNull,
  function: isFunction,
  undefined: (val) => typeof val === 'undefined',
};

let builtinError = (builtin) => new BuiltinError(`invalid arguments to ${builtin}`);

module.exports = (context) => {
  let builtins = {};
  let define = (name, context, {
    argumentTests = [],
    minArgs = false,
    variadic = null,
    needsContext = false,
    invoke,
  }) => {
    context[name] = (...args) => {
      let ctx = args.shift();
      if (!variadic && args.length < argumentTests.length) {
        throw builtinError(`builtin: ${name}`, `${args.toString()}, too few arguments`);
      }

      if (minArgs && args.length < minArgs) {
        throw builtinError(`builtin: ${name}: expected at least ${minArgs} arguments`);
      }

      if (variadic) {
        argumentTests = args.map((_, i) => i < argumentTests.length ? argumentTests[i] : variadic);
      }

      args.forEach((arg, i) => {
        if (!argumentTests[i].split('|').some(test => types[test](arg))) {
          throw builtinError(`builtin: ${name}`, `argument ${i + 1} to be ${argumentTests[i]} found ${typeof arg}`);
        }
      });
      if (needsContext)
        return invoke(ctx, ...args);

      return invoke(...args);
    };
    context[name].jsone_builtin = true;

    return context[name];
  };

  // Math functions
  ['max', 'min'].forEach(name => {
    if (Math[name] == undefined) {
      throw new Error(`${name} in Math undefined`);
    }
    define(name, builtins, {
      minArgs: 1,
      variadic: 'number',
      invoke: (...args) => Math[name](...args),
    });
  });

  ['sqrt', 'ceil', 'floor', 'abs'].forEach(name => {
    if (Math[name] == undefined) {
      throw new Error(`${name} in Math undefined`);
    }
    define(name, builtins, {
      argumentTests: ['number'],
      invoke: num => Math[name](num),
    });
  });

  // More math functions
  ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'log10', 'exp', 'round'].forEach(name => {
    if (Math[name] == undefined) {
      throw new Error(`${name} in Math undefined`);
    }
    define(name, builtins, {
      argumentTests: ['number'],
      invoke: num => Math[name](num),
    });
  });

  define('pow', builtins, {
    argumentTests: ['number', 'number'],
    invoke: (base, exponent) => Math.pow(base, exponent),
  });

  define('random', builtins, {
    argumentTests: [],
    invoke: () => Math.random(),
  });

  define('range', builtins, {
    minArgs: 2,
    argumentTests: ['integer', 'integer', 'integer'],
    variadic: 'number',
    invoke: (start, stop, step=1) => {
      return Array.from(
        {length: Math.ceil((stop - start) / step)}, 
        (_, i) => start + i * step
      )
    },
  });

  // String manipulation
  define('lowercase', builtins, {
    argumentTests: ['string'],
    invoke: str => str.toLowerCase(),
  });

  define('uppercase', builtins, {
    argumentTests: ['string'],
    invoke: str => str.toUpperCase(),
  });

  define('str', builtins, {
    argumentTests: ['string|number|boolean|null'],
    invoke: obj => {
      if (obj === null) {
        return 'null';
      }
      return obj.toString();
    },
  });

  define('number', builtins, {
    argumentTests: ['string'],
    invoke: Number,
  });

  define('len', builtins, {
    argumentTests: ['string|array|object'],
    invoke: obj => {
      if (isObject(obj)) {
        return Object.keys(obj).length;
      }
      return Array.from(obj).length;
    },
  });

  define('strip', builtins, {
    argumentTests: ['string'],
    invoke: str => str.trim(),
  });

  define('rstrip', builtins, {
    argumentTests: ['string'],
    invoke: str => str.replace(/\s+$/, ''),
  });

  define('lstrip', builtins, {
    argumentTests: ['string'],
    invoke: str => str.replace(/^\s+/, ''),
  });

  define('split', builtins, {
    minArgs: 2,
    argumentTests: ['string', 'string|number'],
    invoke: (input, delimiter) => input.split(delimiter)
  });

  define('join', builtins, {
    argumentTests: ['array', 'string|number'],
    invoke: (list, separator) => list.join(separator) 
  });

  // New string functions
  define('replace', builtins, {
    argumentTests: ['string', 'string', 'string'],
    invoke: (str, search, replace) => str.replace(new RegExp(search, 'g'), replace),
  });

  define('replaceFirst', builtins, {
    argumentTests: ['string', 'string', 'string'],
    invoke: (str, search, replace) => str.replace(new RegExp(search), replace),
  });

  define('substring', builtins, {
    argumentTests: ['string', 'number', 'number'],
    invoke: (str, start, end) => str.substring(start, end),
  });

  define('startsWith', builtins, {
    argumentTests: ['string', 'string'],
    invoke: (str, prefix) => str.startsWith(prefix),
  });

  define('endsWith', builtins, {
    argumentTests: ['string', 'string'],
    invoke: (str, suffix) => str.endsWith(suffix),
  });

  define('includes', builtins, {
    argumentTests: ['string', 'string'],
    invoke: (str, search) => str.includes(search),
  });

  define('padLeft', builtins, {
    argumentTests: ['string', 'number', 'string'],
    invoke: (str, length, char = ' ') => str.padStart(length, char),
  });

  define('padRight', builtins, {
    argumentTests: ['string', 'number', 'string'],
    invoke: (str, length, char = ' ') => str.padEnd(length, char),
  });

  // Array functions
  define('map', builtins, {
    argumentTests: ['array', 'function'],
    invoke: (arr, fn) => {
      if (fn.jsone_builtin === false) {
        return arr.map(item => fn(item));
      }
      return arr.map(item => fn(null, item));
    },
  });

  define('filter', builtins, {
    argumentTests: ['array', 'function'],
    invoke: (arr, fn) => {
      if (fn.jsone_builtin === false) {
        return arr.filter(item => fn(item));
      }
      return arr.filter(item => fn(null, item));
    },
  });

  define('reduce', builtins, {
    argumentTests: ['array', 'function', 'string|number|boolean|array|object|null'],
    invoke: (arr, fn, initial) => {
      if (fn.jsone_builtin === false) {
        return arr.reduce((acc, item) => fn(acc, item), initial);
      }
      return arr.reduce((acc, item) => fn(null, acc, item), initial);
    },
  });

  define('some', builtins, {
    argumentTests: ['array', 'function'],
    invoke: (arr, fn) => {
      if (fn.jsone_builtin === false) {
        return arr.some(item => fn(item));
      }
      return arr.some(item => fn(null, item));
    },
  });

  define('every', builtins, {
    argumentTests: ['array', 'function'],
    invoke: (arr, fn) => {
      if (fn.jsone_builtin === false) {
        return arr.every(item => fn(item));
      }
      return arr.every(item => fn(null, item));
    },
  });

  define('find', builtins, {
    argumentTests: ['array', 'function'],
    invoke: (arr, fn) => {
      if (fn.jsone_builtin === false) {
        return arr.find(item => fn(item));
      }
      return arr.find(item => fn(null, item));
    },
  });

  define('findIndex', builtins, {
    argumentTests: ['array', 'function'],
    invoke: (arr, fn) => {
      if (fn.jsone_builtin === false) {
        return arr.findIndex(item => fn(item));
      }
      return arr.findIndex(item => fn(null, item));
    },
  });

  define('slice', builtins, {
    argumentTests: ['array', 'number', 'number'],
    invoke: (arr, start, end) => arr.slice(start, end),
  });

  define('flatten', builtins, {
    argumentTests: ['array'],
    invoke: arr => [].concat(...arr),
  });

  define('sort', builtins, {
    argumentTests: ['array'],
    invoke: arr => [...arr].sort(),
  });

  define('sortBy', builtins, {
    argumentTests: ['array', 'function'],
    invoke: (arr, fn) => {
      if (fn.jsone_builtin === false) {
        return [...arr].sort((a, b) => {
          const valA = fn(a);
          const valB = fn(b);
          if (valA < valB) return -1;
          if (valA > valB) return 1;
          return 0;
        });
      }
      return [...arr].sort((a, b) => {
        const valA = fn(null, a);
        const valB = fn(null, b);
        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
      });
    },
  });

  define('reverse', builtins, {
    argumentTests: ['array'],
    invoke: arr => [...arr].reverse(),
  });

  // Object functions
  define('keys', builtins, {
    argumentTests: ['object'],
    invoke: obj => Object.keys(obj),
  });

  define('values', builtins, {
    argumentTests: ['object'],
    invoke: obj => Object.values(obj),
  });

  define('entries', builtins, {
    argumentTests: ['object'],
    invoke: obj => Object.entries(obj).map(([k, v]) => ({key: k, value: v})),
  });

  define('merge', builtins, {
    minArgs: 2,
    argumentTests: ['object', 'object'],
    variadic: 'object',
    invoke: (...objs) => Object.assign({}, ...objs),
  });

  define('hasKey', builtins, {
    argumentTests: ['object', 'string'],
    invoke: (obj, key) => obj.hasOwnProperty(key),
  });

  // Date and time functions
  define('now', builtins, {
    argumentTests: [],
    invoke: () => new Date().toISOString(),
  });

  define('fromNow', builtins, {
    variadic: 'string',
    minArgs: 1,
    needsContext: true,
    invoke: (ctx, str, reference) => fromNow(str, reference || ctx.now),
  });

  define('parseTime', builtins, {
    argumentTests: ['string'],
    invoke: str => new Date(str).getTime(),
  });

  define('formatDate', builtins, {
    argumentTests: ['string', 'string'],
    invoke: (dateStr, format) => {
      const date = new Date(dateStr);
      return format.replace(/yyyy|MM|dd|HH|mm|ss/g, match => {
        switch (match) {
          case 'yyyy': return date.getFullYear().toString();
          case 'MM': return (date.getMonth() + 1).toString().padStart(2, '0');
          case 'dd': return date.getDate().toString().padStart(2, '0');
          case 'HH': return date.getHours().toString().padStart(2, '0');
          case 'mm': return date.getMinutes().toString().padStart(2, '0');
          case 'ss': return date.getSeconds().toString().padStart(2, '0');
          default: return match;
        }
      });
    },
  });

  // Type conversion/checking functions
  define('typeof', builtins, {
    argumentTests: ['string|number|boolean|array|object|null|function'],
    invoke: x => {
      for (let type of ['string', 'number', 'boolean', 'array', 'object', 'function']) {
        if (types[type](x)) {
          return type;
        }
      }
      if (types['null'](x)) {
        return 'null';
      }
      throw builtinError('builtin: typeof', `argument ${x} to be a valid json-e type. found ${typeof arg}`);
    },
  });

  define('defined', builtins, {
    argumentTests: ['string'],
    needsContext: true,
    invoke: (ctx, str) => ctx.hasOwnProperty(str)
  });

  define('boolean', builtins, {
    argumentTests: ['string|number|boolean|array|object|null'],
    invoke: val => Boolean(val),
  });

  define('json', builtins, {
    argumentTests: ['object|array|string|number|boolean|null'],
    invoke: val => JSON.stringify(val),
  });

  define('parseJSON', builtins, {
    argumentTests: ['string'],
    invoke: str => {
      try {
        return JSON.parse(str);
      } catch (e) {
        throw builtinError('builtin: parseJSON', `invalid JSON string: ${e.message}`);
      }
    },
  });

  // Regular expression functions
  define('match', builtins, {
    argumentTests: ['string', 'string'],
    invoke: (str, pattern) => {
      const regex = new RegExp(pattern);
      const match = str.match(regex);
      return match ? match[0] : null;
    },
  });

  define('matchAll', builtins, {
    argumentTests: ['string', 'string'],
    invoke: (str, pattern) => {
      const regex = new RegExp(pattern, 'g');
      const matches = [...str.matchAll(regex)];
      return matches.map(match => match[0]);
    },
  });

  define('test', builtins, {
    argumentTests: ['string', 'string'],
    invoke: (str, pattern) => new RegExp(pattern).test(str),
  });

  // 新增 toArray 函数
  define('toArray', builtins, {
    argumentTests: ['string|number|boolean|array|object|null|undefined'],
    invoke: item => {
      if (isArray(item)) {
        return item;
      }
      if (item === null || item === undefined) {
        return [];
      }
      return [item];
    },
  });

  return Object.assign({}, builtins, context);
};
