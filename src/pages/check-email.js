import React from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import Session from '../utils/session'

export default class extends React.Component {

  static async getInitialProps({req, res, query}) {

    let props = {
      session: '',
      email: query.email || ''
    }

    if (req && req.session) {
      props.session = req.session
    } else {
      props.session = await Session.getSession()
    }

    if (props.session && props.session.loggedin) {
      if (req) {
        res.redirect('/')
      } else {
        Router.push('/')
      }
    }
    
    return props
  }
  
  render() {
    return (
      <Layout {...this.props}>
        <div className="text-center pt-5 pb-5">
          <h1 className="display-4">Check your email</h1>
          <p className="lead">
            A verification link has been sent to { (this.props.email) ? <span className="font-weight-bold">{this.props.email}</span> : <span>your inbox</span> }.
          </p>
        </div>
      </Layout>
    )
  }
}
