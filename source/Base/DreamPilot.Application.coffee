class DreamPilot.Application
    self = @

    @create: (className, $element) ->
        classSource = $dp.fn.stringToFunction className
        return new classSource $element

    constructor: (@$element) ->
        @setupScope()
        .setupAttributes()

    @appAttr = 'app'
    @classAttr = 'class'
    @showAttr = 'show'

    getScope: ->
        @Scope

    setupScope: ->
        @Scope = new $dp.Scope()
        @

    setupAttributes: ->
        @setupClassAttribute()
        .setupShowAttribute()

    setupClassAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.classAttr)).each ->
            $el = $dp.e @
            obj = $dp.Parser.object $el.attr $dp.attribute self.classAttr

            for cssClass, expression of obj
                $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, that

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    console.log 'changed: ', field, '=', value, 'class', cssClass
                    $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, that

            true

        @

    setupShowAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.showAttr)).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.showAttr

            $el.toggle $dp.Parser.isExpressionTrue expression, that

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    $el.toggle $dp.Parser.isExpressionTrue expression, that

            true

        @
