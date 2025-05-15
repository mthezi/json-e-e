# 可选链操作符（?.）与空值合并运算符（??）

## 可选链操作符（?.）

### 功能介绍

可选链操作符（?.）是 JSON-e 模板引擎的一个强大功能，它允许用户安全地访问可能不存在的嵌套属性，而不会抛出错误。这个功能类似于 JavaScript 中的可选链操作符，为处理复杂的嵌套数据结构提供了更加优雅和健壮的方式。

在传统的属性访问中，如果尝试访问不存在的属性，JSON-e 会抛出错误。而使用可选链操作符，当访问的属性不存在时，表达式会返回 `null`，而不是抛出错误，从而避免了程序崩溃。

### 语法说明

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

## 空值合并运算符（??）

### 功能介绍

空值合并运算符（??）是 JSON-e 模板引擎的另一个强大功能，它用于提供默认值。当左侧操作数为 `null` 或 `undefined` 时，返回右侧操作数，否则返回左侧操作数。这个功能类似于 JavaScript 中的空值合并运算符，为处理可能为空的值提供了更加简洁和直观的方式。

在传统的条件表达式中，如果需要为可能为空的值提供默认值，需要使用较为复杂的条件判断。而使用空值合并运算符，可以简单地指定一个默认值，当原始值为 `null` 或 `undefined` 时使用该默认值。

### 语法说明

空值合并运算符的语法为 `??`。

基本语法：
```
value ?? defaultValue
```

### 重要特性

1. **仅对 null 和 undefined 生效**：空值合并运算符仅在左侧操作数为 `null` 或 `undefined` 时返回右侧操作数。对于其他假值（如 `false`、`0`、`''`），仍然返回左侧操作数。

2. **短路求值**：如果左侧操作数不为 `null` 或 `undefined`，则右侧操作数不会被求值。

3. **可以链式使用**：可以连续使用多个空值合并运算符，例如 `a ?? b ?? c`，表示如果 `a` 不为 `null` 或 `undefined` 则返回 `a`，否则如果 `b` 不为 `null` 或 `undefined` 则返回 `b`，否则返回 `c`。

4. **优先级**：空值合并运算符的优先级低于大多数运算符，但高于逻辑或（`||`）和逻辑与（`&&`）运算符。在复杂表达式中，建议使用括号明确优先级。

### 与可选链操作符结合使用

空值合并运算符（??）与可选链操作符（?.）结合使用，可以创建更加健壮和简洁的表达式。可选链操作符用于安全地访问可能不存在的属性，而空值合并运算符用于为可能为空的值提供默认值。

例如：
```javascript
// 如果 user.preferences.theme 不存在，使用默认主题
const theme = user?.preferences?.theme ?? 'default';
```

这种组合特别适用于处理复杂的嵌套数据结构，可以大大简化代码并提高健壮性。

## 示例

### 可选链操作符示例

#### 基本用法

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

#### 处理不存在的属性

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

#### 处理不存在的对象

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

#### 与方法调用结合

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

#### 与数组访问结合

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

### 空值合并运算符示例

#### 基本用法

```javascript
// 上下文
const context = {
  data: {
    user: {
      name: "张三",
      settings: {
        theme: null
      }
    }
  }
};

// 模板
const template = {
  // 使用空值合并运算符提供默认值
  userName: { $eval: "data.user.name ?? '默认用户'" },
  theme: { $eval: "data.user.settings.theme ?? '默认主题'" }
};

// 结果
// {
//   "userName": "张三",
//   "theme": "默认主题"
// }
```

#### 与可选链操作符结合使用

```javascript
// 上下文
const context = {
  data: {
    // 注意：没有 user 对象
  }
};

// 模板
const template = {
  // 使用可选链操作符安全地访问属性，并使用空值合并运算符提供默认值
  userName: { $eval: "data?.user?.name ?? '默认用户'" },
  age: { $eval: "data?.user?.age ?? 25" }
};

// 结果
// {
//   "userName": "默认用户",
//   "age": 25
// }
```

#### 处理不同类型的假值

```javascript
// 上下文
const context = {
  settings: {
    showNotifications: false,
    volume: 0,
    username: ""
  }
};

// 模板
const template = {
  // 注意：空值合并运算符只对 null 和 undefined 生效
  notifications: { $eval: "settings.showNotifications ?? true" },
  volume: { $eval: "settings.volume ?? 100" },
  username: { $eval: "settings.username ?? '匿名用户'" }
};

// 结果
// {
//   "notifications": false,  // 保留 false
//   "volume": 0,             // 保留 0
//   "username": ""           // 保留空字符串
// }
```

#### 链式使用

```javascript
// 上下文
const context = {
  preferences: null,
  defaults: {
    theme: null
  },
  system: {
    theme: "暗色"
  }
};

// 模板
const template = {
  // 依次尝试 preferences.theme、defaults.theme 和 system.theme
  theme: { $eval: "preferences?.theme ?? defaults?.theme ?? system?.theme ?? '默认主题'" }
};

// 结果
// {
//   "theme": "暗色"
// }
```

#### 实际应用场景

```javascript
// 上下文 - 模拟 API 响应数据
const context = {
  ctx: {
    input: {
      body: {
        // logo_info 可能存在也可能不存在
      }
    }
  }
};

// 模板
const template = {
  // 使用可选链操作符安全地访问嵌套属性，并使用空值合并运算符提供默认值
  shouldAddLogo: { $eval: "ctx.input?.body?.logo_info?.add_logo ?? true" },
  logoPosition: { $eval: "ctx.input?.body?.logo_info?.position ?? 'top-right'" },
  logoOpacity: { $eval: "ctx.input?.body?.logo_info?.opacity ?? 0.8" }
};

// 结果
// {
//   "shouldAddLogo": true,
//   "logoPosition": "top-right",
//   "logoOpacity": 0.8
// }
```

## 与原始问题的关系

可选链操作符（?.）和空值合并运算符（??）功能的添加解决了用户在处理复杂嵌套数据结构时的痛点。在实际应用中，数据结构往往是不确定的，某些属性可能存在也可能不存在，需要提供默认值。传统的点操作符和条件表达式在这种情况下会导致错误或需要编写大量的条件检查代码。

例如，在原始问题中，用户需要访问 `ctx.input.body.logo_info.add_logo` 这样的嵌套属性，但不确定 `logo_info` 是否存在，并且希望在属性不存在时使用默认值 `true`。使用传统的方式，用户需要编写如下代码：

```javascript
let result;
if (ctx.input && ctx.input.body && ctx.input.body.logo_info) {
  result = ctx.input.body.logo_info.add_logo;
} else {
  result = true;
}
```

而使用可选链操作符和空值合并运算符，用户只需要编写：

```javascript
let result = ctx.input?.body?.logo_info?.add_logo ?? true;
```

这大大简化了代码，提高了可读性和可维护性，同时也减少了出错的可能性。

## 总结

可选链操作符（?.）和空值合并运算符（??）是 JSON-e 模板引擎的两个强大功能，它们允许用户以更加简洁和健壮的方式处理复杂的嵌套数据结构和默认值。

可选链操作符通过返回 `null` 而不是抛出错误，提供了一种优雅的方式来处理可能不存在的属性。空值合并运算符则提供了一种简洁的方式来为可能为 `null` 或 `undefined` 的值指定默认值。

这两个功能结合使用，可以创建更加健壮、简洁和可维护的模板，特别适用于处理复杂的、可能包含缺失数据的 JSON 结构。