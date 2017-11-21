class BasicApp extends DreamPilot.Application
    constructor: ($element) ->
        super $element
        console.log 'I am the basic app!'
        @initVariables()

    initVariables: ->
        @getScope().set
            lolo: 10
            pepe: 7

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