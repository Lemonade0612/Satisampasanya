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
   db.prepare('INSERT INTO user_access(user_id,role,status) VALUES (?,?,?)').run(id,role,status);
  }
  db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run('p','m',JSON.stringify({content:'Warning',state:'flagged',frozen:true}),now);
  notifyReviewers(db,[],now);notifyReviewers(db,[],now+1);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notifications').get().n,1);
  notifyReviewers(db,[],now+48*3600000);notifyReviewers(db,[],now+49*3600000);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notifications').get().n,2);
  assert.equal(JSON.parse(db.prepare('SELECT data FROM posts').get().data).frozen,true);
  reviewPost(db,'p','rejected','Reviewed: the offer is unsafe.',{id:'r',name:'Reviewer'});
  assert.equal(JSON.parse(db.prepare('SELECT data FROM posts').get().data).frozen,true);
  notifyReviewers(db,[],now+50*3600000);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notifications WHERE kind=?').get('review_overdue').n,1);
 }finally{db.close();}
});
