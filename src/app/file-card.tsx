import React, { ReactNode, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
}from '../components/ui/card';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from '../components/ui/dropdown-menu';
import { DeleteIcon, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, TrashIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '../hooks/use-toast';
import Image from 'next/image';

function FileCardActions({ file }: { file: Doc<"files">}){
    const deleteFile = useMutation(api.files.deleteFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
                <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className='flex gap-1 text-red-600 items-center cursor-pointer' onClick={() => setIsConfirmOpen(true)}>
                        <TrashIcon className='w-8 h-8' /> Delete
                    </DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>

        </>
    )
}

export function FileCard({ file }: { file: Doc<"files">}) {
    const typeIcons = {
        "image": <ImageIcon />,
        "pdf": <FileTextIcon />,
        "csv": <GanttChartIcon />
    } as Record<Doc<"files">["type"], ReactNode>;

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
                    <FileCardActions file={file}/>
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