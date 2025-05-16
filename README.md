# JSON-e

JSON-e is a data-structure parameterization system for embedding context in JSON objects.

For full documentation, see https://json-e.js.org

## 新功能

### 可选链操作符（?.）和空值合并运算符（??）

#### 可选链操作符（?.）

可选链操作符（?.）允许用户安全地访问可能不存在的嵌套属性，而不会抛出错误。当访问的属性不存在时，表达式会返回 `null`，而不是抛出错误。

```javascript
// 使用传统点操作符 - 如果 profile 不存在会抛出错误
data.profile.address

// 使用可选链操作符 - 如果 profile 不存在会返回 null
data?.profile?.address
```

#### 空值合并运算符（??）

空值合并运算符（??）用于提供默认值。当左侧操作数为 `null` 或 `undefined` 时，返回右侧操作数，否则返回左侧操作数。

```javascript
// 使用空值合并运算符提供默认值
const theme = user.settings.theme ?? 'default';

// 与可选链操作符结合使用
const name = user?.profile?.name ?? '匿名用户';
```

这些功能特别适用于处理复杂的嵌套数据结构，可以大大简化代码并提高健壮性。

[查看详细文档](docs/optional_chaining.md) | [查看示例代码](examples/optional_chaining_example.js)

### 三目运算符（? :）

三目运算符（? :）提供了一种简洁的方式来表达条件逻辑。语法为：`condition ? expr1 : expr2`。如果条件为真，则返回expr1，否则返回expr2。

```javascript
// 使用三目运算符进行条件判断
const userType = user.isAdmin ? '管理员' : '普通用户';

// 与比较运算符结合使用
const ageStatus = user.age >= 18 ? '成年' : '未成年';

// 与可选链操作符和空值合并运算符结合使用
const status = user?.age ? (user.age >= 18 ? '成年' : '未成年') : '未知';
```

三目运算符可以与可选链操作符（?.）和空值合并运算符（??）结合使用，创建更加健壮和简洁的表达式，特别适用于处理复杂的条件逻辑和可能不存在的数据。

[查看详细文档](docs/ternary_operator.md) | [查看示例代码](examples/ternary_operator_example.js)
