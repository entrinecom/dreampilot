class DreamPilot.Parser
    self = @

    constructor: ->

    @quotes: '\'"`'
    @operators:
        binary:
            '+': (a, b) -> a + b
            '-': (a, b) -> a - b
            '*': (a, b) -> a * b
            '/': (a, b) -> a / b
            '%': (a, b) -> a % b
            '>': (a, b) -> a > b
            '>=': (a, b) -> a >= b
            '<': (a, b) -> a < b
            '<=': (a, b) -> a <= b
            '==': (a, b) -> `a == b`
            '===': (a, b) -> a is b
            '!=': (a, b) -> `a != b`
        unary:
            '-': (a) -> -a
            '+': (a) -> -a
            '!': (a) -> !a
        logical:
            '&&': (a, b) -> a and b
            '||': (a, b) -> a or b
    @lastUsedVariables: []

    @object: (dataStr, options = {}) ->
        options = $dp.fn.extend
            delimiter: ','
            assign: ':'
            curlyBracketsNeeded: true
        , options

        dataStr = $dp.fn.trim dataStr
        if options.curlyBracketsNeeded
            return null if dataStr[0] isnt '{' or dataStr.slice(-1) isnt '}'
            dataStr = dataStr.slice 1, dataStr.length - 1

        o = {}
        pair =
            key: ''
            value: ''
        addPair = ->
            o[$dp.fn.trim(pair.key)] = pair.value #$dp.fn.trim
            pair.key = pair.value = ''
        quoteOpened = null
        underCursor = 'key'

        for ch, i in dataStr
            skip = false
            isSpace = /\s/.test ch
            isQuote = ch in self.quotes

            if isQuote
                unless quoteOpened
                    quoteOpened = ch
                    #skip = true
                else if quoteOpened and ch is quoteOpened
                    quoteOpened = null
                    #skip = true
                #console.log 'opened', quoteOpened

            if underCursor is 'border' and not isSpace
                underCursor = 'value'
            else if not quoteOpened
                if ch is options.assign
                    underCursor = 'border'
                #else if underCursor is 'key' and isSpace
                #    skip = true
                else if ch is options.delimiter
                    underCursor = 'key'
                    addPair()
                    skip = true

            pair[underCursor] += ch if underCursor in ['key', 'value'] and not skip

        addPair() if pair.key or pair.value
        o

    @evalNode: (node, Scope, element = null) ->
        unless Scope instanceof DreamPilot.Model or node.type in ['Literal', 'ThisExpression']
            throw 'Scope should be a DreamPilot.Model instance, but ' + typeof Scope + " given (#{Scope})"
        #if $dp.fn.getType(Scope) isnt 'object'
        #    throw 'Scope should be an object, but ' + $dp.fn.getType(Scope) + " given: #{$dp.fn.print_r(Scope)}"
        switch node.type
            when 'CallExpression'
                if node.callee.type? and node.callee.type is 'Identifier' and node.callee.name
                    args = (self.evalNode arg, Scope, element for arg in node.arguments)
                    fn = Scope.get node.callee.name
                    if fn and typeof fn is 'function'
                        fn args...
                    else
                        fn = Scope[node.callee.name]
                        if fn and typeof fn is 'function'
                            Scope[node.callee.name] args...
                        else
                            $dp.log.error "No function '#{node.callee.name}' found in scope"
                else
                    throw 'Unable to call node, type: ' + node.callee.type + ', name: ' + node.callee.name
            when 'BinaryExpression'
                if typeof self.operators.binary[node.operator] is 'undefined'
                    throw 'No callback for binary operator ' + node.operator
                self.operators.binary[node.operator] self.evalNode(node.left, Scope, element), self.evalNode(node.right, Scope, element)
            when 'UnaryExpression'
                if typeof self.operators.unary[node.operator] is 'undefined'
                    throw 'No callback for unary operator ' + node.operator
                self.operators.unary[node.operator] self.evalNode(node.argument, Scope, element)
            when 'LogicalExpression'
                if typeof self.operators.logical[node.operator] is 'undefined'
                    throw 'No callback for logical operator ' + node.operator
                self.operators.logical[node.operator] self.evalNode(node.left, Scope, element), self.evalNode(node.right, Scope, element)
            when 'MemberExpression'
                obj = self.evalNode node.object, Scope, element
                self.evalNode node.property, obj, element
            when 'Identifier'
                self.lastUsedVariables.push node.name
                if Scope instanceof DreamPilot.Model
                    Scope.get node.name
                else
                    if Scope[node.name]? then Scope[node.name] else null
            when 'Literal' then node.value
            when 'ThisExpression' then element
            else throw 'Unknown node type ' + node.type

    @getExpressionNamespace: (node, useLast = false) ->
        namespace = []
        while true
            namespace.push node.name or node.property.name or node.property.value
            break unless node = node.object
        $dp.fn.arrayReverse namespace.slice if useLast then 0 else 1

    @getScopeOf: (expr, Scope) ->
        node = jsep expr
        useLast = false
        if node.type is 'CallExpression' and node.callee?.object?
            node = node.callee.object
            useLast = true
        if node.type isnt 'MemberExpression'
            return Scope

        namespace = self.getExpressionNamespace node, useLast
        for key in namespace
            Scope = Scope.get key
            break unless Scope
        Scope

    @getPropertyOfExpression: (expr) ->
        node = jsep expr
        if node.type is 'MemberExpression'
            node.property.name
        else if node.type is 'CallExpression' and node.callee?.property?.name?
            arguments: node.arguments
            callee: node.callee.property
            type: node.type
        else
            expr

    @isExpressionTrue: (expr, App, element = App.getActiveElement()) ->
        try
            self.lastUsedVariables = []
            !! self.evalNode jsep(expr), App.getScope(), element
        catch e
            $dp.log.error 'Expression parsing (isExpressionTrue) error ', e, expr
            false

    @executeExpressions: (allExpr, App, element = App.getActiveElement()) ->
        rows = @object allExpr,
            delimiter: ';'
            assign: '='
            curlyBracketsNeeded: false
        self.lastUsedVariables = []
        for key, expr of rows
            try
                if key.indexOf('(') > -1 and expr is ''
                    Scope = $dp.Parser.getScopeOf key, App.getScope()
                    method = $dp.Parser.getPropertyOfExpression key
                    method = jsep method if $dp.fn.getType(method) is 'string'
                    self.evalNode method, Scope, element
                else
                    Scope = $dp.Parser.getScopeOf expr, App.getScope()
                    method = $dp.Parser.getPropertyOfExpression expr
                    method = jsep method if $dp.fn.getType(method) is 'string'
                    App.getScope().set key, self.evalNode method, Scope, element
            catch e
                throw e
                $dp.log.error 'Expression parsing (executeExpressions) error', e, ':', key, expr
                false
        true

    @getLastUsedVariables: ->
        self.lastUsedVariables
