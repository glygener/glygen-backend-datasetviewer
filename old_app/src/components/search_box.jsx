import React, { Component } from "react";
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';


class Searchbox extends Component {
  
  render() {

    var  search_examples = "";
    if ("search_examples" in this.props.initObj){
        search_examples = this.props.initObj.search_examples;
    }
    return (
        <div>
            <div className="search_label">Search datasets </div>
            <div className="search_paper_wrapper"> 
                <Paper component="form" elevation="0" className="searchbox_paper">
                    <InputBase id="query" className="searchbox_input"  
                        defaultValue={this.props.searchquery}
                        inputProps={{ 'aria-label': '', 
                        'style': {fontSize: "14px", color:"#777"}}}
                        onKeyPress={this.props.onKeyPress}
                    />          
                <div onClick={this.props.onSearch} className="material-icons search_icon">search</div>
                </Paper>
            </div>
            <div className="search_examples">{search_examples}</div>
        </div>
    );
  }
}

export default Searchbox;
