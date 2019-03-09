import React from 'react'

export default () => (
  <div className="login-form">
    <h1>Login Form</h1>
    <form action="/login" method="POST">
      <input type="email" name="email" placeholder="Email" required/>
      <input type="password" name="password" placeholder="Password" required/>
      <input type="submit"/>
    </form>
    <h1>Signup Form</h1>
    <form action="/signup" method="POST">
      <input type="email" name="email" placeholder="Email" required/>
      <input type="password" name="password" placeholder="Password" required/>
      <input type="submit"/>
    </form>
    <style jsx>{`
      .login-form {
        width: 300px;
        margin: 0 auto;
        font-family: Tahoma, Geneva, sans-serif;
      }
      .login-form h1 {
        text-align: center;
        color: #4d4d4d;
        font-size: 24px;
        padding: 20px 0 20px 0;
      }
      .login-form input[type="password"],
      .login-form input[type="email"] {
        width: 100%;
        padding: 15px;
        border: 1px solid #dddddd;
        margin-bottom: 15px;
        box-sizing:border-box;
      }
      .login-form input[type="submit"] {
        width: 100%;
        padding: 15px;
        background-color: #535b63;
        border: 0;
        box-sizing: border-box;
        cursor: pointer;
        font-weight: bold;
        color: #ffffff;
      }
    `}</style>
  </div>
)