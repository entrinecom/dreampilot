class dpApp
    self = @

    constructor: (@$element) ->
        @setupAttributes()

    @appAttr = 'app'
    @classAttr = 'class'

    setupAttributes: ->
        $dp.e($dp.selectorForAttribute(self.classAttr)).each ->
            $el = $dp.e @
            obj = Parser.object $el.attr $dp.attribute self.classAttr

            for k,v of obj
                console.log '[' + k + '] =', v

            #parseTree = jsep $el.attr DreamPilot.attribute dpApp.classAttr
            #console.log parseTree
        @