import React, { ReactNode, useEffect, useState } from 'react';
import { FileIcon, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { api } from '../../../../convex/_generated/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Protect } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

function FileCardActions({ 
    file, 
    isFavorited 
}: { 
    file: Doc<"files">
    isFavorited: boolean
}){
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const { toast } = useToast();

    const getFileUrl = useMutation(api.files.getUrl);
    const [src, setSrc] = useState<string| null>(null);

    useEffect(() => {
        getFileUrl({ fileId: file.fileId }).then((url) => {
            setSrc(url);
        });
    }, [file.fileId]);

    return(
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for out deletion process. Files are deleted peridiocaly
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={ async () => {
                            await deleteFile({
                                fileId: file._id
                            });
                            toast({
                                variant: "success",
                                title: "File marked for deletion",
                                description: "Your file will be deleted soon"
                            })
                        }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem 
                        className='flex gap-1 items-center cursor-pointer' 
                        onClick={() => {
                            toggleFavorite({
                                fileId: file._id
                            })
                        }}
                    >
                        {isFavorited ? 
                            (
                                <div className='flex gap-1 items-center'>
                                    <StarIcon className='w-8 h-8'/> Unfavorite
                                </div>
                            ) :
                            (
                                <div className='flex gap-1 items-center'>
                                    <StarHalf className='w-8 h-8'/> Favorite
                                </div>
                            )
                        }
                    </DropdownMenuItem>


                    <DropdownMenuItem 
                        className='flex gap-1 items-center cursor-pointer' 
                        onClick={() => {
                            if(src) window.open(src, '_blank')
                        }}
                    >
                        <FileIcon /> Download
                    </DropdownMenuItem>

                    <Protect
                        role="org:admin"
                        fallback={<></>}
                    >
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className='flex gap-1 text-red-600 items-center cursor-pointer' 
                            onClick={() => {
                                if(file.shouldDelete){
                                    restoreFile({
                                        fileId: file._id
                                    })
                                }else{
                                    setIsConfirmOpen(true)
                                }
                            }}
                        >
                            {file.shouldDelete ? (
                                    <div className='flex gap-1 text-green-600 items-center cursor-pointer'>
                                        <UndoIcon className='w-4 h-4'/> Restore
                                    </div> 
                                ) : (
                                    <div className='flex gap-1 text-red-600 items-center cursor-pointer'>
                                        <TrashIcon className='w-4 h-4'/> Delete
                                    </div>
                                )
                            }
                        </DropdownMenuItem>
                    </Protect>
                </DropdownMenuContent>
            </DropdownMenu>

        </>
    )
}

export function FileCard({ 
    file,
    favorites
}: { 
    file: Doc<"files">,
    favorites: Doc<"favorites">[];
}) {
    const typeIcons = {
        "image": <ImageIcon />,
        "pdf": <FileTextIcon />,
        "csv": <GanttChartIcon />
    } as Record<Doc<"files">["type"], ReactNode>;

    const isFavorited = favorites.some((favorite) => favorite.fileId === file._id);

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
                    <FileCardActions isFavorited={isFavorited} file={file}/>
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