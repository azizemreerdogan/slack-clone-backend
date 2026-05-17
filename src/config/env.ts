import { z } from "zod"
import 'dotenv/config'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.url().default("localhost:6379"),
  S3_ENDPOINT: z.url().default("https://localhost:9000"),                                                                                                  
  S3_REGION: z.string(),                                                                                                             
  S3_BUCKET:z.string(),                                                                                                      
  S3_ACCESS_KEY: z.string(),     
  S3_SECRET_KEY: z.string(),                                                                                                           
  S3_FORCE_PATH_STYLE: z.coerce.boolean()

})

export const env = envSchema.parse(process.env)
