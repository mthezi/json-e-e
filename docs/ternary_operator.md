# 三目运算符（? :）

## 功能介绍

三目运算符（? :）是 JSON-e 模板引擎的一个强大功能，它提供了一种简洁的方式来表达条件逻辑。这个功能类似于 JavaScript 中的条件（三元）运算符，允许用户根据条件选择不同的值，从而使模板更加灵活和表达力更强。

三目运算符的基本形式是：`condition ? expr1 : expr2`。如果条件为真，则返回 `expr1`，否则返回 `expr2`。这是一种简洁的 if-else 表达式，可以在一行代码中完成条件判断和赋值。

## 语法说明

三目运算符的语法为 `? :`。

基本语法：
```
condition ? trueExpression : falseExpression
```

其中：
- `condition` 是一个表达式，其结果将被转换为布尔值
- `trueExpression` 是当条件为真时要返回的表达式
- `falseExpression` 是当条件为假时要返回的表达式

## 重要特性

1. **短路求值**：三目运算符使用短路求值。如果条件为真，只会计算 `trueExpression`；如果条件为假，只会计算 `falseExpression`。

2. **嵌套使用**：三目运算符可以嵌套使用，例如 `a ? b : (c ? d : e)`，但过度嵌套可能会降低可读性。

3. **与其他运算符结合**：三目运算符可以与其他运算符（如比较运算符、逻辑运算符等）结合使用，例如 `a > b ? c : d`。

4. **优先级**：三目运算符的优先级低于大多数运算符，但高于赋值运算符。在复杂表达式中，建议使用括号明确优先级。

## 与可选链操作符和空值合并运算符结合使用

三目运算符（? :）可以与可选链操作符（?.）和空值合并运算符（??）结合使用，创建更加健壮和简洁的表达式。

例如：
```javascript
// 如果 user.age 存在且大于等于 18，返回 "成年"，否则返回 "未成年"
const status = user?.age ? (user.age >= 18 ? "成年" : "未成年") : "未知";
```

这种组合特别适用于处理复杂的条件逻辑和可能不存在的数据，可以大大简化代码并提高健壮性。

## 示例

### 基本用法

```javascript
// 上下文
const context = {
  user: {
    age: 30,
    isAdmin: true
  }
};

// 模板
const template = {
  // 根据用户是否为管理员返回不同的值
  userType: { $eval: "user.isAdmin ? '管理员' : '普通用户'" },
  
  // 根据用户年龄判断是否成年
  ageStatus: { $eval: "user.age >= 18 ? '成年' : '未成年'" }
};

// 结果
// {
//   "userType": "管理员",
//   "ageStatus": "成年"
// }
```

### 嵌套使用

```javascript
// 上下文
const context = {
  user: {
    age: 30,
    isAdmin: true,
    experience: 5
  }
};

// 模板
const template = {
  // 嵌套使用三目运算符
  userLevel: { $eval: "user.isAdmin ? (user.experience > 3 ? '高级管理员' : '初级管理员') : '普通用户'" }
};

// 结果
// {
//   "userLevel": "高级管理员"
// }
```

### 与可选链操作符结合使用

```javascript
// 上下文
const context = {
  data: {
    // 注意：没有 user 对象
  }
};

// 模板
const template = {
  // 使用可选链操作符安全地访问可能不存在的属性
  userStatus: { $eval: "data?.user?.isAdmin ? '管理员' : '普通用户'" }
};

// 结果
// {
//   "userStatus": "普通用户"
// }
```

### 与空值合并运算符结合使用

```javascript
// 上下文
const context = {
  user: {
    role: null
  }
};

// 模板
const template = {
  // 使用空值合并运算符提供默认值，然后使用三目运算符进行条件判断
  userType: { $eval: "(user.role ?? 'user') == 'admin' ? '管理员' : '普通用户'" }
};

// 结果
// {
//   "userType": "普通用户"
// }
```

### 复杂条件判断

```javascript
// 上下文
const context = {
  user: {
    age: 30,
    isAdmin: true,
    permissions: ["read", "write", "delete"]
  }
};

// 模板
const template = {
  // 使用复杂条件和三目运算符
  accessLevel: { $eval: "user.isAdmin && len(user.permissions) >= 3 ? '完全访问' : (len(user.permissions) >= 2 ? '部分访问' : '只读访问')" }
};

// 结果
// {
//   "accessLevel": "完全访问"
// }
```

### 实际应用场景

```javascript
// 上下文 - 模拟 API 响应数据
const context = {
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

// 模板
const template = {
  // 根据用户年龄和订阅类型确定内容访问权限
  accessLevel: { $eval: "ctx.input.body.user.age >= 18 ? '完全访问' : (ctx.input.body.user.subscription == 'premium' ? '受限访问' : '禁止访问')" }
};

// 结果
// {
//   "accessLevel": "受限访问"
// }
```

## 与原始问题的关系

三目运算符（? :）功能的添加解决了用户在处理条件逻辑时的痛点。在实际应用中，经常需要根据条件选择不同的值，传统的方式需要使用较为复杂的表达式或多个模板操作符。

例如，在原始问题中，用户需要根据 `ctx.input.body.user.age` 的值来确定是"成年"还是"未成年"。使用传统的方式，用户可能需要编写如下代码：

```javascript
{
  $if: "ctx.input.body.user.age >= 18",
  then: "成年",
  else: "未成年"
}
```

而使用三目运算符，用户只需要编写：

```javascript
{ $eval: "ctx.input.body.user.age >= 18 ? '成年' : '未成年'" }
```

这大大简化了代码，提高了可读性和可维护性，同时也减少了出错的可能性。

## 与可选链操作符和空值合并运算符的协同效应

三目运算符（? :）与可选链操作符（?.）和空值合并运算符（??）一起使用时，可以创建更加强大和灵活的表达式。

例如，考虑以下场景：需要根据用户年龄判断是否成年，但用户信息可能不存在。

使用这三个运算符的组合，可以编写如下代码：

```javascript
{ $eval: "ctx.input?.body?.user?.age ? (ctx.input.body.user.age >= 18 ? '成年' : '未成年') : '未知'" }
```

这个表达式首先使用可选链操作符安全地访问 `ctx.input.body.user.age`，如果这个属性存在，则使用三目运算符根据年龄判断是否成年；如果这个属性不存在，则返回"未知"。

这种组合使用提供了一种简洁而强大的方式来处理复杂的条件逻辑和可能不存在的数据，大大提高了模板的健壮性和表达能力。

## 总结

三目运算符（? :）是 JSON-e 模板引擎的一个强大功能，它提供了一种简洁的方式来表达条件逻辑。通过使用三目运算符，用户可以根据条件选择不同的值，从而使模板更加灵活和表达力更强。

三目运算符可以与可选链操作符（?.）和空值合并运算符（??）结合使用，创建更加健壮和简洁的表达式，特别适用于处理复杂的条件逻辑和可能不存在的数据。

这三个功能的结合使用，可以创建更加健壮、简洁和可维护的模板，特别适用于处理复杂的、可能包含缺失数据的 JSON 结构。