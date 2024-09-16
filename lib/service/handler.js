import util from 'node:util'

export default class Handler {
  _events = {}

  add (event, fn, id = 0) {
    if (!event || !fn) {
      return false
    }
    this.del(event, id)
    this._events[event] = this._events[event] || []
    this._events[event].push({ fn, id })
    return true
  }

  del (event, id = 0) {
    if (!this._events[event]) {
      return false
    } else if (id == 'all') {
      delete this._events[event]
      return true
    } else {
      let idx = this._events[event].findIndex(v => v.id == id)
      if (idx) {
        this._events[event].splice(idx, 1)
        return true
      }
    }
  }

  async call (key, args, callback) {
    let ret = false
    if (!this._events[key]) {
      callback(ret)
      return ret
    }
    for (let event of this._events[key]) {
      let fn = event.fn
      let done = true
      let reject = (msg = '') => {
        if (msg) {
          logger.error(new Error(msg))
          return
        }
        done = false
      }
      ret = fn(...args, reject)
      if (util.types.isPromise(ret)) {
        ret = await ret
      }
      if (done) {
        callback(ret)
        return ret
      }
    }
    callback(ret)
    return ret
  }

  has (key) {
    return !!this._events[key]
  }
}
