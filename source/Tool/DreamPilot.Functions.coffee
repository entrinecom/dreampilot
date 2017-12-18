class DreamPilot.Functions
    @int: (s) -> ~~s

    @str: (s) -> s + ''

    @float: (s) -> parseFloat(s) or .0

    @trim: (s) -> s.replace /^\s+|\s+$/g, ''

    @ltrim: (s) -> s.replace /^\s+/, ''

    @rtrim: (s) -> s.replace /\s+$/, ''

    @underscore: (s) ->
        (s + '').replace /(\-[a-z])/g, ($1) -> $1.toUpperCase().replace '-', ''

    @camelize: (s) ->
        (s + '').replace /([A-Z])/g, ($1) -> '_' + $1.toLowerCase()

    @urlencode: (s) -> encodeURIComponent s

    @urldecode: (s) -> decodeURIComponent (s + '').replace /\+/g, '%20'

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

    @escapeHtml: (text) ->
        map =
            '&': '&amp;'
            '<': '&lt;'
            '>': '&gt;'
            '"': '&quot;'
            "'": '&#039;'
        text.replace /[&<>"']/g, (m) -> map[m]

    @round: (number, precision = 0) ->
        return Math.round number unless precision
        factor = Math.pow 10, precision
        tempNumber = number * factor
        roundedTempNumber = Math.round tempNumber
        roundedTempNumber / factor

    @isArray: (ar) -> Object.prototype.toString.call(ar) is '[object Array]'

    @keys: (array) -> $.map array, (val, key) -> key

    @values: (array) -> $.map array, (val, key) -> val

    @lead0: (x, len = 2) ->
        x = @str x
        x = '0' + x while x.length < len

    @getValueOfElement: ($element) ->
        $element.val() or $element.html()

    @setValueOfElement: ($element, value) ->
        if $element.length
            if $element.is 'input,button'
                $element.val value
            else
                $element.html value
        $element

$dp.fn = DreamPilot.Functions if $dp
