/* Laboratorio di «Programmazione dinamica / Dynamic Programming»: lot sizing.
 *
 *   oc-wagner-whitin  lot sizing senza capacità (ULS): la ricorrenza v(t) = min_j {v(j-1) + c_{j,t}} di Wagner e
 *                     Whitin, un confronto alla volta (DP_WW_InfoSol del capitolo «DP for the uncapacitated lot
 *                     sizing problem»), sulla matrice c[j][t] e sulla rete dei lotti di produzione (nodi 0..m,
 *                     arco (j-1, t) di costo c_{j,t}); poi la ricostruzione con r[t] (DP_WW_SolComputation)
 *
 * Estratta il 2026-11-21 da gi-oc-e.js di Problemi di ottimizzazione combinatoria (la chiave dell'app resta oc-wagner-whitin).
 * Notazione del corso: d_t, sc_t, vc_t, hc_t, D_{j,t}, c_{j,t}, v(t), r[t]. Le funzioni di calcolo sono in
 * window.GI_PD_B. Verde riservato ai tagli: qui non si usa.
 */
(function () {
  "use strict";
  const GI = window.GI, M = window.GI_MIP, O = window.GI_OC;
  const T = GI.T;
  const { PASSO, parPasso, vaiA, clamp, lista, nuovoId, osservaDimensioni, dim, pix, disegno, daIndirizzo, chiedi } = O;
  window.GI_RICETTE = window.GI_RICETTE || {};
  /** spezzata in pixel (origine in alto a sinistra) */
  const spezz = (crea, H, P, a) => crea("curve", [P.map((p) => p[0]), P.map((p) => H - p[1])], Object.assign({ fixed: true, highlight: false, strokeWidth: 1 }, a));
  /** interi ≥ 0 da una stringa; null se non validi */
  const naturali = (s) => {
    const v = String(s).split(/[\s,]+/).filter(Boolean).map(Number);
    return v.length && v.every((x) => Number.isInteger(x) && x >= 0) ? v : null;
  };
  const INF = "+\\infty";

  // =================================================================
  // 1. WAGNER-WHITIN PER IL LOT SIZING SENZA CAPACITÀ (ULS)
  // =================================================================
  const WW_ES = [
    { nome: T("esempio 1 del capitolo (m = 5)", "Example 1 of the chapter (m = 5)"), d: [20, 10, 30, 40, 10], sc: [50, 50, 50, 50, 50], vc: [0, 0, 0, 0, 0], hc: [1, 1, 1, 1, 1] },
    { nome: T("esercizio 10.1 (m = 4)", "Exercise 10.1 (m = 4)"), d: [30, 10, 40, 10], sc: [50, 80, 70, 60], vc: [2, 3, 1, 2], hc: [1, 2, 2, 1] },
    { nome: T("esercizio 10.2 (m = 4)", "Exercise 10.2 (m = 4)"), d: [30, 40, 10, 20], sc: [50, 80, 80, 50], vc: [1, 3, 2, 1], hc: [1, 1, 1, 2] },
    { nome: T("esercizio 10.3 (m = 5)", "Exercise 10.3 (m = 5)"), d: [10, 30, 40, 30, 40], sc: [70, 80, 50, 80, 50], vc: [1, 1, 1, 1, 2], hc: [1, 1, 2, 1, 2] },
  ];
  /** CostMatrix, DP_WW_InfoSol (un passo per ogni confronto e uno per ogni v[t]) e DP_WW_SolComputation */
  function wwCalcola(I) {
    const { d, sc, vc, hc } = I, m = d.length;
    const D = (j, t) => { let s = 0; for (let k = j; k <= t; k++) s += d[k - 1]; return s; };
    const c = Array.from({ length: m + 1 }, () => new Array(m + 1).fill(null));
    for (let j = 1; j <= m; j++) {
      let u = vc[j - 1], g = sc[j - 1] + vc[j - 1] * d[j - 1];
      c[j][j] = g;
      for (let t = j + 1; t <= m; t++) { u += hc[t - 2]; g += u * d[t - 1]; c[j][t] = g; }
    }
    const v = [0], r = [null], passi = [];
    for (let t = 1; t <= m; t++) {
      let b = Infinity, a = 0;
      for (let j = 1; j <= t; j++) {
        const val = v[j - 1] + c[j][t], prima = b, agg = val < b;
        if (agg) { b = val; a = j; }
        passi.push({ tipo: "j", t, j, val, prima, agg, b, a });
      }
      v[t] = b; r[t] = a;
      passi.push({ tipo: "v", t, b, a });
    }
    const N = passi.length, x = new Array(m).fill(0);
    let t = m;
    while (t > 0) {
      const j = r[t];
      x[j - 1] = D(j, t);
      passi.push({ tipo: "r", t, j, q: x[j - 1], x: x.slice() });
      t = j - 1;
    }
    const s = [];
    let cum = 0;
    for (let k = 1; k <= m; k++) { cum += x[k - 1] - d[k - 1]; s.push(cum); }
    const setup = x.reduce((acc, xi, i) => acc + (xi > 0 ? sc[i] : 0), 0);
    const prod = x.reduce((acc, xi, i) => acc + vc[i] * xi, 0);
    const hold = s.reduce((acc, si, i) => acc + hc[i] * si, 0);
    return { m, c, v, r, D, passi, N, K: passi.length, x, s, setup, prod, hold };
  }
  /** c_{j,t} = sc_j + vc_j D_{j,t} + Σ_{k=j}^{t-1} hc_k D_{k+1,t}, scritto per esteso (TeX) */
  function costoTex(I, R, j, t) {
    const pz = [`${I.sc[j - 1]}`, `${I.vc[j - 1]}\\cdot ${R.D(j, t)}`];
    for (let k = j; k < t; k++) pz.push(`${I.hc[k - 1]}\\cdot ${R.D(k + 1, t)}`);
    return `c_{${j},${t}} = ${pz.join(" + ")} = ${R.c[j][t]}`;
  }
  function wwCasuale() {
    const m = M.casuale(4, 6), d = [], sc = [], vc = [], hc = [];
    for (let t = 0; t < m; t++) { d.push(10 * M.casuale(1, 5)); sc.push(10 * M.casuale(5, 9)); vc.push(M.casuale(0, 3)); hc.push(M.casuale(1, 2)); }
    return { d, sc, vc, hc };
  }
  const wwCopia = (E) => ({ d: E.d.slice(), sc: E.sc.slice(), vc: E.vc.slice(), hc: E.hc.slice() });
  function wwStato(st) {
    const D = st.dati;
    if (!D.ww) D.ww = Object.assign(wwCopia(WW_ES[0]), { id: nuovoId(), es: 0 });
    const I = D.ww;
    if (D.wwId !== I.id) { D.wwId = I.id; D.wwR = wwCalcola(I); }
    const R = D.wwR, k = M.passoK(st, R.K, PASSO);
    return { D, I, R, k, cur: k >= 1 ? R.passi[k - 1] : null };
  }
  /** istanza iniziale da un link: #ist=2 (indice nel menu «Istanza») */
  const istDaIndirizzo = (st, voci) => {
    if (st.dati.istLetta) return -1;
    st.dati.istLetta = true;
    const m = /ist=(\d+)/.exec(decodeURIComponent(location.hash || ""));
    return m && +m[1] < voci.length ? +m[1] : -1;
  };
  const vTex = (x) => (x === Infinity ? INF : String(x));

  window.GI_RICETTE["oc-wagner-whitin"] = {
    titolo: T("Wagner-Whitin per il lot sizing senza capacità", "Wagner-Whitin for uncapacitated lot sizing"),
    parametri: [parPasso(T("◀ ▶ un confronto alla volta, «Esegui» per vederli tutti", "◀ ▶ one comparison at a time, «Run» to watch them all"), 0)],
    assi: false,
    opzioniBoard: M.OPZ,
    vista: [-1, 10, 20, -2],
    legenda: (st) => {
      const C = M.COL(st);
      return [
        [C.a, T("lotto in esame: \\(v(j-1)+c_{j,t}\\)", "run under examination: \\(v(j-1)+c_{j,t}\\)"), ""],
        [C.b, T("lotti già provati per \\(v(t)\\)", "runs already tried for \\(v(t)\\)"), "dashed"],
        [C.rosso, T("il migliore finora (\\(b\\), \\(a\\))", "the best so far (\\(b\\), \\(a\\))"), ""],
        [C.blu, T("\\(r[t]\\): ultimo lotto scelto; poi il piano ottimo \\(\\tilde{x}\\)", "\\(r[t]\\): last run chosen; then the optimal plan \\(\\tilde{x}\\)"), ""],
      ];
    },
    monta(board, st) {
      const D = st.dati, i0 = istDaIndirizzo(st, WW_ES);
      if (i0 >= 0) D.ww = Object.assign(wwCopia(WW_ES[i0]), { id: nuovoId(), es: i0 });
      const nuova = (I, es = -1) => { D.ww = Object.assign(I, { id: nuovoId(), es }); vaiA(st, 0); M.ferma(st); st.aggiorna(); };
      M.comandi(st, [
        [T("Casuale", "Random"), T("dati casuali", "random data"), () => nuova(wwCasuale())],
        [T("Modifica…", "Edit…"), T("scrivi i dati dell'istanza", "type the data of the instance"), () => {
          const I = D.ww, attuale = [I.d, I.sc, I.vc, I.hc].map((v) => v.join(" ")).join(" ; ");
          const s = chiedi(T("Domande d, costi di setup sc, costi variabili vc, costi di stoccaggio hc, separati da «;» (da 2 a 7 periodi):",
            "Demands d, setup costs sc, variable costs vc, holding costs hc, separated by «;» (2 to 7 periods):"), attuale);
          if (!s) return;
          const P = s.split(";").map((x) => naturali(x || ""));
          const ok = P.length === 4 && P.every(Boolean) && P.every((v) => v.length === P[0].length) && P[0].length >= 2 && P[0].length <= 7
            && P[0].every((x) => x >= 1 && x <= 999) && P.every((v) => v.every((x) => x <= 999));
          if (!ok) { window.alert(T("Dati non validi: quattro vettori di interi ≥ 0 della stessa lunghezza (da 2 a 7), domande ≥ 1.", "Invalid data: four vectors of integers ≥ 0 of the same length (2 to 7), demands ≥ 1.")); return; }
          nuova({ d: P[0], sc: P[1], vc: P[2], hc: P[3] });
        }],
      ], { k: PASSO, ritmo: 700 });
      D.nuovaWW = nuova;
      O.menuIstanze(st, WW_ES.map((e) => [e.nome, ""]), () => (D.ww ? D.ww.es : 0), (i) => nuova(wwCopia(WW_ES[i]), i));
      osservaDimensioni(board, st);
      daIndirizzo(st);
    },
    aggiorna(board, st) {
      const S = wwStato(st), C = M.COL(st), [W, H] = dim(board), { I, R, k, cur } = S, m = R.m;
      if (S.D.nuovaWW) O.menuIstanze(st, WW_ES.map((e) => [e.nome, ""]), () => I.es, (i) => S.D.nuovaWW(wwCopia(WW_ES[i]), i));
      M.ridisegna(board, st, [S.D.wwId, k, M.scuro(), W, H].join("|"), (crea) => {
        pix(board);
        const d = disegno(crea, H);
        /** etichetta allineata a destra in xr, con il pedice (testo SVG: niente HTML, che si sposta in verticale) */
        const etich = (xr, y, base, ped, a) => {
          const f = a.fontSize, it = "font-style:italic;";
          if (ped) d.text(xr, y + 0.32 * f, ped, Object.assign({}, a, { anchorX: "right", fontSize: 0.72 * f, cssStyle: it }));
          d.text(xr - (ped ? 0.32 * f * ped.length + 1 : 0), y, base, Object.assign({}, a, { anchorX: "right", cssStyle: it }));
        };
        // ------------------------------------------------ stato del passo
        const fatti = R.passi.slice(0, k);
        const vNoto = new Array(m + 1).fill(false);
        vNoto[0] = true;
        for (const p of fatti) if (p.tipo === "v") vNoto[p.t] = true;
        const tc = cur && cur.tipo !== "r" ? cur.t : null;
        const jc = cur && cur.tipo === "j" ? cur.j : null;
        const jMax = cur && cur.tipo === "j" ? cur.j : cur && cur.tipo === "v" ? cur.t : 0;
        const best = cur && cur.tipo !== "r" ? cur.a : null;
        const rec = fatti.filter((p) => p.tipo === "r");
        const xcur = rec.length ? rec[rec.length - 1].x : null;
        const sulCammino = (j, t) => rec.some((p) => p.j === j && p.t === t);
        const nodoCammino = (i) => rec.some((p) => p.t === i || p.j - 1 === i);
        /** stile dell'arco (j-1, t) e della cella c[j][t] */
        const stile = (j, t) => {
          if (sulCammino(j, t)) return { col: C.blu, w: 4.5, lab: true, fill: 0.45 };
          if (tc === t && j <= jMax) {
            if (j === jc) return { col: C.a, w: 3.5, lab: true, fill: 0.55 };
            if (cur.tipo === "v" && j === best) return { col: C.blu, w: 4, lab: true, fill: 0.4 };
            if (j === best) return { col: C.rosso, w: 3, lab: true, fill: 0.2 };
            return { col: C.b, w: 2, lab: true, dash: 3, fill: 0.1 };
          }
          if (vNoto[t] && R.r[t] === j) return { col: C.blu, w: 1.8, op: 0.6, fill: 0.14 };
          return null;
        };
        // ------------------------------------------------ colonna di sinistra: dati e matrice c[j][t]
        const pad = 10, top = 14, Lw = clamp(W * 0.42, 250, 540);
        const lab = clamp(Lw * 0.2, 54, 84), cw = (Lw - lab - pad) / m;
        const rh = clamp((H - top - 24) / (m + 6.6), 15, 36);
        const fs = clamp(Math.min(rh * 0.5, cw * 0.3), 9, 15), fl = clamp(fs * 0.95, 9, 14);
        const cx = (t) => lab + (t - 0.5) * cw;
        const cella = (x, y, w, h, a) => d.rect(x + 1, y + 1, w - 2, h - 2, Object.assign({ strokeColor: C.line, strokeWidth: 1, fillColor: "none", fillOpacity: 0 }, a));
        const righe = [[["t", ""], null], [["d", "t"], I.d], [["sc", "t"], I.sc], [["vc", "t"], I.vc], [["hc", "t"], I.hc]];
        // periodi coperti dal lotto in esame (j..t), o dal lotto della ricostruzione
        const lotto = jc ? [jc, tc] : cur && cur.tipo === "v" ? [cur.a, cur.t] : cur && cur.tipo === "r" ? [cur.j, cur.t] : null;
        righe.forEach(([nm, val], i) => {
          const y = top + i * rh;
          etich(lab - 8, y + rh / 2, nm[0], nm[1], { fontSize: fl, strokeColor: i ? C.testo : C.muted });
          for (let t = 1; t <= m; t++) {
            const dentro = i === 1 && lotto && t >= lotto[0] && t <= lotto[1];
            if (i) cella(lab + (t - 1) * cw, y, cw, rh, dentro ? { fillColor: cur.tipo === "j" ? C.a : C.blu, fillOpacity: 0.22 } : {});
            d.text(cx(t), y + rh / 2, i ? String(val[t - 1]) : String(t), { fontSize: fs, strokeColor: i ? C.testo : C.muted, cssStyle: i ? "" : "font-weight:700" });
          }
        });
        const y0 = top + 5.6 * rh;
        etich(lab - 8, y0 + rh / 2, "c[j][t]", "", { fontSize: fl, strokeColor: C.muted });
        for (let t = 1; t <= m; t++) d.text(cx(t), y0 + rh / 2, `t=${t}`, { fontSize: fl, strokeColor: tc === t ? C.a : C.muted, cssStyle: "font-weight:700" });
        for (let j = 1; j <= m; j++) {
          const y = y0 + j * rh;
          d.text(lab - 8, y + rh / 2, `j=${j}`, { anchorX: "right", fontSize: fl, strokeColor: C.muted, cssStyle: "font-weight:600" });
          for (let t = 1; t <= m; t++) {
            if (j > t) { d.text(cx(t), y + rh / 2, "−", { fontSize: fs, strokeColor: C.grigio }); continue; }
            const s = stile(j, t);
            cella(lab + (t - 1) * cw, y, cw, rh, s ? { strokeColor: s.col, strokeWidth: s.w > 2.5 ? 3 : 2, dash: s.dash || 0, fillColor: s.col, fillOpacity: s.fill } : {});
            d.text(cx(t), y + rh / 2, String(R.c[j][t]), { fontSize: fs, strokeColor: C.testo, cssStyle: s && s.w > 2.5 ? "font-weight:800" : "" });
          }
        }
        // ------------------------------------------------ colonna di destra: la rete dei lotti e i vettori v, r, x̃
        const x0 = Lw + 26, lab2 = 58, Rw = W - x0 - pad;
        const sp = (Rw - lab2) / (m + 1), xs = (i) => x0 + lab2 + (i + 0.5) * sp;
        const tabH = 4 * rh + 10, yAx = H - tabH - clamp(rh * 1.6, 30, 50), hmax = yAx - top - 30;
        const rn = clamp(sp * 0.2, 10, 16);
        const archi = [];
        for (let t = 1; t <= m; t++) for (let j = 1; j <= t; j++) archi.push([j, t]);
        const forma = (j, t) => {
          const a = xs(j - 1), b = xs(t), s = t - j + 1, h = hmax * (0.16 + 0.84 * (m > 1 ? (s - 1) / (m - 1) : 0));
          const P = [];
          for (let i = 0; i <= 36; i++) { const u = i / 36; P.push([a + (b - a) * u, yAx - h * Math.sin(Math.PI * u)]); }
          return { P, xm: (a + b) / 2, ym: yAx - h };
        };
        d.text(x0, top + 4, T("rete dei lotti: arco (j−1, t) di costo c(j,t)", "network of the production runs: arc (j−1, t) of cost c(j,t)"), { anchorX: "left", fontSize: fl, strokeColor: C.muted, cssStyle: "font-style:italic" });
        const conStile = [];
        for (const [j, t] of archi) {
          const s = stile(j, t), f = forma(j, t);
          if (!s) spezz(crea, H, f.P, { strokeColor: C.grigio, strokeWidth: 1, strokeOpacity: 0.4 });
          else conStile.push([j, t, s, f]);
        }
        conStile.sort((A, B) => A[2].w - B[2].w);
        for (const [, , s, f] of conStile) spezz(crea, H, f.P, { strokeColor: s.col, strokeWidth: s.w, strokeOpacity: s.op || 1, dash: s.dash || 0 });
        for (const [j, t, s, f] of conStile) if (s.lab) {
          d.rect(f.xm - 19, f.ym - 9 - 8, 38, 16, { strokeColor: "none", fillColor: M.scuro() ? "#1e2a3a" : "#ffffff", fillOpacity: 0.9 });
          d.text(f.xm, f.ym - 9, String(R.c[j][t]), { fontSize: fl, strokeColor: s.col, cssStyle: "font-weight:800" });
        }
        for (let i = 0; i <= m; i++) {
          const camm = nodoCammino(i), att = i === tc, sorg = jc && i === jc - 1;
          d.dot(xs(i), yAx, rn, { fillColor: camm ? C.blu : vNoto[i] ? C.b : (M.scuro() ? "#1b2636" : "#ffffff"), fillOpacity: camm ? 0.9 : vNoto[i] ? 0.35 : 1,
            strokeColor: att || sorg ? C.a : camm ? C.blu : C.muted, strokeWidth: att || sorg ? 3.5 : 1.8 });
          d.text(xs(i), yAx, String(i), { fontSize: clamp(rn * 0.95, 10, 15), strokeColor: camm ? "#ffffff" : C.testo, cssStyle: "font-weight:800;pointer-events:none" });
        }
        // vettori sotto la rete, allineati ai nodi
        const yt = H - tabH;
        const vr = [[["v(t)", ""], (i) => (vNoto[i] ? String(R.v[i]) : "")], [["r[t]", ""], (i) => (i > 0 && vNoto[i] ? String(R.r[i]) : i ? "" : "−")],
          [["x̃", "t"], (i) => (i === 0 ? "−" : xcur ? String(xcur[i - 1]) : "")]];
        vr.forEach(([nm, f], q) => {
          const y = yt + q * rh;
          etich(xs(0) - sp / 2 - 6, y + rh / 2, nm[0], nm[1], { fontSize: fl, strokeColor: C.muted });
          for (let i = 0; i <= m; i++) {
            let a = {};
            if (q === 0 && cur && cur.tipo === "j" && i === cur.j - 1) a = { strokeColor: C.a, strokeWidth: 3 };
            if ((q === 0 || q === 1) && cur && cur.tipo === "v" && i === cur.t) a = { strokeColor: C.blu, strokeWidth: 3, fillColor: C.blu, fillOpacity: 0.25 };
            if (q === 1 && cur && cur.tipo === "r" && i === cur.t) a = { strokeColor: C.blu, strokeWidth: 3 };
            if (q === 2 && cur && cur.tipo === "r" && i === cur.j) a = { strokeColor: C.blu, strokeWidth: 3, fillColor: C.blu, fillOpacity: 0.25 };
            cella(xs(i) - sp / 2, y, sp, rh, a);
            d.text(xs(i), y + rh / 2, f(i), { fontSize: fs, strokeColor: C.testo, cssStyle: a.strokeWidth ? "font-weight:800" : "" });
          }
        });
        if (k === R.K) {
          d.text(W - pad, H - 0.5 * rh, T(`costo di x̃ = ${R.setup} + ${R.prod} + ${R.hold} = ${R.v[m]}`, `cost of x̃ = ${R.setup} + ${R.prod} + ${R.hold} = ${R.v[m]}`),
            { anchorX: "right", fontSize: clamp(fs * 1.1, 11, 16), strokeColor: C.blu, cssStyle: "font-weight:800" });
        }
      });
    },
    formula(p, st) {
      const S = wwStato(st), { R, k, cur } = S, m = R.m;
      if (!cur) return T("v(0) = 0, \\qquad v(t) = \\min\\big\\{\\, v(j-1) + c_{j,t} : j \\in \\{1,\\dots,t\\} \\big\\}", "v(0) = 0, \\qquad v(t) = \\min\\big\\{\\, v(j-1) + c_{j,t} : j \\in \\{1,\\dots,t\\} \\big\\}");
      if (cur.tipo === "j") {
        const { t, j, val, prima, agg } = cur;
        return `v(${j - 1}) + c_{${j},${t}} = ${R.v[j - 1]} + ${R.c[j][t]} = ${val}` +
          (agg ? ` < ${vTex(prima)} \\;\\Rightarrow\\; b \\leftarrow ${val},\\ a \\leftarrow ${j}` : ` ${val === prima ? "=" : ">"} b = ${prima}`);
      }
      if (cur.tipo === "v") {
        const termini = [];
        for (let j = 1; j <= cur.t; j++) termini.push(`${R.v[j - 1]}+${R.c[j][cur.t]}`);
        return `v(${cur.t}) = \\min\\{${termini.join(",\\ ")}\\} = ${cur.b}, \\qquad r[${cur.t}] = ${cur.a}`;
      }
      const fine = k === R.K;
      return `x_{${cur.j}} \\leftarrow D_{${cur.j},${cur.t}} = ${cur.q}, \\quad t \\leftarrow ${cur.j} - 1 = ${cur.j - 1}` + (fine ? `\\qquad \\tilde{x} = (${R.x.join(", ")})` : "");
    },
    letture(p, st) {
      const S = wwStato(st), { I, R, k, cur } = S, C = M.COL(st), m = R.m;
      let nota;
      if (!cur) {
        nota = T(`\\(m = ${m}\\) periodi. La matrice \\(c\\) dei costi dei lotti è già calcolata (CostMatrix): \\(c_{j,t}\\) è il costo di produrre nel periodo \\(j\\) le domande dei periodi \\(j,\\dots,t\\). `
          + `Ora DP_WW_InfoSol calcola \\(v(1),\\dots,v(${m})\\): per ogni \\(t\\) prova tutti i periodi \\(j\\) dell'ultimo lotto, con \\(b\\) il valore migliore e \\(a\\) il suo periodo. `
          + `Nella rete, \\(v(t)\\) è la lunghezza di un cammino minimo dal nodo 0 al nodo \\(t\\).`,
        `\\(m = ${m}\\) periods. The matrix \\(c\\) of the production-run costs is already computed (CostMatrix): \\(c_{j,t}\\) is the cost of producing in period \\(j\\) the demands of periods \\(j,\\dots,t\\). `
          + `Now DP_WW_InfoSol computes \\(v(1),\\dots,v(${m})\\): for each \\(t\\) it tries every period \\(j\\) of the last production run, with \\(b\\) the best value and \\(a\\) its period. `
          + `In the network, \\(v(t)\\) is the length of a shortest path from node 0 to node \\(t\\).`);
      } else if (cur.tipo === "j") {
        const { t, j, val, prima, agg } = cur;
        nota = (j === 1 ? T(`Periodo \\(t = ${t}\\): \\(b \\leftarrow +\\infty\\), \\(a \\leftarrow 0\\). `, `Period \\(t = ${t}\\): \\(b \\leftarrow +\\infty\\), \\(a \\leftarrow 0\\). `) : "")
          + T(`Ultimo lotto nel periodo \\(${j}\\): produce \\(D_{${j},${t}} = ${R.D(j, t)}\\) unità per i periodi \\(${j},\\dots,${t}\\), con \\(${costoTex(I, R, j, t)}\\). `,
            `Last production run in period \\(${j}\\): it produces \\(D_{${j},${t}} = ${R.D(j, t)}\\) units for periods \\(${j},\\dots,${t}\\), with \\(${costoTex(I, R, j, t)}\\). `)
          + T(`Prima, i periodi \\(1,\\dots,${j - 1}\\) costano ${M.tinta(C.a, `\\(v(${j - 1}) = ${R.v[j - 1]}\\)`)}: in tutto \\(${val}\\). `, `Before it, periods \\(1,\\dots,${j - 1}\\) cost ${M.tinta(C.a, `\\(v(${j - 1}) = ${R.v[j - 1]}\\)`)}: \\(${val}\\) in total. `)
          + (agg ? T(`È meglio di \\(b = ${vTex(prima)}\\): ${M.tinta(C.rosso, `\\(b \\leftarrow ${val}\\), \\(a \\leftarrow ${j}\\)`)}.`, `It is better than \\(b = ${vTex(prima)}\\): ${M.tinta(C.rosso, `\\(b \\leftarrow ${val}\\), \\(a \\leftarrow ${j}\\)`)}.`)
            : val === prima ? T(`Stesso valore di \\(b = ${prima}\\): il confronto stretto tiene \\(a = ${cur.a}\\), il periodo più piccolo (con \\(a = ${j}\\) si avrebbe un altro piano ottimo).`, `Same value as \\(b = ${prima}\\): the strict comparison keeps \\(a = ${cur.a}\\), the smallest period (\\(a = ${j}\\) would give another optimal plan).`)
              : T(`Non migliora \\(b = ${prima}\\).`, `It does not improve \\(b = ${prima}\\).`));
      } else if (cur.tipo === "v") {
        nota = T(`Tutti i periodi \\(j \\le ${cur.t}\\) sono stati provati: ${M.tinta(C.blu, `\\(v(${cur.t}) = ${cur.b}\\), \\(r[${cur.t}] = ${cur.a}\\)`)}. Nella rete l'arco \\((${cur.a - 1}, ${cur.t})\\) chiude un cammino minimo fino al nodo \\(${cur.t}\\).`,
          `All periods \\(j \\le ${cur.t}\\) have been tried: ${M.tinta(C.blu, `\\(v(${cur.t}) = ${cur.b}\\), \\(r[${cur.t}] = ${cur.a}\\)`)}. In the network the arc \\((${cur.a - 1}, ${cur.t})\\) ends a shortest path to node \\(${cur.t}\\).`);
        if (cur.t === m) nota += T(` Il valore ottimo è \\(v(${m}) = ${R.v[m]}\\). Ora si ricostruisce un piano ottimo con il vettore \\(r\\), da \\(t = ${m}\\).`, ` The optimal value is \\(v(${m}) = ${R.v[m]}\\). Now an optimal plan is reconstructed with the vector \\(r\\), from \\(t = ${m}\\).`);
      } else {
        const { t, j, q } = cur;
        nota = T(`\\(t = ${t}\\), \\(r[${t}] = ${j}\\): l'ultimo lotto dei periodi \\(1,\\dots,${t}\\) è nel periodo \\(${j}\\) e copre i periodi \\(${j},\\dots,${t}\\): \\(x_{${j}} \\leftarrow ${q}\\); poi \\(t \\leftarrow ${j - 1}\\).`,
          `\\(t = ${t}\\), \\(r[${t}] = ${j}\\): the last production run of periods \\(1,\\dots,${t}\\) is in period \\(${j}\\) and covers periods \\(${j},\\dots,${t}\\): \\(x_{${j}} \\leftarrow ${q}\\); then \\(t \\leftarrow ${j - 1}\\).`);
        if (k === R.K) nota += T(` Fine (\\(t = 0\\)): il piano ottimo è ${M.tinta(C.blu, `\\(\\tilde{x} = (${R.x.join(", ")})\\)`)}, con scorte \\(s = (${R.s.join(", ")})\\); costo \\(${R.setup}\\) di setup \\(+\\ ${R.prod}\\) di produzione \\(+\\ ${R.hold}\\) di stoccaggio \\(= ${R.v[m]} = v(${m})\\).`,
          ` End (\\(t = 0\\)): the optimal plan is ${M.tinta(C.blu, `\\(\\tilde{x} = (${R.x.join(", ")})\\)`)}, with inventories \\(s = (${R.s.join(", ")})\\); cost \\(${R.setup}\\) for setups \\(+\\ ${R.prod}\\) for production \\(+\\ ${R.hold}\\) for holding \\(= ${R.v[m]} = v(${m})\\).`);
      }
      const confronti = R.passi.slice(0, k).filter((x) => x.tipo === "j").length;
      const righe = [
        [T("confronti \\(v(j-1)+c_{j,t}\\)", "comparisons \\(v(j-1)+c_{j,t}\\)"), `\\(${confronti} / ${m * (m + 1) / 2}\\)`],
        [T(`valore ottimo \\(v(${m})\\)`, `optimal value \\(v(${m})\\)`), k >= R.N ? `\\(${R.v[m]}\\)` : "—"],
        [T("piano ottimo \\(\\tilde{x}\\)", "optimal plan \\(\\tilde{x}\\)"), k === R.K ? `\\((${R.x.join(",")})\\)` : "—"],
      ];
      return nota + M.tab([T("lot sizing senza capacità (ULS)", "uncapacitated lot sizing (ULS)"), T("valore", "value")], righe, -1, C.a);
    },
    domanda: T("Nell'esempio 1, al calcolo di \\(v(5)\\) i periodi \\(j = 3\\) e \\(j = 4\\) danno lo stesso valore: quale piano ottimo si ottiene scegliendo \\(j = 4\\)? Con «Modifica…» prova costi di stoccaggio più alti: i lotti si accorciano?",
      "In Example 1, when \\(v(5)\\) is computed the periods \\(j = 3\\) and \\(j = 4\\) give the same value: which optimal plan does \\(j = 4\\) give? With «Edit…» try higher holding costs: do the production runs get shorter?"),
  };

  window.GI_PD_B = { wwCalcola, WW_ES };
})();
