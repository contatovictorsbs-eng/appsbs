/* ===========================================================
   SBS — Foto de Perfil (compartilhado por todas as plataformas)
   Guarda avatares na nuvem (coleção "user_avatars" = {email,img}).
   Uso: SBS_AVATAR.setUser(email) no login → torna o avatar do
   usuário (chip da sidebar / topo) clicável para editar.
   SBS_AVATAR.url(email) → dataURL ou null.
   SBS_AVATAR.bind(el, email, {editable}) → renderiza foto/iniciais.
   =========================================================== */
window.SBS_AVATAR = (function(){
  var S = window.SBSStore;
  var curEmail = "";
  var bound = []; // {el, email}

  function store(){ return S || window.SBSStore; }
  function url(email){
    if(!email) return null;
    var st=store(); if(!st) return null;
    var a=(st.getCol("user_avatars")||[]).find(function(x){ return (x.email||"").toLowerCase()===email.toLowerCase(); });
    return a&&a.img?a.img:null;
  }
  function save(email, img){
    var st=store(); if(!st) return;
    var arr=(st.getCol("user_avatars")||[]).slice();
    var i=arr.findIndex(function(x){ return (x.email||"").toLowerCase()===email.toLowerCase(); });
    if(i>=0) arr[i]=Object.assign({},arr[i],{img:img}); else arr.push({email:email,img:img});
    st.setCol("user_avatars",arr);
  }
  function remove(email){
    var st=store(); if(!st) return;
    st.setCol("user_avatars",(st.getCol("user_avatars")||[]).filter(function(x){ return (x.email||"").toLowerCase()!==email.toLowerCase(); }));
  }

  function injectCss(){
    if(document.getElementById("sbs-av-css")) return;
    var st=document.createElement("style"); st.id="sbs-av-css";
    st.textContent=
      '.sbs-av-edit{position:relative;cursor:pointer;overflow:hidden;background-size:cover!important;background-position:center!important}'+
      '.sbs-av-edit.has-img{color:transparent!important}'+
      '.sbs-av-cam{position:absolute;right:-1px;bottom:-1px;width:42%;height:42%;min-width:14px;min-height:14px;max-width:20px;max-height:20px;background:#0B6B61;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff}'+
      '.sbs-av-cam svg{width:55%;height:55%}'+
      '.sbs-avm{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(8,16,12,.55);padding:22px;font-family:"Plus Jakarta Sans",system-ui,sans-serif}'+
      '.sbs-avm-box{background:#fff;border-radius:20px;max-width:360px;width:100%;padding:24px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.3)}'+
      '.sbs-avm-box h3{font-size:18px;font-weight:800;margin:0 0 4px;color:#16201a}'+
      '.sbs-avm-box p{font-size:13px;color:#6b7a74;margin:0 0 18px}'+
      '.sbs-avm-prev{width:128px;height:128px;border-radius:50%;margin:0 auto 18px;background:#E9F3EF;display:grid;place-items:center;font-size:38px;font-weight:800;color:#0B6B61;background-size:cover;background-position:center;overflow:hidden}'+
      '.sbs-avm-acts{display:flex;flex-direction:column;gap:9px}'+
      '.sbs-avm-btn{border:0;border-radius:11px;padding:12px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}'+
      '.sbs-avm-btn.primary{background:#0B6B61;color:#fff}'+
      '.sbs-avm-btn.ghost{background:#f1f4f2;color:#3a463f}'+
      '.sbs-avm-btn.danger{background:#fff;border:1.5px solid #ecd6d4;color:#b3261e}'+
      '.sbs-avm-btn svg{width:16px;height:16px}';
    document.head.appendChild(st);
  }

  function ini(email){
    var st=store();
    var c=st&&(st.getCol("rh_colaboradores")||[]).concat(st.getCol("vendedores")||[]).find(function(x){ return (x.email||"").toLowerCase()===(email||"").toLowerCase(); });
    var n=(c&&(c.nome||c.name))|| (email||"?").split("@")[0];
    return n.split(/[ ._]/).filter(Boolean).map(function(w){return w[0];}).slice(0,2).join("").toUpperCase();
  }

  function render(el, email){
    var u=url(email);
    if(u){ el.classList.add("has-img"); el.style.backgroundImage="url('"+u+"')"; }
    else { el.classList.remove("has-img"); el.style.backgroundImage=""; }
  }

  function bind(el, email, opts){
    if(!el) return; opts=opts||{};
    injectCss();
    el.classList.add("sbs-av-edit");
    render(el, email);
    if(opts.editable!==false){
      if(!el.querySelector(".sbs-av-cam")){
        var cam=document.createElement("span"); cam.className="sbs-av-cam";
        cam.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
        el.appendChild(cam);
      }
      el.addEventListener("click", function(ev){ ev.stopPropagation(); openEditor(email); });
    }
    if(!bound.find(function(b){ return b.el===el; })) bound.push({el:el,email:email});
  }

  function openEditor(email){
    injectCss();
    var pending=null;
    var cur=url(email);
    var ov=document.createElement("div"); ov.className="sbs-avm";
    ov.innerHTML=
      '<div class="sbs-avm-box">'+
        '<h3>Foto de perfil</h3><p>Escolha uma imagem do seu dispositivo.</p>'+
        '<div class="sbs-avm-prev" id="sbs-avm-prev">'+(cur?'':ini(email))+'</div>'+
        '<div class="sbs-avm-acts">'+
          '<label class="sbs-avm-btn primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Escolher foto<input type="file" accept="image/*" id="sbs-avm-file" hidden></label>'+
          (cur?'<button class="sbs-avm-btn danger" id="sbs-avm-rm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Remover foto atual</button>':'')+
          '<button class="sbs-avm-btn primary" id="sbs-avm-save" style="display:none"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/></svg> Salvar</button>'+
          '<button class="sbs-avm-btn ghost" id="sbs-avm-cancel">Cancelar</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(ov);
    var prev=ov.querySelector("#sbs-avm-prev");
    if(cur){ prev.style.backgroundImage="url('"+cur+"')"; }
    function close(){ ov.remove(); }
    ov.addEventListener("click",function(e){ if(e.target===ov) close(); });
    ov.querySelector("#sbs-avm-cancel").addEventListener("click",close);
    var rm=ov.querySelector("#sbs-avm-rm"); if(rm) rm.addEventListener("click",function(){ remove(email); refresh(); close(); });
    var saveBtn=ov.querySelector("#sbs-avm-save");
    ov.querySelector("#sbs-avm-file").addEventListener("change",function(e){
      var f=e.target.files[0]; if(!f) return;
      var rd=new FileReader(); rd.onload=function(){ var img=new Image(); img.onload=function(){
        var mx=512,sc=Math.min(1,mx/Math.max(img.width,img.height));
        var w=img.width*sc,hh=img.height*sc,side=Math.min(w,hh);
        var cv=document.createElement("canvas"); cv.width=side; cv.height=side;
        cv.getContext("2d").drawImage(img,(w-side)/2/sc*sc,(hh-side)/2,side,side,0,0,side,side);
        // simpler center crop:
        var cv2=document.createElement("canvas"); cv2.width=320; cv2.height=320;
        var s=Math.min(img.width,img.height);
        cv2.getContext("2d").drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,320,320);
        pending=cv2.toDataURL("image/jpeg",0.85);
        prev.textContent=""; prev.style.backgroundImage="url('"+pending+"')";
        saveBtn.style.display="";
      }; img.src=rd.result; }; rd.readAsDataURL(f);
    });
    saveBtn.addEventListener("click",function(){ if(pending){ save(email,pending); refresh(); } close(); });
  }

  function refresh(){ bound=bound.filter(function(b){ return document.body.contains(b.el); }); bound.forEach(function(b){ render(b.el,b.email); }); }

  function setUser(email){
    curEmail=email; injectCss();
    ["#sb-av","#agent-av"].forEach(function(sel){ var el=document.querySelector(sel); if(el) bind(el,email,{editable:true}); });
  }

  if(window.SBSStore){ window.SBSStore.onChange(function(d){ if(d&&(d.hydrate||d.key==="user_avatars")) refresh(); }); }

  return { url:url, save:save, remove:remove, bind:bind, openEditor:openEditor, setUser:setUser, refresh:refresh, ini:ini, get email(){ return curEmail; } };
})();
