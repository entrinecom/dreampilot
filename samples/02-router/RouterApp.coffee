class RouterApp extends DreamPilot.Application
    @allowMultipleInstances: true

    Router: null

    init: ->
        @initRouter()

    initRouter: ->
        @Router = new DreamPilot.Router @
        .when ''
        @