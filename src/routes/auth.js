const pool = require('../dbconfig/dbconfig')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const nodemailer = require('nodemailer')
const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
const nodemailerDirectTransport = require('nodemailer-direct-transport')

// Send email direct from localhost if no mail server configured
let nodemailerTransport = nodemailerDirectTransport()
if (process.env.EMAIL_SERVER && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
  nodemailerTransport = nodemailerSmtpTransport({
    host: process.env.EMAIL_SERVER,
    port: process.env.EMAIL_PORT || 25,
    secure: process.env.EMAIL_SECURE || true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

module.exports = (server) => {

  if (server === null) {
    throw new Error('server should be an express instance')
  }

  server.post('/login', async (req, res) => {
    var email = req.body.email
    var password = req.body.password
    if (email && password) {
      try {
        const results = await getUsers(email)
        if (results.length > 0) {
          if (results[0][0].verified) {
            bcrypt.compare(password, results[0][0].password).then(function(response) {
            if (response == true) {
              req.session.loggedin = true
              req.session.email = email
              res.redirect('/home')			
              res.end()
            }
          })
          } else {
            res.send('User not verified')
            res.end()
          }
        } else {
          res.send('Incorrect email and/or Password!')			
          res.end()
        }
      }catch(e){
        console.error(e)
      }
    } else {
      res.send('Please enter email and Password!')
      res.end()
    }
  })

  async function getUsers(email) {
    try {
      const results = await pool.query(`SELECT * FROM users WHERE email='${email}';`)
      return results
    }catch(e){
      console.error(e)
    }
  }

  server.post('/signup', async (req, res) => {
    var email = req.body.email
    var password = req.body.password
    if (email && password) {
      try {
        bcrypt.hash(password, saltRounds).then(async function(hash) {
          const results = await addUsers(email, hash)
          if (results && results.length > 0) {
            bcrypt.hash(email + hash, saltRounds).then(function(hash) {
              sendVerificationEmail(email, "http://" + req.headers.host + "/verify?email=" + email + "&hash=" + hash)
            })
            res.redirect('/check-email?email=' + email)
          } else {
            res.send('User already exists with email ' + email)
          }
          res.end();
        })
      }catch(e){
        console.error(e)
      }
    } else {
      res.send('Please enter email and Password!')
      res.end()
    }
  })

  async function addUsers(email, password) {
    try {
      const results = await pool.query(`INSERT INTO users (email, password) VALUES ("${email}", "${password}");`)
      return results
    }catch(e){
      console.error(e)
    }
  }

  function sendVerificationEmail(email, url) {
    nodemailer
    .createTransport(nodemailerTransport)
    .sendMail({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Verify Signup',
      text: `Click on this link to verify:\n\n${url}\n\n`,
      html: `<p>Click on this link to verify:</p><p>${url}</p>`
    }, (err) => {
      if (err) {
        console.error('Error sending email to ' + email, err)
      }
    })
  }

  server.get('/verify', async (req, res) => {
    var email = req.query.email
    var hash = req.query.hash
    if (email && hash) {
      try {
        const results = await getUsers(email)
        if (results.length > 0) {
          bcrypt.compare(email + results[0][0].password, hash).then(async function(response) {
            if (response == true) {
              const results = await verifyUsers(email)
              if (results.length > 0) {
                res.send('Email verified successfully. You can sign in now.')
                res.end()
              } else {
                res.send('Email already verified. You can sign in now.')
                res.end()
              }
            }
          })
        } else {
          res.send('User not found with email ' + email)			
          res.end()
        }
      }catch(e){
        console.error(e)
      }
    } else {
      res.send('Wrong query params.')
      res.end()
    }
  })

  async function verifyUsers(email) {
    try {
      const results = await pool.query(`UPDATE users SET verified=true WHERE email='${email}';`)
      return results
    }catch(e){
      console.error(e)
    }
  }
  
  server.get('/home', (req, res) => {
    if (req.session.loggedin) {
      res.send('Welcome back, ' + req.session.email + '!')
    } else {
      res.send('Please login to view this page!')
    }
    res.end();
  })

}