class DreamPilot.Functions
    @trim: (s) ->
        s.replace /^\s+|\s+$/g, ''

    @ltrim: (s) ->
        s.replace /^\s+/, ''

    @rtrim: (s) ->
        s.replace /\s+$/, ''

    @underscore: (s) ->
        (s + '').replace /(\-[a-z])/g, ($1) -> $1.toUpperCase().replace '-', ''

    @camelize: (s) ->
        (s + '').replace /([A-Z])/g, ($1) -> '_' + $1.toLowerCase()

    @urlencode: (s) ->
        encodeURIComponent s

    @urldecode: (s) ->
        decodeURIComponent (s + '').replace /\+/g, '%20'

    @stringToFunction: (s) ->
        ar = s.split '.'
        fn = window or @
        fn = fn[v] for k, v of ar
        throw "Function/Class #{s} not found" if typeof fn isnt 'function'
        fn

    @uniqueId: (len) ->
        text = ''
        possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        for i in [0..len || 32]
            text += possible.charAt Math.floor Math.random() * possible.length
        text

    @randomInt: (min, max) ->
        Math.floor(Math.random() * (max - min + 1)) + min

$dp.fn = DreamPilot.Functions if $dp
