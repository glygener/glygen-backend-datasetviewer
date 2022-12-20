import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import { Chart } from "react-google-charts";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Markup } from 'interweave';
import $ from "jquery";
import {sortReleaseList, verifyReqObj} from "./util";
import formHash from "../jsondata/form_submissions.json";
import Formeditor from "./form_editor";


var verInfo = {};


class Gsd extends Component {
  
  state = {
    ver:"",
    tabidx:"sampleview",
    pageid:"submit",
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


  handleSubmit = () => {
    
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    var jqClass = ".submissionsform";
    var reqObj = {};
    var selectedForm = formHash["step_one"];
    $(jqClass).each(function () {
        var fieldName = $(this).attr("id");
        var fieldValue = $(this).val();
        for (var i in selectedForm.groups){
            for (var j in selectedForm.groups[i].emlist){
              var emObj = selectedForm.groups[i].emlist[j];
              if (fieldName === emObj.emid){
                if (emObj.datatype.split("|")[1] === "int"){
                  fieldValue = parseInt(fieldValue);
                }
                reqObj[fieldName] = fieldValue;
                if (emObj.emtype === "select"){
                  emObj.value.selected = fieldValue;
                }
                else{
                  emObj.value = fieldValue;
                }
              }
            }
        }
        //$(this).val("");
    });

    var errorList = verifyReqObj(reqObj, selectedForm);
    if (errorList.length !== 0) {
      var tmpState = this.state;
      tmpState.dialog.status = true;
      tmpState.dialog.msg = <div><ul> {errorList} </ul></div>;
      this.setState(tmpState);
      return;
    }


    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.gsd_submit;
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
          tmpState.pageid = "confirmation";
          this.setState(tmpState);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
          //console.log("Ajax error:", error);
        }
      );


  }
  
  setFormValues = () => {
    for (var k in formHash){
      for (var i in formHash[k]["groups"]){
        for (var j in formHash[k]["groups"][i]["emlist"]){
          var emObj = formHash[k]["groups"][i]["emlist"][j];
          if (emObj.emid === "submitbtn"){
            //var f = (emObj.value === "Back" ? this.handleBack : this.handleNext);
            emObj.onclick = eval(emObj.onclick);
          }
        }
      }
    }

  }

  setPageId = () => {


    var selectedForm = formHash["step_one"];
    for (var i in selectedForm.groups){
      for (var j in selectedForm.groups[i].emlist){
        var emObj = selectedForm.groups[i].emlist[j];
        if (emObj.datatype.indexOf("string") !== -1){
          emObj.value = "";
        }
      }
    }

    var tmpState = this.state;
    tmpState.pageid = "submit";
    this.setState(tmpState);

  }


  render() {

    //if (!("response" in this.state)){
    //  return <Loadingicon/>
    //}
 

    this.setFormValues();
    var k = "step_one";
    var cn = (<div><Formeditor formClass={formHash[k].class} formObj={formHash[k]}/></div>)
    if (this.state.pageid === "confirmation"){
        cn = (<div>
          <br/><br/>
          Success, thank you for your submission! <Link to="/gsd" onClick={this.setPageId} className="reglink">Click here</Link> to submit another term.
          </div>);
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
          <Link to="/gsd" className="reglink">GSD Submission</Link> 
        </div>

        <div className="leftblock" 
          style={{width:"100%", margin:"20px 0px 0px 0px"}}>
          {cn}
        </div>
        
      </div>
    );
  }
}

export default Gsd;
