/* Shared site shell: header, category pages, home hub, progress. Question data lives in data/*.js. */
var CATS = [
  {id:'design', title:'Design and critique', blurb:'Pick one user, find the pain that matters most, and land a single recommendation you can defend. The structure should be audible, never named.'},
  {id:'metrics', title:'Metrics and experiments', blurb:'Tie every metric to the value the product creates, commit to one, and diagnose drops by ruling things out in order instead of guessing.'},
  {id:'estimation', title:'Estimation', blurb:'Pick an approach, say each assumption out loud, keep the math round, and sanity-check against something you know. Numbers are illustrative.'},
  {id:'pricing', title:'Pricing', blurb:'Anchor on the value to the customer, then cost, competitors, and strategy. End with a real number or structure and how you would test it.'},
  {id:'technical', title:'Technical', blurb:'You will not be asked to code. You will be asked to explain clearly, reason about trade-offs, and show engineers you understand how the system works.'},
  {id:'strategy', title:'Strategy and trade-offs', blurb:'Take a position early, weigh the strongest arguments on both sides, and close with a decision and what would change your mind.'},
  {id:'vision', title:'Vision', blurb:'A good vision names a big problem, paints a concrete picture of the future, and explains how you get there from today.'},
  {id:'execution', title:'Prioritization, execution, and stress', blurb:'Judgment under pressure: stay calm, clarify the goal, lay out options, and recommend one with a plan for communicating it.'},
  {id:'behavioral', title:'Behavioral', blurb:'Example stories show the level of detail that lands. Replace them with your own real stories and real numbers before the interview.'},
  {id:'ai', title:'AI products', blurb:'Interviewers test judgment about when and how to use AI. Ground every answer in quality, cost, and trust.'}
];
var QB = {};
function qb(cat, items){ items.forEach(function(it){ it.cat = cat; }); QB[cat] = items; }

(function(){
  var KEY = 'pmqb-done';
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
  function save(d){ try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} }
  var done = load();
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function strip(s){ return String(s).replace(/<[^>]+>/g, ' '); }
  function all(){ var out = []; CATS.forEach(function(c){ (QB[c.id] || []).forEach(function(q){ out.push(q); }); }); return out; }
  function doneIn(cat){ return (QB[cat] || []).filter(function(q){ return done[q.n]; }).length; }
  function reduce(){ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  function header(page){
    var h = document.createElement('header');
    h.className = 'site';
    var isCat = CATS.some(function(c){ return c.id === page; });
    h.innerHTML = '<div class="site-in"><a class="brand" href="index.html">PM interview bank</a><nav class="site-links" aria-label="Site">' +
      '<a href="index.html"' + (page === 'home' ? ' aria-current="page"' : '') + '>Home</a>' +
      '<a href="frameworks.html"' + (page === 'frameworks' ? ' aria-current="page"' : '') + '>Frameworks</a></nav>' +
      '<button class="theme-btn" id="theme" type="button"></button></div>' +
      (isCat ? '<nav class="chips" aria-label="Categories">' + CATS.map(function(c){
        return '<a class="chip" href="' + c.id + '.html"' + (c.id === page ? ' aria-current="page"' : '') + '>' + esc(c.title) + '</a>';
      }).join('') + '</nav>' : '');
    document.body.insertBefore(h, document.body.firstChild);
    themeToggle(h.querySelector('#theme'));
    var cur = h.querySelector('.chip[aria-current]');
    if (cur) cur.parentNode.scrollLeft = cur.offsetLeft - (cur.parentNode.clientWidth - cur.offsetWidth) / 2;
  }

  // Light/dark toggle. Starts from the system setting; an explicit choice is saved.
  function themeToggle(btn){
    var root = document.documentElement, mq = window.matchMedia('(prefers-color-scheme: dark)');
    function isDark(){ return root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches; }
    function label(){
      var d = isDark();
      btn.textContent = d ? '☀' : '☾';
      btn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = btn.getAttribute('aria-label');
    }
    btn.addEventListener('click', function(){
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('pmqb-theme', root.dataset.theme); } catch(e){}
      label();
    });
    if (mq.addEventListener) mq.addEventListener('change', label);
    label();
  }

  function card(q){
    var fu = q.follow || [];
    return '<details class="q' + (done[q.n] ? ' done' : '') + '" id="q' + q.n + '" data-n="' + q.n + '">' +
      '<summary><span class="num">' + q.n + '</span><span class="qt">' + q.q + '</span><span class="tick">Practiced</span></summary>' +
      '<div class="body">' +
      '<p class="tests"><b>What they are testing:</b> ' + q.tests + '</p>' +
      '<div class="gate"><p>Answer out loud first. Aim for three to five minutes.</p><span class="clock">0:00</span><button class="btn reveal">Reveal answer</button></div>' +
      '<div class="tabs" role="tablist">' +
        '<button class="tab" role="tab" aria-selected="true" data-t="say">Answer</button>' +
        '<button class="tab" role="tab" aria-selected="false" data-t="notes">Coach notes</button>' +
        (fu.length ? '<button class="tab" role="tab" aria-selected="false" data-t="fu">Follow-ups (' + fu.length + ')</button>' : '') +
      '</div>' +
      '<div class="panel say" role="tabpanel" data-p="say">' + q.answer + '</div>' +
      '<div class="panel" role="tabpanel" data-p="notes" hidden>' + q.notes + '</div>' +
      (fu.length ? '<div class="panel" role="tabpanel" data-p="fu" hidden>' + fu.map(function(f){
        return '<div class="fu"><b>' + f[0] + '</b><p>' + f[1] + '</p></div>';
      }).join('') + '</div>' : '') +
      '<div class="qfoot"><label><input type="checkbox" class="mark"' + (done[q.n] ? ' checked' : '') + '> Practiced</label>' +
      '<a href="#q' + q.n + '">Link to this question</a></div>' +
      '</div></details>';
  }

  function categoryPage(id){
    var i = CATS.map(function(c){ return c.id; }).indexOf(id), c = CATS[i], qs = QB[id] || [];
    var prev = CATS[i - 1], next = CATS[i + 1];
    document.title = c.title + ' | PM interview bank';
    var main = document.getElementById('app');
    main.innerHTML =
      '<div class="page-head"><p class="eyebrow">Category ' + (i + 1) + ' of ' + CATS.length + ' · ' + qs.length + ' questions</p>' +
      '<h1>' + esc(c.title) + '</h1><p class="lede">' + esc(c.blurb) + '</p>' +
      '<div class="progress"><div class="meter"><span id="bar"></span></div><span id="ptext"></span></div>' +
      '<div class="toolbar"><input class="search" type="search" id="filter" placeholder="Filter these questions" aria-label="Filter questions">' +
      '<label class="switch"><input type="checkbox" id="practice"> Practice mode</label>' +
      '<button class="btn" id="rand">Random</button><button class="btn alt" id="openall">Expand all</button><button class="btn alt" id="closeall">Collapse all</button></div></div>' +
      '<div class="layout"><aside class="toc" aria-label="Questions"><h2>Questions</h2><ol>' +
        qs.map(function(q){ return '<li><a href="#q' + q.n + '" data-n="' + q.n + '"' + (done[q.n] ? ' class="done"' : '') + '><span class="n">' + q.n + '</span><span>' + strip(q.q) + '</span></a></li>'; }).join('') +
      '</ol></aside><div>' +
      '<select class="jump" id="jump" aria-label="Jump to question"><option value="">Jump to a question…</option>' +
        qs.map(function(q){ return '<option value="q' + q.n + '">' + q.n + '. ' + esc(strip(q.q)) + '</option>'; }).join('') + '</select>' +
      '<div id="list">' + qs.map(card).join('') + '</div><p class="empty" id="empty" hidden>No questions match that filter.</p>' +
      '<nav class="pager" aria-label="Other categories">' +
        (prev ? '<a href="' + prev.id + '.html"><small>Previous</small>' + esc(prev.title) + '</a>' : '<span></span>') +
        (next ? '<a class="next" href="' + next.id + '.html"><small>Next</small>' + esc(next.title) + '</a>' : '<a class="next" href="frameworks.html"><small>Next</small>Frameworks</a>') +
      '</nav></div></div>';

    var cards = [].slice.call(main.querySelectorAll('.q'));
    function progress(){
      var n = doneIn(id), pct = qs.length ? Math.round(n / qs.length * 100) : 0;
      document.getElementById('bar').style.width = pct + '%';
      document.getElementById('ptext').textContent = n + ' of ' + qs.length + ' practiced';
    }
    progress();

    function go(d, open){
      if (open) d.open = true;
      d.scrollIntoView({behavior: reduce() ? 'auto' : 'smooth', block: 'start'});
      d.querySelector('summary').focus({preventScroll:true});
    }

    main.addEventListener('click', function(e){
      var t = e.target.closest('.tab');
      if (t){
        var body = t.closest('.body');
        [].forEach.call(body.querySelectorAll('.tab'), function(b){ b.setAttribute('aria-selected', b === t ? 'true' : 'false'); });
        [].forEach.call(body.querySelectorAll('.panel'), function(p){ p.hidden = p.dataset.p !== t.dataset.t; });
        return;
      }
      if (e.target.closest('.reveal')){
        var q = e.target.closest('.q'); q.classList.add('revealed'); stopClock(q);
      }
    });
    main.addEventListener('change', function(e){
      if (!e.target.classList.contains('mark')) return;
      var q = e.target.closest('.q'), n = q.dataset.n;
      if (e.target.checked) done[n] = 1; else delete done[n];
      save(done);
      q.classList.toggle('done', e.target.checked);
      var link = main.querySelector('.toc a[data-n="' + n + '"]');
      if (link) link.classList.toggle('done', e.target.checked);
      progress();
    });

    // Practice mode: hide answers behind a timer until revealed.
    var clocks = {};
    function stopClock(q){ clearInterval(clocks[q.id]); delete clocks[q.id]; }
    cards.forEach(function(q){
      q.addEventListener('toggle', function(){
        if (q.open && document.body.classList.contains('practice') && !q.classList.contains('revealed') && !clocks[q.id]){
          var start = Date.now(), el = q.querySelector('.clock');
          el.textContent = '0:00';
          clocks[q.id] = setInterval(function(){
            var s = Math.floor((Date.now() - start) / 1000);
            el.textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2);
          }, 1000);
        } else if (!q.open) stopClock(q);
      });
    });
    document.getElementById('practice').addEventListener('change', function(e){
      document.body.classList.toggle('practice', e.target.checked);
      cards.forEach(function(q){ q.classList.remove('revealed'); q.open = false; stopClock(q); });
    });

    var filter = document.getElementById('filter');
    filter.addEventListener('input', function(){
      var term = filter.value.trim().toLowerCase(), shown = 0;
      cards.forEach(function(d, k){
        var q = qs[k], hit = !term || strip(q.q + ' ' + q.answer).toLowerCase().indexOf(term) > -1;
        d.hidden = !hit; if (hit) shown++;
        var link = main.querySelector('.toc a[data-n="' + q.n + '"]');
        if (link) link.parentNode.hidden = !hit;
      });
      document.getElementById('empty').hidden = shown > 0;
    });
    function visible(){ return cards.filter(function(d){ return !d.hidden; }); }
    document.getElementById('openall').addEventListener('click', function(){ visible().forEach(function(d){ d.open = true; }); });
    document.getElementById('closeall').addEventListener('click', function(){ visible().forEach(function(d){ d.open = false; }); });
    var pickTimer;
    document.getElementById('rand').addEventListener('click', function(){
      var list = visible(); if (!list.length) return;
      list.forEach(function(d){ d.classList.remove('picked'); d.open = false; });
      var d = list[Math.floor(Math.random() * list.length)];
      d.classList.add('picked'); go(d, false);
      clearTimeout(pickTimer); pickTimer = setTimeout(function(){ d.classList.remove('picked'); }, 4000);
    });
    document.getElementById('jump').addEventListener('change', function(e){
      var d = document.getElementById(e.target.value); if (d) go(d, true);
      e.target.value = '';
    });
    main.querySelector('.toc').addEventListener('click', function(e){
      var a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      var d = document.getElementById('q' + a.dataset.n);
      history.replaceState(null, '', '#q' + a.dataset.n);
      go(d, true);
    });

    // Highlight the question in view in the sidebar.
    if ('IntersectionObserver' in window){
      var links = {};
      [].forEach.call(main.querySelectorAll('.toc a'), function(a){ links[a.dataset.n] = a; });
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if (en.isIntersecting){
            Object.keys(links).forEach(function(k){ links[k].classList.remove('here'); });
            links[en.target.dataset.n].classList.add('here');
          }
        });
      }, {rootMargin:'-130px 0px -60% 0px'});
      cards.forEach(function(d){ io.observe(d); });
    }

    function fromHash(){
      var d = location.hash && document.getElementById(location.hash.slice(1));
      if (d && d.classList.contains('q')) go(d, true);
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  function homePage(){
    // Old single-page links like index.html#q12 now live on category pages.
    var m = /^#q(\d+)$/.exec(location.hash);
    if (m){
      var hit = all().filter(function(q){ return String(q.n) === m[1]; })[0];
      if (hit){ location.replace(hit.cat + '.html#q' + hit.n); return; }
    }
    var qs = all(), total = qs.length;
    var practiced = qs.filter(function(q){ return done[q.n]; }).length;
    document.getElementById('s-total').textContent = total;
    document.getElementById('s-done').textContent = practiced;
    document.getElementById('grid').innerHTML = CATS.map(function(c){
      var n = (QB[c.id] || []).length, d = doneIn(c.id);
      return '<a class="card" href="' + c.id + '.html"><h3>' + esc(c.title) + '</h3><p>' + esc(c.blurb) + '</p>' +
        '<div class="meter"><span style="width:' + (n ? Math.round(d / n * 100) : 0) + '%"></span></div>' +
        '<span class="count">' + n + ' questions · ' + d + ' practiced</span></a>';
    }).join('');
    document.getElementById('rand').addEventListener('click', function(){
      var pool = qs.filter(function(q){ return !done[q.n]; });
      if (!pool.length) pool = qs;
      var q = pool[Math.floor(Math.random() * pool.length)];
      location.href = q.cat + '.html#q' + q.n;
    });
    var box = document.getElementById('q'), out = document.getElementById('results');
    var title = {}; CATS.forEach(function(c){ title[c.id] = c.title; });
    box.addEventListener('input', function(){
      var term = box.value.trim().toLowerCase();
      if (term.length < 2){ out.innerHTML = ''; return; }
      var hits = qs.filter(function(q){ return strip(q.q + ' ' + q.answer).toLowerCase().indexOf(term) > -1; });
      out.innerHTML = hits.slice(0, 25).map(function(q){
        return '<li><a href="' + q.cat + '.html#q' + q.n + '">' + q.n + '. ' + q.q + '<small>' + esc(title[q.cat]) + '</small></a></li>';
      }).join('') || '<li class="empty">No matches.</li>';
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var page = document.body.dataset.page;
    header(page);
    if (page === 'home') homePage();
    else if (QB[page]) categoryPage(page);
  });
})();
