class ChatModel extends DreamPilot.Model
    getUserId: -> $dp.fn.int @get 'user_id'
    getUser: -> if @getApp().getUsersCol() then @getApp().getUsersCol().get @getUserId() else new UserModel
    getName: -> @getUser().getName() or ''
    getCreatedAt: -> @get 'created_at'
    getContent: -> @get 'content'
    setContent: (content) -> @set 'content', content
    getVisible: -> $dp.fn.bool @get 'visible'
    linkUser: ->
        @set user: @getUser()
        @

    init: ->
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
    <span>
        <input type="checkbox" dp-value-bind="col['#{@getId()}'].visible" id="visible-#{@getId()}">
        <label for="visible-#{@getId()}">Visible</label>
    </span>
    <span dp-show="col['#{@getId()}'].user.id" dp-title="col['#{@getId()}'].user.id">[user id test]</span>
    <span><button dp-click="col['#{@getId()}'].user.setRandomName()">Set random name to user</button></span>
</li>"""
        chatBox.append cue
        @getApp().embraceDomElement cue
        @

    getFetchUrl: -> 'data.json' #'/api/chat/get'
