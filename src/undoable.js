function undoable (target) {
  const history = []
  let now = 0
  let trackingActive = true

  Object.defineProperty(target, 'undo', {
    enumerable: false,
    value () {
      trackingActive = false
      history.push(Object.assign({}, target))
      set(target, history[--now])
      trackingActive = true
    }
  })

  Object.defineProperty(target, 'redo', {
    enumerable: false,
    value () {
      trackingActive = false
      set(target, history[++now])
      trackingActive = true
    }
  })

  const proxy = new Proxy(target, {
    set () {
      if (!trackingActive) {
        now += 1
        history.push(Object.assign({}, target))
      }
      Reflect.set.apply(this, arguments)
    },
    deleteProperty () {
      if (!trackingActive) {
        now += 1
        history.push(Object.assign({}, target))
      }
      Reflect.deleteProperty.apply(this, arguments)
    }
  })

  return proxy
}

// Revocable to the rescue

function set (target, source) {
  for (const key in source) {
    target[key] = source[key]
  }

  Object.keys(target)
    .filter(key => !Object.keys(source).includes(key))
    .forEach(key => delete target[key])
}

function sequence (...funcs) {
  return function (...args) {
    funcs.forEach(f => f(...args));
  }
}

const object = undoable({ a: 1, b: 2 })
object.c = 3
object.d = 4
object.undo()
object.undo()
object.redo()
object.redo()
console.log('object.undo()', object);

