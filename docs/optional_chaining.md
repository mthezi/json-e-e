# 可选链操作符（?.）

## 功能介绍

可选链操作符（?.）是 JSON-e 模板引擎的一个强大功能，它允许用户安全地访问可能不存在的嵌套属性，而不会抛出错误。这个功能类似于 JavaScript 中的可选链操作符，为处理复杂的嵌套数据结构提供了更加优雅和健壮的方式。

在传统的属性访问中，如果尝试访问不存在的属性，JSON-e 会抛出错误。而使用可选链操作符，当访问的属性不存在时，表达式会返回 `null`，而不是抛出错误，从而避免了程序崩溃。

## 语法说明

可选链操作符的语法为 `?.`，用于替代传统的点操作符 `.`。

基本语法：
```
object?.property
```

可选链操作符可以用于：

1. **属性访问**：`object?.property`
2. **方法调用**：`object?.method()`
3. **与数组访问结合**：`array?.property[index]`

### 重要特性

1. **短路求值**：如果可选链操作符左侧的值为 `null` 或 `undefined`，则整个表达式立即返回 `null`，不会继续执行后续的属性访问。

2. **链式调用**：可以在一个表达式中使用多个可选链操作符，例如 `a?.b?.c`。

3. **与传统点操作符混合使用**：可以在同一表达式中混合使用可选链操作符和传统点操作符，例如 `a?.b.c`。但需要注意，如果 `a?.b` 返回 `null`，则后续的 `.c` 不会执行，整个表达式返回 `null`。

## 示例

### 基本用法

```javascript
// 上下文
const context = {
  data: {
    user: {
      name: "张三",
      age: 30
    }
  }
};

// 模板
const template = {
  // 使用传统点操作符
  userName1: { $eval: "data.user.name" },
  
  // 使用可选链操作符
  userName2: { $eval: "data?.user?.name" }
};

// 结果
// {
//   "userName1": "张三",
//   "userName2": "张三"
// }
```

### 处理不存在的属性

```javascript
// 上下文
const context = {
  data: {
    user: {
      name: "张三"
      // 注意：没有 address 属性
    }
  }
};

// 模板
const template = {
  // 使用传统点操作符 - 会抛出错误
  // address1: { $eval: "data.user.address" },
  
  // 使用可选链操作符 - 返回 null
  address2: { $eval: "data?.user?.address" }
};

// 结果
// {
//   "address2": null
// }
```

### 处理不存在的对象

```javascript
// 上下文
const context = {
  data: {
    // 注意：没有 profile 对象
  }
};

// 模板
const template = {
  // 使用传统点操作符 - 会抛出错误
  // address1: { $eval: "data.profile.address" },
  
  // 使用可选链操作符 - 返回 null
  address2: { $eval: "data?.profile?.address" }
};

// 结果
// {
//   "address2": null
// }
```

### 与方法调用结合

```javascript
// 上下文
const context = {
  data: {
    user: {
      getName: function() {
        return "张三";
      }
    }
  }
};

// 模板
const template = {
  // 调用存在的方法
  name: { $eval: "data?.user?.getName()" },
  
  // 调用不存在的方法 - 返回 null
  address: { $eval: "data?.user?.getAddress()" }
};

// 结果
// {
//   "name": "张三",
//   "address": null
// }
```

### 与数组访问结合

```javascript
// 上下文
const context = {
  data: {
    users: [
      { name: "张三" },
      { name: "李四" }
    ]
  }
};

// 模板
const template = {
  // 访问数组元素的属性
  firstName: { $eval: "data?.users[0].name" },
  
  // 访问不存在的数组
  friends: { $eval: "data?.friends" }
};

// 结果
// {
//   "firstName": "张三",
//   "friends": null
// }
```

## 与原始问题的关系

可选链操作符（?.）功能的添加解决了用户在处理复杂嵌套数据结构时的痛点。在实际应用中，数据结构往往是不确定的，某些属性可能存在也可能不存在。传统的点操作符在这种情况下会导致错误，需要用户编写大量的条件检查代码。

例如，在原始问题中，用户需要访问 `ctx.input.body.logo_info.add_logo` 这样的嵌套属性，但不确定 `logo_info` 是否存在。使用传统的点操作符，用户需要编写如下代码：

```javascript
let result;
if (ctx.input && ctx.input.body && ctx.input.body.logo_info) {
  result = ctx.input.body.logo_info.add_logo;
} else {
  result = null;
}
```

而使用可选链操作符，用户只需要编写：

```javascript
let result = ctx.input?.body?.logo_info?.add_logo;
```

这大大简化了代码，提高了可读性和可维护性，同时也减少了出错的可能性。

## 总结

可选链操作符（?.）是 JSON-e 模板引擎的一个强大功能，它允许用户以更加简洁和健壮的方式处理复杂的嵌套数据结构。通过返回 `null` 而不是抛出错误，它提供了一种优雅的方式来处理可能不存在的属性，从而使模板更加健壮和可维护。