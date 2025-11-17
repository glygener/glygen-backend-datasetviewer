import React, { Component } from "react";
import { Link } from "react-router-dom";


class Paginator extends Component {
  
  render() {

    var paginatorId = this.props.paginatorId;
    var pageCount = parseInt(this.props.pageCount);
    var pageStartIdx = parseInt(this.props.pageStartIdx);
    var pageEndIdx = parseInt(this.props.pageEndIdx);
    pageEndIdx = (pageEndIdx > pageCount ? pageCount : pageEndIdx);



    var prevClass = (pageStartIdx === 1 ? "page-item disabled" : "page-item")
    var nextClass = (pageEndIdx === pageCount ? "page-item disabled" : "page-item")
    
    var prevFlag = (prevClass.indexOf("disabled") !== -1 ? "_disabled": "");
    var nextFlag = (nextClass.indexOf("disabled") !== -1 ? "_disabled": "");


    var liList = [];
    liList.push(
      <li key={"li_prev_"+i} id={"li_prev_"+i+"_"+paginatorId+prevFlag}  className={prevClass} onClick={this.props.onClick}>
        <Link  id={"prev_page_"+paginatorId+prevFlag} className="page-link" to="#" aria-label="Previous" onClick={this.props.onClick} >
        <span id={"spanone_prev_page_"+paginatorId+prevFlag} aria-hidden="true">&laquo;</span>
        <span id={"spantwo_prev_page_"+paginatorId+prevFlag} className="sr-only">Previous</span>  
        </Link>
      </li>
      );
    for (var i=pageStartIdx; i <= pageEndIdx; i ++){
      liList.push(
        <li key={"li_page_"+i} id={"li_page_"+i+"_"+paginatorId} className="page-item" onClick={this.props.onClick}>
          <Link id={"link_page_"+i+"_"+paginatorId} className="page-link" to="#" onClick={this.props.onClick}>
          {i}
          </Link>
        </li>);
    }

    liList.push(
      <li key={"li_next_"+i} id={"li_next_page_"+paginatorId+nextFlag}  className={nextClass} onClick={this.props.onClick}>
        <Link id={"link_next_page_"+paginatorId+nextFlag} className="page-link" to="#" aria-label="Next" onClick={this.props.onClick}>
      
        <span id={"spanone_next_page_"+paginatorId+nextFlag}   aria-hidden="true">&raquo;</span>
        <span id={"spantwo_next_page_"+paginatorId+nextFlag}   className="sr-only">Next</span>
        </Link>
      </li>);
  
    return (
      <nav aria-label="Page navigation example" 
      style={{height:"40px", border:"0px dashed red"}}>
      <ul className="pagination justify-content-end"
        style={{border:"0px dashed red"}}>
        {liList}
      </ul>
    </nav>
  );

    
  }
}

export default Paginator;
