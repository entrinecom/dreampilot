class ModelApp extends DreamPilot.Application
    init: ->
        @initModels()

    initModels: ->
        @user1 = new UserModel @e('ul[data-user1]').data 'user1'
        @user2 = new UserModel @e('script[data-of="user2"]').html()
        @user3 = new UserModel @user2
        @linkToScope 'user1', 'user2', 'user3'

        console.log @getScope().get 'user1.name'
        @user1.onChange 'likes_drifting', (field, value) ->
            console.log field, '=', value
        @