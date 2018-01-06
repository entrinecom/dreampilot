class DreamPilot.Application
    self = @

    @appAttr = 'app'

    @create: (className, $wrapper) ->
        classSource = $dp.fn.stringToFunction className
        return new classSource $wrapper

    activeElement: null

    constructor: (@$wrapper) ->
        @setupScope()
        .setupAttributes()
        .setupEvents()
        .init()

    # override this method in child classes
    init: -> @

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

    setActiveElement: (element) ->
        @activeElement = element
        @

    resetActiveElement: -> @setActiveElement null

    getActiveElement: -> @activeElement

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
                do (key) => @getScope().set key, (args...) => @[key] args...
            else if type isnt 'undefined'
                obj = @[key]
                obj.setParent @getScope(), key if obj instanceof DreamPilot.Model
                @getScope().set key, obj
                #console.log 'set parent', key, obj
            else
                $dp.log.print "Key #{key} not found in application"
        @
