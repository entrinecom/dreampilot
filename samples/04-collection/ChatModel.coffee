class ChatModel extends DreamPilot.Model
    getUserId: -> $dp.fn.int @get 'user_id'
    getUser: -> @getApp().getUsersCol().get @getUserId()
    getName: -> @getUser().getName()
    getCreatedAt: -> @get 'created_at'
    getContent: -> @get 'content'
    setContent: (content) -> @set 'content', content
    linkUser: ->
        #console.log @getUser()
        @set user: @getUser()
        @

    init: ->
        @set 'user', new UserModel
        @

    defineBasics: ->
        super()
        @idField = '_id'
        @idIsInt = false
        @

    display: ->
        chatBox = $dp.e 'ul.chat-box'
        cue = $dp.e '<li dp-click="chatClick(this, $event)" dp-class="{tiny: isTiny}">{0} ({1}): {2}</li>'.format @getName(), @getCreatedAt(), @getContent()
        chatBox.append cue
        @getApp().embraceDomElement cue
        @

    displayFiltered: ->
        chatBox = $dp.e 'ul.chat-box-filtered'
        cue = $dp.e '<li dp-click="chatClick(this, $event)" dp-class="{tiny: isTiny}">{0} ({1}): {2}</li>'.format @getName(), @getCreatedAt(), @getContent()
        chatBox.append cue
        @getApp().embraceDomElement cue
        @

    displayEmbraced: ->
        chatBox = $dp.e 'ul.chat-box-embraced'
        cue = $dp.e """<li dp-click="chatClick(this, $event)">
    <span dp-value-read-from="col['#{@getId()}'].user.name"></span> (<span dp-value-read-from="col['#{@getId()}'].created_at"></span>):
    <span dp-value-read-from="col['#{@getId()}'].content"></span>
    <span dp-show="col['#{@getId()}'].user.id">user id test</span>
</li>"""
        chatBox.append cue
        @getApp().embraceDomElement cue
        @

    getFetchUrl: -> 'data.json' #'/api/chat/get/'
