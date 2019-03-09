import React from 'react'

export default class extends React.Component {

  static async getInitialProps({req, res, query}) {
    return query
  }
  
  render() {
    return (
      <div className="text-center pt-5 pb-5">
        <h1 className="display-4">Check your email</h1>
        <p className="lead">
          A sign in link has been sent to { (this.props.email) ? <span className="font-weight-bold">{this.props.email}</span> : <span>your inbox</span> }.
        </p>
      </div>
    )
  }
}
