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

    @isExpressionTrue: (expr, App) ->
        evalNode = (node) ->
            switch node.type
                when 'BinaryExpression'
                    if typeof self.operators.binary[node.operator] is 'undefined'
                        throw 'No callback for binary operator ' + node.operator
                    self.operators.binary[node.operator] evalNode(node.left), evalNode(node.right)
                when 'UnaryExpression'
                    if typeof self.operators.unary[node.operator] is 'undefined'
                        throw 'No callback for unary operator ' + node.operator
                    self.operators.unary[node.operator] evalNode(node.argument)
                when 'LogicalExpression'
                    if typeof self.operators.logical[node.operator] is 'undefined'
                        throw 'No callback for logical operator ' + node.operator
                    self.operators.logical[node.operator] evalNode(node.left), evalNode(node.right)
                when 'Identifier'
                    self.lastUsedVariables.push node.name
                    App.getScope().get node.name
                when 'Literal' then node.value
                else throw 'Unknown node type ' + node.type

        try
            self.lastUsedVariables = []
            !! evalNode jsep expr
        catch e
            console.log 'Expression parsing error ', e
            false

    @executeExpression: (expr, App) ->
        rows = @object expr,
            delimiter: ';'
            assign: '='
            curlyBracketsNeeded: false
        console.log rows

    @getLastUsedVariables: ->
        self.lastUsedVariables
