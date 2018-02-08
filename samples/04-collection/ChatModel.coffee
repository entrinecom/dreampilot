class ChatModel extends DreamPilot.Model
    defineBasics: ->
        super()
        @idField = '_id'
        @idIsInt = false
        @

    display: ->
        chatBox = $dp.e 'ul.chat-box'
        cue = $dp.e '<li>{0} ({1}): {2}</li>'.format @get('name'), @get('created_at'), @get('content')
        chatBox.append cue
        @
