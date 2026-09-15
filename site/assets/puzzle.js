/* ===== Klotski (Хуаzhong Dao) — responsive, pointer + touch ===== */
(function () {
  "use strict";
  var store = window.ilka.store;
  var COLS = 4, ROWS = 5, GAP = 5, MIN_CELL = 62;

  var INITIAL = [
    { id: "cao", x: 1, y: 0, w: 2, h: 2, target: true },
    { id: "a", x: 0, y: 0, w: 1, h: 2 },
    { id: "b", x: 3, y: 0, w: 1, h: 2 },
    { id: "d", x: 0, y: 2, w: 1, h: 2 },
    { id: "f", x: 3, y: 2, w: 1, h: 2 },
    { id: "e", x: 1, y: 2, w: 2, h: 1 },
    { id: "g", x: 1, y: 3, w: 1, h: 1 },
    { id: "h", x: 2, y: 3, w: 1, h: 1 },
    { id: "i", x: 0, y: 4, w: 1, h: 1 },
    { id: "j", x: 3, y: 4, w: 1, h: 1 }
  ];

  var board = document.getElementById("board");
  var play = document.getElementById("play");
  var wonEl = document.getElementById("won");
  var movesEl = document.getElementById("moves");
  var finalMovesEl = document.getElementById("finalMoves");
  var arrow = document.getElementById("arrow");
  var wonSub = document.getElementById("wonSub");
  var skip = document.getElementById("skip");

  var cell = 100, pieces = [], moves = 0, won = false, leaving = false;
  var els = {}, drag = null;

  /* ---- sizing ---- */
  function computeCell() {
    var vw = window.innerWidth;
    // visualViewport excludes the mobile browser's own bars; innerHeight does not,
    // which is what pushed the moves/reset controls behind Safari's bottom bar
    var vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    var narrow = vw < 640;
    var gut = narrow ? 48 : 72;       // side breathing room
    var chrome = narrow ? 340 : 430;  // progress pill, title, arrow, controls
    var byW = Math.min(vw - gut, 520) / COLS;
    var byH = (vh - chrome) / ROWS;
    return Math.max(MIN_CELL, Math.min(132, Math.floor(Math.min(byW, byH))));
  }

  function layoutBoard() {
    cell = computeCell();
    applyCell();
    fitToViewport();
  }

  // The reserve above is only an estimate — the real title/controls heights vary
  // with wrapping and font loading. So lay it out, measure, and shrink until the
  // controls genuinely sit on screen.
  function fitToViewport() {
    var controls = document.querySelector(".controls");
    if (!controls) return;
    for (var i = 0; i < 10; i++) {
      var vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      var over = controls.getBoundingClientRect().bottom - vh + 10;
      if (over <= 0) break;
      var next = cell - Math.max(1, Math.ceil(over / ROWS));
      // below this the puzzle stops being playable; let the page scroll instead
      if (next < MIN_CELL) { next = MIN_CELL; }
      if (next === cell) break;
      cell = next;
      applyCell();
    }
  }

  function applyCell() {
    board.style.width = COLS * cell + "px";
    board.style.height = ROWS * cell + "px";
    board.style.backgroundImage =
      "repeating-linear-gradient(0deg,rgba(38,101,140,.10) 0,rgba(38,101,140,.10) 1.5px,transparent 1.5px,transparent " + cell + "px)," +
      "repeating-linear-gradient(90deg,rgba(38,101,140,.10) 0,rgba(38,101,140,.10) 1.5px,transparent 1.5px,transparent " + cell + "px)";
    arrow.style.fontSize = Math.round(cell * 0.3) + "px";

    // frame edges with a 2-cell gap at the bottom centre
    board.querySelectorAll(".edge,.exitglow").forEach(function (n) { n.remove(); });
    add("edge", "left:0;top:0;right:0;height:3px");
    add("edge", "left:0;top:0;bottom:0;width:3px");
    add("edge", "right:0;top:0;bottom:0;width:3px");
    add("edge", "left:0;bottom:0;height:3px;width:" + cell + "px");
    add("edge", "right:0;bottom:0;height:3px;width:" + cell + "px");
    add("exitglow", "left:" + cell + "px;width:" + cell * 2 + "px");

    for (var id in els) sizeEl(els[id]);
    render();
  }

  function add(cls, css) {
    var d = document.createElement("div");
    d.className = cls;
    d.style.cssText = css;
    board.appendChild(d);
  }

  function sizeEl(el) {
    var p = el._p;
    el.style.width = p.w * cell - GAP * 2 + "px";
    el.style.height = p.h * cell - GAP * 2 + "px";
    if (p.target) el.style.fontSize = Math.round(cell * 0.32) + "px";
  }

  /* ---- build ---- */
  function build() {
    Object.keys(els).forEach(function (k) { els[k].remove(); });
    els = {};
    pieces = INITIAL.map(function (p) { return Object.assign({}, p); });
    pieces.forEach(function (p) {
      var el = document.createElement("div");
      el.className = "piece" + (p.target ? " target" : "");
      el._p = p;
      if (p.target) el.textContent = "↓";
      el.addEventListener("pointerdown", function (ev) { startDrag(ev, p, el); });
      board.appendChild(el);
      els[p.id] = el;
      sizeEl(el);
    });
  }

  function render() {
    pieces.forEach(function (p) {
      var el = els[p.id];
      var dx = 0, dy = 0;
      if (drag && drag.id === p.id && drag.axis) {
        if (drag.axis === "h") dx = drag.offset; else dy = drag.offset;
      }
      var x = p.x * cell + GAP + dx;
      var y = p.y * cell + GAP + dy;
      if (leaving && p.target) {
        el.style.transition = "transform .7s cubic-bezier(.4,0,.2,1),opacity .7s ease";
        el.style.transform = "translate(" + x + "px," + (y + cell * 2.6) + "px)";
        el.style.opacity = "0";
        return;
      }
      el.style.transition = (drag && drag.id === p.id) ? "none" : "transform .19s cubic-bezier(.2,.8,.2,1)";
      el.style.transform = "translate(" + x + "px," + y + "px)";
    });
    movesEl.textContent = String(moves);
  }

  /* ---- collision ---- */
  function occupiedExcept(id) {
    var s = {};
    pieces.forEach(function (p) {
      if (p.id === id) return;
      for (var i = 0; i < p.w; i++) for (var j = 0; j < p.h; j++) s[(p.x + i) + "," + (p.y + j)] = 1;
    });
    return s;
  }
  function fits(p, nx, ny, s) {
    if (nx < 0 || ny < 0 || nx + p.w > COLS || ny + p.h > ROWS) return false;
    for (var i = 0; i < p.w; i++) for (var j = 0; j < p.h; j++) if (s[(nx + i) + "," + (ny + j)]) return false;
    return true;
  }
  function range(p, axis) {
    var s = occupiedExcept(p.id), lo, hi;
    if (axis === "h") {
      lo = hi = p.x;
      while (fits(p, lo - 1, p.y, s)) lo--;
      while (fits(p, hi + 1, p.y, s)) hi++;
      return { min: (lo - p.x) * cell, max: (hi - p.x) * cell };
    }
    lo = hi = p.y;
    while (fits(p, p.x, lo - 1, s)) lo--;
    while (fits(p, p.x, hi + 1, s)) hi++;
    return { min: (lo - p.y) * cell, max: (hi - p.y) * cell };
  }

  /* ---- drag ---- */
  function startDrag(ev, p, el) {
    if (won || leaving) return;
    ev.preventDefault();
    drag = { id: p.id, p: p, el: el, sx: ev.clientX, sy: ev.clientY, axis: null, offset: 0, r: null };
    el.classList.add("dragging");
    el.setPointerCapture && el.setPointerCapture(ev.pointerId);
  }

  function onMove(ev) {
    if (!drag) return;
    var dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
    if (!drag.axis) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      drag.axis = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
      drag.r = range(drag.p, drag.axis);
    }
    ev.preventDefault();
    var along = drag.axis === "h" ? dx : dy;
    drag.offset = Math.max(drag.r.min, Math.min(drag.r.max, along));
    render();
  }

  function onUp() {
    if (!drag) return;
    var d = drag;
    d.el.classList.remove("dragging");
    if (!d.axis) { drag = null; render(); return; }
    var cells = Math.round(d.offset / cell);
    drag = null;
    if (cells !== 0) {
      if (d.axis === "h") d.p.x += cells; else d.p.y += cells;
      moves++;
    }
    render();
    checkWin();
  }

  function checkWin() {
    var t = pieces.find(function (p) { return p.target; });
    if (!t || t.x !== 1 || t.y !== ROWS - 2) return;
    finishWin(false);
  }

  // shared by a real solve and by the secret skip
  function finishWin(skipped) {
    if (won || leaving) return;
    leaving = true;
    render();
    setTimeout(function () {
      store.set("ilka_stage3", "solved");
      store.set("ilka_grade3", "5.90");
      won = true; leaving = false;
      if (skipped) {
        // "изведе го за 0 хода" would read like a bug
        wonSub.textContent = "Знаех си, че ще намериш пътя — както винаги.";
      } else {
        finalMovesEl.textContent = String(moves);
      }
      play.hidden = true;
      wonEl.hidden = false;
    }, 700);
  }

  function reset() {
    drag = null; moves = 0; won = false; leaving = false;
    wonSub.innerHTML = 'Изведе го за <span id="finalMoves">0</span> хода. ' +
      'Знаех си, че ще намериш пътя — както винаги.';
    finalMovesEl = document.getElementById("finalMoves");
    play.hidden = false; wonEl.hidden = true;
    build(); layoutBoard();
  }

  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  if (skip) skip.addEventListener("click", function () { finishWin(true); });
  document.getElementById("reset").addEventListener("click", reset);
  document.getElementById("retry").addEventListener("click", reset);

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(layoutBoard, 120);
  });
  window.addEventListener("orientationchange", function () { setTimeout(layoutBoard, 250); });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(layoutBoard, 120);
    });
  }

  build();
  layoutBoard();
  // the handwritten title changes height once the webfont lands, which moves
  // the controls — re-fit when it does
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layoutBoard).catch(function () {});
  }
})();
