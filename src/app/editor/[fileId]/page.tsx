"use client";

import { useQuery } from 'convex/react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Doc } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';
import WordEditor from '@/app/dashboard/_components/word-editor';

interface Props {
  params: { fileId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function EditorPage({ params }: Props) {
  const { fileId } = params;

  const organization = useOrganization();
  const user = useUser();

  const [query, setQuery] = useState("");
  const [type, setType] = useState<Doc<"files">["type"] | "all">('all');

  let orgId: string | undefined = undefined;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, type: type === 'all' ? undefined : type, query } : "skip"
  );

  const file = files?.find((file) => file.fileId === fileId);

  return (
    <div>
      {file && <WordEditor file={file} />}
    </div>
  );
}
