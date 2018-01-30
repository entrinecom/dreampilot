class BasicApp extends DreamPilot.Application
    init: ->
        console.log 'I am the {0} app!'.format 'basic'
        @someVar = 'some value'
        @initVariables()

    initVariables: ->
        @someModel = new myModel()
        @someModel.set 'message', 'Hello I am a model'

        @mm = new myModel
        @mm.set title: 'initial title'#, show: null

        @nn = new myModel()
        @nn.set
            f1: new myModel()
            f2: new myModel()
            f3: new myModel()
            f4: new myModel()

        @getScope().set
            assignItOut: ->
                console.log 'assignItOut called with args: ', arguments
                x = 0
                for y in arguments
                    x += y
                x
            letItOut: ->
                alert 'let it out!'

        @linkToScope 'someMethod', 'mm', 'nn', [
            'getRequest'
            'postRequest'
            'putRequest'
            'deleteRequest'
            'postPayloadRequest'
            'putPayloadRequest'
            'deletePayloadRequest'
            'showVal1'
            'showVal2'
            'someModel'
        ]

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

    showVal1: ->
        alert @someModel.get 'val1'
        @

    showVal2: ->
        alert @getScope().get 'val2'
        @

    getRequest: ->
        $dp.transport.get '/api/controller/method/hey/', id: 100500, (res) -> console.log 'get', res
        @

    postRequest: ->
        data =
            name: 'James'
            band: 'Metallica'
        $dp.transport.post '/api/controller/method/hey/', data, (res) -> console.log 'post', res
        @

    putRequest: ->
        data =
            name: 'Kirk'
            band: 'Metallica'
        $dp.transport.put '/api/controller/method/hey/', data, (res) -> console.log 'put', res
        @

    deleteRequest: ->
        data =
            id: 100500
        $dp.transport.delete '/api/controller/method/hey/', data, (res) -> console.log 'delete', res
        @

    postPayloadRequest: ->
        data =
            name: 'James'
            band: 'Metallica'
        $dp.transport.postPayload '/api/controller/method/hey/', data, (res) -> console.log 'post', res
        @

    putPayloadRequest: ->
        data =
            name: 'Kirk'
            band: 'Metallica'
        $dp.transport.putPayload '/api/controller/method/hey/', data, (res) -> console.log 'put', res
        @

    deletePayloadRequest: ->
        data =
            id: 100500
        $dp.transport.deletePayload  '/api/controller/method/hey/', data, (res) -> console.log 'delete', res
        @

    someMethod: (var1, var2) ->
        alert @someVar + ', ' + var1 + ', ' + var2
