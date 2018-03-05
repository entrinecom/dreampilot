class ChatModel extends DreamPilot.Model
    getName: -> @get 'name'
    getCreatedAt: -> @get 'created_at'
    getContent: -> @get 'content'
    setName: (name) -> @set 'name', name
    setContent: (content) -> @set 'content', content

    defineBasics: ->
        super()
        @idField = '_id'
        @idIsInt = false
        @

    display: ->
        chatBox = $dp.e 'ul.chat-box'
        cue = $dp.e '<li dp-click="chatClick(this, $event)" dp-class="{tiny: isTiny}">{0} ({1}): {2}</li>'.format @get('name'), @get('created_at'), @get('content')
        chatBox.append cue
        @getApp().embraceDomElement cue
        @

    displayFiltered: ->
        chatBox = $dp.e 'ul.chat-box-filtered'
        cue = $dp.e '<li dp-click="chatClick(this, $event)" dp-class="{tiny: isTiny}">{0} ({1}): {2}</li>'.format @get('name'), @get('created_at'), @get('content')
        chatBox.append cue
        @getApp().embraceDomElement cue
        @

    displayEmbraced: ->
        chatBox = $dp.e 'ul.chat-box-embraced'
        cue = $dp.e """<li dp-click="chatClick(this, $event)">
    <span dp-value-read-from="col['#{@getId()}'].name"></span> (<span dp-value-read-from="col['#{@getId()}'].created_at"></span>):
    <span dp-value-read-from="col['#{@getId()}'].content"></span>
</li>"""
        chatBox.append cue
        @getApp().embraceDomElement cue
        @

    getFetchUrl: -> 'data.json' #'/api/chat/get/'
