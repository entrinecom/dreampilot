class DreamPilot.Events
    self = @

    events: [
        'load'
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
    getWrapper: -> @getApp().getWrapper()

    setupEvents: ($element = null) ->
        @setupSingleEvent event, $element for event in @events
        @

    setupSingleEvent: (name, $element = null) ->
        that = @

        $elements = $dp.e $dp.selectorForAttribute(name), $element or @getWrapper()
        $elements = $elements.add $element.filter $dp.selectorForAttribute(name) if $element

        $elements.each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute name

            $el.on name, (event) ->
                event = event or window.event
                that.getApp().setActiveElement @
                $dp.Parser.executeExpressions expression, that.getApp(), @, event
                that.getApp().resetActiveElement()

            true

        @
