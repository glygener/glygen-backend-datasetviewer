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
import { Markup } from 'interweave';


class DatasetList extends Component {  
  
  state = {
    searchquery:"",
    filterlist: [],
    objlist:[],
    statobj:{},
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
    this.handleGetResults();
  }


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  

   handleGetResults = () => {
    var reqObj = {list_id:this.props.listId};

    this.handleFilterReset();

    var tmpState = this.state;
    tmpState.objlist = [];
    tmpState.isLoaded = false;
    this.setState(tmpState);

    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_list;
    console.log("API:", svcUrl);
    console.log("REQ:", reqObj);

    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log("RES:", result);
          var tmpState = this.state;
          tmpState.isLoaded = true;          
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = result.error;
          }
          tmpState.objlist = result.recordlist;
          tmpState.statobj = result.stats;
          tmpState.searchquery = result.searchquery;
          this.setState(tmpState);
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
      .map(function () {return $(this).val();}).get(); // <----
    this.setState({ filterlist: tmpList });
    
  };

  handleFilterIcon = () => {
    $(".filterboxwrapper").toggle();
  };


    handleKeyPress = (e) => {
        if(e.key === "Enter"){
            e.preventDefault();
            this.handleSearch();
        }
    }
      
    
    handleSearch = () => {
        window.location.href = "/";
    }



    render() {

        if (this.state.isLoaded === false){
            return <Loadingicon/>
        }
        if (this.state.dialog.status === true){
            return (<div><Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/></div>);
        }
        

        var filObjOne = filterObjectList(this.state.objlist, this.state.filterlist);
        var passedObjList = filObjOne.passedobjlist;
        var passedCount = passedObjList.length;
        //var filterInfo = filObjOne.filterinfo;
    
        var filObjTwo = filterObjectList(passedObjList, []);
        var filterInfo = filObjTwo.filterinfo;

        var batchSize = 20;
        var pageCount = parseInt(passedObjList.length/batchSize) + 1;
        pageCount = (this.state.objlist.length > 0 ? pageCount : 0);

        var startIdx = batchSize * (parseInt(this.state.pageIdx) - 1) + 1;
        var endIdx = startIdx + batchSize;
        endIdx = (endIdx > passedCount ? passedCount : endIdx);

        var tmpList = [];
        for (var i in this.state.filterlist){
            var h = "<b>" + this.state.filterlist[i].split("|")[1] + "</b>";
            tmpList.push(h);
        }
        var resultSummary = ""
        if ("total" in this.state.statobj){
            resultSummary = "<b>" + this.state.statobj.total + "</b> datasets found";
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
                <div className="searchboxwrapper">
                    <div style={{display:"block", textAlign:"center"}}>
                        Search results for `{this.state.searchquery}`,<br/>
                        <a href="/">Click Here</a> to Reset Search
                    </div>
                </div>
               
                <div className="material-icons rightblock filtericoncn" onClick={this.handleFilterIcon}>tune</div>
                <div className="statscn"> <Markup content={resultSummary}/> </div>

                <div className="filterboxwrapper" >
                    <Filter
                        filterinfo={filterInfo}
                        filterlist={this.state.filterlist}
                        resultcount={this.state.objlist.length}
                        resultSummary={resultSummary}
                        handleFilterApply = {this.handleFilterApply}
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
