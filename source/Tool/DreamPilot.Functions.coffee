class DreamPilot.Functions
    self = @

    @extend: (args...) -> jQuery.extend args...
    @int: (s) -> ~~s
    @str: (s) -> if s is null then '' else s + ''
    @float: (s) -> parseFloat(s) or .0
    @bool: (s) -> !!s
    @trim: (s) -> self.str(s).replace /^\s+|\s+$/g, ''
    @ltrim: (s) -> self.str(s).replace /^\s+/, ''
    @rtrim: (s) -> self.str(s).replace /\s+$/, ''
    @underscore: (s) -> self.str(s).replace /(\-[a-z])/g, ($1) -> $1.toUpperCase().replace '-', ''
    @camelize: (s) -> self.str(s).replace /([A-Z])/g, ($1) -> '_' + $1.toLowerCase()
    @urlencode: (s) -> encodeURIComponent s
    @urldecode: (s) -> decodeURIComponent self.str(s).replace /\+/g, '%20'

    @parseQueryString: (url = window.location.href, start = '?', delimiter = '&', equal = '=') ->
        ar = {}
        if url.indexOf(start) > -1
            url = url.substr url.indexOf(start) + 1
            if start is '?' and url.indexOf('#') > -1
                url = url.substr 0, url.indexOf '#'
            ar2 = url.split delimiter
            i = 0
            while i < ar2.length
                ar3 = ar2[i].split equal
                ar[ar3[0]] = ar3[1]
                i++
        ar

    @stringToFunction: (s) ->
        ar = s.split '.'
        fn = window or @
        fn = fn[v] for k, v of ar
        throw "Function/Class #{s} not found" if self.getType(fn) isnt 'function'
        fn

    @uniqueId: (len = 32) ->
        text = ''
        possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        for i in [0..len]
            text += possible.charAt Math.floor Math.random() * possible.length
        text

    @randomInt: (min, max) -> Math.floor(Math.random() * (max - min + 1)) + min

    @formatFloat: (num, afterDot) ->
        d = Math.pow 10, afterDot
        num = Math.round(num * d) / d;
        a = num.toString().split '.'
        a[1] = a[1] or ''
        a[1] += '0' while a[1].length < afterDot
        a[0] + '.' + a[1];

    @escapeHtml: (text) ->
        map =
            '&': '&amp;'
            '<': '&lt;'
            '>': '&gt;'
            '"': '&quot;'
            "'": '&#039;'
        text.replace /[&<>"']/g, (m) -> map[m]

    @stripTags: (input, allowed = '') ->
        allowed = (self.str(allowed).toLowerCase().match(/<[a-z][a-z0-9]*>/g) or []).join ''
        tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
        input.replace(commentsAndPhpTags, '').replace tags, ($0, $1) ->
            if allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 then $0 else ''

    @round: (number, precision = 0) ->
        return Math.round number unless precision
        factor = Math.pow 10, precision
        tempNumber = number * factor
        roundedTempNumber = Math.round tempNumber
        roundedTempNumber / factor

    # Array functions

    @isArray: (ar) -> Object.prototype.toString.call(ar) is '[object Array]'
    @inArray: (x, ar) -> x in ar
    @keys: (array) -> jQuery.map array, (val, key) -> key
    @values: (array) -> jQuery.map array, (val, key) -> val

    @arraySum: (ar) ->
        sum = 0
        if ar and self.getType(ar) is 'array'
            return ar.sum.apply ar, Array::slice.call arguments, 0
        return null if self.getType(ar) isnt 'object'
        for key of ar
            continue unless ar.hasOwnProperty key
            sum += parseFloat ar[key] unless isNaN parseFloat ar[key]
        sum

    @arrayCount: (ar) ->
        return ar.length if ar and self.getType(ar) is 'array'
        return null if self.getType(ar) isnt 'object'
        cc = 0
        for i of ar
            cc++ if ar.hasOwnProperty i
        cc

    @arrayFlip: (ar) ->
        tmp = {}
        for key of ar
            tmp[ar[key]] = key if ar.hasOwnProperty key
        tmp

    @arrayShuffle: (ar) ->
        i = ar.length - 1
        while i > 0
            j = Math.floor Math.random() * (i + 1)
            temp = ar[i]
            ar[i] = ar[j]
            ar[j] = temp
            i--
        ar

    @arrayReverse: (ar) ->
        res = []
        len = ar.length
        i = len - 1
        while i isnt -1
            res.push ar[i]
            i--
        res

    @arrayUnique: (ar) -> jQuery.grep ar, (el, index) -> index is jQuery.inArray el, ar

    @removeFromArrayByValue: (ar, x) -> ar.filter (el) -> el isnt x

    @lead0: (x, len = 2) ->
        x = self.str x
        x = '0' + x while x.length < len

    @digitCase: (x, s1, s2, s3 = null, endingOnly = false) ->
        s3 = s2 if s3 is null
        x = self.int x
        if x % 10 == 1 and x isnt 11
            if endingOnly then s1 else x + ' ' + s1
        else if 2 <= x % 10 <= 4 and x not in [12, 13, 14]
            if endingOnly then s2 else x + ' ' + s2
        else
            if endingOnly then s3 else x + ' ' + s3

    @divide3dig: (num, divider = ',') ->
        num = self.str num
        x = num.indexOf '.'
        s2 = if x isnt -1 then num.substr(x) else ''
        num = if x isnt -1 then num.substr(0, x) else num
        ss = ''
        start = num.length - 3
        j = Math.ceil num.length / 3
        i = 0
        while i < j
            len = 3
            if start < 0
                len += start
                start = 0
            ss = num.substr(start, len) + divider + ss
            start -= 3
            i++
        ss = ss.substr 0, ss.length - divider.length
        ss + s2

    @basename: (str, suffix = null) ->
        x = str.lastIndexOf '/'
        x = str.lastIndexOf '\\' if x is -1
        base = self.str(str).substr x + 1
        if self.getType(suffix) is 'string' and base.substr(base.length - suffix.length) is suffix
            base = base.substr 0, base.length - suffix.length
        base

    @dirname: (str) ->
        x = str.lastIndexOf '/'
        x = str.lastIndexOf '\\' if x is -1
        if x isnt -1 then self.str(str).substr(0, x) else str

    @fileExt: (fn) -> fn.split('.').pop()

    @getValueOfElement: ($element) ->
        if $element.is 'input'
            switch $element.attr 'type'
                when 'checkbox'
                    val = $element.val()
                    val = true if val is 'on'
                    if $element.prop 'checked' then val else null
                when 'radio'
                    $element.val() if $element.prop 'checked' # todo
                else
                    $element.val()
        else
            $element.val() or $element.html()

    @setValueOfElement: ($element, value) ->
        if $element.length
            if $element.is 'input,select,button'
                if $element.is 'input'
                    switch $element.attr 'type'
                        when 'checkbox'
                            $element.prop 'checked', $dp.fn.bool(value) and value isnt '0'
                        when 'radio'
                            $element.prop 'checked', self.str($element.val()) is self.str(value)
                        else
                            $element.val value
                else
                    $element.val value
            else
                $element.html value
        $element

    @getType: (variable) ->
        if variable is null
            'null'
        else if self.isArray variable
            'array'
        else
            typeof variable

    @print_r: (variable, level = 0) ->
        res = ''
        padding = ''
        j = 0
        while j < level # + 1
            j++
            padding += '    '
        if self.getType(variable) in ['object', 'array']
            for item, value of variable
                if self.getType(value) is 'object'
                    res += "#{padding}'#{item}':\n" + self.print_r value, level + 1
                else
                    res += "#{padding}'#{item}' => \"#{value}\"\n"
            if res then "#{padding}{\n#{res}\n#{padding}}" else '{}'
        else
            padding + '(' + self.getType(variable) + ') ' + variable

unless String.prototype.format
    # Usage: 'Hello, {0}! {1} to see you'.format('James', 'Nice');
	String::format = ->
		args = arguments
		@replace /{(\d+)}/g, (match, number) -> if typeof args[number] isnt 'undefined' then args[number] else match

$dp.fn = DreamPilot.Functions if $dp
