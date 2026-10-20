/** Decorative home film. Content and navigation remain in ordinary HTML. */
export const SYNAPTIC_OPENING_DURATION = 6400;

/** Milliseconds of visible, unpaused wall time; frame stamps never move back. */
export function advanceOpeningClock(elapsed, last, observed, fallback = globalThis.performance?.now()) {
  const previous = Number.isFinite(last) ? last : 0;
  const measured = Number.isFinite(observed) ? observed : fallback;
  const stamp = Number.isFinite(measured) ? Math.max(previous, measured) : previous;
  const start = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  const next = Math.min(SYNAPTIC_OPENING_DURATION, start + stamp - previous);
  return { elapsed: next, stamp, complete: next >= SYNAPTIC_OPENING_DURATION };
}

export function createSynapticOpening(canvas, options = {}) {
  let ctx;
  try { ctx = canvas.getContext('2d'); } catch { return null; }
  if (!ctx) return null;
  const duration = SYNAPTIC_OPENING_DURATION;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = value => { value = clamp(value); return value * value * (3 - 2 * value); };
  let elapsed = duration;
  let width = 0, height = 0, scale = 1;
  let last = 0, paintedAt = 0, frame = 0;
  let active = false, paused = false, disposed = false;
  let pointer = { x: 0, y: 0 };

  let seed=7341;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const branches=[];
  const cubic=(a,b,c,d,t)=>{const s=1-t;return a*s*s*s+3*b*s*s*t+3*c*s*t*t+d*t*t*t;};
  for(let side=-1;side<=1;side+=2){
    for(let j=0;j<28;j++){
      const theta=(j/28)*Math.PI*2;
      const reach=1.6+random()*1.7;
      const endY=Math.sin(theta)*(.64+random()*.6);
      const endZ=Math.cos(theta)*(.5+random()*.4);
      const fiber=[];
      for(let i=0;i<=24;i++){
        const t=i/24;
        const x=cubic(side*reach,side*(1.7+random()*.08),side*.48,side*.23,t);
        const y=cubic(endY*1.7,endY,endY*.65,Math.sin(theta)*.44,t);
        const z=cubic(endZ*1.8,endZ*1.1,endZ*.6,Math.cos(theta)*.38,t);
        const lane=(j-13.5)/28;
        const xx=(t-.5)*2.35;
        const yy=xx*(j%2?1:-1)*.92+lane*.085;
        fiber.push({x,y,z,tx:xx,ty:yy,tz:lane*.15,side,j,t});
      }
      branches.push({points:fiber,side,j,depth:endZ});
    }
  }
  branches.sort((a,b)=>b.depth-a.depth);
  const membranes=[];
  for(let side=-1;side<=1;side+=2){
    for(let row=0;row<17;row++){
      const latitude=(row+1)/18*Math.PI;
      const ring=[];
      for(let i=0;i<=46;i++){
        const angle=i/46*Math.PI*2;
        const organic=1+.065*Math.sin(angle*5+row*.52)+.035*Math.cos(angle*9-row*.6);
        ring.push({x:side*.77+Math.sin(latitude)*Math.cos(angle)*.54*organic,y:Math.cos(latitude)*.82*organic,z:Math.sin(latitude)*Math.sin(angle)*.63*organic});
      }
      membranes.push({points:ring,row,side});
    }
  }
  const dust=Array.from({length:100},()=>({x:(random()-.5)*8,y:(random()-.5)*5,z:random()*4-1.5,r:random()*.9+.3}));
  const pulses=Array.from({length:26},(_,i)=>({phase:i/26,y:(random()-.5)*.62,z:(random()-.5)*.6,curve:(random()-.5)*.55}));
  function project(p,time,morph=0){
    let x=p.x,y=p.y,z=p.z;
    if(p.tx!==undefined){x=x*(1-morph)+p.tx*morph;y=y*(1-morph)+p.ty*morph;z=z*(1-morph)+p.tz*morph;}
    const rotateY=-.28+ease(time/3100)*.4+pointer.x*.025;
    const rotateX=-.1+pointer.y*.02;
    const xx=x*Math.cos(rotateY)+z*Math.sin(rotateY);
    let zz=-x*Math.sin(rotateY)+z*Math.cos(rotateY);
    const yy=y*Math.cos(rotateX)-zz*Math.sin(rotateX);
    zz=y*Math.sin(rotateX)+zz*Math.cos(rotateX);
    const zoom=.76+ease(time/2500)*.3-ease((time-5100)/1300)*.2;
    const depth=4.3/(4.3+zz);
    const finalY=elapsed>=duration?height*.37:height*.46;
    return{x:width*.5+xx*scale*zoom*depth+pointer.x*5,y:finalY+yy*scale*zoom*depth+pointer.y*4,depth,z:zz};
  }
  function glow(x,y,r,alpha,tint='copper'){
    if(r<=0||alpha<=0)return;
    const grad=ctx.createRadialGradient(x,y,0,x,y,r);
    if(tint==='blue'){grad.addColorStop(0,'rgba(182,221,228,'+alpha+')');grad.addColorStop(.14,'rgba(103,171,189,'+(alpha*.6)+')');grad.addColorStop(1,'rgba(42,107,135,0)');}
    else{grad.addColorStop(0,'rgba(255,239,209,'+alpha+')');grad.addColorStop(.13,'rgba(230,183,137,'+(alpha*.75)+')');grad.addColorStop(1,'rgba(178,110,72,0)');}
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  function line(points,time,morph,alpha,color,widthLine=1){
    ctx.beginPath();points.forEach((point,index)=>{const p=project(point,time,morph);if(index)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=widthLine;ctx.stroke();ctx.globalAlpha=1;
  }
  function paint(time){
    if(!ctx||!width)return;
    if(!Number.isFinite(time))throw new TypeError('A vinheta precisa de um instante finito.');
    time=clamp(time,0,duration);
    const opening=ease(time/850);
    const morph=ease((time-3800)/1650);
    const closure=ease((time-5200)/1000);
    const fieldOpacity=(1-closure)*opening;
    ctx.clearRect(0,0,width,height);
    const dark=ctx.createRadialGradient(width*.5,height*.45,0,width*.5,height*.45,width*.7);
    dark.addColorStop(0,'#0b2836');dark.addColorStop(.5,'#051927');dark.addColorStop(1,'#010b14');ctx.fillStyle=dark;ctx.fillRect(0,0,width,height);
    ctx.globalAlpha=opening;
    dust.forEach((d,i)=>{const p=project(d,time);ctx.fillStyle=i%7===0?'#dfc3a4':'#6d9ba8';ctx.globalAlpha=(.12+(i%5)*.035)*opening*(1-closure*.7);ctx.beginPath();ctx.arc(p.x,p.y,d.r*p.depth,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    const connect=ease((time-1300)/1500);
    if(morph<.99){
      for(const side of [-1,1]){
        const p=project({x:side*.77,y:0,z:.15},time);
        const rx=scale*.55*p.depth,ry=scale*.84*p.depth;
        ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,ry/rx);
        const body=ctx.createRadialGradient(-side*rx*.24,-rx*.2,2,0,0,rx);
        body.addColorStop(0,side<0?'#b9936a18':'#88b6bd16');body.addColorStop(.6,side<0?'#cba07118':'#78acbb17');body.addColorStop(.87,'#224b5828');body.addColorStop(1,'#497b8211');ctx.globalAlpha=fieldOpacity*(1-morph);ctx.fillStyle=body;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;
        glow(p.x-side*rx*.25,p.y-rx*.18,rx*1.5,.1*fieldOpacity*(1-morph),side<0?'copper':'blue');
      }
      membranes.forEach(ring=>line(ring.points,time,0,(ring.row%4===0?.23:.085)*fieldOpacity*(1-morph),ring.side<0?'#d4b08a':'#8cb6bf',ring.row%4===0?.8:.45));
    }
    if(closure>.05)branches.forEach((branch,index)=>line(branch.points,time,0,closure*(index%5===0?.11:.04),'#6f989f',index%5===0?.85:.45));
    branches.forEach((branch,index)=>{
      const prominent=index%5===0;
      const alpha=(prominent?.64:.2)*fieldOpacity;
      line(branch.points,time,morph,alpha,branch.side<0?'#cea17b':'#9ebdc1',prominent?1.35:.65);
      if(prominent){
        line(branch.points,time,morph,alpha*.14,branch.side<0?'#e8bb8c':'#b4d4d6',5.8);
        const travel=((time/2300+index*.117)%1+1)%1;
        const pointIndex=Math.min(branch.points.length-1,Math.floor(travel*branch.points.length));
        const pos=branch.points[pointIndex];
        const p=project(pos,time,morph);
        glow(p.x,p.y,12*p.depth,.62*fieldOpacity);
        ctx.globalAlpha=.95*fieldOpacity;ctx.fillStyle='#ffe8c9';ctx.beginPath();ctx.arc(p.x,p.y,1.4*p.depth,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      }
      if(index%3===0)branch.points.forEach((point,i)=>{if(i%6)return;const p=project(point,time,morph);ctx.globalAlpha=.36*fieldOpacity;ctx.fillStyle='#d4c4ac';ctx.beginPath();ctx.arc(p.x,p.y,.7*p.depth,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;});
    });
    if(connect>0&&morph<.98){
      pulses.forEach((pulse,i)=>{
        const phase=((time-1250)/1120+pulse.phase)%1;
        if(phase<0)return;
        const p=project({x:-.24+phase*.48,y:pulse.y+Math.sin(phase*Math.PI)*pulse.curve,z:pulse.z+Math.sin(phase*5)*.04},time);
        const strength=Math.sin(phase*Math.PI)*connect*(1-morph)*opening;
        glow(p.x,p.y,(i%3===0?17:10)*p.depth,.7*strength,i%4===0?'blue':'copper');
        ctx.fillStyle='#f9e5c4';ctx.globalAlpha=.9*strength;ctx.beginPath();ctx.arc(p.x,p.y,(i%3===0?1.9:1.1)*p.depth,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      });
      const pulseWave=.5+.5*Math.sin((time-1300)/230);
      const receiver=project({x:.28,y:.03,z:0},time);
      glow(receiver.x,receiver.y,scale*.55,(.09+pulseWave*.06)*connect*(1-morph),'blue');
    }
    if(time>850&&time<3700){
      const opacity=ease((time-850)/500)*(1-ease((time-2900)/700))*.35;
      const fragments=[{x:-2.05,y:-.9,z:.1,label:'·  · —  ·'},{x:1.85,y:.94,z:.65,label:'— ·  · —'},{x:-1.8,y:.95,z:-.7,label:'· —  ·  ·'},{x:1.65,y:-.9,z:-.25,label:'·  · —'}];
      fragments.forEach(f=>{const p=project(f,time);ctx.globalAlpha=opacity;ctx.fillStyle='#bfbcab';ctx.font='11px Arial';ctx.fillText(f.label,p.x,p.y);});ctx.globalAlpha=1;
    }
    if(morph>.02){const center=project({x:0,y:0,z:0},time);glow(center.x,center.y,scale*.85,.075*morph*(1-closure));}
    options.onFrame?.({ elapsed: time, progress: time / duration, brandOpacity: ease((time - 5600) / 800) });
    const fade=1-opening;
    if(fade>.001){ctx.fillStyle='rgba(1,8,16,'+fade+')';ctx.fillRect(0,0,width,height);}
  }


  function cancelFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function paintSafely() {
    try { paint(elapsed); return true; }
    catch (error) {
      active = false;
      cancelFrame();
      options.onError?.(error);
      return false;
    }
  }
  function schedule() {
    if (!disposed && active && !paused && !frame) frame = requestAnimationFrame(tick);
  }
  function tick(observed) {
    frame = 0;
    if (disposed || !active || paused) return;
    const clock = advanceOpeningClock(elapsed, last, observed, performance.now());
    last = clock.stamp;
    elapsed = clock.elapsed;
    if (last - paintedAt >= 30 || clock.complete) {
      if (!paintSafely()) return;
      paintedAt = last;
    }
    if (clock.complete) {
      active = false;
      options.onComplete?.();
      return;
    }
    schedule();
  }
  function resize() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    scale = Math.min(width, height) * .31;
    const ratio = Math.min(globalThis.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    paintSafely();
  }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  if (!observer) window.addEventListener('resize', resize);

  return {
    get elapsed() { return elapsed; },
    play() {
      if (disposed) return;
      cancelFrame();
      elapsed = 0;
      last = performance.now();
      paintedAt = last;
      pointer = { x: 0, y: 0 };
      paused = false;
      active = true;
      resize();
      schedule();
    },
    pause() { paused = true; cancelFrame(); },
    resume() {
      if (disposed || elapsed >= duration) return;
      paused = false;
      active = true;
      last = performance.now();
      schedule();
    },
    finish() {
      if (disposed) return;
      cancelFrame();
      active = false;
      paused = false;
      elapsed = duration;
      resize();
    },
    setPointer(x, y) {
      if (disposed || paused) return;
      pointer = { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
      if (!active) paintSafely();
    },
    resize,
    destroy() {
      disposed = true;
      active = false;
      cancelFrame();
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', resize);
    },
  };
}
