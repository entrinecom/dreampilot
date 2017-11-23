class DreamPilot.Application
    self = @

    @appAttr = 'app'
    @classAttr = 'class'
    @showAttr = 'show'
    @ifAttr = 'if'
    @initAttr = 'init'

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
        .setupInitAttribute()

    setupClassAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.classAttr)).each ->
            $el = $dp.e @
            obj = $dp.Parser.object $el.attr $dp.attribute self.classAttr

            # todo: keep parsed expressions as closures connected to elements
            for cssClass, expression of obj
                $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, that

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    #console.log 'changed CLASS: ', field, '=', value, ':', cssClass
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
                    #console.log 'changed SHOW: ', field, '=', value
                    $el.toggle $dp.Parser.isExpressionTrue expression, that

            true

        @

    getReplacerFor: ($element, expression) ->
        return $element.data 'replacer' if $element.data 'replacer'

        $replacer = $ "<!-- dp-if: #{expression} --><script type='text/placeholder'></script><!-- end of dp-if: #{expression} -->"
        $element.data 'replacer', $replacer

        $replacer

    toggleElementExistence: ($element, state, expression) ->
        if state
            unless document.body.contains $element.get 0
                $anchor = @getReplacerFor($element, expression).filter 'script'
                $element.insertAfter $anchor
        else
            $element
            .after @getReplacerFor $element, expression
            .detach()
        @

    setupIfAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.ifAttr)).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.ifAttr

            that.toggleElementExistence $el, $dp.Parser.isExpressionTrue(expression, that), expression

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    #console.log 'changed IF: ', field, '=', value, expression
                    that.toggleElementExistence $el, $dp.Parser.isExpressionTrue(expression, that), expression

            true

        @

    setupInitAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.initAttr)).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.initAttr

            $dp.Parser.executeExpressions expression, that

            true

        @
