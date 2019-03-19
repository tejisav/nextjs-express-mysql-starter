import React from 'react'
import Router from 'next/router'
import { Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import Layout from '../components/layout'
import Session from '../utils/session'

export default class extends React.Component {
  
  static async getInitialProps({req, res}) {

    let props = {
      session: ''
    }
    
    if (req && req.session) {
      props.session = req.session
    } else {
      props.session = await Session.getSession()
    }

    if (!props.session || !props.session.loggedin) {
      if (req) {
        res.redirect('/login')
      } else {
        Router.push('/login')
      }
    }
    
    return props
  }

  constructor(props) {
    super(props)
    this.state = {
      name: '',
      address: '',
      message: null,
      messageStyle: null
    }
    this.handleChange = this.handleChange.bind(this)
    this.setProfile = this.setProfile.bind(this)
  }

  async componentDidMount() {
    this.getProfile()
  }

  getProfile() {
    fetch('/auth/profile', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(response => {
      if (!response.name || !response.address) return
      this.setState({
        name: response.name,
        address: response.address
      })
    })
  }
  
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  async setProfile(e) {
    e.preventDefault()
    
    this.setState({
      message: null,
      messageStyle: null
    })
    
    const data = {
      name: this.state.name,
      address: this.state.address
    }
    
    fetch('/auth/update', {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(async res => {
      if (res.status === 200) {
        this.getProfile()
        this.setState({
          message: 'Profile have been saved!',
          messageStyle: 'alert-success'
        })
      } else {
        this.setState({
          message: 'Failed to save profile',
          messageStyle: 'alert-danger'
        })
      }
    })
  }
  
  render() {
    
    const alert = (this.state.message === null) ? <div/> : <div className={`alert ${this.state.messageStyle}`} role="alert">{this.state.message}</div>

    if (this.props.session.loggedin) {
      return (
        <Layout {...this.props}>
          <Row className="text-center">
            <Col>
              <h1 className="display-2">Your Account</h1>
            </Col>
          </Row>
          <Row className="mt-4 text-center">
            <Col xs="12" sm={{ size: 8, offset: 2 }}>
              <h2>Edit your profile</h2>
              <p className="lead text-muted">
                Here you can update basic information for your profile.
              </p>
              <Form onSubmit={this.setProfile}>
                <FormGroup row>
                  <Label xs={2} for="userName">Name:</Label>
                  <Col xs={10}>
                    <Input name="name" id="userName" value={this.state.name} onChange={this.handleChange} />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label xs={2} for="userAddress">Address:</Label>
                  <Col xs={10}>
                    <Input name="address" id="userAddress" value={this.state.address} onChange={this.handleChange} />
                  </Col>
                </FormGroup>
                <Button className="mb-3" type="submit">Update</Button>
              </Form>
              {alert}
            </Col>
          </Row>
          <Row className="mt-4 mb-1 text-center">
            <Col>
              <h2>Delete your account</h2>
              <p className="lead text-muted">
                If you delete your account it will be erased immediately.
                You can sign up again at any time.
              </p>
              <Form method="post" action="/auth/delete">
                <Button type="submit" color="outline-danger"><span className="icon ion-md-trash mr-1"></span> Delete Account</Button>
              </Form>
            </Col>
          </Row>
        </Layout>
      )
    } else {
      return (
        <Layout {...this.props}>
          <div />
        </Layout>
      )
    }
  }
}