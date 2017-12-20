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

    e: (selector) ->
        $dp.e selector, @$wrapper

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
