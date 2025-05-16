const {isFunction, isObject, isString, isArray, isNumber, isInteger, isTruthy} = require("../src/type-utils");
const {InterpreterError} = require('./error');

// 定义特殊符号，表示可选链操作符返回的null
const OPTIONAL_CHAIN_NULL = Symbol('OPTIONAL_CHAIN_NULL');

let expectationError = (operator, expectation) => new InterpreterError(`${operator} expects ${expectation}`);

class Interpreter {
    constructor(context) {
        this.context = context;
    }

    visit(node) {
        let funcName = "visit_" + node.constructorName;
        return this[funcName](node);
    }

    visit_ASTNode(node) {
        let str;
        switch (node.token.kind) {
            case("number"):
                return +node.token.value;
            case("null"):
                return null;
            case("string"):
                str = node.token.value.slice(1, -1);
                return str;
            case("true"):
                return true;
            case("false"):
                return false;
            case("identifier"):
                return node.token.value;
        }
    }

    visit_UnaryOp(node) {
        let value = this.visit(node.expr);
        switch (node.token.kind) {
            case ("+"):
                if (!isNumber(value)) {
                    throw expectationError('unary +', 'number');
                }
                return +value;
            case ("-"):
                if (!isNumber(value)) {
                    throw expectationError('unary -', 'number');
                }
                return -value;
            case ("!"):
                return !isTruthy(value)
        }
    }

    visit_BinOp(node) {
        let left = this.visit(node.left);
        let right;
        
        // 处理三目运算符
        if (node.token.kind === "?" && node.right && node.right.isTernary) {
            // 如果条件为真，计算并返回第一个表达式的值
            if (isTruthy(left)) {
                return this.visit(node.right.trueExpr);
            }
            // 否则，计算并返回第二个表达式的值
            else {
                return this.visit(node.right.falseExpr);
            }
        }
        
        switch (node.token.kind) {
            case ("||"):
                // Corrected logic for OR: return actual value, not boolean
                if (isTruthy(left)) { 
                    return left; 
                }
                return this.visit(node.right);
            case ("&&"):
                // Corrected logic for AND: return actual value, not boolean
                if (!isTruthy(left)) { 
                    return left; 
                }
                return this.visit(node.right);
            case ("??"):
                // 当左侧操作数为null或undefined时，返回右侧操作数，否则返回左侧操作数
                return (left === null || left === undefined || left === OPTIONAL_CHAIN_NULL)
                    ? this.visit(node.right)
                    : left;
            default:
                right = this.visit(node.right);
        }

        switch (node.token.kind) {
            case ("+"):
                // 特殊处理：左操作数或右操作数是未定义变量，可能是在 Lambda 函数体中
                if (left === null || right === null) {
                    return null;
                }
                testMathOperands("+", left, right);
                return left + right;
            case ("-"):
                if (left === null || right === null) {
                    return null;
                }
                testMathOperands("-", left, right);
                return left - right;
            case ("/"):
                if (left === null || right === null) {
                    return null;
                }
                testMathOperands("/", left, right);
                if (right == 0) {
                    throw new InterpreterError("division by zero");
                }
                return left / right;
            case ("*"):
                if (left === null || right === null) {
                    return null;
                }
                testMathOperands("*", left, right);
                return left * right;
            case ("%"):
                if (left === null || right === null) {
                    return null;
                }
                testMathOperands("%", left, right);
                if (right == 0) {
                    throw new InterpreterError("division by zero in modulo operation");
                }
                return left % right;
            case (">"):
                if (left === null || right === null) {
                    return null;
                }
                testComparisonOperands(">", left, right);
                return left > right;
            case ("<"):
                if (left === null || right === null) {
                    return null;
                }
                testComparisonOperands("<", left, right);
                return left < right;
            case (">="):
                if (left === null || right === null) {
                    return null;
                }
                testComparisonOperands(">=", left, right);
                return left >= right;
            case ("<="):
                if (left === null || right === null) {
                    return null;
                }
                testComparisonOperands("<=", left, right);
                return left <= right;
            case ("!="):
                if (left === null || right === null) {
                    return null;
                }
                testComparisonOperands("!=", left, right);
                return !isEqual(left, right);
            case ("=="):
                if (left === null || right === null) {
                    return null;
                }
                testComparisonOperands("==", left, right);
                return isEqual(left, right);
            case ("**"):
                if (left === null || right === null) {
                    return null;
                }
                testMathOperands("**", left, right);
                return Math.pow(right, left);
            case ("."): {
                // 如果左侧是可选链操作符返回的null，直接返回特殊值
                if (left === OPTIONAL_CHAIN_NULL) {
                    return OPTIONAL_CHAIN_NULL;
                }
                
                // 如果左侧为null或undefined，抛出错误
                if (left === null || left === undefined) {
                    throw new InterpreterError(`cannot access property "${right}" of null or undefined`);
                }
                
                if (isObject(left)) {
                    if (left.hasOwnProperty(right)) {
                        return left[right];
                    }
                    // 属性不存在时抛出错误
                    throw new InterpreterError(`object has no property "${right}"`);
                }
                throw expectationError('infix: .', 'objects');
            }
            case ("?."): {
                // 如果左侧为null或undefined，或者是特殊值，返回特殊值
                if (left === null || left === undefined || left === OPTIONAL_CHAIN_NULL) {
                    return OPTIONAL_CHAIN_NULL;
                }
                
                if (isObject(left)) {
                    if (left.hasOwnProperty(right)) {
                        return left[right];
                    }
                    // 属性不存在时返回特殊值
                    return OPTIONAL_CHAIN_NULL;
                }
                throw expectationError('infix: ?.', 'objects');
            }
            case ("in"): {
                if (left === null || right === null) {
                    return null;
                }
                if (isObject(right)) {
                    if (!isString(left)) {
                        throw expectationError('Infix: in-object', 'string on left side');
                    }
                    right = Object.keys(right);
                } else if (isString(right)) {
                    if (!isString(left)) {
                        throw expectationError('Infix: in-string', 'string on left side');
                    }
                    return right.indexOf(left) !== -1;
                } else if (!isArray(right)) {
                    throw expectationError('Infix: in', 'Array, string, or object on right side');
                }
                return right.some(r => isEqual(left, r));
            }
        }
    }

    visit_List(node) {
        let list = [];

        if (node.list[0] !== undefined) {
            node.list.forEach(function (item) {
                list.push(this.visit(item))
            }, this);
        }

        return list
    }

    visit_ValueAccess(node) {
        let array = this.visit(node.arr);
        
        // 如果array是可选链操作符返回的null，直接返回特殊值
        if (array === OPTIONAL_CHAIN_NULL) {
            return OPTIONAL_CHAIN_NULL;
        }
        
        // 如果array为undefined或null，直接返回null
        if (array === undefined || array === null) {
            return null;
        }
        
        let left = 0, right = null;

        if (node.left) {
            left = this.visit(node.left);
        }
        if (node.right) {
            right = this.visit(node.right);
        }
        const slice_or_index = (isInterval, value, left, right) => {
            if (left < 0) {
                left = value.length + left
                if (left < 0)
                    left = 0;
            }
            if (isInterval) {
                right = right === null ? value.length : right;
                if (right < 0) {
                    right = value.length + right;
                    if (right < 0)
                        right = 0
                }
                if (left > right) {
                    left = right
                }
                if (!isInteger(left) || !isInteger(right)) {
                    throw new InterpreterError('cannot perform interval access with non-integers');
                }
                return value.slice(left, right)
            }
            if (!isInteger(left)) {
                throw new InterpreterError('should only use integers to access arrays or strings');
            }
            if (left >= value.length) {
                throw new InterpreterError('index out of bounds');
            }
            return value[left]
        };
        if (isArray(array)) {
            return slice_or_index(node.isInterval, array, left, right);
        }
        if (isString(array)) {
            // If the string is entirely one-byte characters (i.e. ASCII), we can
            // simply use `String.prototype.slice`.
            /*eslint no-control-regex: "off"*/
            if (/^[\x00-\x7F]*$/.test(array)) {
                return slice_or_index(node.isInterval, array, left, right);
            }
            // Otherwise, we need to convert it to an array of characters first,
            // slice that, and convert back.
            let res = slice_or_index(node.isInterval, [...array], left, right)
            if (isArray(res)) {
                res = res.join('');
            }
            return res;
        }
        if (!isObject(array)) {
            throw expectationError(`infix: "[..]"`, 'object, array, or string');
        }

        if (!isString(left)) {
            throw new InterpreterError('object keys must be strings');
        }

        if (array.hasOwnProperty(left)) {
            return array[left];
        } else {
            return null;
        }
    }

    visit_ContextValue(node) {
        if (this.context.hasOwnProperty(node.token.value)) {
            let contextValue = this.context[node.token.value];
            return contextValue
        }
        // 当上下文值不存在时返回null，而不是抛出错误
        return null;
    }

    visit_FunctionCall(node) {
        let args = [];

        let funcName = this.visit(node.name);
        
        // 如果funcName是可选链操作符返回的null，直接返回特殊值
        if (funcName === OPTIONAL_CHAIN_NULL) {
            return OPTIONAL_CHAIN_NULL;
        }
        
        if (isFunction(funcName)) {
            node.args.forEach(function (item) {
                args.push(this.visit(item))
            }, this);
            if (funcName.hasOwnProperty("jsone_builtin")) {
                args.unshift(this.context);
            }
            return funcName.apply(null, args);
        } else {
            throw new InterpreterError(`${funcName} is not callable`);
        }
    }

    visit_Object(node) {
        let obj = {};

        for (let key in node.obj) {
            obj[key] = this.visit(node.obj[key])
        }

        return obj
    }

    visit_Lambda(node) {
        const params = node.params;
        const body = node.body;
        const context = this.context;
        
        // 创建一个新的函数，该函数在调用时会执行Lambda表达式的主体
        const lambdaFunction = function(...args) {
            // 创建一个新的上下文，包含原始上下文和参数绑定
            const newContext = Object.assign({}, context);
            
            // 将参数绑定到参数名
            params.forEach((param, index) => {
                if (index < args.length) {
                    newContext[param] = args[index];
                }
            });
            
            // 使用新的上下文解释函数体
            const interpreter = new Interpreter(newContext);
            return interpreter.visit(body);
        };
        
        // 标记为内置函数，以便在调用时能够正确处理
        lambdaFunction.jsone_builtin = false;
        
        return lambdaFunction;
    }

    interpret(tree) {
        let result = this.visit(tree);
        // 如果结果是可选链操作符返回的null，转换为实际的null
        if (result === OPTIONAL_CHAIN_NULL) {
            return null;
        }
        return result;
    }
}

let isEqual = (a, b) => {
    if (isArray(a) && isArray(b) && a.length === b.length) {
        for (let i = 0; i < a.length; i++) {
            if (!isEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    if (isFunction(a)) {
        return a === b;
    }
    if (isObject(a) && isObject(b)) {
        let keys = Object.keys(a).sort();
        if (!isEqual(keys, Object.keys(b).sort())) {
            return false;
        }
        for (let k of keys) {
            if (!isEqual(a[k], b[k])) {
                return false;
            }
        }
        return true;
    }
    return a === b;
};

let testMathOperands = (operator, left, right) => {
    if (operator === '+' && !(isNumber(left) && isNumber(right) || isString(left) && isString(right))) {
        throw expectationError('infix: +', 'numbers/strings + numbers/strings');
    }
    if (['-', '*', '/', '**', '%'].some(v => v === operator) && !(isNumber(left) && isNumber(right))) {
        throw expectationError(`infix: ${operator}`, `number ${operator} number`);
    }
    return
};

let testComparisonOperands = (operator, left, right) => {
    if (operator === '==' || operator === '!=') {
        return null;
    }

    let test = ['>=', '<=', '<', '>'].some(v => v === operator)
        && (isNumber(left) && isNumber(right) || isString(left) && isString(right));

    if (!test) {
        throw expectationError(`infix: ${operator}`, `numbers/strings ${operator} numbers/strings`);
    }
    return
};

exports
    .Interpreter = Interpreter;
