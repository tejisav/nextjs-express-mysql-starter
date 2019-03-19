import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Navbar, NavbarBrand, Nav, NavItem, Button } from 'reactstrap'
import Package from '../package'
import Styles from '../css/index.scss'

export default class extends React.Component {

  static propTypes() {
    return {
      // session: React.PropTypes.object.isRequired,
      children: React.PropTypes.object.isRequired,
      fluid: React.PropTypes.boolean
    }
  }
  
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  
  render() {
    return (
      <React.Fragment>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>{this.props.title || 'Starter'}</title>
          <style dangerouslySetInnerHTML={{__html: Styles}}/>
        </Head>
        <Navbar light className="navbar navbar-expand-md pt-3 pb-3">
          <Link prefetch href="/">
            <NavbarBrand href="/">
              <span className="icon ion-md-home mr-1"></span> {Package.name}
            </NavbarBrand>
          </Link>
          <SignOutButton {...this.props} />
        </Navbar>
        <MainBody fluid={this.props.fluid}>
          {this.props.children}
        </MainBody>
        <Container fluid={this.props.fluid}>
          <hr className="mt-3"/>
          <p className="text-muted small">
            <Link href="https://github.com/tejisav/nextjs-express-mysql-starter"><a className="text-muted font-weight-bold"><span className="icon ion-logo-github"/> {Package.name} {Package.version}</a></Link>
            <span> built with </span>
            <Link href="https://github.com/zeit/next.js"><a className="text-muted font-weight-bold">Next.js {Package.dependencies.next.replace('^', '')}</a></Link>
            <span> &amp; </span>
            <Link href="https://github.com/facebook/react"><a className="text-muted font-weight-bold">React {Package.dependencies.react.replace('^', '')}</a></Link>
            .
            <span className="ml-2">&copy; {new Date().getYear() + 1900}.</span>
          </p>
        </Container>
      </React.Fragment>
    )
  }
}

export class MainBody extends React.Component {
  render() {
    return (
      <Container fluid={this.props.fluid} style={{marginTop: '1em'}}>
        {this.props.children}
      </Container>
    )
  }
}

export class SignOutButton extends React.Component {

  render() {
    if (this.props.session && this.props.session.loggedin) {
      return (
        <Nav className="ml-auto" navbar>
          <NavItem>
            <Link href="/auth/signout">
              <Button outline color="primary"><span className="icon ion-md-log-out mr-1"></span> Sign Out</Button>
            </Link>
          </NavItem>
        </Nav>
      )
    } else {
      return (
        <span />
      )
    }
  }
}