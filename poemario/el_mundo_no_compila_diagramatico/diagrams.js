
'use strict';

(function(){
  const NS='http://www.w3.org/2000/svg';
  const C=window.WORLD_CONTENT;
  const make=(tag,attrs={},text)=>{
    const el=document.createElementNS(NS,tag);
    for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));
    if(text!=null)el.textContent=text;
    return el;
  };
  const html=(tag,cls,text)=>{
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(text!=null)el.textContent=text;
    return el;
  };
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  function localRng(spec,label='layout'){return window.WorldRng.make(`${spec.seed}:${label}`)}
  function defs(svg){
    const d=make('defs');
    const markers={
      triangle:'M0,0 L8,4 L0,8 Z',
      bar:'M5,0 L5,8',
      cross:'M1,1 L7,7 M7,1 L1,7',
      circle:'M4,0 A4,4 0 1,0 4.01,0',
      diamond:'M0,4 L4,0 L8,4 L4,8 Z',
      fade:'M0,1 L8,4 L0,7',
      eye:'M0,4 Q4,0 8,4 Q4,8 0,4 M4,2 A2,2 0 1,0 4.01,2'
    };
    Object.entries(markers).forEach(([id,path])=>{
      const marker=make('marker',{id:`mk-${id}`,viewBox:'0 0 8 8',refX:7,refY:4,markerWidth:8,markerHeight:8,orient:'auto-start-reverse'});
      marker.appendChild(make('path',{d:path,fill:id==='bar'||id==='cross'||id==='eye'?'none':'currentColor',stroke:'currentColor','stroke-width':id==='bar'?'1.3':'.8'}));
      d.appendChild(marker);
    });
    svg.appendChild(d);
  }
  function railBlock(title,body,cls=''){
    const section=html('section',`rail-block ${cls}`.trim());
    section.append(html('h2','rail-title',title),html('div','rail-body',body));
    return section;
  }

  function buildRail(spec){
    const rail=html('aside','world-rail');
    const mast=html('div','rail-mast');
    mast.append(
      html('strong','rail-loop',`LOOP ${String(spec.loop+1).padStart(2,'0')}`),
      html('span','rail-page',`${String(spec.index+1).padStart(3,'0')} / ${spec.total}`),
      html('span','rail-family',spec.family)
    );
    rail.appendChild(mast);

    const categoryField=html('section','rail-block category-field');
    categoryField.appendChild(html('h2','rail-title','campos activos'));
    const categoryGrid=html('div','category-grid');
    spec.categories.forEach((cat,i)=>{
      const item=html('span',`category-token${i===0?' primary':''}`,cat);
      item.style.setProperty('--token-delay',`${i*.12}s`);
      categoryGrid.appendChild(item);
    });
    categoryField.appendChild(categoryGrid);
    rail.appendChild(categoryField);

    const unresolved=railBlock('variable sin exterior',spec.unresolved,'unresolved-rail');
    unresolved.dataset.value=spec.unresolved;
    rail.appendChild(unresolved);

    const measure=html('section','rail-block measure-block');
    measure.append(
      html('h2','rail-title','medición desplazada'),
      html('div','measure-value',spec.worldUnrepresented.toFixed(1)),
      html('div','measure-unit','% del mundo aún sin representar'),
      html('div','measure-bar','')
    );
    measure.querySelector('.measure-bar').style.setProperty('--measure',`${spec.worldUnrepresented}%`);
    rail.appendChild(measure);

    const nodeList=html('ol','rail-nodes');
    spec.nodes.slice(0,5).forEach((n,i)=>{
      const li=html('li','rail-node');
      li.append(
        html('span','rail-node-id',String(i+1).padStart(2,'0')),
        html('span','rail-node-label',n.label),
        html('span','rail-node-state',n.open?'ABIERTO':'LATENTE')
      );
      nodeList.appendChild(li);
    });
    const nodeBlock=html('section','rail-block node-register');
    nodeBlock.append(html('h2','rail-title','registro de nodos'),nodeList);
    rail.appendChild(nodeBlock);

    const trace=html('pre','rail-trace',
`observe(${spec.categories[0]});
model += ${spec.categories[1]};
if (legend.integrity < ${spec.legendIntegrity.toFixed(0)}) {
  relation = contradiction;
}
return ${spec.unresolved};`);
    const traceBlock=html('section','rail-block trace-block');
    traceBlock.append(html('h2','rail-title','traza local'),trace);
    rail.appendChild(traceBlock);

    const crawl=html('div','rail-crawl');
    crawl.textContent=spec.fragments.map(x=>x.replace(/\s+/g,' ')).join('  //  ');
    rail.appendChild(crawl);
    return rail;
  }

  function base(spec,mount,opts={}){
    const composition=(spec.index + spec.loop*3) % 8;
    const page=html('article',`page family-${spec.family}${spec.dark?' dark':''}${spec.violent?' violent':''} composition-${composition}`);
    page.dataset.family=spec.family;
    page.dataset.density=spec.density.toFixed(2);
    page.dataset.composition=String(composition);
    page.style.setProperty('--density',spec.density.toFixed(3));
    page.style.setProperty('--integrity',`${spec.legendIntegrity}%`);

    const shell=html('div','page-shell');
    const field=html('section','diagram-field');
    field.setAttribute('aria-label',`Diagrama ${spec.family}`);

    const scaffold=html('div','editorial-scaffold');
    for(let i=0;i<12;i++){
      const line=html('i',`scaffold-line line-${i}`);
      line.style.setProperty('--line-index',i);
      scaffold.appendChild(line);
    }
    const edgeA=html('div','edge-word edge-word-a',spec.categories[0]||'WORLD');
    const edgeB=html('div','edge-word edge-word-b',spec.unresolved.replaceAll('_',' '));
    const edgeC=html('div','edge-word edge-word-c',spec.monumental||spec.family);
    scaffold.append(edgeA,edgeB,edgeC);
    field.appendChild(scaffold);

    const head=html('header','page-head');
    const op=html('span','operation',`OP.${String(spec.index+1).padStart(3,'0')} / ${spec.operation}`);
    const coords=html('span','coords',`L${spec.loop.toString().padStart(2,'0')} · U${spec.worldUnrepresented.toFixed(1)}% · ${spec.seed.slice(-8)}`);
    head.append(op,coords);field.appendChild(head);
    ['tl','tr','bl','br'].forEach(x=>field.appendChild(html('i',`crop ${x}`)));

    const svg=make('svg',{class:'diagram-svg',viewBox:'0 0 1000 1414',preserveAspectRatio:'none','aria-hidden':'true'});
    defs(svg);field.appendChild(svg);
    const layer=html('div','text-layer');field.appendChild(layer);

    if(spec.monumental){
      const m=html('div','monument',spec.monumental);
      const r=localRng(spec,'monument');
      m.style.left=`${-28+r()*42}%`;
      m.style.top=`${-6+r()*78}%`;
      m.style.setProperty('--mon-rot',`${(-12+r()*24).toFixed(2)}deg`);
      m.style.setProperty('--mon-scale-x',`${(.64+r()*.82).toFixed(2)}`);
      m.style.setProperty('--mon-scale-y',`${(.86+r()*.48).toFixed(2)}`);
      layer.appendChild(m);
    }

    const echo=html('div','echo-field');
    const echoR=localRng(spec,'echo');
    spec.fragments.slice(0,3).forEach((fragment,i)=>{
      const word=fragment.replace(/[^\p{L}\p{N}_]+/gu,' ').trim().split(/\s+/)
        .filter(x=>x.length>4)[Math.floor(echoR()*Math.max(1,fragment.split(/\s+/).length))] || spec.categories[i%spec.categories.length];
      const e=html('span',`echo-word echo-${i}`,String(word).toUpperCase());
      e.style.setProperty('--echo-x',`${-8+echoR()*82}%`);
      e.style.setProperty('--echo-y',`${6+echoR()*82}%`);
      e.style.setProperty('--echo-r',`${-90+echoR()*180}deg`);
      echo.appendChild(e);
    });
    field.appendChild(echo);

    const foot=html('footer','page-foot');
    foot.append(html('span','cats',spec.categories.join(' + ')),html('span','page-number',`${String(spec.index+1).padStart(3,'0')} / ${spec.total}`));
    field.appendChild(foot);

    shell.append(field,buildRail(spec));
    page.appendChild(shell);
    mount.appendChild(page);
    return {page,svg,layer,field,shell};
  }

  function addNode(svg,node,x,y,w=160,h=70,heavy=false){
    const g=make('g',{class:'diagram-node',transform:`translate(${x} ${y})`});
    const rect=make('rect',{class:`node-shape${heavy?' heavy':''}`,x:-w/2,y:-h/2,width:w,height:h,rx:0});
    const label=make('text',{class:`node-label${heavy?' invert':''}`,x:0,y:-4,'text-anchor':'middle','font-size':11});
    const lines=wrap(node.label,Math.max(16,Math.floor(w/8.2))).slice(0,3);
    lines.forEach((line,i)=>label.appendChild(make('tspan',{x:0,dy:i===0?0:14},line)));
    const meta=make('text',{class:`node-label${heavy?' invert':''}`,x:0,y:h/2-8,'text-anchor':'middle','font-size':7},`${node.cat} :: ${node.id}`);
    g.append(rect,label,meta);svg.appendChild(g);
    return {x,y,w,h,g};
  }
  function wrap(text,max){
    const words=String(text).split(/\s+/),lines=[];let line='';
    words.forEach(w=>{if((line+' '+w).trim().length>max){if(line)lines.push(line);line=w}else line=(line+' '+w).trim()});
    if(line)lines.push(line);return lines;
  }
  function relation(svg,a,b,type,labelOffset=0,curve=0){
    const rel=C.relations[type]||C.relations.observacion;
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    const dx=b.x-a.x,dy=b.y-a.y;
    const nx=-dy,ny=dx,mag=Math.max(1,Math.hypot(nx,ny));
    const cx=mx+(nx/mag)*curve,cy=my+(ny/mag)*curve;
    const d=curve?`M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`:`M${a.x},${a.y} L${b.x},${b.y}`;
    const p=make('path',{class:`relation rel-${type}`,d,'stroke-dasharray':rel.dash,'marker-end':`url(#mk-${rel.marker})`,'data-speed':rel.speed});
    svg.insertBefore(p,svg.querySelector('.diagram-node'));
    const t=make('text',{class:'relation-label',x:cx+labelOffset,y:cy-5,'text-anchor':'middle'},rel.label);
    svg.appendChild(t);return p;
  }
  function addFragments(layer,spec,count=spec.fragments.length){
    const r=localRng(spec,'fragments');
    const requested=Math.min(spec.fragments.length,Math.max(count,Math.round(count*(1+spec.density*.42))));
    spec.fragments.slice(0,requested).forEach((text,i)=>{
      const cls=['fragment'];
      if(i%3===2)cls.push('micro');
      if(i%5===4)cls.push('vertical');
      if(i%7===6)cls.push('invert');
      if((i===0&&spec.density>.62)||i%6===5)cls.push('heavy');
      if(i%4===1)cls.push('fractured');
      const f=html('pre',cls.join(' '),text);
      f.style.left=`${-5+r()*88}%`;
      f.style.top=`${2+r()*86}%`;
      f.style.setProperty('--delay',`${(.08+i*.11).toFixed(2)}s`);
      f.style.setProperty('--frag-rot',`${(-8+r()*16).toFixed(2)}deg`);
      f.style.setProperty('--frag-scale',`${(.72+r()*.84).toFixed(2)}`);
      f.style.setProperty('--frag-width',`${18+r()*47}cqw`);
      f.style.setProperty('--frag-opacity',`${(.48+r()*.52).toFixed(2)}`);
      f.style.setProperty('--frag-shift',`${(-28+r()*56).toFixed(1)}px`);
      layer.appendChild(f);
    });
  }

  function grid(svg,step=80){
    for(let x=40;x<1000;x+=step)svg.appendChild(make('line',{class:'grid-line',x1:x,y1:50,x2:x,y2:1360}));
    for(let y=60;y<1414;y+=step)svg.appendChild(make('line',{class:'grid-line',x1:25,y1:y,x2:975,y2:y}));
  }
  function label(svg,x,y,text,size=9,anchor='start',rotate=0){
    const t=make('text',{x,y,'font-size':size,'text-anchor':anchor,transform:rotate?`rotate(${rotate} ${x} ${y})`:''},text);
    svg.appendChild(t);return t;
  }

  function causal(spec,mount,opts){
    const b=base(spec,mount,opts),r=localRng(spec),pos=[];
    const center={x:500,y:690};
    spec.nodes.slice(0,8).forEach((n,i)=>{
      const a=(i/spec.nodes.slice(0,8).length)*Math.PI*2+r()*.3;
      const radius=230+(i%2)*120;
      pos.push(addNode(b.svg,n,center.x+Math.cos(a)*radius,center.y+Math.sin(a)*radius,150,62,i===0));
    });
    pos.forEach((n,i)=>{
      const target=pos[(i+1+(i%3===0?2:0))%pos.length];
      relation(b.svg,n,target,spec.relations[i%spec.relations.length],0,(i%2?70:-70));
      if(i%3===0)relation(b.svg,target,n,'contradiccion',8,-45);
    });
    addFragments(b.layer,spec,4);return b.page;
  }
  function decision(spec,mount,opts){
    const b=base(spec,mount,opts),root=addNode(b.svg,spec.nodes[0],500,230,260,82,true);
    const mid=[addNode(b.svg,spec.nodes[1],270,580,210,72),addNode(b.svg,spec.nodes[2],730,580,210,72)];
    const same=addNode(b.svg,spec.nodes[3]||spec.nodes[0],500,1040,300,88,true);
    relation(b.svg,root,mid[0],'bifurcacion',-20,-50);relation(b.svg,root,mid[1],'bifurcacion',20,50);
    relation(b.svg,mid[0],same,'dependencia',-10,40);relation(b.svg,mid[1],same,'contradiccion',10,-40);
    label(b.svg,220,430,'SI',22);label(b.svg,770,430,'SINO',22,'end');
    label(b.svg,500,1185,'AMBAS OPCIONES DEVUELVEN EL MISMO RESIDUO',11,'middle');
    addFragments(b.layer,spec,3);return b.page;
  }
  function circuit(spec,mount,opts){
    const b=base(spec,mount,opts);grid(b.svg,100);
    const pts=[[170,360],[500,360],[820,360],[820,820],[500,820],[170,820]];
    const nodes=pts.map((p,i)=>addNode(b.svg,spec.nodes[i%spec.nodes.length],p[0],p[1],160,60,i===2));
    nodes.forEach((n,i)=>relation(b.svg,n,nodes[(i+1)%nodes.length],spec.relations[i%spec.relations.length],0,i%2?35:-35));
    for(let i=0;i<6;i++)label(b.svg,90+i*150,1100,`${['R','C','L','BODY','NET','DUST'][i]}${i+1}`,16,'middle',i%2?90:0);
    addFragments(b.layer,spec,4);return b.page;
  }
  function flow(spec,mount,opts){
    const b=base(spec,mount,opts),xs=[500,500,260,740,500],ys=[220,480,770,770,1110],nodes=[];
    for(let i=0;i<5;i++)nodes.push(addNode(b.svg,spec.nodes[i%spec.nodes.length],xs[i],ys[i],i===1?280:190,i===1?92:68,i===4));
    relation(b.svg,nodes[0],nodes[1],'transmision');relation(b.svg,nodes[1],nodes[2],'bifurcacion',-20,-90);
    relation(b.svg,nodes[1],nodes[3],'bifurcacion',20,90);relation(b.svg,nodes[2],nodes[4],'demora',-20,40);
    relation(b.svg,nodes[3],nodes[4],'perdida',20,-40);relation(b.svg,nodes[4],nodes[1],'retroalimentacion',0,260);
    label(b.svg,500,610,'¿LA INSTRUCCIÓN ALTERÓ LA INSTRUCCIÓN?',13,'middle');
    addFragments(b.layer,spec,4);return b.page;
  }
  function network(spec,mount,opts){
    const b=base(spec,mount,opts),r=localRng(spec),nodes=[];
    spec.nodes.slice(0,10).forEach((n,i)=>{
      const x=100+r()*800,y=150+r()*1080;
      nodes.push(addNode(b.svg,n,x,y,120+r()*75,48+r()*34,i%7===0));
    });
    nodes.forEach((n,i)=>{
      const target=nodes[(i+2+(i%3))%nodes.length];
      relation(b.svg,n,target,spec.relations[i%spec.relations.length],0,(i%2?55:-55));
    });
    label(b.svg,500,705,'CENTRO = referencia_no_encontrada',18,'middle');
    addFragments(b.layer,spec,3);return b.page;
  }
  function weather(spec,mount,opts){
    const b=base(spec,mount,opts),r=localRng(spec);grid(b.svg,140);
    for(let i=0;i<7;i++){
      const x=120+r()*760,y=180+r()*930,rx=70+r()*190,ry=35+r()*90;
      b.svg.appendChild(make('ellipse',{class:'weather-line',cx:x,cy:y,rx,ry,transform:`rotate(${r()*80-40} ${x} ${y})`}));
      label(b.svg,x,y,`${(r()*80-30).toFixed(1)}° / ${(r()*100).toFixed(0)}%`,9,'middle');
    }
    const a={x:120,y:1180},z={x:880,y:240};relation(b.svg,a,z,'contagio',0,180);
    label(b.svg,80,1260,'PRONÓSTICO: el sistema sentirá aquello que no pudo medir',12);
    addFragments(b.layer,spec,5);return b.page;
  }
  function memory(spec,mount,opts){
    const b=base(spec,mount,opts),r=localRng(spec);grid(b.svg,64);
    for(let i=0;i<42;i++){
      const x=70+(i%6)*150,y=160+Math.floor(i/6)*145;
      const corrupt=r()<.28;
      b.svg.appendChild(make('rect',{x,y,width:115,height:90,class:`node-shape${corrupt?' corrupt':''}`,'stroke-dasharray':corrupt?'3 8':''}));
      label(b.svg,x+8,y+17,`0x${(i*17+spec.index).toString(16).padStart(3,'0')}`,7);
      if(corrupt)label(b.svg,x+57,y+52,'░▒▓?',18,'middle');
      else label(b.svg,x+57,y+52,wrap(spec.nodes[i%spec.nodes.length].label,12)[0]||'mem',7,'middle');
    }
    addFragments(b.layer,spec,3);return b.page;
  }
  function table(spec,mount,opts){
    const b=base(spec,mount,opts),t=html('table','table-poem');
    const head=html('tr');['OBJETO','VALOR','UNIDAD','RESULTADO'].forEach(x=>head.appendChild(html('th','',x)));
    t.appendChild(head);
    const units=window.WORLD_CONTENT.syntax.units;
    spec.nodes.slice(0,7).forEach((n,i)=>{
      const tr=html('tr');[
        n.label,
        `${(spec.density*(i+1)*17.3).toFixed(i%3)}`,
        units[(i+spec.index)%units.length],
        i%3===0?'NO COMPARABLE':i%3===1?'PENDIENTE':'≈ residuo'
      ].forEach(x=>tr.appendChild(html('td','',x)));t.appendChild(tr);
    });
    b.field.appendChild(t);addFragments(b.layer,spec,2);return b.page;
  }
  function timeline(spec,mount,opts){
    const b=base(spec,mount,opts);const y=690;
    b.svg.appendChild(make('line',{class:'relation',x1:90,y1:y,x2:910,y2:y,'marker-end':'url(#mk-triangle)'}));
    const labels=['después','antes','ahora','todavía','ayer+1','causa futura','reinicio'];
    labels.forEach((tx,i)=>{
      const x=110+i*130;b.svg.appendChild(make('line',{class:'grid-line',x1:x,y1:y-90,x2:x,y2:y+100}));
      label(b.svg,x,y+(i%2?145:-120),tx,12,'middle');
      label(b.svg,x,y+8,`${String((i*3+spec.index)%24).padStart(2,'0')}:${String((i*11)%60).padStart(2,'0')}`,8,'middle');
    });
    relation(b.svg,{x:760,y:650},{x:240,y:650},'retroalimentacion',0,-170);
    addFragments(b.layer,spec,5);return b.page;
  }
  function classes(spec,mount,opts){
    const b=base(spec,mount,opts),names=['Nube','Deuda','Animal','Archivo','Frontera','Ruina'];
    names.forEach((name,i)=>{
      const box=html('section','class-box');
      box.style.left=`${7+(i%2)*49}%`;box.style.top=`${12+Math.floor(i/2)*25}%`;box.style.width='38%';box.style.height='19%';
      const h=html('h3','',name);const pre=html('pre','',
`+ estado: ${spec.categories[i%spec.categories.length]}
+ unidad: ${spec.unit}
+ abierto: ${i%2?'sí':'indeterminado'}
—
observar()
deber()
migrar()
corromperLeyenda()`);
      box.append(h,pre);b.layer.appendChild(box);
    });
    addFragments(b.layer,spec,2);return b.page;
  }
  function architecture(spec,mount,opts){
    const b=base(spec,mount,opts);grid(b.svg,125);
    const layers=[
      {y:220,h:150,name:'INTERFAZ / polvo / deseo'},
      {y:440,h:200,name:'SERVICIOS / trabajo / calor'},
      {y:720,h:180,name:'DATOS / memoria / deuda'},
      {y:990,h:150,name:'SOPORTE / cuerpo / ruina'}
    ];
    layers.forEach((l,i)=>{
      b.svg.appendChild(make('rect',{class:`node-shape${i===2?' heavy':''}`,x:110,y:l.y,width:780,height:l.h}));
      label(b.svg,135,l.y+28,l.name,16);
      label(b.svg,135,l.y+l.h-18,spec.nodes[i%spec.nodes.length].label,10);
      if(i<layers.length-1)relation(b.svg,{x:500,y:l.y+l.h},{x:500,y:layers[i+1].y},spec.relations[i%spec.relations.length]);
    });
    for(let i=0;i<16;i++)label(b.svg,80+i*54,1280,i%2?'·':'▓',10,'middle',i*7);
    addFragments(b.layer,spec,3);return b.page;
  }
  function signal(spec,mount,opts){
    const b=base(spec,mount,opts),r=localRng(spec),pts=[],noise=[];
    for(let x=70;x<=930;x+=8){
      const t=(x-70)/860;
      pts.push(`${x},${510+Math.sin(t*22)*70+Math.sin(t*83)*12}`);
      noise.push(`${x},${880+(r()-.5)*260+Math.sin(t*9)*20}`);
    }
    b.svg.appendChild(make('polyline',{class:'signal',points:pts.join(' ')}));
    b.svg.appendChild(make('polyline',{class:'noise',points:noise.join(' ')}));
    label(b.svg,80,390,'SEÑAL / información estimada: 14%',13);
    label(b.svg,80,680,'RUIDO / información no clasificada: 86%',13);
    relation(b.svg,{x:850,y:510},{x:180,y:880},'transmision',0,120);
    addFragments(b.layer,spec,4);return b.page;
  }
  function coordinates(spec,mount,opts){
    const b=base(spec,mount,opts);grid(b.svg,80);
    const origins=[[500,710],[370,830],[640,560]];
    origins.forEach((o,i)=>{
      b.svg.appendChild(make('line',{class:'relation',x1:o[0]-260,y1:o[1],x2:o[0]+260,y2:o[1],'marker-end':'url(#mk-triangle)'}));
      b.svg.appendChild(make('line',{class:'relation',x1:o[0],y1:o[1]+300,x2:o[0],y2:o[1]-300,'marker-end':'url(#mk-triangle)'}));
      label(b.svg,o[0]+10,o[1]-10,`ORIGEN_${i} = (${o[0]-500},${710-o[1]})`,8);
    });
    spec.nodes.slice(0,5).forEach((n,i)=>addNode(b.svg,n,180+i*160,310+(i%2)*610,125,55,i===3));
    addFragments(b.layer,spec,4);return b.page;
  }
  function pseudocode(spec,mount,opts){
    const b=base(spec,mount,opts);
    for(let i=0;i<4;i++){
      const c=html('pre','pseudo-column',spec.fragments[i%spec.fragments.length]+'\n\n'+spec.fragments[(i+2)%spec.fragments.length]);
      c.style.left=`${3+i*24}%`;c.style.transform=`translateY(${(i%2)*8}%) rotate(${i%2?-.6:.5}deg)`;
      b.layer.appendChild(c);
    }
    addFragments(b.layer,spec.slice?spec:{...spec,fragments:spec.fragments.slice(4)},2);return b.page;
  }
  function gloss(spec,mount,opts){
    const b=base(spec,mount,opts);
    const main=addNode(b.svg,spec.nodes[0],500,590,560,260,true);
    spec.nodes.slice(1,6).forEach((n,i)=>{
      const x=i%2?820:180,y=250+i*190;
      const nn=addNode(b.svg,n,x,y,180,62);
      relation(b.svg,nn,main,i%2?'contradiccion':'observacion',0,i%2?80:-80);
    });
    const band=html('div','gloss-band');
    band.append(...spec.fragments.slice(0,4).map(x=>html('span','',x.replace(/\n/g,' / '))));
    b.field.appendChild(band);return b.page;
  }
  function indexPage(spec,mount,opts){
    const b=base(spec,mount,opts),list=html('div','index-list');
    for(let i=0;i<26;i++){
      const row=html('div','index-entry');
      row.append(html('span','',`${String(i+1).padStart(2,'0')}. ${spec.nodes[i%spec.nodes.length].label}`),
        html('span','dots',''),html('span','',String(spec.total+spec.index+i*3)));
      list.appendChild(row);
    }
    b.field.appendChild(list);addFragments(b.layer,spec,2);return b.page;
  }
  function errorPage(spec,mount,opts){
    const b=base(spec,mount,opts);
    const code=html('div','error-code',String(400+((spec.index*17+spec.loop*31)%199)));
    const msg=html('pre','error-message',
`EL MODELO RECIBIÓ:
${spec.nodes[0].label}

PERO EL CONTENEDOR ESPERABA:
${spec.nodes[1].label}

conocimiento_adquirido = diferencia;
reintento = ${spec.index+1};`);
    b.layer.append(code,msg);addFragments(b.layer,spec,2);return b.page;
  }
  function overflow(spec,mount,opts){
    const b=base(spec,mount,opts),r=localRng(spec);
    for(let i=0;i<14;i++){
      const n=spec.nodes[i%spec.nodes.length];
      const x=-140+r()*1280,y=40+r()*1320;
      const nn=addNode(b.svg,n,x,y,180+r()*280,50+r()*160,i%5===0);
      if(i>0)relation(b.svg,{x:-100+r()*1200,y:r()*1414},nn,spec.relations[i%spec.relations.length],0,(r()-.5)*300);
    }
    addFragments(b.layer,spec,7);return b.page;
  }


  function registry(spec,mount,opts){
    const b=base(spec,mount,opts);
    const registry=html('section','html-registry');
    const head=html('div','registry-row registry-head');
    ['ID','CAMPO','OBJETO','ESTADO','UNIDAD IMPOSIBLE'].forEach(x=>head.appendChild(html('span','registry-cell',x)));
    registry.appendChild(head);
    for(let i=0;i<12;i++){
      const n=spec.nodes[i%spec.nodes.length];
      const row=html('div',`registry-row${i%4===3?' registry-alert':''}`);
      [
        `${spec.loop}.${String(spec.index).padStart(2,'0')}.${String(i).padStart(2,'0')}`,
        n.cat,
        n.label,
        i%3===0?'NO CONECTA':i%3===1?'EN DEMORA':'OBSERVADO',
        C.syntax.units[(i+spec.index)%C.syntax.units.length]
      ].forEach(x=>row.appendChild(html('span','registry-cell',x)));
      registry.appendChild(row);
    }
    b.field.appendChild(registry);
    addFragments(b.layer,spec,2);
    return b.page;
  }

  function windows(spec,mount,opts){
    const b=base(spec,mount,opts);
    const desktop=html('section','html-windows');
    for(let i=0;i<6;i++){
      const pane=html('article',`system-window window-${i+1}`);
      const bar=html('header','window-bar');
      bar.append(html('span','window-id',`proc_${String(i+1).padStart(2,'0')}`),html('span','window-state',i%2?'sin exterior':'ejecutando'));
      const body=html('div','window-body');
      body.append(
        html('h3','window-title',spec.nodes[i%spec.nodes.length].label),
        html('pre','window-code',spec.fragments[i%spec.fragments.length]),
        html('div','window-result',`resultado → ${spec.nodes[(i+2)%spec.nodes.length].label}`)
      );
      pane.append(bar,body);desktop.appendChild(pane);
    }
    b.field.appendChild(desktop);
    return b.page;
  }

  function protocolgrid(spec,mount,opts){
    const b=base(spec,mount,opts);
    const gridEl=html('section','protocol-grid');
    for(let i=0;i<16;i++){
      const cell=html('article',`protocol-cell${i%5===0?' protocol-breach':''}`);
      cell.style.setProperty('--cell-delay',`${i*.055}s`);
      cell.append(
        html('span','protocol-step',String(i+1).padStart(2,'0')),
        html('strong','protocol-command',i%4===0?'OBSERVAR':i%4===1?'MEDIR':i%4===2?'CONECTAR':'PERDER'),
        html('p','protocol-object',spec.nodes[i%spec.nodes.length].label),
        html('small','protocol-result',i%3===0?'→ misma salida':i%3===1?'→ nodo ausente':'→ continúa')
      );
      gridEl.appendChild(cell);
    }
    b.field.appendChild(gridEl);
    addFragments(b.layer,spec,2);
    return b.page;
  }

  function marginsystem(spec,mount,opts){
    const b=base(spec,mount,opts);
    const margin=html('aside','dominant-margin');
    margin.append(
      html('div','margin-number',String(spec.index+1).padStart(3,'0')),
      html('h2','margin-title','LA NOTA MARGINAL TOMÓ EL SISTEMA'),
      html('pre','margin-text',spec.fragments.join('\n\n— — —\n\n'))
    );
    const main=html('section','subordinate-system');
    for(let i=0;i<5;i++){
      const item=html('div','subordinate-item');
      item.append(html('span','sub-id',`N${i}`),html('span','sub-body',spec.nodes[i%spec.nodes.length].label));
      main.appendChild(item);
    }
    b.field.append(margin,main);
    relation(b.svg,{x:780,y:240},{x:320,y:1110},'contradiccion',0,180);
    return b.page;
  }


  const renderers={causal,decision,circuit,flow,network,weather,memory,table,timeline,classes,architecture,signal,coordinates,pseudocode,gloss,index:indexPage,error:errorPage,overflow,registry,windows,protocolgrid,marginsystem};

  function render(spec,mount,opts={}){
    mount.textContent='';
    const renderer=renderers[spec.family]||causal;
    return renderer(spec,mount,opts);
  }

  function makeLegend(container,integrity=100,seed='legend'){
    container.textContent='';
    container.appendChild(html('div','legend-title','función de flecha'));
    const r=window.WorldRng.make(seed);
    Object.entries(C.relations).forEach(([key,v],i)=>{
      const row=html('div','legend-row');
      const line=html('span','legend-sample');
      line.style.borderTopStyle=v.dash?'dashed':'solid';
      const labelText=integrity<60&&r()>(integrity/100)?C.relations[Object.keys(C.relations)[(i+3)%Object.keys(C.relations).length]].label:v.label;
      row.append(line,html('span','',labelText));
      if(integrity<80&&r()>.5){
        row.classList.add('corrupt');
        row.style.setProperty('--corrupt-x',`${(r()-.5)*16}px`);
        row.style.setProperty('--corrupt-r',`${(r()-.5)*8}deg`);
        row.style.setProperty('--corrupt-o',`${.35+r()*.6}`);
      }
      container.appendChild(row);
    });
  }

  window.WorldDiagrams={render,makeLegend};
})();
