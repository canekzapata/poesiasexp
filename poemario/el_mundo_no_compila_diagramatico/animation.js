
'use strict';

(function(){
  class BookAnimator{
    constructor(){
      const params=new URLSearchParams(location.search);
      this.seed=params.get('seed')||`mundo-${Date.now().toString(36)}`;
      this.engine=new WorldEngine(this.seed);
      this.stage=document.querySelector('#stage');
      this.book=document.querySelector('#book');
      this.residueLayer=document.querySelector('#residue-layer');
      this.legend=document.querySelector('#legend');
      this.status=document.querySelector('#loop-status');
      this.pauseBtn=document.querySelector('#pause-btn');
      this.fullBtn=document.querySelector('#full-btn');
      this.seedInput=document.querySelector('#seed-input');
      this.seedInput.value=this.seed;
      this.paused=false;
      this.timer=null;
      this.deadline=0;
      this.remaining=0;
      this.current=null;
      this.updateViewport();
      this.bind();
      this.show();
    }
    bind(){
      document.querySelector('#next-btn').addEventListener('click',()=>this.next());
      document.querySelector('#regen-btn').addEventListener('click',()=>this.regenerate());
      document.querySelector('#print-btn').addEventListener('click',()=>this.printEdition());
      this.fullBtn.addEventListener('click',()=>this.toggleFullscreen());
      this.pauseBtn.addEventListener('click',()=>this.togglePause());
      this.seedInput.addEventListener('change',()=>this.regenerate(this.seedInput.value.trim()));
      addEventListener('keydown',e=>{
        if(e.target.matches('input'))return;
        if(e.code==='Space'){e.preventDefault();this.togglePause()}
        else if(e.key==='ArrowRight'){e.preventDefault();this.next()}
        else if(e.key.toLowerCase()==='r'){this.regenerate()}
        else if(e.key.toLowerCase()==='p'){this.printEdition()}
        else if(e.key.toLowerCase()==='f'){this.toggleFullscreen()}
      });
      addEventListener('resize',()=>this.updateViewport(),{passive:true});
      document.addEventListener('fullscreenchange',()=>{
        this.fullBtn.textContent=document.fullscreenElement?'×':'⛶';
        this.updateViewport();
      });
      document.addEventListener('visibilitychange',()=>{if(document.hidden&&!this.paused)this.togglePause()});
    }
    updateViewport(){
      const vv=window.visualViewport;
      const width=vv?vv.width:window.innerWidth;
      const height=vv?vv.height:window.innerHeight;
      document.documentElement.style.setProperty('--viewport-w',`${width}px`);
      document.documentElement.style.setProperty('--viewport-h',`${height}px`);
      document.body.dataset.orientation=width>=height?'landscape':'portrait';
      document.body.dataset.screen=width>1600?'wide':width<720?'compact':'standard';
    }
    async toggleFullscreen(){
      try{
        if(!document.fullscreenElement){
          await document.documentElement.requestFullscreen?.({navigationUI:'hide'});
        }else{
          await document.exitFullscreen?.();
        }
      }catch(error){
        this.fullBtn.textContent='!';
        setTimeout(()=>this.fullBtn.textContent='⛶',900);
      }
    }
    schedule(ms){
      clearTimeout(this.timer);
      this.remaining=ms;
      this.deadline=performance.now()+ms;
      if(!this.paused)this.timer=setTimeout(()=>this.next(),ms);
    }
    animatePaths(page){
      requestAnimationFrame(()=>{
        page.querySelectorAll('.relation').forEach((path,i)=>{
          if(typeof path.getTotalLength!=='function')return;
          let len=0;try{len=path.getTotalLength()}catch(e){return}
          if(!Number.isFinite(len)||len<=0)return;
          path.style.strokeDasharray=`${len} ${len}`;
          path.style.strokeDashoffset=String(len);
          const speed=parseFloat(path.dataset.speed||1);
          path.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{
            duration:Math.max(900,2600*speed),delay:180+i*95,fill:'forwards',easing:'steps(18,end)'
          });
        });
      });
    }
    harvest(spec,page){
      const candidates=[...page.querySelectorAll('.fragment,.relation-label,.node-label,.monument')];
      const amount=Math.max(1,Math.round(candidates.length*(.05+Math.random()*.10)));
      for(let i=0;i<amount;i++){
        const src=candidates[Math.floor(Math.random()*candidates.length)];
        if(!src)continue;
        const item=document.createElement('div');
        item.className='residue-item';
        item.textContent=(src.textContent||'').trim().slice(0,150);
        item.style.left=`${Math.random()*91}%`;item.style.top=`${Math.random()*94}%`;
        item.style.setProperty('--rr',`${(Math.random()-.5)*12}deg`);
        this.residueLayer.appendChild(item);
        this.engine.state.residues.push(item.textContent);
      }
      const max=46;
      while(this.residueLayer.children.length>max)this.residueLayer.firstElementChild.remove();
    }
    show(){
      const spec=this.engine.pageSpec();
      if(this.current){
        this.current.classList.add('ghost');
        this.current.style.setProperty('--ghost-x',`${(Math.random()-.5)*10}px`);
        this.current.style.setProperty('--ghost-y',`${(Math.random()-.5)*10}px`);
        setTimeout(()=>this.current&&this.current.classList.contains('ghost')&&this.current.remove(),2500);
      }
      const holder=document.createElement('div');
      holder.style.position='absolute';holder.style.inset='0';
      this.stage.appendChild(holder);
      const page=WorldDiagrams.render(spec,holder);
      this.current=page;
      [...this.stage.children].filter(x=>x!==holder).forEach(x=>setTimeout(()=>x.remove(),2600));
      WorldDiagrams.makeLegend(this.legend,spec.legendIntegrity,`${spec.seed}:legend`);
      this.animatePaths(page);
      setTimeout(()=>this.harvest(spec,page),Math.min(3200,spec.duration*.48));
      this.status.textContent=`vuelta ${spec.loop+1} · composición ${spec.index+1}/${spec.total} · mundo sin representar ${spec.worldUnrepresented.toFixed(1)}%`;
      this.schedule(spec.duration);
    }
    next(){
      clearTimeout(this.timer);
      if(this.engine.page>=this.engine.loopLength)this.transitionLoop();
      else this.show();
    }
    transitionLoop(){
      const end=this.engine.endLoop();
      const overlay=document.createElement('div');
      overlay.className='unresolved-overlay';
      const pre=document.createElement('pre');
      const varEl=document.createElement('div');varEl.className='variable';varEl.textContent=end.unresolved;
      pre.textContent=`while (mundo !== mundo_modelado) {\n    observar();\n    diagramar();\n    perder_algo();\n}\n\nVARIABLE NO RESUELTA:`;
      pre.appendChild(varEl);
      const note=document.createTextNode(`\n\nresiduo conservado: ${(end.keepRatio*100).toFixed(1)}%\nla portada será contaminada`);
      pre.appendChild(note);overlay.appendChild(pre);
      this.stage.appendChild(overlay);
      this.book.classList.add('flash');
      this.status.textContent=`reinicio incompleto · ${end.unresolved}`;
      setTimeout(()=>this.book.classList.remove('flash'),700);
      this.schedule(6500);
      clearTimeout(this.timer);
      if(!this.paused)this.timer=setTimeout(()=>{
        overlay.remove();
        this.engine.nextLoop();
        this.show();
      },6500);
    }
    togglePause(){
      this.paused=!this.paused;
      this.book.classList.toggle('paused',this.paused);
      this.pauseBtn.textContent=this.paused?'▶':'II';
      if(this.paused){
        this.remaining=Math.max(0,this.deadline-performance.now());
        clearTimeout(this.timer);
        document.getAnimations().forEach(a=>a.pause());
      }else{
        document.getAnimations().forEach(a=>a.play());
        this.schedule(this.remaining||1000);
      }
    }
    regenerate(seed){
      clearTimeout(this.timer);
      this.seed=seed||`mundo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
      this.seedInput.value=this.seed;
      history.replaceState(null,'',`${location.pathname}?seed=${encodeURIComponent(this.seed)}`);
      this.engine=new WorldEngine(this.seed);
      this.stage.textContent='';this.residueLayer.textContent='';
      this.paused=false;this.book.classList.remove('paused');this.pauseBtn.textContent='II';
      this.show();
    }
    printEdition(){
      clearTimeout(this.timer);
      const printBook=document.querySelector('#print-book');
      printBook.textContent='';
      const clone=new WorldEngine(this.seed);
      const total=clone.loopLength;
      for(let i=0;i<total;i++){
        const wrap=document.createElement('div');wrap.className='print-page';
        WorldDiagrams.render(clone.pageSpec(),wrap,{print:true});
        printBook.appendChild(wrap);
      }
      const wasPaused=this.paused;
      if(!wasPaused)this.togglePause();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        window.print();
        if(!wasPaused)setTimeout(()=>this.togglePause(),100);
      }));
    }
  }
  addEventListener('DOMContentLoaded',()=>{window.worldBook=new BookAnimator()});
})();
