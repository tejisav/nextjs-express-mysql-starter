const pool = require('../dbconfig/dbconfig')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const nodemailer = require('nodemailer')
const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
const nodemailerDirectTransport = require('nodemailer-direct-transport')

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

  server.post('/auth/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    if (email && password) {
      const results = await getUser(email)
      if (results[0][0]) {
        if (results[0][0].verified) {
          bcrypt.compare(password, results[0][0].password).then(function(response) {
            if (response == true) {
              req.session.loggedin = true
              req.session.email = email
              return res.json(req.session)
            } else {
              return res.json({message: 'Incorrect Password!'})
            }
          })
        } else {
          return res.json({message: 'User not verified'})
        }
      } else {
        return res.json({message: 'User not found'})
      }
    } else {
      return res.json({message: 'Please enter email and Password!'})
    }
  })

  async function getUser(email) {
    try {
      const results = await pool.query(`SELECT * FROM users WHERE email='${email}';`)
      return results
    }catch(e){
      console.error(e)
    }
  }

  server.post('/auth/signup', async (req, res) => {
    var email = req.body.email
    var password = req.body.password
    if (email && password) {
      bcrypt.hash(password, saltRounds).then(async function(hash) {
        const results = await addUser(email, hash)
        if (results && results.length > 0) {
          bcrypt.hash(email + hash, saltRounds).then(function(hash) {
            sendVerificationEmail(email, "http://" + req.headers.host + "/auth/verify?email=" + email + "&hash=" + hash)
          })
          return res.json({email: email})
        } else {
          return res.json({message: 'User already exists with email ' + email})
        }
      })
    } else {
      return res.json({message: 'Please enter email and Password!'})
    }
  })

  async function addUser(email, password) {
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

  server.get('/auth/verify', async (req, res) => {
    var email = req.query.email
    var hash = req.query.hash
    if (email && hash) {
      const results = await getUser(email)
      if (results.length > 0) {
        bcrypt.compare(email + results[0][0].password, hash).then(async function(response) {
          if (response == true) {
            const results = await verifyUsers(email)
            if (results.length > 0) {
              return res.redirect(`/callback?message=Email verified successfully. You can sign in now.`)
            } else {
              return res.redirect(`/callback?message=Email already verified. You can sign in now.`)
            }
          }
        })
      } else {
        return res.redirect(`/callback?message=User not found with email ` + email)
      }
    } else {
      return res.redirect(`/callback?message=Wrong query params.`)
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

  server.post('/auth/delete', async (req, res) => {
    if (req.session && req.session.loggedin) {
      const results = await deleteUsers(req.session.email)
      if (results.length > 0) {
        req.session.destroy()
        res.redirect(`/callback?message=Account deleted successfully.`)
      } else {
        res.redirect(`/callback?message=There was some problem deleting your account.`)
      }
    } else {
      res.redirect(`/callback?message=First Sign in to delete your account.`)
    }
  })

  async function deleteUsers(email) {
    try {
      const results = await pool.query(`DELETE FROM users WHERE email='${email}';`)
      return results
    }catch(e){
      console.error(e)
    }
  }

  server.get('/auth/signout', (req, res) => {
    if (req.session && req.session.loggedin) {
      req.session.destroy()
      res.redirect(`/callback?message=Successfully signed out.`)
    } else {
      res.redirect(`/callback?message=You need to login first.`)
    }
  })

  server.get('/auth/session', (req, res) => {
    if (req.session) {
      return res.json(req.session)
    } else {
      return res.status(403)
    }
  })

  server.get('/auth/profile', async (req, res) => {
    if (req.session && req.session.loggedin) {
      const results = await getUser(req.session.email)
      if (results[0][0]) {
        return res.json({
          name: results[0][0].name || '',
          address: results[0][0].address || ''
        })
      } else {
        return res.status(500)
      }
    } else {
      return res.status(403)
    }
  })

  server.post('/auth/update', async (req, res) => {
    if (req.session && req.session.loggedin) {
      const results = await updateUser(req.body, req.session.email)
      if (results && results.length > 0) {
        return res.json({ok: true})
      } else {
        return res.status(500)
      }
    } else {
      return res.status(403)
    }
  })

  async function updateUser(body, email) {
    try {
      const results = await pool.query(`UPDATE users SET name='${body.name}', address='${body.address}' WHERE email='${email}';`)
      return results
    }catch(e){
      console.error(e)
    }
  }

}