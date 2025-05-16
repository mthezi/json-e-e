/**
 * 三目运算符（? :）使用示例
 *
 * 本示例展示了如何在 JSON-e 模板中使用三目运算符
 * 进行条件判断和值选择
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
      age: 30,
      isAdmin: true
    }
  }
};

// 定义模板
const template1 = {
  // 使用三目运算符进行条件判断
  userType: { $eval: "data.user.isAdmin ? '管理员' : '普通用户'" },
  
  // 使用三目运算符与比较运算符结合
  ageStatus: { $eval: "data.user.age >= 18 ? '成年' : '未成年'" }
};

// 渲染模板
const result1 = jsone(template1, context1);
console.log(result1);
console.log('-----------------------------------');

// 示例 2: 嵌套使用
console.log('示例 2: 嵌套使用');

// 定义上下文
const context2 = {
  data: {
    user: {
      name: "张三",
      age: 30,
      isAdmin: true,
      experience: 5
    }
  }
};

// 定义模板
const template2 = {
  // 嵌套使用三目运算符
  userLevel: { $eval: "data.user.isAdmin ? (data.user.experience > 3 ? '高级管理员' : '初级管理员') : '普通用户'" }
};

// 渲染模板
const result2 = jsone(template2, context2);
console.log(result2);
console.log('-----------------------------------');

// 示例 3: 与可选链操作符结合
console.log('示例 3: 与可选链操作符结合');

// 定义上下文
const context3 = {
  data: {
    user: {
      name: "张三",
      age: 30
    }
    // 注意：没有 profile 对象
  }
};

// 定义模板
const template3 = {
  // 使用可选链操作符安全地访问可能不存在的属性
  isVIP: { $eval: "data?.user?.vip ? 'VIP用户' : '普通用户'" },
  
  // 访问不存在的对象
  hasProfile: { $eval: "data?.profile ? '有个人资料' : '无个人资料'" }
};

// 渲染模板
const result3 = jsone(template3, context3);
console.log(result3);
console.log('-----------------------------------');

// 示例 4: 与空值合并运算符结合
console.log('示例 4: 与空值合并运算符结合');

// 定义上下文
const context4 = {
  data: {
    user: {
      name: "张三",
      settings: {
        theme: null
      }
    }
  }
};

// 定义模板
const template4 = {
  // 使用空值合并运算符提供默认值，然后使用三目运算符进行条件判断
  theme: { $eval: "(data.user.settings.theme ?? 'light') == 'dark' ? '深色主题' : '浅色主题'" }
};

// 渲染模板
const result4 = jsone(template4, context4);
console.log(result4);
console.log('-----------------------------------');

// 示例 5: 与可选链和空值合并运算符结合
console.log('示例 5: 与可选链和空值合并运算符结合');

// 定义上下文
const context5 = {
  data: {
    // 注意：没有 user 对象
  }
};

// 定义模板
const template5 = {
  // 组合使用可选链操作符、空值合并运算符和三目运算符
  userStatus: { $eval: "data?.user?.age ? (data.user.age >= 18 ? '成年用户' : '未成年用户') : '未知用户'" }
};

// 渲染模板
const result5 = jsone(template5, context5);
console.log(result5);
console.log('-----------------------------------');

// 示例 6: 实际应用场景
console.log('示例 6: 实际应用场景');

// 定义上下文 - 模拟 API 响应数据
const context6 = {
  ctx: {
    input: {
      body: {
        user: {
          age: 16,
          subscription: "premium"
        }
      }
    }
  }
};

// 定义模板
const template6 = {
  // 根据用户年龄和订阅类型确定内容访问权限
  accessLevel: { $eval: "ctx.input.body.user.age >= 18 ? '完全访问' : (ctx.input.body.user.subscription == 'premium' ? '受限访问' : '禁止访问')" },
  
  // 根据用户年龄确定显示的内容类型
  contentType: { $eval: "ctx.input.body.user.age >= 18 ? '成人内容' : '青少年内容'" }
};

// 渲染模板
const result6 = jsone(template6, context6);
console.log(result6);

// 定义另一个上下文 - 不同的用户数据
const context7 = {
  ctx: {
    input: {
      body: {
        user: {
          age: 25,
          subscription: "basic"
        }
      }
    }
  }
};

// 使用相同的模板
const result7 = jsone(template6, context7);
console.log(result7);
console.log('-----------------------------------');

// 示例 7: 复杂条件判断
console.log('示例 7: 复杂条件判断');

// 定义上下文
const context8 = {
  user: {
    name: "张三",
    age: 30,
    isAdmin: true,
    permissions: ["read", "write", "delete"],
    loginCount: 100
  },
  settings: {
    theme: "dark",
    notifications: true
  }
};

// 定义模板
const template7 = {
  // 使用复杂条件和三目运算符
  userBadge: { $eval: "user.isAdmin && len(user.permissions) >= 3 ? '超级管理员' : (len(user.permissions) >= 2 ? '高级用户' : '普通用户')" },
  
  // 组合多个条件
  userExperience: { $eval: "user.loginCount > 50 && settings.theme == 'dark' ? '资深用户-暗黑模式' : (user.loginCount > 50 ? '资深用户-普通模式' : '新用户')" }
};

// 渲染模板
const result8 = jsone(template7, context8);
console.log(result8);
console.log('-----------------------------------');

// 示例 8: 边缘情况处理
console.log('示例 8: 边缘情况处理');

// 定义上下文
const context9 = {
  values: {
    zero: 0,
    emptyString: "",
    emptyArray: [],
    emptyObject: {},
    nullValue: null,
    undefinedValue: undefined
  }
};

// 定义模板
const template8 = {
  // 测试各种假值作为条件
  zeroCheck: { $eval: "values.zero ? '非零' : '零'" },
  emptyStringCheck: { $eval: "values.emptyString ? '非空字符串' : '空字符串'" },
  emptyArrayCheck: { $eval: "len(values.emptyArray) ? '非空数组' : '空数组'" },
  emptyObjectCheck: { $eval: "len(values.emptyObject) ? '非空对象' : '空对象'" },
  nullCheck: { $eval: "values.nullValue ? '非空值' : '空值'" },
  undefinedCheck: { $eval: "values.undefinedValue ?? false ? '已定义' : '未定义'" }
};

// 渲染模板
const result9 = jsone(template8, context9);
console.log(result9);