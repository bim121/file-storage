"use client"
import { FilesBrowser } from "../_components/file-browser"

export default function FavoritesPage(){
    return(
        <div>
            <FilesBrowser title="Favorites" favorites={true}/>
        </div>
    )
}