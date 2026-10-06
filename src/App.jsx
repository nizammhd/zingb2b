import {Fragment,lazy,Suspense,useEffect,useRef,useState} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {fx} from './fx'
import {touch,reduce} from './env'

const Scene=lazy(()=>import('./Scene')) // 3D is lazy-loaded
gsap.registerPlugin(ScrollTrigger)
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)]

const NAV=[['Home','#home'],['Services','#s1'],['Work','#work'],['About','#about'],['Contact','#contact']]
const STATS=[[8,'Solution areas'],[5,'Step process'],[24,'/7 automation'],[100,'% custom built']]
const WORK=[['Custom Software','API integrations & internal tools'],['E-commerce Platform','Responsive online store'],['WhatsApp Automation','Automated support & sales'],['Lead Gen Campaign','Performance marketing']]
const STEPS=[['Discover','We learn your business, customers and goals.'],['Design','Interfaces and solution concepts shaped with you.'],['Develop','Clean, fast, scalable builds.'],['Automate','Connect WhatsApp and workflows to save time.'],['Grow','Market, measure and improve continuously.']]
const WHY=[['Affordable','Premium results at accessible pricing.'],['Custom Solutions','Nothing templated, everything tailored.'],['Technology-Driven','Modern tools, performant by default.'],['Automation-First','Less manual work, faster customer response.'],['Scalable Solutions','Foundations that grow with your business.'],['Long-Term Partner','Support well beyond launch.']]
const SERVICES=['Website','E-commerce','WhatsApp Integration / Automation','Digital Marketing','Lead Generation','Custom Software / API','Other']
const pad=n=>String(n).padStart(2,'0')

const Split=({children})=>String(children).split(' ').map((w,i)=><Fragment key={i}><span className="w">{w}</span>{' '}</Fragment>)

function Nav(){
  const [open,setOpen]=useState(false),ref=useRef()
  useEffect(()=>{const f=()=>ref.current.classList.toggle('s',scrollY>40);f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[])
  return <nav ref={ref}>
    <a className="logo" href="#home">Zing</a>
    <div className={'links'+(open?' open':'')}>{NAV.map(([t,h])=><a key={t} href={h} onClick={()=>setOpen(false)}>{t}</a>)}</div>
    <a className="btn p mag" href="#contact">Start a Project</a>
    <button id="burger" aria-label="Menu" onClick={()=>setOpen(!open)}>{open?'✕':'☰'}</button>
  </nav>
}

const Svc=({id,stage,k,title,text,items,children})=>
  <section className="svc" id={id} data-stage={stage}>
    <div><div className="k">{k}</div><h2>{title}</h2><p className="l">{text}</p><ul>{items.map(i=><li key={i}>{i}</li>)}</ul></div>
    <div className="card tilt" data-p=".25">{children}</div>
  </section>

const EMAIL='nizammuhammed321@gmail.com',WA_NUM='919645222373'

function Contact(){
  const [done,setDone]=useState(false),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[msg,setMsg]=useState('')
  const wa='https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(msg||'Hi Zing, I would like to start a project.')
  const submit=async e=>{
    e.preventDefault();setBusy(true);setErr('')
    const d=Object.fromEntries(new FormData(e.target))
    setMsg(`Hi Zing, I'd like to start a project.\nName: ${d.name}\nCompany: ${d.company||'-'}\nPhone: ${d.phone}\nEmail: ${d.email}\nService: ${d.service}\nMessage: ${d.message}`)
    try{
      const r=await fetch('https://formsubmit.co/ajax/'+EMAIL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({...d,_subject:`New enquiry: ${d.name} — ${d.service}`,_template:'table',_captcha:'false'})})
      const j=await r.json().catch(()=>({}))
if(!r.ok||String(j.success)!=='true')throw new Error(j.message||'HTTP '+r.status)
      setDone(true);fx.pulse=.4;requestAnimationFrame(()=>gsap.from('.ok',{opacity:0,y:30,duration:.8}))
    }catch(ex){console.error(ex);setErr('Could not send: '+(ex.message||'network error')+'. Please use WhatsApp instead.')}
    finally{setBusy(false)}
  }
  return <section id="contact" data-stage="5"><div className={'contact'+(done?' done':'')}>
    <div className="k">Contact</div><h2>Let’s talk.</h2>
    <form onSubmit={submit}>
      <input name="name" placeholder="Name" required/><input name="company" placeholder="Company"/>
      <input name="phone" type="tel" placeholder="Phone" required/><input name="email" type="email" placeholder="Email" required/>
      <select name="service" className="f" required defaultValue=""><option value="">Service</option>{SERVICES.map(s=><option key={s}>{s}</option>)}</select>
      <textarea className="f" name="message" rows="4" placeholder="Message" required/>
      <div className="f row"><button className="btn p mag" type="submit" disabled={busy}>{busy?'Sending…':'Send Message'}</button><a className="btn mag" target="_blank" rel="noopener noreferrer" href={wa}>Chat on WhatsApp</a></div>
      {err&&<p className="f" role="alert" style={{color:'#ff8a8a',fontSize:14}}>{err}</p>}
    </form>
    <div className="ok"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><path d="M30 52l14 14 28-30"/></svg><h2>Message sent</h2><p className="l" style={{margin:'12px auto'}}>Thanks! We’ve emailed your enquiry to our team. For a faster reply, send the same details on WhatsApp.</p><a className="btn p" target="_blank" rel="noopener noreferrer" href={wa}>Send details on WhatsApp</a></div>
  </div></section>
}

export default function App(){
  const root=useRef(),metric=useRef(),bars=useRef(),[ready,setReady]=useState(false)

  const campaign=()=>{
    $$('i',bars.current).forEach(b=>b.style.height=(20+Math.random()*75)+'%')
    const v=Math.round(40+Math.random()*260),o={n:0}
    gsap.to(o,{n:v,duration:1,onUpdate:()=>metric.current.textContent='+'+Math.round(o.n)+'% leads'});fx.pulse=.25
  }

  useEffect(()=>{(window.requestIdleCallback||setTimeout)(()=>setReady(true))},[])

  useEffect(()=>{
    const ac=new AbortController(),sg={signal:ac.signal},mm=gsap.matchMedia()
    // cursor glow, magnetic buttons, tilt (desktop pointer only)
    if(!touch){
      const g=$('#glow')
      addEventListener('pointermove',e=>{fx.mx=e.clientX/innerWidth*2-1;fx.my=-(e.clientY/innerHeight*2-1);g.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},sg)
      $$('.mag').forEach(b=>{
        b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.3,duration:.3})},sg)
        b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}),sg)})
      $$('.tilt').forEach(c=>{
        c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(c,{rotateY:x*12,rotateX:-y*12,transformPerspective:800,duration:.4})},sg)
        c.addEventListener('pointerleave',()=>gsap.to(c,{rotateX:0,rotateY:0,duration:.7}),sg)})
    }
    $$('.card').forEach(c=>c.addEventListener('pointerenter',()=>fx.pulse=.15,sg))
    document.addEventListener('click',e=>{const t=e.target.closest('[data-info]');if(t){t.closest('.card').querySelector('.cap').textContent=t.dataset.info;fx.pulse=.2}},sg)

    const ctx=gsap.context(()=>{
      if(!reduce){
        gsap.from('.hero .w',{y:60,opacity:0,stagger:.1,duration:1.1,ease:'power3.out',delay:.2})
        gsap.fromTo('.about .w',{opacity:.1},{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:'.about h2',start:'top 80%',end:'bottom 45%',scrub:true}})
        gsap.from('.cta .w',{y:50,opacity:0,stagger:.06,scrollTrigger:{trigger:'.cta',start:'top 60%'}})
        $$('.cnt').forEach(e=>{const o={v:0};ScrollTrigger.create({trigger:e,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{v:+e.dataset.n,duration:1.6,onUpdate:()=>e.textContent=Math.round(o.v)})})})
        gsap.from('.bub',{opacity:0,y:20,stagger:.5,scrollTrigger:{trigger:'#s3',start:'top 55%'}})
        gsap.from('.bars i',{scaleY:0,stagger:.08,scrollTrigger:{trigger:'#s4',start:'top 55%'}})
        gsap.from('.why .card',{opacity:0,y:40,stagger:.08,scrollTrigger:{trigger:'.why',start:'top 80%'}})
        gsap.to('.pl i',{scaleY:1,ease:'none',scrollTrigger:{trigger:'#proc',start:'top 60%',end:'bottom 60%',scrub:true}})
        $$('.st').forEach(s=>ScrollTrigger.create({trigger:s,start:'top 60%',end:'bottom 60%',toggleClass:{targets:s,className:'on'}}))
      }else $$('.st').forEach(s=>s.classList.add('on'))
      ScrollTrigger.create({onUpdate:s=>fx.vel=Math.min(Math.abs(s.getVelocity()),4000)})
      $$('[data-stage]').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 55%',end:'bottom 55%',onToggle:s=>{if(s.isActive){fx.stage=+el.dataset.stage;fx.setStage(fx.stage)}}}))
    },root.current)

    mm.add('(min-width:901px) and (prefers-reduced-motion:no-preference)',()=>{
      $$('[data-p]').forEach(e=>gsap.to(e,{y:()=>-e.dataset.p*140,ease:'none',scrollTrigger:{trigger:e.closest('section'),scrub:true,start:'top bottom',end:'bottom top'}}))
      const tr=$('.track'),d=()=>tr.scrollWidth-innerWidth
      const tw=gsap.to(tr,{x:()=>-d(),ease:'none',scrollTrigger:{trigger:'.work',pin:true,scrub:.6,end:()=>'+='+d(),invalidateOnRefresh:true}})
      $$('.pc').forEach(c=>{
        const st=(a,b)=>({trigger:c,containerAnimation:tw,start:a,end:b,scrub:true})
        gsap.fromTo($('.art',c),{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',ease:'none',scrollTrigger:st('left 95%','left 55%')})
        gsap.fromTo(c,{scale:.82,opacity:.5},{scale:1,opacity:1,ease:'none',scrollTrigger:st('left 95%','left 55%')})
        gsap.from($$('h3,p,.btn',c),{y:30,opacity:0,stagger:.1,scrollTrigger:{trigger:c,containerAnimation:tw,start:'left 70%',toggleActions:'play none none reverse'}})
      })
    })
    return()=>{ac.abort();ctx.revert();mm.revert()}
  },[])

  return <div ref={root}>
    <Suspense fallback={null}>{ready&&<Scene/>}</Suspense>
    <div id="glow"/>
    <Nav/>
    <main>
      <section className="hero" id="home" data-stage="0">
        <div className="bgshape" data-p=".6" style={{width:'50vw',height:'50vw',right:'-15vw',top:'10vh'}}/>
        <div className="k">Zing B2B · Technology &amp; digital solutions</div>
        <h1><Split>Connect. Engage.</Split> <span className="g"><Split>Grow.</Split></span></h1>
        <p className="l">Zing helps businesses establish, automate, and grow their digital presence with modern websites, WhatsApp automation, digital marketing, and custom solutions.</p>
        <div className="row"><a className="btn p mag" href="#contact">Start a Project</a><a className="btn mag" href="#s1">Explore Services</a></div>
        <div className="hint">DRAG · MOVE CURSOR · SCROLL</div>
      </section>

      <section className="about" id="about" data-stage="0">
        <div className="k">About</div>
        <h2 style={{maxWidth:1000}}><Split>We help businesses establish, automate, and grow their digital presence.</Split></h2>
        <p className="l" style={{maxWidth:640}}>Zing combines modern technology with automation to streamline customer communication, improve operational efficiency, and generate more leads — with affordable, scalable solutions built for long-term growth.</p>
        <div className="stats">{STATS.map(([n,t])=><div key={t}><b className="cnt" data-n={n}>0</b><span>{t}</span></div>)}</div>
      </section>

      <Svc id="s1" stage="1" k="01 · Connect" title="Custom Software & APIs" text="Tailored software and API integrations that connect your tools, data and customers into one system." items={['Custom business software','API & third-party integrations']}>
        <div className="shapes"><i data-info="Modular systems that fit your workflow."/><i data-info="APIs link your tools together."/><i data-info="Built to scale as you grow."/></div>
        <div className="type">&lt;/&gt;</div><div className="cap">Hover to play · click a shape.</div>
      </Svc>

      <Svc id="s2" stage="2" k="02 · Engage" title="Websites & E-commerce" text="Fast, responsive websites and online stores built on modern technology to convert visitors into customers." items={['Responsive business websites','E-commerce platforms']}>
        <div className="br" data-info="Responsive layouts, tuned for speed."><div className="bar"><i/><i/><i/></div><div className="scr"><div/><div/><div/><div/></div></div>
        <div className="cap">Hover the browser · move to tilt.</div>
      </Svc>

      <Svc id="s3" stage="3" k="03 · Automate" title="WhatsApp Integration & Automation" text="Automated customer interactions — instant replies, order updates and lead follow-ups, around the clock." items={['WhatsApp integration & chatbots','Workflows & broadcasts']}>
        <div className="chat"><div className="bub">Hi! Do you have this in stock?</div><div className="bub me" data-info="Auto-reply sent in under a second.">Yes! Sending details now ✨</div><div className="bub">Great, I'd like to order.</div><div className="bub me" data-info="Order confirmed and logged to your CRM.">Order confirmed ✅</div></div>
        <div className="flow"><i/><u/><i/><u/><i/><u/><i/></div><div className="cap">Click a reply to see the workflow step.</div>
      </Svc>

      <Svc id="s4" stage="4" k="04 · Grow" title="Marketing & Lead Generation" text="Data-driven campaigns that reach the right people and turn attention into qualified leads." items={['Digital marketing campaigns','Lead generation & analytics']}>
        <div className="big" ref={metric}>+0% leads</div>
        <div className="bars" ref={bars} onClick={campaign}>{Array.from({length:7},(_,i)=><i key={i} style={{height:25+i*11+'%'}}/>)}</div>
        <div className="cap">Click the bars to run a new campaign.</div>
      </Svc>

      <section className="work" id="work" data-stage="5">
        <div className="head"><div className="k">Selected work</div><h2>Built to be noticed.</h2></div>
        <div className="track">{WORK.map(([t,d],i)=><div className="pc" key={t}><div className="art"><b>{pad(i+1)}</b></div><h3>{t}</h3><p>{d}</p><a className="btn mag" href="#contact">View Project</a></div>)}</div>
      </section>

      <section id="process" data-stage="5"><div className="k">Process</div><h2>From idea to ecosystem.</h2>
        <div className="proc" id="proc"><div className="pl"><i/></div>{STEPS.map(([t,d],i)=><div className="st" key={t}><b>{pad(i+1)}</b><h3>{t}</h3><p>{d}</p></div>)}</div>
        
      </section>

      <section id="why" data-stage="5"><div className="k">Why us</div><h2>Built for your business.</h2>
        <div className="why">{WHY.map(([t,d],i)=><div className="card tilt" key={t}><b>{pad(i+1)}</b><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="cta" data-stage="0"><h2><Split>Ready to Build Something Powerful?</Split></h2>
        <p className="l">Tell us what you need and let’s turn your idea into a digital experience.</p>
        <div className="row" style={{justifyContent:'center'}}><a className="btn p mag" href="#contact">Start a Project</a><a className="btn mag" href="#contact">Contact Us</a></div>
      </section>

      <Contact/>
    </main>
    <footer>© {new Date().getFullYear()} Zing B2B · Scalable technology &amp; digital solutions</footer>
  </div>
}
