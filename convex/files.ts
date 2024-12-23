import {mutation, MutationCtx, query, QueryCtx} from './_generated/server'
import {ConvexError, v} from 'convex/values'
import { getUser } from './users';
import { fileTypes } from './schema';

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
    tokenIdentifier: string,
    orgId: string
){
    const user = await getUser(ctx, tokenIdentifier);

    const hasAccess = user.orgIds.includes(orgId) || 
            user.tokenIdentifier.includes(orgId);
      
    if(!hasAccess){
        throw new ConvexError('you do not have access to this org')
    }

    return hasAccess;
}

export const createFile = mutation({
    args: {
        name: v.string(),
        fileId: v.id("_storage"),
        orgId: v.string(),
        type: fileTypes,
    },
    async handler(ctx, args){
        const indentity = await ctx.auth.getUserIdentity();

        if(!indentity){
            throw new ConvexError('you must be logged in to upload a file');
        }

        const hasAccess = await hasAccessToOrg(
            ctx,
            indentity.tokenIdentifier,
            args.orgId
        );

        if(!hasAccess){
            throw new ConvexError('you do not have access to this org')
        }

        await ctx.db.insert('files', {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type
        })
    }
})

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
    },
    async handler(ctx, args){
        const indentity = await ctx.auth.getUserIdentity();

        if(!indentity){
            return [];
        }

        const hasAccess = await hasAccessToOrg(
            ctx,
            indentity.tokenIdentifier,
            args.orgId
        );

        if(!hasAccess){
            throw [];
        }

        const files = await ctx.db.
            query("files")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();
           
        const query = args.query;    
        
        if(query){
            return files.filter((file) => file.name.includes(query))  
        } else {
            return files 
        }   
    }
})

export const deleteFile = mutation({
    args: { fileId: v.id('files') },
    async handler(ctx, args){
        const identity = await ctx.auth.getUserIdentity();
        
        if(!identity){
            throw new ConvexError("you do not have access to this org");
        }

        const file = await ctx.db.get(args.fileId);

        if(!file){
            throw new ConvexError("this file does not exist");
        }

        const hasAccess = await hasAccessToOrg(
            ctx, 
            identity.tokenIdentifier,
            file.orgId
        );

        if(!hasAccess){
            throw new ConvexError("you do not have access to delete this file");
        }

        await ctx.db.delete(args.fileId);
    }
})