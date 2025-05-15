const assert = require('assert');
const jsone = require('../src/');

suite('可选链操作符测试', function() {
  // 定义测试上下文
  const context = {
    data: {
      user: {
        name: "张三",
        age: 30
      }
    }
  };

  test('点操作符 - 属性存在', function() {
    let template = {
      result: { $eval: "data.user.name" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "张三"
    });
  });

  test('点操作符 - 属性不存在时抛出错误', function() {
    let template = {
      result: { $eval: "data.user.address" }
    };
    
    assert.throws(() => {
      jsone(template, context);
    }, /object has no property "address"/);
  });

  test('点操作符 - 对象不存在时抛出错误', function() {
    let template = {
      result: { $eval: "data.profile.address" }
    };
    
    assert.throws(() => {
      jsone(template, context);
    }, /object has no property "profile"/);
  });

  test('可选链操作符 - 属性存在', function() {
    let template = {
      result: { $eval: "data?.user?.name" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "张三"
    });
  });

  test('可选链操作符 - 属性不存在时返回null', function() {
    let template = {
      result: { $eval: "data?.user?.address" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });

  test('可选链操作符 - 对象不存在时返回null', function() {
    let template = {
      result: { $eval: "data?.profile?.address" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });

  test('链式调用中的可选链操作符 - 中断链式调用', function() {
    let template = {
      result: { $eval: "data?.profile.address" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });

  test('链式调用中的可选链操作符 - 多个可选链', function() {
    let template = {
      result: { $eval: "missing?.user?.name" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });

  test('可选链操作符与方法调用', function() {
    const contextWithMethod = {
      data: {
        user: {
          getName: function() {
            return "张三";
          }
        }
      }
    };

    let template = {
      result: { $eval: "data?.user?.getName()" }
    };
    
    let result = jsone(template, contextWithMethod);
    assert.deepEqual(result, {
      result: "张三"
    });
  });

  test('可选链操作符与方法调用 - 方法不存在时返回null', function() {
    let template = {
      result: { $eval: "data?.user?.getAddress()" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });

  test('可选链操作符与数组访问', function() {
    const contextWithArray = {
      data: {
        users: [
          { name: "张三" },
          { name: "李四" }
        ]
      }
    };

    let template = {
      result: { $eval: "data?.users[0].name" }
    };
    
    let result = jsone(template, contextWithArray);
    assert.deepEqual(result, {
      result: "张三"
    });
  });

  test('可选链操作符与数组访问 - 数组不存在时返回null', function() {
    let template = {
      result: { $eval: "data?.friends" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });
});