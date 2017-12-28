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
        @Scope = new $dp.Scope()
        @

    setupEvents: ->
        @Events = new $dp.Events @
        @

    setupAttributes: ->
        @Attributes = new $dp.Attributes @
        @

    linkToScope: (keys...) ->
        for key in keys
            if $dp.fn.isArray key
                @linkToScope key...
                continue
            type = typeof @[key]
            if type is 'function'
                @getScope().set key, (args...) => @[key] args...
            else if type isnt 'undefined'
                obj = @[key]
                @getScope().set key, obj
                if obj instanceof DreamPilot.Model
                    obj.setParent @getScope(), key
            else
                $dp.log.print "Key #{key} not found in application"
        @
