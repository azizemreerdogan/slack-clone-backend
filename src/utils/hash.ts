import bcrypt from 'bcrypt';

export async function hashPassword(password: string){
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(candidatePassword: string,hash: string ) : Promise<boolean> {
    return bcrypt.compare(candidatePassword,hash)
}

