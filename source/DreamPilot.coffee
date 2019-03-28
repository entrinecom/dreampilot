class DreamPilot
    apps = {}
    self = @

    constructor: ->
        jQuery =>
            @checkDependencies()
            .setupJsep()
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

    setupJsep: ->
        jsep.addBinaryOp 'in', 11
        jsep.addBinaryOp 'not in', 11
        @

    setupApps: ->
        @e(self.selectorForAttribute($dp.Application.appAttr)).each ->
            $appWrapper = self.e @
            name = $appWrapper.attr self.attribute $dp.Application.appAttr
            throw 'Application can not have an empty name' unless name
            multi = $dp.Application.multipleInstancesAllowed name
            $dp.log.error "Application '#{name}' has been already created" if apps[name]? and not multi
            app = $dp.Application.create name, $appWrapper
            if multi
                apps[name] = [] unless apps[name]?
                apps[name].push app
            else
                apps[name] = app
        @

    getApp: (name) ->
        throw 'Application name not specified' unless name
        throw "Application '#{name}' not found" unless apps[name]
        apps[name]

unless $dp? and dp?
    $dp = DreamPilot
    dp = new DreamPilot()
else
    throw 'DreamPilot has been already initialized. May the script be double included?'
