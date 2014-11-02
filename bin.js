#!/usr/bin/env node

var literatify = require('./')

handle(process.argv[2]
  ? require('fs').createReadStream(process.argv[2])
  : process.stdin
)

function handle(stream) {
  var buffer = []

  stream.on('data', function(data) {
    buffer.push(data)
  }).once('end', function() {
    console.log(literatify(buffer.join('\n')))
  })
}
