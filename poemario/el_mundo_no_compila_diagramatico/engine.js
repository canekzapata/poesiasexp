
'use strict';

(function(){
  const C = window.WORLD_CONTENT;

  function xmur3(str){
    let h=1779033703^str.length;
    for(let i=0;i<str.length;i++){
      h=Math.imul(h^str.charCodeAt(i),3432918353);
      h=h<<13|h>>>19;
    }
    return function(){
      h=Math.imul(h^h>>>16,2246822507);
      h=Math.imul(h^h>>>13,3266489909);
      return (h^h>>>16)>>>0;
    };
  }
  function mulberry32(a){
    return function(){
      let t=a+=0x6D2B79F5;
      t=Math.imul(t^t>>>15,t|1);
      t^=t+Math.imul(t^t>>>7,t|61);
      return ((t^t>>>14)>>>0)/4294967296;
    };
  }
  function makeRng(seed){
    const h=xmur3(String(seed));
    return mulberry32(h());
  }
  function cleanWords(s){
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-zñ0-9_]+/g,' ').trim().split(/\s+/).filter(w=>w.length>4);
  }

  class WorldEngine{
    constructor(seed){
      this.baseSeed=String(seed || this.randomSeed());
      this.loop=0;
      this.page=0;
      this.state={
        wordCounts:Object.create(null),
        openNodes:[],
        errors:0,
        maxDensity:{value:0,page:0},
        unconnected:[],
        unrepresented:100,
        legendIntegrity:100,
        residues:[],
        categoryHeat:Object.fromEntries(Object.keys(C.categories).map(k=>[k,0]))
      };
      this.beginLoop();
    }
    randomSeed(){
      return `mundo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
    }
    beginLoop(){
      this.rng=makeRng(`${this.baseSeed}::${this.loop}`);
      this.loopLength=this.int(24,40);
      this.page=0;
      this.loopDuration=this.int(210000,330000);
      this.pageDuration=Math.floor(this.loopDuration/this.loopLength);
      Object.keys(this.state.categoryHeat).forEach(k=>this.state.categoryHeat[k]*=.72);
      this.state.legendIntegrity=Math.max(11,this.state.legendIntegrity-this.float(4,12));
    }
    fork(label){
      return makeRng(`${this.baseSeed}:${this.loop}:${this.page}:${label}`);
    }
    float(min=0,max=1){return min+(max-min)*this.rng()}
    int(min,max){return Math.floor(this.float(min,max+1))}
    chance(p=.5){return this.rng()<p}
    pick(arr){return arr[Math.floor(this.rng()*arr.length)]}
    shuffle(arr){
      const out=[...arr];
      for(let i=out.length-1;i>0;i--){const j=this.int(0,i);[out[i],out[j]]=[out[j],out[i]]}
      return out;
    }
    weighted(entries){
      const total=entries.reduce((s,x)=>s+Math.max(0,x[1]),0);
      let n=this.rng()*total;
      for(const [key,w] of entries){n-=Math.max(0,w);if(n<=0)return key}
      return entries[entries.length-1][0];
    }
    categories(count=this.int(3,5)){
      const entries=Object.keys(C.categories).map(k=>{
        const cooling=1/(1+this.state.categoryHeat[k]*.42);
        let urgency=1;
        if(k==='ERROR') urgency=1+this.state.errors*.018;
        if(k==='RESIDUE') urgency=1+(100-this.state.unrepresented)*.005;
        if(k==='WORLD') urgency=1+this.state.unrepresented*.006;
        return [k,cooling*urgency];
      });
      const chosen=[];
      while(chosen.length<count){
        const key=this.weighted(entries.filter(([k])=>!chosen.includes(k)));
        chosen.push(key);
      }
      chosen.forEach(k=>this.state.categoryHeat[k]++);
      return chosen;
    }
    relation(){
      return this.weighted(Object.keys(C.relations).map((k,i)=>{
        let w=1;
        if(k==='perdida')w+=this.state.unrepresented/140;
        if(k==='contradiccion')w+=this.state.errors/30;
        if(k==='retroalimentacion')w+=this.loop*.15;
        if(k==='demora')w+=(this.page%7===0?.8:0);
        return [k,w];
      }));
    }
    chooseFamily(){
      const entries=Object.entries(C.families).map(([k,w])=>{
        let m=w;
        if(k==='error')m*=1+this.state.errors*.025;
        if(k==='memory')m*=1+this.state.residues.length*.03;
        if(k==='overflow')m*=1+(100-this.state.legendIntegrity)*.008;
        if(k==='weather' && this.page%5===0)m*=1.5;
        if(k==='index' && this.page>this.loopLength*.7)m*=1.7;
        return [k,m];
      });
      return this.weighted(entries);
    }
    item(cat){
      const pool=C.categories[cat];
      let candidate=this.pick(pool);
      for(let i=0;i<5;i++){
        const words=cleanWords(candidate);
        const repeated=words.reduce((n,w)=>n+(this.state.wordCounts[w]||0),0);
        if(repeated<4 || this.chance(.22))break;
        candidate=this.pick(pool);
      }
      return candidate;
    }
    compose(cats, index=0){
      const a=this.item(cats[index%cats.length]);
      const b=this.item(cats[(index+1)%cats.length]);
      const c=this.item(cats[(index+2)%cats.length]);
      const opening=this.pick(C.syntax.openings)
        .replace('{a}',a).replace('{b}',b).replace('{n}',String(this.int(1,99)).padStart(2,'0'));
      const hinge=this.pick(C.syntax.hinges);
      const end=this.pick(C.syntax.endings);
      let text=`${opening}\n${hinge}: ${c}\n${end}`;
      if(this.chance(.18+this.loop*.02))text=this.corrupt(text);
      this.note(text);
      return text;
    }
    corrupt(text){
      const modes=[
        s=>s.replace(/[aeiouáéíóú]/gi,m=>this.chance(.22)?'·':m),
        s=>s.split(' ').map((w,i)=>i%this.int(4,8)===0?w.toUpperCase():w).join(' '),
        s=>s.replace(/\n/g,this.chance(.5)?'\n    ':' // '),
        s=>s.replace(/mundo/gi,'mundo′').replace(/archivo/gi,'archivø'),
        s=>s.slice(0,Math.max(16,Math.floor(s.length*this.float(.62,.91))))+' [TRUNCADO]'
      ];
      return this.pick(modes)(text);
    }
    note(text){
      cleanWords(text).forEach(w=>this.state.wordCounts[w]=(this.state.wordCounts[w]||0)+1);
    }
    makeNodes(cats,count){
      return Array.from({length:count},(_,i)=>{
        const cat=cats[i%cats.length];
        const raw=this.item(cat);
        const label=raw.length>56?raw.slice(0,53)+'…':raw;
        const id=`${cat.toLowerCase()}_${String(this.page).padStart(2,'0')}_${String(i).padStart(2,'0')}`;
        if(this.chance(.2))this.state.openNodes.push({id,label,cat,loop:this.loop,page:this.page});
        return {id,label,cat,open:this.chance(.22)};
      });
    }
    pageSpec(){
      const pageNo=this.page;
      const family=this.chooseFamily();
      const cats=this.categories();
      const operation=C.operations[(pageNo+this.int(0,C.operations.length-1))%C.operations.length];
      const density=this.float(.48,1.18);
      const nodeCount=Math.max(4,Math.round(4+density*10));
      const nodes=this.makeNodes(cats,nodeCount);
      const fragments=Array.from({length:this.int(4,9)},(_,i)=>this.compose(cats,i));
      const relations=Array.from({length:this.int(5,Math.max(7,nodeCount+6))},()=>this.relation());
      const errors=(family==='error'?this.int(2,6):this.chance(.28)?1:0);
      const unconnected=this.chance(.45)?this.pick(nodes):null;
      if(unconnected)this.state.unconnected.push(unconnected);
      this.state.errors+=errors;
      this.state.unrepresented=Math.min(100,Math.max(4,this.state.unrepresented-this.float(.35,1.7)+errors*.22));
      this.state.legendIntegrity=Math.max(5,this.state.legendIntegrity-this.float(.2,1.1));
      if(density>this.state.maxDensity.value)this.state.maxDensity={value:density,page:pageNo};
      const spec={
        seed:`${this.baseSeed}:${this.loop}:${pageNo}`,
        loop:this.loop,index:pageNo,total:this.loopLength,family,categories:cats,operation,density,nodes,
        fragments,relations,errors,unconnected,
        dark:this.chance(.24)||(pageNo%9===6),
        violent:this.chance(.18)||family==='error'||family==='overflow',
        monumental:this.chance(.68)?this.pick(C.syntax.monumental):null,
        unit:this.pick(C.syntax.units),
        unresolved:this.pick(C.syntax.unresolved),
        duration:this.pageDuration,
        worldUnrepresented:this.state.unrepresented,
        legendIntegrity:this.state.legendIntegrity
      };
      this.page++;
      return spec;
    }
    endLoop(){
      const unresolved=this.pick(C.syntax.unresolved);
      const keepRatio=this.float(.05,.15);
      this.state.residues=this.shuffle(this.state.residues).slice(0,Math.max(2,Math.ceil(this.state.residues.length*keepRatio)));
      this.loop++;
      return {unresolved,keepRatio};
    }
    nextLoop(){this.beginLoop()}
    cloneForPrint(){
      const clone=new WorldEngine(this.baseSeed);
      for(let i=0;i<this.loop;i++){for(let j=0;j<clone.loopLength;j++)clone.pageSpec();clone.endLoop();clone.nextLoop()}
      return clone;
    }
  }

  window.WorldEngine=WorldEngine;
  window.WorldRng={make:makeRng};
})();
