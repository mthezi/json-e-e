const assert = require('assert');
const jsone = require('../src/');

suite('新增功能测试', function() {
  suite('新增内置函数测试', function() {
    test('数学函数 - sin, cos, pow, random, range', function() {
      let template = {
        sinVal: { $eval: "sin(0.5)" },
        cosVal: { $eval: "cos(0.5)" },
        powVal: { $eval: "pow(2, 3)" },
        randomVal: { $eval: "random() >= 0 && random() < 1" },
        rangeVal: { $eval: "range(1, 5)" }
      };
      let result = jsone(template, {});
      assert.ok(typeof result.sinVal === 'number');
      assert.ok(typeof result.cosVal === 'number');
      assert.strictEqual(result.powVal, 8);
      assert.strictEqual(result.randomVal, true);
      assert.deepStrictEqual(result.rangeVal, [1, 2, 3, 4]);
    });

    test('字符串函数 - replace, substring, startsWith, endsWith, includes, uppercase, lowercase, split', function() {
      let template = {
        replaceVal: { $eval: "replace('hello world', 'world', 'json-e')" },
        substringVal: { $eval: "substring('hello world', 0, 5)" },
        startsWithVal: { $eval: "startsWith('hello world', 'hello')" },
        endsWithVal: { $eval: "endsWith('hello world', 'world')" },
        includesVal: { $eval: "includes('hello world', 'lo wo')" },
        upperVal: { $eval: "uppercase('hello')" },
        lowerVal: { $eval: "lowercase('WORLD')" },
        splitVal: { $eval: "split('a,b,c', ',')" }
      };
      let result = jsone(template, {});
      assert.strictEqual(result.replaceVal, 'hello json-e');
      assert.strictEqual(result.substringVal, 'hello');
      assert.strictEqual(result.startsWithVal, true);
      assert.strictEqual(result.endsWithVal, true);
      assert.strictEqual(result.includesVal, true);
      assert.strictEqual(result.upperVal, 'HELLO');
      assert.strictEqual(result.lowerVal, 'world');
      assert.deepStrictEqual(result.splitVal, ['a', 'b', 'c']);
    });

    test('数组函数 - flatten, join', function() {
      let template = {
        flattenVal: { $eval: "flatten([[1, 2], [3, 4]])" },
        joinVal: { $eval: "join([1, 2, 3], '-')" }
      };
      let result = jsone(template, {});
      assert.deepStrictEqual(result.flattenVal, [1, 2, 3, 4]);
      assert.strictEqual(result.joinVal, '1-2-3');
    });

    test('对象函数 - keys, values, hasKey', function() {
      let template = {
        keysVal: { $eval: "keys({a: 1, b: 2})" },
        valuesVal: { $eval: "values({a: 1, b: 2})" },
        hasKeyVal: { $eval: "hasKey({a: 1, b: 2}, 'a')" },
        hasNotKeyVal: { $eval: "hasKey({a: 1, b: 2}, 'c')" }
      };
      let result = jsone(template, {});
      assert.deepStrictEqual(result.keysVal, ['a', 'b']);
      assert.deepStrictEqual(result.valuesVal, [1, 2]);
      assert.strictEqual(result.hasKeyVal, true);
      assert.strictEqual(result.hasNotKeyVal, false);
    });

    test('类型转换函数 - boolean, str', function() {
      let template = {
        boolTrue: { $eval: "boolean('true')" },
        boolFalse: { $eval: "boolean(0)" },
        strNum: { $eval: "str(123)" },
        strNull: { $eval: "str(null)" }
      };
      let result = jsone(template, {});
      assert.strictEqual(result.boolTrue, true);
      assert.strictEqual(result.boolFalse, false);
      assert.strictEqual(result.strNum, '123');
      assert.strictEqual(result.strNull, 'null');
    });

    test('正则表达式函数 - match, test', function() {
      let template = {
        matchVal: { $eval: "match('hello world', 'wo.l')" },
        testTrue: { $eval: "test('hello world', '^h.*d$')" },
        testFalse: { $eval: "test('hello world', 'nomatch')" }
      };
      let result = jsone(template, {});
      assert.strictEqual(result.matchVal, 'worl');
      assert.strictEqual(result.testTrue, true);
      assert.strictEqual(result.testFalse, false);
    });

    test('toArray 函数 - 将各种类型转换为数组', function() {
      let template = {
        fromArray: { $eval: "toArray([1, 2])" },
        fromString: { $eval: "toArray('hello')" },
        fromNumber: { $eval: "toArray(123)" },
        fromBoolean: { $eval: "toArray(true)" },
        fromNull: { $eval: "toArray(null)" },
        fromUndefined: { $eval: "toArray(undefined_val)" }, // 测试一个上下文中不存在的变量
        fromObject: { $eval: "toArray({a: 1})" }
      };
      let context = { undefined_val: undefined }; // 显式定义 undefined_val
      let result = jsone(template, context); // 传入 context
      assert.deepStrictEqual(result.fromArray, [1, 2], '已经是数组，应保持不变');
      assert.deepStrictEqual(result.fromString, ['hello'], '字符串应包装在数组中');
      assert.deepStrictEqual(result.fromNumber, [123], '数字应包装在数组中');
      assert.deepStrictEqual(result.fromBoolean, [true], '布尔值应包装在数组中');
      assert.deepStrictEqual(result.fromNull, [], 'null 应转换为空数组');
      assert.deepStrictEqual(result.fromUndefined, [], 'undefined 应转换为空数组');
      assert.deepStrictEqual(result.fromObject, [{a: 1}], '对象应包装在数组中');
    });
  });

  suite('Lambda (箭头函数) 测试', function() {
    test('单参数 Lambda - map', function() {
      let template = {
        result: { $eval: "map([1, 2, 3], x => x * 2)" }
      };
      let result = jsone(template, {});
      assert.deepStrictEqual(result.result, [2, 4, 6]);
    });

    test('多参数 Lambda - reduce', function() {
      let template = {
        result: { $eval: "reduce([1, 2, 3], (acc, x) => acc + x, 0)" }
      };
      let result = jsone(template, {});
      assert.strictEqual(result.result, 6);
    });

    test('Lambda 与 % 运算符 - filter', function() {
      let template = {
        result: { $eval: "filter([1, 2, 3, 4, 5], x => x % 2 == 0)" }
      };
      let result = jsone(template, {});
      assert.deepStrictEqual(result.result, [2, 4]);
    });

    test('Lambda - every', function() {
      let template = {
        allPositive: { $eval: "every([1, 2, 3], x => x > 0)" },
        notAllPositive: { $eval: "every([-1, 2, 3], x => x > 0)" }
      };
      let result = jsone(template, {});
      assert.strictEqual(result.allPositive, true);
      assert.strictEqual(result.notAllPositive, false);
    });

    test('Lambda - some', function() {
      let template = {
        somePositive: { $eval: "some([-1, -2, 3], x => x > 0)" },
        nonePositive: { $eval: "some([-1, -2, -3], x => x > 0)" }
      };
      let result = jsone(template, {});
      assert.strictEqual(result.somePositive, true);
      assert.strictEqual(result.nonePositive, false);
    });

    test('Lambda - find', function() {
      let template = {
        findVal: { $eval: "find([1, 5, 10], x => x > 3)" },
        findNoVal: { $eval: "find([1, 2, 3], x => x > 3)" }
      };
      let result = jsone(template, {});
      assert.strictEqual(result.findVal, 5);
      assert.strictEqual(result.findNoVal, undefined); // find 在找不到时返回 undefined
    });

    test('Lambda - sortBy', function() {
      let template = {
        result: { $eval: "sortBy([-2, 1, -5, 3], x => x * x)" } // 按平方排序，结果应为 1, -2, 3, -5
      };
      let result = jsone(template, {});
      // 注意：默认的 sort 是不稳定的，对于平方相同的值，顺序可能不同，但我们期望值是按平方排序的
      // 例如，1^2=1, (-2)^2=4, 3^2=9, (-5)^2=25。所以排序后应该是 [1, -2, 3, -5] 或者 [1, -2, -5, 3] 等。
      // 为了简化测试，我们检查排序后的平方值是否正确。
      const squaredSorted = result.result.map(x => x*x);
      assert.deepStrictEqual(squaredSorted, [1, 4, 9, 25]);
    });
  });
}); 