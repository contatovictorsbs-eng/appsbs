/* SBS Painel de Atendimento — boot */
(function(){
  ATEND.seed();

  // login (operacional / gerencial)
  var loginView = "operacional";
  var opBtn = document.getElementById("lg-op"), geBtn = document.getElementById("lg-ge");
  function paintLoginChoice(){
    opBtn.classList.toggle("on", loginView==="operacional");
    geBtn.classList.toggle("on", loginView==="gerencial");
  }
  opBtn.addEventListener("click", function(){ loginView="operacional"; paintLoginChoice(); });
  geBtn.addEventListener("click", function(){ loginView="gerencial"; paintLoginChoice(); });
  paintLoginChoice();

  var form = document.getElementById("login-form");
  var err = document.getElementById("lg-err");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var email = (document.getElementById("lg-email").value||"").trim().toLowerCase();
    var pass = document.getElementById("lg-pass").value||"";
    if(!email){ err.textContent="Informe o e-mail."; err.classList.add("show"); return; }
    if(window.SBS_PASSWORD && pass!==window.SBS_PASSWORD && pass!=="••••••••"){ err.textContent="Senha incorreta."; err.classList.add("show"); return; }
    err.classList.remove("show");
    ATEND.startSession(email, loginView);
  });

  // topbar
  document.getElementById("logout").addEventListener("click", ATEND.logout);
  var picker = document.getElementById("agent-picker");
  if(picker) picker.addEventListener("change", function(){ ATEND.setAgent(this.value); ATEND.paintTopbar(); ATEND.refresh(); });
  document.querySelectorAll("[data-view]").forEach(function(b){ b.addEventListener("click", function(){ ATEND.go(b.dataset.view); }); });

  // sessão salva
  var saved = (function(){ try{ return (localStorage.getItem("sbs_atend_user")||""); }catch(e){ return ""; } })();
  var savedAg = (function(){ try{ return (localStorage.getItem("sbs_atend_agent")||""); }catch(e){ return ""; } })();
  if(savedAg) ATEND.setAgent(savedAg);
  if(saved) ATEND.startSession(saved, "operacional"); else ATEND.showLogin();

  // tempo real
  if(window.SBSStore){
    window.SBSStore.onChange(function(d){
      if(!d || !ATEND.session) return;
      var ae=document.activeElement;
      if(ae && (ae.tagName==="TEXTAREA"||ae.tagName==="INPUT")) return;
      if(d.hydrate || d.remote) { ATEND.paintTopbar(); ATEND.refresh(); }
    });
  }
  window.lucide && lucide.createIcons();
})();
