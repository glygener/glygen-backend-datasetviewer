import React, { Component } from "react";
//import Navbar from 'navbar-react'
//import { Container} from 'react-containers';
import { Form, FormControl, Container, Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';



class Header extends Component {

  


  render() {

    var navbarStyle =  { minHeight:"80px"}
    var server = process.env.REACT_APP_SERVER;
    if (server !== "prd"){
      navbarStyle.backgroundImage = 'url("/imglib/watermark.'+server+'.png")';
    }
  
    console.log("headerlinks", this.props.initObj);

    var headerLinks = [];
    for (var i in this.props.initObj.headerlinks){
      var obj = this.props.initObj.headerlinks[i];  
      headerLinks.push(<Nav.Link key={"link_" +obj.id} href={obj.url}>{obj.label}</Nav.Link>)
    }
    

    return (
      <Navbar className="globalheader"  variant="dark" expand="lg" 
        style={navbarStyle}
        >
        <Container fluid>
          <Navbar.Brand href="/" style={{fontSize:"20px"}}>GlyGen Datasets</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-lg-0" navbarScroll style={{fontSize:"18px"}}>
              {headerLinks}
              <NavDropdown title="About" id="navbarScrollingDropdown"
                style={{display:"none"}}
              >
                <NavDropdown.Item href="/static//workflow">Integration Workflow</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action6">
                  Data Version 1.1
                </NavDropdown.Item>
                <NavDropdown.Item href="#action6">
                  Website Version 1.1
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default Header;
