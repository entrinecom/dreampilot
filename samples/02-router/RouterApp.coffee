class RouterApp extends DreamPilot.Application
    Router: null

    constructor: ($wrapper) ->
        super $wrapper
        @initRouter()

    initRouter: ->
        @Router = new DreamPilot.Router @
        .when ''
        @