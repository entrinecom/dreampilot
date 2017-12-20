class DreamPilot.Model
    data = {}
    callbacks =
        change: {}

    constructor: (@App) ->

    get: (field) ->
        if @exists field then data[field] else null

    has: (field) ->
        if @exists field then !!data[field] else false

    set: (field, value = null) ->
        if typeof field is 'object' and value is null
            @set k, v for k, v of field
        else
            data[field] = value
            if callbacks.change[field]?
                cb field, value for cbId, cb of callbacks.change[field]
        @

    exists: (field) ->
        typeof data[field] isnt 'undefined'

    getSaveMethod: ->
        $dp.transport.POST

    getSaveUrl: ->
        throw 'Redefine Model.getSaveUrl() method first'

    getSaveData: ->
        data

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
        while not callbackId or typeof callbacks[action][field][callbackId] isnt 'undefined'
            callbackId = dp.fn.uniqueId()
        callbacks[action] = {} unless callbacks[action]?
        callbacks[action][field] = {} unless callbacks[action][field]?
        callbacks[action][field][callbackId] = callback
        @

    off: (action, field, callbackId) ->
        delete callbacks[action][field][callbackId]
        @

    onChange: (field, callback, callbackId = null) ->
        @on 'change', field, callback, callbackId

    getApp: ->
        @App