class DreamPilot.Attributes
    self = @

    @classAttr = 'class'
    @showAttr = 'show'
    @ifAttr = 'if'
    @initAttr = 'init'
    @valueWriteToAttr = 'value-write-to'
    @valueReadFromAttr = 'value-read-from'
    @valueBindAttr = 'value-bind'

    constructor: (@App) ->
        @setupAttributes()

    setupAttributes: ->
        @setupInitAttribute()
        .setupClassAttribute()
        .setupShowAttribute()
        .setupIfAttribute()
        .setupValueBindAttribute()
        .setupValueWriteToAttribute()
        .setupValueReadFromAttribute()

    getApp: ->
        @App

    getScope: ->
        @getApp().getScope()

    getWrapper: ->
        @getApp().getWrapper()

    setupClassAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.classAttr), @getWrapper()).each ->
            $el = $dp.e @
            obj = $dp.Parser.object $el.attr $dp.attribute self.classAttr

            # todo: keep parsed expressions as closures connected to elements
            for cssClass, expression of obj
                $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, that.getApp()

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    # console.log 'changed CLASS: ', field, '=', value, ':', cssClass
                    $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, that.getApp()

            true

        @

    setupShowAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.showAttr), @getWrapper()).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.showAttr

            $el.toggle $dp.Parser.isExpressionTrue expression, that.getApp()

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    # console.log 'changed SHOW: ', field, '=', value
                    $el.toggle $dp.Parser.isExpressionTrue expression, that.getApp()

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

        $dp.e($dp.selectorForAttribute(self.ifAttr), @getWrapper()).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.ifAttr

            that.toggleElementExistence $el, $dp.Parser.isExpressionTrue(expression, that.getApp()), expression

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    # console.log 'changed IF: ', field, '=', value, expression
                    that.toggleElementExistence $el, $dp.Parser.isExpressionTrue(expression, that.getApp()), expression

            true

        @

    setupInitAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.initAttr), @getWrapper()).each ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.initAttr

            $dp.Parser.executeExpressions expression, that

            true

        @

    setupValueWriteToAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.valueWriteToAttr), @getWrapper()).each ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueWriteToAttr

            $el.on 'input', =>
                value = $dp.fn.getValueOfElement $el
                that.getScope().set field, value
            $el.trigger 'input' if $el.val()

            true

        @

    setupValueReadFromAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.valueReadFromAttr), @getWrapper()).each ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueReadFromAttr

            that.getScope().onChange field, (field, value) ->
                $dp.fn.setValueOfElement $el, value
            that.getScope().trigger 'change', field if that.getScope().get field

            true

        @

    setupValueBindAttribute: ->
        that = @

        $dp.e($dp.selectorForAttribute(self.valueBindAttr), @getWrapper()).each ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueBindAttr

            console.log '---:', field, that.getScope()
            console.log $dp.Parser.evalNode jsep(field), that.getScope()

            $el.on 'input', =>
                value = $dp.fn.getValueOfElement $el
                that.getScope().set field, value
            $el.trigger 'input' if $el.val()

            that.getScope().onChange field, (field, value) ->
                $dp.fn.setValueOfElement $el, value
            that.getScope().trigger 'change', field if that.getScope().get field

            #console.log 'that.getScope().onChange field =', field

            true

        @