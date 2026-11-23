/* Lets the trip app run outside Claude. It provides the same few functions the app expects
   (user, db, downloads, assets) using your own Supabase project. If Supabase is not set up
   or the phone is offline, the app keeps working on that phone only. */
(function(){
  if(window.claude)return;
  window.__SELFHOST=true;
  const CFG=window.TRIP_CFG||{},URL_=(CFG.SUPABASE_URL||'').replace(/\/$/,''),KEY=CFG.SUPABASE_ANON_KEY||'',ON=!!(URL_&&KEY);
  const K=k=>'batamsb.'+k,get=(k,d)=>{try{const v=localStorage.getItem(K(k));return v?JSON.parse(v):d}catch(e){return d}},put=(k,v)=>{try{localStorage.setItem(K(k),JSON.stringify(v))}catch(e){}};
  const TABLE={site:'site_docs',plans:'plans',orders:'orders'};
  let sess=get('sess',null),adminPass=get('admin',''),isAdmin=!!adminPass;
  async function tfetch(url,opt){const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);try{return await fetch(url,{...opt,signal:c.signal})}finally{clearTimeout(t)}}
  async function auth(){
    if(sess&&sess.expires_at*1000>Date.now()+60000)return sess;
    if(sess&&sess.refresh_token){try{const r=await tfetch(URL_+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:sess.refresh_token})});if(r.ok){sess=await r.json();put('sess',sess);return sess}}catch(e){if(sess&&sess.user)return sess;throw e}}
    const r=await tfetch(URL_+'/auth/v1/signup',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:'{}'});
    if(!r.ok)throw new Error('Sign-in failed ('+r.status+'). Is "Anonymous sign-ins" switched on in Supabase?');
    sess=await r.json();put('sess',sess);return sess}
  async function rest(path,opt={}){const s=await auth();const r=await tfetch(URL_+'/rest/v1/'+path,{...opt,headers:{apikey:KEY,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json',...(opt.headers||{})}});
    if(!r.ok){let m='';try{m=(await r.json()).message||''}catch(e){}throw new Error(m||('Request failed ('+r.status+')'))}
    const t=await r.text();return t?JSON.parse(t):null}
  const pending=get('pending',{});
  async function write(path,obj){const[col,id]=path.split('/');
    if(col==='site'){if(!adminPass)throw new Error('Organiser sign-in needed');await rest('rpc/admin_set_doc',{method:'POST',body:JSON.stringify({pass:adminPass,doc_id:id,doc:obj})})}
    else await rest(TABLE[col]+'?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id,data:obj,updated_at:new Date().toISOString()})})}
  async function flush(){if(!ON)return;for(const p of Object.keys(pending)){try{await write(p,pending[p]);delete pending[p];put('pending',pending)}catch(e){break}}}
  const watchers={};
  async function pull(col){try{const rows=await rest(TABLE[col]+'?select=id,data');const docs=rows.map(r=>r.data);put('snap.'+col,docs);(watchers[col]||[]).forEach(f=>f(docs))}catch(e){}}
  const snapObj=docs=>({docs:docs.map(d=>({data:()=>d}))});
  const db={
    doc(path){return{
      async set(obj){const col=path.split('/')[0];try{await write(path,obj);delete pending[path];put('pending',pending);setTimeout(()=>pull(col),300)}catch(e){if(col!=='site'){pending[path]=obj;put('pending',pending)}throw e}},
      async delete(){if(!adminPass)throw new Error('Organiser sign-in needed');const id=path.split('/')[1];await rest('rpc/admin_delete_doc',{method:'POST',body:JSON.stringify({pass:adminPass,doc_id:id})});setTimeout(()=>pull('site'),300)}}},
    collection(col){return{onSnapshot(cb){(watchers[col]=watchers[col]||[]).push(s=>cb(snapObj(s)));const c=get('snap.'+col,null);if(c)setTimeout(()=>cb(snapObj(c)),0);pull(col);return()=>{}}}}};
  const tick=()=>{if(document.visibilityState==='visible'){flush();Object.keys(watchers).forEach(pull)}};
  if(ON){setInterval(tick,15000);addEventListener('online',tick);document.addEventListener('visibilitychange',tick)}
  window.__tripAdmin={
    async login(pass){if(!ON)throw new Error('Sharing is not set up yet');const ok=await rest('rpc/admin_check',{method:'POST',body:JSON.stringify({pass})});if(ok!==true)throw new Error('Wrong passcode');adminPass=pass;isAdmin=true;put('admin',pass)},
    logout(){adminPass='';isAdmin=false;put('admin','')},
    get on(){return ON},get isAdmin(){return isAdmin}};
  const user={async id(){if(ON){try{return (await auth()).user.id}catch(e){}}let d=get('devid',null);if(!d){d='dev'+Math.random().toString(36).slice(2)+Date.now().toString(36);put('devid',d)}return d},async canEdit(){return isAdmin},async isOwner(){return isAdmin}};
  const downloads={async save({filename,data}){const b=data instanceof Blob?data:new Blob([data]),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}};
  const assets={async upload(file){if(file.size>700*1024)throw new Error('File too big (max 700 KB). Use a smaller photo or PDF.');const d=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)});return{id:d}}};
  window.claude={async use(n){return n==='user'?user:n==='db'?(ON?db:null):n==='downloads'?downloads:n==='assets'?assets:null}};
  addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="/_blob/data:"]');if(!a)return;e.preventDefault();try{const u=a.getAttribute('href').slice(7),h=u.split(',')[0],b=u.slice(h.length+1),m=/data:([^;]+)/.exec(h)[1],bin=atob(b),arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);window.open(URL.createObjectURL(new Blob([arr],{type:m})),'_blank')}catch(x){}},true);
})();
