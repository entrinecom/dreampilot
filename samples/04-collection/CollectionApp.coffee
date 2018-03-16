class CollectionApp extends DreamPilot.Application
    init: ->
        @m = new DreamPilot.Model()
        .set id: 100500

        @users = new UserCollection()
        .setApp @
        .addItem id: 1, name: 'James', nick: 'Papa'
        .addItem id: 2, name: 'Lars', nick: 'Danish'

        @loadChat()
        .linkToScope ['chatClick', 'col', 'm', 'btnClick']
        @getScope().set isTiny: true

        @testModel = new ChatModel()
        .onFetch (result) ->
            console.log 'fetched', result
        .fetch()

        @

    getUsersCol: -> @users

    loadChat: ->
        @col = new ChatCollection()
        .setApp @
        .onLoad (col) ->
            col.map (model) ->
                model
                .linkUser()
                .display()
                .displayEmbraced()

            filteredCol = col.filter (model) -> model.getName() is 'James'
            filteredCol.map (model) -> model.displayFiltered()
        .load()
        @

    btnClick: ->
        $z = $dp.e """<div dp-value-read-from="m.id" style="background: yellow; padding: 10px;"></div>"""
        .appendTo document.body
        @embraceDomElement $z
        console.log @col
        @col.removeItem '5a6207e9a069b208bc0063b7'
        console.log @col
        @

    chatClick: (el, event) ->
        console.log 'chatClick', el, event, @col.getItems()
        @col.map (cue) ->
            cue.setContent cue.getContent() + '!!!'

        @
