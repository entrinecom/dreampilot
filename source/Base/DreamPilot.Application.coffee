class DreamPilot.Application
    self = @

    constructor: (@$element) ->
        @setupScope()
        .setupAttributes()

    @appAttr = 'app'
    @classAttr = 'class'

    getScope: ->
        @Scope

    setupScope: ->
        @Scope = new $dp.Scope()
        @

    setupAttributes: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.classAttr)).each ->
            $el = $dp.e @
            obj = $dp.Parser.object $el.attr $dp.attribute self.classAttr

            for k, v of obj
                $el.toggleClass k, $dp.Parser.isExpressionTrue v, that

            true
        @