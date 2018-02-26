class CollectionApp extends DreamPilot.Application
    init: ->
        @m = new DreamPilot.Model()
        .set id: 100500

        @loadChat()
        .linkToScope ['chatClick', 'col', 'm', 'btnClick']
        @getScope().set isTiny: true
        @

    loadChat: ->
        @col = new ChatCollection()
        .setApp @
        .onLoad (col) ->
            col.map (model) -> model.display().displayEmbraced()

            filteredCol = col.filter (model) -> model.get('name') is 'James'
            filteredCol.map (model) -> model.displayFiltered()
        .load()
        @

    btnClick: ->
        $z = $dp.e """<div dp-value-read-from="m.id" style="background: yellow; padding: 10px;"></div>"""
        .appendTo document.body
        @embraceDomElement $z
        @

    chatClick: (el, event) ->
        console.log 'chatClick', el, event, @col.getItems()
        @col.map (cue) ->
            cue.setContent cue.getContent() + '!!!'

        @
