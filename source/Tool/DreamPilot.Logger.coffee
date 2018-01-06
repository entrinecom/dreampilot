class DreamPilot.Logger
    @print: ->
        console.log.apply arguments

    @error: (args...) ->
        #console.trace()
        throw args.join ' '

$dp.log = DreamPilot.Logger if $dp
