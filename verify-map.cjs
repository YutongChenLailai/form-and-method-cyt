const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
new vm.Script(script);
const context = {assert, URLSearchParams, innerWidth:1280, location:{search:'?view=2'}, localStorage:{getItem:()=>null}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('problem-data.js','utf8')+'\n'+script.slice(0,script.indexOf('const $='))+`
assert.equal(problemTopics.length,10);
assert.equal(problemReferences.length,17);
assert.equal(new Set(problemReferences.map(r=>r.doi)).size,17);
for(const p of problemTopics) for(const id of p.refs) assert.ok(problemReferences.some(r=>r.id===id),id);
for(mapVersion of [1,2]) {
 stages=mapVersion===1?originalStages:sixStages;
 for(stage=1;stage<=stages.length;stage++) for(const focused of [false,true]) {
  isolatedStage=focused&&mapVersion===2?stage:0;
  const graph=stageNodes(), ids=new Set(graph.ns.map(n=>n.id));
  assert.equal(ids.size,graph.ns.length);
  for(const edge of graph.es) assert.ok(ids.has(edge.a)&&ids.has(edge.b),edge.a+' -> '+edge.b);
  if(isolatedStage) assert.ok(graph.ns.every(n=>n.id.startsWith('s'+stage+'-')));
 }
}
mapVersion=2;stages=sixStages;stage=5;isolatedStage=5;
for(let variation=0;variation<3;variation++) {
 const graph=problemMap();
 const size=id=>{const n=graph.ns.find(n=>n.id===id);return{w:n.treeRole==='papers'?470:n.treeRole==='theory'?330:id==='s5-pre-problems'?400:370,h:150+(id.length*31+variation*83)%310}};
 arrangeProblemTree(graph.ns,size);
 const boxes=graph.ns.map(n=>({...n,...size(n.id)}));
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i],b=boxes[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'Node overlap');
 }
 const segments=problemTreeRoutes(graph.ns,size).flatMap((r,path)=>r.points.slice(1).map((b,i)=>({a:r.points[i],b,path})));
 for(let i=0;i<segments.length;i++){
  const s=segments[i];
  for(const r of boxes){
   const horizontal=s.a.y===s.b.y;
   const hit=horizontal?s.a.y>r.y+1&&s.a.y<r.y+r.h-1&&Math.max(s.a.x,s.b.x)>r.x+1&&Math.min(s.a.x,s.b.x)<r.x+r.w-1:s.a.x>r.x+1&&s.a.x<r.x+r.w-1&&Math.max(s.a.y,s.b.y)>r.y+1&&Math.min(s.a.y,s.b.y)<r.y+r.h-1;
   assert.ok(!hit,'Line crosses text: '+r.id);
  }
  for(let j=i+1;j<segments.length;j++){
   const t=segments[j];if(s.path===t.path)continue;
   const h=s.a.y===s.b.y?s:t,v=s.a.y===s.b.y?t:s;
   if(h.a.y!==h.b.y||v.a.x!==v.b.x)continue;
   const crossing=v.a.x>Math.min(h.a.x,h.b.x)&&v.a.x<Math.max(h.a.x,h.b.x)&&h.a.y>Math.min(v.a.y,v.b.y)&&h.a.y<Math.max(v.a.y,v.b.y);
   assert.ok(!crossing,'Crossing branches');
  }
 }
}

`,context);
console.log('Verified graph endpoints, isolated stages, 10 problem topics and 17 unique source records; tree layout has no crossings or text overlaps.');
