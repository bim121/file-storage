import { FilesBrowser } from "../_components/file-browser";

export default function TrashPage(){
    return(
        <div>
            <FilesBrowser title="Your Trash" deletedOnly={true}/>
        </div>
    )
}