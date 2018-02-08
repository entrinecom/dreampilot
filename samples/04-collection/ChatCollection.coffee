class ChatCollection extends DreamPilot.Collection
    defineBasics: ->
        super()
        @modelClassName = 'ChatModel'
        @

    getLoadUrl: -> 'data.json'
    getKeyForLoadedData: -> 'chat_cues'
