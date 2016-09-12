
class UndoableArray extends Array {
  push (...args) {
    undoHistory.push(Array.from(this))
    return Reflect.apply(Array.prototype.push, this, ...args)
  }
}
