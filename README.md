# dreampilot
DreamPilot framework

Package is in bower, so type

`bower install dreampilot`

## Attributes

### Binding

#### dp-value-bind
A variable will be 2 way bound to the HTML element. Both inputs and non-inputs are supported

#### dp-value-read-from
A variable will be placed into the HTML element. Both inputs and non-inputs are supported

#### dp-value-write-to`
A variable will be read from the HTML element. Both inputs and non-inputs are supported

## Transport

#### $dp.transport.get
An alias for jQuery's $.get

#### $dp.transport.post
An alias for jQuery's $.post

#### $dp.transport.postPayload(url, data, callback)
Makes POST request to `url` with `data` encoded as JSON, `callback` called on success

#### $dp.transport.putPayload(url, data, callback)
Makes PUT request to `url` with `data` encoded as JSON, `callback` called on success

#### $dp.transport.deletePayload(url, data, callback)
Makes DELETE request to `url` with `data` encoded as JSON, `callback` called on success
