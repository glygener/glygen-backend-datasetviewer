import React, { Component } from "react";
import { Markup } from 'interweave';


class Filter extends Component {
  

  render() {
    var filterInfo = this.props.filterinfo;


    var divList = [];
    var catList = Object.keys(filterInfo).sort()
    if (catList.indexOf("species") !== -1){
        const idx = catList.indexOf("species");
        const x = catList.splice(idx, 1);
        catList.unshift("species");
    }

    for (var c in catList) {
      var catName = catList[c];
      var catNameLbl = catName.substr(0,1).toUpperCase() + catName.substr(1);
      catNameLbl = catNameLbl.replace("_", " ");
      var rList = [];
      var countDict = filterInfo[catName];
      var catValList = Object.keys(countDict).sort();
      //for (var catVal in countDict){
      for (var j in catValList){
        var catVal = catValList[j];
        var count = countDict[catVal]
        var combo = catName + "|" + catVal;
        var catValLbl = catVal.substr(0,1).toUpperCase() + catVal.substr(1);
        if (catName === "file_type"){
          catValLbl = catVal.toUpperCase();
        }

        var isChecked = (this.props.filterlist.indexOf(combo) === -1 ? false : true)
        rList.push(<tr>
            <td valign="top" style={{paddingLeft:"10px"}}>
              <input name="filtervalue" type="checkbox" checked={isChecked} value={combo} onClick={this.props.handleFilterApply}/></td>
            <td valign="top" style={{paddingLeft:"10px", fontSize:14}}>{catValLbl} ({count})</td>
          </tr>);
      }
      divList.push(
        <div className="filter_div_two">
          <table style={{padding:"0px 0px 0px 10px"}}>
            <tr><td colspan="2" style={{fontWeight:"bold", height:40}}>By {catNameLbl}</td></tr>
            {rList}
          </table>
        </div>
      );
    }


    var btnStyle = {display: "block",float: "right",marginRight: "10px",fontSize: "14px"};
    var iconStyle = {display:"none",color:"#555", float:"right", width:"25px",  marginLleft:"3px"};
    var msgStyle = { display: "block", float: "left", fontSize: "12px", margin: "5px 0px 0px 5px"};

    return (
      <div className="leftblock filter_div_one">
          <div id="filtercn" >
            {divList}
          </div>
        <div className="filterbtnscn">
            <button onClick={this.props.handleFilterReset}
                className="btn btn-outline-secondary" style={btnStyle}>Reset</button>
            <button onClick={this.props.handleFilterApply}
                className="btn btn-outline-secondary" style={btnStyle}>Apply</button>
        </div>
      </div>
    );
  }
}

export default Filter;
