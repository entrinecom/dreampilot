class DreamPilot.Collection
    constructor: ->
        @defineBasics()
        @init()
        @modelClass = $dp.fn.stringToFunction @modelClassName

    defineBasics: ->
        @modelClassName = null
        @isIdUnique = true
        @items = []
        @callbacks =
            change: {}
            before_load: {}
            load: {}
            update: {}
            insert: {}
            put: {}
        @callbackModelIds =
            change: {}
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

    removeItem: (ids, syncWithServer = false) ->
        ids = [ids] unless $dp.fn.isArray ids
        for idx, row of @items
            if row.model.isMyId ids
                row.model.delete() if syncWithServer
                @items.splice idx, 1
        @

    kill: ->
        @items = []
        @

    # can be overridden to set default values for the data
    extendDataBeforeAdd: (data) -> data

    tuneModelAfterCreation: (model) ->
        model.setApp @getApp()
        @

    beforePutModelToList: (model) -> @
    beforeInsertModelInList: (model) -> @
    beforeUpdateModelInList: (model) -> @
    afterPutModelToList: (model) -> @
    afterInsertModelInList: (model) -> @
    afterUpdateModelInList: (model) -> @

    getIdForPut: (model) -> if @isIdUnique then model.getId() else $dp.fn.arrayCount @items

    putModelToList: (model) ->
        @beforePutModelToList model
        id = @getIdForPut model
        if @exists id
            @beforeUpdateModelInList model
            @getById(id).set model.get()
            @afterUpdateModelInList model
            .trigger 'update'
        else
            @beforeInsertModelInList model
            @items.push
                id: id
                model: model
            @afterInsertModelInList model
            .trigger 'insert'
        @get(id).setParent @, id
        @afterPutModelToList model
        .trigger 'put'
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

    get: (id) -> @getById id

    getById: (id) ->
        for idx, row of @items
            return row.model if row.model.isMyId id
        @getNewItem()

    exists: (id) ->
        for idx, row of @items
            return true if row.model.isMyId id
        false

    getNewItem: (data = null) ->
        m = new @modelClass data
        @tuneModelAfterCreation m
        m

    getFirstItem: ->
        return @getNewItem() unless @getCount()
        @items[0].model

    getLastItem: ->
        return @getNewItem() unless @getCount()
        @items[@getCount() - 1].model

    getLoadMethod: -> $dp.transport.GET
    getLoadUrl: -> throw 'Redefine Collection.getLoadUrl() method first'
    getLoadData: -> null
    load: ->
        @trigger 'before_load'
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

    on: (actions, callback, callbackId = null, modelId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        for action in actions
            while not callbackId or @callbacks[action]?[callbackId]?
                callbackId = $dp.fn.uniqueId()
            @callbacks[action] = {} unless @callbacks[action]?
            @callbacks[action][callbackId] = callback
            @callbackModelIds[action][callbackId] = modelId if action is 'change'
            callbackId = null
        @

    off: (actions, callbackId = null) ->
        actions = [actions] unless $dp.fn.isArray actions
        for action in actions
            if callbackId
                delete @callbacks[action][callbackId]
                delete @callbackModelIds[action][callbackId]
            else
                @callbacks[action] = {}
                @callbackModelIds[action] = {}
        @

    trigger: (action, callbackId) ->
        if @callbacks[action]?
            for cbId, cb of @callbacks[action]
                if not callbackId or cbId is callbackId
                    if action is 'change'
                        id = @callbackModelIds[action][cbId]
                        console.log 'collection on change', id
                        #@get(id).trigger action, '*'
                    else
                        cb @
        @

    onChange: (modelId, callback, callbackId) ->
        @on 'change', callback, callbackId, modelId

    onLoad: (callback, callbackId = null) ->
        @on 'load', callback, callbackId

    onBeforeLoad: (callback, callbackId = null) ->
        @on 'before_load', callback, callbackId

    onInsert: (callback, callbackId = null) ->
        @on 'insert', callback, callbackId

    onUpdate: (callback, callbackId = null) ->
        @on 'update', callback, callbackId

    onPut: (callback, callbackId = null) ->
        @on 'put', callback, callbackId
