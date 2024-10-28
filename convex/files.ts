import {mutation, MutationCtx, query, QueryCtx} from './_generated/server'
import {ConvexError, v} from 'convex/values'
import { getUser } from './users';

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
        orgId: v.string(),
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
        })
    }
})

export const getFiles = query({
    args: {
        orgId: v.string()
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

        return ctx.db.
            query("files")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();
    }
})