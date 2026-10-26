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
`,context);
console.log('Verified graph endpoints, isolated stages, 10 problem topics and 17 unique source records.');
