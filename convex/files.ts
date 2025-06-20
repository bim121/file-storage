import {action, internalMutation, mutation, MutationCtx, query, QueryCtx} from './_generated/server'
import {ConvexError, v} from 'convex/values'
import { fileTypes } from './schema';
import { Doc, Id } from './_generated/dataModel';
import { api } from './_generated/api';

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity){
        throw new ConvexError('you must be logged in to upload a file');
    }

    return await ctx.storage.generateUploadUrl();
})

export const getUrl = mutation({
    args: {
        fileId: v.id("_storage")
    },
    async handler(ctx, args){
        const indentity = await ctx.auth.getUserIdentity();

        if(!indentity){
            throw new ConvexError('you must be logged in to upload a file');
        }

        const fileUrl = await ctx.storage.getUrl(args.fileId); 

        return fileUrl;  
    }
})


async function hasAccessToOrg(
    ctx: QueryCtx | MutationCtx,
    orgId: string
){
    const indentity = await ctx.auth.getUserIdentity();

    if(!indentity){
       return null;
    }

    const user = await await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", (q) =>
            q.eq("tokenIdentifier", indentity.tokenIdentifier)
        )
        .first();

    if(!user){
        return null;
    }
        
    const hasAccess = user.orgIds.some((item) => item.orgId === orgId) ||
        user.tokenIdentifier.includes(orgId);
      
    if(!hasAccess){
        return null;
    }

    return {user};
}

export const createFile = mutation({
    args: {
        name: v.string(),
        fileId: v.id("_storage"),
        orgId: v.string(),
        type: fileTypes,
    },
    async handler(ctx, args){
        const hasAccess = await hasAccessToOrg(
            ctx,
            args.orgId,
        );

        if(!hasAccess){
            throw new ConvexError('you do not have access to this org')
        }

        await ctx.db.insert('files', {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type,
            userId: hasAccess.user._id,
        })
    }
})

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean()),
        deletedOnly: v.optional(v.boolean()),
        type: v.optional((fileTypes)),
    },
    async handler(ctx, args){
        const access = await hasAccessToOrg(
            ctx,
            args.orgId,
        );

        if(!access){
            throw [];
        }

        let files = await ctx.db.
            query("files")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();
           
        const query = args.query;    

        if(args.favorites){
            const favorites = await ctx.db
                .query("favorites")
                .withIndex("by_userId_orgId_fileId", (q) => 
                    q.eq("userId", access.user._id).eq("orgId", args.orgId)
                )
                .collect();
            
            files = files.filter((file) => 
                favorites.some((favorite) => favorite.fileId === file._id)
            )
        }

        if(args.deletedOnly){
            files = files.filter((file) => file.shouldDelete);
        } else if(!args.favorites){
            files = files.filter((file) => !file.shouldDelete);
        }

        if(query){
            files = files.filter((file) => file.name.includes(query))  
        }

        if(args.type){
            files = files.filter((file) => file.type === args.type);
        }

        return files 
    }
})

export const getFileById = query({
    args: {
        orgId: v.string(),
        fileId: v.string(), 
    },
    async handler(ctx, args) {
        const access = await hasAccessToOrg(
            ctx,
            args.orgId,
        );

        if (!access) {
            throw [];
        }

        let files = await ctx.db.
            query("files")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        const file = files.find((f) => f._id === args.fileId);

        if (!file) {
            throw new Error('Файл не найден');
        }

        return file;
    }
});


export const deletedAllFiles = internalMutation({
    args: {},
    async handler(ctx){
        const files = await ctx.db.query("files")
            .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
            .collect();

        await Promise.all(files.map(async (file) => {
            await ctx.storage.delete(file.fileId);
            return await ctx.db.delete(file._id);
        }))
    }
})

export const deleteFile = mutation({
    args: { fileId: v.id('files') },
    async handler(ctx, args){
        const access = await hasAccessToFile(ctx, args.fileId);

        if(!access){
            throw new ConvexError('no access to file');
        }

        canDeleteFile(access.user, access.file);

        await ctx.db.patch(args.fileId, {
                shouldDelete: true
        })
    }
})

export const restoreFile = mutation({
    args: { fileId: v.id('files') },
    async handler(ctx, args){
        const access = await hasAccessToFile(ctx, args.fileId);

        if(!access){
            throw new ConvexError('no access to file');
        }

        canDeleteFile(access.user, access.file);

        await ctx.db.patch(args.fileId, {
                shouldDelete: false
        })
    }
})

export const toggleFavorite = mutation({
    args: { fileId: v.id('files') },
    async handler(ctx, args){
        const access = await hasAccessToFile(ctx, args.fileId);

        if(!access){
            throw new ConvexError('no access to file');
        }

        const favourite = await ctx.db.query("favorites")
            .withIndex("by_userId_orgId_fileId", q =>
                q.eq('userId', access.user._id).eq("orgId", access.file.orgId).eq("fileId", access.file._id)
            )
            .first();

        if(!favourite){
            await ctx.db.insert("favorites", {
                fileId: access.file._id,
                userId: access.user._id,
                orgId: access.file.orgId
            });
        } else{
            await ctx.db.delete(favourite._id);
        }
    }
})

export const getAllFavorites = query({
    args: { orgId: v.string() },
    async handler(ctx, args){
        const access = await hasAccessToOrg(ctx, args.orgId);

        if(!access){
            return [];
        }

        const favourite = await ctx.db.query("favorites")
            .withIndex("by_userId_orgId_fileId", q =>
                q.eq('userId', access.user._id).eq("orgId", args.orgId)
            )
            .collect();

        return favourite;
    }
})

async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">){
    const file = await ctx.db.get(fileId);

    if(!file){
        return null;
    }

    const hasAccess = await hasAccessToOrg(
        ctx, 
        file.orgId
    );

    if(!hasAccess){
       return null;
    }

    return {user: hasAccess.user, file}
}

function canDeleteFile(user: Doc<"users">, file: Doc<"files">){
    const canDelete = 
            file.userId === user._id ||
            user.orgIds.find((org) => org.orgId === file.orgId) 
            ?.role === 'admin';
    
    if(!canDelete){
        throw new ConvexError("you have no access to delete this file");
    }
}

export const getFileMeta = query({
    args: {
      fileId: v.id('files'),
    },
    handler: async (ctx, { fileId }) => {
      return await ctx.db.get(fileId);
    },
});

export const saveFile = mutation({
    args: { fileId: v.id('files') },
    async handler(ctx, args){
        const access = await hasAccessToFile(ctx, args.fileId);

        if(!access){
            throw new ConvexError('no access to file');
        }

        await ctx.db.patch(args.fileId, {
            shouldDelete: true
        })
    }
})

export const updateFileContent = mutation({
  args: {
    fileId: v.id("_storage"),
    newStorageId: v.id("_storage"),
  },
  async handler(ctx, args) {
    const file = await ctx.db
      .query("files")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .first();

    if (!file) {
      throw new ConvexError("File not found");
    }

    await ctx.db.patch(file._id, {
      fileId: args.newStorageId,
    });
  },
});
