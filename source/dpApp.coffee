class dpApp
    constructor: (@$element) ->
        @setupAttributes()

    @appAttr = 'app'
    @classAttr = 'class'

    setupAttributes: ->
        DreamPilot.e(DreamPilot.selectorForAttribute(dpApp.classAttr)).each ->
            $el = DreamPilot.e @
            parseTree = jsep $el.attr DreamPilot.attribute dpApp.classAttr
            console.log parseTree
        @