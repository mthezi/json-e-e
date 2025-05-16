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

### 内置函数增强

JSON-e 现在支持更丰富的内置函数，使模板处理更加强大。新增功能包括：

#### 数学函数
- `sin(x)`, `cos(x)`, `tan(x)` - 三角函数
- `asin(x)`, `acos(x)`, `atan(x)` - 反三角函数
- `log(x)`, `log10(x)`, `exp(x)` - 对数和指数函数
- `pow(x, y)` - 计算 x 的 y 次方
- `random()` - 生成 0-1 之间的随机数

#### 字符串函数
- `replace(str, search, replace)` - 替换所有匹配项
- `replaceFirst(str, search, replace)` - 替换第一个匹配项
- `substring(str, start, end)` - 提取子字符串
- `startsWith(str, prefix)` - 检查字符串是否以指定前缀开始
- `endsWith(str, suffix)` - 检查字符串是否以指定后缀结束
- `includes(str, search)` - 检查字符串是否包含指定文本

#### 数组函数
- `flatten(arr)` - 扁平化嵌套数组

#### 对象函数
- `keys(obj)` - 获取对象的所有键
- `values(obj)` - 获取对象的所有值
- `hasKey(obj, key)` - 检查对象是否包含指定键

#### 类型转换函数
- `boolean(value)` - 转换为布尔值
- `str(value)` - 转换为字符串（之前 README 中未记录，但在 builtins.js 中存在）
- `toArray(value)` - 将值转换为数组。如果输入是数组，则返回自身；如果是 `null` 或 `undefined`，返回空数组 `[]`；否则，将输入包装在数组中返回。

#### 正则表达式函数
- `match(str, pattern)` - 匹配第一个符合模式的字符串
- `test(str, pattern)` - 测试字符串是否符合指定模式

[查看示例代码](examples/new_builtins_example.js)

### Lambda 表达式 (箭头函数)

JSON-e 现在支持 Lambda 表达式（也称为箭头函数），允许您在模板中定义匿名函数。这对于需要将简单函数作为参数传递给其他内置函数（如 `map`, `filter`, `reduce` 等）的场景特别有用。

#### 语法

Lambda 表达式的语法与 JavaScript 中的箭头函数类似：

- 单参数: `x => x * 2` (参数 `x`，表达式 `x * 2`)
- 多参数: `(acc, item) => acc + item` (参数 `acc` 和 `item`，表达式 `acc + item`)

#### 用法

Lambda 表达式可以直接用在需要函数作为参数的地方。

**示例：**

```json
{
  "$template": {
    "doubled": { "$eval": "map([1, 2, 3], x => x * 2)" },
    "evens": { "$eval": "filter([1, 2, 3, 4, 5], item => item % 2 == 0)" },
    "sum": { "$eval": "reduce([1, 2, 3, 4, 5], (acc, val) => acc + val, 0)" },
    "found": { "$eval": "find([{id:1, name:'a'}, {id:2, name:'b'}], item => item.id == 2)" },
    "allPositive": { "$eval": "every([1, 2, -3], x => x > 0)" },
    "anyNegative": { "$eval": "some([1, 2, -3], x => x < 0)" },
    "sorted": { "$eval": "sortBy([{n:2},{n:1},{n:3}], item => item.n)" }
  }
}
```

**输出：**

```json
{
  "doubled": [2, 4, 6],
  "evens": [2, 4],
  "sum": 15,
  "found": { "id": 2, "name": "b" },
  "allPositive": false,
  "anyNegative": true,
  "sorted": [{"n":1},{"n":2},{"n":3}]
}
```

当 Lambda 表达式作为参数传递给 `map`, `filter`, `reduce` 等内置函数时，它们会被 JSON-e 的解释器识别并正确执行。Lambda 表达式内部的变量（如 `x`, `item`, `acc`, `val`）会在每次调用时绑定到当前正在处理的元素或累积值。

[查看 Lambda 函数示例代码](examples/lambda_function_example.js)
