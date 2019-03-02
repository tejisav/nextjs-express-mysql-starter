const pool = require('../dbconfig/dbconfig')

module.exports = (server) => {

  if (server === null) {
    throw new Error('server should be an express instance')
  }

  server.post('/auth', async (req, res) => {
    var email = req.body.email
    var password = req.body.password
    if (email && password) {
      try {
        const results = await getUsers(email, password)
        if (results.length > 0) {
          req.session.loggedin = true
          req.session.email = email
          res.redirect('/home')
        } else {
          res.send('Incorrect email and/or Password!')
        }			
        res.end();
      }catch(e){
        console.error(e)
      }
    } else {
      res.send('Please enter email and Password!')
      res.end()
    }
  })

  async function getUsers(email, password) {
    try {
      const results = await pool.query(`SELECT * FROM users WHERE email='${email}' AND password='${password}';`)
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