var through = require('through2')
var path    = require('path')
var convert = require('./')

module.exports = literatify

function literatify(file, opts) {
  var ext = path.extname(file)
  if (ext !== '.md' && ext !== '.markdown') return through()

  var stream = through(write, flush)
  var buffer = []

  return stream

  function write(chunk, _, next) {
    buffer.push(chunk)
    next()
  }

  function flush() {
    stream.push(convert(buffer.join('\n')))
    stream.push(null)
  }
}
