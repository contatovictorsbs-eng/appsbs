/* ===========================================================
   SBS — Tweaks app. Renders only the Tweaks panel; applies
   values to the live (vanilla) prototype via CSS vars + attrs.
   =========================================================== */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "brand": "#0B6B61",
  "accent": "#10B0A0",
  "radius": 22,
  "homeLayout": "grid",
  "font": "Plus Jakarta Sans"
}/*EDITMODE-END*/;

const FONTS = {
  "Plus Jakarta Sans": '"Plus Jakarta Sans", system-ui, sans-serif',
  "DM Sans": '"DM Sans", system-ui, sans-serif',
  "Manrope": '"Manrope", system-ui, sans-serif',
};
// load alt fonts lazily
const fl = document.createElement("link"); fl.rel="stylesheet";
fl.href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Manrope:wght@400;500;700;800&display=swap";
document.head.appendChild(fl);

function applyTweaks(t){
  const r = document.documentElement.style;
  r.setProperty("--brand", t.brand);
  r.setProperty("--accent", t.accent);
  r.setProperty("--radius", t.radius+"px");
  r.setProperty("--radius-sm", Math.max(8, t.radius-8)+"px");
  r.setProperty("--font", FONTS[t.font] || FONTS["Plus Jakarta Sans"]);
  const dev = document.getElementById("device");
  if(dev) dev.setAttribute("data-home", t.homeLayout);
  const tm = document.querySelector('meta[name="theme-color"]'); if(tm) tm.content = t.brand;
}

function TweaksApp(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(()=>{ applyTweaks(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Identidade" />
      <TweakColor label="Cor do cabeçalho" value={t.brand}
        options={["#0B6B61","#073F39","#0E9183","#114B57"]}
        onChange={v=>setTweak("brand", v)} />
      <TweakColor label="Cor de destaque" value={t.accent}
        options={["#10B0A0","#0E9183","#3CC7B8","#13C3B0"]}
        onChange={v=>setTweak("accent", v)} />
      <TweakSelect label="Fonte" value={t.font}
        options={["Plus Jakarta Sans","DM Sans","Manrope"]}
        onChange={v=>setTweak("font", v)} />
      <TweakSection label="Layout" />
      <TweakRadio label="Atalhos da Home" value={t.homeLayout}
        options={["grid","list"]}
        onChange={v=>setTweak("homeLayout", v)} />
      <TweakSlider label="Arredondamento" value={t.radius} min={8} max={30} step={2} unit="px"
        onChange={v=>setTweak("radius", v)} />
    </TweaksPanel>
  );
}

applyTweaks(TWEAK_DEFAULTS);
ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<TweaksApp />);
