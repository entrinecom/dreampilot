class DreamPilot
    apps = {}
    self = @

    constructor: ->
        $ =>
            @checkDependencies()
            .setupApps()

    @prefix: 'dp-'

    @e: (selector, parent) -> jQuery selector, parent
    e: (selector, parent) -> self.e selector, parent

    @attribute: (name) ->
        self.prefix + name

    @selectorForAttribute: (name) ->
        "[#{self.attribute(name)}]"

    checkDependencies: ->
        throw 'jQuery needed' if typeof jQuery is 'undefined'
        throw 'jsep needed' if typeof jsep is 'undefined'
        @

    setupApps: ->
        @e(self.selectorForAttribute($dp.Application.appAttr)).each ->
            $app = self.e @
            name = $app.attr self.attribute $dp.Application.appAttr
            throw 'Application with empty name found' unless name
            apps[name] = $dp.Application.create name, $app
        @

$dp = DreamPilot
dp = new DreamPilot()
