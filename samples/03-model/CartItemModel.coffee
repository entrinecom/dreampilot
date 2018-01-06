class CartItemModel extends DreamPilot.Model
    shout: (prefix, element) ->
        alert prefix + ' [' + @get('count') + ']'
        console.log element
