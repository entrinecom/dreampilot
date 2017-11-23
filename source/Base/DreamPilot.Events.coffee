class DreamPilot.Events
    self = @

    events: [
        'click'
        'focus'
        'blur'
        'change'
        'keypress'
        'keyup'
        'keydown'
        'mouseover'
        'mouseout'
    ]

    constructor: (@App) ->
        @setupEvents()

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
                $dp.Parser.executeExpressions expression, that.App

            true

        @
