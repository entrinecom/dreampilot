class DreamPilot.Attributes
    self = @

    @classAttr = 'class'
    @showAttr = 'show'
    @ifAttr = 'if'
    @initAttr = 'init'
    @valueWriteToAttr = 'value-write-to'
    @valueReadFromAttr = 'value-read-from'
    @valueBindAttr = 'value-bind'
    @ScopePromises = new DreamPilot.ScopePromises()

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

    eachByAttr: (attr, callback) ->
        $dp.e($dp.selectorForAttribute(attr), @getWrapper()).each callback
        @

    setupClassAttribute: ->
        that = @

        @eachByAttr self.classAttr, ->
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

        @eachByAttr self.showAttr, ->
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

        @eachByAttr self.ifAttr, ->
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

        @eachByAttr self.initAttr, ->
            $el = $dp.e @
            expression = $el.attr $dp.attribute self.initAttr

            $dp.Parser.executeExpressions expression, that

            true

        @

    setupValueWriteToAttribute: ->
        that = @

        @eachByAttr self.valueWriteToAttr, ->
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

        @eachByAttr self.valueReadFromAttr, ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueReadFromAttr

            that.getScope().onChange field, (field, value) ->
                $dp.fn.setValueOfElement $el, value
            that.getScope().trigger 'change', field if that.getScope().get field

            true

        @

    setupValueBindAttribute: ->
        that = @

        @eachByAttr self.valueBindAttr, ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueBindAttr
            Scope = $dp.Parser.getScopeOf field, that.getScope()

            if Scope is null
                that.ScopePromises.add
                    field: field
                    $element: $el
                return true

            $el.on 'input', =>
                value = $dp.fn.getValueOfElement $el
                Scope.set field, value
            $el.trigger 'input' if $el.val()

            Scope.onChange field, (field, value) ->
                $dp.fn.setValueOfElement $el, value
            Scope.trigger 'change', field if Scope.get field

            console.log 'that.getScope().onChange field =', field

            true

        @