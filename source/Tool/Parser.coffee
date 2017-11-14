class Parser
    self = @

    constructor: ->

    @quotes: '\'"`'

    @object: (dataStr) ->
        dataStr = $dp.fn.trim dataStr
        if dataStr[0] isnt '{' or dataStr.slice(-1) isnt '}'
            return null
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
                    when ch is ':'
                        underCursor = 'border'
                    when underCursor is 'border' and not /\s/.test ch
                        underCursor = 'value'
                    when ch is ','
                        underCursor = 'key'
                        addPair()
                        skip = true

            pair[underCursor] += ch if underCursor isnt 'border' and not skip

        addPair() if pair.key or pair.value
        o

$dp.parser = Parser if $dp
