import React, { Component } from "react";
import { SocialIcon } from 'react-social-icons';
import { Link } from "react-router-dom";
import { Markup } from 'interweave';

class Globalfooter extends Component {
  render() {
    

    var s = {fontSize:"18px", marginRight:"40px", textDecoration:"none", color:"#fff"};
    var footerLinks = [];
    for (var i in this.props.initObj.footer.links){
        var obj = this.props.initObj.footer.links[i];
        footerLinks.push( <a id={"link_" +i} key={"link_" + i} href={obj.url} style={s}>{obj.label}</a>);
    }
    var funding = ("funding" in this.props.initObj.footer ? this.props.initObj.footer.funding : "");
    var license = ("license" in this.props.initObj.footer ? this.props.initObj.footer.license : "");

    var logoImages = [];
    for (var i in this.props.initObj.footer.logos){
        var url = this.props.initObj.footer.logos[i];
        logoImages.push(<img src={process.env.PUBLIC_URL + url} style={{width:"100px", margin:"0px 20px 0px 0px"}}/>);
    }

    var s = {width:"100%", background:"DodgerBlue", color:"#fff", margin:"0px 0px 0px 0px"}; 
    var sOne = {width:"80%", textAlign:"center", margin:"30px 10% 20px 10%"};
    var sTwo = {width:"80%", textAlign:"center",fontSize:"20px",margin:"0px 10% 20px 10%"};
    var sThree = {width:"80%", textAlign:"center",fontSize:"16px",margin:"0px 10% 20px 10%"};
    var sFour = {width:"80%", textAlign:"center", margin:"0px 10% 30px 10%"};
    return (
        <div className="leftblock" style={s}>
            <div className="leftblock" style={sOne}>{footerLinks}</div>
            <div className="leftblock" style={sTwo}><Markup content={funding}/></div>
            <div className="leftblock" style={sThree}><Markup content={license}/></div>
            <div className="leftblock" style={sFour}>{logoImages}</div> 
        </div>
    );




  }
}

export default Globalfooter;
