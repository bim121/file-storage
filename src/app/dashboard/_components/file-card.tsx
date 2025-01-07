import React, { ReactNode, useEffect, useState } from 'react';
import { FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TrashIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation } from 'convex/react';
import Image from 'next/image';
import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { api } from '../../../../convex/_generated/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Protect } from '@clerk/nextjs';

function FileCardActions({ 
    file, 
    isFavorited 
}: { 
    file: Doc<"files">
    isFavorited: boolean
}){
    const deleteFile = useMutation(api.files.deleteFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const { toast } = useToast();
    return(
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your 
                            account and remove your data from our servers.
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
                                title: "File delete",
                                description: "Your file is now gone from the system"
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

                    <Protect
                        role="org:admin"
                        fallback={<></>}
                    >
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className='flex gap-1 text-red-600 items-center cursor-pointer' 
                            onClick={() => setIsConfirmOpen(true)}
                        >
                            <TrashIcon className='w-8 h-8' /> Delete
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
                <CardTitle className='flex gap-2'>
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
            <CardFooter className='flex justify-center'>
                <Button
                    onClick={() => {
                        if(src) window.open(src, '_blank')
                    }}
                >Download</Button>
            </CardFooter>
        </Card>
    )
}