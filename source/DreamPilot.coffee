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
        @e(self.selectorForAttribute(dpApp.appAttr)).each ->
            $app = self.e @
            name = $app.attr self.attribute dpApp.appAttr
            throw 'Application with empty name found' if not name
            apps[name] = new dpApp $app
        @

$dp = DreamPilot
dp = new DreamPilot()
