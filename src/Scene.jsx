import {useEffect,useRef} from 'react'
import * as THREE from 'three'
import {fx} from './fx'
import {mob,touch,reduce} from './env'

const rnd=i=>{const s=Math.sin(i*127.1)*43758.5453;return s-Math.floor(s)}

export default function Scene(){
  const ref=useRef()
  useEffect(()=>{
    const cv=ref.current;let R
    try{R=new THREE.WebGLRenderer({canvas:cv,antialias:!mob,alpha:true})}catch{return}
    const N=mob?90:210,S=new THREE.Scene(),C=new THREE.PerspectiveCamera(50,1,.1,100),G=new THREE.Group()
    C.position.z=10;S.add(G);R.setPixelRatio(Math.min(devicePixelRatio,mob?1.5:2))
    const sh=[
      i=>{const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*2.39996;return[Math.cos(a)*r*3,y*3,Math.sin(a)*r*3]},
      i=>{const t=i/N*18.85,k=i%2?1:.55,r=(2+Math.cos(t*1.5))*1.1*k;return[Math.cos(t)*r,Math.sin(t)*r,Math.sin(t*1.5)*1.3]},
      i=>{const c=Math.ceil(Math.sqrt(N*1.6)),x=i%c,y=Math.floor(i/c);return[(x/c-.5)*7,(.5-y/(N/c))*4.4,(i%3)*.4-.4]},
      i=>{const l=i%2,a=rnd(i)*6.28,b=Math.acos(2*rnd(i+9)-1),r=1.3+rnd(i+3)*.4;return[Math.sin(b)*Math.cos(a)*r+(l?1.9:-1.9),Math.cos(b)*r+(l?-1.3:1.3),Math.sin(b)*Math.sin(a)*r]},
      i=>{const c=i%7;return[(c-3),rnd(i)*(c+1)*.6-2.2,(rnd(i+5)-.5)*.8]},
      i=>{const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*2.39996;return[Math.cos(a)*r*3.3,y*3.3,Math.sin(a)*r*3.3]}]
    const cur=new Float32Array(N*3),tgt=new Float32Array(N*3),disp=new Float32Array(N*3)
    const place=s=>{for(let i=0;i<N;i++)tgt.set(sh[s](i),i*3)}
    place(fx.stage);cur.set(tgt)
    const pairs=[]
    for(let i=0;i<N;i++){const a=sh[0](i),ds=[];for(let j=0;j<N;j++)if(j!==i){const b=sh[0](j);ds.push([(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2,j])}ds.sort((p,q)=>p[0]-q[0]);pairs.push([i,ds[0][1]],[i,ds[1][1]])}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(disp,3))
    const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0x5ef2d6,size:mob?.07:.09,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}))
    const lp=new Float32Array(pairs.length*6),lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3))
    G.add(pts,new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x8b7bff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false})))
    let stage=fx.stage,gx=0,drag=false,lx=0,vis=true,raf
    fx.setStage=s=>{stage=s;place(s)}
    const rs=()=>{R.setSize(innerWidth,innerHeight,false);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()};rs()
    const hero=document.querySelector('.hero')
    const down=e=>{drag=true;lx=e.clientX;fx.pulse=.2},up=()=>drag=false
    const move=e=>{if(drag){G.rotation.y+=(e.clientX-lx)*.01;lx=e.clientX}}
    const vc=()=>vis=!document.hidden
    addEventListener('resize',rs);addEventListener('pointerup',up);addEventListener('pointermove',move)
    hero?.addEventListener('pointerdown',down);document.addEventListener('visibilitychange',vc)
    const tick=()=>{raf=requestAnimationFrame(tick);if(!vis)return
      const mxw=fx.mx*6,myw=fx.my*3.4
      for(let i=0;i<N*3;i+=3){
        for(let k=0;k<3;k++)cur[i+k]+=(tgt[i+k]-cur[i+k])*.055
        let x=cur[i],y=cur[i+1]
        if(!touch){const dx=x+G.position.x-mxw,dy=y-myw,d=Math.hypot(dx,dy);if(d<1.8){const f=(1.8-d)/1.8*.7;x+=dx/(d||1)*f;y+=dy/(d||1)*f}}
        disp[i]=x;disp[i+1]=y;disp[i+2]=cur[i+2]}
      pg.attributes.position.needsUpdate=true
      for(let p=0;p<pairs.length;p++){const a=pairs[p][0]*3,b=pairs[p][1]*3,o=p*6;lp[o]=disp[a];lp[o+1]=disp[a+1];lp[o+2]=disp[a+2];lp[o+3]=disp[b];lp[o+4]=disp[b+1];lp[o+5]=disp[b+2]}
      lg.attributes.position.needsUpdate=true
      fx.vel*=.92;fx.pulse*=.93
      const flat=stage>=2&&stage<=4
      if(flat){const t=Math.round(G.rotation.y/6.2832)*6.2832+fx.mx*.35;G.rotation.y+=(t-G.rotation.y)*.05}
      else if(!drag)G.rotation.y+=(reduce?0:.0025+fx.vel*.00003)+fx.mx*.0006
      G.rotation.x+=((flat?.1:0)+fx.my*.25-G.rotation.x)*.05
      const tx=(stage===0&&innerWidth>900&&scrollY<innerHeight*.8)?2.4:0;gx+=(tx-gx)*.05;G.position.x=gx
      G.scale.setScalar(1+fx.pulse+fx.vel*.00004)
      R.render(S,C)}
    tick();cv.style.opacity=1
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',rs);removeEventListener('pointerup',up);removeEventListener('pointermove',move)
      hero?.removeEventListener('pointerdown',down);document.removeEventListener('visibilitychange',vc);fx.setStage=()=>{};pg.dispose();lg.dispose();R.dispose()}
  },[])
  return <canvas id="gl" ref={ref}/>
}
