const next = require('next')
const express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');

const routes = {
  auth: require('./routes/auth')
}

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());

  // Add admin routes
  routes.auth(server)

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
.catch(err => {
  console.log('An error occurred, unable to start the server')
  console.log(err)
})

process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception: ', err)
})

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection: Promise:', p, 'Reason:', reason)
})