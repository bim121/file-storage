import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export function Header(){
    return(
        <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md py-4">
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link href="/dashboard/files" className="flex items-center gap-3 text-2xl font-bold hover:text-white/90 transition-colors">
                    <Image src="/logo.png" width={40} height={40} alt="file drive logo" className="rounded-md shadow-md" />
                    FileStorage
                </Link>

                <div className="flex items-center gap-3">
                   <OrganizationSwitcher
                        appearance={{
                            elements: {
                            rootBox: "text-white",
                            organizationSwitcherTrigger: "text-white hover:bg-white/10", 
                            organizationSwitcherPopoverCard: "bg-white text-gray-900", 
                            organizationSwitcherPopoverActionButton: "hover:bg-gray-100",
                            organizationSwitcherPopoverActionButtonText: "text-gray-700",
                            }
                        }}
                    />

                    <UserButton appearance={{ elements: { avatarBox: "ring-2 ring-white" } }} />
                    <SignedOut>
                        <SignInButton>
                            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-100 transition-colors">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </header>
    )
}
