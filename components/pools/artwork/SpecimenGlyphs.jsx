import React from 'react';

// A single vector grammar for tokens: symbolic illustrations, never claimed as official logos.
// Every constituent is supplied by the canonical pool adapter rather than hardcoded in the visual.
const tones = {
  NUT: ['#65412d','#b57b4e','#efd0a1'], sNUT:['#365c40','#719a61','#d8e5b7'],
  NUTINO:['#32695d','#6fb09b','#d6ead2'], wETH:['#42577e','#7089b0','#d4e2f1'],
  cbETH:['#375c94','#6999cc','#deebf8'], cbBTC:['#8b571f','#ca8f35','#f7dfaa'],
  AERO:['#226d7a','#5ea2aa','#d5edeb'],
};
export const paintFor = token => tones[token] || ['#72543e','#b68e67','#f0d8b4'];

export function Leaf({x=0,y=0,rotate=0,scale=1,light=false}) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <path d="M0 0 C4-18 17-31 36-29 C33-10 18 0 0 0Z" fill={light?'#afbd90':'#809866'} stroke="#586b48" strokeWidth=".75"/>
    <path d="M1 0 Q19-17 34-27 M13-11 L9-22 M22-18 L29-14" fill="none" stroke="#dce5ca" strokeWidth=".9" opacity=".9"/>
  </g>;
}
export function Blossom({x=0,y=0,scale=1,rotate=0}) {
 return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
  {[0,60,120,180,240,300].map(i=><ellipse key={i} cx="0" cy="-9" rx="5.5" ry="10" transform={`rotate(${i})`} fill="#fff3dc" stroke="#c9a778" strokeWidth=".7"/>)}
  <circle r="4.2" fill="#d4a35d" stroke="#a37a42" strokeWidth=".9"/>
  {[0,60,120,180,240,300].map(i=><path key={i} transform={`rotate(${i})`} d="M0-2 L0-10" stroke="#dfbf7c" strokeWidth=".55"/>)}
 </g>;
}
export function Twig({x=0,y=0,rotate=0,scale=1}) {
 return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
   <path d="M-60 6 Q0-7 63 2" fill="none" stroke="#9b885e" strokeWidth="2" strokeLinecap="round"/>
   <path d="M-32 2Q-26-5-23-10 M5-3Q16-15 22-24 M29-2Q36 5 41 9" fill="none" stroke="#9b885e" strokeWidth="1.3"/>
   <Leaf x={-23} y={-10} rotate={-65} scale={.65} light/>
   <Leaf x={22} y={-24} rotate={24} scale={.78}/>
   <Leaf x={41} y={9} rotate={155} scale={.52} light/>
 </g>;
}

function TokenSymbol({name}) {
 if(['PNUTS','ALMD','SALMD','PNUTRMY'].includes(name)) return <TokenSymbol name="NUT"/>;
 if(name==='pNUT')return <g><path d="M-19-19L19-19L19 19L-19 19Z" fill="#e1c38d" stroke="#9c7a46" strokeWidth="2"/><path d="M-19-19L19 19M19-19L-19 19" stroke="#f6e8c5" strokeWidth="1.5"/><circle r="7" fill="#987044"/></g>;
 switch(name) {
 case 'NUT': return <g>
  <path d="M-2-26C-18-26-30-10-28 9C-26 30-10 37 2 35C22 34 30 15 27-4C24-19 13-27-2-26Z" fill="#e4b77f" stroke="#74462a" strokeWidth="2"/>
  <path d="M0-24C-9-12-10 6-1 32M-11-17Q-25 4-12 24M11-20Q23 5 10 28" fill="none" stroke="#956039" strokeWidth="2"/>
  <path d="M-17-9Q-8-17 2-15M-18 13Q-7 6 2 11M6 19L18 6" fill="none" stroke="#fff0cb" strokeWidth="1.4" opacity=".88"/>
  <path d="M-16-22Q-8-34 1-27Q10-34 17-21" fill="#9a7541" stroke="#6c492e" strokeWidth="1"/>
 </g>;
 case 'sNUT': return <g>
  <path d="M0 29Q-5 9 2-20" fill="none" stroke="#eff2ce" strokeWidth="3" strokeLinecap="round"/>
  <path d="M-1 6Q-29 3-25-24Q-3-20-1 6Z" fill="#b6d199" stroke="#edf5d0" strokeWidth="1.1"/>
  <path d="M1-3Q7-29 29-29Q27-8 1-3Z" fill="#d4e4a5" stroke="#edf5d0" strokeWidth="1.1"/>
  <path d="M-2 6L-22-21M3-5L27-27" stroke="#587f55" strokeWidth="1.6"/>
  <path d="M-1 27Q11 11 23 12" stroke="#e1eebb" strokeWidth="2" fill="none"/>
 </g>;
 case 'NUTINO': return <g>
  <path d="M0 29C-9 12-7-7 1-24" stroke="#d6edd3" fill="none" strokeWidth="3"/>
  <path d="M-1 8Q-32 4-29-25Q-8-27-1 8Z" fill="#a7d3b2" stroke="#e7f4d9" strokeWidth="1.5"/>
  <path d="M3-5Q9-34 32-28Q32-4 3-5Z" fill="#78b99e" stroke="#d7f1d9" strokeWidth="1.5"/>
  <path d="M-26-21L-2 6M30-25L3-7" stroke="#397e69" strokeWidth="1.7"/>
  <circle cx="-8" cy="-16" r="2" fill="#f7edd0"/>
 </g>;
 case 'wETH':case 'cbETH':return <g>
  <path d="M0-31L-23 4L0 16L23 4Z" fill="#e8effa" stroke="#b9cfed" strokeWidth="1.2"/>
  <path d="M0-31V16L23 4Z" fill="#98aed0"/>
  <path d="M-23 9L0 32L23 9L0 19Z" fill="#d0def2"/>
  <path d="M0 19V32L23 9Z" fill="#819dc2"/>
  <path d="M-23 4L0 16L23 4M0-31V32" fill="none" stroke="#526e99" strokeWidth="1"/>
 </g>;
 case 'cbBTC':return <g>
  <text x="0" y="20" fontFamily="Georgia,serif" fontSize="59" textAnchor="middle" fontWeight="700" fill="#f9e5bb" stroke="#bc8742" strokeWidth=".6">₿</text>
 </g>;
 case 'AERO':return <g>
  <path d="M-30 13Q-13-17 29-23Q7-13-6 3Q15-7 29-8Q11 11-14 13L-25 25Z" fill="#d8efee" stroke="#a6d5d4" strokeWidth="1.2"/>
  <path d="M-26 25Q-3-11 26-21M-6 3Q11 0 28-8" stroke="#4f9ca5" fill="none" strokeWidth="1.8"/>
 </g>;
 default:return <g><path d="M-20 15L0-23L20 15Z" fill="#f2ddad" stroke="#b58b51" strokeWidth="2"/><path d="M-11 9H11" stroke="#ba9361" strokeWidth="2"/></g>;
 }
}
export function TokenMedal({name,x,y,r=35,small=false}) {
 const [dark,mid,shine]=paintFor(name);
 const s=r/39;
 return <g transform={`translate(${x} ${y})`}>
  <circle r={r+5} fill="#fcf5e8" stroke="#b58c5d" strokeWidth="1.4"/>
  <circle r={r+1.8} fill="#dec49b" stroke="#fff1d8" strokeWidth="1"/>
  <circle r={r} fill={dark} stroke="#a7774a" strokeWidth="1"/>
  <circle r={r-5} fill="none" stroke={shine} strokeOpacity=".7" strokeWidth=".85"/>
  <path d={`M${-r*.7} ${-r*.45}Q${-r*.4} ${-r*1.15} ${r*.45} ${-r*.65}`} fill="none" stroke={shine} strokeWidth="2.6" opacity=".3" strokeLinecap="round"/>
  <g transform={`scale(${s*.95})`}><TokenSymbol name={name}/></g>
  {Array.from({length:12},(_,i)=><circle key={i} cx={Math.cos(i*Math.PI/6)*(r-2)} cy={Math.sin(i*Math.PI/6)*(r-2)} r=".9" fill={shine} opacity=".65"/>)}
 </g>;
}
export function NameRibbon({name,x,y,width=82}){
 return <g transform={`translate(${x} ${y})`}>
  <path d={`M${-width/2+5} 0H${width/2-5}L${width/2} 8L${width/2-5} 16H${-width/2+5}L${-width/2} 8Z`} fill="#fff7e9" stroke="#c6a475" strokeWidth="1"/>
  <text y="11.5" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize={name.length>5?'10':'12'} fill="#62452f">{name}</text>
 </g>;
}
export function NutSeal(){return <svg viewBox="0 0 44 44" focusable="false" aria-hidden="true" width="100%" height="100%">
 <circle cx="22" cy="22" r="19" fill="#f6e6c6" stroke="#ae8858" strokeWidth="1.1"/><circle cx="22" cy="22" r="16.2" fill="none" stroke="#d5b485" strokeDasharray="1 3"/>
 <g transform="translate(22 22) scale(.48)"><TokenSymbol name="NUT"/></g>
 </svg>}
