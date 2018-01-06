class ModelApp extends DreamPilot.Application
    init: ->
        @initModels()

    initModels: ->
        @cart = new CartModel
        @cart.set
            of_user1: new CartItemModel count: 2
            2: new CartItemModel()
            3: new CartItemModel()

        @user1 = new UserModel @e('ul[data-user1]').data 'user1'
        @user2 = new UserModel @e('script[data-of="user2"]').html()
        @user3 = new UserModel @user2

        @linkToScope 'user1', 'user2', 'user3', 'cart'

        console.log @getScope().get 'user1.name'

        @user1.onChange '*', (field, value) ->
            console.log 'user1.' + field, '=', value
        @