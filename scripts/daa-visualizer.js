/* =========================================================
   SMARTROUTE — DAA ALGORITHM VISUALIZER & ANIMATION ENGINE
   ========================================================= */

// Graph Nodes & Spatial Coordinates for Visualization Canvas
const GRAPH_NODES = {
  A: { id: 'A', name: 'Ambulance Base', x: 80, y: 210, type: 'ambulance' },
  P: { id: 'P', name: 'Patient GPS Location', x: 280, y: 210, type: 'patient' },
  h1: { id: 'h1', name: 'Central General Hospital', x: 580, y: 90, type: 'hospital', beds: 14, dist: '3.8 km' },
  h2: { id: 'h2', name: 'City Medical Center', x: 620, y: 190, type: 'hospital', beds: 8, dist: '5.4 km' },
  h3: { id: 'h3', name: 'Apollo Multi-Specialty', x: 600, y: 290, type: 'hospital', beds: 5, dist: '6.2 km' },
  h4: { id: 'h4', name: 'St. Jude Emergency Clinic', x: 540, y: 370, type: 'hospital', beds: 2, dist: '7.1 km' },
  // Intermediate road junctions for realistic map graph
  J1: { id: 'J1', name: 'North Junction', x: 420, y: 120, type: 'junction' },
  J2: { id: 'J2', name: 'Central Ring', x: 440, y: 240, type: 'junction' },
  J3: { id: 'J3', name: 'South Flyover', x: 410, y: 330, type: 'junction' }
};

// Graph Edges with Distance (km) and Traffic Multipliers
const GRAPH_EDGES = [
  { from: 'A', to: 'P', dist: 3.2, traffic: 1.0 },

  // From Patient to Junctions
  { from: 'P', to: 'J1', dist: 2.1, traffic: 1.1 },
  { from: 'P', to: 'J2', dist: 1.8, traffic: 1.0 },
  { from: 'P', to: 'J3', dist: 2.5, traffic: 1.3 },

  // From Junctions to Hospitals
  { from: 'J1', to: 'h1', dist: 1.7, traffic: 1.0 },
  { from: 'J1', to: 'h2', dist: 2.4, traffic: 1.2 },
  { from: 'J2', to: 'h2', dist: 1.9, traffic: 1.0 },
  { from: 'J2', to: 'h3', dist: 2.8, traffic: 1.1 },
  { from: 'J3', to: 'h3', dist: 2.1, traffic: 1.0 },
  { from: 'J3', to: 'h4', dist: 2.9, traffic: 1.4 },

  // Inter-hospital grid links
  { from: 'h1', to: 'h2', dist: 1.5, traffic: 1.0 },
  { from: 'h2', to: 'h3', dist: 1.8, traffic: 1.0 },
  { from: 'h3', to: 'h4', dist: 2.0, traffic: 1.1 }
];

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('routingCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let selectedHospitalId = 'h1';
  let isRunning = false;
  let activeAnimationStep = 0;
  let animTimer = null;
  let highlightedEdges = [];
  let visitedNodes = new Set();

  const algoStatus = document.getElementById('algoStatus');
  const algoDistance = document.getElementById('algoDistance');
  const algoETA = document.getElementById('algoETA');
  const stepLog = document.getElementById('stepLog');
  const btnRunAlgo = document.getElementById('btnRunAlgo');
  const btnResetAlgo = document.getElementById('btnResetAlgo');
  const hospRadioGroup = document.getElementById('hospRadioGroup');

  // Handle Hospital Choice Rerouting
  if (hospRadioGroup) {
    hospRadioGroup.addEventListener('change', (e) => {
      selectedHospitalId = e.target.value;

      document.querySelectorAll('.hosp-radio-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-hosp') === selectedHospitalId) {
          item.classList.add('active');
        }
      });

      // Trigger automatic rerouting
      runDijkstraAnimation();
    });
  }

  if (btnRunAlgo) btnRunAlgo.addEventListener('click', runDijkstraAnimation);
  if (btnResetAlgo) btnResetAlgo.addEventListener('click', resetGraph);

  // Main Draw Function
  function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Edges
    GRAPH_EDGES.forEach(edge => {
      const u = GRAPH_NODES[edge.from];
      const v = GRAPH_NODES[edge.to];
      if (!u || !v) return;

      const isHighlighted = highlightedEdges.some(
        e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
      );

      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.strokeStyle = isHighlighted ? '#EF4444' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = isHighlighted ? 4 : 2;
      if (isHighlighted) {
        ctx.setLineDash([8, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw edge distance label
      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;
      ctx.fillStyle = isHighlighted ? '#EF4444' : 'rgba(155, 163, 192, 0.7)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${edge.dist}km`, midX, midY - 6);
    });

    // 2. Draw Nodes
    Object.keys(GRAPH_NODES).forEach(key => {
      const node = GRAPH_NODES[key];
      const isTarget = node.id === selectedHospitalId;
      const isVisited = visitedNodes.has(node.id);

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.type === 'junction' ? 8 : 16, 0, Math.PI * 2);

      if (node.type === 'ambulance') {
        ctx.fillStyle = '#0EA5E9';
      } else if (node.type === 'patient') {
        ctx.fillStyle = '#EF4444';
      } else if (isTarget) {
        ctx.fillStyle = '#10B981';
      } else if (node.type === 'hospital') {
        ctx.fillStyle = isVisited ? 'rgba(124,58,237,0.8)' : '#26334D';
      } else {
        ctx.fillStyle = isVisited ? '#7C3AED' : '#1A2235';
      }
      ctx.fill();

      ctx.strokeStyle = isTarget ? '#10B981' : (isVisited ? '#7C3AED' : 'rgba(255,255,255,0.3)');
      ctx.lineWidth = isTarget ? 3 : 2;
      ctx.stroke();

      // Node Icons / Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';

      if (node.type === 'ambulance') {
        ctx.fillText('🚑 A', node.x - 14, node.y + 4);
      } else if (node.type === 'patient') {
        ctx.fillText('📍 P', node.x - 12, node.y + 4);
      } else if (node.type === 'hospital') {
        ctx.fillText(node.id.toUpperCase(), node.x - 8, node.y + 4);
      } else {
        ctx.fillText(node.id, node.x - 6, node.y + 4);
      }

      // Node Title Label below
      ctx.fillStyle = isTarget ? '#10B981' : '#9BA3C0';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(node.name, node.x - 30, node.y + 28);
    });
  }

  // Dijkstra Algorithm Engine & Path Solver
  function solveDijkstra(targetHospId) {
    const adj = {};
    Object.keys(GRAPH_NODES).forEach(k => adj[k] = []);

    GRAPH_EDGES.forEach(e => {
      // Cost = distance * traffic
      const cost = e.dist * e.traffic;
      adj[e.from].push({ node: e.to, cost, dist: e.dist });
      adj[e.to].push({ node: e.from, cost, dist: e.dist });
    });

    const dist = {};
    const prev = {};
    const pq = [];

    Object.keys(GRAPH_NODES).forEach(k => dist[k] = Infinity);
    dist['A'] = 0;
    pq.push({ node: 'A', cost: 0 });

    const stepsLog = [];
    stepsLog.push({
      step: 0,
      line: 2,
      msg: `Initialize Min-Heap Priority Queue Q = {(A, 0)}, set dist[A] = 0, all other nodes = ∞.`
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.cost - b.cost);
      const curr = pq.shift();
      const u = curr.node;

      stepsLog.push({
        step: stepsLog.length,
        line: 5,
        msg: `Extract minimum element u = '${GRAPH_NODES[u].name}' (Cost: ${dist[u].toFixed(2)} km).`,
        activeNode: u
      });

      if (u === targetHospId) {
        stepsLog.push({
          step: stepsLog.length,
          line: 6,
          msg: `Target '${GRAPH_NODES[targetHospId].name}' reached! Shortest path search finalized.`,
          activeNode: u
        });
        break;
      }

      adj[u].forEach(neighbor => {
        const alt = dist[u] + neighbor.cost;
        if (alt < dist[neighbor.node]) {
          dist[neighbor.node] = alt;
          prev[neighbor.node] = u;
          pq.push({ node: neighbor.node, cost: alt });

          stepsLog.push({
            step: stepsLog.length,
            line: 10,
            msg: `Relax edge (${u} ➔ ${neighbor.node}): Updated dist[${neighbor.node}] = ${alt.toFixed(2)} km.`,
            activeNode: neighbor.node,
            edge: { from: u, to: neighbor.node }
          });
        }
      });
    }

    // Reconstruct path
    const path = [];
    let curr = targetHospId;
    while (curr) {
      path.unshift(curr);
      curr = prev[curr];
    }

    return { path, dist: dist[targetHospId], stepsLog };
  }

  // Run Animated Visualizer
  function runDijkstraAnimation() {
    if (isRunning) clearInterval(animTimer);
    isRunning = true;

    resetGraph();
    algoStatus.textContent = '⚡ Running Dijkstra Algorithm...';
    algoStatus.style.color = '#7C3AED';

    const solution = solveDijkstra(selectedHospitalId);
    let stepIdx = 0;

    animTimer = setInterval(() => {
      if (stepIdx >= solution.stepsLog.length) {
        clearInterval(animTimer);
        isRunning = false;

        // Finalize highlight path
        highlightedEdges = [];
        for (let i = 0; i < solution.path.length - 1; i++) {
          highlightedEdges.push({ from: solution.path[i], to: solution.path[i + 1] });
          visitedNodes.add(solution.path[i]);
        }
        visitedNodes.add(solution.path[solution.path.length - 1]);

        drawGraph();
        algoStatus.textContent = `✅ Optimal Route Found to ${GRAPH_NODES[selectedHospitalId].name}`;
        algoStatus.style.color = '#10B981';
        algoDistance.textContent = `${solution.dist.toFixed(2)} km`;
        algoETA.textContent = `${Math.ceil(solution.dist * 1.8)} mins`;
        highlightCodeLine(13);
        return;
      }

      const stepData = solution.stepsLog[stepIdx];

      if (stepData.activeNode) visitedNodes.add(stepData.activeNode);
      if (stepData.edge) highlightedEdges.push(stepData.edge);

      drawGraph();
      addLogEntry(stepData.step, stepData.msg);
      highlightCodeLine(stepData.line);

      stepIdx++;
    }, 600);
  }

  function resetGraph() {
    if (animTimer) clearInterval(animTimer);
    isRunning = false;
    highlightedEdges = [];
    visitedNodes.clear();
    drawGraph();

    if (algoStatus) {
      algoStatus.textContent = 'Ready for execution';
      algoStatus.style.color = '#0EA5E9';
    }
    if (algoDistance) algoDistance.textContent = '0.0 km';
    if (algoETA) algoETA.textContent = '-- min';

    if (stepLog) stepLog.innerHTML = '';
    highlightCodeLine(1);
  }

  function addLogEntry(stepNum, text) {
    if (!stepLog) return;
    const div = document.createElement('div');
    div.className = 'step-log-item active';
    div.innerHTML = `
      <span class="step-num">Step ${stepNum}</span>
      <div class="step-text">${text}</div>
    `;
    stepLog.appendChild(div);
    stepLog.scrollTop = stepLog.scrollHeight;
  }

  function highlightCodeLine(lineNum) {
    document.querySelectorAll('.code-box span').forEach(el => el.classList.remove('active-line'));
    const activeLine = document.getElementById(`line${lineNum}`);
    if (activeLine) activeLine.classList.add('active-line');
  }

  // Initial draw
  drawGraph();
  // Auto-run first demo visualization
  setTimeout(runDijkstraAnimation, 500);
});
