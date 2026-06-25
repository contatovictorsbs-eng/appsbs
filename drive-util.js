/* ===========================================================
   SBS — utilidades de Google Drive (compartilhado app + painel)
   Detecta link de arquivo ou pasta, gera thumbnail/download/view.
   =========================================================== */
(function(){
function fileId(url){
  if(!url) return null;
  const u = String(url);
  let m = u.match(/\/file\/d\/([-\w]{20,})/);        if(m) return m[1];
  m = u.match(/[?&]id=([-\w]{20,})/);                if(m) return m[1];
  m = u.match(/\/d\/([-\w]{20,})/);                  if(m) return m[1];
  m = u.match(/\/uc\?[^]*?id=([-\w]{20,})/);         if(m) return m[1];
  return null;
}
function folderId(url){
  const m = String(url||"").match(/\/folders\/([-\w]{20,})/);
  return m ? m[1] : null;
}
function isFolder(url){ return !!folderId(url); }
function thumb(url, size){
  const id = fileId(url);
  if(id) return "https://drive.google.com/thumbnail?id="+id+"&sz=w"+(size||800);
  const fid = folderId(url);
  return null; // pastas não têm thumb direta
}
function viewUrl(url){
  const id = fileId(url);
  if(id) return "https://drive.google.com/file/d/"+id+"/view";
  return url;
}
function downloadUrl(url){
  const id = fileId(url);
  if(id) return "https://drive.google.com/uc?export=download&id="+id;
  return url; // pasta: abre a pasta
}
window.SBS_DRIVE = { fileId, folderId, isFolder, thumb, viewUrl, downloadUrl };
})();
