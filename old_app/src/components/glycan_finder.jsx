import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Chart } from "react-google-charts";

import $ from "jquery";


class GlycanFinder extends Component {
  
  state = {
    confirmation:"",
    viewstatus:0,
    tabidx:"failedrows",
    cn:"",
    dialog:{
      status:false, 
      msg:""
    }
  };


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    tmpState.viewstatus = 0;
    $("#tabcn").css("display", "none");
    this.setState(tmpState);
  }

  handleTitleClick = (e) => {
    var tmpState = this.state;
    tmpState.tabidx = e.target.id.split("-")[0];
    this.setState(tmpState);
  };


  handleGlycanFinder = () => {

    var reqObj = {"filename":this.state.response.inputinfo.name};
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_glycan_finder;
  

    const s = "width:40%;margin:20px 30% 40px 30%";
    var tmpCn = '<img src="' + process.env.PUBLIC_URL + '/imglib/loading.gif" style="'+s+'">';
    $("#glycan_finder_results_cn").html(tmpCn);
    $("#run_glycan_finder").html("");


    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.isLoaded = true;
          tmpState.response = result;
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = result.error;
          }
          this.setState(tmpState);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );

  }




  handleFileSubmit = () => {

    var reqObj = {"fname":"", "lname":"", "email":"", "affilation":""};
    for (var f in reqObj){
      reqObj[f] = $('#'+f).val();
    }
    reqObj["filename"] = this.state.response.inputinfo.name;
 
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_submit;

    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.isLoaded = true;
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = result.error;
          }
          this.setState(tmpState);
          $("#submitcn").html(result.confirmation);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );

  }



  handleFileUpload = () => {
    
    var file = $('#userfile')[0].files[0];
    var fileFormat = $('#formatselector').val();
    var qcType = $('#qcselector').val();
    var dataVersion = $('#dataversion').val();

    var formData = new FormData();
    formData.append("userfile", file);
    formData.append("format", fileFormat);
    formData.append("qctype", qcType);
    formData.append("dataversion", dataVersion);
    
    var tmpState = this.state;
    tmpState.viewstatus = 1;
    this.setState(tmpState);


    var sizeLimit = 1000000000;
    if (file.size > sizeLimit){
        var msg = 'Your submitted file is ' + file.size + ' Bytes big. ';
        msg += 'This exceeds maximum allowed file size of ' + sizeLimit + ' Bytes.';
        var tmpState = this.state;
        tmpState.dialog.status = true;
        tmpState.dialog.msg = msg;
        this.setState(tmpState);
        return;
    }
   
    const requestOptions = { 
      method: 'POST', 
      body: formData
    };
    const svcUrl = LocalConfig.apiHash.dataset_upload;

    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.viewstatus = 2;
          tmpState.isLoaded = true;
          if (tmpState.response.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
          if (["png", "jpeg"].indexOf(tmpState.response.inputinfo.format) !== -1){
            tmpState.tabidx = "glycanfinder";
          }
          this.setState(tmpState);
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


  

  getFormCn = () => {

    var formatOptions = [];
    var obj = {"id":"png", "label":"Glycan PNG"};
    formatOptions.push(<option value={obj.id}>{obj.label}</option>);

    return(
      <div className="leftblock formone" style={{width:"100%",marginTop:"10px"}}>
        <div className="leftblock" style={{width:"100%"}}>
              <br/>Upload image file (
                example file: <a href="/ln2data/downloads/examples/glycan_image.png"
                className="reglink" download>glycan_image.png</a>).
        </div>
        <div className="leftblock" style={{width:"25%",
                margin:"20px 0px 0px 0px",border:"0px dashed orange"}}>
              <b>File Format</b><br/>
              <select id="formatselector"  className="form-control">
                {formatOptions}
              </select>
        </div>

        <div className="leftblock" style={{width:"30%", margin:"20px 0px 0px 10px"}}>
              <b>Select File</b><br/>
              <input type="file" id="userfile"  className="form-control"/>
        </div>

        <div className="leftblock" style={{width:"10%", margin:"20px 0px 0px 10px"}}>
              &nbsp;<br/>
              <input
                type="submit" name="userfile"  value="Upload File" className="form-control"
                onClick={this.handleFileUpload}
              />
        </div>
      </div>
    );

  }



  render() {


    var tabHash = {
        glycanfinder:{title:"Run Glycan Finder", cn:""}
    };

    if (this.state.dialog.status === false && this.state.viewstatus === 1){
      $("#tabcn").css("display", "block");
      tabHash.glycanfinder.cn = (<Loadingicon/>)
    } 
    else if (this.state.dialog.status === false && this.state.viewstatus === 2){
        if (["png", "jpeg"].indexOf(this.state.response.inputinfo.format) !== -1){
          var server = process.env.REACT_APP_SERVER;
          var imageUrl = "/ln2data/userdata/"+server+"/tmp/" + this.state.response.inputinfo.name;
          

          var chartCn = "";
          if ("mappingrows" in this.state.response){

              chartCn = (
                <div>
                <h5>Glycan Finder Result</h5>
                <Chart width={'100%'} chartType="Table" loader={<div>Loading Chart</div>}
                  data={this.state.response.mappingrows}
                  options={{allowHtml: true, showRowNumber: false, width: '100%', height: '100%'}}
                  rootProps={{ 'data-testid': '1' }}
                />
                </div>
              );
          }
          var tmpCn = (
                <div>
                <div className="leftblock" style={{width:"70%", margin:"0px 0px 0px  20px"}}>
                    <h5>Query Glycan Image </h5>
                    <img src={imageUrl}/><br/>
                </div>
                <div id="run_glycan_finder"  className="leftblock" style={{width:"70%", margin:"20px 0px  0px  20px"}}>
                <input type="submit" value="Run Glycan Finder" 
                      className="form-control btn btn-outline-secondary btn-sm" 
                      style={{width:"200px"}}
                      onClick={this.handleGlycanFinder}
                    />
                </div>
                <div id="glycan_finder_results_cn" className="leftblock" 
                  style={{width:"100%", margin:"40px 0px 0px  20px"}}>
                    {chartCn}
                </div>
                </div>
            );
            tabHash.glycanfinder.cn = tmpCn;
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
                </div>);
    }


    var tabsCn = (
            <div id="tabcn" className="leftblock" style={{width:"100%", display:"none", margin:"20px 0px 0px 0px"}}>
              <ul className="nav nav-tabs" id="myTab" role="tablist" style={{width:"100%"}}>
                {tabTitleList}
              </ul>
              <div className="tab-content" id="myTabContent"
                  style={{width:"100%", margin:"20px 0px 0px 0px"}}>
                {tabContentList}
              </div>
          </div>);


     var affOptions = [];
    for (var i in this.props.initObj.affilations){
      var obj = this.props.initObj.affilations[i];
      affOptions.push(<option value={obj.id}>{obj.label}</option>);
    }

    var formCn = this.getFormCn();

    return (
      <div className="pagecn" style={{border:"0px dashed red", zIndex:100}}>
        <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
        <div className="leftblock" style={{width:"100%", 
          margin:"60px 0px 0px 0px", 
          fontSize:"17px", borderBottom:"1px solid #ccc"}}>
          <DoubleArrowOutlinedIcon style={{color:"#2358C2", fontSize:"17px" }}/>
          &nbsp;
          <Link to="/" className="reglink">HOME </Link> 
            &nbsp; / &nbsp;
          <Link to={"/uploads"} className="reglink">GLYCAN FINDER</Link> 
        </div>
        
        {formCn}
        <div className="leftblock" style={{width:"100%",margin:"15px 0px 0px 0px",
            borderBottom:"1px solid #ccc"}}></div>
       <div className="leftblock" style={{width:"100%", margin:"40px 0px 0px 0px", 
           border:"0px dashed orange"}}>
          {tabsCn}
        </div>

      </div>
    );
  }
}

export default GlycanFinder;

