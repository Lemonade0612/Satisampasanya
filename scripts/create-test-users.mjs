import {randomBytes} from 'node:crypto';
import {resolve} from 'node:path';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {openStore} from '../backend/store.mjs';
import {manageUser} from '../backend/access.mjs';

// Explicit local setup; existing accounts and passwords are never overwritten.
const db = openStore(process.env.DATABASE_PATH || resolve('backend/data/sati.sqlite'));
const accounts = [
  {name:'Sati Administrator',email:'admin@sati.test',role:'admin'},
  {name:'Sati Reviewer',email:'reviewer@sati.test',role:'reviewer'},
  {name:'Alice Test',email:'alice@sati.test',role:'member'},
  {name:'Bob Test',email:'bob@sati.test',role:'member'},
];
const credentialsFile=resolve('backend/data/test-accounts.json');
const credentials=existsSync(credentialsFile)?JSON.parse(readFileSync(credentialsFile,'utf8')):[];
try {
  for (const account of accounts) {
    if (db.prepare('SELECT id FROM users WHERE email=?').get(account.email)) {
      console.log(`${account.email}: already exists; unchanged`);
      continue;
    }
    const password = randomBytes(15).toString('base64url');
    await manageUser(db,{id:'local-account-setup'},{...account,password,status:'active'},null,[]);
    credentials.push({...account,password});
    writeFileSync(credentialsFile,JSON.stringify(credentials,null,2)+'\n',{mode:0o600});
    console.log(`${account.role}: ${account.email} (credentials saved locally)`);
  }
  console.log(`Credentials: ${credentialsFile}`);
} finally { db.close(); }
