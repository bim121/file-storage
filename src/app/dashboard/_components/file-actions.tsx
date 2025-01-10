import React, { useEffect, useState } from 'react';
import { FileIcon, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation } from 'convex/react';
import { Doc } from '../../../../convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { api } from '../../../../convex/_generated/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Protect } from '@clerk/nextjs';

export default function FileCardActions({ 
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
