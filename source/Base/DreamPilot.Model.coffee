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
                cb field, value for cb in callbacks.change[field]
        @

    exists: (field) ->
        typeof data[field] isnt 'undefined'

    onChange: (field, callback) ->
        callbacks.change[field] = [] unless callbacks.change[field]?
        callbacks.change[field].push callback
        @

    getApp: ->
        @App