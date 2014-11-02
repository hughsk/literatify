var marked = require('marked')

module.exports = literatify

function literatify(src) {
  return marked.lexer(src).filter(function(token) {
    if (token.type !== 'code') return false
    if (token.lang === 'bash') return false
    if (token.lang === 'sh') return false
    return true
  }).map(function(token) {
    return token.text
  }).join('\n\n')
}
