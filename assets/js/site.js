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

  // 3) 自测（章节页 ch2）：红旗触发 + 普通危险因素计数
  var sexPick2 = document.getElementById('sexPick2');
  if (sexPick2) {
    var sBtns = sexPick2.querySelectorAll('button');
    [].forEach.call(sBtns, function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(sBtns, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var male = b.dataset.sex === 'm';
        box.classList.toggle('male', male);
        var fe = box.querySelectorAll('[data-only="f"]');
        [].forEach.call(fe, function (el) {
          el.hidden = male;
          if (male) {
            var inp = el.querySelector('input');
            if (inp) { inp.checked = false; }
          }
        });
        box.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  var box = document.getElementById('checkList');
  if (box) {
    var res = document.getElementById('checkResult');
    function render() {
      var all = [].slice.call(box.querySelectorAll('input'));
      var yes = all.filter(function (i) { return i.checked; });
      var flags = yes.filter(function (i) { return i.dataset.hi === '1'; }).length;
      var others = yes.length - flags;
      var t;
      if (flags > 0) {
        t = '建议专科评估：命中的红旗信号（' + flags + ' 条）任意一条都不适合自己判断，' +
            '请到骨科 / 骨质疏松专科门诊，由医生结合病史与 DXA 综合判断。';
      } else if (others >= 3) {
        t = '建议近期筛查：命中 ' + others + ' 条危险因素，建议 3 个月内做一次 DXA 建立基线，' +
            '同时开始负重运动与居家防跌倒改造。';
      } else if (others >= 1) {
        t = '轻度关注：命中 ' + others + ' 条危险因素，暂未到“近期筛查”门槛；' +
            '每年量身高、留意跌倒与腰背痛，女性 65 岁 / 男性 70 岁后做一次骨密度。';
      } else {
        t = '目前低风险：保持负重运动与日照，女性 65 岁、男性 70 岁后每 1–2 年筛查一次。';
      }
      var hitEl = document.getElementById('checkHit');
      if (hitEl) {
        hitEl.innerHTML =
          '<span class="' + (flags ? 'hit-red' : 'hit-off') + '">红旗 ' + flags + ' 条</span>' +
          '<span class="' + (others ? 'hit-mute' : 'hit-off') + '">其他危险因素 ' + others + ' 条</span>';
      }
      res.textContent = t;
    }
    box.addEventListener('change', render);
    render();
  }
})();


  /* ---------- OSTA 速算 ---------- */
  (function(){
    var age = document.getElementById('ostaAge');
    var wt = document.getElementById('ostaWt');
    var btn = document.getElementById('ostaBtn');
    var out = document.getElementById('ostaRes');
    if (!btn) return;
    function calc(){
      var a = parseFloat(age.value), w = parseFloat(wt.value);
      if (!(a > 0 && w > 0)) { out.textContent = '请输入年龄与体重。'; return; }
      var idx = (w - a) * 0.2;
      var s = idx.toFixed(1);
      var txt;
      if (idx > -1) txt = '低风险（指数 ' + s + '）：按年龄常规筛查即可，女性 65 岁、男性 70 岁后每 1–2 年查一次。';
      else if (idx >= -4) txt = '中等风险（指数 ' + s + '）：建议做一次 DXA 建立基线，同时评估跌倒风险。';
      else txt = '高风险（指数 ' + s + '）：建议尽快做 DXA，并由骨科 / 骨质疏松专科评估是否需要治疗。';
      out.textContent = txt;
    }
    btn.addEventListener('click', calc);
    [age, wt].forEach(function(el){
      el.addEventListener('keydown', function(e){ if (e.key === 'Enter') calc(); });
    });
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
      var shots = track.querySelectorAll('.shot');
      var viewCenter = track.scrollLeft + track.clientWidth / 2;
      var half = track.clientWidth / 2;
      for (var i = 0; i < shots.length; i++) {
        var el = shots[i];
        // 用布局坐标计算，避免读取被 transform 影响后的位置
        var xc = el.offsetLeft + el.offsetWidth / 2 + (el.offsetParent === track ? 0 : 0);
        var t = (xc - viewCenter) / half;
        if (t > 1.35) t = 1.35; if (t < -1.35) t = -1.35;
        var ac = Math.min(1, Math.abs(t));
        var ky = 0.90 + 0.13 * ac * ac;      // 上下高度：中间 0.90，两侧 1.03（相差 1.14 倍）
        var kx = 0.99 + 0.025 * ac;
        var ry = -t * 8;
        // 弧形：上下两行随位置上下偏移，行距保持不变
        var h = el.offsetHeight || 0;
        var row = i % 3;
        var dy = (row === 0 ? 1 : (row === 2 ? -1 : 0)) * h * (1 - ky);
        el.style.transform =
          'translateY(' + dy.toFixed(1) + 'px) perspective(900px) rotateY(' +
          ry.toFixed(2) + 'deg) scaleY(' + ky.toFixed(3) + ') scaleX(' + kx.toFixed(3) + ')';
        el.style.zIndex = String(Math.round(20 - ac * 10));
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

/* 全身骨骼图：进入视口后依次点亮三处部位 */
(function () {
  var figs = document.querySelectorAll('.bodyfig');
  if (!figs.length || !window.IntersectionObserver) {
    Array.prototype.forEach.call(figs, function (f) { f.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.remove('pre');
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.35 });
  Array.prototype.forEach.call(figs, function (f) {
    f.classList.add('pre');
    io.observe(f);
  });
})();
