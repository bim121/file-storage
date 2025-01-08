"use client";
import {  useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";;
import Image from "next/image";
import { Loader2} from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { SearchBar } from "@/app/dashboard/_components/search-bar";
import { UploadButton } from "./UploadButton";
import { FileCard } from "./file-card";

function Placeholder({
  favorites,
  deletedOnly
}:{
  favorites?: boolean,
  deletedOnly?: boolean
}){
  return(<>
    <div className="flex flex-col gap-8 w-full items-center mt-24">
      <Image
        alt="an image of a picture and directory icon"
        width="300"
        height="300"
        src="/empty.png"
      ></Image>
      <div className="text-2xl">{favorites ? "You have no favorites files" : "You have no files, upload one now"}</div>
      {favorites || deletedOnly ? <></> : <UploadButton />}
    </div>
  </>)
}

export function FilesBrowser({
  title,
  favorites,
  deletedOnly
}: {
  title: string,
  favorites?: boolean,
  deletedOnly?: boolean
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId: string | undefined = undefined;
  
  if(organization.isLoaded && user.isLoaded){
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favoritesFiles = useQuery(
    api.files.getAllFavorites, 
    orgId ? {orgId} : "skip"
  );

  const files = useQuery(
    api.files.getFiles, 
    orgId ? {orgId, query, favorites, deletedOnly} : "skip"
  );

  const isLoading = files === undefined;

  return (
    <div className="w-full">
        {isLoading && (
            <div className="flex flex-col gap-8 w-full items-center mt-24">
              <Loader2 className="h-32 w-32 animate-spin text-gray-500"></Loader2>
              <div className="text-2xl">Loading...</div>
            </div>
        )}

        {!isLoading && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">{title}</h1>

                <SearchBar query={query} setQuery={setQuery}/>

                <UploadButton />
              </div>

              {files.length === 0 && (
                <Placeholder favorites={favorites} deletedOnly={deletedOnly}/>
              )}

              <div>
                <div className="grid grid-cols-4 gap-4">
                  {files?.map((file) => {
                    return <FileCard key={file._id} file={file} favorites={favoritesFiles ?? []}/>
                  })}
                </div>
              </div>
            </>
        )}
    </div>
  );
}
