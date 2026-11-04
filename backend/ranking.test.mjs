import test from 'node:test';
import assert from 'node:assert/strict';
import {communityRanking} from './ranking.mjs';
import {notifyReviewers} from './review-queue.mjs';
import {openStore} from './store.mjs';
import {reviewPost} from './admin.mjs';

test('only checked safe posts receive capped, age-decayed boosts',()=>{
 const safe={state:'clean',check:{verdict:'approved',on_topic:true}};
 const now=100*86400000;
 const fresh=communityRanking(safe,{likes:100,helpful:100,commenters:100,reposters:100,createdAt:now,now});
 assert.equal(fresh.score,50);assert.equal(fresh.parts.engagement,30);
 assert.ok(communityRanking(safe,{createdAt:now,now}).rank>communityRanking(safe,{createdAt:now-86400000,now}).rank);
 for(const post of [{...safe,frozen:true},{...safe,check:{verdict:'caution'}},{...safe,state:'rejected',frozen:true},{state:'clean'}])assert.equal(communityRanking(post,{likes:1e9}).score,0);
 assert.equal(communityRanking({...safe,review:{state:'clean'}}).parts.review,30);
});

test('48h review reminders are persisted once per active reviewer and never unlock posts',()=>{
 const db=openStore(':memory:',false),now=100*86400000;
 try{
  for(const [id,role,status] of [['r','reviewer','active'],['m','member','active'],['i','reviewer','inactive']]){
   db.prepare('INSERT INTO users(id,email,name,password,salt) VALUES (?,?,?,?,?)').run(id,id+'@invalid',id,'hash','salt');
   db.prepare('INSERT INTO user_access(user_id,role,status,managed) VALUES (?,?,?,1)').run(id,role,status);
  }
  db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run('p','m',JSON.stringify({content:'Warning',state:'flagged',frozen:true}),now);
  notifyReviewers(db,now);notifyReviewers(db,now+1);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notifications').get().n,1);
  notifyReviewers(db,now+48*3600000);notifyReviewers(db,now+49*3600000);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notifications').get().n,2);
  assert.equal(JSON.parse(db.prepare('SELECT data FROM posts').get().data).frozen,true);
  reviewPost(db,'p','rejected','Reviewed: the offer is unsafe.',{id:'r',name:'Reviewer'});
  assert.equal(JSON.parse(db.prepare('SELECT data FROM posts').get().data).frozen,true);
  notifyReviewers(db,now+50*3600000);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notifications WHERE kind=?').get('review_overdue').n,1);
 }finally{db.close();}
});

test('a locked source keeps every repost locked',async()=>{
 const {postLocked}=await import('./post-lock.mjs');const db=openStore(':memory:',false);
 try{
  db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)').run('source',JSON.stringify({frozen:true}),Date.now());
  db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)').run('repost',JSON.stringify({repostOf:'source',frozen:false}),Date.now());
  assert.equal(postLocked(db,db.prepare('SELECT * FROM posts WHERE id=?').get('repost')),true);
  db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify({frozen:false}),'source');
  assert.equal(postLocked(db,db.prepare('SELECT * FROM posts WHERE id=?').get('repost')),false);
 }finally{db.close();}
});

test('legacy yellow posts lock their reposts and notify the review center until reviewed',async()=>{
 const {postLocked}=await import('./post-lock.mjs');const db=openStore(':memory:');
 try{
  db.prepare('INSERT INTO users(id,email,name,password,salt) VALUES (?,?,?,?,?)').run('r','r@example.test','Reviewer','hash','salt');
  db.prepare('INSERT INTO user_access(user_id,role,managed) VALUES (?,?,1)').run('r','reviewer');
  db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)').run('yellow',JSON.stringify({state:'clean',frozen:false,check:{verdict:'caution'}}),Date.now());
  db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)').run('copy',JSON.stringify({repostOf:'yellow',frozen:false}),Date.now());
  assert.equal(postLocked(db,db.prepare('SELECT * FROM posts WHERE id=?').get('yellow')),true);
  assert.equal(postLocked(db,db.prepare('SELECT * FROM posts WHERE id=?').get('copy')),true);
  notifyReviewers(db);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM notifications WHERE kind='review_requested'").get().n,1);
  reviewPost(db,'yellow','clean','Reviewed the context and approved.',{id:'r',name:'Reviewer'});
  assert.equal(postLocked(db,db.prepare('SELECT * FROM posts WHERE id=?').get('yellow')),false);
  assert.equal(postLocked(db,db.prepare('SELECT * FROM posts WHERE id=?').get('copy')),false);
 }finally{db.close();}
});
