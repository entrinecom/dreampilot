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
            o[$dp.fn.trim(pair.key)] = $dp.fn.trim pair.value
            pair.key = pair.value = ''
        quoteOpened = null
        underCursor = 'key'

        for ch, i in dataStr
            skip = false

            if ch in self.quotes
                unless quoteOpened
                    quoteOpened = ch
                    skip = true
                else if quoteOpened and ch is quoteOpened
                    quoteOpened = null
                    skip = true

            unless quoteOpened
                switch
                    when ch is options.assign
                        underCursor = 'border'
                    when underCursor is 'border' and not /\s/.test ch
                        underCursor = 'value'
                    when ch is options.delimiter
                        underCursor = 'key'
                        addPair()
                        skip = true

            pair[underCursor] += ch if underCursor isnt 'border' and not skip

        addPair() if pair.key or pair.value
        o

    @evalNode: (node, App) ->
        switch node.type
            when 'CallExpression'
                console.log node
            when 'BinaryExpression'
                if typeof self.operators.binary[node.operator] is 'undefined'
                    throw 'No callback for binary operator ' + node.operator
                self.operators.binary[node.operator] self.evalNode(node.left, App), self.evalNode(node.right, App)
            when 'UnaryExpression'
                if typeof self.operators.unary[node.operator] is 'undefined'
                    throw 'No callback for unary operator ' + node.operator
                self.operators.unary[node.operator] self.evalNode(node.argument, App)
            when 'LogicalExpression'
                if typeof self.operators.logical[node.operator] is 'undefined'
                    throw 'No callback for logical operator ' + node.operator
                self.operators.logical[node.operator] self.evalNode(node.left, App), self.evalNode(node.right, App)
            when 'Identifier'
                self.lastUsedVariables.push node.name
                App.getScope().get node.name
            when 'Literal' then node.value
            else throw 'Unknown node type ' + node.type

    @isExpressionTrue: (expr, App) ->
        try
            self.lastUsedVariables = []
            !! self.evalNode jsep(expr), App
        catch e
            console.log 'Expression parsing (isExpressionTrue) error ', e
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
                    self.evalNode jsep(key), App
                    console.log 'function: ', key, jsep key
                else
                    App.getScope().set key, self.evalNode jsep(expr), App
                    console.log 'simple assign: ', key, App.getScope().get key
            catch e
                console.log 'Expression parsing (executeExpressions) error', e
                false
        true

    @getLastUsedVariables: ->
        self.lastUsedVariables
