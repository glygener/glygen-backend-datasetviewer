import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Chart } from "react-google-charts";

import $ from "jquery";


class HistoryList extends Component {
  
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

    var reqObj = {};
    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_history_list;


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
    var pageIdLabel = this.props.pageId.toUpperCase();


    var dataFrame = [];
    
    var seenVersion = {};
    var valueRows = [];
    for (var i in this.state.response.recordlist){
      var obj = this.state.response.recordlist[i];
      var tmpRow = [obj["bcoid"] + ' (' + obj["filenames"] + ')'];
      for (var j in obj["history"]){
        var o = obj["history"][j];
        seenVersion[o["version"]] = true;
        tmpRow.push(String(o["recordcount"]));
      }
      tmpRow.push('<a href=\"'+obj["bcoid"]+'/history\">details</a>');
      valueRows.push(tmpRow);
    }

    var row = [ {"label": "File Name","type": "string"}];
    for (var ver in seenVersion){
      row.push({"label": "ver-"+ver,"type": "string"})
    }
    row.push({"label": "","type": "string"})
    dataFrame.push(row);
    
    for (var i in valueRows){
      dataFrame.push(valueRows[i]);
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
          <Link to={"/static/"+this.props.pageId} className="reglink">{pageIdLabel}</Link> 
        </div>

        <div className="leftblock" style={{width:"100%", margin:"40px 0px 0px 0px"}}>
            <Chart 
                width={'100%'}
                chartType="Table" 
                loader={<div>Loading Chart</div>}
                data={dataFrame}
                options={
                    {
                        showRowNumber: false, width: '100%', height: '100%',
                        page:'enable', 
                        pageSize:50, 
                        allowHtml:true, 
                        cssClassNames:{
                            headerRow: 'googleheaderrow',
                            tableRow:'googlerow', 
                            oddTableRow:'googleoddrow',
                            headerCell:'googleheadercell',
                            tableCell:'googlecell'
                        }
                    }
                }
                rootProps={{ 'data-testid': '1' }}   
          />
        </div>


      </div>
    );
  }
}

export default HistoryList;

