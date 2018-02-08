class DreamPilot.Collection
    constructor: ->
        @defineBasics()
        @init()

    defineBasics: ->
        @modelClassName = null
        @isIdUnique = true
        @items = {}
        @callbacks =
            load: {}
        @

    init: -> @

    getCount: -> $dp.fn.arrayCount @items
    getItems: -> @items

    # dataRows: json rows from BE
    addItems: (dataRows) ->
        @addItem data for data in dataRows
        @

    addItem: (data) ->
        data = @extendDataBeforeAdd data
        model = @getNewItem data
        @tuneModelAfterCreation model
        @putModelToList model
        model

    # can be overridden to set default values for the data
    extendDataBeforeAdd: (data) -> data

    tuneModelAfterCreation: (model) -> @

    getKeyForPut: (model) ->
        if @isIdUnique then model.getId() else $dp.fn.arrayCount @items

    putModelToList: (model) ->
        @items[@getKeyForPut(model)] = model
        @

    map: (callbackOrField) ->
        ar = []
        for k, model of @items
            if $dp.fn.getType(callbackOrField) is 'function'
                ar.push callbackOrField model, k
            else
                ar.push model.get callbackOrField
        ar

    getKeys: -> $dp.fn.keys @items

    getNewItem: (data = null) ->
        className = $dp.fn.stringToFunction @modelClassName
        new className data

    getFirstItem: ->
        return @getNewItem() unless @getCount()
        key = @getKeys()[0]
        @items[key]

    getLoadMethod: -> $dp.transport.GET
    getLoadUrl: -> throw 'Redefine Collection.getLoadUrl() method first'
    getLoadData: -> null
    load: ->
        $dp.transport.request @getLoadMethod(), @getLoadUrl(), @getLoadData(), (result) =>
            @onLoaded result
        @

    getKeyForLoadedData: -> 'items'
    filterLoadedData: (result) -> if result[@getKeyForLoadedData()]? then result[@getKeyForLoadedData()] else result

    onLoaded: (result) ->
        @addItems @filterLoadedData result
        .trigger 'load'
        @

    on: (actions, callback, callbackId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        for action in actions
            while not callbackId or @callbacks[action]?[callbackId]?
                callbackId = $dp.fn.uniqueId()
            @callbacks[action] = {} unless @callbacks[action]?
            @callbacks[action][callbackId] = callback
            callbackId = null
        @

    off: (actions, callbackId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        for action in actions
            if callbackId
                delete @callbacks[action][callbackId]
            else
                @callbacks[action] = {}
        @

    trigger: (action, callbackId) ->
        if @callbacks[action]?
            for cbId, cb of @callbacks[action]
                cb @ if not callbackId or cbId is callbackId
        @

    onLoad: (callback, callbackId = null) ->
        @on 'load', callback, callbackId
