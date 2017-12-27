class DreamPilot.Transport
    self = @

    @GET: 1
    @POST: 2
    @PUT: 3
    @DELETE: 4
    @HEAD: 5
    @OPTIONS: 6
    @CONNECT: 7

    @FORM_DATA: 1
    @PAYLOAD: 2

    @request: (method, url, data, callback) ->
        if typeof method isnt 'object'
            options =
                method: method
                type: @FORM_DATA
        else
            options = $dp.fn.extend
                method: @GET
                type: @FORM_DATA
            , options

        switch options.method
            when @GET
                url += '?' + jQuery.serialize data
                self.get url, callback

            when @POST
                switch options.type
                    when @FORM_DATA
                        self.post url, data, callback
                    when @PAYLOAD
                        self.postPayload url, data, callback
                    else
                        throw 'Unknown request type'

            else
                throw 'This method not implemented yet'

    @get: (args...) ->
        jQuery.get args...

    @post: (args...) ->
        jQuery.post args...

    @postPayload: (url, data, callback) ->
        jQuery.ajax
            url: url
            type: 'POST'
            dataType: 'json'
            data: data
            contentType: 'application/json'
            complete: callback

$dp.transport = DreamPilot.Transport if $dp
