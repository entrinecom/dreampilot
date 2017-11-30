class BasicApp extends DreamPilot.Application
    constructor: ($wrapper) ->
        super $wrapper
        console.log 'I am the basic app!'
        @initVariables()

    initVariables: ->
        setTimeout =>
            @getScope().set
                lolo: 11
                pepe: 8
        , 2000

        setTimeout =>
            @getScope().set
                lolo: 5
                pepe: 8
        , 5000

        setTimeout =>
            @getScope().set
                lolo: 12
                pepe: 8
        , 7000
        @