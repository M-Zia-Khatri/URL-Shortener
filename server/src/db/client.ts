import pg from 'pg'; import { env } from '../config/env.js';
export const pool=new pg.Pool({connectionString:env.DATABASE_URL});
export async function connectWithRetry(retries=5){let delay=100; for(let i=0;i<retries;i++){try {await pool.query('SELECT 1'); return} catch(error){if(i===retries-1) throw error; await new Promise(r=>setTimeout(r,delay)); delay*=2}}}
