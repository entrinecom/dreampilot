class DreamPilot.Collection
    constructor: ->
        @defineBasics()
        @init()

    defineBasics: ->
        @modelClassName = null
        @isIdUnique = true
        @items = []
        @callbacks =
            load: {}
        @

    init: -> @

    getCount: -> $dp.fn.arrayCount @items
    getItems: -> @items

    setApp: (@App) -> @
    getApp: -> @App

    # dataRows: json rows from BE
    addItems: (dataRows) ->
        @addItem data for data in dataRows
        @

    addItem: (data) ->
        data = @extendDataBeforeAdd DreamPilot.Model.prepareData data
        model = @getNewItem data
        @putModelToList model

    kill: ->
        @items = []
        @

    # can be overridden to set default values for the data
    extendDataBeforeAdd: (data) -> data

    tuneModelAfterCreation: (model) ->
        model.setApp @getApp()
        @

    getIdForPut: (model) ->
        if @isIdUnique then model.getId() else $dp.fn.arrayCount @items

    putModelToList: (model) ->
        id = @getIdForPut model
        if @exists id
            @getById(id).set model.get()
        else
            @items.push
                id: id
                model: model
        @

    map: (callbackOrField) ->
        ar = []
        for idx, row of @items
            if $dp.fn.getType(callbackOrField) is 'function'
                ar.push callbackOrField row.model, idx
            else
                ar.push row.model.get callbackOrField
        ar

    createInstance: ->
        col = Object.create Object.getPrototypeOf(@), Object.getOwnPropertyDescriptors(@)
        col.kill()

    filter: (callback) ->
        col = @createInstance()
        for idx, row of @items
            col.addItem row.model if callback row.model
        col

    getIds: ->
        keys = []
        keys.push row.model.getId() for idx, row of @items

    getById: (id) ->
        for idx, row of @items
            return row.model if row.model.getId() is id
        @getNewItem()

    exists: (id) ->
        for idx, row of @items
            return true if row.model.getId() is id
        false

    getNewItem: (data = null) ->
        className = $dp.fn.stringToFunction @modelClassName
        m = new className data
        @tuneModelAfterCreation m
        m

    getFirstItem: ->
        return @getNewItem() unless @getCount()
        @items.slice(0, 1)[0].model

    getLastItem: ->
        return @getNewItem() unless @getCount()
        @items.slice(@getCount() - 1, 1)[0].model

    getLoadMethod: -> $dp.transport.GET
    getLoadUrl: -> throw 'Redefine Collection.getLoadUrl() method first'
    getLoadData: -> null
    load: ->
        $dp.transport.request @getLoadMethod(), @getLoadUrl(), @getLoadData(), (result) =>
            @onLoaded result
        @

    getKeyForLoadedData: -> 'items'
    checkIfLoadIsOk: (result) -> result.ok
    showLoadError: (result) ->
        if @getApp()
            @getApp().showCollectionLoadError result.message
        else
            alert result.message
        @
    filterLoadedData: (result) -> if result[@getKeyForLoadedData()]? then result[@getKeyForLoadedData()] else result

    onLoaded: (result) ->
        unless @checkIfLoadIsOk result
            @showLoadError result
            return @
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
