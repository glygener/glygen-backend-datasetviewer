import React, { Component } from "react";
import Searchbox from "./search_box";
import Filter from "./filter";
import { filterObjectList} from './util';
import * as LocalConfig from "./local_config";
import Loadingicon from "./loading_icon";
import Alertdialog from './dialogbox';
import $ from "jquery";
import Tableview from "./table";
import {getColumns} from "./columns";


class DatasetList extends Component {  
  
  state = {
    filterlist: [],
    pageIdx:1,
    pageBatchSize:5,
    pageStartIdx:1,
    pageEndIdx:5,
    dialog:{
      status:false, 
      msg:""
    }
  };

  componentDidMount() {
    this.handleSearch();
  }


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  
  handleKeyPress = (e) => {
    if(e.key === "Enter"){
      e.preventDefault();
      this.handleSearch();
    }
  }
 

   handleSearch = () => {
    var queryValue = ($("#query").val() === undefined ? "" : $("#query").val());
    var searchType = ($("#searchtype").val() === undefined ? "metadata" : $("#searchtype").val());
    var reqObj = {query:queryValue, "searchtype":searchType};
    this.handleFilterReset();

    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_search;
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
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }


  handleFilterReset = () => {
    $('input[name="filtervalue"]:checkbox:checked').prop("checked", false);
    this.setState({ filterlist: [] });
  };

  handleFilterApply = () => {
    var tmpList = $('input[name="filtervalue"]:checkbox:checked')
      .map(function () {
        return $(this).val();
      })
      .get(); // <----
    
    this.setState({ filterlist: tmpList });
    
  };

  handleFilterIcon = () => {
    $("#filtercn").toggle();
  };

  




  render() {
  
    if (!("response" in this.state)){
      return <Loadingicon/>
    }

    const objList = (this.state.response.recordlist !== undefined ? this.state.response.recordlist : []);
    
    //var filObj = filterObjectList(objList, []);
    var filObj = filterObjectList(objList, this.state.filterlist);
    var filterInfo = filObj.filterinfo;
    var passedObjList = filObj.passedobjlist;
    var passedCount = passedObjList.length;

    var batchSize = 20;
    var pageCount = parseInt(passedObjList.length/batchSize) + 1;
    pageCount = (objList.length > 0 ? pageCount : 0);


    var startIdx = batchSize * (parseInt(this.state.pageIdx) - 1) + 1;
    var endIdx = startIdx + batchSize;
    endIdx = (endIdx > passedCount ? passedCount : endIdx);

    //var filterHideFlag = (objList.length > 0 ? "block" : "none");
    var filterHideFlag = "block";

    var tmpList = [];
    for (var i in this.state.filterlist){
        var h = "<b>" + this.state.filterlist[i].split("|")[1] + "</b>";
        tmpList.push(h);
    }
    var resultSummary = ""
    if ("stats" in this.state.response){
      var statObj = this.state.response.stats;
      resultSummary = "<b>" + statObj.total + "</b> results found";
      if (tmpList.length > 0){
        resultSummary += ", <b>" + passedObjList.length + "</b> shown after filters: ";
        resultSummary += tmpList.join("', '")
      }
      resultSummary += ".";
    }


    var tableId = "tableone";
    var idField = "bcoid";
    var tableCols = getColumns(tableId);
    var tableRows = [];
    for (var i in passedObjList){
      var obj = passedObjList[i];
      var o = {};
      for (var j in tableCols){
        var f = (tableCols[j]["field"] === "id" ? idField : tableCols[j]["field"])
        o[tableCols[j]["field"]] = obj[f]
      }
      o["details"] =  {"bcoid":o.id, "label":" ... view details"}
      o["details"]["rowlist"] = ("rowlist" in obj ? obj["rowlist"] : []);
      tableRows.push(o)
    }

    return (
      <div>
        <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
        <div className="searchboxwrapper">
            <Searchbox initObj={this.props.initObj} 
              defaultvalue={"Q14392"}  
              onSearch={this.handleSearch} onKeyPress={this.handleKeyPress}/>
        </div>
        <div className="filterboxwrapper" style={{display:filterHideFlag}}>
          <Filter
            filterinfo={filterInfo}
            resultcount={objList.length}
            resultSummary={resultSummary}
            handleSearchIcon={this.handleSearchIcon}
            handleFilterIcon={this.handleFilterIcon}
            handleFilterApply={this.handleFilterApply}
            handleFilterReset={this.handleFilterReset}
          />
        </div>
        <div className="searchresultscn">
          <Tableview cols={tableCols} rows={tableRows}/>
        </div>
      </div>
    );
  }
}

export default DatasetList;
