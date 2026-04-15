import type { MessageCreatedEvent } from "../../lib/events.js";
import type { createNotificationInput } from "./notification.schema.js";
import prisma from "../../lib/prisma.js";
import { ChannelType, MemberStatus, NotificationType } from "../../../generated/prisma/enums.js";
import type { WorkspaceMember } from "../../../generated/prisma/client.js";

//Handler for message.created, we return createNotificationInput array and that array will be processed by notification.listener
export async function handleMessageCreated(e: MessageCreatedEvent):
Promise<createNotificationInput[]>{
    const inputs : createNotificationInput[] = [];
    const mentionRegex = /(?<!\w)@([a-zA-Z0-9_]{1,30})/g
    const specialKeywords = new Set(["here", "channel", "everyone"]);

    //a) Thread_reply -> notifies the parent message sender.
    if(e.parent_msg_id){
        const parent = await prisma.message.findUnique({
            where: {
                id: e.parent_msg_id,
            },
            select: {sender_id: true}
        })

        if(parent && parent.sender_id !== e.sender_id){
            inputs.push(
                {
                    workspace_member_id: parent.sender_id,
                    entity_type: "MESSAGE",
                    entity_id: e.message_id,
                    notification_type: NotificationType.THREAD_REPLY
                }
            )
        }
    }

    //b) Mentions - parse @user and special @here/@channel/@everyone tokens.
    const allMatches = Array.from(
        e.content?.matchAll(mentionRegex) ?? [],
        (m) => m[1]
    ).filter((mention): mention is string => mention !== undefined);

    const userMentions = [...new Set(allMatches.filter((n) => !specialKeywords.has(n)))];
    const specialMentions = new Set(allMatches.filter((n) => specialKeywords.has(n)));

    //b.1) @user mentions - only notify if the mentioned user is a member of this channel.
    if(userMentions.length > 0){
        const mentionedMembers = await prisma.workspaceMember.findMany({
            where: {
                NOT: { id: e.sender_id },
                display_name: { in: userMentions },
                channel_members: { some: { channel_id: e.channel_id } }
            },
            select: { id: true }
        })

        inputs.push(
            ...mentionedMembers.map((m) => ({
                workspace_member_id: m.id,
                entity_type: "MESSAGE" as const,
                entity_id: e.message_id,
                notification_type: NotificationType.MESSAGE_MENTION
            }))
        )
    }

    //b.2) @here / @channel / @everyone - notify channel members.
    // @channel and @everyone target all members; @here targets only ONLINE members.
    const hasChannelWide = specialMentions.has("channel") || specialMentions.has("everyone");
    const hasHere = specialMentions.has("here");

    if(hasChannelWide || hasHere){
        const channelMembers = await prisma.channelMember.findMany({
            where: {
                channel_id: e.channel_id,
                NOT: { workspace_member_id: e.sender_id },
                ...(hasChannelWide
                    ? {}
                    : { workspace_member: { member_status: MemberStatus.ONLINE } })
            },
            select: { workspace_member_id: true }
        })

        const notifType = hasChannelWide
            ? NotificationType.CHANNEL_MENTION
            : NotificationType.HERE_MENTION;

        inputs.push(
            ...channelMembers.map((cm) => ({
                workspace_member_id: cm.workspace_member_id,
                entity_type: "MESSAGE" as const,
                entity_id: e.message_id,
                notification_type: notifType
            }))
        )
    }

    //c) DM received. (Should work only on dm channels)
    const channel = await prisma.channel.findUnique({
        where: {
            id: e.channel_id
        },
        select: {channel_type: true, members: {
            select: {workspace_member: true}
        }}
    })

    if(channel?.channel_type === ChannelType.DM || channel?.channel_type === ChannelType.GROUP_DM){
        const recipients = channel.members
            .map((m) => m.workspace_member)
            .filter(wm => wm.id !== e.sender_id);

        inputs.push(
            ...recipients.map((m) => ({
                workspace_member_id: m.id,
                entity_type: "MESSAGE" as const,
                entity_id: e.message_id,
                notification_type: NotificationType.DM_RECEIVED
            }))
        )
    }
    return inputs;
}

//Handler for channel.member_added notify the added member.

//Handler for workspace.invite, notify the invited user.
