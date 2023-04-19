import React, { Component } from "react";
import { Markup } from 'interweave';


class Filter extends Component {
  

  render() {
    var filterInfo = this.props.filterinfo;

    var divList = [];
    for (var filterName in filterInfo) {
      var filterNameLbl = filterName.substr(0,1).toUpperCase() + filterName.substr(1);
      filterNameLbl = filterNameLbl.replace("_", " ");
      var rList = [];
      var valueList = Object.keys(filterInfo[filterName]).sort();
      for (var i in valueList) {
        var value = valueList[i];
        var count = filterInfo[filterName][value];
        var combo = filterName + "|" + value;
        var valueLbl = value.substr(0,1).toUpperCase() + value.substr(1);
        if (filterName === "file_type"){
          valueLbl = value.toUpperCase();
        }
        rList.push(<tr>
            <td valign="top" style={{paddingLeft:"10px"}}>
              <input name="filtervalue" type="checkbox" value={combo} onClick={this.props.handleFilterApply}/></td>
            <td valign="top" style={{paddingLeft:"10px", fontSize:14}}>{valueLbl} ({count})</td>
          </tr>);
      }
      divList.push(
        <div className="filter_div_two">
          <table style={{padding:"0px 0px 0px 10px"}}>
            <tr><td colspan="2" style={{fontWeight:"bold", height:40}}>By {filterNameLbl}</td></tr>
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
      </div>
    );
  }
}

export default Filter;
