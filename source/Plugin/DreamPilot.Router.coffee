class DreamPilot.Router
    WORK_MODE_HASH = 1
    WORK_MODE_URL = 2

    ELSE_PATH = null

    steps: {}

    constructor: (@App, options = {}) ->
        @options = $.extend
            workMode: WORK_MODE_HASH
            attrName: 'data-step'
        , options

    when: (path, opts = {}) ->
        @steps[path] = opts
        @

    else: (opts = {}) ->
        @steps[ELSE_PATH] = opts
        @
