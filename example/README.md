# bunny-walkthrough

A "hello world" example of sorts for using [stack.gl](http://stack.gl/):
simply draws a 3D bunny to the screen with an orbit camera for interacting
with.

Thoroughly verbose comments here, to step through the basics of how everything
fits together in practice.

To run this locally, ensure you have [node.js](http://nodejs.org/) and
[git](http://git-scm.com/) installed, then run the following from your terminal:

``` bash
git clone git@github.com:stackgl/bunny-walkthrough
cd bunny-walkthrough
npm install
npm start
```

This demo is run through [literatify](http://github.com/hughsk/literatify)
for literate programming. The following code snippets are all extracted
and run directly.

## Bootstrapping the Scene

Firstly, load up your dependencies. If you're curious about what they do,
check out either `http://npmjs.org/<name>` to see their npm package details
or `http://ghub.io/<name>` to jump to their GitHub repo.

``` js
var Geometry = require('gl-geometry')
var mat4     = require('gl-mat4')
var normals  = require('normals')
var glslify  = require('glslify')
var bunny    = require('bunny')
```

Start off by creating a canvas element and attaching it to the `<body>` on your
DOM:

``` js
var canvas = document.body.appendChild(document.createElement('canvas'))
```

Then you can use [gl-context](http://github.com/hughsk/gl-context) (or one of
a number of alternative packages) to quickly create a WebGL context. The
`render` function supplied here is called every frame to update the canvas.

``` js
var gl = require('gl-context')(canvas, render)
```

Then create an instance of
[canvas-orbit-camera](http://github.com/hughsk/canvas-orbit-camera). This will
later be used to generate your view matrix and handle interaction for you.

``` js
var camera = require('canvas-orbit-camera')(canvas)
```

In most cases, you want to make the canvas fully fit the browser window
whenever the window is resized. Here, we use
[canvas-fit](http://github.com/hughsk/canvas-fit) to do just that whenever the
resize event is fired.

``` js
window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)
```

Before we can draw a bunny on the screen, we need to first get the bunny's
mesh data over to WebGL. Here we're grabbing that mesh via the
[bunny](http://github.com/mikolalysenko/bunny) package on npm, which exports
a [simplicial-complex](http://github.com/mikolalysenko/simplicial-complex).

A simplicial complex is simply a list of vertices and faces – conventionally
called `positions` and `cells` respectively. If you're familiar with
[three.js](http://threejs.org), this is essentially equivalent to an array
of `THREE.Vector3` and `THREE.Face3` instances, except specified as arrays
for simplicity and iteroperability.

[gl-geometry](http://github.com/hughsk/gl-geometry) is a convenience wrapper
for the [gl-vao](http://github.com/stackgl/gl-vao) and
[gl-buffer](http://github.com/stackgl/gl-buffer) packages which is a little
simpler to work with.

``` javascript
var geometry = Geometry(gl)

geometry.attr('aPosition', bunny.positions)
geometry.attr('aNormal', normals.vertexNormals(
    bunny.cells
  , bunny.positions
))

geometry.faces(bunny.cells)
```

Note the use of the [normals](http://github.com/mikolalysenko/normals) package
to generate vertex normals for our mesh on the fly.

Then we have to create our model, view and projection matrices to be used
when rendering the bunny. `mat4.create` comes from the
[gl-mat4](http://github.com/stackgl/gl-mat4) package, and creates a
`new Float32Array(16)` before filling it with values to make it an identity
matrix.

``` javascript
var projection = mat4.create()
var model      = mat4.create()
var view       = mat4.create()
```

Then we want to pull in our shader code.
[glslify](http://github.com/stackgl/glslify) is a tool for processing shaders
to use dependencies from [npm](http://npmjs.org/), and when used within
[browserify](http://browserify.org/) will return an instance of
[gl-shader](http://github.com/mikolalysenko/gl-shader).

By using the glslify browserify transform, these will be passed through glslify
first to pull in any external GLSL modules (of which there are none in this
example) and perform the uniform/attribute parsing step ahead of time. We
can make some dramatic file size savings by doing this in Node rather then
at runtime in the browser.

``` js
var shader = glslify({
    vert: './bunny.vert'
  , frag: './bunny.frag'
})(gl)
```

## Updating State

Next we have our logic/update loop, which updates all of the necessary variables
before they're used in our `render` function. It's optional for you to keep
`update` and `render` as separate steps, but in many cases considered a good
practice.

``` js
var height
var width

function update() {
  // Updates the width/height we use to render the
  // final image.
  width  = gl.drawingBufferWidth
  height = gl.drawingBufferHeight

  // Updates our camera view matrix.
  camera.view(view)

  // Optionally, flush the state of the camera. Required
  // for user input to work correctly.
  camera.tick()

  // Update our projection matrix. This is the bit that's
  // responsible for taking 3D coordinates and projecting
  // them into 2D screen space.
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight
  var fieldOfView = Math.PI / 4
  var near = 0.01
  var far  = 100

  mat4.perspective(projection
    , fieldOfView
    , aspectRatio
    , near
    , far
  )
}
```

## Rendering the Scene

The `render` function is called once per frame using **gl-context** as mentioned
above. Here, the `render` function passes on to a few separate steps.

``` js
function render() {
  update()
  setupScene()
  drawBunny()
}
```

After updating, we set up our WebGL parameters:

``` js
function setupScene() {
  // Sets the viewport, i.e. tells WebGL to draw the
  // scene across the full canvas.
  gl.viewport(0, 0, width, height)

  // Enables depth testing, which prevents triangles
  // from overlapping.
  gl.enable(gl.DEPTH_TEST)

  // Enables face culling, which prevents triangles
  // being visible from behind.
  gl.enable(gl.CULL_FACE)
}
```

And then finally, draw our bunny!

``` js
function drawBunny() {
  // Binds the geometry and sets up the shader's attribute
  // locations accordingly.
  geometry.bind(shader)

  // Updates our model/view/projection matrices, sending them
  // to the GPU as uniform variables that we can use in
  // `shaders/bunny.vert` and `shaders/bunny.frag`.
  shader.uniforms.uProjection = projection
  shader.uniforms.uView = view
  shader.uniforms.uModel = model

  // Draws the bunny to the screen! The rest is
  // handled in our shaders.
  geometry.draw(gl.TRIANGLES)
}
```
