class DreamPilot.Application
    self = @

    @appAttr = 'app'

    @create: (className, $wrapper) ->
        classSource = $dp.fn.stringToFunction className
        return new classSource $wrapper

    constructor: (@$wrapper) ->
        @setupScope()
        .setupAttributes()
        .setupEvents()

    getWrapper: ->
        @$wrapper

    getScope: ->
        @Scope

    getEvents: ->
        @Events

    getAttributes: ->
        @Attributes

    setupScope: ->
        @Scope = new $dp.Scope @
        @

    setupEvents: ->
        @Events = new $dp.Events @
        @

    setupAttributes: ->
        @Attributes = new $dp.Attributes @
        @
