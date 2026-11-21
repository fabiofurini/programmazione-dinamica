---
title: "Errori tipici · In sintesi"
---

# Errori tipici · In sintesi

<div class="info-capitolo" markdown>

**Parte 3 · Problemi di lot sizing · Capitolo 10** · [:material-book-open-variant: Capitolo 10: Lot sizing senza capacità (ULS)](index.md) · [:material-file-pdf-box: Dispensa, volume 1 (PDF)](../pdf/dispensa-1-programmazione-dinamica.pdf) · [:material-pencil: Esercizi: Lot sizing senza capacità (ULS)](../esercizi/dp-lot-sizing.md) · [:material-gesture-tap: App: Wagner-Whitin per il lot sizing senza capacità](../laboratorio/wagner-whitin-lot-sizing.md)

</div>

## 10.3 Errori tipici

!!! attenzione "Attenzione"

    - <strong>Applicare la proprietà zero-inventory ordering con le capacità.</strong> La dimostrazione sposta la produzione fra due periodi senza limiti: con le capacità un periodo può produrre mentre ci sono unità a scorta.

    - <strong>Calcolare da zero il costo di un lotto.</strong> Calcolare ogni $c_{j,t}$ dalla sua definizione costa $O(m^3)$ passi dentro l'algoritmo di PD; il calcolo incrementale di CostMatrix mantiene $\Theta(m^2)$.

    - <strong>Dimenticare la scorta finale vuota.</strong> La sottoistanza con i periodi $\{1,\dots,t\}$ termina con la scorta vuota: per questo il lotto nel periodo $j$ produce esattamente $D_{j,t}$ unità.

    - <strong>Prendere un piano ottimo per l'unico.</strong> L'[Esempio 10.1](index.md#box-1-texuls1) ha due piani ottimi: l'algoritmo di PD restituisce quello con il periodo $j$ minimo, perché aggiorna solo con un valore strettamente minore.

## 10.4 In sintesi

!!! chiave "In sintesi"

    - Se tutti i costi sono non negativi, il problema senza capacità ha un piano ottimo in cui un periodo produce solo quando la scorta è nulla (Wagner e Whitin), quindi $x_j=D_{j,t}$ per ogni lotto di produzione.

    - Il costo $c_{j,t}$ di ogni lotto si calcola in $\Theta(m^2)$ passi, e la ricorrenza $v(t)=\min_j\{v(j-1)+c_{j,t}\}$ dà il valore ottimo in $\Theta(m^2)$ passi; è un cammino minimo.

    - La proprietà zero-inventory ordering si basa su una produzione senza limiti: con le capacità non vale.

    <strong>Quadro riassuntivo dell'esempio.</strong>

    <div class="tabella" markdown="0"><table>
    <tr>
    <th>Istanza</th>
    <th>Lower bound</th>
    <th>Upper bound</th>
    <th>Origine</th>
    </tr>
    <tr>
    <td><a href="../#box-1-texuls1">Esempio 10.1</a> (senza capacità, <span class="arithmatex">\(m=5\)</span>)</td>
    <td><span class="arithmatex">\(170\)</span></td>
    <td><span class="arithmatex">\(170\)</span></td>
    <td>algoritmo di PD di Wagner e Whitin</td>
    </tr>
    </table></div>

---

**Esercizi su questo capitolo:** [:material-pencil: Lot sizing senza capacità (ULS)](../esercizi/dp-lot-sizing.md)

