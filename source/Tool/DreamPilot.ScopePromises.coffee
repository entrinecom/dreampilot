class DreamPilot.ScopePromises
    list: []
    interval: null
    delay: 20

    constructor: ->

    add: (options) ->
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
                Scope = $dp.Parser.getScopeOf rec['field'], rec['scope']
                if Scope
                    rec.cb Scope
                    @remove idx
        , @delay
        @
