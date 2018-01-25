class DreamPilot
    apps = {}
    self = @

    constructor: ->
        jQuery =>
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
            $appWrapper = self.e @
            name = $appWrapper.attr self.attribute $dp.Application.appAttr
            throw 'Application with empty name found' unless name
            unless apps[name]?
                apps[name] = $dp.Application.create name, $appWrapper
            else
                $dp.log.error "Application '#{name}' has been already created"
        @

    getApp: (name) ->
        throw 'Application can not have an empty name' unless name
        throw "Application '#{name}' not found" unless apps[name]
        apps[name]

$dp = DreamPilot
dp = new DreamPilot()
