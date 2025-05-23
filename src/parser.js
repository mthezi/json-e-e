const {UnaryOp, BinOp, Primitive, ContextValue, FunctionCall, ValueAccess, List, Object, Lambda} = require("../src/AST");
const {SyntaxError} = require('./error');

let syntaxRuleError = (token, expects) => {
    expects.sort();
    return new SyntaxError(`Found: ${token.value} token, expected one of: ${expects.join(', ')}`, token);
};

class Parser {
    constructor(tokenizer, source, offset = 0) {
        this._source = source;
        this._tokenizer = tokenizer;
        this.current_token = this._tokenizer.next(this._source, offset);
        this.unaryOpTokens = ["-", "+", "!"];
        this.primitivesTokens = ["number", "null", "true", "false", "string"];
        this.operations = [["||"], ["&&"], ["??"], ["?"], ["in"], ["==", "!="], ["<", ">", "<=", ">="], ["+", "-"], ["*", "/", "%"], ["**"]];
        this.expectedTokens = ["!", "(", "+", "-", "[", "false", "identifier", "null", "number", "string", "true", "{"];

    }

    takeToken(...kinds) {
        if (this.current_token == null) {
            throw new SyntaxError('Unexpected end of input');
        }

        if (kinds.length > 0 && kinds.indexOf(this.current_token.kind) === -1) {
            throw syntaxRuleError(this.current_token, kinds);
        }
        try {
            this.current_token = this._tokenizer.next(this._source, this.current_token.end);
        } catch (err) {
            throw err;
        }
    }

    parse(level = 0) {
        //expr : logicalAnd (OR logicalAnd)*
        //logicalAnd : inStatement (AND inStatement)*
        //inStatement : equality (IN equality)*
        //equality : comparison (EQUALITY | INEQUALITY  comparison)*
        //comparison : addition (LESS | GREATER | LESSEQUAL | GREATEREQUAL addition)*
        //addition : multiplication (PLUS | MINUS multiplication)* "
        //multiplication : exponentiation (MUL | DIV exponentiation)*
        //exponentiation : propertyAccessOrFunc (EXP exponentiation)*
        //ternary : condition ? trueExpr : falseExpr
        let node;
        if (level == this.operations.length - 1) {
            node = this.parsePropertyAccessOrFunc();
            let token = this.current_token;

            for (; token != null && this.operations[level].indexOf(token.kind) !== -1; token = this.current_token) {
                this.takeToken(token.kind);
                node = new BinOp(token, this.parse(level), node);
            }
        } else if (level == 3 && this.operations[level].indexOf("?") !== -1) {
            // 处理三目运算符 condition ? trueExpr : falseExpr
            node = this.parse(level + 1);
            if (this.current_token && this.current_token.kind === "?") {
                let questionToken = this.current_token;
                this.takeToken("?");
                let trueExpr = this.parse(level + 1);  // 解析 ? 后面的表达式，使用相同的优先级
                
                if (!this.current_token || this.current_token.kind !== ":") {
                    throw new SyntaxError("Expected ':' in ternary operator", this.current_token);
                }
                
                this.takeToken(":");
                let falseExpr = this.parse(level + 1);  // 解析 : 后面的表达式
                
                // 创建一个特殊的三目运算符节点
                node = new BinOp(questionToken, node, {
                    trueExpr: trueExpr,
                    falseExpr: falseExpr,
                    isTernary: true
                });
            }
        } else {
            node = this.parse(level + 1);
            let token = this.current_token;

            for (; token != null && this.operations[level].indexOf(token.kind) !== -1; token = this.current_token) {
                this.takeToken(token.kind);
                node = new BinOp(token, node, this.parse(level + 1));
            }
        }

        return node
    }

    parsePropertyAccessOrFunc() {
        let node = this.parseUnit();
        let operators = ["[", "(", ".", "?."];
        let rightPart;
        for (let token = this.current_token; token != null && operators.indexOf(token.kind) !== -1; token = this.current_token) {
            if (token.kind == "[") {
                node = this.parseAccessWithBrackets(node)
            } else if (token.kind == ".") {
                token = this.current_token;
                this.takeToken(".");
                rightPart = new Primitive(this.current_token);
                this.takeToken("identifier");
                node = new BinOp(token, node, rightPart)
            } else if (token.kind == "?.") {
                token = this.current_token;
                this.takeToken("?.");
                rightPart = new Primitive(this.current_token);
                this.takeToken("identifier");
                node = new BinOp(token, node, rightPart)
            } else if (token.kind == "(") {
                node = this.parseFunctionCall(node)
            }
        }
        return node
    }


    parseUnit() {
        // unit : unaryOp unit | primitives | contextValue | LPAREN expr RPAREN | list | object | lambda
        let token = this.current_token;
        let node;
        let isUnaryOpToken = this.unaryOpTokens.indexOf(token.kind) !== -1;
        let isPrimitivesToken = this.primitivesTokens.indexOf(token.kind) !== -1;
        if (this.current_token == null) {
            throw new SyntaxError('Unexpected end of input');
        }
        if (isUnaryOpToken) {
            this.takeToken(token.kind);
            node = new UnaryOp(token, this.parseUnit());
        } else if (isPrimitivesToken) {
            this.takeToken(token.kind);
            node = new Primitive(token);
        } else if (token.kind == "identifier") {
            // 检查是否是箭头函数的参数
            if (this.checkLambda()) {
                node = this.parseLambda();
            } else {
                this.takeToken(token.kind);
                node = new ContextValue(token);
            }
        } else if (token.kind == "(") {
            // 检查是否是箭头函数的参数列表
            if (this.checkLambdaWithParamList()) {
                node = this.parseLambdaWithParamList();
            } else {
                this.takeToken("(");
                node = this.parse();
                if (node == null) {
                    throw syntaxRuleError(this.current_token, this.expectedTokens);
                }
                this.takeToken(")");
            }
        } else if (token.kind == "[") {
            node = this.parseList();
        } else if (token.kind == "{") {
            node = this.parseObject();
        }
        return node
    }

    // 检查是否是单参数箭头函数
    checkLambda() {
        if (this.current_token && this.current_token.kind === "identifier") {
            // 保存当前位置
            const currentToken = this.current_token;
            
            // 尝试向前看一个token
            try {
                this.takeToken("identifier");
                const nextToken = this.current_token;
                
                // 恢复位置
                this.current_token = currentToken;
                
                // 检查下一个token是否为箭头
                return nextToken && nextToken.kind === "=>";
            } catch (e) {
                // 恢复位置
                this.current_token = currentToken;
                return false;
            }
        }
        return false;
    }

    // 检查是否是带参数列表的箭头函数
    checkLambdaWithParamList() {
        if (this.current_token && this.current_token.kind === "(") {
            // 保存当前位置
            const currentToken = this.current_token;
            
            try {
                // 跳过左括号
                this.takeToken("(");
                
                // 跳过参数
                while (this.current_token && this.current_token.kind !== ")") {
                    if (this.current_token.kind !== "identifier") {
                        // 不是有效的参数
                        this.current_token = currentToken;
                        return false;
                    }
                    this.takeToken("identifier");
                    
                    // 如果有逗号，跳过
                    if (this.current_token && this.current_token.kind === ",") {
                        this.takeToken(",");
                    } else {
                        break;
                    }
                }
                
                // 检查是否有右括号
                if (!this.current_token || this.current_token.kind !== ")") {
                    this.current_token = currentToken;
                    return false;
                }
                this.takeToken(")");
                
                // 检查是否有箭头
                const hasArrow = this.current_token && this.current_token.kind === "=>";
                
                // 恢复位置
                this.current_token = currentToken;
                return hasArrow;
            } catch (e) {
                // 恢复位置
                this.current_token = currentToken;
                return false;
            }
        }
        return false;
    }

    // 解析单参数箭头函数
    parseLambda() {
        const token = this.current_token;
        
        // 解析参数
        const param = this.current_token.value;
        this.takeToken("identifier");
        
        // 解析箭头
        this.takeToken("=>");
        
        // 解析函数体
        const body = this.parse();
        
        return new Lambda(token, [param], body);
    }

    // 解析带参数列表的箭头函数
    parseLambdaWithParamList() {
        const token = this.current_token;
        const params = [];
        
        // 解析左括号
        this.takeToken("(");
        
        // 解析参数列表
        if (this.current_token && this.current_token.kind !== ")") {
            // 解析第一个参数
            if (this.current_token.kind === "identifier") {
                params.push(this.current_token.value);
                this.takeToken("identifier");
            } else {
                throw syntaxRuleError(this.current_token, ["identifier"]);
            }
            
            // 解析其余参数
            while (this.current_token && this.current_token.kind === ",") {
                this.takeToken(",");
                if (this.current_token.kind === "identifier") {
                    params.push(this.current_token.value);
                    this.takeToken("identifier");
                } else {
                    throw syntaxRuleError(this.current_token, ["identifier"]);
                }
            }
        }
        
        // 解析右括号
        this.takeToken(")");
        
        // 解析箭头
        this.takeToken("=>");
        
        // 解析函数体
        const body = this.parse();
        
        return new Lambda(token, params, body);
    }

    parseFunctionCall(name) {
        //    functionCall: LPAREN (expr ( COMMA expr)*)? RPAREN
        let token = this.current_token;
        let node;
        let args = [];
        this.takeToken("(");

        if (this.current_token.kind != ")") {
            node = this.parse();
            args.push(node);

            while (this.current_token != null && this.current_token.kind == ",") {
                if (args[args.length - 1] == null) {
                    throw syntaxRuleError(this.current_token, this.expectedTokens);
                }
                this.takeToken(",");
                node = this.parse();
                args.push(node)
            }
        }
        this.takeToken(")");

        node = new FunctionCall(token, name, args);

        return node
    }

    parseList() {
        //    list : LSQAREBRAKET (expr ( COMMA expr)*)? RSQAREBRAKET)
        let node;
        let arr = [];
        let token = this.current_token;
        this.takeToken("[");

        if (this.current_token.kind != "]") {
            node = this.parse();
            arr.push(node);

            while (this.current_token.kind == ",") {
                if (arr[arr.length - 1] == null) {
                    throw syntaxRuleError(this.current_token, this.expectedTokens);
                }
                this.takeToken(",");
                node = this.parse();
                arr.push(node)
            }
        }
        this.takeToken("]");
        node = new List(token, arr);
        return node
    }

    parseAccessWithBrackets(node) {
        //    valueAccess : LSQAREBRAKET expr |(expr? SEMI expr?)  RSQAREBRAKET)
        let leftArg = null, rightArg = null;
        let token = this.current_token;
        let isInterval = false;

        this.takeToken("[");
        if (this.current_token.kind == "]") {
            throw syntaxRuleError(this.current_token, this.expectedTokens);
        }

        if (this.current_token.kind != ":") {
            leftArg = this.parse();
        }
        if (this.current_token.kind == ":") {
            isInterval = true;
            this.takeToken(":");
        }
        if (this.current_token.kind != "]") {
            rightArg = this.parse();
        }

        if (isInterval && rightArg == null && this.current_token.kind != "]") {
            throw syntaxRuleError(this.current_token, this.expectedTokens);
        }
        this.takeToken("]");
        node = new ValueAccess(token, node, isInterval, leftArg, rightArg);

        return node;
    }

    parseObject() {
        //    object : LCURLYBRACE ( STR | ID SEMI expr (COMMA STR | ID SEMI expr)*)? RCURLYBRACE (DOT ID)?
        let node;
        let obj = {};
        let key, value;
        let objToken = this.current_token;
        this.takeToken("{");
        let token = this.current_token;

        while (token != null && (token.kind == "string" || token.kind == "identifier")) {
            key = token.value;
            if (token.kind == "string") {
                key = parseString(key);
            }
            this.takeToken(token.kind);
            this.takeToken(":");
            value = this.parse();
            if (value == null) {
                throw syntaxRuleError(this.current_token, this.expectedTokens);
            }
            obj[key] = value;
            if (this.current_token != null && this.current_token.kind == "}") {
                break;
            } else {
                this.takeToken(",")
            }
            token = this.current_token;
        }
        this.takeToken("}");
        node = new Object(objToken, obj);

        return node;
    }

}

let
    parseString = (str) => {
        return str.slice(1, -1);
    };


exports
    .Parser = Parser;
