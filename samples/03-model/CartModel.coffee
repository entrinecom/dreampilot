class CartModel extends DreamPilot.Model
    init: ->
        super()
        @onChange ['of_user1'], (field, value) =>
            console.log 'cart: item changed', field, '=', value
        @
