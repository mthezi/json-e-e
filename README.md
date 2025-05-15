# JSON-e

JSON-e is a data-structure parameterization system for embedding context in JSON objects.

For full documentation, see https://json-e.js.org

## 新功能

### 可选链操作符（?.）

可选链操作符（?.）允许用户安全地访问可能不存在的嵌套属性，而不会抛出错误。当访问的属性不存在时，表达式会返回 `null`，而不是抛出错误。

```javascript
// 使用传统点操作符 - 如果 profile 不存在会抛出错误
data.profile.address

// 使用可选链操作符 - 如果 profile 不存在会返回 null
data?.profile?.address
```

这个功能特别适用于处理复杂的嵌套数据结构，可以大大简化代码并提高健壮性。

[查看详细文档](docs/optional_chaining.md) | [查看示例代码](examples/optional_chaining_example.js)
