/* eslint-env node */

const jsone = require('../src');

// 箭头函数示例模板
const template = {
  title: "箭头函数示例",
  
  // 单参数箭头函数：map 示例
  mapTest: {
    $eval: "map([1, 2, 3, 4, 5], x => x * 2)"
  },
  
  // 多参数箭头函数：reduce 示例
  reduceTest: {
    $eval: "reduce([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)"
  },
  
  // 过滤函数：filter 示例
  filterTest: {
    $eval: "filter([1, 2, 3, 4, 5], x => x % 2 == 0)"
  },
  
  // 检查函数：every 示例
  everyTest: {
    $eval: "every([1, 2, 3, 4, 5], x => x > 0)"
  },
  
  // 检查函数：some 示例
  someTest: {
    $eval: "some([1, 2, 3, 4, 5], x => x > 3)"
  },
  
  // 查找函数：find 示例
  findTest: {
    $eval: "find([1, 2, 3, 4, 5], x => x > 3)"
  },
  
  // 排序函数：sortBy 示例
  sortByTest: {
    $eval: "sortBy([5, 3, 1, 4, 2], x => x * x)"
  }
};

// 执行模板
try {
  const result = jsone(template, {});
  // eslint-disable-next-line no-console
  console.log("执行成功！结果：");
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('错误:', err.toString());
  // eslint-disable-next-line no-console
  console.error('错误位置:', err.location);
  // eslint-disable-next-line no-console
  console.error('错误堆栈:', err.stack);
} 