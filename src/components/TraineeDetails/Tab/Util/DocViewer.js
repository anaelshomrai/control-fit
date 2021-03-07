import "../css/docHelper.css";
export default function DocViewer({html}) {

    return (
       <div className="document-container" style={{textAlign: "end"}}> 
            <div dangerouslySetInnerHTML={{ __html: html }} />
       </div>

    )

}