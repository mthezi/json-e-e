const assert = require('assert');
const jsone = require('../src/');

suite('空值合并运算符测试', function() {
  // 定义测试上下文
  const context = {
    data: {
      user: {
        name: "张三",
        age: 30,
        settings: {
          theme: null,
          language: undefined
        }
      }
    }
  };

  test('基本用法 - 左侧不为null或undefined', function() {
    let template = {
      result: { $eval: "data.user.name ?? '默认用户'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "张三"
    });
  });

  test('基本用法 - 左侧为null', function() {
    let template = {
      result: { $eval: "data.user.settings.theme ?? '默认主题'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "默认主题"
    });
  });

  test('基本用法 - 左侧为undefined', function() {
    let template = {
      result: { $eval: "data.user.settings.language ?? '默认语言'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "默认语言"
    });
  });

  test('基本用法 - 左侧属性不存在', function() {
    let template = {
      result: { $eval: "data.user.address ?? '默认地址'" }
    };
    
    // 注意：这里会抛出错误，因为使用点操作符访问不存在的属性会抛出错误
    assert.throws(() => {
      jsone(template, context);
    }, /object has no property "address"/);
  });

  test('与可选链操作符结合使用 - 属性不存在', function() {
    let template = {
      result: { $eval: "data.user?.address ?? '默认地址'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "默认地址"
    });
  });

  test('与可选链操作符结合使用 - 对象不存在', function() {
    let template = {
      result: { $eval: "data?.profile?.name ?? '默认用户'" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "默认用户"
    });
  });

  test('与可选链操作符结合使用 - 多级属性不存在', function() {
    let template = {
      result: { $eval: "data.user?.settings?.notifications?.enabled ?? true" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: true
    });
  });

  test('嵌套使用 - 多个默认值', function() {
    let template = {
      result: { $eval: "data.user?.settings?.font ?? (data.user?.settings?.theme ?? '默认字体')" }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "默认字体"
    });
  });

  test('边缘情况 - 左侧为false', function() {
    const contextWithFalse = {
      flag: false
    };
    
    let template = {
      result: { $eval: "flag ?? true" }
    };
    
    let result = jsone(template, contextWithFalse);
    assert.deepEqual(result, {
      result: false
    });
  });

  test('边缘情况 - 左侧为0', function() {
    const contextWithZero = {
      value: 0
    };
    
    let template = {
      result: { $eval: "value ?? 10" }
    };
    
    let result = jsone(template, contextWithZero);
    assert.deepEqual(result, {
      result: 0
    });
  });

  test('边缘情况 - 左侧为空字符串', function() {
    const contextWithEmptyString = {
      text: ""
    };
    
    let template = {
      result: { $eval: "text ?? '默认文本'" }
    };
    
    let result = jsone(template, contextWithEmptyString);
    assert.deepEqual(result, {
      result: ""
    });
  });

  test('实际应用场景', function() {
    const contextWithLogo = {
      ctx: {
        input: {
          body: {
            logo_info: {
              add_logo: true
            }
          }
        }
      }
    };
    
    let template = {
      shouldAddLogo: { $eval: "ctx.input?.body?.logo_info?.add_logo ?? true" }
    };
    
    // 场景1：logo_info.add_logo存在且为true
    let result1 = jsone(template, contextWithLogo);
    assert.deepEqual(result1, {
      shouldAddLogo: true
    });
    
    // 场景2：logo_info不存在，使用默认值true
    const contextWithoutLogo = {
      ctx: {
        input: {
          body: {}
        }
      }
    };
    
    let result2 = jsone(template, contextWithoutLogo);
    assert.deepEqual(result2, {
      shouldAddLogo: true
    });
  });
});