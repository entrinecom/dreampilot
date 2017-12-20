class DreamPilot.Transport
    self = @

    @GET: 1
    @POST: 2
    @PUT: 3
    @DELETE: 4
    @HEAD: 5
    @OPTIONS: 6
    @CONNECT: 7

    @request: (method, url, data, callback) ->
        switch method
            when @GET
                url += '?' + jQuery.serialize data
                self.get url, callback

            when @POST
                self.post url, data, callback

            else
                throw 'This method not implemented yet'

    @get: ->
        jQuery.get.apply arguments

    @post: ->
        jQuery.post.apply arguments

$dp.transport = DreamPilot.Transport if $dp
