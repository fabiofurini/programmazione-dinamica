// Autovalutazione — domande generate del modulo «Programmazione dinamica» (dynamic-programming).
// Portate il 2026-11-21 da Problemi di ottimizzazione combinatoria (i generatori dei capitoli dp-*, con gli aiuti che usano).
// Formato: QUIZ_SPEC.md. Ogni generatore riceve rng() in [0,1) e la lingua ("it" | "en") e restituisce
// { testo, opzioni[4], corretta, spiegazione, _v }. Il campo _v (dati dell'istanza e valori delle opzioni)
// serve solo al gemello di verifica in Python (quiz/verifica/): il motore lo ignora.
// Nessuna dipendenza esterna, niente Math.random: solo rng.
window.QUIZ_GEN = window.QUIZ_GEN || {};
(function () {
  "use strict";
  var MOD = "dynamic-programming";
  var EN = "https://fabiofurini.github.io/dynamic-programming/";
  var IT = "https://fabiofurini.github.io/programmazione-dinamica/";
  function L(en, it) { return { en: EN + en, it: IT + it }; }

  // ---------------------------------------------------------------- aiuti e algoritmi
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function shuffle(rng, a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function T(lingua, it, en) { return lingua === "it" ? it : en; }
  function vec(a) { return "(" + a.join(",") + ")"; }
  function set(a) { return a.length ? "\\{" + a.slice().sort(function (x, y) { return x - y; }).join(",") + "\\}" : "\\emptyset"; }
  function range1(n) { var r = []; for (var i = 1; i <= n; i++) r.push(i); return r; }
  // tabella orizzontale: righe = [[etichetta, valori...], ...]
  function tab(head, rows) {
    var cols = head.length - 1, s = "$\\begin{array}{c|" + new Array(cols + 1).join("c") + "}" + head.join(" & ") + "\\\\ \\hline ";
    s += rows.map(function (r) { return r.join(" & "); }).join("\\\\ ") + "\\end{array}$";
    return s;
  }
  // matrice delle distanze (simmetrica, d[i][j] con indici 1..n)
  function build(rng, giusta, cand) {
    var used = {}, usedT = {}; used[giusta.k] = 1; usedT[giusta.t] = 1; var ds = [];
    for (var i = 0; i < cand.length && ds.length < 3; i++) {
      var c = cand[i];
      if (c && c.k !== undefined && c.t !== undefined && !used[c.k] && !usedT[c.t]) { used[c.k] = 1; usedT[c.t] = 1; ds.push(c); }
    }
    if (ds.length < 3) return null;
    var all = shuffle(rng, [giusta].concat(ds));
    var idx = 0; for (var j = 0; j < 4; j++) if (all[j] === giusta) idx = j;
    var testi = all.map(function (o) { return o.t; });
    var seen = {}; for (j = 0; j < 4; j++) { if (seen[testi[j]]) return null; seen[testi[j]] = 1; }
    return { opzioni: testi, corretta: idx, valori: all.map(function (o) { return o.k; }) };
  }
  function num(v) { return { k: String(v), t: "$" + v + "$" }; }
  function retry(f) {
    return function (rng, lingua) {
      for (var it = 0; it < 500; it++) { var r = f(rng, lingua); if (r) return r; }
      throw new Error("generatore senza istanza valida");
    };
  }
  function add(g) { g.genera = retry(g.genera); (QUIZ_GEN[MOD] = QUIZ_GEN[MOD] || []).push(g); }
  function effOrder(p, w) { // indici 0..n-1 per efficienza non crescente, pari merito: indice minore
    return range1(p.length).map(function (i) { return i - 1; }).sort(function (a, b) {
      var x = p[a] * w[b], y = p[b] * w[a]; return x !== y ? y - x : a - b;
    });
  }
  function kpOpt(p, w, c) { // DP v(j,k); restituisce tabella
    var n = p.length, v = [];
    for (var j = 0; j <= n; j++) { v.push([]); for (var k = 0; k <= c; k++) v[j].push(0); }
    for (j = 1; j <= n; j++) for (k = 1; k <= c; k++) {
      v[j][k] = v[j - 1][k];
      if (w[j - 1] <= k && p[j - 1] + v[j - 1][k - w[j - 1]] > v[j][k]) v[j][k] = p[j - 1] + v[j - 1][k - w[j - 1]];
    }
    return v;
  }
  function kpOptSets(p, w, c) { // tutti gli insiemi ottimi (n piccolo)
    var n = p.length, best = -1, sets = [];
    for (var m = 0; m < (1 << n); m++) {
      var pp = 0, ww = 0, s = [];
      for (var j = 0; j < n; j++) if (m & (1 << j)) { pp += p[j]; ww += w[j]; s.push(j + 1); }
      if (ww > c) continue;
      if (pp > best) { best = pp; sets = [s]; } else if (pp === best) sets.push(s);
    }
    return { z: best, sets: sets };
  }
  function greedyOrder(order, p, w, c) {
    var rc = c, z = 0, s = [];
    order.forEach(function (j) { if (w[j] <= rc) { rc -= w[j]; z += p[j]; s.push(j + 1); } });
    return { z: z, set: s };
  }
  function ukp(p, w, c) { var v = [0]; for (var k = 1; k <= c; k++) { var b = 0; for (var j = 0; j < p.length; j++) if (w[j] <= k && p[j] + v[k - w[j]] > b) b = p[j] + v[k - w[j]]; v.push(b); } return v; }
  // bin packing: restituisce vettore bin (1-based) seguendo l'ordine dato
  function decOrder(w) { return range1(w.length).map(function (i) { return i - 1; }).sort(function (a, b) { return w[b] - w[a] || a - b; }); }
  function ulsCost(d, sc, vc, hc, j, t) { // c_{j,t}, periodi 1-based
    var g = sc[j - 1] + vc[j - 1] * d[j - 1], u = vc[j - 1];
    for (var k = j + 1; k <= t; k++) { u += hc[k - 2]; g += u * d[k - 1]; }
    return g;
  }
  function ww(d, sc, vc, hc) {
    var m = d.length, v = [0], arg = [0];
    for (var t = 1; t <= m; t++) {
      var b = Infinity, bj = 0;
      for (var j = 1; j <= t; j++) { var x = v[j - 1] + ulsCost(d, sc, vc, hc, j, t); if (x < b) { b = x; bj = j; } }
      v.push(b); arg.push(bj);
    }
    var runs = [], t2 = m; while (t2 > 0) { runs.unshift(arg[t2]); t2 = arg[t2] - 1; }
    return { v: v, runs: runs };
  }
  function itemTab(lingua, p, w, lab) {
    var n = p.length, head = [lab || "j"].concat(range1(n).map(String));
    return tab(head, [["p_j"].concat(p), ["w_j"].concat(w)]);
  }

  // ================================================================ GENERATORI
  add({
    id: "dp-g-kp-dp-cella", livello: "facile", capitolo: "dp-knapsack",
    link: L("dp-knapsack/a-first-dp-algorithm/#box-16-texkpbu",
            "dp-knapsack/un-primo-algoritmo-di-pd/#box-16-texkpbu"),
    genera: function (rng, lingua) {
      var n = 4, p = [], w = [];
      for (var j = 0; j < n; j++) { w.push(ri(rng, 2, 6)); p.push(ri(rng, 3, 12)); }
      var c = ri(rng, 8, 11), k = ri(rng, 5, c), jj = 3;
      var v = kpOpt(p, w, c), x = v[jj][k];
      var rep = ukp(p.slice(0, jj), w.slice(0, jj), k)[k];
      var b = build(rng, num(x), [num(v[jj - 1][k]), num(v[jj][k - 1]), num(rep), num(v[jj][k] + p[jj])]);
      if (!b) return null;
      return {
        testo: T(lingua, "Problema dello zaino 0-1 (KP) con oggetti " + itemTab(lingua, p, w) + " e capacità $c=" + c + "$; $v(j,k)$ è il massimo profitto con gli oggetti $1,\\dots,j$ e capacità $k$, con $v(0,k)=0$. Con la ricorsione $v(j,k)=\\max\\{v(j-1,k),\\,p_j+v(j-1,k-w_j)\\}$ (il secondo termine solo se $w_j\\le k$), quanto vale $v(" + jj + "," + k + ")$?",
          "0-1 knapsack problem (KP) with items " + itemTab(lingua, p, w) + " and capacity $c=" + c + "$; $v(j,k)$ is the largest profit with items $1,\\dots,j$ and capacity $k$, with $v(0,k)=0$. With the recursion $v(j,k)=\\max\\{v(j-1,k),\\,p_j+v(j-1,k-w_j)\\}$ (the second term only if $w_j\\le k$), what is $v(" + jj + "," + k + ")$?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "$v(" + jj + "," + k + ")$ è il profitto massimo con gli oggetti $\\{1,2,3\\}$ e capacità $" + k + "$: vale $" + x + "$. Ogni oggetto si usa al più una volta (con ripetizioni si otterrebbe $" + rep + "$, il valore dello zaino illimitato).",
          "$v(" + jj + "," + k + ")$ is the largest profit with the items $\\{1,2,3\\}$ and capacity $" + k + "$: it is $" + x + "$. Each item is used at most once (with repetitions one would get $" + rep + "$, the value of the unbounded knapsack)."),
        _v: { dati: { p: p, w: w, c: c, j: jj, k: k }, valori: b.valori }
      };
    }
  });
  add({
    id: "dp-g-ukp-dp", livello: "facile", capitolo: "dp-unbounded-knapsack",
    link: L("dp-unbounded-knapsack/a-first-dp-algorithm/#box-14-texukpbu",
            "dp-unbounded-knapsack/un-primo-algoritmo-di-pd/#box-14-texukpbu"),
    genera: function (rng, lingua) {
      var n = 3, p = [], w = [];
      for (var j = 0; j < n; j++) { w.push(ri(rng, 2, 7)); p.push(w[j] * ri(rng, 1, 3) + ri(rng, 0, 4)); }
      var c = ri(rng, 9, 14), v = ukp(p, w, c), x = v[c];
      var o = effOrder(p, w), rc = c, g = 0;
      o.forEach(function (i) { var q = Math.floor(rc / w[i]); g += q * p[i]; rc -= q * w[i]; });
      var kp = kpOpt(p, w, c)[n][c];
      var single = 0; for (j = 0; j < n; j++) single = Math.max(single, Math.floor(c / w[j]) * p[j]);
      var b = build(rng, num(x), [num(kp), num(g), num(single), num(v[c - 1])]);
      if (!b) return null;
      return {
        testo: T(lingua, "Zaino illimitato (UKP): $n=3$ tipi di oggetto, ciascuno disponibile in copie illimitate, " + itemTab(lingua, p, w) + ", capacità $c=" + c + "$. $v(k)$ è il massimo profitto con capacità $k$: $v(0)=0$ e $v(k)=\\max_{j:\\,w_j\\le k}\\{p_j+v(k-w_j)\\}$ (uguale a $0$ se nessun tipo entra). Quanto vale $v(" + c + ")$?",
          "Unbounded knapsack (UKP): $n=3$ item types, each available in unlimited copies, " + itemTab(lingua, p, w) + ", capacity $c=" + c + "$. $v(k)$ is the largest profit with capacity $k$: $v(0)=0$ and $v(k)=\\max_{j:\\,w_j\\le k}\\{p_j+v(k-w_j)\\}$ (equal to $0$ if no type fits). What is $v(" + c + ")$?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "La tabella dà $v(" + c + ")=" + x + "$. Ogni tipo può essere usato più volte: il valore $" + kp + "$ è quello del KP 0/1, e il greedy per efficienza con ripetizioni ($" + g + "$) non è in generale ottimo.",
          "The table gives $v(" + c + ")=" + x + "$. Each type can be used several times: the value $" + kp + "$ is that of the 0/1 KP, and the greedy by efficiency with repetitions ($" + g + "$) is not optimal in general."),
        _v: { dati: { p: p, w: w, c: c }, valori: b.valori }
      };
    }
  });
  add({
    id: "dp-g-ssp-dp", livello: "facile", capitolo: "dp-subset-sum",
    link: L("dp-subset-sum/#box-12-texsspbu", "dp-subset-sum/#box-12-texsspbu"),
    genera: function (rng, lingua) {
      var n = 5, w = [];
      for (var j = 0; j < n; j++) w.push(ri(rng, 3, 14));
      var c = ri(rng, 15, 28);
      if (sum(w) <= c) return null;
      var r = [true]; for (var k = 1; k <= c; k++) r.push(false);
      w.forEach(function (x) { for (var k2 = c; k2 >= x; k2--) if (r[k2 - x]) r[k2] = true; });
      var best = c; while (!r[best]) best--;
      if (best === c) return null;
      var second = best - 1; while (!r[second]) second--;
      var gd = 0; decOrder(w).forEach(function (i) { if (gd + w[i] <= c) gd += w[i]; });
      var gi = 0; decOrder(w).reverse().forEach(function (i) { if (gi + w[i] <= c) gi += w[i]; });
      var g1 = 0; w.forEach(function (x) { if (g1 + x <= c) g1 += x; });
      var b = build(rng, num(best), [num(gd), num(g1), num(gi), num(c), num(second)]);
      if (!b) return null;
      return {
        testo: T(lingua, "Subset sum: pesi $w=" + vec(w) + "$ e valore obiettivo $c=" + c + "$. $r(j,k)$ è vero se un sottoinsieme dei primi $j$ pesi ha somma esattamente $k$: $r(0,0)$ vero, $r(0,k)$ falso per $k\\ge 1$, e $r(j,k)=r(j-1,k)\\lor r(j-1,k-w_j)$ (il secondo termine solo se $w_j\\le k$). Qual è il più grande $k\\le c$ con $r(5,k)=\\textit{true}$?",
          "Subset sum: weights $w=" + vec(w) + "$ and target $c=" + c + "$. $r(j,k)$ is true if some subset of the first $j$ weights sums to exactly $k$: $r(0,0)$ true, $r(0,k)$ false for $k\\ge 1$, and $r(j,k)=r(j-1,k)\\lor r(j-1,k-w_j)$ (the second term only if $w_j\\le k$). What is the largest $k\\le c$ with $r(5,k)=\\textit{true}$?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "Le somme raggiungibili non superiori a $" + c + "$ hanno massimo $" + best + "$; $c=" + c + "$ non è raggiungibile. Le scelte greedy (per peso decrescente: $" + gd + "$) non garantiscono il massimo.",
          "The reachable sums not larger than $" + c + "$ have maximum $" + best + "$; $c=" + c + "$ is not reachable. The greedy choices (by non-increasing weight: $" + gd + "$) do not guarantee the maximum."),
        _v: { dati: { w: w, c: c }, valori: b.valori }
      };
    }
  });
  add({
    id: "dp-g-ccp-dp", livello: "facile", capitolo: "dp-coin-change",
    link: L("dp-coin-change/#box-13-texccpbu", "dp-coin-change/#box-13-texccpbu"),
    genera: function (rng, lingua) {
      var a = ri(rng, 3, 6), b2 = ri(rng, a + 2, 12), w = [1, a, b2], c = ri(rng, 12, 30);
      var v = [0]; for (var k = 1; k <= c; k++) { var m = Infinity; w.forEach(function (x) { if (x <= k && v[k - x] + 1 < m) m = v[k - x] + 1; }); v.push(m); }
      var rest = c, g = 0; [b2, a, 1].forEach(function (x) { g += Math.floor(rest / x); rest %= x; });
      if (g === v[c]) return null;
      var onlyBig = Math.floor(c / b2) + (c % b2);
      var bb = build(rng, num(v[c]), [num(g), num(v[c] + 1), num(onlyBig), num(v[c - 1])]);
      if (!bb) return null;
      return {
        testo: T(lingua, "Cambio monete (CCP): tagli $w=" + vec(w) + "$, disponibili in quantità illimitata; si vuole dare un resto di esattamente $c=" + c + "$ con il minimo numero di monete. $v(k)$ è il minimo numero di monete per il resto $k$: $v(0)=0$ e $v(k)=\\min_{j:\\,w_j\\le k}\\{1+v(k-w_j)\\}$. Quanto vale $v(" + c + ")$?",
          "Coin change (CCP): denominations $w=" + vec(w) + "$, in unlimited supply; an amount of exactly $c=" + c + "$ must be paid with the minimum number of coins. $v(k)$ is the minimum number of coins for amount $k$: $v(0)=0$ and $v(k)=\\min_{j:\\,w_j\\le k}\\{1+v(k-w_j)\\}$. What is $v(" + c + ")$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "La PD dà $v(" + c + ")=" + v[c] + "$ monete. Il greedy che usa sempre il taglio più grande ne usa $" + g + "$: con questi tagli non è ottimo.",
          "The DP gives $v(" + c + ")=" + v[c] + "$ coins. The greedy that always uses the largest denomination uses $" + g + "$: with these denominations it is not optimal."),
        _v: { dati: { w: w, c: c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-rcp-dp", livello: "facile", capitolo: "dp-rod-cutting",
    link: L("dp-rod-cutting/a-first-dp-algorithm/#box-14-texrcpbu", "dp-rod-cutting/un-primo-algoritmo-di-pd/#box-14-texrcpbu"),
    genera: function (rng, lingua) {
      var n = ri(rng, 5, 6), p = [], last = 0;
      for (var j = 1; j <= n; j++) { last = last + ri(rng, 1, 5); p.push(last); }
      var v = [0]; for (var l = 1; l <= n; l++) { var m = 0; for (j = 1; j <= l; j++) m = Math.max(m, p[j - 1] + v[l - j]); v.push(m); }
      var bestd = 1; for (j = 2; j <= n; j++) if (p[j - 1] * bestd > p[bestd - 1] * j) bestd = j;
      var g = Math.floor(n / bestd) * p[bestd - 1] + (n % bestd ? p[(n % bestd) - 1] : 0);
      var one = p[n - 1]; for (j = 1; j < n; j++) one = Math.max(one, p[j - 1] + p[n - j - 1]);
      var bb = build(rng, num(v[n]), [num(p[n - 1]), num(one), num(g), num(v[n - 1])]);
      if (!bb) return null;
      var head = ["j"].concat(range1(n).map(String));
      return {
        testo: T(lingua, "Taglio delle aste (RCP): un'asta di lunghezza $n=" + n + "$ si taglia in pezzi di lunghezza intera, e il pezzo di lunghezza $j$ si vende a $p_j$: " + tab(head, [["p_j"].concat(p)]) + ". $v(\\ell)$ è il massimo ricavo da un'asta di lunghezza $\\ell$: $v(0)=0$ e $v(\\ell)=\\max_{1\\le j\\le \\ell}\\{p_j+v(\\ell-j)\\}$. Quanto vale $v(" + n + ")$?",
          "Rod cutting (RCP): a rod of length $n=" + n + "$ is cut into pieces of integer length, and the piece of length $j$ is sold at $p_j$: " + tab(head, [["p_j"].concat(p)]) + ". $v(\\ell)$ is the largest revenue from a rod of length $\\ell$: $v(0)=0$ and $v(\\ell)=\\max_{1\\le j\\le \\ell}\\{p_j+v(\\ell-j)\\}$. What is $v(" + n + ")$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "$v=" + vec(v) + "$ per $\\ell=0,\\dots," + n + "$, quindi $v(" + n + ")=" + v[n] + "$. Un solo taglio ($" + one + "$) o il pezzo di miglior rapporto $p_j/j$ ($" + g + "$) non bastano in generale.",
          "$v=" + vec(v) + "$ for $\\ell=0,\\dots," + n + "$, hence $v(" + n + ")=" + v[n] + "$. A single cut ($" + one + "$) or the piece with the best ratio $p_j/j$ ($" + g + "$) are not enough in general."),
        _v: { dati: { p: p, n: n }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-uls-cjt", livello: "facile", capitolo: "dp-lot-sizing",
    link: L("dp-lot-sizing/a-dp-algorithm-for-the-uls/#box-15-texulscost", "dp-lot-sizing/un-algoritmo-di-pd-per-l-uls/#box-15-texulscost"),
    genera: function (rng, lingua) {
      var m = 4, d = [], sc = [], vc = [], hc = [];
      for (var t = 0; t < m; t++) { d.push(ri(rng, 1, 6) * 5); sc.push(ri(rng, 3, 10) * 10); vc.push(ri(rng, 0, 2)); hc.push(ri(rng, 1, 3)); }
      var j = ri(rng, 1, 2), tt = ri(rng, j + 2, m);
      var cjt = ulsCost(d, sc, vc, hc, j, tt);
      var D = 0; for (var k = j; k <= tt; k++) D += d[k - 1];
      var w1 = sc[j - 1] + vc[j - 1] * D; for (k = j; k < tt; k++) w1 += hc[k - 1] * d[k]; // mantenimento solo un periodo
      var w3 = cjt - sc[j - 1];
      var w4 = sc[j - 1] + vc[j - 1] * D; for (k = j; k <= tt; k++) { var Dk = 0; for (var q = k; q <= tt; q++) Dk += d[q - 1]; w4 += hc[k - 1] * Dk; } // conta anche la domanda del periodo stesso
      var head = ["t"].concat(range1(m).map(String));
      var b = build(rng, num(cjt), [num(w1), num(w3), num(w4), num(cjt + sc[j - 1])]);
      if (!b) return null;
      return {
        testo: T(lingua, "Lot sizing senza capacità (ULS): domanda $d_t$, costo di setup $sc_t$, costo variabile unitario $vc_t$ e costo unitario $hc_t$ della scorta a fine periodo " + tab(head, [["d_t"].concat(d), ["sc_t"].concat(sc), ["vc_t"].concat(vc), ["hc_t"].concat(hc)]) + ". Quanto vale il costo $c_{" + j + "," + tt + "}$ del lotto prodotto nel periodo $" + j + "$ per coprire le domande dei periodi $" + j + ",\\dots," + tt + "$ (setup, produzione e scorte)?",
          "Uncapacitated lot sizing (ULS): demand $d_t$, setup cost $sc_t$, unit variable cost $vc_t$ and unit cost $hc_t$ of the stock at the end of the period " + tab(head, [["d_t"].concat(d), ["sc_t"].concat(sc), ["vc_t"].concat(vc), ["hc_t"].concat(hc)]) + ". What is the cost $c_{" + j + "," + tt + "}$ of the production run in period $" + j + "$ covering the demands of periods $" + j + ",\\dots," + tt + "$ (setup, production and stock)?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "$c_{j,t}=sc_j+vc_j\\,D_{j,t}+\\sum_{k=j}^{t-1}hc_k\\,D_{k+1,t}=" + cjt + "$: alla fine di ogni periodo $k$ la scorta contiene le domande dei periodi successivi del lotto, non solo quella del periodo seguente.",
          "$c_{j,t}=sc_j+vc_j\\,D_{j,t}+\\sum_{k=j}^{t-1}hc_k\\,D_{k+1,t}=" + cjt + "$: at the end of each period $k$ the stock contains the demands of all the following periods of the run, not only that of the next period."),
        _v: { dati: { d: d, sc: sc, vc: vc, hc: hc, j: j, t: tt }, valori: b.valori }
      };
    }
  });
  add({
    id: "dp-g-uls-ww", livello: "media", capitolo: "dp-lot-sizing",
    link: L("dp-lot-sizing/a-dp-algorithm-for-the-uls-step-1-and-step-2/#box-28-texulsbu",
            "dp-lot-sizing/un-algoritmo-di-pd-per-l-uls-passo-1-e-passo-2/#box-28-texulsbu"),
    genera: function (rng, lingua) {
      var m = 4, d = [], sc = [], vc = [0, 0, 0, 0], hc = [];
      var s0 = ri(rng, 4, 10) * 10;
      for (var t = 0; t < m; t++) { d.push(ri(rng, 1, 8) * 5); sc.push(s0); hc.push(1); }
      var R = ww(d, sc, vc, hc), opt = R.v[m];
      var l4l = sum(sc), one = ulsCost(d, sc, vc, hc, 1, m), last = R.v[m - 1] + ulsCost(d, sc, vc, hc, m, m);
      var b = build(rng, num(opt), [num(l4l), num(one), num(last), num(opt + s0)]);
      if (!b) return null;
      var head = ["t"].concat(range1(m).map(String));
      return {
        testo: T(lingua, "Lot sizing senza capacità (ULS) con $m=4$ periodi, costo di setup $sc_t=" + s0 + "$, costo variabile nullo e costo di mantenimento $hc_t=1$ per ogni periodo, e domande " + tab(head, [["d_t"].concat(d)]) + ". Sia $c_{j,t}$ il costo del lotto prodotto in $j$ per i periodi $j,\\dots,t$ e $v(t)$ il costo minimo per coprire i periodi $1,\\dots,t$: $v(0)=0$ e $v(t)=\\min_{1\\le j\\le t}\\{v(j-1)+c_{j,t}\\}$. Quanto vale il costo ottimo $v(4)$?",
          "Uncapacitated lot sizing (ULS) with $m=4$ periods, setup cost $sc_t=" + s0 + "$, zero variable cost and holding cost $hc_t=1$ in every period, and demands " + tab(head, [["d_t"].concat(d)]) + ". Let $c_{j,t}$ be the cost of the run produced in $j$ for periods $j,\\dots,t$ and $v(t)$ the minimum cost of covering periods $1,\\dots,t$: $v(0)=0$ and $v(t)=\\min_{1\\le j\\le t}\\{v(j-1)+c_{j,t}\\}$. What is the optimal cost $v(4)$?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "$v=" + vec(R.v) + "$ per $t=0,\\dots,4$; lotti nei periodi $" + R.runs.join(",") + "$. Un setup in ogni periodo costa $" + l4l + "$, un solo lotto nel periodo 1 costa $" + one + "$.",
          "$v=" + vec(R.v) + "$ for $t=0,\\dots,4$; runs in periods $" + R.runs.join(",") + "$. A setup in every period costs $" + l4l + "$, a single run in period 1 costs $" + one + "$."),
        _v: { dati: { d: d, sc: sc, vc: vc, hc: hc }, valori: b.valori }
      };
    }
  });
  add({
    id: "dp-g-kp-dp-completa", livello: "complessa", capitolo: "dp-knapsack",
    link: L("dp-knapsack/a-first-dp-algorithm/#box-16-texkpbu", "dp-knapsack/un-primo-algoritmo-di-pd/#box-16-texkpbu"),
    genera: function (rng, lingua) {
      var n = 4, p = [], w = [];
      for (var j = 0; j < n; j++) { w.push(ri(rng, 2, 6)); p.push(ri(rng, 3, 15)); }
      var c = ri(rng, 8, 11); if (sum(w) <= c) return null;
      var O = kpOptSets(p, w, c); if (O.sets.length !== 1) return null;
      var key = function (z, S) { return { k: z + "|" + S.join(","), t: "$v(4," + c + ")=" + z + "$, $\\tilde S=" + set(S) + "$" }; };
      var g = greedyOrder(effOrder(p, w), p, w, c), gp = greedyOrder(decOrder(p), p, w, c);
      var O3 = kpOptSets(p.slice(0, 3), w.slice(0, 3), c);
      var Oc = kpOptSets(p, w, c - 1);
      // insiemi ammissibili massimali per profitto decrescente (il secondo, il terzo, ...)
      var feas = [];
      for (var mk = 1; mk < (1 << n); mk++) {
        var pp = 0, wt = 0, S = [];
        for (j = 0; j < n; j++) if (mk & (1 << j)) { pp += p[j]; wt += w[j]; S.push(j + 1); }
        if (wt <= c) feas.push({ z: pp, S: S });
      }
      feas.sort(function (a, b2) { return b2.z - a.z || a.S.length - b2.S.length; });
      var cand = [key(g.z, g.set), key(gp.z, gp.set), key(O3.z, O3.sets[0]), key(Oc.z, Oc.sets[0])];
      for (j = 1; j < feas.length && j < 4; j++) cand.push(key(feas[j].z, feas[j].S));
      var b = build(rng, key(O.z, O.sets[0]), cand);
      if (!b) return null;
      return {
        testo: T(lingua, "Problema dello zaino 0-1 (KP: si sceglie un sottoinsieme di oggetti di profitto massimo con peso totale al più $c$) con capacità $c=" + c + "$: " + itemTab(lingua, p, w) + ". Si calcola la tabella della PD, $v(j,k)$ = massimo profitto con gli oggetti $1,\\dots,j$ e capacità $k$, e si ricostruisce una soluzione ottima risalendo da $(4," + c + ")$. Quali sono il valore ottimo e l'insieme ottimo $\\tilde S$?",
          "0-1 knapsack problem (KP: choose a subset of items of maximum profit with total weight at most $c$) with capacity $c=" + c + "$: " + itemTab(lingua, p, w) + ". The DP table, $v(j,k)$ = largest profit with items $1,\\dots,j$ and capacity $k$, is computed and an optimal solution is reconstructed going back from $(4," + c + ")$. What are the optimal value and the optimal set $\\tilde S$?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "La tabella dà $v(4," + c + ")=" + O.z + "$; risalendo da $(4," + c + ")$ (l'oggetto $j$ è scelto se $v(j,k)\\ne v(j-1,k)$) si ottiene $\\tilde S=" + set(O.sets[0]) + "$. Il greedy per efficienza dà solo $" + g.z + "$.",
          "The table gives $v(4," + c + ")=" + O.z + "$; going back from $(4," + c + ")$ (item $j$ is selected if $v(j,k)\\ne v(j-1,k)$) gives $\\tilde S=" + set(O.sets[0]) + "$. The greedy by efficiency only gives $" + g.z + "$."),
        _v: { dati: { p: p, w: w, c: c }, valori: b.valori }
      };
    }
  });
  add({
    id: "dp-g-uls-completa", livello: "complessa", capitolo: "dp-lot-sizing",
    link: L("dp-lot-sizing/a-dp-algorithm-for-the-uls-step-1-and-step-2/#box-30-texulssolvector",
            "dp-lot-sizing/un-algoritmo-di-pd-per-l-uls-passo-1-e-passo-2/#box-30-texulssolvector"),
    genera: function (rng, lingua) {
      var m = 5, d = [], sc = [], vc = [], hc = [];
      for (var t = 0; t < m; t++) { d.push(ri(rng, 1, 8) * 5); sc.push(ri(rng, 4, 9) * 10); vc.push(0); hc.push(ri(rng, 1, 2)); }
      // tutti i piani: setup nel periodo 1 obbligatorio, gli altri 2^(m-1)
      var plans = [];
      for (var mask = 0; mask < (1 << (m - 1)); mask++) {
        var runs = [1]; for (var q = 2; q <= m; q++) if (mask & (1 << (q - 2))) runs.push(q);
        var cost = 0; for (q = 0; q < runs.length; q++) cost += ulsCost(d, sc, vc, hc, runs[q], q + 1 < runs.length ? runs[q + 1] - 1 : m);
        plans.push({ runs: runs, cost: cost });
      }
      plans.sort(function (a, b) { return a.cost - b.cost; });
      if (plans[0].cost === plans[1].cost) return null;
      var R = ww(d, sc, vc, hc);
      var key = function (pl) { return { k: pl.cost + "|" + pl.runs.join(","), t: T(lingua, "$v(5)=" + pl.cost + "$, lotti nei periodi $" + pl.runs.join(",") + "$", "$v(5)=" + pl.cost + "$, runs in periods $" + pl.runs.join(",") + "$") }; };
      var l4l = plans.filter(function (x) { return x.runs.length === m; })[0], one = plans.filter(function (x) { return x.runs.length === 1; })[0];
      var b = build(rng, key(plans[0]), [key(plans[1]), key(l4l), key(one), key(plans[2])]);
      if (!b || R.v[m] !== plans[0].cost) return null;
      var head = ["t"].concat(range1(m).map(String));
      return {
        testo: T(lingua, "Lot sizing senza capacità (ULS) con costo variabile nullo, domanda $d_t$, costo di setup $sc_t$ e costo unitario $hc_t$ della scorta a fine periodo " + tab(head, [["d_t"].concat(d), ["sc_t"].concat(sc), ["hc_t"].concat(hc)]) + ". Con $c_{j,t}$ costo del lotto prodotto in $j$ per i periodi $j,\\dots,t$, la PD è $v(0)=0$, $v(t)=\\min_{1\\le j\\le t}\\{v(j-1)+c_{j,t}\\}$. Quali sono il costo ottimo $v(5)$ e i periodi dei lotti di produzione?",
          "Uncapacitated lot sizing (ULS) with zero variable cost, demand $d_t$, setup cost $sc_t$ and unit cost $hc_t$ of the stock at the end of the period " + tab(head, [["d_t"].concat(d), ["sc_t"].concat(sc), ["hc_t"].concat(hc)]) + ". With $c_{j,t}$ the cost of the run produced in $j$ for periods $j,\\dots,t$, the DP is $v(0)=0$, $v(t)=\\min_{1\\le j\\le t}\\{v(j-1)+c_{j,t}\\}$. What are the optimal cost $v(5)$ and the periods of the production runs?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "$v=" + vec(R.v) + "$ per $t=0,\\dots,5$; risalendo dagli argmin si trovano i lotti nei periodi $" + R.runs.join(",") + "$. Per la proprietà di Wagner e Whitin basta confrontare i lotti $c_{j,t}$.",
          "$v=" + vec(R.v) + "$ for $t=0,\\dots,5$; going back through the argmins gives runs in periods $" + R.runs.join(",") + "$. By the Wagner–Whitin property it is enough to compare the runs $c_{j,t}$."),
        _v: { dati: { d: d, sc: sc, vc: vc, hc: hc }, valori: b.valori }
      };
    }
  });
  // ================================================================ BATCH 4 (6 novembre 2026): almeno due generatori per capitolo con calcoli
  function L2(en, it, a) { var s = a ? "#" + a : ""; return L(en + "/" + s, it + "/" + s); }
  function bitsOf(m, n) { var s = []; for (var j = 0; j < n; j++) if (m & (1 << j)) s.push(j + 1); return s; }
  function kpAll(p, w, c) { // tutti i sottoinsiemi ammissibili: {z, best:[maschere], vals:{maschera:valore}}
    var n = p.length, z = -1, best = [], second = -1;
    for (var m = 0; m < (1 << n); m++) {
      var pp = 0, ww = 0; for (var j = 0; j < n; j++) if (m & (1 << j)) { pp += p[j]; ww += w[j]; }
      if (ww > c) continue;
      if (pp > z) { second = z; z = pp; best = [m]; } else if (pp === z) best.push(m); else if (pp > second) second = pp;
    }
    return { z: z, best: best, second: second };
  }
  function setKey(s) { return { k: s.join(","), t: "$" + set(s) + "$" }; }
  function lsCost(d, x, sc, vc, hc) { var s = 0, st = 0; for (var t = 0; t < d.length; t++) { st += x[t] - d[t]; if (st < 0) return null; s += (x[t] > 0 ? sc[t] : 0) + vc[t] * x[t] + hc[t] * st; } return st === 0 ? s : null; }
  function clsAll(d, cap, sc, vc, hc) { // tutti i piani ammissibili (m piccolo)
    var m = d.length, res = [];
    (function rec(t, x) {
      if (t === m) { var c0 = lsCost(d, x, sc, vc, hc); if (c0 !== null) res.push({ c: c0, x: x.slice() }); return; }
      for (var q = 0; q <= cap[t]; q++) { x.push(q); rec(t + 1, x); x.pop(); }
    })(0, []);
    res.sort(function (a, b) { return a.c - b.c; });
    return res;
  }
  add({
    id: "dp-g-ukp-sol", livello: "media", capitolo: "dp-unbounded-knapsack",
    link: L2("dp-unbounded-knapsack/a-first-dp-algorithm", "dp-unbounded-knapsack/un-primo-algoritmo-di-pd", "box-14-texukpbu"),
    genera: function (rng, lingua) {
      var n = 3, p = [], w = [];
      for (var j = 0; j < n; j++) { w.push(ri(rng, 2, 6)); p.push(w[j] * ri(rng, 1, 3) + ri(rng, 0, 3)); }
      var c = ri(rng, 10, 15), best = -1, sols = [];
      for (var a = 0; a <= c / w[0]; a++) for (var b = 0; b <= c / w[1]; b++) for (var e = 0; e <= c / w[2]; e++) {
        if (a * w[0] + b * w[1] + e * w[2] > c) continue;
        var z = a * p[0] + b * p[1] + e * p[2];
        if (z > best) { best = z; sols = [[a, b, e]]; } else if (z === best) sols.push([a, b, e]);
      }
      if (sols.length !== 1) return null;
      var x = sols[0], o = effOrder(p, w), rc = c, g = [0, 0, 0];
      o.forEach(function (i) { g[i] = Math.floor(rc / w[i]); rc -= g[i] * w[i]; });
      var gz = g[0] * p[0] + g[1] * p[1] + g[2] * p[2];
      var kp = kpAll(p, w, c), kx = bitsOf(kp.best[0], n), kv = [0, 0, 0]; kx.forEach(function (i) { kv[i - 1] = 1; });
      var i1 = 0; for (j = 1; j < n; j++) if (Math.floor(c / w[j]) * p[j] > Math.floor(c / w[i1]) * p[i1]) i1 = j;
      var sv = [0, 0, 0]; sv[i1] = Math.floor(c / w[i1]);
      var key = function (z, v) { return { k: z + "|" + v.join(","), t: "$" + z + "$ con $x=" + vec(v) + "$" }; };
      var keyE = function (z, v) { return { k: z + "|" + v.join(","), t: "$" + z + "$ with $x=" + vec(v) + "$" }; };
      var K = lingua === "it" ? key : keyE;
      var bb = build(rng, K(best, x), [K(gz, g), K(kp.z, kv), K(sv[i1] * p[i1], sv), K(best, g)]);
      if (!bb) return null;
      return {
        testo: T(lingua, "Zaino illimitato (UKP): $n=3$ tipi di oggetto, ciascuno in copie illimitate, " + itemTab(lingua, p, w) + ", capacità $c=" + c + "$; $x_j$ è il numero di copie del tipo $j$. Qual è il valore ottimo, e con quale vettore $x$ (unico) si ottiene?",
          "Unbounded knapsack (UKP): $n=3$ item types, each in unlimited copies, " + itemTab(lingua, p, w) + ", capacity $c=" + c + "$; $x_j$ is the number of copies of type $j$. What is the optimal value, and with which (unique) vector $x$ is it obtained?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "La PD $v(k)=\\max_j\\{p_j+v(k-w_j)\\}$ dà $v(" + c + ")=" + best + "$, ottenuto con $x=" + vec(x) + "$. Il greedy per efficienza con ripetizioni dà $" + gz + "$ e lo zaino 0-1 $" + kp.z + "$.",
          "The DP $v(k)=\\max_j\\{p_j+v(k-w_j)\\}$ gives $v(" + c + ")=" + best + "$, attained by $x=" + vec(x) + "$. The greedy by efficiency with repetitions gives $" + gz + "$ and the 0-1 knapsack $" + kp.z + "$."),
        _v: { dati: { p: p, w: w, c: c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-ssp-count", livello: "media", capitolo: "dp-subset-sum",
    link: L2("dp-subset-sum", "dp-subset-sum", "box-12-texsspbu"),
    genera: function (rng, lingua) {
      var n = 4, w = []; for (var j = 0; j < n; j++) w.push(ri(rng, 2, 9));
      var c = ri(rng, 10, 18);
      var r = [true]; for (var k = 1; k <= c; k++) r.push(false);
      w.forEach(function (x) { for (var k2 = c; k2 >= x; k2--) if (r[k2 - x]) r[k2] = true; });
      var cnt = r.filter(function (b) { return b; }).length, subs = 0;
      for (var m = 0; m < (1 << n); m++) { var s = 0; bitsOf(m, n).forEach(function (i) { s += w[i - 1]; }); if (s <= c) subs++; }
      var bb = build(rng, num(cnt), [num(cnt - 1), num(subs), num(c + 1), num(cnt + 1)]);
      if (!bb) return null;
      return {
        testo: T(lingua, "Subset sum con pesi $w=" + vec(w) + "$ e obiettivo $c=" + c + "$. $r(j,k)$ è vero se un sottoinsieme dei primi $j$ pesi ha somma esattamente $k$ (il sottoinsieme vuoto dà $k=0$). Per quanti valori $k\\in\\{0,1,\\dots," + c + "\\}$ la cella $r(" + n + ",k)$ è vera?",
          "Subset sum with weights $w=" + vec(w) + "$ and target $c=" + c + "$. $r(j,k)$ is true if a subset of the first $j$ weights sums to exactly $k$ (the empty subset gives $k=0$). For how many values $k\\in\\{0,1,\\dots," + c + "\\}$ is the cell $r(" + n + ",k)$ true?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Le somme raggiungibili fino a $" + c + "$ sono $" + cnt + "$, compreso $k=0$. Sottoinsiemi diversi possono dare la stessa somma: i sottoinsiemi con somma al più $" + c + "$ sono $" + subs + "$.",
          "The reachable sums up to $" + c + "$ are $" + cnt + "$, including $k=0$. Different subsets may give the same sum: the subsets with sum at most $" + c + "$ are $" + subs + "$."),
        _v: { dati: { w: w, c: c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-ccp-unreach", livello: "media", capitolo: "dp-coin-change",
    link: L2("dp-coin-change", "dp-coin-change", "box-13-texccpbu"),
    genera: function (rng, lingua) {
      var a = ri(rng, 3, 5), b = ri(rng, a + 1, 9), c = ri(rng, 10, 20), w = [a, b];
      var v = [0]; for (var k = 1; k <= c; k++) { var m = Infinity; w.forEach(function (x) { if (x <= k && v[k - x] + 1 < m) m = v[k - x] + 1; }); v.push(m); }
      var cnt = 0, nm = 0; for (k = 1; k <= c; k++) { if (v[k] === Infinity) cnt++; if (k % a && k % b) nm++; }
      if (cnt === 0) return null;
      var bb = build(rng, num(cnt), [num(nm), num(cnt + 1), num(cnt - 1), num(c - cnt)]);
      if (!bb) return null;
      return {
        testo: T(lingua, "Cambio monete (CCP) con tagli $w=" + vec(w) + "$ in quantità illimitata. $v(k)$ è il minimo numero di monete per dare esattamente il resto $k$: $v(0)=0$, $v(k)=\\min_{j:\\,w_j\\le k}\\{1+v(k-w_j)\\}$, e $v(k)=+\\infty$ se il resto non si può dare. Per quanti valori $k\\in\\{1,\\dots," + c + "\\}$ si ha $v(k)=+\\infty$?",
          "Coin change (CCP) with denominations $w=" + vec(w) + "$ in unlimited supply. $v(k)$ is the minimum number of coins to pay exactly the amount $k$: $v(0)=0$, $v(k)=\\min_{j:\\,w_j\\le k}\\{1+v(k-w_j)\\}$, and $v(k)=+\\infty$ if the amount cannot be paid. For how many values $k\\in\\{1,\\dots," + c + "\\}$ is $v(k)=+\\infty$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Calcolando $v(1),\\dots,v(" + c + ")$ si trovano $" + cnt + "$ resti non ottenibili. Non basta escludere i multipli di $" + a + "$ e di $" + b + "$: anche le loro somme sono ottenibili.",
          "Computing $v(1),\\dots,v(" + c + ")$ one finds $" + cnt + "$ unobtainable amounts. Excluding the multiples of $" + a + "$ and $" + b + "$ is not enough: their sums are obtainable too."),
        _v: { dati: { w: w, c: c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-rcp-sol", livello: "media", capitolo: "dp-rod-cutting",
    link: L2("dp-rod-cutting/a-first-dp-algorithm", "dp-rod-cutting/un-primo-algoritmo-di-pd", "box-14-texrcpbu"),
    genera: function (rng, lingua) {
      var n = ri(rng, 5, 6), p = [], last = 0;
      for (var j = 1; j <= n; j++) { last += ri(rng, 1, 5); p.push(last); }
      var parts = [];
      (function gen(rem, mx, acc) { if (rem === 0) { parts.push(acc.slice()); return; } for (var q = Math.min(rem, mx); q >= 1; q--) { acc.push(q); gen(rem - q, q, acc); acc.pop(); } })(n, n, []);
      var val = function (P) { var s = 0; P.forEach(function (q) { s += p[q - 1]; }); return s; };
      parts.sort(function (A, B) { return val(B) - val(A); });
      if (val(parts[0]) === val(parts[1])) return null;
      var key = function (P) { return { k: val(P) + "|" + P.join(","), t: "$" + val(P) + "$: " + T(lingua, "pezzi ", "pieces ") + "$" + P.join("+") + "$" }; };
      var bb = build(rng, key(parts[0]), [key([n]), key(parts[1]), key(parts[2]), key(range1(n).map(function () { return 1; }))]);
      if (!bb) return null;
      var head = ["j"].concat(range1(n).map(String));
      return {
        testo: T(lingua, "Taglio delle aste (RCP): un'asta di lunghezza $n=" + n + "$ si taglia in pezzi di lunghezza intera, e il pezzo di lunghezza $j$ si vende a $p_j$: " + tab(head, [["p_j"].concat(p)]) + ". Qual è il ricavo massimo e con quali pezzi (taglio ottimo unico, a meno dell'ordine)?",
          "Rod cutting (RCP): a rod of length $n=" + n + "$ is cut into pieces of integer length, and the piece of length $j$ sells at $p_j$: " + tab(head, [["p_j"].concat(p)]) + ". What is the largest revenue and with which pieces (unique optimal cut, up to order)?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "La PD $v(\\ell)=\\max_j\\{p_j+v(\\ell-j)\\}$ dà $v(" + n + ")=" + val(parts[0]) + "$ con i pezzi $" + parts[0].join("+") + "$. Vendere l'asta intera dà $" + p[n - 1] + "$.",
          "The DP $v(\\ell)=\\max_j\\{p_j+v(\\ell-j)\\}$ gives $v(" + n + ")=" + val(parts[0]) + "$ with pieces $" + parts[0].join("+") + "$. Selling the whole rod gives $" + p[n - 1] + "$."),
        _v: { dati: { p: p, n: n }, valori: bb.valori }
      };
    }
  });
  function bkpBest(p, w, b, c, types) {
    var best = 0, n = types; (function rec(j, cap, val) { if (j === n) { if (val > best) best = val; return; } for (var d = 0; d <= b[j] && d * w[j] <= cap; d++) rec(j + 1, cap - d * w[j], val + d * p[j]); })(0, c, 0);
    return best;
  }
  function bkpInst(rng) { var p = [], w = [], b = []; for (var j = 0; j < 3; j++) { w.push(ri(rng, 2, 5)); p.push(ri(rng, 3, 12)); b.push(ri(rng, 1, 3)); } return { p: p, w: w, b: b }; }
  function bkpTab(lingua, I) { return tab(["j", "1", "2", "3"], [["p_j"].concat(I.p), ["w_j"].concat(I.w), ["b_j"].concat(I.b)]); }
  add({
    id: "dp-g-bkp-dp", livello: "facile", capitolo: "dp-bounded-knapsack",
    link: L2("dp-bounded-knapsack", "dp-bounded-knapsack", "box-15-texbkpbu"),
    genera: function (rng, lingua) {
      var I = bkpInst(rng), c = ri(rng, 8, 12);
      var z = bkpBest(I.p, I.w, I.b, c, 3), kp = kpAll(I.p, I.w, c).z, uk = ukp(I.p, I.w, c)[c];
      var bb = build(rng, num(z), [num(kp), num(uk), num(z + 1), num(z - 1)]);
      if (!bb || z === kp) return null;
      return {
        testo: T(lingua, "Zaino limitato (BKP): il tipo $j$ ha profitto $p_j$, peso $w_j$ e $b_j$ copie disponibili, " + bkpTab(lingua, I) + ", capacità $c=" + c + "$. Con $v(j,k)=\\max_{0\\le d\\le\\min\\{b_j,\\lfloor k/w_j\\rfloor\\}}\\{d\\,p_j+v(j-1,k-d\\,w_j)\\}$ e $v(0,k)=0$, quanto vale il valore ottimo $v(3," + c + ")$?",
          "Bounded knapsack (BKP): type $j$ has profit $p_j$, weight $w_j$ and $b_j$ available copies, " + bkpTab(lingua, I) + ", capacity $c=" + c + "$. With $v(j,k)=\\max_{0\\le d\\le\\min\\{b_j,\\lfloor k/w_j\\rfloor\\}}\\{d\\,p_j+v(j-1,k-d\\,w_j)\\}$ and $v(0,k)=0$, what is the optimal value $v(3," + c + ")$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "La PD dà $v(3," + c + ")=" + z + "$. Con una sola copia per tipo (KP) si avrebbe $" + kp + "$, con copie illimitate (UKP) $" + uk + "$.",
          "The DP gives $v(3," + c + ")=" + z + "$. With one copy per type (KP) one would get $" + kp + "$, with unlimited copies (UKP) $" + uk + "$."),
        _v: { dati: { p: I.p, w: I.w, b: I.b, c: c, j: 3, k: c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-bkp-cella", livello: "media", capitolo: "dp-bounded-knapsack",
    link: L2("dp-bounded-knapsack", "dp-bounded-knapsack", "box-3-texbkpvalues"),
    genera: function (rng, lingua) {
      var I = bkpInst(rng), c = ri(rng, 9, 12), k = ri(rng, 5, c);
      var x = bkpBest(I.p, I.w, I.b, k, 2), x1 = bkpBest(I.p, I.w, I.b, k, 1), x3 = bkpBest(I.p, I.w, I.b, k, 3);
      var uk = ukp(I.p.slice(0, 2), I.w.slice(0, 2), k)[k], kp = kpAll(I.p.slice(0, 2), I.w.slice(0, 2), k).z;
      var bb = build(rng, num(x), [num(x1), num(x3), num(uk), num(kp)]);
      if (!bb) return null;
      return {
        testo: T(lingua, "Zaino limitato (BKP): il tipo $j$ ha profitto $p_j$, peso $w_j$ e $b_j$ copie, " + bkpTab(lingua, I) + ", capacità $c=" + c + "$. $v(j,k)$ è il massimo profitto con i soli tipi $1,\\dots,j$ e capacità $k$, con al più $b_j$ copie del tipo $j$. Quanto vale $v(2," + k + ")$?",
          "Bounded knapsack (BKP): type $j$ has profit $p_j$, weight $w_j$ and $b_j$ copies, " + bkpTab(lingua, I) + ", capacity $c=" + c + "$. $v(j,k)$ is the largest profit with types $1,\\dots,j$ only and capacity $k$, with at most $b_j$ copies of type $j$. What is $v(2," + k + ")$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Con i tipi $1$ e $2$ e capacità $" + k + "$, rispettando i limiti $b_1=" + I.b[0] + "$ e $b_2=" + I.b[1] + "$, il massimo è $" + x + "$. Senza limiti sulle copie si avrebbe $" + uk + "$.",
          "With types $1$ and $2$ and capacity $" + k + "$, respecting the bounds $b_1=" + I.b[0] + "$ and $b_2=" + I.b[1] + "$, the maximum is $" + x + "$. Without bounds on the copies one would get $" + uk + "$."),
        _v: { dati: { p: I.p, w: I.w, b: I.b, c: c, j: 2, k: k }, valori: bb.valori }
      };
    }
  });
  function mckpInst(rng) {
    var p = [], w = []; for (var j = 0; j < 6; j++) { p.push(ri(rng, 2, 9)); w.push(ri(rng, 1, 6)); }
    var mins = 0; for (var h = 0; h < 3; h++) mins += Math.min(w[2 * h], w[2 * h + 1]);
    return { p: p, w: w, c: mins + ri(rng, 1, 6) };
  }
  function mckpAll(I, atMost) {
    var res = [], ch = atMost ? [-1, 0, 1] : [0, 1];
    ch.forEach(function (a) { ch.forEach(function (b) { ch.forEach(function (e) {
      var s = [a, b, e], pp = 0, ww = 0, pick = [];
      s.forEach(function (x, h) { if (x >= 0) { pp += I.p[2 * h + x]; ww += I.w[2 * h + x]; pick.push(2 * h + x + 1); } });
      if (ww <= I.c) res.push({ z: pp, pick: pick });
    }); }); });
    res.sort(function (A, B) { return B.z - A.z; });
    return res;
  }
  function mckpText(lingua, I) {
    return T(lingua, "Zaino a scelta multipla (MCKP): classi $\\mathscr{J}_1=\\{1,2\\}$, $\\mathscr{J}_2=\\{3,4\\}$, $\\mathscr{J}_3=\\{5,6\\}$, oggetti " + itemTab(lingua, I.p, I.w) + ", capacità $c=" + I.c + "$; si sceglie esattamente un oggetto per classe.",
      "Multiple-choice knapsack (MCKP): classes $\\mathscr{J}_1=\\{1,2\\}$, $\\mathscr{J}_2=\\{3,4\\}$, $\\mathscr{J}_3=\\{5,6\\}$, items " + itemTab(lingua, I.p, I.w) + ", capacity $c=" + I.c + "$; exactly one item per class is chosen.");
  }
  add({
    id: "dp-g-mckp-dp", livello: "facile", capitolo: "dp-multiple-choice-knapsack",
    link: L2("dp-multiple-choice-knapsack", "dp-multiple-choice-knapsack", "box-13-texmckpbu"),
    genera: function (rng, lingua) {
      var I = mckpInst(rng), R = mckpAll(I, false), z = R[0].z, le = mckpAll(I, true)[0].z;
      var nocap = 0; for (var h = 0; h < 3; h++) nocap += Math.max(I.p[2 * h], I.p[2 * h + 1]);
      var light = 0; for (h = 0; h < 3; h++) light += I.w[2 * h] <= I.w[2 * h + 1] ? I.p[2 * h] : I.p[2 * h + 1];
      var bb = build(rng, num(z), [num(nocap), num(le), num(light), num(z - 1)]);
      if (!bb) return null;
      return {
        testo: mckpText(lingua, I) + T(lingua, " Con $v(h,k)=\\max_{j\\in\\mathscr{J}_h:\\,w_j\\le k}\\{p_j+v(h-1,k-w_j)\\}$, $v(0,k)=0$, quanto vale il valore ottimo $v(3," + I.c + ")$?",
          " With $v(h,k)=\\max_{j\\in\\mathscr{J}_h:\\,w_j\\le k}\\{p_j+v(h-1,k-w_j)\\}$, $v(0,k)=0$, what is the optimal value $v(3," + I.c + ")$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Il valore ottimo è $" + z + "$. Ignorando la capacità si prenderebbe il miglior oggetto di ogni classe ($" + nocap + "$); con «al più un oggetto per classe» si risolverebbe un altro problema ($" + le + "$).",
          "The optimal value is $" + z + "$. Ignoring the capacity one would take the best item of every class ($" + nocap + "$); with «at most one item per class» another problem would be solved ($" + le + "$)."),
        _v: { dati: { p: I.p, w: I.w, c: I.c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-mckp-sol", livello: "media", capitolo: "dp-multiple-choice-knapsack",
    link: L2("dp-multiple-choice-knapsack", "dp-multiple-choice-knapsack", "box-14-texmckpsol"),
    genera: function (rng, lingua) {
      var I = mckpInst(rng), R = mckpAll(I, false);
      if (R.length < 3 || R[0].z === R[1].z) return null;
      var key = function (r) { return { k: r.z + "|" + r.pick.join(","), t: "$" + set(r.pick) + "$, " + T(lingua, "valore", "value") + " $" + r.z + "$" }; };
      var cands = R.slice(1, 4).map(key);
      var bb = build(rng, key(R[0]), cands.concat([{ k: (R[0].z + 1) + "|" + R[0].pick.join(","), t: "$" + set(R[0].pick) + "$, " + T(lingua, "valore", "value") + " $" + (R[0].z + 1) + "$" }]));
      if (!bb) return null;
      return {
        testo: mckpText(lingua, I) + T(lingua, " Quale scelta di oggetti è ottima (la soluzione ottima è unica), e quanto vale?", " Which choice of items is optimal (the optimal solution is unique), and what is its value?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "La PD per classi e la ricostruzione all'indietro danno $" + set(R[0].pick) + "$, di valore $" + R[0].z + "$; la seconda migliore scelta ammissibile vale $" + R[1].z + "$.",
          "The DP by classes and the backward reconstruction give $" + set(R[0].pick) + "$, of value $" + R[0].z + "$; the second best feasible choice is worth $" + R[1].z + "$."),
        _v: { dati: { p: I.p, w: I.w, c: I.c }, valori: bb.valori }
      };
    }
  });
  function mdkpInst(rng) { var p = [], w1 = [], w2 = []; for (var j = 0; j < 4; j++) { p.push(ri(rng, 3, 10)); w1.push(ri(rng, 1, 6)); w2.push(ri(rng, 1, 6)); } return { p: p, w1: w1, w2: w2, c1: ri(rng, 7, 11), c2: ri(rng, 7, 11) }; }
  function mdkpAll(I) { var res = []; for (var m = 0; m < 16; m++) { var S = bitsOf(m, 4), pp = 0, a = 0, b = 0; S.forEach(function (j) { pp += I.p[j - 1]; a += I.w1[j - 1]; b += I.w2[j - 1]; }); if (a <= I.c1 && b <= I.c2) res.push({ z: pp, S: S }); } res.sort(function (A, B) { return B.z - A.z; }); return res; }
  function mdkpText(lingua, I) {
    var t = tab(["j", "1", "2", "3", "4"], [["p_j"].concat(I.p), ["w_{1j}"].concat(I.w1), ["w_{2j}"].concat(I.w2)]);
    return T(lingua, "Zaino multidimensionale (MDKP) con due dimensioni di capacità $c_1=" + I.c1 + "$ e $c_2=" + I.c2 + "$; l'oggetto $j$ ha profitto $p_j$ e pesi $w_{1j}$, $w_{2j}$: " + t + ". Ogni oggetto si prende al più una volta.",
      "Multidimensional knapsack (MDKP) with two dimensions of capacity $c_1=" + I.c1 + "$ and $c_2=" + I.c2 + "$; item $j$ has profit $p_j$ and weights $w_{1j}$, $w_{2j}$: " + t + ". Every item is taken at most once.");
  }
  add({
    id: "dp-g-mdkp-dp", livello: "facile", capitolo: "dp-multidimensional-knapsack",
    link: L2("dp-multidimensional-knapsack", "dp-multidimensional-knapsack", "box-11-texmdkpbu"),
    genera: function (rng, lingua) {
      var I = mdkpInst(rng), z = mdkpAll(I)[0].z;
      var k1 = kpAll(I.p, I.w1, I.c1).z, k2 = kpAll(I.p, I.w2, I.c2).z;
      var ag = kpAll(I.p, I.w1.map(function (x, j) { return x + I.w2[j]; }), I.c1 + I.c2).z;
      var bb = build(rng, num(z), [num(k1), num(k2), num(ag), num(z + 1)]);
      if (!bb || (k1 === z && k2 === z)) return null;
      return {
        testo: mdkpText(lingua, I) + T(lingua, " Con la PD $v(j,(k_1,k_2))$ su entrambe le capacità, quanto vale il valore ottimo?", " With the DP $v(j,(k_1,k_2))$ on both capacities, what is the optimal value?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Il valore ottimo è $" + z + "$. Considerando una sola dimensione si otterrebbe $" + k1 + "$ o $" + k2 + "$, e sommando i vincoli $" + ag + "$: sono rilassamenti, non soluzioni dell'MDKP.",
          "The optimal value is $" + z + "$. Considering a single dimension one would get $" + k1 + "$ or $" + k2 + "$, and adding the constraints $" + ag + "$: these are relaxations, not MDKP solutions."),
        _v: { dati: { p: I.p, w1: I.w1, w2: I.w2, c1: I.c1, c2: I.c2 }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-mdkp-sol", livello: "media", capitolo: "dp-multidimensional-knapsack",
    link: L2("dp-multidimensional-knapsack", "dp-multidimensional-knapsack", "box-13-texmdkpsol"),
    genera: function (rng, lingua) {
      var I = mdkpInst(rng), R = mdkpAll(I);
      if (R.length < 4 || R[0].z === R[1].z) return null;
      var k1 = kpAll(I.p, I.w1, I.c1);
      var bb = build(rng, setKey(R[0].S), [setKey(R[1].S), setKey(R[2].S), setKey(bitsOf(k1.best[0], 4)), setKey(R[3].S)]);
      if (!bb) return null;
      return {
        testo: mdkpText(lingua, I) + T(lingua, " Quale insieme di oggetti è la soluzione ottima (unica)?", " Which set of items is the (unique) optimal solution?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "$" + set(R[0].S) + "$ rispetta entrambe le capacità e vale $" + R[0].z + "$; la seconda migliore soluzione ammissibile vale $" + R[1].z + "$.",
          "$" + set(R[0].S) + "$ respects both capacities and is worth $" + R[0].z + "$; the second best feasible solution is worth $" + R[1].z + "$."),
        _v: { dati: { p: I.p, w1: I.w1, w2: I.w2, c1: I.c1, c2: I.c2 }, valori: bb.valori }
      };
    }
  });
  function kpsInst(rng) { var p = [], w = []; for (var j = 0; j < 4; j++) { p.push(ri(rng, 3, 9)); w.push(ri(rng, 1, 5)); } return { p: p, w: w, f: [ri(rng, 1, 4), ri(rng, 1, 4)], s: [ri(rng, 1, 3), ri(rng, 1, 3)], c: ri(rng, 8, 12) }; }
  function kpsAll(I, mode) { // mode: "ok" | "nof" | "nos" | "peritem"
    var res = [];
    for (var m = 0; m < 16; m++) {
      var S = bitsOf(m, 4), pp = 0, ww = 0, open = [false, false];
      S.forEach(function (j) { pp += I.p[j - 1]; ww += I.w[j - 1]; open[j <= 2 ? 0 : 1] = true; if (mode === "peritem") { pp -= I.f[j <= 2 ? 0 : 1]; ww += I.s[j <= 2 ? 0 : 1]; } });
      if (mode !== "peritem") for (var h = 0; h < 2; h++) if (open[h]) { if (mode !== "nof") pp -= I.f[h]; if (mode !== "nos") ww += I.s[h]; }
      if (ww <= I.c) res.push({ z: pp, S: S });
    }
    res.sort(function (A, B) { return B.z - A.z; });
    return res;
  }
  function kpsText(lingua, I) {
    return T(lingua, "Zaino con setup (KPS): classi $\\mathscr{J}_1=\\{1,2\\}$ e $\\mathscr{J}_2=\\{3,4\\}$, oggetti " + itemTab(lingua, I.p, I.w) + ", capacità $c=" + I.c + "$. Usare la classe $h$ costa una volta il profitto di setup $f_h$ e il peso di setup $s_h$, con $f=" + vec(I.f) + "$ e $s=" + vec(I.s) + "$; si massimizza il profitto degli oggetti meno i setup pagati.",
      "Knapsack with setups (KPS): classes $\\mathscr{J}_1=\\{1,2\\}$ and $\\mathscr{J}_2=\\{3,4\\}$, items " + itemTab(lingua, I.p, I.w) + ", capacity $c=" + I.c + "$. Using class $h$ costs once the setup profit $f_h$ and the setup weight $s_h$, with $f=" + vec(I.f) + "$ and $s=" + vec(I.s) + "$; the profit of the items minus the paid setups is maximized.");
  }
  add({
    id: "dp-g-kps-dp", livello: "facile", capitolo: "dp-knapsack-setups",
    link: L2("dp-knapsack-setups", "dp-knapsack-setups", "box-21-texkpsbu"),
    genera: function (rng, lingua) {
      var I = kpsInst(rng), z = kpsAll(I, "ok")[0].z;
      if (z <= 0) return null;
      var bb = build(rng, num(z), [num(kpsAll(I, "nof")[0].z), num(kpsAll(I, "nos")[0].z), num(kpsAll(I, "peritem")[0].z), num(z + 1)]);
      if (!bb) return null;
      return {
        testo: kpsText(lingua, I) + T(lingua, " Quanto vale il valore ottimo?", " What is the optimal value?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Il valore ottimo è $" + z + "$. Dimenticare i costi di setup dà $" + kpsAll(I, "nof")[0].z + "$, dimenticare i pesi di setup $" + kpsAll(I, "nos")[0].z + "$, pagare il setup per ogni oggetto $" + kpsAll(I, "peritem")[0].z + "$.",
          "The optimal value is $" + z + "$. Forgetting the setup costs gives $" + kpsAll(I, "nof")[0].z + "$, forgetting the setup weights $" + kpsAll(I, "nos")[0].z + "$, paying the setup for every item $" + kpsAll(I, "peritem")[0].z + "$."),
        _v: { dati: { p: I.p, w: I.w, f: I.f, s: I.s, c: I.c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-kps-sol", livello: "media", capitolo: "dp-knapsack-setups",
    link: L2("dp-knapsack-setups", "dp-knapsack-setups", "box-23-texkpssol"),
    genera: function (rng, lingua) {
      var I = kpsInst(rng), R = kpsAll(I, "ok");
      if (R[0].z <= 0 || R[0].z === R[1].z || R.length < 4) return null;
      var bb = build(rng, setKey(R[0].S), [setKey(R[1].S), setKey(R[2].S), setKey(kpsAll(I, "nof")[0].S), setKey(R[3].S)]);
      if (!bb) return null;
      return {
        testo: kpsText(lingua, I) + T(lingua, " Quale insieme di oggetti è la soluzione ottima (unica)?", " Which set of items is the (unique) optimal solution?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "$" + set(R[0].S) + "$ vale $" + R[0].z + "$, setup compresi; la seconda migliore soluzione vale $" + R[1].z + "$.",
          "$" + set(R[0].S) + "$ is worth $" + R[0].z + "$, setups included; the second best solution is worth $" + R[1].z + "$."),
        _v: { dati: { p: I.p, w: I.w, f: I.f, s: I.s, c: I.c }, valori: bb.valori }
      };
    }
  });
  function mkpInst(rng) { var p = [], w = []; for (var j = 0; j < 4; j++) { p.push(ri(rng, 3, 10)); w.push(ri(rng, 2, 5)); } return { p: p, w: w, c: [ri(rng, 4, 8), ri(rng, 4, 8)] }; }
  function mkpAll(I) { // assegnamenti: 0 fuori, 1 o 2 zaino
    var res = [];
    for (var a = 0; a < 81; a++) { var x = a, L0 = [0, 0, 0], pp = 0, S = []; for (var j = 0; j < 4; j++) { var k = x % 3; x = Math.floor(x / 3); if (k) { L0[k] += I.w[j]; pp += I.p[j]; S.push(j + 1); } } if (L0[1] <= I.c[0] && L0[2] <= I.c[1]) res.push({ z: pp, S: S }); }
    res.sort(function (A, B) { return B.z - A.z; });
    return res;
  }
  function mkpText(lingua, I) {
    return T(lingua, "Zaino multiplo (MKP): due zaini di capacità $c_1=" + I.c[0] + "$ e $c_2=" + I.c[1] + "$, oggetti " + itemTab(lingua, I.p, I.w) + "; ogni oggetto va in al più uno zaino.",
      "Multiple knapsack (MKP): two knapsacks of capacity $c_1=" + I.c[0] + "$ and $c_2=" + I.c[1] + "$, items " + itemTab(lingua, I.p, I.w) + "; every item goes into at most one knapsack.");
  }
  add({
    id: "dp-g-mkp-dp", livello: "facile", capitolo: "dp-multiple-knapsack",
    link: L2("dp-multiple-knapsack", "dp-multiple-knapsack", "box-12-texmkpbu"),
    genera: function (rng, lingua) {
      var I = mkpInst(rng), z = mkpAll(I)[0].z, one = kpAll(I.p, I.w, I.c[0] + I.c[1]).z, big = kpAll(I.p, I.w, Math.max(I.c[0], I.c[1])).z;
      var bb = build(rng, num(z), [num(one), num(big), num(z - 1), num(z + 1)]);
      if (!bb || one === z) return null;
      return {
        testo: mkpText(lingua, I) + T(lingua, " Con la PD sugli stati $(j,(k_1,k_2))$ delle capacità residue, quanto vale il valore ottimo?", " With the DP on the states $(j,(k_1,k_2))$ of residual capacities, what is the optimal value?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Il valore ottimo è $" + z + "$. Un solo zaino di capacità $" + (I.c[0] + I.c[1]) + "$ darebbe $" + one + "$: è un upper bound, perché quella soluzione non si divide fra i due zaini.",
          "The optimal value is $" + z + "$. A single knapsack of capacity $" + (I.c[0] + I.c[1]) + "$ would give $" + one + "$: it is an upper bound, since that solution cannot be split between the two knapsacks."),
        _v: { dati: { p: I.p, w: I.w, c: I.c }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-mkp-sol", livello: "media", capitolo: "dp-multiple-knapsack",
    link: L2("dp-multiple-knapsack", "dp-multiple-knapsack", "box-14-texmkpsol"),
    genera: function (rng, lingua) {
      var I = mkpInst(rng), R = mkpAll(I), sets = [], seen = {};
      R.forEach(function (r) { var k = r.S.join(","); if (!seen[k]) { seen[k] = 1; sets.push(r); } });
      if (sets.length < 4 || sets[0].z === sets[1].z) return null;
      var one = kpAll(I.p, I.w, I.c[0] + I.c[1]);
      var bb = build(rng, setKey(sets[0].S), [setKey(bitsOf(one.best[0], 4)), setKey(sets[1].S), setKey(sets[2].S), setKey(sets[3].S)]);
      if (!bb) return null;
      return {
        testo: mkpText(lingua, I) + T(lingua, " Quale insieme di oggetti viene inserito negli zaini nella soluzione ottima (l'insieme ottimo è unico)?", " Which set of items is inserted into the knapsacks in the optimal solution (the optimal set is unique)?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "L'insieme $" + set(sets[0].S) + "$, di valore $" + sets[0].z + "$, si divide fra i due zaini rispettando le capacità; il secondo miglior insieme vale $" + sets[1].z + "$.",
          "The set $" + set(sets[0].S) + "$, of value $" + sets[0].z + "$, can be split between the two knapsacks respecting the capacities; the second best set is worth $" + sets[1].z + "$."),
        _v: { dati: { p: I.p, w: I.w, c: I.c }, valori: bb.valori }
      };
    }
  });
  function clsInst(rng) { var d = [], cap = [], sc = [], hc = [], vc = [0, 0, 0]; for (var t = 0; t < 3; t++) { d.push(ri(rng, 1, 5)); cap.push(ri(rng, 3, 7)); sc.push(ri(rng, 5, 15)); hc.push(ri(rng, 1, 3)); } return { d: d, cap: cap, sc: sc, vc: vc, hc: hc }; }
  function clsText(lingua, I) {
    var t = tab(["t", "1", "2", "3"], [["d_t"].concat(I.d), ["cap_t"].concat(I.cap), ["sc_t"].concat(I.sc), ["hc_t"].concat(I.hc)]);
    return T(lingua, "Lot sizing con capacità (CLS) su $3$ periodi: domanda $d_t$, capacità $cap_t$, costo di setup $sc_t$ (pagato se si produce nel periodo $t$) e costo $hc_t$ per unità di scorta a fine periodo, costo variabile nullo, scorte iniziale e finale nulle: " + t + ".",
      "Capacitated lot sizing (CLS) over $3$ periods: demand $d_t$, capacity $cap_t$, setup cost $sc_t$ (paid if we produce in period $t$) and cost $hc_t$ per unit of stock at the end of a period, zero variable cost, zero initial and final stock: " + t + ".");
  }
  add({
    id: "dp-g-cls-dp", livello: "facile", capitolo: "dp-capacitated-lot-sizing",
    link: L2("dp-capacitated-lot-sizing", "dp-capacitated-lot-sizing", "box-18-texclsbu"),
    genera: function (rng, lingua) {
      var I = clsInst(rng), R = clsAll(I.d, I.cap, I.sc, I.vc, I.hc);
      if (!R.length) return null;
      var l4l = lsCost(I.d, I.d, I.sc, I.vc, I.hc), big = [99, 99, 99], U = clsAll(I.d, big.map(function () { return sum(I.d); }), I.sc, I.vc, I.hc)[0].c;
      if (l4l === null || I.d.some(function (x, t) { return x > I.cap[t]; })) return null;
      var bb = build(rng, num(R[0].c), [num(l4l), num(U), num(R[0].c + 1), num(R.length > 1 ? R[1].c : R[0].c + 2)]);
      if (!bb) return null;
      return {
        testo: clsText(lingua, I) + T(lingua, " Con la PD sugli stati $(t,k)$ (periodo, scorta finale), quanto vale il costo ottimo $v(3,0)$?", " With the DP on the states $(t,k)$ (period, final stock), what is the optimal cost $v(3,0)$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Il costo ottimo è $" + R[0].c + "$, con il piano $x=" + vec(R[0].x) + "$. Il piano lot-for-lot costa $" + l4l + "$; ignorando le capacità si otterrebbe $" + U + "$.",
          "The optimal cost is $" + R[0].c + "$, with the plan $x=" + vec(R[0].x) + "$. The lot-for-lot plan costs $" + l4l + "$; ignoring the capacities one would get $" + U + "$."),
        _v: { dati: { d: I.d, cap: I.cap, sc: I.sc, vc: I.vc, hc: I.hc }, valori: bb.valori }
      };
    }
  });
  add({
    id: "dp-g-cls-plan", livello: "complessa", capitolo: "dp-capacitated-lot-sizing",
    link: L2("dp-capacitated-lot-sizing", "dp-capacitated-lot-sizing", "box-20-texclssolvector"),
    genera: function (rng, lingua) {
      var I = clsInst(rng), R = clsAll(I.d, I.cap, I.sc, I.vc, I.hc);
      if (R.length < 4 || R[0].c === R[1].c) return null;
      var key = function (r) { return { k: r.c + "|" + r.x.join(","), t: "$x=" + vec(r.x) + "$, " + T(lingua, "costo", "cost") + " $" + r.c + "$" }; };
      var l4l = lsCost(I.d, I.d, I.sc, I.vc, I.hc);
      var cands = [key(R[1]), key(R[2]), key(R[3])];
      if (l4l !== null && I.d.every(function (x, t) { return x <= I.cap[t]; })) cands.unshift(key({ c: l4l, x: I.d }));
      var bb = build(rng, key(R[0]), cands);
      if (!bb) return null;
      return {
        testo: clsText(lingua, I) + T(lingua, " Quale piano di produzione $x=(x_1,x_2,x_3)$ è ottimo (il piano ottimo è unico), e quanto costa?", " Which production plan $x=(x_1,x_2,x_3)$ is optimal (the optimal plan is unique), and what does it cost?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "La PD sulle scorte e la ricostruzione danno $x=" + vec(R[0].x) + "$ con costo $" + R[0].c + "$; il secondo miglior piano costa $" + R[1].c + "$. Con le capacità la produzione può anticipare la domanda anche con scorta in ingresso positiva.",
          "The DP on stocks and the reconstruction give $x=" + vec(R[0].x) + "$ with cost $" + R[0].c + "$; the second best plan costs $" + R[1].c + "$. With capacities production can anticipate demand even with positive incoming stock."),
        _v: { dati: { d: I.d, cap: I.cap, sc: I.sc, vc: I.vc, hc: I.hc }, valori: bb.valori }
      };
    }
  });
})();
