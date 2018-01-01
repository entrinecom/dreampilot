class DreamPilot.Model
    data: {}
    relatedData: {}
    parent: null
    parentField: null
    callbacks:
        change: {}

    constructor: (_data = {}) ->
        @initFrom _data

    initFrom: (_data = {}) ->
        if typeof _data is 'string'
            _data = JSON.parse _data

        if typeof _data is 'object'
            if _data instanceof DreamPilot.Model
                @data = _data.get()
            else
                @data = _data
        else
            throw 'Data should be an object'

        for field, value of _data
            @trigger 'change', field

        @

    setParent: (@parent, @parentField) ->
        if @parent and not @parent instanceof DreamPilot.Model
            throw 'Parent can be only DreamPilot.Model'

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

    has: (field) ->
        if @exists field then !!@data[field] else false

    set: (field, value = null) ->
        if typeof field is 'object' and value is null
            @set k, v for k, v of field
        else
            @data[field] = value
            @trigger 'change', field
        @

    exists: (field) ->
        typeof @data[field] isnt 'undefined'

    getRelated: (field = null) ->
        return @relatedData if field is null
        if @existsRelated field then @relatedData[field] else null

    hasRelated: (field) ->
        if @existsRelated field then !!@relatedData[field] else false

    setRelated: (field, value = null) ->
        if typeof field is 'object' and value is null
            @setRelated k, v for k, v of field
        else
            @relatedData[field] = value
        @

    existsRelated: (field) ->
        typeof @relatedData[field] isnt 'undefined'

    getSaveMethod: ->
        $dp.transport.POST

    getSaveUrl: ->
        throw 'Redefine Model.getSaveUrl() method first'

    getSaveData: ->
        @get()

    save: ->
        $dp.transport.request @getSaveMethod(), @getSaveUrl(), @getSaveData(), (result) =>
            @onSaved result
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
        @

    onFetched: (result) ->
        $dp.log.print 'onFetched', result
        @

    on: (action, field, callback, callbackId = null) ->
        while not callbackId or @callbacks[action]?[field]?[callbackId]?
            callbackId = $dp.fn.uniqueId()
        @callbacks[action] = {} unless @callbacks[action]?
        @callbacks[action][field] = {} unless @callbacks[action][field]?
        @callbacks[action][field][callbackId] = callback
        @

    off: (action, field, callbackId) ->
        delete @callbacks[action][field][callbackId]
        @

    trigger: (action, field, callbackId) ->
        if @callbacks[action]?[field]?
            value = @get field
            for cbId, cb of @callbacks[action][field]
                cb field, value if not callbackId or cbId is callbackId
            console.log 'parent trigger', action, @parentField if @parent
            @parent.trigger action, @parentField if @parent
        @

    onChange: (field, callback, callbackId = null) ->
        @on 'change', field, callback, callbackId
