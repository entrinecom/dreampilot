class UserModel extends DreamPilot.Model
    getName: -> @get 'name'
    setName: (name) -> @set 'name', name
    setRandomName: -> @setName $dp.fn.uniqueId 10
