/* ===== shared logic for the answer-a-question stages ===== */
(function () {
  "use strict";
  var cfg = window.ILKA_QUIZ;
  if (!cfg) return;

  var store = window.ilka.store;
  var form = document.getElementById("form");
  var input = document.getElementById("answer");
  var ask = document.getElementById("ask");
  var done = document.getElementById("done");
  var fb = document.getElementById("feedback");
  var again = document.getElementById("again");
  var hintBtn = document.getElementById("hintBtn");
  var hint = document.getElementById("hint");
  var shakeTimer;

  function show(correct) {
    ask.hidden = correct;
    done.hidden = !correct;
  }

  function markSolved() {
    store.set(cfg.key, "solved");
    store.set(cfg.gradeKey, cfg.grade);
    show(true);
    // move focus so keyboard users land on the new content
    var h = done.querySelector(".big");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  function wrong() {
    fb.hidden = false;
    input.classList.remove("bad");
    void input.offsetWidth; // restart the shake
    input.classList.add("bad");
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(function () { input.classList.remove("bad"); }, 480);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nums = (input.value.match(/\d+/g) || []).map(Number);
    if (cfg.check(nums, input.value)) markSolved(); else wrong();
  });

  input.addEventListener("input", function () {
    fb.hidden = true;
    input.classList.remove("bad");
  });

  again.addEventListener("click", function () {
    store.del(cfg.key);
    store.del(cfg.gradeKey);
    input.value = "";
    fb.hidden = true;
    show(false);
    input.focus();
  });

  hintBtn.addEventListener("click", function () {
    var open = hint.hidden;
    hint.hidden = !open;
    hintBtn.textContent = open ? "скрий подсказката" : "трябва ли ти подсказка?";
    hintBtn.setAttribute("aria-expanded", String(open));
  });

  if (store.get(cfg.key, "") === "solved") show(true); else show(false);
})();
