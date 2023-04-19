import * as React from 'react';
import { Link } from "react-router-dom";
import Box from '@mui/material/Box';
import Typography from "@material-ui/core/Typography";
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';


export default function Tableview(props) {
  
  var boxStyle = {
      height: 1500, width: '100%',  background:"#fff"
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
        pageSizeOptions={[50, 100, 200]}
        disableRowSelectionOnClick
        enableColumnAutosize={true}
      />
    </Box>
  );
}

