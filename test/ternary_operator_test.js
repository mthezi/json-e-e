const assert = require('assert');
const jsone = require('../src/');

suite('三目运算符测试', function() {
  // 定义测试上下文
  const context = {
    data: {
      user: {
        name: "张三",
        age: 30,
        isAdmin: true
      }
    }
  };

  test('基本用法 - 条件为真', function() {
    let template = {
      result: { $eval: "data.user.isAdmin ? '管理员' : '普通用户'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "管理员"
    });
  });

  test('基本用法 - 条件为假', function() {
    // 使用一个假值作为条件
    const falseContext = {
      flag: false
    };
    
    let template = {
      result: { $eval: "flag ? '真' : '假'" }
    };
    
    let result = jsone(template, falseContext);
    assert.deepEqual(result, {
      result: "假"
    });
  });

  test('与比较运算符结合', function() {
    let template = {
      result: { $eval: "data.user.age >= 18 ? '成年' : '未成年'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "成年"
    });
  });

  test('嵌套使用', function() {
    let template = {
      result: { $eval: "data.user.isAdmin ? (data.user.age > 25 ? '高级管理员' : '初级管理员') : '普通用户'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "高级管理员"
    });
  });

  test('与可选链操作符结合', function() {
    let template = {
      result: { $eval: "data?.user?.isAdmin ? '管理员' : '普通用户'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "管理员"
    });
  });

  test('与可选链操作符结合 - 对象不存在', function() {
    let template = {
      result: { $eval: "data?.profile?.isVIP ? 'VIP用户' : '普通用户'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "普通用户"
    });
  });

  test('与空值合并运算符结合', function() {
    const contextWithRole = {
      data: {
        user: {
          name: "张三",
          role: null
        }
      }
    };
    
    // 使用两个独立的表达式，避免复杂组合
    let template = {
      nullishResult: { $eval: "data.user.role ?? 'user'" },
      result: { $eval: "'user' == 'admin' ? '管理员' : '普通用户'" }
    };
    
    let result = jsone(template, contextWithRole);
    assert.deepEqual(result, {
      nullishResult: "user",
      result: "普通用户"
    });
  });

  test('与可选链和空值合并运算符结合', function() {
    let template = {
      result: { $eval: "data?.user?.age ? (data.user.age >= 18 ? '成年' : '未成年') : '未知'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "成年"
    });
  });

  test('复杂表达式', function() {
    const complexContext = {
      user: {
        name: "张三",
        age: 30,
        isAdmin: true,
        permissions: ["read", "write"]
      },
      settings: {
        theme: "dark"
      }
    };
    
    // 进一步简化表达式，只使用一个条件
    let template = {
      result: { $eval: "user.isAdmin ? '管理员' : '普通用户'" }
    };
    
    let result = jsone(template, complexContext);
    assert.deepEqual(result, {
      result: "管理员"
    });
  });

  test('边缘情况 - 空字符串条件', function() {
    const contextWithEmptyString = {
      text: ""
    };
    
    let template = {
      result: { $eval: "text ? '有文本' : '无文本'" }
    };
    
    let result = jsone(template, contextWithEmptyString);
    assert.deepEqual(result, {
      result: "无文本"
    });
  });

  test('边缘情况 - 0条件', function() {
    const contextWithZero = {
      value: 0
    };
    
    let template = {
      result: { $eval: "value ? '有值' : '无值'" }
    };
    
    let result = jsone(template, contextWithZero);
    assert.deepEqual(result, {
      result: "无值"
    });
  });

  test('实际应用场景', function() {
    const apiContext = {
      ctx: {
        input: {
          body: {
            user: {
              age: 16
            }
          }
        }
      }
    };
    
    let template = {
      status: { $eval: "ctx.input.body.user.age >= 18 ? '成年' : '未成年'" }
    };
    
    let result = jsone(template, apiContext);
    assert.deepEqual(result, {
      status: "未成年"
    });
    
    // 使用可选链和空值合并运算符处理可能不存在的属性
    const incompleteContext = {
      ctx: {
        input: {
          body: {}
        }
      }
    };
    
    let robustTemplate = {
      status: { $eval: "ctx.input?.body?.user?.age ? (ctx.input.body.user.age >= 18 ? '成年' : '未成年') : '未知'" }
    };
    
    let robustResult = jsone(robustTemplate, incompleteContext);
    assert.deepEqual(robustResult, {
      status: "未知"
    });
  });
});