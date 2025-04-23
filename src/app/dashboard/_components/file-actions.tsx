import React, { useEffect, useState } from 'react';
import { FileEditIcon, FileIcon, MailIcon, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation, useQuery } from 'convex/react';
import { Doc } from '../../../../convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { api } from '../../../../convex/_generated/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Protect } from '@clerk/nextjs';
import Link from 'next/link';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FileCardActions({ 
    file, 
    isFavorited 
}: { 
    file: Doc<"files">
    isFavorited: boolean
}) {
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const { toast } = useToast();

    const getFileUrl = useMutation(api.files.getUrl);
    const me = useQuery(api.users.getMe);
    const [src, setSrc] = useState<string | null>(null);

    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [emailTo, setEmailTo] = useState("");

    const sendEmail = async () => {
        const emailData = {
            to: emailTo,
            fileUrl: src,
            company: "File Storage Company.",
        };
    
        try {
            const res = await fetch("/api", {
                method: "POST",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailData),
            });
    
            if (res.status === 200) {
                toast({
                    variant: "success",
                    title: "Email Sent",
                    description: "The file has been sent successfully."
                });
                setIsEmailDialogOpen(false); 
            } else {
                const err = await res.json();
                throw new Error(err?.error || "Failed to send email");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error sending email",
                description: (error as Error).message
            });
        }
    };
    
    useEffect(() => {
        getFileUrl({ fileId: file.fileId }).then((url) => {
            setSrc(url);
        });
    }, [file.fileId]);

    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for out deletion process. Files are deleted periodically
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
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

            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send File via Email</DialogTitle>
                    </DialogHeader>
                    <Input 
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        placeholder="email@example.com"
                    />
                    <DialogFooter>
                        <Button onClick={sendEmail}>Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                    
                    {file.type === "docx" && (
                        <Link href={`/editor/${file.fileId}`}>
                            <DropdownMenuItem className="flex gap-1 items-center cursor-pointer">
                                <FileEditIcon className='w-4 h-4'/> Edit file
                            </DropdownMenuItem>
                        </Link>
                    )}

                    <DropdownMenuItem
                        className="flex gap-1 items-center cursor-pointer"
                        onClick={() => {
                            setIsEmailDialogOpen(true);
                        }}
                    >
                        <MailIcon className='w-4 h-4'/> Send via Email
                    </DropdownMenuItem>

                    <Protect
                        condition={(check) => {
                            return check({
                                role: "org:admin"
                            }) || file.userId === me?._id;
                        }}
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
    );
}
