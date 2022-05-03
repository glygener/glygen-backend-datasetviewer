import React, { Component } from "react";
import { SocialIcon } from 'react-social-icons';


class Globalfooter extends Component {
  render() {
    var sOne = {fontSize:"18px", marginRight:"40px", textDecoration:"none"};
    return (
      <div className="leftblock" 
        style={{width:"100%", background:"DodgerBlue", color:"#fff", margin:"0px 0px 0px 0px"}}>
          <div className="leftblock" 
            style={{width:"80%", textAlign:"center", margin:"30px 10% 20px 10%"}}>
            <a href="https://glygen.org/license/" className="text-reset" style={sOne}>License</a> 
            <a href="https://glygen.org/privacy-policy/" className="text-reset" style={sOne}>Privacy Policy</a>
            <a href="https://glygen.org/disclaimer/" className="text-reset" style={sOne}>Disclaimer</a>
            <a href="https://glygen.org/contact-us/" className="text-reset" style={sOne}>Contact Us</a>
          </div>

          <div className="leftblock" 
            style={{width:"80%", textAlign:"center", fontSize:"20px", margin:"0px 10% 20px 10%"}}>
            Funded by NIH Glycoscience Common Fund Grant # 1U01GM125267 - 01
          </div>
          
          <div className="leftblock" 
            style={{width:"80%", textAlign:"center", margin:"0px 10% 30px 10%"}}>
            <img alt="" src={process.env.PUBLIC_URL + '/imglib/logo-uga.png'}/>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            <img alt="" src={process.env.PUBLIC_URL + '/imglib/logo-gwu.png'}/>
          </div>

          
      </div>
    );

  }
}

export default Globalfooter;
