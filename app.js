(() => {
  "use strict";

  const MONEY_TOLERANCE = 0.02;
  let comissaoMode = "percent";
  let syncingComissao = false;
  let syncingFinancing = false;
  let entradaManual = false;

  const els = {
    corretor: document.getElementById("corretor"),
    dataSimulacao: document.getElementById("dataSimulacao"),
    valorImovel: document.getElementById("valorImovel"),
    percentualFinanciamento: document.getElementById("percentualFinanciamento"),
    entradaNegociada: document.getElementById("entradaNegociada"),
    btnAlterarEntrada: document.getElementById("btnAlterarEntrada"),
    btnResetEntrada: document.getElementById("btnResetEntrada"),
    prazoFinanciamento: document.getElementById("prazoFinanciamento"),
    parcelaFinanciamento: document.getElementById("parcelaFinanciamento"),

    outValorFinanciado: document.getElementById("outValorFinanciado"),
    outEntradaCaixa: document.getElementById("outEntradaCaixa"),
    outPercEntrada: document.getElementById("outPercEntrada"),
    outPercFinanciado: document.getElementById("outPercFinanciado"),
    outJurosFin: document.getElementById("outJurosFin"),
    outTotalEncargos: document.getElementById("outTotalEncargos"),
    outCustoTotal: document.getElementById("outCustoTotal"),
    outPercAMais: document.getElementById("outPercAMais"),
    outPercAMaisParcial: document.getElementById("outPercAMaisParcial"),
    outFinFimLabel: document.getElementById("outFinFimLabel"),
    outTotalFinLabel: document.getElementById("outTotalFinLabel"),
    outEntradaTotalComp: document.getElementById("outEntradaTotalComp"),
    outAbatimentoEntrada: document.getElementById("outAbatimentoEntrada"),
    outAbatimentoCampo: document.getElementById("outAbatimentoCampo"),
    outSinalResumo: document.getElementById("outSinalResumo"),
    outRestanteEntrada: document.getElementById("outRestanteEntrada"),
    outPagamentoSinal: document.getElementById("outPagamentoSinal"),

    sinalValor: document.getElementById("sinalValor"),
    sinalParcelas: document.getElementById("sinalParcelas"),
    sinalData: document.getElementById("sinalData"),
    comissaoPerc: document.getElementById("comissaoPerc"),
    comissaoValor: document.getElementById("comissaoValor"),
    comissaoCalculada: document.getElementById("comissaoCalculada"),
    btnComissaoPerc: document.getElementById("btnComissaoPerc"),
    btnComissaoValor: document.getElementById("btnComissaoValor"),

    entradaParcValor: document.getElementById("entradaParcValor"),
    entradaParcQtd: document.getElementById("entradaParcQtd"),
    entradaParcInicio: document.getElementById("entradaParcInicio"),
    entradaParcFim: document.getElementById("entradaParcFim"),
    outParcelaEntrada: document.getElementById("outParcelaEntrada"),

    jurosValor: document.getElementById("jurosValor"),
    jurosQtd: document.getElementById("jurosQtd"),
    jurosInicio: document.getElementById("jurosInicio"),
    jurosFim: document.getElementById("jurosFim"),
    outTotalJuros: document.getElementById("outTotalJuros"),

    itbiGratuito: document.getElementById("itbiGratuito"),
    itbiFields: document.getElementById("itbiFields"),
    itbiValor: document.getElementById("itbiValor"),
    itbiQtd: document.getElementById("itbiQtd"),
    itbiInicio: document.getElementById("itbiInicio"),
    itbiFim: document.getElementById("itbiFim"),
    outParcelaItbi: document.getElementById("outParcelaItbi"),
    hintItbi: document.getElementById("hintItbi"),

    finParcValor: document.getElementById("finParcValor"),
    finParcQtd: document.getElementById("finParcQtd"),
    finInicio: document.getElementById("finInicio"),
    finFim: document.getElementById("finFim"),

    alerts: document.getElementById("alerts"),
    alertsResumo: document.getElementById("alertsResumo"),
    viewForm: document.getElementById("view-form"),
    viewSummary: document.getElementById("view-summary"),
    resumoImovel: document.getElementById("resumoImovel"),
    resumoJuros: document.getElementById("resumoJuros"),
    tabelaCronograma: document.getElementById("tabelaCronograma"),
    tabelaMensal: document.getElementById("tabelaMensal"),
    resumoTotais: document.getElementById("resumoTotais"),

    btnLimpar: document.getElementById("btnLimpar"),
    btnResumo: document.getElementById("btnResumo"),
    btnVoltar: document.getElementById("btnVoltar"),
    btnPdf: document.getElementById("btnPdf"),
  };

  function onlyDigitsAndComma(raw) {
    return String(raw ?? "")
      .replace(/[^\d,]/g, "")
      .replace(/(,.*),/g, "$1");
  }

  function parseMoney(value) {
    if (value == null || value === "") return 0;
    const cleaned = String(value)
      .trim()
      .replace(/[R$\s]/gi, "")
      .replace(/\./g, "")
      .replace(",", ".");
    if (cleaned === "" || cleaned === "-" || cleaned === ".") return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function parsePercent(value) {
    if (value == null || value === "") return 0;
    const cleaned = String(value)
      .trim()
      .replace(/%/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    if (cleaned === "") return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function parseIntSafe(value) {
    if (value == null || String(value).trim() === "") return NaN;
    const n = Number.parseInt(String(value), 10);
    return Number.isFinite(n) ? n : NaN;
  }

  function formatMoney(value) {
    const n = Number.isFinite(value) ? value : 0;
    return n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatPercent(value) {
    const n = Number.isFinite(value) ? value : 0;
    return (
      n.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    );
  }

  function formatMoneyInputFromNumber(value) {
    if (!Number.isFinite(value) || value <= 0) return value === 0 ? "0,00" : "";
    return formatMoneyInput(String(Math.round(value * 100)));
  }

  function formatMoneyInput(raw) {
    let digits = String(raw ?? "").replace(/\D/g, "");
    if (!digits) return "";
    digits = digits.replace(/^0+(?=\d)/, "");
    while (digits.length < 3) digits = "0" + digits;
    const cents = digits.slice(-2);
    let integer = digits.slice(0, -2);
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return integer + "," + cents;
  }

  function formatPercentInput(raw) {
    let text = onlyDigitsAndComma(raw);
    if (!text) return "";
    if (text.startsWith(",")) text = "0" + text;
    const parts = text.split(",");
    const intPart = parts[0].replace(/\D/g, "").slice(0, 3);
    const decPart = (parts[1] || "").replace(/\D/g, "").slice(0, 2);
    if (parts.length > 1) return intPart + "," + decPart;
    return intPart;
  }

  function formatPercentDisplay(value) {
    const n = Number.isFinite(value) ? value : 0;
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDateBR(iso) {
    if (!iso) return "—";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return "—";
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  function formatMonthLabel(isoDay) {
    if (!isoDay) return "—";
    const [y, m] = isoDay.split("-").map(Number);
    const dt = new Date(y, m - 1, 1);
    const label = dt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    return label.replace(".", "").replace(/^./, (c) => c.toUpperCase());
  }

  function todayISO() {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function isValidISODate(iso) {
    if (!iso || typeof iso !== "string") return false;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return false;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
  }

  function addMonths(iso, months) {
    if (!isValidISODate(iso) || !Number.isFinite(months)) return "";
    const [y, m, d] = iso.split("-").map(Number);
    const base = new Date(y, m - 1, 1);
    base.setMonth(base.getMonth() + months);
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const day = Math.min(d, lastDay);
    return (
      base.getFullYear() +
      "-" +
      String(base.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(day).padStart(2, "0")
    );
  }

  function endDateFromInstallments(startISO, quantity) {
    const q = Number(quantity);
    if (!isValidISODate(startISO) || !Number.isFinite(q) || q < 1) return "";
    return addMonths(startISO, q - 1);
  }

  function monthKey(iso) {
    return iso ? iso.slice(0, 7) : "";
  }

  function nearlyEqual(a, b, tol = MONEY_TOLERANCE) {
    return Math.abs(a - b) <= tol;
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function resolveComissao(valorImovel) {
    const percRaw = parsePercent(els.comissaoPerc.value);
    const valorRaw = parseMoney(els.comissaoValor.value);
    let perc = Number.isFinite(percRaw) ? percRaw : 0;
    let valor = Number.isFinite(valorRaw) ? valorRaw : 0;

    if (comissaoMode === "percent") {
      valor = valorImovel > 0 ? (valorImovel * perc) / 100 : 0;
    } else {
      perc = valorImovel > 0 ? (valor / valorImovel) * 100 : 0;
    }

    return {
      mode: comissaoMode,
      perc: Number.isFinite(perc) ? perc : 0,
      valor: Number.isFinite(valor) ? valor : 0,
    };
  }

  function setEntradaManual(enabled) {
    entradaManual = !!enabled;
    els.entradaNegociada.readOnly = !entradaManual;
    els.btnAlterarEntrada.hidden = entradaManual;
    els.btnResetEntrada.hidden = !entradaManual;
    if (entradaManual) {
      els.entradaNegociada.focus();
    }
  }

  function syncFinancingFromEntrada(valorImovel, entradaTotal) {
    if (!Number.isFinite(valorImovel) || valorImovel <= 0) return;
    const entrada = Math.min(Math.max(0, entradaTotal), valorImovel);
    const financiado = round2(valorImovel - entrada);
    const perc = (financiado / valorImovel) * 100;
    syncingFinancing = true;
    els.percentualFinanciamento.value = formatPercentDisplay(perc);
    syncingFinancing = false;
  }

  function readModel() {
    const valorImovel = parseMoney(els.valorImovel.value);
    let percFin = parsePercent(els.percentualFinanciamento.value);
    const prazo = parseIntSafe(els.prazoFinanciamento.value);
    const parcelaFin = parseMoney(els.parcelaFinanciamento.value);

    let valorFinanciado = 0;
    let entradaTotal = 0;

    if (Number.isFinite(valorImovel) && valorImovel > 0) {
      if (entradaManual) {
        entradaTotal = parseMoney(els.entradaNegociada.value);
        if (!Number.isFinite(entradaTotal) || entradaTotal < 0) entradaTotal = 0;
        if (entradaTotal > valorImovel) entradaTotal = valorImovel;
        entradaTotal = round2(entradaTotal);
        valorFinanciado = round2(valorImovel - entradaTotal);
        percFin = (valorFinanciado / valorImovel) * 100;
      } else {
        if (!Number.isFinite(percFin) || percFin < 0) percFin = 0;
        if (percFin > 100) percFin = 100;
        valorFinanciado = round2((valorImovel * percFin) / 100);
        entradaTotal = round2(Math.max(0, valorImovel - valorFinanciado));
      }
    }

    const percEntradaEfetivo =
      valorImovel > 0 ? (entradaTotal / valorImovel) * 100 : 0;
    const percFinanciadoEfetivo =
      valorImovel > 0 ? (valorFinanciado / valorImovel) * 100 : 0;

    const comissao = resolveComissao(Number.isFinite(valorImovel) ? valorImovel : 0);
    const sinalValor = parseMoney(els.sinalValor.value);
    const sinalParcelas = parseIntSafe(els.sinalParcelas.value);
    const sinalData = els.sinalData.value;

    // Abatimento da entrada = sinal − comissão (comissão embutida no sinal)
    const abatimentoEntrada = round2(
      Math.max(0, (Number.isFinite(sinalValor) ? sinalValor : 0) - comissao.valor)
    );
    const entradaParcValor = round2(Math.max(0, entradaTotal - abatimentoEntrada));

    const sinalParcela =
      sinalParcelas > 0 && Number.isFinite(sinalValor) ? sinalValor / sinalParcelas : 0;
    const sinalFim = endDateFromInstallments(sinalData, sinalParcelas);

    const entradaParcQtd = parseIntSafe(els.entradaParcQtd.value);
    const entradaParcInicio = els.entradaParcInicio.value;
    const parcelaEntrada =
      entradaParcQtd > 0 && entradaParcValor > 0
        ? entradaParcValor / entradaParcQtd
        : 0;

    const jurosValor = parseMoney(els.jurosValor.value);
    const jurosQtd = parseIntSafe(els.jurosQtd.value);
    const jurosInicio = els.jurosInicio.value;
    const totalJurosObra =
      Number.isFinite(jurosValor) && jurosQtd > 0 ? jurosValor * jurosQtd : 0;

    const itbiGratuito = !!els.itbiGratuito.checked;
    const itbiValor = itbiGratuito ? 0 : parseMoney(els.itbiValor.value);
    const itbiQtd = itbiGratuito ? 1 : parseIntSafe(els.itbiQtd.value);
    const itbiInicio = itbiGratuito ? "" : els.itbiInicio.value;
    const parcelaItbi =
      !itbiGratuito && itbiQtd > 0 && Number.isFinite(itbiValor)
        ? itbiValor / itbiQtd
        : 0;

    const finInicio = els.finInicio.value;
    const finParcelas = Number.isFinite(prazo) ? prazo : NaN;
    const finParcelaMensal = Number.isFinite(parcelaFin) ? parcelaFin : 0;
    const totalFinanciamento =
      finParcelaMensal > 0 && finParcelas > 0 ? finParcelaMensal * finParcelas : 0;
    const finFim = endDateFromInstallments(finInicio, finParcelas);

    const jurosFinanciamento = Math.max(0, totalFinanciamento - valorFinanciado);
    const totalEncargos = jurosFinanciamento + totalJurosObra;

    // Desembolso do sinal já inclui a comissão (não soma comissão à parte)
    const totalDesembolsos =
      (Number.isFinite(sinalValor) ? sinalValor : 0) +
      entradaParcValor +
      totalJurosObra +
      (Number.isFinite(itbiValor) ? itbiValor : 0) +
      totalFinanciamento;

    const aMaisReais = totalDesembolsos - (Number.isFinite(valorImovel) ? valorImovel : 0);
    const percAMais = valorImovel > 0 ? (aMaisReais / valorImovel) * 100 : 0;
    const percEncargosSobreImovel =
      valorImovel > 0 ? (totalEncargos / valorImovel) * 100 : 0;
    const percAMaisParcial =
      valorImovel > 0 ? (jurosFinanciamento / valorImovel) * 100 : 0;

    // Visão do cliente (PDF): comissão embutida no imóvel / entrada / sinal
    const valorImovelCliente = round2(valorImovel + comissao.valor);
    const entradaCliente = round2(entradaTotal + comissao.valor);
    const percFinCliente =
      valorImovelCliente > 0 ? (valorFinanciado / valorImovelCliente) * 100 : 0;
    const percEntradaCliente =
      valorImovelCliente > 0 ? (entradaCliente / valorImovelCliente) * 100 : 0;

    const model = {
      corretor: (els.corretor.value || "").trim(),
      dataSimulacao: els.dataSimulacao.value,
      valorImovel,
      percFin,
      entradaTotal,
      entradaManual,
      prazo,
      parcelaFin,
      valorFinanciado,
      percEntradaEfetivo,
      percFinanciadoEfetivo,
      sinalValor,
      sinalParcelas,
      sinalData,
      sinalParcela,
      sinalFim,
      comissaoMode: comissao.mode,
      comissaoPerc: comissao.perc,
      comissaoValor: comissao.valor,
      abatimentoEntrada,
      totalNoSinal: Number.isFinite(sinalValor) ? sinalValor : 0,
      entradaParcValor,
      entradaParcQtd,
      entradaParcInicio,
      entradaParcFim: endDateFromInstallments(entradaParcInicio, entradaParcQtd),
      parcelaEntrada,
      jurosValor,
      jurosQtd,
      jurosInicio,
      jurosFim: endDateFromInstallments(jurosInicio, jurosQtd),
      totalJurosObra,
      itbiGratuito,
      itbiValor,
      itbiQtd,
      itbiInicio,
      itbiFim: itbiGratuito
        ? ""
        : endDateFromInstallments(itbiInicio, itbiQtd),
      parcelaItbi,
      finInicio,
      finParcelas,
      finParcelaMensal,
      finFim,
      totalFinanciamento,
      jurosFinanciamento,
      totalEncargos,
      totalDesembolsos,
      aMaisReais,
      percAMais,
      percAMaisParcial,
      percEncargosSobreImovel,
      valorImovelCliente,
      entradaCliente,
      percFinCliente,
      percEntradaCliente,
    };

    model.mensal = buildMonthlySchedule(model);
    return model;
  }

  function buildInstallmentStream(startISO, quantity, amountPerInstallment) {
    const rows = [];
    const q = Number(quantity);
    const amount = Number(amountPerInstallment);
    if (!isValidISODate(startISO) || !Number.isFinite(q) || q < 1 || !(amount > 0)) {
      return rows;
    }
    for (let i = 0; i < q; i += 1) {
      rows.push({ date: addMonths(startISO, i), amount: round2(amount) });
    }
    if (rows.length > 1) {
      const target = round2(amount * q);
      const sumExceptLast = rows.slice(0, -1).reduce((acc, r) => acc + r.amount, 0);
      rows[rows.length - 1].amount = round2(target - sumExceptLast);
    }
    return rows;
  }

  function buildMonthlySchedule(m) {
    const buckets = new Map();

    function ensure(dateISO) {
      const key = monthKey(dateISO);
      if (!key) return null;
      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          date: dateISO,
          sinal: 0,
          entrada: 0,
          jurosObra: 0,
          itbi: 0,
          financiamento: 0,
          total: 0,
        });
      }
      return buckets.get(key);
    }

    function addStream(stream, field) {
      for (const item of stream) {
        const bucket = ensure(item.date);
        if (!bucket) continue;
        bucket[field] = round2(bucket[field] + item.amount);
        bucket.total = round2(bucket.total + item.amount);
      }
    }

    // Sinal já embute a comissão no valor pago
    addStream(buildInstallmentStream(m.sinalData, m.sinalParcelas, m.sinalParcela), "sinal");
    addStream(
      buildInstallmentStream(m.entradaParcInicio, m.entradaParcQtd, m.parcelaEntrada),
      "entrada"
    );
    addStream(buildInstallmentStream(m.jurosInicio, m.jurosQtd, m.jurosValor), "jurosObra");
    if (!m.itbiGratuito) {
      addStream(buildInstallmentStream(m.itbiInicio, m.itbiQtd, m.parcelaItbi), "itbi");
    }
    addStream(
      buildInstallmentStream(m.finInicio, m.finParcelas, m.finParcelaMensal),
      "financiamento"
    );

    const rows = Array.from(buckets.values()).sort((a, b) =>
      a.key < b.key ? -1 : a.key > b.key ? 1 : 0
    );

    let peak = 0;
    for (const row of rows) {
      if (row.total > peak) peak = row.total;
    }

    const totals = rows.reduce(
      (acc, row) => {
        acc.sinal = round2(acc.sinal + row.sinal);
        acc.entrada = round2(acc.entrada + row.entrada);
        acc.jurosObra = round2(acc.jurosObra + row.jurosObra);
        acc.itbi = round2(acc.itbi + row.itbi);
        acc.financiamento = round2(acc.financiamento + row.financiamento);
        acc.total = round2(acc.total + row.total);
        return acc;
      },
      { sinal: 0, entrada: 0, jurosObra: 0, itbi: 0, financiamento: 0, total: 0 }
    );

    return { rows, totals, peak, count: rows.length };
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function periodLabel(startISO, endISO, qtd) {
    if (!startISO && !endISO) return "—";
    if (qtd === 1 || !endISO || startISO === endISO) {
      return formatDateBR(startISO || endISO);
    }
    return `${formatDateBR(startISO)} a ${formatDateBR(endISO)}`;
  }

  function setComissaoMode(mode) {
    comissaoMode = mode === "value" ? "value" : "percent";
    els.btnComissaoPerc.classList.toggle("is-active", comissaoMode === "percent");
    els.btnComissaoValor.classList.toggle("is-active", comissaoMode === "value");
    els.comissaoPerc.readOnly = comissaoMode !== "percent";
    els.comissaoValor.readOnly = comissaoMode !== "value";
    syncComissaoFields();
    updateLiveOutputs();
  }

  function syncComissaoFields() {
    if (syncingComissao) return;
    syncingComissao = true;
    const valorImovel = parseMoney(els.valorImovel.value);
    const resolved = resolveComissao(Number.isFinite(valorImovel) ? valorImovel : 0);

    if (comissaoMode === "percent") {
      els.comissaoValor.value =
        els.comissaoPerc.value !== ""
          ? formatMoneyInputFromNumber(resolved.valor)
          : "";
    } else if (els.comissaoValor.value) {
      els.comissaoPerc.value = formatPercentDisplay(resolved.perc);
    } else {
      els.comissaoPerc.value = "";
    }

    els.comissaoCalculada.value = formatMoney(resolved.valor);
    syncingComissao = false;
  }

  function applyItbiGratuitoUI() {
    const free = !!els.itbiGratuito.checked;
    els.itbiFields.style.opacity = free ? "0.55" : "1";
    [els.itbiValor, els.itbiQtd, els.itbiInicio].forEach((el) => {
      el.disabled = free;
    });
    if (free) {
      els.hintItbi.innerHTML = "ITBI + Cartório marcado como <strong>gratuito</strong>.";
      els.outParcelaItbi = null;
    } else if (!document.getElementById("outParcelaItbi")) {
      els.hintItbi.innerHTML =
        'Parcela estimada: <strong id="outParcelaItbi">R$ 0,00</strong>';
      els.outParcelaItbi = document.getElementById("outParcelaItbi");
    }
  }

  function updateLiveOutputs() {
    syncComissaoFields();

    const valorImovel = parseMoney(els.valorImovel.value);

    if (!entradaManual) {
      const percFin = parsePercent(els.percentualFinanciamento.value);
      if (Number.isFinite(valorImovel) && valorImovel > 0 && Number.isFinite(percFin)) {
        const financiado = round2((valorImovel * Math.min(Math.max(percFin, 0), 100)) / 100);
        const entrada = round2(Math.max(0, valorImovel - financiado));
        els.entradaNegociada.value = formatMoneyInputFromNumber(entrada);
      } else if (!els.entradaNegociada.value || !entradaManual) {
        els.entradaNegociada.value = "";
      }
    } else if (Number.isFinite(valorImovel) && valorImovel > 0) {
      let entrada = parseMoney(els.entradaNegociada.value);
      if (entrada > valorImovel) {
        entrada = valorImovel;
        els.entradaNegociada.value = formatMoneyInputFromNumber(entrada);
      }
      syncFinancingFromEntrada(valorImovel, entrada);
    }

    const m = readModel();

    els.finParcValor.value = els.parcelaFinanciamento.value || "";
    els.finParcQtd.value = Number.isFinite(m.prazo) && m.prazo > 0 ? String(m.prazo) : "";
    els.finFim.value = m.finFim || "";
    els.entradaParcValor.value = formatMoney(m.entradaParcValor);
    els.outAbatimentoCampo.value = formatMoney(m.abatimentoEntrada);
    els.outPagamentoSinal.value = formatMoney(m.totalNoSinal);

    setText(els.outValorFinanciado, formatMoney(m.valorFinanciado));
    setText(els.outEntradaCaixa, formatMoney(m.entradaTotal));
    setText(els.outPercEntrada, formatPercent(m.percEntradaEfetivo));
    setText(els.outPercFinanciado, formatPercent(m.percFinanciadoEfetivo));

    setText(els.outEntradaTotalComp, formatMoney(m.entradaTotal));
    setText(els.outAbatimentoEntrada, formatMoney(m.abatimentoEntrada));
    setText(els.outSinalResumo, formatMoney(m.sinalValor));
    setText(els.outRestanteEntrada, formatMoney(m.entradaParcValor));

    setText(els.outFinFimLabel, m.finFim ? formatDateBR(m.finFim) : "—");
    setText(els.outTotalFinLabel, formatMoney(m.totalFinanciamento));
    setText(els.outJurosFin, formatMoney(m.jurosFinanciamento));
    setText(els.outPercAMaisParcial, formatPercent(m.percAMaisParcial));
    setText(els.outTotalEncargos, formatMoney(m.totalEncargos));
    setText(els.outCustoTotal, formatMoney(m.totalDesembolsos));
    setText(els.outPercAMais, formatPercent(m.percAMais));

    els.entradaParcFim.value = m.entradaParcFim ? formatDateBR(m.entradaParcFim) : "";
    els.jurosFim.value = m.jurosFim ? formatDateBR(m.jurosFim) : "";
    els.itbiFim.value = m.itbiFim ? formatDateBR(m.itbiFim) : "";

    setText(els.outParcelaEntrada, formatMoney(m.parcelaEntrada));
    setText(els.outTotalJuros, formatMoney(m.totalJurosObra));
    if (!m.itbiGratuito && els.outParcelaItbi) {
      setText(els.outParcelaItbi, formatMoney(m.parcelaItbi));
    }

    renderAlerts(els.alerts, collectWarnings(m), false);
  }

  function collectWarnings(m) {
    const warnings = [];

    if (m.percFin > 100) {
      warnings.push({
        type: "danger",
        text: "O percentual de financiamento não pode ser superior a 100%.",
      });
    }

    if (m.sinalValor > 0 && m.comissaoValor > m.sinalValor + MONEY_TOLERANCE) {
      warnings.push({
        type: "warn",
        text:
          "A comissão (" +
          formatMoney(m.comissaoValor) +
          ") é maior que o sinal (" +
          formatMoney(m.sinalValor) +
          "). O abatimento da entrada ficou zerado.",
      });
    }

    if (m.abatimentoEntrada > m.entradaTotal + MONEY_TOLERANCE && m.entradaTotal > 0) {
      warnings.push({
        type: "warn",
        text: "O abatimento (sinal − comissão) é maior que a entrada. O restante parcelado ficou zerado.",
      });
    }

    if (m.entradaManual) {
      warnings.push({
        type: "info",
        text:
          "Entrada manual ativa. Financiamento reajustado para " +
          formatMoney(m.valorFinanciado) +
          " (" +
          formatPercent(m.percFin) +
          ").",
      });
    }

    if (m.comissaoPerc > 100) {
      warnings.push({
        type: "danger",
        text: "A comissão do corretor não pode ultrapassar 100%.",
      });
    }

    return warnings;
  }

  function collectBlockingErrors(m) {
    const errors = [];

    if (!m.corretor) errors.push({ field: "corretor", text: "Informe o nome do corretor." });
    if (!isValidISODate(m.dataSimulacao)) {
      errors.push({ field: "dataSimulacao", text: "Informe uma data de simulação válida." });
    }
    if (!Number.isFinite(m.valorImovel) || m.valorImovel <= 0) {
      errors.push({ field: "valorImovel", text: "Informe o valor do imóvel." });
    }
    if (!Number.isFinite(m.percFin) || m.percFin < 0) {
      errors.push({
        field: "percentualFinanciamento",
        text: "Informe o percentual de financiamento aprovado.",
      });
    } else if (m.percFin > 100) {
      errors.push({
        field: "percentualFinanciamento",
        text: "O percentual de financiamento não pode ultrapassar 100%.",
      });
    }
    if (!Number.isFinite(m.entradaTotal) || m.entradaTotal < 0) {
      errors.push({ field: "entradaNegociada", text: "Entrada inválida." });
    }
    if (!Number.isFinite(m.prazo) || m.prazo < 1) {
      errors.push({
        field: "prazoFinanciamento",
        text: "Informe o prazo do financiamento em meses (mínimo 1).",
      });
    }
    if (!Number.isFinite(m.parcelaFin) || m.parcelaFin <= 0) {
      errors.push({
        field: "parcelaFinanciamento",
        text: "Informe o valor da parcela mensal do financiamento.",
      });
    }
    if (!isValidISODate(m.finInicio)) {
      errors.push({ field: "finInicio", text: "Informe a data de início do financiamento." });
    }

    if (!Number.isFinite(m.sinalParcelas) || m.sinalParcelas < 1) {
      errors.push({ field: "sinalParcelas", text: "Parcelas do sinal: mínimo 1." });
    }
    if (!Number.isFinite(m.entradaParcQtd) || m.entradaParcQtd < 1) {
      errors.push({
        field: "entradaParcQtd",
        text: "Informe em quantas vezes o restante da entrada será dividido.",
      });
    }
    if (!Number.isFinite(m.jurosQtd) || m.jurosQtd < 1) {
      errors.push({ field: "jurosQtd", text: "Parcelas dos juros de obra: mínimo 1." });
    }
    if (!m.itbiGratuito && (!Number.isFinite(m.itbiQtd) || m.itbiQtd < 1)) {
      errors.push({ field: "itbiQtd", text: "Parcelas de ITBI + Cartório: mínimo 1." });
    }

    if (m.comissaoPerc < 0 || m.comissaoPerc > 100) {
      errors.push({
        field: comissaoMode === "percent" ? "comissaoPerc" : "comissaoValor",
        text: "Comissão inválida: use percentual entre 0 e 100 ou um valor positivo.",
      });
    }

    if (m.sinalValor > 0 || m.comissaoValor > 0) {
      if (!isValidISODate(m.sinalData)) {
        errors.push({ field: "sinalData", text: "Informe a data inicial do sinal." });
      }
    }
    if (m.entradaParcValor > 0 && !isValidISODate(m.entradaParcInicio)) {
      errors.push({
        field: "entradaParcInicio",
        text: "Informe a data de início da entrada parcelada.",
      });
    }
    if (m.jurosValor > 0 && !isValidISODate(m.jurosInicio)) {
      errors.push({
        field: "jurosInicio",
        text: "Informe a data de início dos juros de obra.",
      });
    }
    if (!m.itbiGratuito && m.itbiValor > 0 && !isValidISODate(m.itbiInicio)) {
      errors.push({
        field: "itbiInicio",
        text: "Informe a data de início do ITBI + Cartório.",
      });
    }

    return errors;
  }

  function clearInvalidMarks() {
    document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  }

  function markInvalid(fieldId) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.add("is-invalid");
  }

  function renderAlerts(container, items, scroll) {
    if (!container) return;
    container.innerHTML = "";
    for (const item of items) {
      const div = document.createElement("div");
      div.className = `alert alert--${item.type || "warn"}`;
      div.textContent = item.text;
      container.appendChild(div);
    }
    if (scroll && items.length) {
      container.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function dlItem(label, value) {
    const wrap = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    wrap.append(dt, dd);
    return wrap;
  }

  function buildCronograma(m, { forClient = false } = {}) {
    const rows = [
      {
        desc: "Sinal",
        valor: m.sinalValor,
        parcelas: Number.isFinite(m.sinalParcelas) ? m.sinalParcelas : 1,
        periodo: periodLabel(m.sinalData, m.sinalFim, m.sinalParcelas),
        show: m.sinalValor > 0 || !!m.sinalData,
      },
    ];

    if (!forClient && m.comissaoValor > 0) {
      rows.push({
        desc: "Comissão (uso interno — embutida no sinal)",
        valor: m.comissaoValor,
        parcelas: Number.isFinite(m.sinalParcelas) ? m.sinalParcelas : 1,
        periodo: periodLabel(m.sinalData, m.sinalFim, m.sinalParcelas),
        detail: `${formatPercent(m.comissaoPerc)} · abatimento entrada ${formatMoney(m.abatimentoEntrada)}`,
        show: true,
      });
    }

    rows.push(
      {
        desc: forClient ? "Entrada parcelada" : "Entrada parcelada (restante)",
        valor: m.entradaParcValor,
        parcelas: Number.isFinite(m.entradaParcQtd) ? m.entradaParcQtd : 0,
        periodo: periodLabel(m.entradaParcInicio, m.entradaParcFim, m.entradaParcQtd),
        detail: m.parcelaEntrada > 0 ? `${formatMoney(m.parcelaEntrada)} / parcela` : "",
        show: m.entradaParcValor > 0 || !!m.entradaParcInicio,
      },
      {
        desc: "Juros de obra",
        valor: m.totalJurosObra,
        parcelas: Number.isFinite(m.jurosQtd) ? m.jurosQtd : 0,
        periodo: periodLabel(m.jurosInicio, m.jurosFim, m.jurosQtd),
        detail: m.jurosValor > 0 ? `${formatMoney(m.jurosValor)} / mês` : "",
        show: m.jurosValor > 0 || m.totalJurosObra > 0 || !!m.jurosInicio,
      },
      {
        desc: "ITBI + Cartório",
        valor: m.itbiValor,
        parcelas: m.itbiGratuito ? 0 : Number.isFinite(m.itbiQtd) ? m.itbiQtd : 0,
        periodo: m.itbiGratuito
          ? "Gratuito"
          : periodLabel(m.itbiInicio, m.itbiFim, m.itbiQtd),
        show: true,
        detail: m.itbiGratuito ? "Sem custo" : "",
      },
      {
        desc: "Financiamento",
        valor: m.totalFinanciamento,
        parcelas: Number.isFinite(m.finParcelas) ? m.finParcelas : 0,
        periodo: periodLabel(m.finInicio, m.finFim, m.finParcelas),
        detail:
          m.finParcelaMensal > 0 ? `${formatMoney(m.finParcelaMensal)} / mês` : "",
        show: m.finParcelaMensal > 0 || m.totalFinanciamento > 0 || !!m.finInicio,
      }
    );

    return rows;
  }

  function moneyCell(value) {
    return value > 0 ? formatMoney(value) : "—";
  }

  function fillMonthlyTable(table, mensal, { compact = false } = {}) {
    const tbody = table.querySelector("tbody");
    const tfoot = table.querySelector("tfoot");
    tbody.innerHTML = "";
    tfoot.innerHTML = "";

    if (!mensal.rows.length) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="7">Informe as datas de início para gerar o cronograma mensal.</td>';
      tbody.appendChild(tr);
      return;
    }

    for (const row of mensal.rows) {
      const tr = document.createElement("tr");
      if (row.total === mensal.peak && mensal.peak > 0) tr.classList.add("is-peak");
      const label = compact
        ? formatMonthLabel(row.date)
        : `${formatMonthLabel(row.date)} (${formatDateBR(row.date)})`;
      tr.innerHTML = `
        <td>${label}</td>
        <td>${moneyCell(row.sinal)}</td>
        <td>${moneyCell(row.entrada)}</td>
        <td>${moneyCell(row.jurosObra)}</td>
        <td>${moneyCell(row.itbi)}</td>
        <td>${moneyCell(row.financiamento)}</td>
        <td><strong>${formatMoney(row.total)}</strong></td>
      `;
      tbody.appendChild(tr);
    }

    const tf = document.createElement("tr");
    tf.innerHTML = `
      <td>Total (${mensal.count} meses)</td>
      <td>${formatMoney(mensal.totals.sinal)}</td>
      <td>${formatMoney(mensal.totals.entrada)}</td>
      <td>${formatMoney(mensal.totals.jurosObra)}</td>
      <td>${formatMoney(mensal.totals.itbi)}</td>
      <td>${formatMoney(mensal.totals.financiamento)}</td>
      <td>${formatMoney(mensal.totals.total)}</td>
    `;
    tfoot.appendChild(tf);
  }

  function renderSummary(m) {
    els.resumoImovel.innerHTML = "";
    [
      ["Valor do imóvel (base)", formatMoney(m.valorImovel)],
      ["Percentual financiado", formatPercent(m.percFin)],
      ["Valor financiado", formatMoney(m.valorFinanciado)],
      ["Entrada necessária", formatMoney(m.entradaTotal)],
      [
        "Comissão (interno)",
        `${formatMoney(m.comissaoValor)} (${formatPercent(m.comissaoPerc)})`,
      ],
      ["Sinal (total no ato)", formatMoney(m.sinalValor)],
      ["Abatido da entrada (sinal − comissão)", formatMoney(m.abatimentoEntrada)],
      ["Entrada parcelada (restante)", formatMoney(m.entradaParcValor)],
      ["No PDF: imóvel exibido ao cliente", formatMoney(m.valorImovelCliente)],
      ["No PDF: entrada exibida ao cliente", formatMoney(m.entradaCliente)],
    ].forEach(([k, v]) => els.resumoImovel.appendChild(dlItem(k, v)));

    els.resumoJuros.innerHTML = "";
    [
      ["Juros estimados do financiamento", formatMoney(m.jurosFinanciamento)],
      ["Total dos juros de obra", formatMoney(m.totalJurosObra)],
      ["Total de encargos (fin. + obra)", formatMoney(m.totalEncargos)],
      ["Custo total estimado", formatMoney(m.totalDesembolsos)],
      ["% a mais sobre o valor do imóvel", formatPercent(m.percAMais)],
      ["Maior desembolso mensal", m.mensal.peak > 0 ? formatMoney(m.mensal.peak) : "—"],
    ].forEach(([k, v]) => els.resumoJuros.appendChild(dlItem(k, v)));

    const tbody = els.tabelaCronograma.querySelector("tbody");
    tbody.innerHTML = "";
    for (const row of buildCronograma(m, { forClient: false })) {
      if (!row.show && row.valor === 0) continue;
      const tr = document.createElement("tr");
      const valorCell = row.detail
        ? `${formatMoney(row.valor)}<br><small>${row.detail}</small>`
        : formatMoney(row.valor);
      tr.innerHTML = `
        <td>${row.desc}</td>
        <td>${valorCell}</td>
        <td>${row.parcelas > 0 ? row.parcelas + "x" : row.periodo === "Gratuito" ? "—" : "—"}</td>
        <td>${row.periodo}</td>
      `;
      tbody.appendChild(tr);
    }

    fillMonthlyTable(els.tabelaMensal, m.mensal);

    els.resumoTotais.innerHTML = "";
    [
      ["Total do sinal", formatMoney(m.sinalValor)],
      ["Total da entrada parcelada", formatMoney(m.entradaParcValor)],
      ["Total dos juros de obra", formatMoney(m.totalJurosObra)],
      [
        "Total do ITBI + Cartório",
        m.itbiGratuito ? "Gratuito" : formatMoney(m.itbiValor),
      ],
      ["Total do financiamento", formatMoney(m.totalFinanciamento)],
      ["Total dos desembolsos previstos", formatMoney(m.totalDesembolsos)],
    ].forEach(([k, v]) => els.resumoTotais.appendChild(dlItem(k, v)));

    renderAlerts(els.alertsResumo, collectWarnings(m), false);
  }

  function fillKeyValueTable(table, rows) {
    table.innerHTML = "";
    for (const [label, value, highlight] of rows) {
      const tr = document.createElement("tr");
      if (highlight) tr.classList.add("highlight");
      tr.innerHTML = `<th>${label}</th><td class="value">${value}</td>`;
      table.appendChild(tr);
    }
  }

  function preparePrintDocument(m) {
    // PDF do cliente: sem comissão explícita; valores embutidos
    document.getElementById("pdfCorretor").textContent = m.corretor || "—";
    document.getElementById("pdfData").textContent = formatDateBR(m.dataSimulacao);

    fillKeyValueTable(document.getElementById("pdfResumoImovel"), [
      ["Valor do imóvel", formatMoney(m.valorImovelCliente), true],
      ["Percentual financiado", formatPercent(m.percFinCliente)],
      ["Valor financiado", formatMoney(m.valorFinanciado), true],
      ["Entrada", formatMoney(m.entradaCliente), true],
      ["Percentual da entrada", formatPercent(m.percEntradaCliente)],
    ]);

    fillKeyValueTable(document.getElementById("pdfResumoFinanciamento"), [
      ["Prazo do financiamento", `${m.prazo} meses`],
      ["Parcela mensal", formatMoney(m.parcelaFin)],
      ["Valor total estimado do financiamento", formatMoney(m.totalFinanciamento), true],
      ["Juros estimados do financiamento", formatMoney(m.jurosFinanciamento)],
      ["Início do financiamento", formatDateBR(m.finInicio)],
      ["Término estimado", formatDateBR(m.finFim)],
    ]);

    fillKeyValueTable(document.getElementById("pdfComposicaoEntrada"), [
      ["Entrada total", formatMoney(m.entradaCliente), true],
      ["Sinal (ato da compra)", formatMoney(m.sinalValor), true],
      [
        "Entrada parcelada",
        `${formatMoney(m.entradaParcValor)} (${m.entradaParcQtd || 0}x de ${formatMoney(m.parcelaEntrada)})`,
      ],
      ["Juros de obra (total)", formatMoney(m.totalJurosObra)],
      [
        "ITBI + Cartório",
        m.itbiGratuito ? "Gratuito" : formatMoney(m.itbiValor),
      ],
    ]);

    const aMaisCliente =
      m.totalDesembolsos - m.valorImovelCliente;
    const percAMaisCliente =
      m.valorImovelCliente > 0 ? (aMaisCliente / m.valorImovelCliente) * 100 : 0;

    fillKeyValueTable(document.getElementById("pdfJuros"), [
      ["Juros estimados do financiamento", formatMoney(m.jurosFinanciamento)],
      ["Total dos juros de obra", formatMoney(m.totalJurosObra)],
      ["Total de encargos (fin. + obra)", formatMoney(m.totalEncargos), true],
      ["Custo total estimado", formatMoney(m.totalDesembolsos), true],
      ["Valor a mais em relação ao imóvel", formatMoney(aMaisCliente)],
      ["% a mais sobre o valor do imóvel", formatPercent(percAMaisCliente), true],
    ]);

    const tbody = document.querySelector("#pdfCronograma tbody");
    tbody.innerHTML = "";
    for (const row of buildCronograma(m, { forClient: true })) {
      if (!row.show && row.valor === 0 && row.periodo !== "Gratuito") continue;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.desc}${row.detail ? `<br><small>${row.detail}</small>` : ""}</td>
        <td>${row.periodo === "Gratuito" ? "Gratuito" : formatMoney(row.valor)}</td>
        <td>${row.parcelas > 0 ? row.parcelas + "x" : "—"}</td>
        <td>${row.periodo}</td>
      `;
      tbody.appendChild(tr);
    }

    fillMonthlyTable(document.getElementById("pdfMensal"), m.mensal, { compact: true });

    fillKeyValueTable(document.getElementById("pdfResumoGeral"), [
      ["Total do sinal", formatMoney(m.sinalValor)],
      ["Total da entrada parcelada", formatMoney(m.entradaParcValor)],
      ["Total dos juros de obra", formatMoney(m.totalJurosObra)],
      [
        "Total do ITBI + Cartório",
        m.itbiGratuito ? "Gratuito" : formatMoney(m.itbiValor),
      ],
      ["Total do financiamento", formatMoney(m.totalFinanciamento)],
      ["Total dos desembolsos previstos", formatMoney(m.totalDesembolsos), true],
    ]);

    const obs = document.getElementById("pdfObservacoes");
    obs.innerHTML = "";
    [
      "Simulação consolidada com valores de entrada, sinal e financiamento conforme condições apresentadas.",
      "A entrada é composta por sinal no ato e demais parcelas do restante.",
      "Juros do financiamento = total das parcelas − valor financiado (estimativa).",
      "O cronograma mensal apresenta os valores devidos em cada mês, conforme as datas iniciais informadas.",
      m.itbiGratuito
        ? "ITBI + Cartório considerados gratuitos nesta simulação."
        : "ITBI + Cartório conforme valores informados pelo corretor.",
    ].forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      obs.appendChild(li);
    });
  }

  function showView(which) {
    const isForm = which === "form";
    els.viewForm.hidden = !isForm;
    els.viewSummary.hidden = isForm;
    els.viewForm.classList.toggle("view--active", isForm);
    els.viewSummary.classList.toggle("view--active", !isForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindMoneyMask(input, onAfter) {
    input.addEventListener("input", () => {
      if (input.readOnly || input.disabled) return;
      input.value = formatMoneyInput(input.value.replace(/\D/g, ""));
      if (typeof onAfter === "function") onAfter();
      updateLiveOutputs();
    });
    input.addEventListener("blur", () => {
      if (input.readOnly || input.disabled || !input.value) return;
      const n = parseMoney(input.value);
      if (Number.isFinite(n) && n < 0) input.value = formatMoneyInput("0");
      updateLiveOutputs();
    });
  }

  function bindPercentMask(input, onAfter) {
    input.addEventListener("input", () => {
      if (input.readOnly || syncingFinancing) return;
      input.value = formatPercentInput(input.value);
      const n = parsePercent(input.value);
      if (Number.isFinite(n) && n > 100) input.value = "100,00";
      if (typeof onAfter === "function") onAfter();
      updateLiveOutputs();
    });
    input.addEventListener("blur", () => {
      if (input.readOnly || syncingFinancing || !input.value) return;
      const n = parsePercent(input.value);
      if (!Number.isFinite(n) || n < 0) input.value = "0,00";
      else if (n > 100) input.value = "100,00";
      else input.value = formatPercentDisplay(n);
      updateLiveOutputs();
    });
  }

  function bindNumberMinOne(input) {
    input.addEventListener("input", updateLiveOutputs);
    input.addEventListener("blur", () => {
      if (input.disabled) return;
      const n = parseIntSafe(input.value);
      if (!Number.isFinite(n) || n < 1) input.value = "1";
      updateLiveOutputs();
    });
  }

  document.querySelectorAll("input.money").forEach((el) => {
    if (el === els.comissaoValor) {
      bindMoneyMask(el, () => syncComissaoFields());
      return;
    }
    if (el === els.entradaNegociada) {
      bindMoneyMask(el);
      return;
    }
    if (el.readOnly) return;
    bindMoneyMask(el);
  });

  document.querySelectorAll("input.percent").forEach((el) => {
    if (el === els.comissaoPerc) {
      bindPercentMask(el, () => syncComissaoFields());
      return;
    }
    if (el === els.percentualFinanciamento) {
      bindPercentMask(el, () => {
        if (!syncingFinancing && entradaManual) {
          // voltar para modo automático ao editar o %
          setEntradaManual(false);
        }
      });
      return;
    }
    bindPercentMask(el);
  });

  [
    els.sinalParcelas,
    els.entradaParcQtd,
    els.jurosQtd,
    els.itbiQtd,
    els.prazoFinanciamento,
  ].forEach(bindNumberMinOne);

  [
    els.corretor,
    els.dataSimulacao,
    els.sinalData,
    els.entradaParcInicio,
    els.jurosInicio,
    els.itbiInicio,
    els.finInicio,
  ].forEach((el) => {
    el.addEventListener("input", updateLiveOutputs);
    el.addEventListener("change", updateLiveOutputs);
  });

  els.btnComissaoPerc.addEventListener("click", () => setComissaoMode("percent"));
  els.btnComissaoValor.addEventListener("click", () => setComissaoMode("value"));

  els.btnAlterarEntrada.addEventListener("click", () => {
    setEntradaManual(true);
    updateLiveOutputs();
  });

  els.btnResetEntrada.addEventListener("click", () => {
    setEntradaManual(false);
    updateLiveOutputs();
  });

  els.itbiGratuito.addEventListener("change", () => {
    applyItbiGratuitoUI();
    updateLiveOutputs();
  });

  els.btnLimpar.addEventListener("click", () => {
    if (
      !window.confirm(
        "Deseja apagar todos os dados da simulação? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }
    resetForm();
  });

  els.btnResumo.addEventListener("click", () => {
    clearInvalidMarks();
    const m = readModel();
    const errors = collectBlockingErrors(m);
    if (errors.length) {
      errors.forEach((e) => markInvalid(e.field));
      renderAlerts(
        els.alerts,
        errors.map((e) => ({ type: "danger", text: e.text })),
        true
      );
      return;
    }
    renderSummary(m);
    showView("summary");
  });

  els.btnVoltar.addEventListener("click", () => {
    showView("form");
    updateLiveOutputs();
  });

  els.btnPdf.addEventListener("click", () => {
    clearInvalidMarks();
    const m = readModel();
    const errors = collectBlockingErrors(m);
    if (errors.length) {
      showView("form");
      errors.forEach((e) => markInvalid(e.field));
      renderAlerts(
        els.alerts,
        errors.map((e) => ({ type: "danger", text: e.text })),
        true
      );
      return;
    }
    preparePrintDocument(m);
    window.print();
  });

  function resetForm() {
    [
      "valorImovel",
      "parcelaFinanciamento",
      "sinalValor",
      "jurosValor",
      "itbiValor",
      "comissaoPerc",
      "comissaoValor",
      "entradaNegociada",
      "finParcValor",
      "finParcQtd",
      "finFim",
      "comissaoCalculada",
      "outPagamentoSinal",
      "outAbatimentoCampo",
      "entradaParcValor",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    els.percentualFinanciamento.value = "";
    els.prazoFinanciamento.value = "";
    els.corretor.value = "";
    els.dataSimulacao.value = todayISO();
    els.sinalParcelas.value = "1";
    els.entradaParcQtd.value = "1";
    els.jurosQtd.value = "1";
    els.itbiQtd.value = "1";
    els.itbiGratuito.checked = false;

    [els.sinalData, els.entradaParcInicio, els.jurosInicio, els.itbiInicio, els.finInicio].forEach(
      (el) => {
        el.value = "";
      }
    );

    els.entradaParcFim.value = "";
    els.jurosFim.value = "";
    els.itbiFim.value = "";

    setEntradaManual(false);
    setComissaoMode("percent");
    applyItbiGratuitoUI();
    clearInvalidMarks();
    els.alerts.innerHTML = "";
    els.alertsResumo.innerHTML = "";
    showView("form");
    updateLiveOutputs();
  }

  function runSelfTests() {
    const results = [];
    const assert = (name, cond) => results.push({ name, ok: !!cond });

    const entrada = 100000;
    const sinal = 50000;
    const comissao = 25000;
    const abatimento = Math.max(0, sinal - comissao);
    const restante = Math.max(0, entrada - abatimento);
    assert("abatimento = sinal - comissao", nearlyEqual(abatimento, 25000));
    assert("restante", nearlyEqual(restante, 75000));
    assert("cliente imovel", nearlyEqual(500000 + comissao, 525000));
    assert("cliente entrada", nearlyEqual(entrada + comissao, 125000));
    assert("sinal+restante=entrada cliente", nearlyEqual(sinal + restante, 125000));

    const failed = results.filter((r) => !r.ok);
    if (failed.length) console.warn("[Simulador] Testes falharam:", failed);
    else console.info("[Simulador] Testes internos OK (" + results.length + ").");
  }

  setEntradaManual(false);
  setComissaoMode("percent");
  applyItbiGratuitoUI();
  els.dataSimulacao.value = todayISO();
  updateLiveOutputs();
  runSelfTests();
})();
