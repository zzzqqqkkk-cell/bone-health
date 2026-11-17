/* 站点交互：阅读进度、目录高亮、自测计分 */
(function () {
  // 1) 顶部阅读进度
  var bar = document.getElementById('bar');
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    bar.style.width = Math.min(100, Math.max(0, p * 100)) + '%';
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2) 目录高亮
  var links = [].slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if (links.length && window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = secs.indexOf(e.target);
        if (i < 0) return;
        links.forEach(function (l) { l.classList.remove('on'); });
        links[i].classList.add('on');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }

  // 3) 自测计分（章节页 ch2）
  var box = document.getElementById('checkList');
  if (box) {
    var res = document.getElementById('checkResult');
    var hard = ['h1', 'h2', 'h3']; // data-hi 的勾选项
    function render() {
      var all = [].slice.call(box.querySelectorAll('input'));
      var yes = all.filter(function (i) { return i.checked; });
      var score = yes.length;
      var hasHard = yes.some(function (i) { return i.dataset.hi === '1'; });
      var t;
      if (score >= 6 || (hasHard && score >= 4)) t = '较高风险：建议尽快做一次 DXA，并由专科评估是否用药。';
      else if (score >= 3 || hasHard) t = '需要关注：建议 3–6 个月内做一次骨密度，同时开始防跌倒改造。';
      else if (score >= 1) t = '轻度关注：记录身高变化，1 年内筛查一次。';
      else t = '目前低风险：保持负重运动与日照，65 岁后定期筛查。';
      res.textContent = '已选 ' + score + ' 项 · ' + t;
    }
    box.addEventListener('change', render);
    render();
  }
})();

/* 相片墙：大荧幕立体 + 自动巡游 + 鼠标拖动 + 滑块 */
(function () {
  var figs = document.querySelectorAll('.gallery');
  if (!figs.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = reduce ? 10 : 24; // 像素/秒

  Array.prototype.forEach.call(figs, function (fig) {
    var track = fig.querySelector('.gallery-track');
    var rail = fig.querySelector('.wrail');
    var thumb = fig.querySelector('.wthumb');
    if (!track) return;

    var paused = false, timer = null, dir = 1, last = 0, drag = null, thumbDrag = false;

    function pause(ms) {
      paused = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { paused = false; }, ms || 1600);
    }

    /* ---- 立体：越靠边，上下越高、外侧微收 ---- */
    function shape() {
      var box = track.getBoundingClientRect();
      var cx = box.left + box.width / 2;
      var shots = track.querySelectorAll('.shot');
      for (var i = 0; i < shots.length; i++) {
        var s = shots[i].getBoundingClientRect();
        var t = (s.left + s.width / 2 - cx) / (box.width / 2);
        if (t > 1.35) t = 1.35; if (t < -1.35) t = -1.35;
        var a = Math.abs(t);
        var ky = 1 + 0.12 * a * a;              // 上下加宽
        var kx = 1 + 0.015 * a;                 // 略微放大
        var ry = -t * 7;                        // 外侧向后收，形成弧面
        shots[i].style.transform =
          'perspective(900px) rotateY(' + ry.toFixed(2) + 'deg) scaleY(' +
          ky.toFixed(3) + ') scaleX(' + kx.toFixed(3) + ')';
        shots[i].style.zIndex = String(Math.round(20 - a * 10));
      }
    }

    /* ---- 滑块同步 ---- */
    function sync() {
      if (!rail || !thumb) return;
      var max = track.scrollWidth - track.clientWidth;
      var rw = rail.clientWidth - thumb.offsetWidth - 6;
      var p = max > 0 ? track.scrollLeft / max : 0;
      thumb.style.left = (3 + p * Math.max(rw, 0)) + 'px';
    }

    /* ---- 自动巡游（双驱动，按时间累积） ---- */
    function step() {
      var now = performance.now();
      var dt = last ? Math.min((now - last) / 1000, 0.3) : 0;
      last = now;
      if (!dt || paused || drag || thumbDrag) return;
      var max = track.scrollWidth - track.clientWidth;
      if (max < 8) return;
      var r = track.getBoundingClientRect();
      if (r.bottom < 40 || r.top > (window.innerHeight || 800) - 40) return;
      var next = track.scrollLeft + SPEED * dt * dir;
      if (next >= max) { next = max; dir = -1; }
      else if (next <= 0) { next = 0; dir = 1; }
      track.scrollLeft = next;
    }
    (function loop() { step(); requestAnimationFrame(loop); })();
    setInterval(step, 120);

    var shapeQueued = false;
    function onScroll() {
      if (shapeQueued) return;
      shapeQueued = true;
      requestAnimationFrame(function () { shapeQueued = false; shape(); sync(); });
      sync();
    }
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { shape(); sync(); });

    /* ---- 鼠标 / 手指拖动 ---- */
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft };
      track.classList.add('dragging');
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
      last = 0;
    });
    track.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 2) e.preventDefault();
      track.scrollLeft = drag.left - dx;
    });
    function endDrag() {
      if (!drag) return;
      drag = null;
      track.classList.remove('dragging');
      pause(1800);
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);

    /* ---- 下方滑块 ---- */
    if (rail && thumb) {
      function setFromX(clientX) {
        var box = rail.getBoundingClientRect();
        var rw = box.width - thumb.offsetWidth - 6;
        var p = (clientX - box.left - thumb.offsetWidth / 2 - 3) / Math.max(rw, 1);
        p = Math.max(0, Math.min(1, p));
        var max = track.scrollWidth - track.clientWidth;
        track.scrollLeft = p * max;
      }
      thumb.addEventListener('pointerdown', function (e) {
        e.preventDefault(); e.stopPropagation();
        thumbDrag = true; pause(4000);
        try { thumb.setPointerCapture(e.pointerId); } catch (err) {}
      });
      thumb.addEventListener('pointermove', function (e) {
        if (thumbDrag) { e.preventDefault(); setFromX(e.clientX); }
      });
      thumb.addEventListener('pointerup', function () { thumbDrag = false; pause(1800); });
      rail.addEventListener('pointerdown', function (e) {
        if (e.target === thumb) return;
        pause(2600); setFromX(e.clientX);
      });
      var btns = fig.querySelectorAll('.wbtn');
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener('click', function () {
          var col = track.clientWidth / 3;
          pause(2200);
          var target = track.scrollLeft + col * Number(b.dataset.dir);
          var maxL = track.scrollWidth - track.clientWidth;
          track.scrollLeft = Math.max(0, Math.min(maxL, target));
        });
      });
    }

    shape(); sync();
    setTimeout(function () { shape(); sync(); }, 300);
  });
})();
