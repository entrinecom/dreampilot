class CollectionApp extends DreamPilot.Application
    init: ->
        @loadChat()

    loadChat: ->
        @col = new ChatCollection()
        .onLoad (col) ->
            col.map (model) ->
                model.display()
        .load()
        @
