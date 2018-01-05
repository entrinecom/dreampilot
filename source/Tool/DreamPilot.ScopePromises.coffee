class DreamPilot.ScopePromises
    list: {}
    interval: null
    delay: 20

    constructor: ->

    add: (options) ->
        @list[options.field] = options
        @initCheck()
        @

    remove: (field) ->
        delete @list[field]
        @resetCheck() unless @list.length
        @

    resetCheck: ->
        clearInterval @interval
        @

    initCheck: ->
        return @ if @interval
        @interval = setInterval =>
            for field, rec of @list
                Scope = $dp.Parser.getScopeOf field, rec['scope']
                if Scope
                    rec.cb Scope
                    @remove field
        , @delay
        @
