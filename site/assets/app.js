/* ===== Ilka — shared behaviour ===== */
(function () {
  "use strict";

  var STEPS = 6; // начало, 3 задачи, оценки, финал

  /* ---- progress dots ---- */
  function progress() {
    var el = document.querySelector("[data-progress]");
    if (!el) return;
    var active = parseInt(el.getAttribute("data-progress"), 10) || 0;
    var html = "";
    for (var i = 0; i < STEPS; i++) {
      if (i) html += '<span class="bar"></span>';
      var cls = i < active ? "dot done" : i === active ? "dot now" : "dot";
      html += '<span class="' + cls + '"></span>';
    }
    el.innerHTML = html;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", "Стъпка " + (active + 1) + " от " + STEPS);
  }

  /* ---- floating math symbols (decorative, JS-generated) ---- */
  var GLYPHS = ["∑","∫","π","√","∞","Δ","∂","θ","∇","λ","∮","∏","≈","φ"];
  var TEXTS = ["e^iπ+1=0","a²+b²=c²","∇×B","Σ1/n²","dy/dx","∂u/∂t","∫dx","lim x→0","∀x∃y","√2"];
  var SPOTS = [
    [9,16],[84,20],[18,74],[73,78],[46,9],[6,46],[90,54],[30,30],[62,38],[38,88],
    [27,42],[69,64],[13,33],[58,14],[78,44],[34,66],[48,52],[21,88],[64,86],[4,70],
    [93,34],[42,24],[55,74],[9,24]
  ];
  function symbols() {
    var host = document.querySelector("[data-symbols]");
    if (!host) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < SPOTS.length; i++) {
      var isText = i % 3 === 2;
      var s = document.createElement("span");
      s.textContent = isText ? TEXTS[i % TEXTS.length] : GLYPHS[i % GLYPHS.length];
      if (isText) s.className = "txt";
      var size = isText ? 30 + (i % 4) * 3 : 45 + (i % 6) * 12;
      s.style.cssText =
        "left:" + SPOTS[i][0] + "%;top:" + SPOTS[i][1] + "%;" +
        "font-size:" + size + "px;opacity:0.0" + (4 + (i % 4)) + ";" +
        "animation:drift " + (12 + (i % 10)) + "s ease-in-out -" + (i % 9) + "s infinite";
      frag.appendChild(s);
    }
    host.appendChild(frag);
    host.setAttribute("aria-hidden", "true");
  }

  /* ---- tiny localStorage wrapper (private mode safe) ---- */
  var store = {
    get: function (k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  window.ilka = { store: store };

  function init() { progress(); symbols(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
