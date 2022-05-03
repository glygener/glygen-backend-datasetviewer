import React, { Component } from "react";
import { Markup } from 'interweave';


class Resultfilter extends Component {
  

  render() {
    var filterInfo = this.props.filterinfo;

    var divList = [];
    for (var filterName in filterInfo) {
      var filterNameLbl = filterName.substr(0,1).toUpperCase() + filterName.substr(1);
      filterNameLbl = filterNameLbl.replace("_", " ");
      var liList = [];
      var valueList = Object.keys(filterInfo[filterName]).sort();
      for (var i in valueList) {
        var value = valueList[i];
        var count = filterInfo[filterName][value];
        var combo = filterName + "|" + value;
        var valueLbl = value.substr(0,1).toUpperCase() + value.substr(1);
        if (filterName === "file_type"){
          valueLbl = value.toUpperCase();
        }
        liList.push(<li><input name="filtervalue" type="checkbox" value={combo}/> {valueLbl} ({count})</li>);
      }
      divList.push(
        <div className="filter_div_four">
          <span style={{fontWeight:"bold"}}>{filterNameLbl}</span>
          <ul style={{listStyleType:"none",padding:"0px 0px 0px 10px"}}>
            {liList}
          </ul>
        </div>
      );
    }


    var btnStyle = {display: "block",float: "right",marginRight: "10px",fontSize: "14px"};
    var iconStyle = {display:"block",color:"#555", float:"right", width:"25px",  marginLleft:"3px"};
    var msgStyle = { display: "block", float: "left", fontSize: "12px", margin: "5px 0px 0px 5px"};

    return (
      <div className="leftblock filter_div_one">
        <div className="filter_div_two">
          <div style={msgStyle}><Markup content={this.props.resultSummary}/></div>
          <div onClick={this.props.handleFilterIcon} className="reglink" 
            style={{display: "block", float: "right",margin:"0px"}}>
            <i className="material-icons" style={iconStyle}>tune</i>
          </div>
          <div id="filtercn" className="filter_div_three">
            {divList}
            <div style={{display: "block",float: "left",width: "100%",margin: "10px 0px 10px 0px"}}>
              <button onClick={this.props.handleFilterReset} 
                className="btn btn-outline-secondary" 
                style={btnStyle}>
                Reset
              </button>
              <button onClick={this.props.handleFilterApply} 
                className="btn btn-outline-secondary" 
                style={btnStyle}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Resultfilter;
