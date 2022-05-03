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
    var urlDict = {
      "prd":{
        "portal":"https://glygen.org", 
        "api":"https://api.glygen.org",
        "sparql":"https://sparql.glygen.org"
      },
      "beta":{
        "portal":"https://beta.glygen.org",
        "api":"https://beta-api.glygen.org",
        "sparql":"https://beta-sparql.glygen.org"
      },
      "tst":{
        "portal":"https://tst.glygen.org",
        "api":"https://api.tst.glygen.org",
        "sparql":"https://sparql.tst.glygen.org"
      },
      "dev":{
        "portal":"https://dev.glygen.org",
        "api":"https://api.dev.glygen.org",
        "sparql":"https://sparql.dev.glygen.org"
      }
    }

    console.log("headerlinks", this.props.initObj);
    var pageId = window.location.href.split("/")[3];
    pageId = (pageId.trim() === "" ? "home" : pageId);
    var sOne = {color:"#ccc", margin:"0 10px 0px 0px"};
    var sTwo = {color:"#fff", margin:"0 10px 0px 0px"};
    var headerLinks = [];
    for (var i in this.props.initObj.headerlinks){
      var obj = this.props.initObj.headerlinks[i];  
      var s = (obj.id === pageId ? sOne : sTwo);
      if (["api", "portal", "sparql"].indexOf(obj.id) !== -1){
          obj.url = urlDict[server][obj.id]
          //alert(obj.id + ':' + obj.url);
      }
      headerLinks.push(<Nav.Link id={"link_" +obj.id} key={"link_" +obj.id} href={obj.url} style={{fontWeight:"bold"}} style={s}>{obj.label}</Nav.Link>)
    }
    
    var urlDict = {
      
    };

    return (
      <Navbar className="globalheader"  variant="dark" expand="lg" 
        style={navbarStyle}
        >
        <Container fluid>
          <Navbar.Brand href="/" style={{fontSize:"30px"}}>
             <img alt="" src={process.env.PUBLIC_URL + '/imglib/logo-glygen.svg'} 
            style={{width:"100%"}} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-lg-0" navbarScroll style={{fontSize:"20px"}}>
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
