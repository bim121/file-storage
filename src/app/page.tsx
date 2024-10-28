"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, SignOutButton, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: string | undefined = undefined;
  if(organization.isLoaded && user.isLoaded){
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles, orgId ? {orgId} : "skip");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-3">
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode='modal'>
          <Button>Sign in</Button>
        </SignInButton>
      </SignedOut>

      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>
      })}

      <Button
        onClick={() => {
          if(!orgId) return;
          createFile({
            name: "hellow world",
            orgId: orgId
          });
        }}
      >
        Click me
      </Button>
    </main>
  );
}
