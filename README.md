# literatify
![](http://img.shields.io/badge/stability-experimental-orange.svg?style=flat)
![](http://img.shields.io/npm/v/literatify.svg?style=flat)
![](http://img.shields.io/npm/dm/literatify.svg?style=flat)
![](http://img.shields.io/npm/l/literatify.svg?style=flat)

[![NPM](https://nodei.co/npm/literatify.png)](https://nodei.co/npm/literatify/)

Easily take your code and make it literate: parses a Markdown file and prints
out the code blocks exclusively.

Inspired by [Matthew Mueller](http://github.com/matthewmueller)'s
[Duo Playground](http://playground.lapwinglabs.com/) and available as a
standalone module, a [browserify](http://browserify.org) transform and a
CLI tool.

## API

### `src = literatify(markdown)`

Takes a markdown string, and returns the extracted source code as a string.
Code blocks marked with their language as `bash` or `sh` are ignored.

## Browserify Transform

When using as a browserify transform, `.md` files and `.markdown` files will
be transformed and the rest will be left untouched. When using from the
command-line:

``` bash
browserify -t literatify/transform README.md
```

Or as a module:

``` javascript
var browserify = require('browserify')
var bundler = browserify()

bundler.transform('literatify/transform')
```

## CLI

The `literatify` CLI is pretty simple: it either takes the markdown file as
input, or reads the first file passed as an argument, and then spits the
extracted code out to stdout.

``` bash
sudo npm install -g literatify
cat README.md | literatify
literatify README.md
```

## License

MIT. See [LICENSE.md](http://github.com/hughsk/literatify/blob/master/LICENSE.md) for details.
