import * as React from 'react';
import { Link } from "react-router-dom";
import Box from '@mui/material/Box';
import Typography from "@material-ui/core/Typography";
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';


export default function Tableview(props) {
  
  var boxStyle = {
      height: 1000, width: '100%',  background:"#fff"
  };

  return (
    <Box sx={boxStyle}>
      <DataGrid
        rows={props.rows}
        columns={props.cols}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
        }}
        pageSizeOptions={[10, 50, 100]}
        disableRowSelectionOnClick
        enableColumnAutosize={true}
        getRowHeight={() => 'auto'}  
    />
    </Box>
  );
}

