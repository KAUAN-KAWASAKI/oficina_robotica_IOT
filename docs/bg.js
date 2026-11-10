// Fundo 3D (canvas, sem bibliotecas): braço robótico em wireframe, piso em grade e rede de nós.
(function(){
  const cv=document.getElementById("bg"); if(!cv) return;
  const ctx=cv.getContext("2d"); let W,H,S,dpr,CX;
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G="61,220,151";
  function size(){dpr=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);S=Math.min(W,H*1.2)/5.2;CX=W>900?W*0.78:W/2}
  addEventListener("resize",size);size();
  let yaw=0,pitch=-0.42;
  function cam(p){ // gira em Y, inclina em X, projeta
    let x=p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw), z=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw), y=p[1];
    const y2=y*Math.cos(pitch)-z*Math.sin(pitch), z2=y*Math.sin(pitch)+z*Math.cos(pitch);
    const d=z2+9, k=9/Math.max(d,.5);
    return [CX+x*S*k*0.55, H*0.72-y2*S*k*0.55, d];
  }
  const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]};
  function line(a,b,al,lw){const p=cam(a),q=cam(b);ctx.globalAlpha=al;ctx.lineWidth=lw||1;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke()}
  function link(a,b,w){
    const d=norm(sub(b,a)); let r=Math.abs(d[1])>.9?[1,0,0]:[0,1,0];
    const u=mul(norm(cross(d,r)),w), v=mul(norm(cross(d,u)),w);
    const c=[[1,1],[1,-1],[-1,-1],[-1,1]].map(s=>add(mul(u,s[0]),mul(v,s[1])));
    for(let i=0;i<4;i++){const j=(i+1)%4;
      line(add(a,c[i]),add(a,c[j]),.9,1.4);line(add(b,c[i]),add(b,c[j]),.9,1.4);line(add(a,c[i]),add(b,c[i]),.9,1.4)}
  }
  function joint(p,r){const q=cam(p);ctx.globalAlpha=.95;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(q[0],q[1],r*S*9/q[2]*.55,0,7);ctx.stroke()}
  const nodes=Array.from({length:34},()=>({p:[(Math.random()-.5)*12,Math.random()*5,(Math.random()-.5)*12],v:[(Math.random()-.5)*.004,(Math.random()-.5)*.004,(Math.random()-.5)*.004]}));
  function frame(t){
    t*=0.001; ctx.setTransform(dpr,0,0,dpr,0,0);
    const g=ctx.createRadialGradient(W/2,H*.5,0,W/2,H*.5,Math.max(W,H)*.8);g.addColorStop(0,"#0b2a24");g.addColorStop(1,"#030907");
    ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    yaw=reduce?0.5:0.5+Math.sin(t*0.12)*0.6; ctx.strokeStyle="rgb("+G+")";
    // piso
    for(let i=-6;i<=6;i++){const a=Math.max(0,.3-Math.abs(i)*.04);line([i,0,-6],[i,0,6],a);line([-6,0,i],[6,0,i],a)}
    // nós
    nodes.forEach(n=>{if(!reduce)for(let k=0;k<3;k++){n.p[k]+=n.v[k];if(Math.abs(n.p[k]-(k==1?2.5:0))>(k==1?3:6))n.v[k]*=-1}});
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const d=Math.hypot(...sub(nodes[i].p,nodes[j].p)); if(d<3)line(nodes[i].p,nodes[j].p,(1-d/3)*.35)}
    nodes.forEach(n=>{const q=cam(n.p);ctx.globalAlpha=.6;ctx.fillStyle="rgb("+G+")";ctx.fillRect(q[0]-1.5,q[1]-1.5,3,3)});
    // braço: base, ombro, cotovelo, punho
    const a0=reduce?0.4:t*0.5, e1=1.15+Math.sin(t*.8)*.3, e2=e1-(1.3+Math.sin(t*1.1+1)*.4), e3=e2-(.5+Math.sin(t*1.6)*.4);
    const dir=(az,el)=>[Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az)];
    const P0=[0,0,0],P1=[0,.7,0],P2=add(P1,mul(dir(a0,e1),2)),P3=add(P2,mul(dir(a0,e2),1.7)),P4=add(P3,mul(dir(a0,e3),.8));
    link(P0,P1,.55);link(P1,P2,.2);link(P2,P3,.17);link(P3,P4,.12);
    [P1,P2,P3].forEach(p=>joint(p,.22));
    // pinça
    const s=norm(cross(sub(P4,P3),[0,1,0])),open=.12+.1*Math.sin(t*3);
    link(P4,add(add(P4,mul(norm(sub(P4,P3)),.35)),mul(s,open)),.04);
    link(P4,add(add(P4,mul(norm(sub(P4,P3)),.35)),mul(s,-open)),.04);
    ctx.globalAlpha=1;
    if(!reduce&&!document.hidden) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!reduce)requestAnimationFrame(frame)});
})();
