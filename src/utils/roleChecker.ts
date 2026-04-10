import { RoleType } from "../../generated/prisma/enums.js";


//This function will be used to enforce workspace specific role rules, but in development simple rules are defined.
export function roleChecker(workspace_id: string, role: RoleType) : boolean{
    if(role === RoleType.ADMIN){
        return true
    }else{
        return false
    }
}