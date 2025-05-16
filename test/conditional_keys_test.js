const assert = require('assert');
const jsone = require('../src/');

suite('Conditional Keys', function() {
  test('条件键 - 值不为空，保留键', function() {
    let template = {
      "normalKey": "normalValue",
      "?conditionalKey": "hasValue",
      "anotherKey": "anotherValue"
    };
    
    let result = jsone(template, {});
    assert.deepEqual(result, {
      normalKey: "normalValue",
      conditionalKey: "hasValue",
      anotherKey: "anotherValue"
    });
    assert.equal(Object.keys(result).length, 3);
  });

  test('条件键 - 值为空，删除键', function() {
    let template = {
      "normalKey": "normalValue",
      "?conditionalKey": null,
      "anotherKey": "anotherValue"
    };
    
    let result = jsone(template, {});
    assert.deepEqual(result, {
      normalKey: "normalValue",
      anotherKey: "anotherValue"
    });
    assert.equal(Object.keys(result).length, 2);
  });

  test('条件键 - 值为空字符串，删除键', function() {
    let template = {
      "normalKey": "normalValue",
      "?conditionalKey": "",
      "anotherKey": "anotherValue"
    };
    
    let result = jsone(template, {});
    assert.deepEqual(result, {
      normalKey: "normalValue",
      anotherKey: "anotherValue"
    });
  });

  test('条件键 - 值为空数组，删除键', function() {
    let template = {
      "normalKey": "normalValue",
      "?conditionalKey": [],
      "anotherKey": "anotherValue"
    };
    
    let result = jsone(template, {});
    assert.deepEqual(result, {
      normalKey: "normalValue",
      anotherKey: "anotherValue"
    });
  });

  test('条件键 - 值为空对象，删除键', function() {
    let template = {
      "normalKey": "normalValue",
      "?conditionalKey": {},
      "anotherKey": "anotherValue"
    };
    
    let result = jsone(template, {});
    assert.deepEqual(result, {
      normalKey: "normalValue",
      anotherKey: "anotherValue"
    });
  });

  test('条件键 - 插值后的键名', function() {
    let template = {
      "normalKey": "normalValue",
      "?${dynamicKey}": "hasValue",
      "anotherKey": "anotherValue"
    };
    
    let context = {
      dynamicKey: "conditionalKey"
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      normalKey: "normalValue",
      conditionalKey: "hasValue",
      anotherKey: "anotherValue"
    });
  });

  test('条件键 - 嵌套对象', function() {
    let template = {
      "outer": {
        "?emptyValue": null,
        "nonEmptyValue": "value"
      }
    };
    
    let result = jsone(template, {});
    assert.deepEqual(result, {
      outer: {
        nonEmptyValue: "value"
      }
    });
  });

  test('len 函数支持对象类型', function() {
    let template = {
      "emptyObject": { $eval: "len({})" },
      "objectWithOneKey": { $eval: "len({key: 'value'})" },
      "objectWithMultipleKeys": { $eval: "len({a: 1, b: 2, c: 3})" }
    };
    
    let result = jsone(template, {});
    assert.deepEqual(result, {
      emptyObject: 0,
      objectWithOneKey: 1,
      objectWithMultipleKeys: 3
    });
  });
}); 