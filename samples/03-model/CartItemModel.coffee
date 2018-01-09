class CartItemModel extends DreamPilot.Model
    shout: (prefix, element) ->
        alert prefix + ' [' + @get('count') + ']'
        console.log element

    getDeleteUrl: ->
        '/api/cart/item/' + @get('id') + '/'
