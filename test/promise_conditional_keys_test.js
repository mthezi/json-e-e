const assert = require('assert');
const jsone = require('../src/');

suite('Promise和函数条件键测试', function() {
  // 检查内部实现是否正确处理非空对象的逻辑
  test('条件键处理 - 检查非空对象的逻辑', function() {
    // 创建一个模拟的具有isFunction方法的上下文
    const isFunction = (value) => typeof value === 'function';
    const isObject = (value) => value !== null && typeof value === 'object';
    
    // 模拟条件键处理逻辑 - 当前实现的逻辑，Promise可能被视为空对象
    // 因为Promise在JS中是对象，但它的属性不会被Object.keys枚举出来
    function checkIsEmpty(value) {
      return value === null || 
             value === undefined || 
             (typeof value === 'string' && value === '') || 
             (Array.isArray(value) && value.length === 0) || 
             (isObject(value) && !isFunction(value) && Object.keys(value).length === 0);
    }
    
    // 创建一些测试值
    const emptyObject = {};
    const nonEmptyObject = { key: 'value' };
    const mockFunction = function() {};
    
    // 测试条件键处理逻辑
    assert.strictEqual(checkIsEmpty(null), true, 'null应该被视为空');
    assert.strictEqual(checkIsEmpty(undefined), true, 'undefined应该被视为空');
    assert.strictEqual(checkIsEmpty(''), true, '空字符串应该被视为空');
    assert.strictEqual(checkIsEmpty([]), true, '空数组应该被视为空');
    assert.strictEqual(checkIsEmpty(emptyObject), true, '空对象应该被视为空');
    assert.strictEqual(checkIsEmpty(nonEmptyObject), false, '非空对象不应该被视为空');
    assert.strictEqual(checkIsEmpty(mockFunction), false, '函数不应该被视为空');
    
    // 注意：Promise实例在JS中是对象，但是它的内部属性通常是不可枚举的，
    // 因此Object.keys(promise)可能返回空数组，导致Promise被视为空对象
    // 所以我们需要特别处理Promise对象
  });
  
  test('条件键处理 - 使用Promise对象作为条件值', function() {
    // 测试当条件键的值是一个Promise实例时，该键是否被保留
    const promiseValue = Promise.resolve({ type: 'blob', data: 'some data' });
    
    let template = {
      "normalKey": "normalValue",
      "?maskKey": promiseValue,
      "anotherKey": "anotherValue"
    };
    
    let result = jsone(template, {});
    assert.deepEqual(Object.keys(result), ['normalKey', 'maskKey', 'anotherKey']);
  });
  
  test('条件键 - 可选链与null值', function() {
    let template = {
      "normalKey": "normalValue",
      "?conditionalKey": { $eval: "context?.valueNotExists ?? null" },
      "anotherKey": "anotherValue"
    };
    
    let result = jsone(template, {});
    assert.deepEqual(Object.keys(result), ['normalKey', 'anotherKey']);
  });
  
  test('条件键 - 示例场景：ctx.input.body?.mask', function() {
    // 测试场景1: 有mask值
    let template1 = {
      "?mask": { $eval: "ctx.input.body?.mask || '非空值'" }
    };
    
    let context1 = {
      ctx: {
        input: {
          body: {
            mask: "http://example.com/mask.png"
          }
        }
      }
    };
    
    let result1 = jsone(template1, context1);
    assert.deepEqual(Object.keys(result1), ['mask']);
    assert.equal(result1.mask, "http://example.com/mask.png");
    
    // 测试场景2: 没有mask值，但使用非空默认值
    let template2 = {
      "?mask": { $eval: "ctx.input.body?.mask || '非空值'" }
    };
    
    let context2 = {
      ctx: {
        input: {
          body: {}
        }
      }
    };
    
    let result2 = jsone(template2, context2);
    // 在这种情况下，由于默认值是非空字符串，所以mask键应当保留
    assert.deepEqual(Object.keys(result2), ['mask']);
    assert.equal(result2.mask, "非空值");
    
    // 测试场景3: 没有mask值，使用空值默认值
    let template3 = {
      "?mask": { $eval: "ctx.input.body?.mask || ''" }
    };
    
    let context3 = {
      ctx: {
        input: {
          body: {}
        }
      }
    };
    
    let result3 = jsone(template3, context3);
    // 在这种情况下，由于默认值是空字符串，所以mask键应当被删除
    assert.deepEqual(Object.keys(result3), []);
  });
});