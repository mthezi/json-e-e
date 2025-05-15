/**
 * 可选链操作符（?.）使用示例
 *
 * 本示例展示了如何在 JSON-e 模板中使用可选链操作符来安全地访问嵌套属性
 */

/* eslint-disable no-console, no-undef */

// 引入 JSON-e 库
const jsone = require('../src/');

// 示例 1: 基本用法
console.log('示例 1: 基本用法');

// 定义上下文
const context1 = {
  data: {
    user: {
      name: "张三",
      age: 30
    }
  }
};

// 定义模板
const template1 = {
  // 使用传统点操作符
  normalAccess: { $eval: "data.user.name" },
  
  // 使用可选链操作符
  optionalChaining: { $eval: "data?.user?.name" }
};

// 渲染模板
const result1 = jsone(template1, context1);
console.log(result1);
console.log('-----------------------------------');

// 示例 2: 处理不存在的属性
console.log('示例 2: 处理不存在的属性');

// 定义上下文
const context2 = {
  data: {
    user: {
      name: "张三"
      // 注意：没有 address 属性
    }
  }
};

// 定义模板
const template2 = {
  // 使用可选链操作符访问不存在的属性
  address: { $eval: "data?.user?.address" },
  
  // 使用可选链操作符访问存在的属性
  name: { $eval: "data?.user?.name" }
};

// 渲染模板
try {
  const result2 = jsone(template2, context2);
  console.log(result2);
} catch (error) {
  console.error('错误:', error.message);
}
console.log('-----------------------------------');

// 示例 3: 处理不存在的对象
console.log('示例 3: 处理不存在的对象');

// 定义上下文
const context3 = {
  data: {
    // 注意：没有 profile 对象
  }
};

// 定义模板
const template3 = {
  // 使用可选链操作符访问不存在的对象
  profile: { $eval: "data?.profile?.address" }
};

// 渲染模板
try {
  const result3 = jsone(template3, context3);
  console.log(result3);
} catch (error) {
  console.error('错误:', error.message);
}
console.log('-----------------------------------');

// 示例 4: 与方法调用结合
console.log('示例 4: 与方法调用结合');

// 定义上下文
const context4 = {
  data: {
    user: {
      getName: function() {
        return "张三";
      }
    }
  }
};

// 定义模板
const template4 = {
  // 调用存在的方法
  name: { $eval: "data?.user?.getName()" },
  
  // 调用不存在的方法
  address: { $eval: "data?.user?.getAddress()" }
};

// 渲染模板
try {
  const result4 = jsone(template4, context4);
  console.log(result4);
} catch (error) {
  console.error('错误:', error.message);
}
console.log('-----------------------------------');

// 示例 5: 与数组访问结合
console.log('示例 5: 与数组访问结合');

// 定义上下文
const context5 = {
  data: {
    users: [
      { name: "张三" },
      { name: "李四" }
    ]
  }
};

// 定义模板
const template5 = {
  // 访问数组元素的属性
  firstName: { $eval: "data?.users[0].name" },
  
  // 访问不存在的数组
  friends: { $eval: "data?.friends" }
};

// 渲染模板
try {
  const result5 = jsone(template5, context5);
  console.log(result5);
} catch (error) {
  console.error('错误:', error.message);
}
console.log('-----------------------------------');

// 示例 6: 实际应用场景
console.log('示例 6: 实际应用场景');

// 定义上下文 - 模拟 API 响应数据
const context6 = {
  ctx: {
    input: {
      body: {
        // logo_info 可能存在也可能不存在
        logo_info: {
          add_logo: true,
          logo_url: "https://example.com/logo.png"
        }
      }
    }
  }
};

// 定义模板
const template6 = {
  // 使用可选链操作符安全地访问嵌套属性
  shouldAddLogo: { $eval: "ctx.input?.body?.logo_info?.add_logo || false" },
  logoUrl: { $eval: "ctx.input?.body?.logo_info?.logo_url || ''" }
};

// 渲染模板
const result6 = jsone(template6, context6);
console.log(result6);

// 定义另一个上下文 - logo_info 不存在
const context7 = {
  ctx: {
    input: {
      body: {
        // 没有 logo_info
      }
    }
  }
};

// 使用相同的模板
const result7 = jsone(template6, context7);
console.log(result7);