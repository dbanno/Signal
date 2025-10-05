(() => {
  const $ = (selector) => document.querySelector(selector);

  const elements = {
    bandwidth: $("#bandwidth"),
    dataPackets: $("#dataPackets"),
    relayStations: $("#relayStations"),
    range: $("#range"),
    efficiency: $("#efficiency"),
    overlapStatus: $("#overlapStatus"),
    contacts: $("#contacts"),
    pingProbe: $("#pingProbe"),
    expandRange: $("#expandRange"),
    buildRelay: $("#buildRelay"),
    optimize: $("#optimize"),
    overlapSignals: $("#overlapSignals"),
    ascend: $("#ascend"),
  };

  const civilizations = [
    {
      id: "echo-shard",
      name: "Echo Shard Commune",
      description: "Fragments of a vanished fleet triangulate our whispers.",
      rangeRequired: 2,
      frequency: {
        name: "Dust Lattice",
        effect: "Bandwidth production increased by 20%.",
        modifiers: { bandwidth: 1.2 },
      },
    },
    {
      id: "aurora-loom",
      name: "Aurora Loom",
      description: "A culture weaving photons into mnemonic tapestries.",
      rangeRequired: 5,
      frequency: {
        name: "Prism Canticle",
        effect: "Data packets accrue 30% faster.",
        modifiers: { data: 1.3 },
      },
    },
    {
      id: "umbra-archives",
      name: "Umbra Archives",
      description: "An archive of eclipsed worlds lends ghost relays to the mesh.",
      rangeRequired: 8,
      frequency: {
        name: "Graviton Thrum",
        effect: "Bandwidth and data production both gain 15%.",
        modifiers: { bandwidth: 1.15, data: 1.15 },
      },
    },
    {
      id: "chorus-of-rifts",
      name: "Chorus of Rifts",
      description: "Their overlapping choirs stabilize interference into clarity.",
      rangeRequired: 12,
      frequency: {
        name: "Phase Harmonics",
        effect: "Signal overlaps last longer and are 25% stronger.",
        modifiers: { overlapDuration: 10, overlapStrength: 1.25 },
      },
    },
    {
      id: "last-light",
      name: "Last Light Recursion",
      description: "A civilization that has rebooted reality countless times.",
      rangeRequired: 16,
      frequency: {
        name: "Chronal Afterglow",
        effect: "Ascension retains 15% additional efficiency.",
        modifiers: { ascendBonus: 0.15 },
      },
    },
  ];

  const state = {
    bandwidth: 0,
    dataPackets: 0,
    relayStations: 0,
    rangeLevel: 0,
    optimizations: 0,
    contacts: [],
    frequencies: [],
    signalEfficiency: 1,
    ascensions: 0,
    overlap: {
      active: false,
      timer: 0,
      cooldown: 0,
    },
  };

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  });

  function format(value) {
    if (value < 1000) {
      return value.toFixed(1);
    }
    return formatter.format(value);
  }

  function getFrequencyModifiers() {
    return state.frequencies.reduce(
      (mods, frequency) => {
        const { modifiers = {} } = frequency;
        if (modifiers.bandwidth) {
          mods.bandwidth *= modifiers.bandwidth;
        }
        if (modifiers.data) {
          mods.data *= modifiers.data;
        }
        if (modifiers.overlapDuration) {
          mods.overlapDuration += modifiers.overlapDuration;
        }
        if (modifiers.overlapStrength) {
          mods.overlapStrength *= modifiers.overlapStrength;
        }
        if (modifiers.ascendBonus) {
          mods.ascendBonus += modifiers.ascendBonus;
        }
        if (modifiers.manual) {
          mods.manual *= modifiers.manual;
        }
        return mods;
      },
      {
        bandwidth: 1,
        data: 1,
        overlapDuration: 0,
        overlapStrength: 1,
        ascendBonus: 0,
        manual: 1,
      }
    );
  }

  function render() {
    const mods = getFrequencyModifiers();
    elements.bandwidth.textContent = format(state.bandwidth);
    elements.dataPackets.textContent = format(state.dataPackets);
    elements.relayStations.textContent = state.relayStations.toString();
    elements.range.textContent = `${state.rangeLevel}`;
    elements.efficiency.textContent = `${(state.signalEfficiency * 100).toFixed(1)}%`;

    const overlapReady = state.frequencies.length >= 2;
    elements.overlapSignals.disabled = !overlapReady || state.overlap.cooldown > 0;

    if (!overlapReady) {
      elements.overlapStatus.textContent = "Awaiting harmonic partners…";
    } else if (state.overlap.active) {
      elements.overlapStatus.textContent = `Resonance active (${state.overlap.timer.toFixed(1)}s)`;
    } else if (state.overlap.cooldown > 0) {
      elements.overlapStatus.textContent = `Recalibrating (${state.overlap.cooldown.toFixed(1)}s)`;
    } else {
      elements.overlapStatus.textContent = "Frequencies aligned. Ready to overlap.";
    }

    elements.ascend.disabled = !canAscend();

    renderContacts();
    renderButtons(mods);
  }

  function renderContacts() {
    elements.contacts.innerHTML = "";
    state.contacts.forEach((contact) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${contact.name}</strong><br />${contact.description}<br /><em>${contact.frequency.name}:</em> ${contact.frequency.effect}`;
      elements.contacts.appendChild(li);
    });
  }

  function renderButtons(mods) {
    const rangeCost = getRangeCost();
    const relayCost = getRelayCost();
    const optimizeCost = getOptimizeCost();

    elements.expandRange.disabled = state.bandwidth < rangeCost;
    elements.expandRange.textContent = `Expand Range (${format(rangeCost)} bandwidth)`;

    elements.buildRelay.disabled = state.dataPackets < relayCost;
    elements.buildRelay.textContent = `Deploy Relay (${format(relayCost)} data)`;

    elements.optimize.disabled = state.dataPackets < optimizeCost;
    elements.optimize.textContent = `Optimize Routing (${format(optimizeCost)} data)`;

    const manualGain = (4 + state.rangeLevel) * state.signalEfficiency * mods.bandwidth * mods.manual;
    elements.pingProbe.textContent = `Ping a Probe (+${manualGain.toFixed(1)} bandwidth)`;
  }

  function getRangeCost() {
    return Math.round(120 * Math.pow(1.55, state.rangeLevel));
  }

  function getRelayCost() {
    return Math.round(50 * Math.pow(1.45, state.relayStations));
  }

  function getOptimizeCost() {
    return Math.round(80 * Math.pow(1.7, state.optimizations));
  }

  function pingProbe() {
    const mods = getFrequencyModifiers();
    const manualGain = (4 + state.rangeLevel) * state.signalEfficiency * mods.bandwidth * mods.manual;
    state.bandwidth += manualGain;
    state.dataPackets += manualGain * 0.1 * mods.data;
  }

  function expandRange() {
    const cost = getRangeCost();
    if (state.bandwidth < cost) return;
    state.bandwidth -= cost;
    state.rangeLevel += 1;
    checkForNewContacts();
  }

  function buildRelay() {
    const cost = getRelayCost();
    if (state.dataPackets < cost) return;
    state.dataPackets -= cost;
    state.relayStations += 1;
  }

  function optimizeRouting() {
    const cost = getOptimizeCost();
    if (state.dataPackets < cost) return;
    state.dataPackets -= cost;
    state.optimizations += 1;
  }

  function getProduction() {
    const mods = getFrequencyModifiers();
    const base = (1 + state.relayStations) * (1 + state.optimizations * 0.3) * (1 + state.rangeLevel * 0.1);
    const overlapBoost = state.overlap.active ? 2.5 * mods.overlapStrength : 1;
    const bandwidthPerSecond = base * state.signalEfficiency * mods.bandwidth * overlapBoost;
    const dataPerSecond = bandwidthPerSecond * (0.12 + state.optimizations * 0.03 + state.contacts.length * 0.05) * mods.data;
    return { bandwidthPerSecond, dataPerSecond };
  }

  function tick(delta) {
    const { bandwidthPerSecond, dataPerSecond } = getProduction();
    state.bandwidth += bandwidthPerSecond * delta;
    state.dataPackets += dataPerSecond * delta;

    if (state.overlap.active) {
      state.overlap.timer -= delta;
      if (state.overlap.timer <= 0) {
        state.overlap.active = false;
        state.overlap.timer = 0;
        state.overlap.cooldown = 45;
      }
    } else if (state.overlap.cooldown > 0) {
      state.overlap.cooldown = Math.max(0, state.overlap.cooldown - delta);
    }

    checkForNewContacts();
    updateAscendState();
  }

  function checkForNewContacts() {
    civilizations.forEach((civ) => {
      if (state.rangeLevel >= civ.rangeRequired && !state.contacts.find((c) => c.id === civ.id)) {
        state.contacts.push(civ);
        state.frequencies.push(civ.frequency);
      }
    });
  }

  function overlapSignals() {
    if (state.overlap.active || state.overlap.cooldown > 0 || state.frequencies.length < 2) {
      return;
    }
    const mods = getFrequencyModifiers();
    const duration = 18 + mods.overlapDuration;
    state.overlap.active = true;
    state.overlap.timer = duration;
  }

  function canAscend() {
    return state.rangeLevel >= 12 && state.contacts.length >= 3;
  }

  function updateAscendState() {
    if (!canAscend()) {
      elements.ascend.disabled = true;
    }
  }

  function ascend() {
    if (!canAscend()) return;
    const mods = getFrequencyModifiers();
    const retained = 1 + state.rangeLevel * 0.05 + state.contacts.length * 0.1 + mods.ascendBonus;
    state.signalEfficiency *= retained;
    state.ascensions += 1;

    state.bandwidth = 0;
    state.dataPackets = 0;
    state.relayStations = 0;
    state.rangeLevel = 0;
    state.optimizations = 0;
    state.contacts = [];
    state.frequencies = [];
    state.overlap = { active: false, timer: 0, cooldown: 0 };
  }

  elements.pingProbe.addEventListener("click", () => {
    pingProbe();
    render();
  });
  elements.expandRange.addEventListener("click", () => {
    expandRange();
    render();
  });
  elements.buildRelay.addEventListener("click", () => {
    buildRelay();
    render();
  });
  elements.optimize.addEventListener("click", () => {
    optimizeRouting();
    render();
  });
  elements.overlapSignals.addEventListener("click", () => {
    overlapSignals();
    render();
  });
  elements.ascend.addEventListener("click", () => {
    ascend();
    render();
  });

  let last = performance.now();
  function loop(now) {
    const delta = Math.min(0.2, (now - last) / 1000);
    last = now;
    tick(delta);
    render();
    requestAnimationFrame(loop);
  }

  render();
  requestAnimationFrame(loop);
})();
