var fs = require('fs')
  , path = require('path')
  , hogan = require('./vendor/hogan.js-v3.0.0')
  , nooppage = function (cb) { cb(null) }

module.exports = stachio

function stachio(root, name, cb) {
  getPage(root, name, function (err, page) {
    if (err) return cb(err)
    if (!page) return cb(null, null)

    var partials = page.metadata.partials
    if (!partials) return cb(null, render(page))

    var names = Object.keys(partials)
    getPages(root, names, function (errors, pages) {
      if (errors) return cb(errors.map(function (err) { return err.message }))
      names.forEach(function (name) {
        partials[name] = pages[name].view
      })
      cb(null, render(page))
    })
  })
}

function getPages(root, names, cb) {
  var pages = {}
    , errors = []
    , ctr = 0
  function done(err) {
    if (err) errors.push(err)
    if (++ctr === names.length) {
      cb((errors.length > 0) ? errors : null, pages)
    }
  }
  names.forEach(function (name) {
    getPage(root, name, function (err, page) {
      if (err) return done(err)
      pages[name] = page
      done()
    })
  })
}

function getPage(root, name, cb) {
  var pagePath = path.join(root, 'pages', name)
    , page

  try { page = require(pagePath) }
  catch (e) { /* noop */ }

  page = ('function' === typeof page) ? page : nooppage


  page(function (err, viewdata, metadata) {
    if (err) return cb(err)

    metadata = metadata || {}
    metadata.view = metadata.view || 'index'

    getView(root, name, metadata.view, function (err, viewStr) {
      if (err) return cb(err)
      if (!viewStr) return cb(null, null)
      cb(null, {
          view: hogan.compile(viewStr)
        , viewdata: viewdata
        , metadata: metadata
      })
    })
  })
}

function render(page) {
  return page.view.render(
      page.viewdata
    , page.metadata.partials
  ) || ' '
}

function getView(root, page, name, cb) {
  var fname = path.join(root, 'pages'
    , page, name + '.mu')
  return fs.readFile(fname, {
    encoding: 'utf8'
  }, function (err, file) {
    if (err) {
      if (/ENOENT/.test(err.message)) return cb(null, null)
      return cb(err)
    }
    return cb(null, file)
  })
}
