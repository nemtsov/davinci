module.exports = function (cb) {
  cb(null, {
      title: 'About'
  }, {
      partials: {
          home: 'home'
        , header: 'header'
      }
  })
}
