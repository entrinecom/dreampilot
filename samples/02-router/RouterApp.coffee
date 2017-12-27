class RouterApp extends DreamPilot.Application
    Router: null

    init: ->
        @initRouter()

    initRouter: ->
        @Router = new DreamPilot.Router @
        .when ''
        @