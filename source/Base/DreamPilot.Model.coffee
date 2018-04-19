class DreamPilot.Model
    self = @

    constructor: (_data = {}) ->
        @defineBasics()
        @initFrom _data
        .init()

    defineBasics: ->
        @data = {}
        @origData = {}
        @relatedData = {}
        @parent = null
        @parentField = null
        @assignModelToParent = true
        @assignChildModels = true
        @saveTimeout = null
        @saveDelay = 1000
        @callbacks =
            change: {}
        @actionCallbacks =
            save: {}
            fetch: {}
            delete: {}
        @mainScope = false
        @idField = 'id'
        @idIsInt = true
        @domElement = null
        @

    # override this method in child classes
    init: -> @

    @prepareData: (data = {}) ->
        data = JSON.parse data if $dp.fn.getType(data) is 'string'
        throw 'Data should be an object' unless $dp.fn.getType(data) is 'object'
        data = data.get() if data instanceof DreamPilot.Model
        $dp.fn.extend true, {}, data

    initFrom: (data = {}) ->
        @data = self.prepareData data
        @trigger 'change', field for field, value of @data
        @

    setApp: (@App) -> @
    getApp: -> @App
    e: (selector) -> @getApp().e selector

    getDomElement: -> @domElement
    hasDomElement: -> @getDomElement()?.length?
    setDomElement: (@domElement) -> @
    removeDomElement: ->
        @getDomElement().remove() if @hasDomElement()
        @domElement = null
        @

    setParent: (@parent, @parentField) ->
        suitableParent = @parent instanceof DreamPilot.Model or @parent instanceof DreamPilot.Collection
        if @parent and not suitableParent
            throw 'Parent can be only DreamPilot.Model/Collection'
        @

    get: (field = null) ->
        # model inside model logic
        if field and typeof field is 'string'
            children = field.split '.'
            if children.length > 1
                child = children[0]
                field = children.slice(1).join '.'
                if @exists child
                    model = @data[child]
                    if model instanceof DreamPilot.Model
                        return model.get field
                    else
                        return if typeof model[field] isnt 'undefined' then model[field] else null
                else
                    return null
        return @data if field is null
        if @exists field then @data[field] else null

    has: (field) -> if @exists field then !!@data[field] else false

    set: (field, value = null) ->
        if typeof field is 'object' and value is null
            @set k, v for k, v of field
        else
            if value instanceof DreamPilot.Model and @assignChildModels and value.assignModelToParent
                if @exists(field) and @get(field) instanceof DreamPilot.Model
                    # todo: solve this. the code below doesn't keep all embraced events and other links
                    #@kill field
                    #.set field, value
                    @data[field].set value.get()
                else
                    @data[field] = value
                @data[field].setParent @, field
                @trigger 'change', field
            else
                oldValue = @data[field]
                @data[field] = value
                @trigger 'change', field if oldValue isnt value
        @

    exists: (field = null) ->
        if field?
            typeof @data[field] isnt 'undefined'
        else
            $dp.fn.bool $dp.fn.arrayCount @data

    kill: (field = null) ->
        if field is null
            keys = $dp.fn.keys @data
            @data = {}
            @trigger 'change', f for f in keys
        else if $dp.fn.getType(field) is 'array'
            @kill f for f in field
        else
            delete @data[field] if @data[field]?
            @trigger 'change', field
        @

    hasOrig: (field) -> if @existsOrig field then !!@origData[field] else false

    getOrigData: (field = null) ->
        return @origData if field is null
        if @existsOrig field then @origData[field] else null

    setOrigData: (field = null, value = null) ->
        if field is null
            @origData = @data
        else
            if typeof field is 'object' and value is null
                @setOrigData k, v for k, v of field
            else
                @origData[field] = value
        @

    existsOrig: (field = null) ->
        if field?
            typeof @origData[field] isnt 'undefined'
        else
            $dp.fn.bool $dp.fn.arrayCount @origData

    killOrig: (field = null) ->
        if field is null
            @origData = {}
        else if $dp.fn.getType(field) is 'array'
            @killOrig f for f in field
        else
            delete @origData[field] if @origData[field]?
        @

    isMyId: (id) ->
        if $dp.fn.isArray id
            if @idIsInt
                id = id.map (x) => $dp.fn.int x
            @getId() in id
        else
            id = $dp.fn.int id if @idIsInt
            @getId() is id

    getId: -> @extractIdFromResult @data

    hasId: -> @has @idField

    setId: (id) ->
        id = $dp.fn.int id if @idIsInt
        @set @idField, id

    resetId: -> @setId null

    getOrigId: -> @extractIdFromResult @origData

    hasOrigId: -> @hasOrig @idField

    setOrigId: (id) ->
        id = $dp.fn.int id if @idIsInt
        @setOrigData @idField, id

    resetOrigId: -> @setOrigId null

    getRelated: (field = null) ->
        return @relatedData if field is null
        if @existsRelated field then @relatedData[field] else null

    hasRelated: (field) -> if @existsRelated field then !!@relatedData[field] else false

    setRelated: (field, value = null) ->
        if typeof field is 'object' and value is null
            @setRelated k, v for k, v of field
        else
            @relatedData[field] = value
        @

    existsRelated: (field) -> typeof @relatedData[field] isnt 'undefined'

    changed: (field = null) ->
        if $dp.fn.getType(field) is 'array'
            keys = field
        else if field is null
            keys = $dp.fn.keys(@data) or $dp.fn.keys(@origData)
        else
            keys = [field]
        for key in keys
            val = @get key
            origVal = @getOrigData key
            if $dp.fn.isArray(val) and $dp.fn.isArray(origVal)
                return true unless $dp.fn.arraysEq val, origVal
            else
                return true if @get(key) isnt @getOrigData(key)
        false

    changedFields: (excludeFields = []) ->
        keys = $dp.fn.keys(@data) or $dp.fn.keys(@origData)
        changedKeys = []
        for key in keys
            changedKeys.push key if key not in excludeFields and @changed key
        changedKeys

    isMainScope: -> @mainScope

    getSaveMethod: -> $dp.transport.POST
    getSaveUrl: -> throw 'Redefine Model.getSaveUrl() method first'
    getSaveData: -> @get()

    needToUpdateId: (newId) -> not @hasId() and newId

    updateId: (newId) ->
        @setId newId if @needToUpdateId newId
        @

    save: ->
        $dp.transport.request @getSaveMethod(), @getSaveUrl(), @getSaveData(), (result) =>
            @tryToUpdateId result
            .onSaved result
            @triggerAction 'save', result
        @

    delayedSave: ->
        clearTimeout @saveTimeout if @saveTimeout
        @saveTimeout = setTimeout =>
            @save()
        , @saveDelay
        @

    extractIdFromResult: (result) ->
        id = result[@idField]
        id = $dp.fn.int id if @idIsInt
        id

    tryToUpdateId: (result) ->
        newId = @extractIdFromResult result
        @updateId newId
        @

    onSaved: (result) ->
        $dp.log.print 'onSaved', result
        @

    getFetchMethod: ->
        $dp.transport.GET

    getFetchUrl: ->
        throw 'Redefine Model.getFetchUrl() method first'

    getFetchData: ->
        null

    fetch: ->
        $dp.transport.request @getFetchMethod(), @getFetchUrl(), @getFetchData(), (result) =>
            @onFetched result
            @triggerAction 'fetch', result
        @

    onFetched: (result) ->
        $dp.log.print 'onFetched', result
        @

    getDeleteMethod: ->
        method: $dp.transport.DELETE
        dataType: $dp.transport.PAYLOAD

    getDeleteUrl: -> throw 'Redefine Model.getDeleteUrl() method first'
    getDeleteData: -> null

    delete: ->
        $dp.transport.request @getDeleteMethod(), @getDeleteUrl(), @getDeleteData(), (result) =>
            @onDeleted result
            @triggerAction 'delete', result
        @

    onDeleted: (result) ->
        $dp.log.print 'onDeleted', result
        @

    on: (actions, fields, callback, callbackId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        fields = [fields] unless $dp.fn.isArray fields
        for action in actions
            for field in fields
                while not callbackId or @callbacks[action]?[field]?[callbackId]?
                    callbackId = $dp.fn.uniqueId()
                @callbacks[action] = {} unless @callbacks[action]?
                @callbacks[action][field] = {} unless @callbacks[action][field]?
                @callbacks[action][field][callbackId] = callback
                callbackId = null
        @

    off: (actions, fields, callbackId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        fields = [fields] unless $dp.fn.isArray fields
        for action in actions
            for field in fields
                if callbackId
                    delete @callbacks[action][field][callbackId]
                else
                    @callbacks[action][field] = {}
        @

    trigger: (action, field, callbackId) ->
        value = @get field
        if @callbacks[action]?[field]?
            for cbId, cb of @callbacks[action][field]
                cb field, value if not callbackId or cbId is callbackId
            # console.log 'parent trigger', action, @parentField if @parent
            @parent.trigger action, @parentField if @parent
        if @callbacks[action]?['*']?
            for cbId, cb of @callbacks[action]['*']
                cb field, value if not callbackId or cbId is callbackId
            # console.log 'parent trigger', action, @parentField if @parent
            # @parent.trigger action, @parentField if @parent
        @

    onAction: (actions, callback, callbackId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        for action in actions
            while not callbackId or @actionCallbacks[action]?[callbackId]?
                callbackId = $dp.fn.uniqueId()
            @actionCallbacks[action] = {} unless @actionCallbacks[action]?
            @actionCallbacks[action][callbackId] = callback
            callbackId = null
        @

    offAction: (actions, callbackId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        for action in actions
            if callbackId
                delete @actionCallbacks[action][callbackId]
            else
                @actionCallbacks[action] = {}
        @

    triggerAction: (action, result, callbackId) ->
        if @actionCallbacks[action]?
            for cbId, cb of @actionCallbacks[action]
                cb result if not callbackId or cbId is callbackId
        # console.log 'parent trigger', action if @parent
        @parent.triggerAction action, result if @parent and @parent.triggerAction
        @

    onChange: (fields, callback, callbackId = null) -> @on 'change', fields, callback, callbackId

    onSave: (callback, callbackId = null) -> @onAction 'save', callback, callbackId
    onFetch: (callback, callbackId = null) -> @onAction 'fetch', callback, callbackId
    onDelete: (callback, callbackId = null) -> @onAction 'delete', callback, callbackId
