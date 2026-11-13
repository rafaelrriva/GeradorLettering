/* Gerador de Lettering — lógica.
   Carregado no fim do <body>, então todos os elementos do HTML já existem quando ele roda. */

(() => {
"use strict";
/* ---------------- defaults (medidos no .mov de referência) ---------------- */
const DEFAULTS = {
  /* ===== TEXTO ===== */
  title:"Dra. Natália Nunes",            // Nome exibido em destaque (1ª linha). Também vira o nome do arquivo, sem "Dr./Dra."
  desc:"Médica oncologista Américas oncologia\ne Hospital Universitário dos Servidores do\nEstado - Unirio.", // Descrição; "\n" = quebra manual de linha
  font:"Montserrat",                     // Fonte da identidade visual (regra do projeto: sempre Montserrat)
  autoCase:true,                         // Formatar automático: Nome Em Título (partículas "da/de/do/dos/das/e" ficam minúsculas)
  descCase:false,                        // Formatar Descrição: formato frase. Desligado por padrão porque apaga siglas e nomes próprios (SP, Unirio)

  /* ===== NOME (t = title) =====
     Valores medidos quadro a quadro no .mov de referência (1920x1080) e depois ajustados pelo usuário. */
  tSize:85,                              // tamanho em px (referência era 80; usuário aumentou para 85)
  tWeight:700,                           // Bold, como no vídeo original
  tLH:80,                                // entrelinha, só usada se o nome quebrar em mais de uma linha
  tTrack:0.2,                            // espaçamento extra entre letras (px), compensa diferença de kerning AE x navegador
  tColor:"#1b1b1b",                      // quase preto, medido no vídeo

  /* ===== DESCRIÇÃO (d = description) ===== */
  dSize:46, dWeight:500,                 // Medium 46px: largura das linhas bateu com o vídeo nesse peso/tamanho
  dLH:56,                                // distância entre linhas (baseline a baseline), medida no vídeo
  dTrack:0.5,                            // leve espaçamento extra, o vídeo tinha linhas ~1% mais largas
  dColor:"#4e4e4e",                      // cinza médio, medido no vídeo
  gap:62,                                // baseline do texto anterior (nome ou CRM) até a 1ª baseline da descrição
  align:"left",                          // alinhamento do bloco de texto dentro da caixa

  /* ===== CRM (c = crm) =====
     Sempre exibido como "CRM-UF: NÚMERO" (ver crmText). Fica entre nome e descrição por pedido do usuário. */
  crmShow:true,                          // botão Ocultar/Mostrar CRM; oculto, a caixa se reajusta sem o espaço dele
  crmUF:"RJ", crmNum:"123456",           // estado (lista das 27 UFs) e número; colar o CRM preenche os dois sozinho
  crmPos:"above",                        // "above" = acima da descrição | "below" = abaixo | "side" = na mesma linha do nome
  cSize:50, cWeight:700,                 // valores definidos pelo usuário
  cColor:"#563f99",                      // cor primária da marca (troca junto com o botão de Identidade)
  cTrack:1,                              // espaçamento entre letras, valor do usuário
  cGap:70,                               // baseline do nome até a baseline do CRM
  cSide:28,                              // distância do fim do nome até o CRM, só no modo "side"
  cStart:0.42, cSpread:0.2, cDx:12,      // animação: começa depois do nome, digita rápido (texto curto) e desliza 12px

  /* ===== CÍRCULOS =====
     Arco de bolinhas inspirado no símbolo da TribeMD. Ficam no canto inferior esquerdo, fora da caixa,
     num arco concêntrico à quina arredondada para parecer "orbitar" a caixa. */
  dotsOn:true,
  dotsAnchor:"box",                      // "box" = canto da caixa | "screen" = canto da tela (usa a margem)
  dotsCount:8,                           // mesma quantidade aproximada do símbolo da marca
  dotsMax:30, dotsMin:8,                 // diâmetros: o 1º é o maior e vão diminuindo, como no logo
  dotsR:74,                              // raio do arco medido a partir do centro da curva da quina
  dotsA0:225, dotsA1:45,                 // ângulos (graus): 180 = esquerda, 90 = embaixo, 0 = direita. 225→45 contorna a quina por fora
  dotsOffX:0, dotsOffY:0,                // ajuste fino de posição
  dotsC1:"#563f99", dotsC2:"#7f7f7f",    // degradê da 1ª à última bolinha (definido pela marca escolhida)
  dotsStart:0.25,                        // começa quando a caixa já está ~90% aberta
  dotsStagger:0.05,                      // intervalo entre uma bolinha e a próxima (efeito "pipoca")
  dotsDur:0.35,                          // duração do "pop" de cada bolinha (escala com leve overshoot)

  /* ===== CAIXA ===== */
  boxColor:"#ececec",                    // cinza claro medido no vídeo
  boxAlpha:100,                          // opacidade da caixa (%)
  autoW:true,                            // largura automática: a caixa abraça o texto (pedido do usuário)
  boxW:1210,                             // largura fixa do vídeo original, usada só quando autoW = false
  maxW:1500,                             // no modo automático, a partir daqui o texto quebra linha
  padX:62,                               // respiro lateral (medido no vídeo)
  padTop:60,                             // topo da caixa até o topo das maiúsculas do nome (medido no vídeo)
  padBot:64,                             // última baseline até a base da caixa; reduzido para equilibrar com o topo
  radius:28,                             // arredondamento das quinas (o vídeo usava ~12; usuário pediu mais arredondado)

  /* ===== POSIÇÃO ===== */
  pos:"center",                          // centro da tela, como no vídeo; também há terço inferior esq./centro/dir.
  offX:0, offY:-15,                      // o vídeo tinha a caixa 15px acima do centro exato
  margin:96,                             // distância da borda nos modos de terço inferior (zona segura de TV ~5%)
  scale:100,                             // escala geral; tudo é calculado em 1080p e multiplicado proporcionalmente

  /* ===== ANIMAÇÃO (em segundos) ===== */
  dur:2,                                 // duração total do vídeo de referência (60 quadros a 30fps)
  origin:"center",                       // a caixa abre do centro para os lados, como no vídeo
  boxStart:0, boxDur:0.37,               // a caixa abre em 11 quadros
  tStart:0.22, tSpread:0.43,             // nome: começa no quadro ~7; "spread" = tempo entre a 1ª e a última letra começar
  dStart:0.31, dSpread:0.48,             // descrição: começa logo depois do nome e digita mais rápido (texto maior no mesmo tempo)
  charDur:0.45,                          // quanto cada letra leva para aparecer por completo (fade + deslize)
  tDx:26, dDx:12,                        // distância que cada letra desliza da direita até o lugar (medido: 26px no nome)
  ease:"0.35, 0, 0, 1",                  // curva ajustada matematicamente à abertura da caixa do vídeo (cubic-bezier)
  exitOn:false, exitDur:0.6,             // saída opcional: o texto some e a caixa fecha no fim

  /* ===== EXPORTAÇÃO E ESTADO ===== */
  res:"1920x1080", fps:30,               // igual ao vídeo de referência
  fitAuto:true,                          // reposiciona/redimensiona o lettering conforme a resolução (ver layout())
  fname:"",                              // vazio = usa o nome da pessoa
  brand:"tribemd"                        // identidade selecionada no topo
};
/* PALETAS RÁPIDAS (seção Cores): alteram só caixa, nome e descrição.
   Não mexem no CRM nem nos círculos para não brigar com a cor da marca escolhida na barra Identidade. */
const PRESETS = [
  {name:"Cinza claro", v:{boxColor:"#ececec", tColor:"#1b1b1b", dColor:"#4e4e4e"}},
  {name:"Branco", v:{boxColor:"#ffffff", tColor:"#1b1b1b", dColor:"#4e4e4e"}},
  {name:"Escuro", v:{boxColor:"#2a2a2a", tColor:"#f3f3f3", dColor:"#d0d0d0"}}
];
/* IDENTIDADES: cores tiradas direto das logos do projeto (pixel mais frequente de cada logo).
   cColor = cor do CRM | dotsC1 = 1º círculo (maior) | dotsC2 = último círculo (menor).
   Bipp usa só tons de amarelo nos círculos: o degradê azul-petróleo → amarelo passava por um verde-oliva "sujo". */
const BRANDS = [
  {id:"tribemd", name:"TribeMD",          v:{cColor:"#563f99", dotsC1:"#563f99", dotsC2:"#7f7f7f"}},
  {id:"oncobr",  name:"Oncologia Brasil", v:{cColor:"#144c6f", dotsC1:"#144c6f", dotsC2:"#69c3c4"}},
  {id:"hemo",    name:"Hemomeeting",      v:{cColor:"#dc2828", dotsC1:"#dc2828", dotsC2:"#f58b88"}},
  {id:"bipp",    name:"Bipp",             v:{cColor:"#034554", dotsC1:"#fbb500", dotsC2:"#fdd978"}},
];
/* Pesos disponíveis da Montserrat no Google Fonts. */
const WEIGHTS = [[300,"Light 300"],[400,"Regular 400"],[500,"Medium 500"],[600,"SemiBold 600"],[700,"Bold 700"],[800,"ExtraBold 800"],[900,"Black 900"]];
/* Chave do localStorage: o que o usuário muda fica salvo no navegador dele (não no arquivo).
   Trocar o "v4" apaga as preferências salvas de todo mundo — só faça isso se os padrões mudarem muito. */
const STORE_KEY = "gerador-lettering-v4";
/* As 27 UFs, usadas no seletor e para reconhecer o estado ao colar um CRM. */
const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
/* Texto final do CRM: sempre "CRM-UF: NÚMERO" em maiúsculas. Vazio se o CRM estiver oculto ou sem número
   (assim a caixa encolhe sozinha). O replace remove um "CRM" que alguém tenha digitado dentro do número. */
const crmText = () => (S.crmShow && String(S.crmNum).trim()) ? `CRM-${S.crmUF}: ${String(S.crmNum).trim().replace(/^crm[\s-]*[a-z]{0,2}[:\s]*/i,"").toLocaleUpperCase("pt-BR")}` : "";
/* formatação automática: nome em Título, descrição em frase */
/* Partículas de nomes em português que ficam minúsculas no formato Título ("Maria da Silva"). */
const PARTICLES = new Set("da de do das dos e di du del della van von".split(" "));
/* Nome em Título: tudo minúsculo, depois maiúscula no início de cada palavra (e depois de hífen/apóstrofo). */
function titleCase(s){ return String(s).toLocaleLowerCase("pt-BR").replace(/\S+/g, (w, i) => {
  if (i>0 && PARTICLES.has(w)) return w;
  return w.replace(/(^|[-'’])(\p{L})/gu, (m,a,b) => a + b.toLocaleUpperCase("pt-BR")); }); }
/* Descrição em frase: maiúscula só no começo do texto e depois de . ! ?
   Quebras de linha manuais NÃO viram maiúscula (no vídeo, a 2ª linha começa com "e Hospital…"). */
function sentenceCase(s){ return String(s).toLocaleLowerCase("pt-BR").replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m,a,b) => a + b.toLocaleUpperCase("pt-BR")); }
/* A formatação é aplicada só na hora de desenhar: o texto digitado no campo nunca é alterado. */
const fmtTitle = () => S.autoCase ? titleCase(S.title) : S.title;
const fmtDesc  = () => S.descCase ? sentenceCase(S.desc) : S.desc;

/* S = estado atual. Começa nos padrões e é sobrescrito pelo que estiver salvo no navegador. */
let S = {...DEFAULTS};
try { const saved = JSON.parse(localStorage.getItem(STORE_KEY)||"null"); if (saved) S = {...DEFAULTS, ...saved}; } catch(e) {}

const $ = id => document.getElementById(id);
$("crmUF").innerHTML = UFS.map(u=>`<option>${u}</option>`).join("");
for (const id of ["tWeight","dWeight","cWeight"]) $(id).innerHTML = WEIGHTS.map(([v,l])=>`<option value="${v}">${l}</option>`).join("");

/* LIGAÇÃO DOS CAMPOS: cada chave de DEFAULTS tem um campo com o mesmo id no HTML.
   Assim, para criar um parâmetro novo basta: 1) adicionar em DEFAULTS, 2) criar o <input id="mesmo-nome">.
   NUM lista as chaves numéricas (são convertidas com parseFloat; valores inválidos são ignorados). */
/* ---------------- bind controls ---------------- */
const NUM = new Set(["tSize","tWeight","tLH","tTrack","dSize","dWeight","dLH","dTrack","gap","boxAlpha","boxW","maxW","padX","padTop","padBot","radius","offX","offY","margin","scale","dur","boxStart","boxDur","tStart","tSpread","dStart","dSpread","charDur","tDx","dDx","exitDur","fps","cSize","cWeight","cTrack","cGap","cSide","cStart","cSpread","cDx","dotsCount","dotsMax","dotsMin","dotsR","dotsA0","dotsA1","dotsOffX","dotsOffY","dotsStart","dotsStagger","dotsDur"]);
const KEYS = Object.keys(DEFAULTS);
/* Copia o estado S para os campos da tela. */
function toUI(){
  for (const k of KEYS){ const el=$(k); if(!el) continue;
    if (el.type==="checkbox") el.checked=!!S[k]; else el.value=S[k]; }
  setTimeout(crmPrev);
  if (!$("fontSel").querySelector(`option[value="${CSS.escape(S.font)}"]`)) S.font="Montserrat";
  $("fontSel").value=S.font;
  syncDisabled(); syncBrand();
}
/* Desativa campos que não fazem sentido no modo atual (ex.: largura fixa com largura automática ligada). */
function syncDisabled(){ $("boxW").disabled=S.autoW; $("maxW").disabled=!S.autoW; $("exitDur").disabled=!S.exitOn;
  const lower=S.pos!=="center"; $("margin").disabled=!lower && !(S.dotsOn && S.dotsAnchor==="screen");
  $("cSide").disabled = S.crmPos!=="side"; $("cGap").disabled = S.crmPos==="side";
  const hb=$("crmToggle"); hb.setAttribute("aria-pressed", S.crmShow?"false":"true"); hb.textContent = S.crmShow ? "Ocultar CRM" : "Mostrar CRM";
  $("crmUF").disabled = $("crmNum").disabled = !S.crmShow;
  document.querySelectorAll("[data-dots]").forEach(el=>el.disabled=!S.dotsOn);
  if (typeof baseName==="function") $("fname").placeholder = baseName(); }
/* Salva no localStorage. Fica em try/catch porque o navegador pode bloquear (aba anônima, por exemplo). */
function save(){ try{ const {...o}=S; localStorage.setItem(STORE_KEY, JSON.stringify(o)); }catch(e){} }
for (const k of KEYS){ const el=$(k); if(!el) continue;
  el.addEventListener("input", () => {
    if (el.type==="checkbox") S[k]=el.checked;
    else if (NUM.has(k)) { const v=parseFloat(el.value); if (!Number.isFinite(v)) return; S[k]=v; }
    else S[k]=el.value;
    if (k==="ease") EASE = parseEase(S.ease);
    if (k==="dur"||k==="fps") updateScrubMax();
    syncDisabled(); save(); requestFonts().then(draw);
  });
}
/* Texto de ajuda abaixo do campo CRM. */
function crmPrev(){ $("crmPreview").textContent = S.crmShow ? "Copie e cole o CRM para formatar automático" : "CRM oculto."; }
$("crmToggle").addEventListener("click", () => { S.crmShow=!S.crmShow; syncDisabled(); crmPrev(); save(); requestFonts().then(draw); });
["crmUF","crmNum"].forEach(id=>$(id).addEventListener("input", crmPrev));
/* colar/digitar CRM em qualquer formato -> UF + números */
/* Lê um CRM em qualquer formato ("CRM/SP 123456", "123456 - CRM BA", "crm-mg: 45.678"…):
   - UF: a primeira sigla de 2 letras que seja um estado válido;
   - número: o maior trecho de dígitos (mantém . - / internos, como no formato do RJ 52.12345-6). */
function parseCRM(raw){
  const up = String(raw).toLocaleUpperCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const rest = up.replace(/\bCRM\b|^CRM|CRM(?=[A-Z]{2}\b)/g," ");
  let uf = null; for (const m of rest.matchAll(/(?:^|[^A-Z])([A-Z]{2})(?![A-Z])/g)) if (UFS.includes(m[1])) { uf = m[1]; break; }
  const nm = (rest.match(/\d[\d.\-\/]*\d|\d/g) || []).sort((x,y)=>y.length-x.length)[0] || "";
  return { uf, num: nm };
}
/* Ao colar (ou sair do campo), preenche UF e número já limpos. Sem UF no texto, mantém o estado escolhido. */
function applyCRM(raw){ const r = parseCRM(raw); if (r.uf) { S.crmUF = r.uf; $("crmUF").value = r.uf; }
  S.crmNum = r.num; $("crmNum").value = r.num; crmPrev(); save(); requestFonts().then(draw); }
$("crmNum").addEventListener("paste", e => { const t = (e.clipboardData||window.clipboardData)?.getData("text"); if (!t) return; e.preventDefault(); applyCRM(t); });
$("crmNum").addEventListener("change", e => applyCRM(e.target.value));
$("fontSel").addEventListener("change", e => { S.font=e.target.value; save(); requestFonts().then(draw); });
$("fontFile").addEventListener("change", async e => {
  const f=e.target.files[0]; if(!f) return;
  try{
    const name = "Custom-"+f.name.replace(/\.[^.]+$/,"").replace(/[^\w-]/g,"");
    const face = new FontFace(name, await f.arrayBuffer());
    await face.load(); document.fonts.add(face);
    const o=document.createElement("option"); o.value=name; o.textContent=f.name; $("fontSel").appendChild(o);
    S.font=name; $("fontSel").value=name; save(); draw();
    setStatus(`Fonte "${f.name}" carregada. Ela vale só nesta sessão do navegador.`, "ok");
  }catch(err){ setStatus("Não consegui ler essa fonte. Use um arquivo .ttf, .otf ou .woff.", "warn"); }
});
$("brands").innerHTML = BRANDS.map(b=>`<button class="seg" type="button" data-brand="${b.id}" aria-pressed="false"><span class="chip"><i style="background:${b.v.dotsC1}"></i><i style="background:${b.v.dotsC2}"></i></span>${b.name}</button>`).join("");
/* Marca visualmente o botão da identidade ativa. */
function syncBrand(){ document.querySelectorAll("[data-brand]").forEach(x=>x.setAttribute("aria-pressed", x.dataset.brand===S.brand?"true":"false")); }
$("brands").addEventListener("click", e => { const b=e.target.closest("[data-brand]"); if(!b) return;
  const br = BRANDS.find(x=>x.id===b.dataset.brand); S.brand=br.id; Object.assign(S, br.v); toUI(); save(); draw();
  setStatus(`Cores de ${br.name} aplicadas no CRM e nos círculos.`, "ok"); });
$("presets").innerHTML = PRESETS.map((p,i)=>`<button class="seg" data-p="${i}"><span class="sw" style="background:${p.v.boxColor}"></span><span class="sw" style="background:${p.v.tColor}"></span>${p.name}</button>`).join("");
$("presets").addEventListener("click", e => { const b=e.target.closest("button"); if(!b) return;
  Object.assign(S, PRESETS[+b.dataset.p].v); toUI(); save(); draw(); });
$("reset").addEventListener("click", () => { S={...DEFAULTS}; EASE=parseEase(S.ease); toUI(); updateScrubMax(); save(); requestFonts().then(draw); setStatus("Valores da referência restaurados."); });

/* CURVAS DE ANIMAÇÃO: cubic-bezier igual ao do CSS/After Effects, resolvida por busca binária.
   O padrão (0.35, 0, 0, 1) foi ajustado aos 11 quadros de abertura da caixa do vídeo: arranca rápido e assenta suave. */
/* ---------------- easing ---------------- */
function bezier(x1,y1,x2,y2){
  return x => { if (x<=0) return 0; if (x>=1) return 1;
    let lo=0, hi=1, t=x;
    for (let i=0;i<30;i++){ t=(lo+hi)/2; const bx=3*(1-t)*(1-t)*t*x1+3*(1-t)*t*t*x2+t*t*t; if (bx<x) lo=t; else hi=t; }
    return 3*(1-t)*(1-t)*t*y1+3*(1-t)*t*t*y2+t*t*t; };
}
function parseEase(s){ const n=String(s).split(/[ ,]+/).map(parseFloat).filter(Number.isFinite);
  return n.length===4 ? bezier(...n) : bezier(0.35,0,0,1); }
let EASE = parseEase(S.ease);
const clamp01 = v => v<0?0:v>1?1:v;
const easeOutQuad = v => 1-(1-v)*(1-v);

/* FONTES: o canvas não espera a fonte carregar sozinho; por isso requestFonts() é chamado antes de desenhar
   e antes de exportar (senão o 1º quadro poderia sair com fonte genérica). */
/* ---------------- fonts ---------------- */
function fontStr(w, size){ return `${w} ${size}px "${S.font}", "Montserrat", sans-serif`; }
async function requestFonts(){
  try { await Promise.all([document.fonts.load(fontStr(S.tWeight,40), S.title||"A"), document.fonts.load(fontStr(S.dWeight,40), S.desc||"a"), document.fonts.load(fontStr(S.cWeight,40), crmText()||"CRM")]); } catch(e){}
}

/* LAYOUT: calcula UMA vez a posição de cada letra e o tamanho da caixa; a animação só desloca e muda opacidade.
   Tudo é pensado em px de 1080p e multiplicado por k (4K = 2x, vertical 1080x1920 = 1x).
   Cada letra é desenhada separada, com x medido pelo prefixo da linha, para preservar o kerning da fonte. */
/* ---------------- layout ---------------- */
const measureCtx = document.createElement("canvas").getContext("2d");
function textW(ctx, s, track){ return ctx.measureText(s).width + track*Math.max(0, [...s].length-1); }
/* Quebra de linha: respeita os Enter digitados e quebra por palavra quando passa da largura máxima. */
function wrap(ctx, text, maxW, track){
  const out=[];
  for (const para of String(text).split("\n")){
    const words = para.split(/ +/); let line="";
    if (!para.trim()){ out.push(""); continue; }
    for (const w of words){ const test = line ? line+" "+w : w;
      if (line && textW(ctx,test,track) > maxW){ out.push(line); line=w; } else line=test; }
    out.push(line);
  }
  while (out.length && out[out.length-1]==="") out.pop();
  return out;
}
/* ENCAIXE POR RESOLUÇÃO
   layout() decide a escala (k) e a posição de acordo com o formato escolhido; layoutAt() monta o lettering.
   - Paisagem (1080p/4K): centralizado no quadro; só encolhe se não couber.
   - Vertical 9:16: escala para ocupar a largura entre as margens laterais, apoiado embaixo com folga maior
     (a interface do Reels/Stories cobre a base da tela).
   - Feed 4:5: igual ao vertical, alinhado à esquerda, com folga menor na base.
   - Quadrado: escala pela largura do quadro, apoiado embaixo.
   Em todos: a caixa (e o arco de círculos) nunca sai do quadro; se não couber, tudo é reduzido junto. */
function formatOf(W, H){ if (!S.fitAuto) return "free"; if (W > H) return "land"; if (W === H) return "square"; return (H/W > 1.5) ? "vertical" : "feed"; }
// quanto o arco de círculos passa para fora da caixa (à esquerda e embaixo), em px de 1080p
function dotsOut(){ return (S.dotsOn && S.dotsAnchor==="box") ? Math.max(0, S.dotsR + S.dotsMax/2 - S.radius) : 0; }
function layout(W, H){
  const fmt = formatOf(W, H), base = S.scale/100, safe = 0.04*Math.min(W,H), dOut = dotsOut();
  let k = (Math.min(W,H)/1080) * base;
  if (fmt === "free" || fmt === "land"){
    // 1080p/4K com ajuste ligado: caixa exatamente no centro do quadro (Posição/Ajuste X-Y valem só com o ajuste desligado)
    const place = fmt === "land" ? (bw, bh) => [(W - bw)/2, (H - bh)/2] : null;
    const L0 = layoutAt(W, H, k, place, null, safe);
    const f = Math.min(1, (W - 2*safe) / (L0.box.w + dOut*k), (H - 2*safe) / (L0.box.h + dOut*k));
    return f < 1 ? layoutAt(W, H, k*f, place, null, safe) : L0;
  }
  const side = 0.06*W;                                                    // folga das "paredes" laterais
  const bottom = fmt === "vertical" ? 0.13*H : 0.06*H;                    // folga da base do vídeo
  const L0 = layoutAt(W, H, k, null, null, safe);
  let f = (W - 2*side) / (L0.box.w + dOut*k);                             // ocupar a largura entre as paredes
  f = Math.min(f, (H*0.6) / (L0.box.h + dOut*k));                         // sem passar de 60% da altura
  k *= f;
  const align = fmt === "feed" ? "left" : null;
  return layoutAt(W, H, k, (bw, bh) => [side + dOut*k, H - bottom - bh - dOut*k], align, safe);
}
function layoutAt(W, H, k, placeFn, alignOverride, safe){
  const ctx = measureCtx;
  const tSize=S.tSize*k, dSize=S.dSize*k, tTr=S.tTrack*k, dTr=S.dTrack*k, padX=S.padX*k;
  const TT = fmtTitle(), DD = fmtDesc(); const hasT = TT.trim().length>0, hasD = DD.trim().length>0, crmTxt = crmText(), hasC = crmTxt.length>0;
  const cSize=S.cSize*k, cTr=S.cTrack*k, side = hasC && hasT && S.crmPos==="side";
  let wrapW = S.autoW ? S.maxW*k : S.boxW*k - 2*padX;
  ctx.font = fontStr(S.tWeight, tSize); const tLines = hasT ? wrap(ctx, TT, wrapW, tTr) : [];
  const tWidths = tLines.map(l => textW(ctx,l,tTr));
  ctx.font = fontStr(S.dWeight, dSize); const dLines = hasD ? wrap(ctx, DD, wrapW, dTr) : [];
  const dWidths = dLines.map(l => textW(ctx,l,dTr));
  ctx.font = fontStr(S.cWeight, cSize); const cLines = hasC ? (side ? [crmTxt] : wrap(ctx, crmTxt, wrapW, cTr)) : [];
  const cWidths = cLines.map(l => textW(ctx,l,cTr));
  const tW2 = tWidths.slice(); if (side) tW2[tW2.length-1] += S.cSide*k + cWidths[0];
  const contentW = Math.max(0, ...tW2, ...dWidths, ...(side?[]:cWidths));
  const boxW = S.autoW ? contentW + 2*padX : S.boxW*k;
  const innerW = boxW - 2*padX;
  const capT = 0.7*tSize, capD = 0.7*dSize;
  // vertical: baselines relative to box top
  let y = S.padTop*k, baselines=[];
  if (hasT){ y += capT; tLines.forEach((_,i)=>{ baselines.push(["t",i,y]); if (i<tLines.length-1) y+=S.tLH*k; }); }
  const tLastBase = y; const above = hasC && !side && S.crmPos==="above";
  if (above){ y += hasT ? S.cGap*k : 0.7*cSize; cLines.forEach((_,i)=>{ baselines.push(["c",i,y]); if (i<cLines.length-1) y+=S.cSize*1.25*k; }); }
  if (hasD){ y += (hasT||above) ? S.gap*k : capD; dLines.forEach((_,i)=>{ baselines.push(["d",i,y]); if (i<dLines.length-1) y+=S.dLH*k; }); }
  if (hasC && !side && !above){ y += (hasT||hasD) ? S.cGap*k : 0.7*cSize; cLines.forEach((_,i)=>{ baselines.push(["c",i,y]); if (i<cLines.length-1) y+=S.cSize*1.25*k; }); }
  const boxH = y + S.padBot*k;
  // position
  const m = S.margin*k; let bx, by;
  if (placeFn) [bx, by] = placeFn(boxW, boxH); else {
  switch (S.pos){
    case "lowerLeft":  bx = m; by = H - m - boxH; break;
    case "lowerRight": bx = W - m - boxW; by = H - m - boxH; break;
    case "lowerCenter":bx = (W-boxW)/2; by = H - m - boxH; break;
    default:           bx = (W-boxW)/2; by = (H-boxH)/2;
  }
  bx += S.offX*k; by += S.offY*k; }
  // nunca deixar a caixa (nem o arco de círculos) sair do quadro
  const dO = dotsOut()*k;
  bx = Math.min(Math.max(bx, safe + dO), W - safe - boxW);
  by = Math.min(Math.max(by, safe), H - safe - boxH - dO);
  const ALIGN = alignOverride || S.align;
  // characters
  const chars = { t:[], d:[], c:[] };
  const G = { t:[tLines,tW2,tTr,fontStr(S.tWeight,tSize)], d:[dLines,dWidths,dTr,fontStr(S.dWeight,dSize)], c:[cLines,cWidths,cTr,fontStr(S.cWeight,cSize)] };
  const place = (g, line, lx, yb) => { const [, , tr, font] = G[g]; ctx.font = font; let prefix="";
    [...line].forEach((ch,j)=>{ const x = lx + ctx.measureText(prefix).width + tr*j; prefix+=ch; if (ch.trim()) chars[g].push({ch, x, y: yb}); }); };
  for (const [g,i,base] of baselines){
    const [lines, widths] = G[g]; const lw = widths[i];
    let lx = bx + padX; if (ALIGN==="center") lx = bx + padX + (innerW-lw)/2; else if (ALIGN==="right") lx = bx + boxW - padX - lw;
    place(g, lines[i], lx, by+base);
    if (side && g==="t" && i===tLines.length-1) place("c", cLines[0], lx + tWidths[i] + S.cSide*k, by+tLastBase);
  }
  return {k, box:{x:bx,y:by,w:boxW,h:boxH}, chars, tFont:G.t[3], dFont:G.d[3], cFont:G.c[3]};
}

/* RENDER: desenha o quadro do instante t. Não guarda estado entre quadros, então qualquer quadro pode ser
   gerado em qualquer ordem — o preview, o PNG avulso e a exportação usam exatamente esta função.
   Ordem: círculos (fora da caixa) → caixa abrindo → texto recortado pela caixa (não vaza enquanto ela abre).
   Cada letra: começa em início + spread × (posição/total), faz fade-in e desliza dx px da direita para o lugar. */
/* ---------------- render (pure function of time) ---------------- */
function roundRect(ctx,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function renderFrame(ctx, W, H, t, L){
  ctx.clearRect(0,0,W,H);
  const {box,k} = L;
  let open = EASE(clamp01((t - S.boxStart)/S.boxDur));
  let textMul = 1, boxFade = 1;
  if (S.exitOn){ const te = t - (S.dur - S.exitDur);
    if (te > 0){ textMul = 1 - easeOutQuad(clamp01(te/(S.exitDur*0.45)));
      const pc = EASE(clamp01((te - S.exitDur*0.35)/(S.exitDur*0.65))); open = Math.min(open, 1-pc); } }
  if (S.origin==="none"){ boxFade = open; open = open>0?1:0; }
  if (S.dotsOn) drawDots(ctx, W, H, t, L, textMul);
  const w = box.w*open; if (w < 0.5) return;
  let x = box.x; if (S.origin==="center") x = box.x + (box.w-w)/2; else if (S.origin==="right") x = box.x + box.w - w;
  ctx.save();
  ctx.globalAlpha = (S.boxAlpha/100)*boxFade; ctx.fillStyle = S.boxColor;
  roundRect(ctx, x, box.y, w, box.h, S.radius*k); ctx.fill();
  ctx.globalAlpha = 1;
  roundRect(ctx, x, box.y, w, box.h, S.radius*k); ctx.clip();
  ctx.textBaseline = "alphabetic";
  const groups = [["t", S.tStart, S.tSpread, S.tDx, L.tFont, S.tColor], ["d", S.dStart, S.dSpread, S.dDx, L.dFont, S.dColor], ["c", S.cStart, S.cSpread, S.cDx, L.cFont, S.cColor]];
  for (const [g, start, spread, dx, font, color] of groups){
    const arr = L.chars[g]; const N = arr.length; ctx.font = font; ctx.fillStyle = color;
    for (let i=0;i<N;i++){
      const st = start + (N>1 ? spread*i/(N-1) : 0);
      const p = clamp01((t - st)/S.charDur); if (p<=0) continue;
      const a = easeOutQuad(clamp01(p/0.6)) * textMul * boxFade; if (a<=0.001) continue;
      ctx.globalAlpha = a;
      ctx.fillText(arr[i].ch, arr[i].x + dx*k*(1-EASE(p)), arr[i].y);
    }
  }
  ctx.restore();
}

/* CÍRCULOS: n bolinhas distribuídas no arco entre dotsA0 e dotsA1, centro na curva da quina inferior esquerda.
   Tamanho e cor interpolam do 1º (maior, dotsC1) ao último (menor, dotsC2).
   Cada uma entra com "backOut" (passa um pouco de 100% e volta), dando um efeito de pop. */
/* círculos (arco de bolinhas da marca) */
function mix(a,b,f){ const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); const A=p(a),B=p(b);
  return "rgb("+A.map((v,i)=>Math.round(v+(B[i]-v)*f)).join(",")+")"; }
const backOut = v => { const c=1.70158; v-=1; return 1 + (c+1)*v*v*v + c*v*v; };
function drawDots(ctx, W, H, t, L, mul){
  const {box,k}=L, n=Math.max(1,Math.round(S.dotsCount));
  let cx, cy;
  if (S.dotsAnchor==="screen"){ cx = S.margin*k; cy = H - S.margin*k; }
  else { const rr = Math.min(S.radius*k, box.w/2, box.h/2); cx = box.x + rr; cy = box.y + box.h - rr; } // concêntrico à quina arredondada
  cx += S.dotsOffX*k; cy += S.dotsOffY*k;
  const R = S.dotsR*k;
  for (let i=0;i<n;i++){
    const f = n>1 ? i/(n-1) : 0;
    const a = (S.dotsA0 + (S.dotsA1-S.dotsA0)*f) * Math.PI/180;
    const r = (S.dotsMax + (S.dotsMin-S.dotsMax)*f) * k / 2;
    const p = clamp01((t - (S.dotsStart + i*S.dotsStagger))/S.dotsDur); if (p<=0) continue;
    const sc = Math.max(0, backOut(p)) * (0.25 + 0.75*mul); const al = clamp01(p*3) * mul; if (al<=0.001||sc<=0) continue;
    ctx.globalAlpha = al; ctx.fillStyle = mix(S.dotsC1, S.dotsC2, f);
    ctx.beginPath(); ctx.arc(cx + R*Math.cos(a), cy + R*Math.sin(a), r*sc, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* PREVIEW: renderiza na resolução real num canvas fora da tela e copia reduzido para o canvas visível (máx. 1280px). */
/* ---------------- preview ---------------- */
const view = $("view"), vctx = view.getContext("2d");
const work = document.createElement("canvas"), wctx = work.getContext("2d", {willReadFrequently:true});
let bgMode = "dark", bgImage = null, playing=false, t0=0, curT=S.dur;
function dims(){ const [W,H]=S.res.split("x").map(Number); return {W,H}; }
function totalFrames(){ return Math.max(1, Math.round(S.dur*S.fps)); }
function updateScrubMax(){ curT=Math.min(curT,S.dur); syncScrub(); }
function syncScrub(){ $("scrub").value = Math.round(curT/S.dur*1000);
  const f = Math.min(totalFrames()-1, Math.floor(curT*S.fps+1e-6));
  $("tc").textContent = `${curT.toFixed(2).padStart(5,"0")}s · f ${f+1}/${totalFrames()}`; }
function drawChecker(ctx,W,H){ const s=Math.max(8,Math.round(W/96)); ctx.fillStyle="#bdbdbd"; ctx.fillRect(0,0,W,H); ctx.fillStyle="#e6e6e6";
  for (let y=0;y<H;y+=s) for (let x=((y/s)%2)*s;x<W;x+=2*s) ctx.fillRect(x,y,s,s); }
function draw(){
  const {W,H} = dims();
  if (work.width!==W||work.height!==H){ work.width=W; work.height=H; }
  const maxPW = 1280, maxPH = 720; const sc = Math.min(1, maxPW/W, maxPH/H); // limita também a altura: vertical/feed não ficam gigantes no preview (não afeta a exportação)
  const pw=Math.round(W*sc), ph=Math.round(H*sc);
  if (view.width!==pw||view.height!==ph){ view.width=pw; view.height=ph; }
  const L = layout(W,H);
  renderFrame(wctx, W, H, Math.min(curT, S.dur-1e-6), L);
  vctx.clearRect(0,0,pw,ph);
  if (bgImage){ const r=Math.max(pw/bgImage.width, ph/bgImage.height); const iw=bgImage.width*r, ih=bgImage.height*r; vctx.drawImage(bgImage,(pw-iw)/2,(ph-ih)/2,iw,ih); }
  else if (bgMode==="checker") drawChecker(vctx,pw,ph);
  else { vctx.fillStyle = {dark:"#555555", light:"#ffffff", purple:"#563f99"}[bgMode]; vctx.fillRect(0,0,pw,ph); }
  vctx.drawImage(work,0,0,pw,ph);
  syncScrub();
}
function tick(now){ if(!playing) return; curT = ((now - t0)/1000); if (curT >= S.dur){ curT = S.dur; playing=false; $("play").textContent="▶ Play"; } draw(); if (playing) requestAnimationFrame(tick); }
$("play").addEventListener("click", () => { if (playing){ playing=false; $("play").textContent="▶ Play"; return; }
  if (curT >= S.dur - 1e-3) curT = 0; playing=true; t0 = performance.now() - curT*1000; $("play").textContent="❚❚ Pausar"; requestAnimationFrame(tick); });
$("scrub").addEventListener("input", e => { playing=false; $("play").textContent="▶ Play"; curT = S.dur*e.target.value/1000; draw(); });
document.querySelectorAll("[data-bg]").forEach(b => b.addEventListener("click", () => {
  bgMode=b.dataset.bg; bgImage=null; document.querySelectorAll("[data-bg]").forEach(x=>x.setAttribute("aria-pressed", x===b?"true":"false")); draw(); }));
$("bgimg").addEventListener("change", e => { const f=e.target.files[0]; if(!f) return; const img=new Image();
  img.onload=()=>{ bgImage=img; document.querySelectorAll("[data-bg]").forEach(x=>x.setAttribute("aria-pressed","false")); draw(); }; img.src=URL.createObjectURL(f); });

/* CODIFICADORES: escritos à mão para não depender de bibliotecas externas nem de servidor.
   - MOV: codec QuickTime Animation ("rle "), 32 bits com alfa. Foi escolhido no lugar do ProRes 4444 (usado no
     vídeo original) porque ProRes não pode ser gerado no navegador, e o Animation é aceito em todos os editores.
     Cada quadro é guardado inteiro; áreas transparentes compactam muito bem (corridas repetidas).
   - ZIP: sem compressão, porque PNG já é comprimido. */
/* ---------------- encoders ---------------- */
// QuickTime Animation (qtrle), 32-bit ARGB com alfa. Cada quadro é chave (todas as linhas).
function encodeQtrle(rgba, W, H){
  const out = new Uint8Array(6 + H*(1 + 2 + Math.ceil(W/127)*(1+127*4)) + 1); let o=6;
  out[4]=0; out[5]=0; // header: atualiza todas as linhas
  const u32 = new Uint32Array(rgba.buffer, rgba.byteOffset, W*H);
  for (let y=0;y<H;y++){
    out[o++] = 1; // skip = 0 pixels
    const row = y*W; let x=0;
    while (x<W){
      let run=1; const v=u32[row+x];
      while (x+run<W && run<127 && u32[row+x+run]===v) run++;
      if (run>=2){ out[o++] = (256-run)&255; const p=(row+x)*4; out[o++]=rgba[p+3]; out[o++]=rgba[p]; out[o++]=rgba[p+1]; out[o++]=rgba[p+2]; x+=run; continue; }
      // literal: até a próxima repetição
      let n=1; while (x+n<W && n<127 && !(x+n+1<W && u32[row+x+n]===u32[row+x+n+1])) n++;
      out[o++]=n; for (let j=0;j<n;j++){ const p=(row+x+j)*4; out[o++]=rgba[p+3]; out[o++]=rgba[p]; out[o++]=rgba[p+1]; out[o++]=rgba[p+2]; }
      x+=n;
    }
    out[o++] = 255; // -1: fim da linha
  }
  out[o++] = 0; // fim do quadro
  new DataView(out.buffer).setUint32(0, o);
  return out.slice(0,o);
}
// Muxer QuickTime mínimo
function box(type, ...parts){ let len=8; for (const p of parts) len+=p.length; const b=new Uint8Array(len); const dv=new DataView(b.buffer);
  dv.setUint32(0,len); for (let i=0;i<4;i++) b[4+i]=type.charCodeAt(i); let o=8; for (const p of parts){ b.set(p,o); o+=p.length; } return b; }
function bytes(spec){ // [["u32",v],["u16",v],["u8",v],["str",s],["raw",Uint8Array]]
  let len=0; for (const [t,v] of spec) len += t==="u32"?4:t==="u16"?2:t==="u8"?1:t==="i16"?2:t==="str"?v.length:v.length;
  const b=new Uint8Array(len), dv=new DataView(b.buffer); let o=0;
  for (const [t,v] of spec){ if(t==="u32"){dv.setUint32(o,v>>>0);o+=4;} else if(t==="u16"){dv.setUint16(o,v);o+=2;} else if(t==="i16"){dv.setInt16(o,v);o+=2;} else if(t==="u8"){b[o++]=v;}
    else if(t==="str"){ for(let i=0;i<v.length;i++) b[o++]=v.charCodeAt(i); } else { b.set(v,o); o+=v.length; } }
  return b; }
const MATRIX = bytes([["u32",0x10000],["u32",0],["u32",0],["u32",0],["u32",0x10000],["u32",0],["u32",0],["u32",0],["u32",0x40000000]]);
function buildMov(frames, W, H, fps){
  const ts = 30000, delta = Math.round(ts/fps), n = frames.length, dur = n*delta;
  const ftyp = box("ftyp", bytes([["str","qt  "],["u32",0x200],["str","qt  "]]));
  let mdatLen = 8; for (const f of frames) mdatLen += f.length;
  const big = mdatLen > 0xFFFFFFFF;
  const mdatHdr = big ? bytes([["u32",1],["str","mdat"],["u32",Math.floor((mdatLen+8)/2**32)],["u32",(mdatLen+8)>>>0]]) : bytes([["u32",mdatLen],["str","mdat"]]);
  const offs=[]; let off = ftyp.length + mdatHdr.length; for (const f of frames){ offs.push(off); off+=f.length; }
  const mvhd = box("mvhd", bytes([["u32",0],["u32",0],["u32",0],["u32",ts],["u32",dur],["u32",0x10000],["u16",0x100],["raw",new Uint8Array(10)],["raw",MATRIX],["raw",new Uint8Array(24)],["u32",2]]));
  const tkhd = box("tkhd", bytes([["u32",0x0000000F],["u32",0],["u32",0],["u32",1],["u32",0],["u32",dur],["raw",new Uint8Array(8)],["u16",0],["u16",0],["u16",0],["u16",0],["raw",MATRIX],["u32",W*65536],["u32",H*65536]]));
  const mdhd = box("mdhd", bytes([["u32",0],["u32",0],["u32",0],["u32",ts],["u32",dur],["u16",0],["u16",0]]));
  const name = "VideoHandler";
  const hdlr = box("hdlr", bytes([["u32",0],["str","mhlr"],["str","vide"],["str","appl"],["u32",0],["u32",0],["u8",name.length],["str",name]]));
  const vmhd = box("vmhd", bytes([["u32",1],["u16",0x40],["u16",0x8000],["u16",0x8000],["u16",0x8000]]));
  const dname = "DataHandler";
  const dhdlr = box("hdlr", bytes([["u32",0],["str","dhlr"],["str","alis"],["str","appl"],["u32",0],["u32",0],["u8",dname.length],["str",dname]]));
  const dref = box("dref", bytes([["u32",0],["u32",1]]), box("alis", bytes([["u32",1]])));
  const dinf = box("dinf", dref);
  const cname = "Animation"; const cn = new Uint8Array(32); cn[0]=cname.length; for (let i=0;i<cname.length;i++) cn[1+i]=cname.charCodeAt(i);
  const entry = box("rle ", bytes([["raw",new Uint8Array(6)],["u16",1],["u16",0],["u16",0],["str","appl"],["u32",0],["u32",1024],["u16",W],["u16",H],["u32",72*65536],["u32",72*65536],["u32",0],["u16",1],["raw",cn],["u16",32],["i16",-1]]));
  const stsd = box("stsd", bytes([["u32",0],["u32",1]]), entry);
  const stts = box("stts", bytes([["u32",0],["u32",1],["u32",n],["u32",delta]]));
  const stsc = box("stsc", bytes([["u32",0],["u32",1],["u32",1],["u32",1],["u32",1]]));
  const szs = new Uint8Array(12 + 4*n); const sdv = new DataView(szs.buffer); sdv.setUint32(4,0); sdv.setUint32(8,n); frames.forEach((f,i)=>sdv.setUint32(12+4*i,f.length));
  const stsz = box("stsz", szs);
  const use64 = off > 0xFFFFFFFF;
  const co = new Uint8Array(8 + (use64?8:4)*n); const cdv=new DataView(co.buffer); cdv.setUint32(4,n);
  offs.forEach((v,i)=>{ if(use64){ cdv.setUint32(8+8*i, Math.floor(v/2**32)); cdv.setUint32(12+8*i, v>>>0);} else cdv.setUint32(8+4*i, v); });
  const stco = box(use64?"co64":"stco", co);
  const stbl = box("stbl", stsd, stts, stsc, stsz, stco);
  const minf = box("minf", vmhd, dhdlr, dinf, stbl);
  const mdia = box("mdia", mdhd, hdlr, minf);
  const trak = box("trak", tkhd, mdia);
  const moov = box("moov", mvhd, trak);
  return new Blob([ftyp, mdatHdr, ...frames, moov], {type:"video/quicktime"});
}
// ZIP sem compressão (PNG já é comprimido)
const CRC = (() => { const t=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c = c&1 ? 0xEDB88320^(c>>>1) : c>>>1; t[n]=c>>>0; } return t; })();
function crc32(u8){ let c=0xFFFFFFFF; for (let i=0;i<u8.length;i++) c = CRC[(c^u8[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function buildZip(files){ // [{name, data:Uint8Array}]
  const parts=[], central=[]; let off=0; const enc=new TextEncoder();
  for (const f of files){ const nm=enc.encode(f.name), crc=crc32(f.data), sz=f.data.length;
    const lh = bytes([["u32",0x04034b50],["u16",0x14],["u16",0x0800],["u16",0],["u16",0],["u16",0x21],["u32",0],["u32",0],["u32",0],["u16",nm.length],["u16",0],["raw",nm]]);
    le(lh); const ldv = new DataView(lh.buffer); ldv.setUint32(14,crc,true); ldv.setUint32(18,sz,true); ldv.setUint32(22,sz,true);
    parts.push(lh, f.data);
    const ch = bytes([["u32",0x02014b50],["u16",0x14],["u16",0x14],["u16",0x0800],["u16",0],["u16",0],["u16",0x21],["u32",crc],["u32",sz],["u32",sz],["u16",nm.length],["u16",0],["u16",0],["u16",0],["u16",0],["u32",0],["u32",off],["raw",nm]]);
    le(ch); central.push(ch); off += lh.length + sz; }
  let cdLen=0; for (const c of central) cdLen+=c.length;
  const end = bytes([["u32",0x06054b50],["u16",0],["u16",0],["u16",files.length],["u16",files.length],["u32",cdLen],["u32",off],["u16",0]]); le(end);
  return new Blob([...parts, ...central, end], {type:"application/zip"});
}
// bytes() escreve big-endian; ZIP precisa little-endian: reescreve campos inteiros (exceto o nome)
function le(b){ const dv=new DataView(b.buffer); const sig=dv.getUint32(0);
  const layouts = { 0x04034b50:[4,2,2,2,2,2,4,4,4,2,2], 0x02014b50:[4,2,2,2,2,2,2,4,4,4,2,2,2,2,2,4,4], 0x06054b50:[4,2,2,2,2,4,4,2] };
  let o=0; for (const s of layouts[sig]){ if(s===4){ const v=dv.getUint32(o); dv.setUint32(o,v,true);} else { const v=dv.getUint16(o); dv.setUint16(o,v,true);} o+=s; } }

/* EXPORTAÇÃO: dentro do Claude a página não pode salvar .mov (a plataforma só libera arquivos que ela mesma assina),
   então lá o botão MOV fica desativado. No GitHub Pages ou abrindo o arquivo local, tudo funciona via download normal.
   O nome do arquivo é o nome da pessoa sem "Dr./Dra.", sem acentos e com "_" no lugar dos espaços (seguro em qualquer sistema). */
/* ---------------- export ---------------- */
const inArtifact = () => !!(window.claude && typeof window.claude.use === "function");
function setStatus(msg, cls){ const s=$("status"); s.textContent=msg; s.className=cls||""; }
function setProg(v){ $("prog").style.width = (v*100).toFixed(1)+"%"; }
function personName(){ return String(fmtTitle()||"").split("\n")[0].replace(/^\s*(dr|dra|prof|profa)\.?\s+/i,"").trim(); }
function baseName(){ const raw = String(S.fname||"").trim() || personName() || "lettering"; return raw.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\w.-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60) || "lettering"; }
async function deliver(blob, filename){
  if (inArtifact()){
    const dl = await window.claude.use("downloads").catch(()=>null);
    if (dl){ try { await dl.save({filename, data:blob}); setStatus(`${filename} salvo.`, "ok"); }
      catch(e){ setStatus(e && e.code==="declined" ? "Download cancelado." : `Não foi possível salvar aqui (${e&&e.code||"erro"}). Use a versão local do gerador.`, "warn"); }
      return; }
  }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 60000);
  setStatus(`${filename} pronto (${(blob.size/1048576).toFixed(1)} MB).`, "ok");
}
let busy=false;
function lock(v){ busy=v; ["btnMov","btnZip","btnPng"].forEach(id=>$(id).disabled=v || (id==="btnMov" && inArtifact())); }
async function renderAll(onFrame){
  await requestFonts();
  const {W,H}=dims(); const c=document.createElement("canvas"); c.width=W; c.height=H; const ctx=c.getContext("2d",{willReadFrequently:true});
  const L = layout(W,H); const N = totalFrames();
  for (let i=0;i<N;i++){ renderFrame(ctx,W,H,i/S.fps,L); await onFrame(ctx,c,i,N,W,H); setProg((i+1)/N);
    if (i%3===0) await new Promise(r=>setTimeout(r,0)); }
}
$("btnMov").addEventListener("click", async () => { if (busy) return; lock(true); setStatus("Renderizando MOV…"); setProg(0);
  try { const frames=[]; let W0,H0;
    await renderAll((ctx,c,i,N,W,H)=>{ W0=W;H0=H; frames.push(encodeQtrle(ctx.getImageData(0,0,W,H).data,W,H)); });
    await deliver(buildMov(frames,W0,H0,S.fps), baseName()+".mov");
  } catch(e){ console.error(e); setStatus("Falhou ao gerar o MOV: "+e.message, "warn"); } finally { lock(false); } });
$("btnZip").addEventListener("click", async () => { if (busy) return; lock(true); setStatus("Renderizando sequência PNG…"); setProg(0);
  try { const files=[]; const bn=baseName();
    await renderAll(async (ctx,c,i)=>{ const b=await new Promise(r=>c.toBlob(r,"image/png")); files.push({name:`${bn}/${bn}_${String(i).padStart(4,"0")}.png`, data:new Uint8Array(await b.arrayBuffer())}); });
    await deliver(buildZip(files), bn+"_png.zip");
  } catch(e){ console.error(e); setStatus("Falhou ao gerar o ZIP: "+e.message, "warn"); } finally { lock(false); } });
$("btnPng").addEventListener("click", async () => { if (busy) return; lock(true);
  try { await requestFonts(); const {W,H}=dims(); const c=document.createElement("canvas"); c.width=W; c.height=H;
    renderFrame(c.getContext("2d"),W,H,Math.min(curT,S.dur-1e-6),layout(W,H));
    const b=await new Promise(r=>c.toBlob(r,"image/png")); await deliver(b, `${baseName()}_${Math.floor(curT*S.fps+1e-6)}.png`);
  } finally { lock(false); } });

// expõe para automação/testes
window.__lettering = { S, setState:o=>{ Object.assign(S,o); EASE=parseEase(S.ease); toUI(); draw(); }, layout, renderFrame, encodeQtrle, buildMov, buildZip, requestFonts, dims, totalFrames };

/* INÍCIO: preenche os campos, desenha o último quadro (caixa completa) e redesenha quando a fonte terminar de carregar. */
/* ---------------- init ---------------- */
toUI(); lock(false);
if (inArtifact()) setStatus("Aqui no Claude a exportação em MOV fica bloqueada. A sequência PNG funciona. Para MOV, abra a versão local ou do GitHub Pages.");
requestFonts().then(draw); document.fonts.ready.then(draw);
})();
