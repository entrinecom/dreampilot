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
        .init()

    # override this method in child classes
    init: ->
        @

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

    linkToScope: (keys) ->
        keys = [keys] if typeof keys isnt 'object'
        for key in keys
            type = typeof @[key]
            if type is 'function'
                @getScope().set key, (args...) => @[key] args...
            else if type isnt 'undefined'
                @getScope().set key, @[key]
            else
                $dp.log.print "Key #{key} not found in application"
        @
