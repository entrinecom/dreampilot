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

$dp.fn = DreamPilot.Functions if $dp
