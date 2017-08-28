const Metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const assets = require('metalsmith-assets')
const rootpath = require('metalsmith-rootpath')
const debug = require('metalsmith-debug')
const inPlace = require('metalsmith-in-place')
const sass = require('metalsmith-sass')
const liveReload = require('metalsmith-livereload')
const nodeStatic = require('node-static');
const watch = require('glob-watcher');

const build =  () => {
  console.log('building')
  Metalsmith(__dirname)
    .source('./src')
    .destination('./docs')
    .clean(true)
    .use(rootpath())
    .use(layouts({
      engine: 'handlebars'
    }))
    .use(sass({
      outputDir: 'css/',
      includePaths: [ 'node_modules/foundation-sites/scss/' ]
    }))
    .use(inPlace())
    .use(debug())
    .use(assets({
      source: './js',
      destination: './js'
    }))
    .use(assets({
      source: './img',
      destination: './img'
    }))
    .use(assets({
      source: './graphics',
      destination: './graphics'
    }))
    .use(liveReload({ debug: true }))
    .build(function(err, files) {
      if (err) { throw err; }
    });
}

/**
 * Serve files.
 */
var serve = new nodeStatic.Server(__dirname + '/docs');
require('http').createServer((req, res) => {
  req.addListener('end', () => serve.serve(req, res));
  req.resume();
}).listen(8080);

/**
 * Watch files.
 */
build();
watch(__dirname + '/layouts/*', { ignoreInitial: false }, build());
