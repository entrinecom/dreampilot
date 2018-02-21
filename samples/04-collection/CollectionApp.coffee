class CollectionApp extends DreamPilot.Application
    init: ->
        @loadChat()
        .linkToScope ['chatClick']
        @getScope().set isTiny: true
        @

    loadChat: ->
        @col = new ChatCollection()
        .setApp @
        .onLoad (col) ->
            col.map (model) -> model.display()

            filteredCol = col.filter (model) -> model.get('name') is 'James'
            filteredCol.map (model) -> model.displayFiltered()
        .load()
        @

    chatClick: (el, event) ->
        console.log 'chatClick', el, event
        @
