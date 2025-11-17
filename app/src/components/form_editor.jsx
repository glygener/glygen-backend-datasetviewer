import React, { Component } from "react";
import { Markup } from 'interweave';
import {getFormElement} from './util';
import $ from "jquery";


class Formeditor extends Component {
  state = {
    formObj:this.props.formObj,
    rmlist:[]
  };

  handleRemoveObj = (e) => {
    const objIdx = e.target.id.split("_")[0];
    var tmpState = this.state;
    tmpState.rmlist.push(objIdx);
    this.setState(tmpState);
  };

  handleResetObj = (e) => {
    var tmpState = this.state;
    tmpState.rmlist = [];
    this.setState(tmpState);
  };





  render() {


    var grpList = [];
    for (var i in this.state.formObj.groups){
      var grpObj = this.state.formObj.groups[i];
      grpList[i] = [];
      for (var j in grpObj.emlist){
        var obj = grpObj.emlist[j];
        var emId = obj.emid;
        var emValue =  obj.value;
        if (obj.status !== "inactive"){
          var em = getFormElement(emId,obj,this.props.formClass, emValue);
          grpList[i].push(em);
        }
      }
    }
        
    var divList = [];
    var formTitle = this.state.formObj.title;
    var formDesc = this.state.formObj.description;
    if ("title" in this.state.formObj){
          var s = {width:"100%", background:"#fff", fontWeight:"bold"};
          s = ("titlestyle" in this.state.formObj ? this.state.formObj.titlestyle : s);
          divList.push(<div className="leftblock" style={s}>
            <Markup content={formTitle}/>
          </div>);
    }
    if ("description" in this.state.formObj){
        var s = {width:"90%", marginBottom:"20px"};
        s = ("descstyle" in this.state.formObj ? this.state.formObj.descstyle : s);
        divList.push(<div className="leftblock" style={s}>
            <Markup content={formDesc}/>
            </div>);
    }

    for (var i in grpList){
        var ttl = "";
        if ("title" in this.state.formObj.groups[i]){
          var s = {color:"DodgerBlue", width:"100%", margin:"-5px 0px 10px 0px", fontStyle:"italic"};
          ttl = (
            <div className="leftblock" key={"grp_title_"+i} style={s}>
              {this.state.formObj.groups[i].title}
            </div>
          );
        }
        var s = this.state.formObj.groups[i].style;
        divList.push(<div id={"grp_cn_"+i} key={"grp_ttl_"+i} 
          className="leftblock" style={s}> {ttl} {grpList[i]}</div>);
    }
      
    return(<div className="leftblock" style={{width:"100%"}}>{divList}</div>);
  }
}
  
  export default Formeditor;
