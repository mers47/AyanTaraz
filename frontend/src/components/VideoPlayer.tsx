'use client';import{useState,useRef}from'react';

interface VP{url:string;title?:string;poster?:string}
export default function VideoPlayer({url,title,poster}:VP){
const[pl,sp]=useState(false);const[er,se]=useState('');const r=useRef<HTMLVideoElement>(null);
const play=()=>{const v=r.current;if(!v)return;v.play().then(()=>sp(true)).catch(()=>se('پخش ویدیو با خطا مواجه شد'))};
return<div style={W}><div style={FW}>
{title&&<h3 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:12,color:'var(--text-primary)'}}>{title}</h3>}
<div style={VW}>
<video ref={r} src={url} poster={poster} controls playsInline style={V} onError={()=>se('بارگذاری ویدیو ناموفق بود')}/>
{er&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:'0.875rem',background:'var(--brand-black)'}}>{er}</div>}
</div>
</div></div>;}
const W:React.CSSProperties={width:'100%'};
const FW:React.CSSProperties={maxWidth:900,margin:'0 auto'};
const VW:React.CSSProperties={position:'relative',width:'100%',borderRadius:'var(--radius-lg)',overflow:'hidden',border:'1px solid var(--border-subtle)',background:'var(--brand-black)',boxShadow:'0 8px 32px rgba(0,0,0,.5)'};
const V:React.CSSProperties={width:'100%',height:'auto',display:'block',maxHeight:'70vh'};
