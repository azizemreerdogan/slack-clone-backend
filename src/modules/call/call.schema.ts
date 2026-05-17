import { array, z } from "zod"
 
export const InviteCallSchema = z.object({
    channel_id: z.string(),
    workspace_member_id: z.string(),
    recipients: z.array(z.string())
})

export const AcceptCallSchema = z.object({
    call_id: z.string(),
    channel_id: z.string(),
    workspace_member_id: z.string()
})

export const DeclineCallSchema = z.object({
    call_id: z.string(),
    workspace_member_id: z.string()
})

export const LeaveCallSchema = z.object({
    call_id: z.string(),
    workspace_member_id: z.string()
})