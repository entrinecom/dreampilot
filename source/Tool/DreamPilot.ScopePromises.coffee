class DreamPilot.ScopePromises
    list: []
    interval: null
    delay: 20

    constructor: ->

    add: (options) ->
        for idx, rec of @list
            if rec['expression']? and options['expression']? and rec['expression'] is options['expression']
                return @
        @list.push options
        @initCheck()
        @

    remove: (idx) ->
        @list.splice idx, 1
        @resetCheck() unless @list.length
        @

    resetCheck: ->
        clearInterval @interval
        @

    initCheck: ->
        return @ if @interval
        @interval = setInterval =>
            for idx, rec of @list
                if rec['expression']?
                    $dp.Parser.isExpressionTrue rec['expression'], rec['app'], rec['element']
                    #console.log 'last errors', $dp.Parser.getLastErrors()
                    unless $dp.Parser.hasLastErrors()
                        Scopes = $dp.Parser.getLastScopes()
                        vars = $dp.Parser.getLastUsedVariables()
                        rec.cb rec['app'], Scopes, vars
                        @remove idx
                else
                    Scope = $dp.Parser.getScopeOf rec['field'], rec['scope']
                    if Scope
                        rec.cb Scope
                        @remove idx
        , @delay
        @
