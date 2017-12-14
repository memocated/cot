const Metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const assets = require('metalsmith-assets')
const rootpath = require('metalsmith-rootpath')
const debug = require('metalsmith-debug')
const inPlace = require('metalsmith-in-place')
const sass = require('metalsmith-sass')
const liveReload = require('metalsmith-livereload')
const helpers = require('metalsmith-register-helpers')

const nodeStatic = require('node-static');
const watch = require('glob-watcher');

const isDev = !!process.env.DEV

const build = (done) => {
  console.log('building')
  let builder =
    Metalsmith(__dirname)
      .source('./src')
      .destination('./docs')
      .clean(true)
      .use(rootpath())
      .use(helpers())
      .use(layouts({
        engine: 'handlebars',
        partials: 'partials'
      }))
      .use(sass({
        outputDir: 'css/',
        includePaths: [ 'node_modules/foundation-sites/scss/' ]
      }))
      .use(inPlace())
      .use(debug())
      .use(assets({
        source: './img',
        destination: './img'
      }))
      .use(assets({
        source: './graphics',
        destination: './graphics'
      }))
      .use(assets({
        source: './bower_components',
        destination: './bower_components'
      }))
      .use(assets({
        source: './root-files',
        destination: './'
      }))

  if (isDev)
    builder = builder.use(liveReload({ debug: true }))

  builder.build(function(err, files) {
    console.log('build done')
    done(err);
  });
}

if (isDev) {
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
  watch([
    __dirname + '/layouts/*',
    __dirname + '/src/**/*',
    __dirname + '/partials/*'
  ], { ignoreInitial: false }, build);
} else {
  build((err) => { if (err) throw err })
}
