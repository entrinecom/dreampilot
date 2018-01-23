class DreamPilot.Events
    self = @

    events: [
        'click'
        'dblclick'
        'focus'
        'blur'
        'change'
        'keypress'
        'keyup'
        'keydown'
        'mouseover'
        'mouseout'
        'mousemove'
        'mousedown'
        'mouseup'
        'wheel'
        'paste'
        'input'
        'submit'
    ]

    constructor: (@App) ->
        @setupEvents()

    getApp: -> @App

    getScope: -> @getApp().getScope()

    setupEvents: ->
        @setupSingleEvent event for event in @events
        @

    setupSingleEvent: (name) ->
        that = @

        $dp.e($dp.selectorForAttribute(name), @App.$element).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute name

            $el.on name, (event) ->
                #event = event || window.event
                that.App.setActiveElement @
                $dp.Parser.executeExpressions expression, that.App, @
                that.App.resetActiveElement()

            true

        @
