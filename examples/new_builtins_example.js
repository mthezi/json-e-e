/* eslint-env node */
/* global console */

const jsone = require('../src');

// 示例模板
const template = {
  title: "内置函数示例",
  
  // 基本数学函数
  math: {
    sin: {$eval: "sin(0.5)"},
    cos: {$eval: "cos(0.5)"},
    pow: {$eval: "pow(2, 3)"},
    range: {$eval: "range(1, 5)"},
    max: {$eval: "max(1, 3, 5, 2)"},
    min: {$eval: "min(5, 2, 7, 1)"}
  },
  
  // 字符串函数
  string: {
    replace: {$eval: "replace('hello world', 'world', 'json-e')"},
    substring: {$eval: "substring('hello world', 0, 5)"},
    startsWith: {$eval: "startsWith('hello world', 'hello')"},
    endsWith: {$eval: "endsWith('hello world', 'world')"},
    includes: {$eval: "includes('hello world', 'lo wo')"},
    uppercase: {$eval: "uppercase('hello')"},
    lowercase: {$eval: "lowercase('WORLD')"},
    split: {$eval: "split('a,b,c', ',')"}
  },
  
  // 基本数组函数
  array: {
    original: [1, 2, 3, 4, 5],
    flatten: {$eval: "flatten([[1, 2], [3, 4]])"},
    join: {$eval: "join([1, 2, 3], '-')"}
  },
  
  // 对象函数
  object: {
    original: {a: 1, b: 2, c: 3},
    keys: {$eval: "keys({a: 1, b: 2, c: 3})"},
    values: {$eval: "values({a: 1, b: 2, c: 3})"},
    hasKey: {$eval: "hasKey({a: 1, b: 2}, 'a')"}
  },
  
  // 类型转换函数
  typeConversion: {
    boolean: {$eval: "boolean('true')"},
    str: {$eval: "str(123)"}
  },
  
  // 正则表达式函数
  regex: {
    match: {$eval: "match('hello world', 'wo.l')"},
    test: {$eval: "test('hello world', '^h.*d$')"}
  }
};

// 执行模板
try {
  const result = jsone(template, {});
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('错误:', err.toString());
} 