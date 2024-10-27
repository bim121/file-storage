"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles);

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
          createFile({
            name: "hellow world"
          });
        }}
      >
        Click me
      </Button>
    </main>
  );
}
