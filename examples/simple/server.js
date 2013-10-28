var http = require('http')
  , url = require('url')
  , stachio = require('../../')
  , server

server = http.createServer(function (req, res) {
  var purl = url.parse(req.url, true)
    , pageMatch = purl.pathname.match(/\/pages\/([^\/]+)\/?/)
  if (pageMatch) return handlePage(pageMatch[1], req, res)
  res.writeHead(404)
  res.end()
})

function handlePage(name, req, res) {
  var root = __dirname
  stachio(root, name, function (err, rendering) {
    if (err) {
      res.writeHead(500)
      return res.end(err.message)
    }
    if (!rendering) {
      res.writeHead(400)
      return res.end('page not found')
    }
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(rendering)
  })
}

server.listen(3000, function () {
  console.log('Listening on http://localhost:3000/');
})
