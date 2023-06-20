import React, { Component } from "react";
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';


class Searchbox extends Component {
  
  render() {

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
        </div>
    );
  }
}

export default Searchbox;
