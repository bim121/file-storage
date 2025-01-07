import { internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError, v } from 'convex/values'
import { roles } from "./schema";

export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string){
    console.log(tokenIdentifier)
    const user = await ctx.db 
        .query("users")
        .withIndex("by_tokenIdentifier", (q) => 
            q.eq("tokenIdentifier", tokenIdentifier)
        )
        .first();
    
    if(!user){
        throw new ConvexError('expected user to be defined');
    }    

    return user;
}

export const createUser = internalMutation({
    args: {tokenIdentifier: v.string() },
    async handler(ctx, args) {
        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            orgIds: [],
        })
    },
})

export const addOrgIdToUser = internalMutation({
    args: { tokenIdentifier: v.string(), orgId: v.string(), role: roles },
    async handler(ctx, args){
        const user = await getUser(ctx, args.tokenIdentifier);

        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role } ]
        })
    }
})

export const updateRoleInOrgForUser = internalMutation({
    args: { tokenIdentifier: v.string(), orgId: v.string(), role: roles },
    async handler(ctx, args){
        const user = await getUser(ctx, args.tokenIdentifier);

        const org = user.orgIds.find((org) => org.orgId === args.orgId);

        if(!org){
            throw new ConvexError(
                "expected an org on the user but was not fount when updating"
            )
        }

        org.role = args.role;

        await ctx.db.patch(user._id, {
            orgIds: user.orgIds
        })
    }
})