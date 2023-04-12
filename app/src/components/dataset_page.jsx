import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import { Chart } from "react-google-charts";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Markup } from 'interweave';
import $ from "jquery";
import {sortReleaseList} from "./util";

var verInfo = {};

class DatasetPage extends Component {
  
  state = {
    ver:"",
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

  handleVersion = () => {
    var ver = $("#verselector").val();
    var reqObj = { bcoid:this.props.bcoId, dataversion:ver};
    this.fetchPageData(reqObj);
    var tmpState = this.state;
    tmpState.ver = ver;
    this.setState(tmpState);
  }

  componentDidMount() {
      var reqObj = { bcoid:this.props.bcoId, dataversion:this.props.initObj.dataversion};
      this.fetchPageData(reqObj); 
  
  }



  fetchPageData(reqObj){


    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_detail;

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


  handleTitleClick = (e) => {

    var tmpState = this.state;
    tmpState.tabidx = e.target.id.split("-")[0];
    this.setState(tmpState);
  };




  render() {


    if (!("response" in this.state)){
      return <Loadingicon/>
    }
    
    const resObj = (this.state.response !== undefined ? this.state.response : {});
    const extractObj = ("record" in resObj ? resObj.record.extract : undefined);
    const bcoObj = ("record" in resObj ? resObj.record.bco : undefined);
    const historyObj = ("record" in resObj ? resObj.record.history : undefined);
  




    var readMe = (extractObj !== undefined ? extractObj.readme : undefined); 
    var downloadUrl = (extractObj !== undefined ? extractObj.downloadurl : undefined);
    var bcoTitle = (extractObj !== undefined ? extractObj.title : undefined);
    var bcoDescription = (extractObj !== undefined ? extractObj.description : undefined);

    var tabHash = {
        "sampleview":{
          title:"Sample View",
          cn:""
        },
        "bcoview":{
          title:"BCO JSON",
          cn:(<pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(bcoObj, null, 4)}</pre>)
        },
        "readme":{
          title:"README",
          cn:(<pre>{readMe}</pre>)
        },
        "downloads":{
          title:"DOWNLOADS",
          cn:(
            <ul style={{margin:"20px 0px 100px 20px"}}>
              <li><Link to={downloadUrl} className="reglink" target="_">Download dataset file</Link></li>
            </ul>
          )
        }
      };

      tabHash.sampleview.cn = "";    
      if (extractObj !== undefined){
        if(extractObj.sampledata.type === "table"){
          tabHash.sampleview.cn = (
            <Chart 
              width={'100%'}
            chartType="Table" 
            loader={<div>Loading Chart</div>}
            data={extractObj.sampledata.data}
            options={{showRowNumber: false, width: '100%', height: '100%'}}
            rootProps={{ 'data-testid': '1' }}   
            />
          )
        }
        else{
          tabHash.sampleview.cn = (<div style={{fontSize:"14px"}}><pre>{extractObj.sampledata.data}</pre></div>);
          //tabHash.sampleview.cn = <Markup content={extractObj.sampledata.data}/>;
        }  
      }


      var tabTitleList= [];
      var tabContentList = [];
      for (var tabId in tabHash){
        var activeFlag = (tabId === this.state.tabidx ? "active" : "" );
        var btnStyle = {width:"100%", fontSize:"15px", color:"#333", border:"1px solid #ccc"};
        btnStyle.color = (activeFlag === "active" ? "#990000" : "#333");
        btnStyle.background = (activeFlag === "active" ? "#fff" : "#eee");
        btnStyle.borderBottom = (activeFlag === "active" ? "1px solid #fff" : "1px solid #ccc");
        tabTitleList.push(
          <li key={"tab-"+tabId} className="nav-item" role="presentation" 
            style={{width:"25%"}}>
            <button className={"nav-link " + activeFlag} 
            id={tabId + "-tab"}  data-bs-toggle="tab" 
            data-bs-target={"#sample_view"} type="button" role="tab" aria-controls={"sample_view-cn"} aria-selected="true"
            style={btnStyle} onClick={this.handleTitleClick}
            >
             {tabHash[tabId].title}  
            </button>
        </li>
      );
      tabContentList.push(
        <div key={"formcn-"+tabId} 
          className={"tab-pane fade show  leftblock " + activeFlag} 
          id={tabId+"-cn"} role="tabpanel" aria-labelledby={tabId + "-tab"}
          style={{width:"100%",  padding:"20px", background:"#fff"}}>
          {tabHash[tabId].cn}
        </div>
      );
    }

    var selectedFileName = "";
    var verSelector = "";
    if (historyObj !== undefined){
      var verOptions = [];
      //var verList = sortReleaseList(Object.keys(historyObj), false);
      var verList = sortReleaseList(this.props.initObj.versionlist, false);
      var selectedVer = (this.state.ver !== "" ? this.state.ver.split(".").join("_") : verList[0].split(".").join("_"));
      for (var i in verList ){
        var ver = verList[i].split(".").join("_");
        if (ver in historyObj){
            verInfo[ver] = historyObj[ver];
        }
        if (ver in verInfo){
          var verLbl = ver.split("_").join(".") ;
          var lbl = "version " + verLbl + " released on " + verInfo[ver].release_date 
          lbl += " -- " + verInfo[ver].id_count + " record IDs ";
          if (verInfo[ver].ids_added > 0){
            lbl +=  ", " + verInfo[ver].ids_added + " added";
          }
          else if (verInfo[ver].ids_removed > 0){
            lbl +=  ", " + verInfo[ver].ids_removed + " removed";
          }
          verOptions.push(<option value={verLbl}>{lbl}</option>);
        }
      }
      selectedFileName = "Sample view for " + verInfo[selectedVer].file_name;
      var s = {width:"50%"};
      verSelector = (<select id="verselector" className="form-select" style={s} onChange={this.handleVersion}>{verOptions}</select>);
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
          <Link to={"/"+this.props.bcoId} className="reglink">{this.props.bcoId}</Link> 
        </div>
        <div className="leftblock" style={{width:"100%", margin:"40px 0px 0px 0px"}}>
          <span>{selectedFileName}</span><br/>
          <span>{verSelector}</span><br/>
          <span style={{fontWeight:"bold"}}>{bcoTitle}</span><br/>
          <span>{bcoDescription}</span><br/>
        </div>

        <div className="leftblock" 
          style={{width:"100%", margin:"20px 0px 0px 0px"}}>
          <ul className="nav nav-tabs" id="myTab" role="tablist" style={{width:"50%"}}>
            {tabTitleList}
          </ul>
          <div className="tab-content" id="myTabContent" 
            style={{width:"100%", margin:"20px 0px 0px 0px"}}>
            {tabContentList}
          </div>
        </div>

       

        

        
      </div>
    );
  }
}

export default DatasetPage;
