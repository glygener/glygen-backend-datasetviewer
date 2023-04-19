import { useLocation } from "react-router-dom";
import DatasetPage from "./dataset_page";

export default function RecordList (props) {
  const location = useLocation();
  var rowList = (location.state.rowlist === undefined ? [] : location.state.rowlist);

  return (
     <DatasetPage bcoId={props.bcoId}  initObj={props.initObj} rowList={rowList}/>
  );
};

