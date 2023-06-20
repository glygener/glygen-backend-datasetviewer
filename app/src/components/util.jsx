import $ from "jquery";
import React from 'react';
import { Link } from "react-router-dom";


export function verifyReqObj (reqObj, formObj){

    var typeList = ["text", "int", "float", "select", "textarea", "stringlist", "obj", "objlist"];
    var errorList = [];
    for (var i in formObj.groups){
      var grpObj = formObj.groups[i];
      for (var j in grpObj.emlist){
        var obj = grpObj.emlist[j];
        var emId = obj.emid;
        var emValue =  obj.value;
        var emLbl = obj.label;
        if (typeList.indexOf(obj.emtype) === -1){
            continue;
        }
        else if (obj.required === true && ["stringlist", "objlist"].indexOf(obj.emtype) !== -1){
          if (emValue === undefined){
            errorList.push(<li key={"error_in_" + emId}>"{emLbl}" cannot be empty value</li>);
          }
          else if (emValue.length === 0){
            errorList.push(<li key={"error_in_" + emId}>"{emLbl}" cannot be empty value</li>);
          }
        }
        else if (obj.required === true && reqObj[emId] == null){
          errorList.push(<li key={"error_in_" + emId}>"{emLbl}" cannot be empty value</li>);
        }
        else if (obj.required === true && obj["datatype"].split("|")[1] === "int" && isNaN(reqObj[emId])){
          errorList.push(<li key={"error_in_" + emId}>"{emLbl}" cannot be empty value</li>);
        }
        else if (obj.required === true && reqObj[emId].toString() === "" ){
          errorList.push(<li key={"error_in_" + emId}>"{emLbl}" cannot be empty value</li>);
        }
        else if ("datatype" in obj){
          if (obj["datatype"].split("|")[0] === "number"){
            if (typeof(reqObj[emId]) !== obj["datatype"].split("|")[0]){
              errorList.push(<li>"{emLbl}" type mismatch</li>);
            }
          }
        }
        //else{
        //  console.log("FLAG-2", emId, obj["datatype"], emValue);
        //}
      }
      //if (errorList.length === 0){
      //  return errorList;
      //}
    }
    return errorList;
}


export function getStarList(starCount){

  var starList = [];
  for (var j =1; j <= 5; j++){
    var fg = (j <= starCount ? "#F5B041" : "#cccccc");
    var s = {cursor:"pointer",marginRight:"1px",fontSize:"15px", color:fg};
    starList.push(<i key={"s_"+j} className="material-icons" style={s}>star </i>)
  }
  return starList;
}


export function filterObjectList(objList, filterList) {

    var retObj = {filterinfo:{}, passedobjlist:[]};
    for (var i in objList) {
      var obj = objList[i];
      var passCount = 0;
      for (var name in obj.categories) {
        if (["tags","protein"].indexOf(name) !== -1){
          continue;
        }
        for (var q in obj.categories[name]){
            var value = obj.categories[name][q].toLowerCase(); 

            var combo = name + "|" + value;
            if (!(name in retObj.filterinfo)) {
                retObj.filterinfo[name] = {};
            }
            if(true){
                if (!(value in retObj.filterinfo[name])){
                    retObj.filterinfo[name][value] = 1;
                }
                else{
                retObj.filterinfo[name][value] += 1;
                }
            }
            if (filterList.indexOf(combo) !== -1) {
                passCount += 1;
            }
        }
      }
      if (filterList.length > 0) {
        //if (passCount > 0){
        if (passCount === filterList.length){
            retObj.passedobjlist.push(obj);
        }
      } 
      else {
        retObj.passedobjlist.push(obj);
      }
    }

    return retObj;
}



export function shortText(txt, txtLen) {
  var shortText = "";
  var parts = txt.split(" ");
  for (var j in parts) {
    if (shortText.length < txtLen) {
      shortText += parts[j] + " ";
    } else {
      shortText += " ...";
      break;
    }
  }
  return shortText;
}



export function rndrSearchResults(objList, startIdx, endIdx) {

  
  if (objList.length === 0){
    return (
    <div className="row" style={{color:"red", padding:"0px 0px 100px 20px"}}>
      No results found!
      </div>);
  }

  var bcoPrefix = 'GLYG_';
  var dsPrefix = 'DS_';

  var cardList = [];
  for (var i=startIdx - 1; i <= endIdx -1;  i++){
    var obj = objList[i];
    
    var moleculeType = ("molecule" in obj["categories"] ? obj["categories"]["molecule"] : "");
    var speciesType = ("species" in obj["categories"] ? obj["categories"]["species"] : "");
    var fileType = ("file_type" in obj["categories"] ? obj["categories"]["file_type"] : "");
    var statusType = ("status" in obj["categories"] ? obj["categories"]["status"] : "");

    var objId = bcoPrefix + "0000".substring(0, 10 - String(obj["bcoid"]).length) + String(obj["_id"]);
    objId = obj["bcoid"].replace(bcoPrefix, dsPrefix);
    var titleText = statusType + ' ' + moleculeType.toLowerCase();
    titleText += ' dataset ' + objId + ' in ';
    titleText += fileType.toUpperCase() + ' format.';
    titleText += ' [' + speciesType + ']';

    var imgCn = (
      <div className="leftblock" style={{width:"50%", margin:"20px 25% 0px 25%"}}>     
        <img className="card-img-top" src={"/imglib/" + obj.iconfilename}/>
      </div>
    );
    if ("minitable" in obj){
      imgCn = (
        <div className="leftblock" style={{width:"80%", margin:"20px 10% 0px 10%"}}>     
          {rndrMiniTable(obj.minitable)}
        </div>
      );
    }

    cardList.push(
      <div className="col-md-4">
        <div className="card mb-4 box-shadow" style={{minWidth:"350px"}}>
            <div className="leftblock" 
              style={{width:"90%", textAlign:"center",  fontSize:"15px", margin:"20px 5% 0px 5%"}}>
              {titleText}
            </div>
            <div className="leftblock" 
              style={{width:"90%", textAlign:"center", margin:"20px 5% 0px 5%"}}>
              <Link className="reglink" to={objId} style={{fontWeight:"bold"}}>
                {obj.title}
              </Link>
            </div>
            {imgCn}
            <div className="card-body">
              <p className="card-text" style={{textAlign:"center"}}>{shortText(obj.description, 900)}</p>
                <div className="leftblock" 
                style={{width:"100%",textAlign:"center", margin:"20px 0px 20px 0px"}}>
                  <Link className="reglink" to={objId}>
                    View Details
                  </Link> 
                </div>
                
            </div>
          </div>
        </div>
    );
  }
  return (<div className="row">{cardList}</div>);
}



export function sortReleaseList(tmpList, reversedFlag){        

    var factorList = [1000000, 1000, 1];
    var relDict = {};
    for (var i in tmpList){
        var rel = tmpList[i]
        var parts = (rel.indexOf(".") !== -1 ? rel.split(".") : rel.split("_"));
        var ordr = 0;
        for (var j in parts){
            ordr += factorList[j]*parseInt(parts[j]);
        }
        relDict[ordr] = rel;
    }

    var releaseList = [];
    var keyList = Object.keys(relDict).sort().reverse();
    for (var i in keyList){
        var ordr = keyList[i];
        releaseList.push(relDict[ordr]);
    }
    
    return releaseList;

}

export function rndrMiniTable(inObj){

  var s = "";
  var rowList = [];
  var cellList = [];
  for (var j in inObj["headers"]){
    s = {textAlign:"center",fontWeight:"bold",padding:"5px 0px 0px 0px", border:"1px solid #ccc"};
    cellList.push(<td key={"cell_"+j} style={s}>{inObj["headers"][j]}</td>);
  }
  rowList.push(<tr style={{height:"30px"}}>{cellList}</tr>);
  for (var i =0; i < inObj["content"].length; i ++){
    cellList = [];
    for (var j in inObj["content"][i]){
      s = {textAlign:"center",padding:"5px 0px 0px 0px", border:"1px solid #ccc"};
      cellList.push(<td key={"cell_"+i+j} style={s}>{inObj["content"][i][j]}</td>);
    }
    rowList.push(<tr key={"row_"+i} style={{height:"30px"}}>{cellList}</tr>);
  }
  s = {width:"100%",fontSize:"16px",border:"1px solid #ccc"};
  return (
    <table style={s} align="center" cellSpacing="1">
      <tbody>{rowList}</tbody>
    </table>
  );
}





export function getFormElement(pathId, formObj,formClass, emValue){

  pathId = pathId.replace(".", "_");


  function handleChange (em) {
  }




  var basicTypeList = [
      "text","password", "int", "float", "datetime","radio", "select", "textarea",
      "stringlist"
  ];

  var emType = formObj.emtype;
  var disableFlag = (formObj.disable === true ? true : false);


  var em = "";
  if (["text","password", "int", "float", "datetime"].indexOf(emType) !== -1){
    var newType = (["int", "float"].indexOf(emType) !== -1 ? "number": emType);
    var em = [];
    em.push(
      <input tag={newType} key={pathId + "_" +newType +  "_input"}
        maxLength={formObj.maxlength}  id={pathId} type={formObj.emtype}
        className={"form-control " + formClass}
        onChange={handleChange}
        defaultValue={emValue || ''}
        disabled={disableFlag}
        placeHolder={formObj.placeholder}
      />
    );
    if ("description" in formObj){
      em.push(
        <span id={"desc_"+pathId} style={{width:"100%", fontStyle:"italic"}}>
        {formObj.description}
        </span>
      );
    }
  }
  else if (emType === "button"){
    em = [];
    em.push(<button id={pathId} className={formObj.class}
      onClick={formObj.onclick} disabled={disableFlag}>
      {formObj.value}
      </button>);
  }
  else if (emType === "radio"){
    em = [];
    em.push(
      <input type={emType} tag={emType} key={pathId +"_radio"}
        className={formClass} id={pathId} value={emValue} name={formObj.name}
        checked={formObj.checked}
        disabled={disableFlag}
      />
    );
    em.push( <span style={{fontSize:"16px"}}>&nbsp;{formObj.label}<br/></span>);
    if ("description" in formObj){
      em.push(<div className="leftblock" id={"desc_"+pathId}
        style={{margin:"0 0 0 20px",width:"100%", fontStyle:"italic"}}>
        {formObj.description}</div>);
    }
  }
  else if (emType === "textarea"){
    em = (
      <textarea tag={emType} key={pathId +"_textarea"}
        maxLength={formObj.maxlength} id={pathId}
        className={"form-control " + formClass}
        defaultValue={emValue || ''}
        placeholder={formObj.placeholder}
        disabled={disableFlag}
        style={formObj.style}
      >
      </textarea>
    );
  }
  else if (emType === "plaintext"){
    em = (
      <pre>{emValue}</pre>
    );
  }
  else if (emType === "select"){
    var optList = [];
    for (var j in emValue.optlist){
        const val = emValue.optlist[j].value;
        const lbl = emValue.optlist[j].label;
        const key = pathId + "_" + j + "_" + val + "_opt";
        optList.push(<option key={key} value={val}>{lbl}</option>);
    }
    em = (
        <select tag={emType} key={pathId + "_select"} id={pathId}
          className={"form-select " + formClass}
          defaultValue={emValue.selected || ''}
          disabled={disableFlag}
          onChange={formObj.onchange}
        >
          {optList}
        </select>
    );
  }
  else if (emType === "stringlist"){
    var sTwo = {width:"100%", textAlign:"left", fontSize:"12px"};
    var sThree = {margin:"0px", padding:"0px", fontSize:"12px", textDecoration:"none"};
    var tmpList = [];
    if(typeof(emValue) === "object"){
      tmpList = emValue;
    }
    var spanList = [];
    for (var i in tmpList){
      var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
      var childPathId = pathId + "_"+ i + "_" + randStr;
      var divId = pathId + "_"+ i + "_div";
      var btnId = pathId + "^"+ i + "^btn";
      spanList.push(
        <div id={divId} key={divId} className="leftblock"
          style={{width:"100%", padding:"0px",
              marginBottom:"3px",border:"1px solid #ccc", borderRadius:"10px"}}>
          <button id={btnId} key={btnId} className="btn btn-link rightblock"
            style={{color:"#2358C2", margin:"10px 10px 0px 0px",padding:"0px",
            textDecoration:"none"}}
            onClick={formObj.onremoveitem} > X
          </button>
          <input id={childPathId} key={childPathId} className={"form-control " + formClass}
            type={"text"} defaultValue={tmpList[i] || ''}
            disabled={true} style={formObj.style}
          />
        </div>
      );
    }
    var divId = pathId + "_last_div";
    var btnId = pathId + "^addbtn";
    var inputId = pathId.replace("|", "_") + "_last";

    spanList.push(
        <div id={divId} key={divId} className="leftblock"
          style={{width:"100%", padding:"5px",
              marginBottom:"3px",border:"1px solid #ccc", borderRadius:"10px"}}>
          <div className="leftblock"  style={{width:"80%"}}>
            <input id={inputId} key={inputId}
              className={"form-control " + formClass}
              maxLength={formObj.maxlength}
              type={"text"} defaultValue={""}
              disabled={false}
              placeholder={formObj.placeholder}
            />
          </div>
          <div className="leftblock" style={{margin:"2px 0px 0px 5px"}}>
            <button id={btnId}
              className="btn btn-outline-secondary btn-sm"
              onClick={formObj.onadditem}>Add
            </button>
          </div>
        </div>
    );
    em = (
      <div id={pathId + "_div_xxx"} key={pathId + "_div_xx"}
        className="leftblock" style={{width:"100%"}}>
        {spanList}
      </div>
    );
  }
  else if (emType === "obj"){
      var obj = emValue;
      var spanList = [];
      for (const j in formObj.proplist){
          var childFormObj = formObj.proplist[j];
          var childPropName = childFormObj.prop;
          var childPropValue = obj[childPropName];
          var childPropType = childFormObj.emtype;
          var childPathId = pathId + "." + childPropName;
          if(basicTypeList.indexOf(childPropType) !== -1){
            if (childPropType === "select"){
              childFormObj.value.selected = obj[childPropName];
              childPropValue =  childFormObj.value;
            }
            var tmpEm = getFormElement(childPathId,childFormObj, formClass, childPropValue);
            spanList.push(tmpEm);
          }
          else{
            spanList.push(
              <div key={childPathId + "_divvv"} className="leftblock"
              style={{width:"98%", margin:"10px 10px 10px 5px", padding:"10px"}}>
                {"exception: " + childPropName}<br/>{JSON.stringify(obj[childPropName])}<br/>
              </div>
            );
          }
      }
      em = (
        <div key={pathId + "_divone"} className="leftblock" style={{width:"100%", padding:"0px 10px 20px 10px",        marginBottom:"10px",border:"1px solid #ccc", borderRadius:"10px"}}>
        {spanList}
        </div>
      );
    }
    else if (emType === "objlist"){
      var sOne = {};
      sTwo = {};
      var typeMap = {};
      var childPropList = [];
      for (var i in formObj.proplist){
        const o = formObj.proplist[i];
        childPropList.push(o.prop);
        var childPathId = pathId  + "_" + o.prop;
        typeMap[childPathId] = o.emtype;
        if (o.emtype === "objlist"){
          for (var j in o.proplist){
            const oo = o.proplist[j];
            var grandChildPathId = childPathId + "_" + oo.prop;
            typeMap[grandChildPathId] = oo.emtype;
          }
        }
      }

      var divList = [];
      var spanList = [];
      var lastSpanList = [];
      for (const j in childPropList){
        var childPropName = childPropList[j];
        var childFormObj = formObj.proplist[j];
        var childPathId = pathId + "_last_" + childPropName;
        var childPropValue = "";
        if (childFormObj.emtype === "select"){
          childFormObj.value.selected = "";
          childPropValue = childFormObj.value;
        }
        childFormObj.disable = false;
        var tmpEm = getFormElement(childPathId,childFormObj, formClass,childPropValue);
        lastSpanList.push(tmpEm);

      }

      for (const i in emValue){
        //if (this.state.rmlist.indexOf(i) !== -1){continue;}
        obj = emValue[i];
        spanList[i] = [];
        for (const j in childPropList){
          var randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16);
          var childPropName = childPropList[j];
          var childPathId = pathId + "_" + i + "_" + j + "_" + childPropName + ' _' + randStr;
          var childTypePath = pathId + "_" + childPropName;
          var childPropType = (childTypePath in typeMap ? typeMap[childTypePath] : "");
          if(basicTypeList.indexOf(childPropType) !== -1){
            childFormObj = formObj.proplist[j];
            childPropValue = obj[childPropName];
            //spanList[i][childPropName] = childPropValue;
            if (childPropType === "select"){
              childFormObj.value.selected = childPropValue;
              childPropValue = childFormObj.value;
            }
            childFormObj.disable = true;
            var tmpEm = getFormElement(childPathId,childFormObj, formClass, childPropValue);
            //var s = {border:"1px dashed green"};
            //var tmpEm = (<div className="leftblock" style={s}>{childFormObj.label}</div>);
            spanList[i].push(tmpEm);
          }
          else{
            sOne = { width:"98%", margin:"10px 10px 10px 5px", padding:"10px"};
            sTwo = {width:"100%", margin:"0px", padding:"10px", border:"1px solid #ccc", borderRadius:"10px"};
            spanList[i].push(
              <div key={childPathId + "_divvv"} className="leftblock" style={sOne}>
                {"exception: " + childPropName}<br/>{JSON.stringify(emValue[childPropName])}<br/>
              </div>
            );
          }
        }
        var divId = pathId + "_obj_" + i + "_div";
        var btnId = pathId + "^obj^" + i + "^btn";
        divList.push(
            <div id={divId} key={divId} className="leftblock" style={formObj.wrapperstyle}>
              <button id={btnId} key={btnId} className="btn btn-link rightblock"
                style={{color:"#2358C2", margin:"5px 0px 0px 0px",padding:"0px",
                textDecoration:"none"}}
                onClick={formObj.onremoveitem} > X
            </button>
            <div id={divId + "_" + i + "_divtwo"} key={divId + "_" + i +  "_divtwo"} className="leftblock" style={{width:"100%"}}>
            {spanList[i]}
            </div>
            </div>);
      }
      var divId = "last_div";
      var btnId = pathId + "^addbtn";
      divList.push(
        <div id={divId} key={divId} className="leftblock"
          style={{width:"100%", padding:"20px 10px 20px 10px", margin:"0px 0px 0px 0px",
              border:"1px solid #ccc", borderRadius:"10px"}}>
          <div id={divId + "_divtwo"} key={divId + "_divtwo"}
            className="leftblock"          style={{width:"100%"}}>
            {lastSpanList}
          </div>
          <div id={divId + "_divthree"} key={divId + "_divthree"}
            className="leftblock" style={{width:"100%", margin:"10px 0px 0px 0px"}}>
            <button id={btnId}
              className="btn btn-outline-secondary btn-sm"
                onClick={formObj.onadditem}>
              Add
            </button>
          </div>
        </div>
      );
      em = (
        <div key={pathId + "_objlist_div_one"}  id={pathId + "_objlist_one"} className="leftblock" style={{width:"100%", fontSize:"12px",background:"#fff", marginTop:"0px"}}>
           {divList}
        </div>
      );
    }




  var sOuter = {width:"100%",  background:"#fff", padding:"5px", fontSize:"12px"};
  if ("style" in formObj){
    sOuter = formObj.style;
  }
  var sInner = { paddingRight:"5px", background:"#fff",  fontSize:"12px"};

  var passwordStrengthLbl = "";
  //if (pathId === "password_one"){
  //  passwordStrengthLbl = <div id={"lbl_"+pathId} className="leftblock" style={sInner} >
  //    </div>;
  //}

  var rqrd = (formObj.required === true ? "*" : "");
  var lblDiv = (<div id={"lbl_"+pathId} className="leftblock" style={sInner} >{formObj.label}
    <span style={{color:"red"}}> {rqrd}</span> </div>);
  if (emType === "radio"){lblDiv = "";}
  return (
    <div className="leftblock" key={pathId +"_" + emType} style={sOuter}>
      {lblDiv} {passwordStrengthLbl} {em }
    </div>
  );
}


