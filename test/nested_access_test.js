const assert = require('assert');
const jsone = require('../src/');

suite('嵌套属性访问', function() {
  test('访问存在的嵌套属性', function() {
    let template = {
      result: { $eval: "data.user.name" }
    };
    
    let context = {
      data: {
        user: {
          name: "张三",
          age: 30
        }
      }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: "张三"
    });
  });

  test('访问不存在的嵌套属性 - 中间属性不存在', function() {
    let template = {
      result: { $eval: "data?.profile?.address" }
    };
    
    let context = {
      data: {
        user: {
          name: "张三"
        }
      }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });

  test('访问不存在的嵌套属性 - 顶层属性不存在', function() {
    let template = {
      result: { $eval: "missing?.user?.name" }
    };
    
    let context = {
      data: {
        user: {
          name: "张三"
        }
      }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      result: null
    });
  });

  test('条件键与嵌套属性访问结合', function() {
    let template = {
      "?logo_info": {
        "?add_logo": { $eval: "input.body?.logo_info?.add_logo" },
        "?position": { $eval: "input.body?.logo_info?.position" },
        "?language": { $eval: "input.body?.logo_info?.language" }
      }
    };
    
    // 测试场景1：logo_info不存在
    let context1 = {
      input: {
        body: {}
      }
    };
    
    let result1 = jsone(template, context1);
    assert.deepEqual(result1, {});
    
    // 测试场景2：logo_info存在但部分属性不存在
    let context2 = {
      input: {
        body: {
          logo_info: {
            add_logo: true,
            position: "top-right"
          }
        }
      }
    };
    
    let result2 = jsone(template, context2);
    assert.deepEqual(result2, {
      logo_info: {
        add_logo: true,
        position: "top-right"
      }
    });
  });

  test('复杂嵌套属性访问', function() {
    let template = {
      body: {
        "prompt": "${input.body.prompt}",
        "image_urls": "${input.body.image_urls}",
        "negative_prompt": "${input.body.negative_prompt}",
        "seed": { $eval: "input.body.seed" },
        "scale": { $if: "false", then: { $eval: "input.body?.scale" }, else: 0.5 },
        "return_url": { $eval: "input.body.return_url" },
        "?logo_info": {
          "?add_logo": { $eval: "input.body?.logo_info?.add_logo" },
          "?position": { $eval: "input.body?.logo_info?.position" },
          "?language": { $eval: "input.body?.logo_info?.language" },
          "?opacity": { $eval: "input.body?.logo_info?.opacity" },
          "?logo_text_content": { $eval: "input.body?.logo_info?.logo_text_content" },
        },
      },
    };
    
    let context = {
      input: {
        body: {
          prompt: "测试提示",
          image_urls: "http://example.com/image.jpg",
          negative_prompt: "负面提示",
          seed: 12345,
          return_url: "http://example.com/callback"
        }
      }
    };
    
    let result = jsone(template, context);
    assert.deepEqual(result, {
      body: {
        prompt: "测试提示",
        image_urls: "http://example.com/image.jpg",
        negative_prompt: "负面提示",
        seed: 12345,
        scale: 0.5,
        return_url: "http://example.com/callback"
      }
    });
  });
});