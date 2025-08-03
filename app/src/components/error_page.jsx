import { useRouteError } from "react-router-dom";

export default function ErrorPage(props) {
    
    //const error = useRouteError();

    var fileUrl = window.location.href;
    var s = {width:"80%", margin:"100px 10% 100px 10%", color:"red" };
    return (
      <div className="pagecn">
        <div className="leftblock" style={s}>
           File not found:  <br/>{fileUrl}
        </div>
      </div>
    );
}

