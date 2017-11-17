class DreamPilot.Model
    data = {}
    callbacks =
        change: {}

    constructor: ->

    get: (field) ->
        if typeof data[field] isnt 'undefined' then data[field] else null

    set: (field, value = null) ->
        if typeof field is 'object' and value is null
            for k, v of field
                @set k, v
        else
            data[field] = value
            callbacks.change[field]?()
        @

    onChange: (field, callback) ->
        callbacks.change[field] = callback
        @
