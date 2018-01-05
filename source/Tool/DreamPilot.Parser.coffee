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
        options = jQuery.extend
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

    @evalNode: (node, Scope) ->
        unless Scope instanceof DreamPilot.Model
            throw 'Scope should be a DreamPilot.Model instance, but ' + typeof Scope + " given (#{Scope})"
        switch node.type
            when 'CallExpression'
                if node.callee.type? and node.callee.type is 'Identifier' and node.callee.name
                    args = (self.evalNode arg for arg in node.arguments)
                    fn = Scope.get node.callee.name
                    if fn and typeof fn is 'function'
                        fn args...
                    else
                        $dp.log.error "No function '#{node.callee.name}' found in scope"
                else
                    throw 'Unable to call node, type: ' + node.callee.type + ', name: ' + node.callee.name
            when 'BinaryExpression'
                if typeof self.operators.binary[node.operator] is 'undefined'
                    throw 'No callback for binary operator ' + node.operator
                self.operators.binary[node.operator] self.evalNode(node.left, Scope), self.evalNode(node.right, Scope)
            when 'UnaryExpression'
                if typeof self.operators.unary[node.operator] is 'undefined'
                    throw 'No callback for unary operator ' + node.operator
                self.operators.unary[node.operator] self.evalNode(node.argument, Scope)
            when 'LogicalExpression'
                if typeof self.operators.logical[node.operator] is 'undefined'
                    throw 'No callback for logical operator ' + node.operator
                self.operators.logical[node.operator] self.evalNode(node.left, Scope), self.evalNode(node.right, Scope)
            when 'MemberExpression'
                obj = self.evalNode node.object, Scope
                self.evalNode node.property, obj
            when 'Identifier'
                self.lastUsedVariables.push node.name
                Scope.get node.name
            when 'Literal' then node.value
            else throw 'Unknown node type ' + node.type

    @getScopeOf: (expr, Scope) ->
        node = jsep expr
        if node.type is 'MemberExpression'
            self.evalNode node.object, Scope
        else
            Scope

    @getPropertyOfExpression: (expr) ->
        node = jsep expr
        if node.type is 'MemberExpression'
            node.property.name
        else
            expr

    @isExpressionTrue: (expr, App) ->
        try
            self.lastUsedVariables = []
            !! self.evalNode jsep(expr), App.getScope()
        catch e
            $dp.log.error 'Expression parsing (isExpressionTrue) error ', e, expr
            false

    @executeExpressions: (allExpr, App) ->
        rows = @object allExpr,
            delimiter: ';'
            assign: '='
            curlyBracketsNeeded: false
        self.lastUsedVariables = []
        for key, expr of rows
            try
                if key.indexOf('(') > -1 and expr is ''
                    self.evalNode jsep(key), App.getScope()
                else
                    App.getScope().set key, self.evalNode(jsep(expr), App.getScope())
            catch e
                $dp.log.error 'Expression parsing (executeExpressions) error', e, ':', key, expr
                false
        true

    @getLastUsedVariables: ->
        self.lastUsedVariables
