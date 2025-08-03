import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";



class DownloadPage extends Component {
  
  state = {
    tabidx:"sampleview",
    dialog:{
      status:false, 
      msg:""
    }
  };

  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  componentDidMount() {

  }




  render() {
   
    var fileUrl = window.location.href;
    var s = {width:"80%", margin:"100px 10% 100px 10%", color:"red" };
    return (
      <div className="pagecn">
        <div className="leftblock" style={s}>
           File not found: <br/>{fileUrl}
        </div>
      </div>
    );
  }
}

export default DownloadPage;
