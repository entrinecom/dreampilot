class DreamPilot.Application
    self = @

    @appAttr = 'app'

    @allowMultipleInstances: false

    @create: (className, $wrapper) ->
        classSource = $dp.fn.stringToFunction className
        return new classSource $wrapper

    @multipleInstancesAllowed: (className) ->
        classSource = $dp.fn.stringToFunction className
        $dp.fn.bool classSource.allowMultipleInstances

    constructor: (@$wrapper) ->
        @activeElement = null
        @setupScope()
        .init()
        @setupAttributes()
        .setupEvents()

    # override this method in child classes
    init: -> @

    e: (selector) -> $dp.e selector, @getWrapper()

    getWrapper: -> @$wrapper
    getWrapperData: (key) -> @getWrapper().data key
    getScope: -> @Scope
    getEvents: -> @Events
    getAttributes: -> @Attributes

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

    embraceDomElement: (el) ->
        throw 'Unable to embrace empty element' unless el
        $el = $dp.e el
        @getEvents().setupEvents $el
        @getAttributes().setupAttributes $el
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
                @getScope().set key, obj
                #console.log 'set parent', key, obj
            else
                $dp.log.print "Key #{key} not found in application"
        @

    showError: (message) ->
        alert message
        @
    showCollectionLoadError: (message) -> @showError message
    showModelLoadError: (message) -> @showError message
    showModelSaveError: (message) -> @showError message
