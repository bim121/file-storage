import React, { ReactNode, useEffect, useState } from 'react';
import { FileTextIcon, GanttChartIcon, ImageIcon } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelative } from 'date-fns';
import FileCardActions from './file-actions';

export function FileCard({ 
    file,
}: { 
    file: Doc<"files"> & { isFavorited: boolean },
}) {
    const typeIcons = {
        "image": <ImageIcon />,
        "pdf": <FileTextIcon />,
        "csv": <GanttChartIcon />
    } as Record<Doc<"files">["type"], ReactNode>;

    const userProfile = useQuery(api.users.getUserProfile, {
        userId: file.userId
    });

    const getFileUrl = useMutation(api.files.getUrl);

    const [src, setSrc] = useState<string| null>(null);

    useEffect(() => {
        getFileUrl({ fileId: file.fileId }).then((url) => {
            setSrc(url);
        });
    }, [file.fileId]);


    return (
        <Card>
            <CardHeader className='relative'>
                <CardTitle className='flex gap-2 text-base font-normal'>
                    <div className='flex justify-center'>{typeIcons[file.type]}</div>{" "}
                    { file.name } 
                </CardTitle>
                <div className='absolute top-2 right-1'>
                    <FileCardActions isFavorited={file.isFavorited} file={file}/>
                </div>
            </CardHeader>
            <CardContent className='h-[200px] flex justify-center items-center'>
                {file.type === "image" && src && (
                    <Image alt={file.name} width="200" height="100" src={src}/>
                )}

                {file.type === "csv" && (
                    <GanttChartIcon className='w-20 h-20'/>
                )}

                {file.type === "pdf" && (
                    <FileTextIcon className='w-20 h-20'/>
                )}
            </CardContent>
            <CardFooter className='flex justify-between items-center'>  
                <div className='flex gap-2 text-xs text-gray-700 w-40'>
                    <Avatar className='w-6 h-6'>
                        <AvatarImage src={userProfile?.image} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    {userProfile?.name}
                </div>              

                <div className='text-xs'>
                    Uploaded on {" "} 
                    {formatRelative(new Date(file._creationTime), new Date())}
                </div>
            </CardFooter>
        </Card>
    )
}