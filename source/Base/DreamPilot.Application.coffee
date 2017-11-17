class DreamPilot.Application
    self = @

    @appAttr = 'app'
    @classAttr = 'class'
    @showAttr = 'show'
    @ifAttr = 'if'

    hiddenElements: {}

    @create: (className, $element) ->
        classSource = $dp.fn.stringToFunction className
        return new classSource $element

    constructor: (@$element) ->
        @setupScope()
        .setupAttributes()

    getScope: ->
        @Scope

    setupScope: ->
        @Scope = new $dp.Scope()
        @

    setupAttributes: ->
        @setupClassAttribute()
        .setupShowAttribute()
        .setupIfAttribute()

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

    toggleElementExistence: ($element, state) ->
        # todo
        console.log $element, state
        @

    setupIfAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.ifAttr)).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.ifAttr

            that.toggleElementExistence $el, $dp.Parser.isExpressionTrue expression, that

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    that.toggleElementExistence $el, $dp.Parser.isExpressionTrue expression, that

            true

        @
