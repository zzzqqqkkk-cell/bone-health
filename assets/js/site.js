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
