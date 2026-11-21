/* Laboratorio di «Programmazione dinamica / Dynamic Programming»: le tabelle della PD per i problemi di zaino.
 *
 *   oc-dp-knapsack   problemi di zaino (KP, UKP, BKP, SSP): la tabella della programmazione dinamica si riempie una
 *                    cella alla volta, poi la ricostruzione della soluzione dall'ultima cella
 *
 * Estratta il 2026-11-21 da gi-oc-a.js di Ottimizzazione combinatoria (la chiave dell'app resta oc-dp-knapsack).
 * Notazione del corso: capacità c, profitti p_j, pesi w_j, v(j,k) = valore ottimo con i primi j oggetti e capacità k;
 * istanza di riferimento KP p = (10, 7, 6, 4), w = (5, 4, 3, 3), c = 9.
 * Le funzioni di calcolo sono anche in window.GI_PD_A, per le prove.
 */
(function () {
  "use strict";
  const GI = window.GI, M = window.GI_MIP, O = window.GI_OC;
  const T = GI.T;
  const { PASSO, parPasso, DESCR_PASSO, vaiA, clamp, somma, lista, pct, nuovoId, osservaDimensioni, nuovaVoce, dim, pix, disegno, daIndirizzo, chiedi, interi } = O;
  window.GI_RICETTE = window.GI_RICETTE || {};

  // =================================================================
  // 1. PROGRAMMAZIONE DINAMICA PER I PROBLEMI DI ZAINO (KP, UKP, BKP, SSP)
  // =================================================================
  // Le ricorrenze e le regole sui pareggi sono quelle dei capitoli «DP for the 0/1 knapsack problem»,
  // «… unbounded …» (secondo algoritmo), «… bounded …» e «… subset sum …»:
  //   KP   v(j,k) = max{v(j-1,k), p_j + v(j-1,k-w_j)}          s = 1 se il secondo è > del primo
  //   UKP  v(j,k) = max{v(j-1,k), p_j + v(j,k-w_j)}            (stessa riga: altre copie disponibili)
  //   BKP  v(j,k) = max_d {d p_j + v(j-1,k-d w_j)}, d ≤ min{b_j, ⌊k/w_j⌋}   s = il primo d che dà il massimo
  //   SSP  r(j,k) = r(j-1,k) ∨ r(j-1,k-w_j)                    s = 1 solo se r(j-1,k) è falso
  const DP_ES = {
    kp: [
      { nome: T("esempio 1 del capitolo (c = 5)", "Example 1 of the chapter (c = 5)"), p: [6, 7, 8], w: [2, 3, 3], c: 5 },
      { nome: T("istanza di riferimento (c = 9)", "reference instance (c = 9)"), p: [10, 7, 6, 4], w: [5, 4, 3, 3], c: 9 },
      { nome: T("esercizio 2.3 (c = 8)", "Exercise 2.3 (c = 8)"), p: [3, 4, 8, 8, 10], w: [1, 3, 4, 5, 6], c: 8 },
      { nome: T("esercizio 2.5 (c = 10)", "Exercise 2.5 (c = 10)"), p: [2, 7, 9, 12, 14], w: [1, 4, 5, 7, 8], c: 10 },
    ],
    ukp: [
      { nome: T("esempio 1 del capitolo (c = 7)", "Example 1 of the chapter (c = 7)"), p: [4, 5, 10, 11], w: [2, 3, 5, 6], c: 7 },
      { nome: T("esercizio 3.2 (c = 8)", "Exercise 3.2 (c = 8)"), p: [2, 5, 7, 8, 10], w: [1, 2, 3, 4, 5], c: 8 },
      { nome: T("esercizio 3.4 (c = 9)", "Exercise 3.4 (c = 9)"), p: [5, 6, 14, 18], w: [2, 3, 6, 7], c: 9 },
    ],
    bkp: [
      { nome: T("esempio 1 del capitolo (c = 10)", "Example 1 of the chapter (c = 10)"), p: [6, 10, 12], w: [2, 3, 5], b: [2, 2, 1], c: 10 },
      { nome: T("esercizio 4.2 (c = 7)", "Exercise 4.2 (c = 7)"), p: [3, 8], w: [1, 4], b: [3, 1], c: 7 },
      { nome: T("esercizio 4.4 (c = 8)", "Exercise 4.4 (c = 8)"), p: [5, 9], w: [2, 5], b: [3, 1], c: 8 },
    ],
    ssp: [
      { nome: T("esempio 1 del capitolo (c = 10)", "Example 1 of the chapter (c = 10)"), w: [3, 5, 4, 7], c: 10 },
      { nome: T("esercizio 5.2 (c = 9)", "Exercise 5.2 (c = 9)"), w: [3, 4, 6], c: 9 },
      { nome: T("esercizio 5.3 (c = 7, risposta no)", "Exercise 5.3 (c = 7, answer no)"), w: [2, 4, 6], c: 7 },
      { nome: T("esercizio 5.5 (c = 8)", "Exercise 5.5 (c = 8)"), w: [2, 5, 6, 7], c: 8 },
    ],
  };
  const KP_ES = DP_ES.kp;
  const DP_FUNZ = {
    kp: { etichetta: "<span title=\"0/1 knapsack problem\">0/1 KP</span>", nome: T("problema dello zaino 0/1 (KP)", "0/1 knapsack problem (KP)") },
    ukp: { etichetta: "<span title=\"unbounded knapsack problem\">UKP</span>", nome: T("problema dello zaino illimitato (UKP)", "unbounded knapsack problem (UKP)") },
    bkp: { etichetta: "<span title=\"bounded knapsack problem\">BKP</span>", nome: T("problema dello zaino limitato (BKP)", "bounded knapsack problem (BKP)") },
    ssp: { etichetta: "<span title=\"subset sum problem\">SSP</span>", nome: T("problema del subset sum (SSP)", "subset sum problem (SSP)") },
  };
  /** la tabella della PD, cella per cella, e la ricostruzione; tipo = kp | ukp | bkp | ssp */
  function dpCalcola(I, tipo = "kp") {
    const { w, c } = I, p = I.p || w, b = I.b, n = w.length, V = [], S = [];
    const ssp = tipo === "ssp";
    for (let j = 0; j <= n; j++) { V.push(new Array(c + 1).fill(ssp ? false : 0)); S.push(new Array(c + 1).fill(0)); }
    if (ssp) V[0][0] = true;
    const celle = [];
    for (let j = 1; j <= n; j++) for (let k = 0; k <= c; k++) {
      const wj = w[j - 1], pj = p[j - 1], ok = wj <= k;
      const cel = { j, k, ok, dip: [] };
      if (tipo === "kp" || tipo === "ukp") {
        const a = V[j - 1][k], rb = tipo === "kp" ? j - 1 : j, bb = ok ? V[rb][k - wj] + pj : null;
        cel.a = a; cel.b = bb;
        cel.dip.push({ j: j - 1, k, ruolo: "no" });
        if (ok) cel.dip.push({ j: rb, k: k - wj, ruolo: "si" });
        cel.s = ok && bb > a ? 1 : 0;
        V[j][k] = cel.s ? bb : a;
      } else if (tipo === "bkp") {
        const dmax = Math.min(b[j - 1], Math.floor(k / wj));
        let m = 0, t = 0;
        cel.cand = [];
        for (let d = 0; d <= dmax; d++) {
          const val = d * pj + V[j - 1][k - d * wj];
          cel.cand.push({ d, val, k: k - d * wj });
          cel.dip.push({ j: j - 1, k: k - d * wj, ruolo: "d", d });
          if (val > m) { m = val; t = d; }
        }
        cel.s = t; cel.dmax = dmax;
        V[j][k] = m;
      } else {
        const a = V[j - 1][k], bb = ok ? V[j - 1][k - wj] : null;
        cel.a = a; cel.b = bb;
        cel.dip.push({ j: j - 1, k, ruolo: "no" });
        if (ok) cel.dip.push({ j: j - 1, k: k - wj, ruolo: "si" });
        cel.s = !a && ok && bb ? 1 : 0;
        V[j][k] = a || (ok && bb);
      }
      S[j][k] = cel.s;
      cel.v = V[j][k];
      celle.push(cel);
    }
    // ricostruzione, come nelle procedure dei capitoli (DP_Reconstruct, UKP_DP2_SolComputation, BKP_Reconstruct, SSP_Reconstruct)
    const tb = [], x = new Array(n).fill(0);
    let k = c;
    const risposta = ssp ? V[n][c] : true;
    if (tipo === "ukp") {
      let j = n;
      while (k > 0 && j > 0) {
        if (S[j][k] === 0) { tb.push({ j, k, s: 0, x: x.slice() }); j--; }
        else { x[j - 1]++; tb.push({ j, k, s: 1, x: x.slice() }); k -= w[j - 1]; }
      }
      tb.push({ j, k, fine: true, x: x.slice() });
    } else if (risposta) {
      for (let j = n; j >= 1; j--) {
        const s = S[j][k];
        x[j - 1] = s;
        tb.push({ j, k, s, x: x.slice() });
        k -= s * w[j - 1];
      }
    }
    const val = ssp ? V[n][c] : V[n][c];
    const peso = x.reduce((a, xi, i) => a + xi * w[i], 0), prof = x.reduce((a, xi, i) => a + xi * p[i], 0);
    return { tipo, V, S, celle, tb, x, N: celle.length, K: celle.length + Math.max(1, tb.length), kfin: k, val, peso, prof, risposta,
      presi: x.map((xi, i) => (xi ? i + 1 : 0)).filter(Boolean) };
  }
  function kpCasuale(tipo = "kp") {
    const n = M.casuale(tipo === "bkp" ? 2 : 3, tipo === "bkp" ? 4 : 5), p = [], w = [], b = [];
    for (let j = 0; j < n; j++) { w.push(M.casuale(tipo === "ssp" ? 2 : 1, 6)); p.push(M.casuale(3, 14)); b.push(M.casuale(1, 3)); }
    const c = M.casuale(Math.max(...w) + 1, Math.min(12, Math.max(Math.max(...w) + 1, w.reduce((a, x) => a + x, 0) - 1)));
    const I = { w, c };
    if (tipo !== "ssp") I.p = p;
    if (tipo === "bkp") I.b = b;
    return I;
  }
  const dpCopia = (E) => { const I = { w: E.w.slice(), c: E.c }; if (E.p) I.p = E.p.slice(); if (E.b) I.b = E.b.slice(); return I; };
  function dpStato(st) {
    const D = st.dati, tipo = st.chiave() || "kp";
    D.istDP = D.istDP || {};
    if (!D.istDP[tipo]) D.istDP[tipo] = Object.assign(dpCopia(DP_ES[tipo][0]), { id: nuovoId(), es: 0 });
    const I = D.istDP[tipo];
    if (D.dpId !== I.id) { D.dpId = I.id; D.dp = dpCalcola(I, tipo); }
    const R = D.dp, k = M.passoK(st, R.K, PASSO);
    return { D, tipo, I, R, k, cur: k >= 1 && k <= R.N ? R.celle[k - 1] : null, t: k > R.N ? k - R.N : 0 };
  }
  const vTxt = (v) => (v === true ? "T" : v === false ? "F" : String(v));
  const nomeV = (tipo) => (tipo === "ssp" ? "r" : "v");

  window.GI_RICETTE["oc-dp-knapsack"] = {
    titolo: T("Tabelle della programmazione dinamica per i problemi di zaino", "DP tables for the knapsack problems"),
    funzioni: DP_FUNZ,
    etichettaFunzioni: T("Problema", "Problem"),
    parametri: [parPasso(T("◀ ▶ una cella alla volta, «Esegui» per vederle tutte", "◀ ▶ one cell at a time, «Run» to watch them all"))],
    assi: false,
    opzioniBoard: M.OPZ,
    vista: [-1, 10, 20, -2],
    legenda: (st) => {
      const C = M.COL(st), tipo = st.chiave(), v = nomeV(tipo);
      const voci = [[C.b, T("celle già calcolate", "cells already computed"), "pieno"], [C.a, T("cella che si calcola", "cell being computed"), "pieno"]];
      if (tipo === "bkp") voci.push([C.blu, T("\\(d\\,p_j+v(j-1,k-d\\,w_j)\\)", "\\(d\\,p_j+v(j-1,k-d\\,w_j)\\)") + T(" per ogni \\(d\\)", " for every \\(d\\)"), "dashed"], [C.verde, T("il \\(d\\) migliore", "the best \\(d\\)"), "dashed"]);
      else if (tipo === "ssp") voci.push([C.blu, T("\\(r(j-1,k)\\): senza l'oggetto \\(j\\)", "\\(r(j-1,k)\\): without item \\(j\\)"), "dashed"], [C.verde, T("\\(r(j-1,k-w_j)\\): con l'oggetto \\(j\\)", "\\(r(j-1,k-w_j)\\): with item \\(j\\)"), "dashed"]);
      else voci.push([C.blu, T(`\\(${v}(j-1,k)\\): senza l'oggetto \\(j\\)`, `\\(${v}(j-1,k)\\): item \\(j\\) not taken`), "dashed"],
        [C.verde, tipo === "ukp" ? T("\\(p_j+v(j,k-w_j)\\): una copia in più", "\\(p_j+v(j,k-w_j)\\): one more copy") : T("\\(p_j+v(j-1,k-w_j)\\): prendo l'oggetto \\(j\\)", "\\(p_j+v(j-1,k-w_j)\\): item \\(j\\) is taken"), "dashed"]);
      voci.push([C.verde, T("percorso della ricostruzione", "reconstruction path"), "pieno"]);
      return voci;
    },
    monta(board, st) {
      const D = st.dati;
      nuovaVoce(st);
      const tipo = st.chiave();
      const nuova = (I, es = -1) => { D.istDP[tipo] = Object.assign(I, { id: nuovoId(), es }); vaiA(st, 1); M.ferma(st); st.aggiorna(); };
      M.comandi(st, [
        [T("Casuale", "Random"), T("dati casuali", "random data"), () => nuova(kpCasuale(st.chiave()))],
        [T("Modifica…", "Edit…"), T("scrivi i dati dell'istanza", "type the data of the instance"), () => {
          const tp = st.chiave(), I = D.istDP[tp];
          const formato = tp === "ssp" ? T("pesi ; c", "weights ; c") : tp === "bkp" ? T("profitti ; pesi ; limiti b ; c", "profits ; weights ; bounds b ; c") : T("profitti ; pesi ; c", "profits ; weights ; c");
          const attuale = (tp === "ssp" ? [I.w] : tp === "bkp" ? [I.p, I.w, I.b] : [I.p, I.w]).map((v) => v.join(" ")).concat([I.c]).join(" ; ");
          const s = chiedi(T(`Dati separati da «;» (${formato}), da 2 a 7 oggetti, c fino a 20:`, `Data separated by «;» (${formato}), 2 to 7 items, c up to 20:`), attuale);
          if (!s) return;
          const parti = s.split(";").map((x) => interi(x || ""));
          const nv = tp === "ssp" ? 1 : tp === "bkp" ? 3 : 2;
          const ok = parti.length === nv + 1 && parti.every(Boolean) && parti[nv].length === 1 && parti[nv][0] <= 20 &&
            parti.slice(0, nv).every((v) => v.length === parti[0].length) && parti[0].length >= 2 && parti[0].length <= 7;
          if (!ok) { window.alert(T("Dati non validi: interi positivi, vettori della stessa lunghezza (da 2 a 7), c fino a 20.", "Invalid data: positive integers, vectors of the same length (2 to 7), c up to 20.")); return; }
          const J = tp === "ssp" ? { w: parti[0], c: parti[1][0] } : tp === "bkp" ? { p: parti[0], w: parti[1], b: parti[2], c: parti[3][0] } : { p: parti[0], w: parti[1], c: parti[2][0] };
          nuova(J);
        }],
      ], { k: PASSO, ritmo: 450 });
      O.menuIstanze(st, DP_ES[tipo].map((e) => [e.nome, ""]), () => (D.istDP && D.istDP[st.chiave()] ? D.istDP[st.chiave()].es : 0),
        (i) => nuova(dpCopia(DP_ES[st.chiave()][i]), i));
      osservaDimensioni(board, st);
      daIndirizzo(st);
    },
    aggiorna(board, st) {
      const S = dpStato(st), C = M.COL(st), [W, H] = dim(board), { I, R, k, cur, t, tipo } = S, n = I.w.length, c = I.c;
      M.ridisegna(board, st, [S.D.dpId, tipo, k, M.scuro(), W, H].join("|"), (crea) => {
        pix(board);
        const d = disegno(crea, H);
        const lw = clamp(W * 0.22, 110, 230), top = 40, pad = 10;
        const cs = Math.max(14, Math.min((W - lw - pad) / (c + 1), (H - top - pad) / (n + 1), 92));
        const fs = clamp(cs * 0.42, 9, 17), fl = clamp(cs * 0.3, 9, 14);
        const cx = (kk) => lw + kk * cs, cy = (j) => top + j * cs;
        d.text(lw - 8, top - 10, tipo === "ssp" ? T("valore obiettivo k →", "target value k →") : T("capacità k →", "capacity k →"), { anchorX: "right", fontSize: fl, strokeColor: C.muted, cssStyle: "font-style:italic" });
        for (let kk = 0; kk <= c; kk++) d.text(cx(kk) + cs / 2, top - 10, String(kk), { fontSize: fl, strokeColor: C.muted, cssStyle: "font-weight:600" });
        const cella = (j, kk, attr) => d.rect(cx(kk) + 1, cy(j) + 1, cs - 2, cs - 2, attr);
        const fatte = Math.min(k, R.N);
        const vis = R.tb.slice(0, t), ult = vis[vis.length - 1];
        const xcorr = ult ? ult.x : new Array(n).fill(0);
        for (let j = 0; j <= n; j++) {
          let lab;
          if (j === 0) lab = T("j = 0 (nessun oggetto)", "j = 0 (no item)");
          else if (tipo === "ssp") lab = `j = ${j}:  w=${I.w[j - 1]}`;
          else if (tipo === "bkp") lab = `j = ${j}:  p=${I.p[j - 1]}, w=${I.w[j - 1]}, b=${I.b[j - 1]}`;
          else lab = `j = ${j}:  p=${I.p[j - 1]}, w=${I.w[j - 1]}`;
          const decisa = j > 0 && vis.some((x) => x.j === j && !x.fine);
          const xi = j > 0 ? xcorr[j - 1] : 0;
          const segno = j === 0 || !decisa ? "" : tipo === "ukp" || tipo === "bkp" ? `  x=${xi}` : xi ? " ✓" : " ✗";
          d.text(lw - 8, cy(j) + cs / 2, lab + segno, { anchorX: "right", fontSize: fl, strokeColor: decisa && xi ? C.verde : decisa ? C.muted : C.testo, cssStyle: "font-weight:" + (decisa && xi ? 700 : 500) });
          for (let kk = 0; kk <= c; kk++) {
            const idx = j === 0 ? -1 : (j - 1) * (c + 1) + kk;
            const calc = j === 0 || idx < fatte;
            const vv = R.V[j][kk];
            if (calc) {
              cella(j, kk, { strokeColor: C.line, strokeWidth: 1, fillColor: tipo === "ssp" && vv === false ? C.grigio : C.b, fillOpacity: j === 0 ? 0.06 : tipo === "ssp" && vv === false ? 0.1 : 0.14 });
              d.text(cx(kk) + cs / 2, cy(j) + cs / 2, vTxt(vv), { fontSize: fs, strokeColor: tipo === "ssp" && vv === false ? C.muted : C.testo });
            } else cella(j, kk, { strokeColor: C.line, strokeWidth: 1, fillColor: "none", fillOpacity: 0 });
          }
        }
        if (cur) {
          const { j, k: kk } = cur;
          cella(j, kk, { strokeColor: C.a, strokeWidth: 3, fillColor: C.a, fillOpacity: 0.5 });
          d.text(cx(kk) + cs / 2, cy(j) + cs / 2, vTxt(cur.v), { fontSize: fs, strokeColor: C.testo, cssStyle: "font-weight:800" });
          for (const q of cur.dip) {
            const buono = q.ruolo === "si" || (q.ruolo === "d" && q.d === cur.s);
            const col = q.ruolo === "no" || (q.ruolo === "d" && !buono) ? C.blu : C.verde;
            cella(q.j, q.k, { strokeColor: col, strokeWidth: buono || q.ruolo === "no" ? 3.5 : 2.2, fillColor: "none", fillOpacity: 0, dash: q.ruolo === "no" ? 0 : 2 });
            if (q.ruolo === "d") d.text(cx(q.k) + cs - 4, cy(q.j) + 9, `d=${q.d}`, { anchorX: "right", fontSize: clamp(cs * 0.2, 8, 11), strokeColor: col, cssStyle: "font-weight:700" });
          }
        }
        if (t > 0) {
          vis.forEach((x, i) => {
            if (x.fine) return;
            cella(x.j, x.k, { strokeColor: C.verde, strokeWidth: i === vis.length - 1 ? 4 : 2.5, fillColor: C.verde, fillOpacity: i === vis.length - 1 ? 0.4 : 0.22 });
            d.text(cx(x.k) + cs / 2, cy(x.j) + cs / 2, vTxt(R.V[x.j][x.k]), { fontSize: fs, strokeColor: C.testo, cssStyle: "font-weight:800" });
          });
          if (t >= R.tb.length && R.risposta) {
            const jf = tipo === "ukp" ? R.tb[R.tb.length - 1].j : 0;
            cella(jf, R.kfin, { strokeColor: C.verde, strokeWidth: 3, fillColor: C.verde, fillOpacity: 0.25 });
            d.text(cx(R.kfin) + cs / 2, cy(jf) + cs / 2, vTxt(R.V[jf][R.kfin]), { fontSize: fs, strokeColor: C.testo, cssStyle: "font-weight:800" });
          }
        }
      });
    },
    formula(p, st) {
      const S = dpStato(st), { I, R, k, cur, t, tipo } = S, v = nomeV(tipo);
      if (k === 0) return tipo === "ssp" ? T("r(0,0) = \\mathit{true}, \\quad r(0,k) = \\mathit{false} \\ \\text{per } k \\ge 1", "r(0,0) = \\mathit{true}, \\quad r(0,k) = \\mathit{false} \\ \\text{for } k \\ge 1")
        : T("v(0,k) = 0 \\quad \\text{per ogni } k", "v(0,k) = 0 \\quad \\text{for every } k");
      if (cur) {
        const { j, k: kk } = cur, wj = I.w[j - 1], pj = I.p ? I.p[j - 1] : 0;
        if (tipo === "bkp") {
          const termini = cur.cand.map((q) => `${q.d}\\cdot ${pj} + ${R.V[j - 1][q.k]}`).join(",\\ ");
          return `v(${j},${kk}) = \\max\\{${termini}\\} = ${cur.v}` + (cur.cand.length > 1 ? ` \\quad (d = ${cur.s})` : "");
        }
        if (!cur.ok) return `${v}(${j},${kk}) = ${v}(${j - 1},${kk}) = ${tipo === "ssp" ? `\\mathit{${cur.v}}` : cur.v} \\qquad (w_{${j}} = ${wj} > ${kk})`;
        if (tipo === "ssp") return `r(${j},${kk}) = r(${j - 1},${kk}) \\lor r(${j - 1},${kk - wj}) = \\mathit{${cur.a}} \\lor \\mathit{${cur.b}} = \\mathit{${cur.v}}`;
        const rb = tipo === "kp" ? j - 1 : j;
        return `v(${j},${kk}) = \\max\\{v(${j - 1},${kk}),\\ ${pj} + v(${rb},${kk - wj})\\} = \\max\\{${cur.a},\\ ${pj} + ${cur.b - pj}\\} = ${cur.v}`;
      }
      const x = R.tb[t - 1];
      if (!x) return tipo === "ssp" ? `r(${I.w.length},${I.c}) = \\mathit{false}` : "";
      if (x.fine) return `x = (${R.x.join(", ")})`;
      if (tipo === "ukp") return x.s ? `s[${x.j}][${x.k}] = 1 \\;\\Rightarrow\\; x_{${x.j}} \\leftarrow x_{${x.j}} + 1,\\quad k \\leftarrow ${x.k} - ${I.w[x.j - 1]}` : `s[${x.j}][${x.k}] = 0 \\;\\Rightarrow\\; j \\leftarrow ${x.j - 1}`;
      return `x_{${x.j}} \\leftarrow s[${x.j}][${x.k}] = ${x.s}` + (x.s ? `,\\quad k \\leftarrow ${x.k} - ${x.s > 1 ? x.s + "\\cdot " : ""}${I.w[x.j - 1]} = ${x.k - x.s * I.w[x.j - 1]}` : `,\\quad k = ${x.k}`);
    },
    letture(p, st) {
      const S = dpStato(st), { I, R, k, cur, t, tipo } = S, C = M.COL(st), n = I.w.length, v = nomeV(tipo);
      let nota;
      if (k === 0) {
        const base = tipo === "ssp" ? T("Riga \\(j=0\\): senza oggetti si ottiene solo il valore \\(0\\) (insieme vuoto): \\(r(0,0)=\\mathit{true}\\), gli altri sono \\(\\mathit{false}\\).", "Row \\(j=0\\): with no items only the value \\(0\\) is reachable (empty set): \\(r(0,0)=\\mathit{true}\\), the others are \\(\\mathit{false}\\).")
          : T("Riga \\(j=0\\): senza oggetti il valore è \\(0\\) per ogni capacità.", "Row \\(j=0\\): with no items the value is \\(0\\) for every capacity.");
        nota = base + T(` \\(n = ${n}\\), \\(c = ${I.c}\\): la tabella ha \\(${n}\\cdot ${I.c + 1} = ${R.N}\\) celle da calcolare.`, ` \\(n = ${n}\\), \\(c = ${I.c}\\): the table has \\(${n}\\cdot ${I.c + 1} = ${R.N}\\) cells to compute.`)
          + (tipo === "bkp" ? T(" Ogni cella prova fino a \\(b_j+1\\) valori di \\(d\\).", " Each cell tries up to \\(b_j+1\\) values of \\(d\\).") : "");
      } else if (cur) {
        const { j, k: kk } = cur, wj = I.w[j - 1], pj = I.p ? I.p[j - 1] : 0;
        if (tipo === "bkp") {
          nota = T(`Cella \\((${j},${kk})\\): \\(d\\) copie dell'oggetto ${j}, con \\(d \\le \\min\\{b_{${j}}, \\lfloor ${kk}/${wj} \\rfloor\\} = ${cur.dmax}\\): `, `Cell \\((${j},${kk})\\): \\(d\\) copies of item type ${j}, with \\(d \\le \\min\\{b_{${j}}, \\lfloor ${kk}/${wj} \\rfloor\\} = ${cur.dmax}\\): `)
            + cur.cand.map((q) => (q.d === cur.s ? M.tinta(C.verde, `\\(d=${q.d}\\): ${q.val}`) : `\\(d=${q.d}\\): ${q.val}`)).join("; ")
            + T(`. Vale il massimo, \\(${cur.v}\\) (a pari valore, il \\(d\\) più piccolo): \\(s[${j}][${kk}] = ${cur.s}\\).`, `. The maximum is \\(${cur.v}\\) (on a tie, the smallest \\(d\\)): \\(s[${j}][${kk}] = ${cur.s}\\).`);
        } else if (!cur.ok) {
          nota = T(`Cella \\((${j},${kk})\\): l'oggetto ${j} pesa \\(${wj} > ${kk}\\), non entra: si copia ${M.tinta(C.blu, "la cella sopra")}.`, `Cell \\((${j},${kk})\\): item ${j} weighs \\(${wj} > ${kk}\\), it does not fit: copy ${M.tinta(C.blu, "the cell above")}.`);
        } else if (tipo === "ssp") {
          nota = T(`Cella \\((${j},${kk})\\): il valore \\(${kk}\\) si ottiene senza l'oggetto ${j} se ${M.tinta(C.blu, `\\(r(${j - 1},${kk})\\)`)} è vero, oppure con l'oggetto ${j} se ${M.tinta(C.verde, `\\(r(${j - 1},${kk - wj})\\)`)} è vero. \\(s[${j}][${kk}] = ${cur.s}\\)` + (cur.s ? " (l'oggetto serve)." : "."),
            `Cell \\((${j},${kk})\\): the value \\(${kk}\\) is reachable without item ${j} if ${M.tinta(C.blu, `\\(r(${j - 1},${kk})\\)`)} is true, or with item ${j} if ${M.tinta(C.verde, `\\(r(${j - 1},${kk - wj})\\)`)} is true. \\(s[${j}][${kk}] = ${cur.s}\\)` + (cur.s ? " (the item is needed)." : "."));
        } else {
          const rb = tipo === "kp" ? j - 1 : j;
          nota = T(`Cella \\((${j},${kk})\\): senza l'oggetto ${j}, ${M.tinta(C.blu, "\\(" + cur.a + "\\)")}; ${tipo === "ukp" ? "con una copia in più" : "prendendolo"}, ${M.tinta(C.verde, `\\(${pj} + ${cur.b - pj} = ${cur.b}\\)`)} (cella \\((${rb},${kk - wj})\\)${tipo === "ukp" ? ", la stessa riga" : ""}). Vale il massimo: \\(${cur.v}\\)${cur.s ? "" : " (a pari valore, non si prende)"}.`,
            `Cell \\((${j},${kk})\\): without item ${j}, ${M.tinta(C.blu, "\\(" + cur.a + "\\)")}; ${tipo === "ukp" ? "with one more copy" : "with it"}, ${M.tinta(C.verde, `\\(${pj} + ${cur.b - pj} = ${cur.b}\\)`)} (cell \\((${rb},${kk - wj})\\)${tipo === "ukp" ? ", the same row" : ""}). The maximum is \\(${cur.v}\\)${cur.s ? "" : " (on a tie, the item is not taken)"}.`);
        }
        if (k === R.N) nota += tipo === "ssp" ? (R.risposta ? T(` Tabella completa: \\(r(${n},${I.c}) = \\mathit{true}\\), la risposta è sì. Ora si ricostruisce un sottoinsieme.`, ` Table complete: \\(r(${n},${I.c}) = \\mathit{true}\\), the answer is yes. Now a subset is reconstructed.`) : T(` Tabella completa: \\(r(${n},${I.c}) = \\mathit{false}\\), la risposta è ${M.tinta(C.rosso, "no")}.`, ` Table complete: \\(r(${n},${I.c}) = \\mathit{false}\\), the answer is ${M.tinta(C.rosso, "no")}.`))
          : T(` Tabella completa: il valore ottimo è \\(v(${n},${I.c}) = ${R.val}\\). Ora si risale dalla cella \\((${n},${I.c})\\).`, ` Table complete: the optimal value is \\(v(${n},${I.c}) = ${R.val}\\). Now go back up from cell \\((${n},${I.c})\\).`);
      } else {
        const x = R.tb[t - 1];
        if (!x) nota = T("La risposta è no: nessun sottoinsieme da ricostruire.", "The answer is no: no subset to reconstruct.");
        else if (x.fine) nota = T(`Il ciclo si ferma (\\(k = ${x.k}\\) o \\(j = ${x.j}\\)).`, `The loop stops (\\(k = ${x.k}\\) or \\(j = ${x.j}\\)).`);
        else if (tipo === "ukp") nota = x.s ? T(`\\(s[${x.j}][${x.k}] = 1\\): una copia dell'oggetto ${x.j}, \\(x_{${x.j}} = ${x.x[x.j - 1]}\\); si resta nella riga \\(${x.j}\\), colonna \\(${x.k - I.w[x.j - 1]}\\).`, `\\(s[${x.j}][${x.k}] = 1\\): one copy of item type ${x.j}, \\(x_{${x.j}} = ${x.x[x.j - 1]}\\); stay in row \\(${x.j}\\), column \\(${x.k - I.w[x.j - 1]}\\).`)
          : T(`\\(s[${x.j}][${x.k}] = 0\\): nessuna altra copia dell'oggetto ${x.j}; si sale alla riga \\(${x.j - 1}\\).`, `\\(s[${x.j}][${x.k}] = 0\\): no further copy of item type ${x.j}; go up to row \\(${x.j - 1}\\).`);
        else nota = x.s ? T(`\\(s[${x.j}][${x.k}] = ${x.s}\\): \\(x_{${x.j}} = ${x.s}\\); si sale alla colonna \\(${x.k} - ${x.s > 1 ? x.s + "\\cdot " : ""}${I.w[x.j - 1]} = ${x.k - x.s * I.w[x.j - 1]}\\).`, `\\(s[${x.j}][${x.k}] = ${x.s}\\): \\(x_{${x.j}} = ${x.s}\\); go up to column \\(${x.k} - ${x.s > 1 ? x.s + "\\cdot " : ""}${I.w[x.j - 1]} = ${x.k - x.s * I.w[x.j - 1]}\\).`)
          : T(`\\(s[${x.j}][${x.k}] = 0\\): \\(x_{${x.j}} = 0\\); si sale restando nella colonna \\(${x.k}\\).`, `\\(s[${x.j}][${x.k}] = 0\\): \\(x_{${x.j}} = 0\\); go up staying in column \\(${x.k}\\).`);
        if (t >= R.tb.length && R.risposta) nota += tipo === "ssp" ? T(` Fine: il sottoinsieme \\(\\{${lista(R.presi)}\\}\\) ha peso \\(${R.peso} = c\\).`, ` End: the subset \\(\\{${lista(R.presi)}\\}\\) has weight \\(${R.peso} = c\\).`)
          : T(` Fine: \\(x = (${R.x.join(", ")})\\), peso ${R.peso} ≤ ${I.c}, profitto ${M.tinta(C.verde, String(R.prof))}.`, ` End: \\(x = (${R.x.join(", ")})\\), weight ${R.peso} ≤ ${I.c}, profit ${M.tinta(C.verde, String(R.prof))}.`);
      }
      const fin = t >= R.tb.length && k > R.N;
      const righe = [
        [T("celle calcolate", "cells computed"), `\\(${Math.min(k, R.N)} / ${R.N}\\)`],
        tipo === "ssp" ? [T("risposta \\(r(n,c)\\)", "answer \\(r(n,c)\\)"), k >= R.N ? (R.risposta ? T("sì", "yes") : "no") : "—"]
          : [T(`valore ottimo \\(v(n,c)\\)`, `optimal value \\(v(n,c)\\)`), k >= R.N ? `\\(${R.val}\\)` : "—"],
        [T("soluzione \\(x\\)", "solution \\(x\\)"), fin && R.risposta ? `\\((${R.x.join(",")})\\)` : "—"],
      ];
      return nota + M.tab([DP_FUNZ[tipo].nome, T("valore", "value")], righe, -1, C.a);
    },
    domanda: T("Confronta le quattro ricorrenze sulla stessa tabella: da quali celle dipende la cella arancione? Nello UKP la cella verde sta nella stessa riga: perché? Nel BKP conta le celle guardate per ogni cella.",
      "Compare the four recurrences on the same table: which cells does the orange cell depend on? In the UKP the green cell is in the same row: why? In the BKP count the cells examined for each cell."),
  };

  window.GI_PD_A = { dpCalcola, DP_ES };
})();
