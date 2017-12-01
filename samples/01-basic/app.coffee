class BasicApp extends DreamPilot.Application
    constructor: ($wrapper) ->
        super $wrapper
        console.log 'I am the basic app!'
        @initVariables()

    initVariables: ->
        @getScope().set
            assignItOut: ->
                console.log 'assignItOut called with args: ', arguments
                x = 0
                for y in arguments
                    x += y
                x
            letItOut: ->
                alert 'let it out!'

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