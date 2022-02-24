import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Chart } from "react-google-charts";

import $ from "jquery";


class HistoryDetail extends Component {
  
  state = {
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

    var reqObj = {"bcoid":this.props.bcoId};
    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_history_detail;


    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;          
          if (tmpState.response.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
          this.setState(tmpState);
          //console.log("Request:",svcUrl);
          console.log("Ajax response:", result);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }



  render() {

    if (!("response" in this.state)){
      return <Loadingicon/>
    }

    

    return (
      <div className="pagecn">
        <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
        <div className="leftblock" style={{width:"100%", 
          margin:"60px 0px 0px 0px", 
          fontSize:"17px", borderBottom:"1px solid #ccc"}}>
          <DoubleArrowOutlinedIcon style={{color:"#2358C2", fontSize:"17px" }}/>
          &nbsp;
          <Link to="/" className="reglink">HOME </Link> 
            &nbsp; / &nbsp;
          <Link to={ "/" + this.props.bcoId + "/history"} className="reglink">HISTORY DETAIL</Link> 
        </div>
        <div className="leftblock" style={{width:"100%", margin:"40px 0px 0px 0px"}}>
          <span><b>BCO ID</b>: {this.state.response.record.bcoid}</span><br/>
          <span><b>File Name(s)</b>: {this.state.response.record.filenames}</span>
          <table style={{width:"100%", margin:"10px 0px 0px 0px"}}>
            <tbody>
              {this.state.response.record.history.map((obj) => (
                <tr>
                  <td style={{padding:"10px",border:"1px solid #ccc"}}>Version-{obj.version}</td>
                  <td style={{padding:"10px",border:"1px solid #ccc"}}>{obj.recordcount} records</td>
                  <td style={{padding:"10px",border:"1px solid #ccc"}}>
                    {obj.additions.length} additions<br/>
                    <textarea style={{width:"100%", height:"60px"}}>{obj.additions.join("\n")}</textarea>  
                  </td>
                  <td style={{padding:"10px",border:"1px solid #ccc"}}>
                    {obj.deletions.length} deletions
                    <textarea style={{width:"100%", height:"60px"}}>{obj.deletions.join("\n")}</textarea>  
                  </td>
                </tr>  
              ))}
            </tbody>
          </table>
        </div>


      </div>
    );
  }
}

export default HistoryDetail;

