class DreamPilot.Attributes
    self = @

    @classAttr = 'class'
    @showAttr = 'show'
    @ifAttr = 'if'
    @initAttr = 'init'
    @valueWriteToAttr = 'value-write-to'
    @valueReadFromAttr = 'value-read-from'
    @valueBindAttr = 'value-bind'

    ScopePromises: null

    constructor: (@App) ->
        @setupScopePromises()
        .setupAttributes()

    setupScopePromises: ->
        @ScopePromises = new DreamPilot.ScopePromises()
        @

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
            el = @
            $el = $dp.e el
            obj = $dp.Parser.object $el.attr $dp.attribute self.classAttr

            # todo: keep parsed expressions as closures connected to elements
            for cssClass, expression of obj
                $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, that.getApp(), el, =>
                    that.classAddPromise cssClass, expression, el

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    # console.log expression, 'changed CLASS: ', field, '=', value, ':', cssClass
                    $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, that.getApp(), el

            true

        @

    classAddPromise: (cssClass, expression, el) ->
        @ScopePromises.add
            expression: expression
            app: @getApp()
            scope: @getScope()
            element: el
            cb: (App, Scopes, vars) =>
                for i in [vars.length - 1..0]
                    for j in [Scopes.length - 1..0]
                        if Scopes[j].exists vars[i]
                            Scopes[j].onChange vars[i], (field, value) ->
                                $el = $dp.e el
                                $el.toggleClass cssClass, $dp.Parser.isExpressionTrue expression, App, el
                            break
                # console.log 'we got', cssClass, expression
        @

    setupShowAttribute: ->
        that = @

        @eachByAttr self.showAttr, ->
            el = @
            $el = $dp.e el
            expression = $el.attr $dp.attribute self.showAttr

            $el.toggle $dp.Parser.isExpressionTrue expression, that.getApp(), el

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    # console.log 'changed SHOW: ', field, '=', value
                    $el.toggle $dp.Parser.isExpressionTrue expression, that.getApp(), el

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
            el = @
            $el = $dp.e el
            expression = $el.attr $dp.attribute self.ifAttr

            that.toggleElementExistence $el, $dp.Parser.isExpressionTrue(expression, that.getApp(), el), expression

            # setting up watchers
            for field in $dp.Parser.getLastUsedVariables()
                that.getScope().onChange field, (field, value) ->
                    # console.log 'changed IF: ', field, '=', value, expression
                    that.toggleElementExistence $el, $dp.Parser.isExpressionTrue(expression, that.getApp(), el), expression

            true

        @

    setupInitAttribute: ->
        that = @
        @eachByAttr self.initAttr, ->
            el = @
            $el = $dp.e el
            expression = $el.attr $dp.attribute self.initAttr
            $dp.Parser.executeExpressions expression, that, el
            true
        @

    setupValueWriteToAttribute: ->
        that = @
        @eachByAttr self.valueWriteToAttr, ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueWriteToAttr
            Scope = $dp.Parser.getScopeOf field, that.getScope()
            return true if self.bindValueCheckScope field, $el, Scope, that, false, true
            self.bindValueWriteToAttribute field, $el, Scope
        @

    setupValueReadFromAttribute: ->
        that = @
        @eachByAttr self.valueReadFromAttr, ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueReadFromAttr
            Scope = $dp.Parser.getScopeOf field, that.getScope()
            return true if self.bindValueCheckScope field, $el, Scope, that, true, false
            self.bindValueReadFromAttribute field, $el, Scope
        @

    setupValueBindAttribute: ->
        that = @
        @eachByAttr self.valueBindAttr, ->
            $el = $dp.e @
            field = $el.attr $dp.attribute self.valueBindAttr
            Scope = $dp.Parser.getScopeOf field, that.getScope()
            return true if self.bindValueCheckScope field, $el, Scope, that, true, true
            self.bindValueWriteToAttribute field, $el, Scope
            self.bindValueReadFromAttribute field, $el, Scope
        @

    @bindValueCheckScope: (field, $el, Scope, that, read = false, write = false) ->
        if Scope is null
            that.ScopePromises.add
                field: field
                scope: that.getScope()
                cb: (_scope) ->
                    field = $dp.Parser.getPropertyOfExpression field
                    self.bindValueWriteToAttribute field, $el, _scope if write
                    self.bindValueReadFromAttribute field, $el, _scope if read

            return true
        false

    @bindValueWriteToAttribute: (field, $el, Scope) ->
        if $el.is('input') and $el.attr('type') in ['radio', 'checkbox']
            eventName = 'change'
        else
            eventName = 'input'
        $el.on eventName, ->
            value = $dp.fn.getValueOfElement $el
            Scope.set field, value
        $el.trigger eventName if $dp.fn.getValueOfElement $el
        true

    @bindValueReadFromAttribute: (field, $el, Scope) ->
        Scope.onChange field, (field, value) ->
            $dp.fn.setValueOfElement $el, value
        Scope.trigger 'change', field if Scope.get field
        true
