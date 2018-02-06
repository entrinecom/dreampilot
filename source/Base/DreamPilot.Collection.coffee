class DreamPilot.Collection
    constructor: ->
        @modelClassName = null
        @items = {}
        @init()

    init: -> @

    getCount: -> $dp.fn.arrayCount @items

    # dataRows: json rows from BE
    addItems: (dataRows) ->
        @addItem data for data in dataRows

    addItem: (data) ->
        data = @extendDataBeforeAdd data
        className = $dp.fn.stringToFunction @modelClassName
        model = new className data
        @tuneModelAfterCreation model
        model

    # can be overridden to set default values for the data
    extendDataBeforeAdd: (data) -> data

    tuneModelAfterCreation: (model) -> @

    putModelToList: (model) ->
        @list[model.getId()] = model
        @
