class DreamPilot.Transport
    self = @

    @GET: 'GET'
    @POST: 'POST'
    @PUT: 'PUT'
    @DELETE: 'DELETE'
    @HEAD: 'HEAD'
    @OPTIONS: 'OPTIONS'
    @CONNECT: 'CONNECT'

    @FORM_DATA: 1
    @PAYLOAD: 2

    @request: (method, url, data, callback) ->
        if $dp.fn.getType(method) is 'object'
            options = $dp.fn.extend
                method: self.GET
                dataType: self.FORM_DATA
                url: url
                data: data
                success: callback
            , method
        else
            options =
                method: method
                dataType: self.FORM_DATA
                url: url
                data: data
                success: callback

        if options.dataType is self.PAYLOAD
            options = $dp.fn.extend options,
                dataType: 'json'
                contentType: 'application/json'
                data: JSON.stringify options.data
        else if options.dataType is self.FORM_DATA
            delete options.dataType

        if options.data and options.method is self.GET
            options.url += '?' + jQuery.serialize options.data
            options.data = null

        options.type = options.dataType if options.type and not options.dataType
        options.type = options.method
        delete options.method

        jQuery.ajax options

    @get: (args...) -> jQuery.get args...

    @post: (args...) -> jQuery.post args...
    @postPayload: (url, data, callback) -> self.request {method: self.POST, dataType: self.PAYLOAD}, url, data, callback

    @put: (url, data, callback) -> self.request {method: self.PUT, dataType: self.FORM_DATA}, url, data, callback
    @putPayload: (url, data, callback) -> self.request {method: self.PUT, dataType: self.PAYLOAD}, url, data, callback

    @delete: (url, data, callback) -> self.request {method: self.DELETE, dataType: self.FORM_DATA}, url, data, callback
    @deletePayload: (url, data, callback) -> self.request {method: self.DELETE, dataType: self.PAYLOAD}, url, data, callback

$dp.transport = DreamPilot.Transport if $dp
