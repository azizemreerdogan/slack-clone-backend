import {randomUUID } from "node:crypto"
import { AppError } from "../../errors/AppError.js"
import prisma from "../../lib/prisma.js"
import { AttachStatus } from "../../../generated/prisma/enums.js"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { HeadObjectCommand } from "@aws-sdk/client-s3"
import { BUCKET } from "../../lib/s3.js"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"     
import {s3} from "../../lib/s3.js"                           



const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024 // 10gb
const UPLOAD_TTL = 600
const DOWNLOAD_TTL= 3600

function buildStorageKey(workspaceId: string, attachmentId: string, fileName: string) {     
    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
    return `workspaces/${workspaceId}/${attachmentId}/${safe}`                                
  }       

export async function createPresignedUpload(workspace_id: string, uploaderMemberId: string, fileName: string,
     mime: string, size: number){
    

    if(size> MAX_FILE_SIZE){
        throw new AppError(413, "File exceeds size limit")
    }
    
    const id = randomUUID();
    const storage_key = buildStorageKey(workspace_id, id, fileName)

    const attachment = await prisma.attachment.create({
        data: {
            id: id,
            workspace_id: workspace_id,
            uploader_member_id: uploaderMemberId,
            filename: fileName,
            storage_key: storage_key,
            mime: mime,
            size: size,
            attach_status: AttachStatus.PENDING
        }
    })
     
    const command = new PutObjectCommand(
        {
            Bucket: BUCKET,
            Key: storage_key,
            ContentType: mime,
            ContentLength: size
        }
    )

    const upload_url = await getSignedUrl(s3, command, {expiresIn: UPLOAD_TTL})

    return {
        attachment_id: attachment.id,
        upload_url,
        key: storage_key,
        expires_in: UPLOAD_TTL
    }

}

export async function completeUpload(att_id: string, workspace_id: string){
    const att = await prisma.attachment.findFirst({
        where: {
            id: att_id,
            workspace_id: workspace_id
        }
    })

    if(!att){
        throw new AppError(404, "Attachment does not exist")
    }
    

    if(att?.attach_status === AttachStatus.READY){
        return att;
    }

    let head;

    try{
        head = await s3.send(new HeadObjectCommand({
            Bucket: BUCKET,
            Key: att.storage_key
        }))
    }catch(e: any){
        if(e.$metadata.httpStatusCode === 404){
            throw new AppError(409, "Upload not found in storage")
        }
        throw e;
    }

    //We check it by content length to make it simpler.
    if(Number(head.ContentLength) !== att.size){
            throw new AppError(409, "Size mismatch")
        }

    return prisma.attachment.update({
        where: {
            id: att.id
        },
        data: {attach_status: AttachStatus.READY}
    })
}

export async function getDownloadUrl(id: string, workspace_id: string){
    const att = await prisma.attachment.findFirst({
        where: { id, workspace_id, attach_status: AttachStatus.READY }
    })

    if(!att) throw new AppError(404, "Attachment not found");

    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: att.storage_key,
        ResponseContentDisposition: `attachment; filename="${att.filename}"`,
    })

    const url = await getSignedUrl(s3, command, {expiresIn: DOWNLOAD_TTL})
    
    return {url, expires_in: DOWNLOAD_TTL, file_name: att.filename}
}