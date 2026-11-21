---
title: Programmazione dinamica
hide:
  - navigation
  - toc
---

<div class="hero" markdown>

# Programmazione dinamica

<!-- collana-riga -->
<p class="collana-riga" markdown>Un corso della collana <b>Ricerca Operativa e Matematica</b> · [tutti i corsi](#la-collana)</p>
<!-- /collana-riga -->

Materiale didattico ideato e sviluppato da **[Fabio Furini](https://fabiofurini.github.io/)**, professore
associato al [DIAG](https://www.diag.uniroma1.it/), Sapienza Università di Roma.

**Le dispense del corso, online**: i principi della programmazione dinamica e gli algoritmi di PD per i problemi di zaino (0/1, illimitato, limitato, subset sum, a scelta multipla, multidimensionale, con setup, zaini multipli), per il lot sizing senza capacità e capacitato, per il cambio monete e il taglio delle aste; con ricorrenze, pseudocodice, complessità, tabelle svolte passo per passo, esercizi con le soluzioni e app interattive.

Prerequisiti: [Ottimizzazione combinatoria](https://fabiofurini.github.io/ottimizzazione-combinatoria/) per i problemi e [Algoritmi](https://fabiofurini.github.io/algoritmi/) per lo pseudocodice, la ricorsione e l'analisi degli algoritmi.

[Comincia :material-arrow-right:](dp-principles/index.md){ .md-button .md-button--primary }
[:material-pencil: Esercizi](esercizi/index.md){ .md-button }
[:material-gesture-tap: Laboratorio](laboratorio/index.md){ .md-button }
[:material-clipboard-check-outline: Quiz](autovalutazione.md){ .md-button }
[:material-download: Materiale](materiale.md){ .md-button }

</div>

<!-- collana-app -->
## Provalo subito

La tabella della programmazione dinamica per lo zaino: si riempie una cella alla volta, con le celle da cui dipende, poi si ricostruisce la soluzione.

<div class="gi" data-grafico="oc-dp-knapsack"></div>

[:material-gesture-tap: Altre app nel laboratorio](laboratorio/index.md){ .md-button }
<!-- /collana-app -->

## Le parti del corso

Le stesse voci del menu: ogni scheda dice a quale parte e a quali capitoli della dispensa corrisponde.

<div class="grid cards" markdown>

-   :material-lightbulb-on-outline: **Principi**

    ---

    *Parte 1 · Capitolo 1*

    Principi

    [:octicons-arrow-right-24: I capitoli](principi.md)

-   :material-bag-personal-outline: **Problemi di zaino**

    ---

    *Parte 2 · Capitoli 2–9*

    Zaino 0/1 (KP) · Zaino illimitato (UKP) · Zaino limitato (BKP) · Subset sum (SSP) · Zaino a scelta multipla (MCKP) · Zaino multidimensionale (MDKP) · Zaino con setup (KPS) · Zaini multipli (MKP)

    [:octicons-arrow-right-24: I capitoli](problemi-di-zaino.md)

-   :material-factory: **Problemi di lot sizing**

    ---

    *Parte 3 · Capitoli 10–11*

    Lot sizing senza capacità (ULS) · Lot sizing capacitato (CLS)

    [:octicons-arrow-right-24: I capitoli](problemi-di-lot-sizing.md)

-   :material-shape-outline: **Problemi misti**

    ---

    *Parte 4 · Capitoli 12–13*

    Cambio monete (CCP) · Taglio delle aste (RCP)

    [:octicons-arrow-right-24: I capitoli](problemi-misti.md)

-   :material-clipboard-check-outline: **Autovalutazione**

    ---

    *Facsimile d'esame*

    Un facsimile nuovo a ogni avvio: 13 domande, 33 punti, con la soluzione e il link alle dispense.

    [:octicons-arrow-right-24: Mettiti alla prova](autovalutazione.md)

-   :material-gesture-tap: **Laboratorio**

    ---

    *App interattive*

    Le tabelle della PD che si riempiono passo per passo, sulle istanze di riferimento o su istanze tue.

    [:octicons-arrow-right-24: Le app](laboratorio/index.md)

</div>

<!-- collana-da-non-perdere -->
## Da non perdere

<div class="grid cards" markdown>

-   :material-pencil-box-multiple: **Esercizi con le soluzioni**

    ---

    Esercizi per ogni capitolo, ciascuno con la soluzione svolta che si apre con un clic.

    [:octicons-arrow-right-24: Gli esercizi](esercizi/index.md)

-   :material-clipboard-check-outline: **Quiz di autovalutazione**

    ---

    Un facsimile d'esame nuovo a ogni avvio: 13 domande, 33 punti, con la soluzione e il link alle dispense. In Materiale c'è anche la banca completa delle domande.

    [:octicons-arrow-right-24: Mettiti alla prova](autovalutazione.md)

-   :material-gesture-tap: **Laboratorio interattivo**

    ---

    App che girano nel browser: muovi i parametri e guarda le idee del corso lavorare, un passo alla volta.

    [:octicons-arrow-right-24: Il laboratorio](laboratorio/index.md)

-   :material-download: **Dispense in PDF**

    ---

    Dispense, eserciziari e slide in PDF, con la stessa numerazione del sito.

    [:octicons-arrow-right-24: Il materiale](materiale.md)

-   :material-format-list-numbered: **Indice completo**

    ---

    Tutti i capitoli con le loro sezioni in una pagina, e come è fatto ogni capitolo.

    [:octicons-arrow-right-24: L'indice](indice.md)

</div>
<!-- /collana-da-non-perdere -->

---

<!-- collana -->
## La collana

Dieci corsi con la stessa impostazione: dispense online e in PDF, esercizi con le soluzioni, laboratorio interattivo e quiz di autovalutazione.

<div class="grid cards" markdown>

-   :material-function-variant: **[Analisi Matematica 1](https://fabiofurini.github.io/analisi-matematica-1/)**

    numeri reali, funzioni, limiti, derivate e serie, con i grafici interattivi

-   :material-matrix: **[Algebra lineare](https://fabiofurini.github.io/algebra-lineare/)**

    vettori, matrici, determinanti, sistemi lineari e autovalori, con il laboratorio di calcolo

-   :material-code-braces: **[Algoritmi](https://fabiofurini.github.io/algoritmi/)**

    rappresentazione dei numeri, pseudocodice, ordinamento e ricerca, analisi e algoritmi ricorsivi

-   :material-vector-triangle: **[Programmazione lineare](https://fabiofurini.github.io/programmazione-lineare/)**

    poliedri, algoritmo del simplesso, dualità e simplesso duale, con il laboratorio interattivo

-   :material-dots-grid: **[Programmazione lineare intera](https://fabiofurini.github.io/programmazione-lineare-intera/)**

    rilassamento continuo, disuguaglianze valide, piani di taglio, branch-and-bound e branch-and-cut

-   :material-vector-curve: **[Ottimizzazione convessa](https://fabiofurini.github.io/ottimizzazione-convessa/)**

    insiemi e funzioni convesse, problemi di ottimizzazione convessa, con grafici interattivi

-   :material-graph-outline: **[Ottimizzazione su reti](https://fabiofurini.github.io/ottimizzazione-su-reti/)**

    grafi, alberi ricoprenti, cammini minimi, flussi su reti, simplesso su reti e gestione dei progetti

-   :material-hexagon-multiple-outline: **[Ottimizzazione combinatoria](https://fabiofurini.github.io/ottimizzazione-combinatoria/)**

    zaino, bin packing, colorazione, TSP, scheduling e lot sizing, risolti in tutti i modi

-   :material-table-large: **Programmazione dinamica** · *questo corso*

    principi e algoritmi di PD per zaino, lot sizing, cambio monete e taglio delle aste

-   :material-map-marker-path: **[Algoritmi euristici](https://fabiofurini.github.io/algoritmi-euristici/)**

    euristiche costruttive, ricerca locale, metaeuristiche ed euristiche MIP per i problemi di ottimizzazione combinatoria

-   :material-approximately-equal: **[Algoritmi di approssimazione](https://fabiofurini.github.io/algoritmi-di-approssimazione/)**

    garanzie di prestazione, schemi di approssimazione e limiti dell'approssimazione per i problemi combinatori

-   :material-vector-polygon: **[Modellazione MIP](https://fabiofurini.github.io/modellazione-mip/)**

    modelli di programmazione lineare a variabili intere, dalla formulazione alla soluzione con i solver

-   :material-chart-timeline-variant: **[Laboratorio di Ricerca Operativa](https://fabiofurini.github.io/laboratorio-ricerca-operativa/)**

    modellazione e risoluzione di problemi di ottimizzazione con Python e i solver

</div>
<!-- /collana -->

---

Materiale didattico di **[Fabio Furini](https://fabiofurini.github.io/)** —
[DIAG](https://www.diag.uniroma1.it/), Sapienza Università di Roma.

*Questo sito è disponibile anche in [inglese](https://fabiofurini.github.io/dynamic-programming/).*
