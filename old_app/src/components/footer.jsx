import React, { Component } from "react";
import { SocialIcon } from 'react-social-icons';
import { Link } from "react-router-dom";

class Globalfooter extends Component {
  render() {
    var sOne = {fontSize:"18px", marginRight:"40px", textDecoration:"none", color:"#fff"};

    var cnOne = [];
    for (var i in this.props.initObj.footer.links){
        var obj = this.props.initObj.footer.links[i];
        cnOne.push(<Link id={"link_" +i} key={"link_" + i} href={obj.url} style={sOne}>{obj.label}</Link>);
    }
    var cnTwo = this.props.initObj.footer.funding;
    var logoImgList = this.props.initObj.footer.logos;
    var cnThree = [];
    for (var i in logoImgList){
        cnThree.push(<img src={process.env.PUBLIC_URL + logoImgList[i]} style={{width:"150px", margin:"0px 20px 0px 0px"}}/>);
    }

    return (
        <div className="leftblock" style={{width:"100%", background:"DodgerBlue", color:"#fff", margin:"0px 0px 0px 0px"}}>
            <div className="leftblock" style={{width:"80%", textAlign:"center", margin:"30px 10% 20px 10%"}}>
                {cnOne}
            </div>
            <div className="leftblock" style={{width:"80%", textAlign:"center", fontSize:"20px", margin:"0px 10% 20px 10%"}}>
                {cnTwo} 
            </div>
            <div className="leftblock" style={{width:"80%", textAlign:"center", margin:"0px 10% 30px 10%"}}>
                {cnThree}
            </div>
        </div>
    );




  }
}

export default Globalfooter;
