/// <reference path="../pb_data/types.d.ts" />

// Custom admin page: drag-and-drop ordering for the `socials` collection.
//
// PocketBase's built-in dashboard can edit social links but can't reorder rows
// by dragging. This hook serves a tiny self-contained page at:
//
//     {PB_URL}/socials-order        e.g. https://pb.micio86dev.it/socials-order
//
// It asks for a superuser email + password (the `socials` collection's write
// rule is superusers-only), lists the rows, lets you drag them into order, and
// on "Save order" PATCHes the `order` field of each changed row. No external
// scripts, no build step — just one HTML document. The page itself is harmless
// to serve publicly; the security boundary is PocketBase's API (the PATCH calls
// need a valid superuser token).
//
// Linked from the Astro frontend's docs only — not from the public site.

routerAdd('GET', '/socials-order', (e) => {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Socials — reorder</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; padding: 32px 16px;
    font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #0e0f10; color: #e7e7e2;
    display: flex; flex-direction: column; align-items: center;
  }
  .wrap { width: 100%; max-width: 560px; }
  h1 { font-size: 18px; font-weight: 600; margin: 0 0 4px; }
  .sub { color: #8d8d86; font-size: 12px; margin: 0 0 24px; }
  a { color: #5fb98f; }
  .card {
    background: #18191b; border: 1px solid #2a2b2e; border-radius: 12px;
    padding: 20px; margin-bottom: 16px;
  }
  label { display: block; font-size: 12px; color: #b6b6ad; margin: 0 0 6px; }
  input[type=email], input[type=password] {
    width: 100%; padding: 9px 12px; border-radius: 8px;
    border: 1px solid #34353a; background: #0e0f10; color: #e7e7e2; font: inherit;
    margin-bottom: 14px;
  }
  input:focus { outline: 2px solid #2f8556; outline-offset: 1px; }
  button {
    appearance: none; border: 0; border-radius: 8px; cursor: pointer;
    padding: 9px 16px; font: inherit; font-weight: 600;
    background: #1f6e4a; color: #f1f1ea;
  }
  button:hover { background: #15533a; }
  button.ghost { background: transparent; color: #b6b6ad; border: 1px solid #34353a; font-weight: 500; }
  button.ghost:hover { background: #1f2123; color: #e7e7e2; }
  button[disabled] { opacity: .5; cursor: default; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .spacer { flex: 1; }
  ul#list { list-style: none; margin: 0; padding: 0; }
  ul#list li {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; margin-bottom: 8px;
    background: #18191b; border: 1px solid #2a2b2e; border-radius: 10px;
    cursor: grab; user-select: none;
  }
  ul#list li.dragging { opacity: .4; cursor: grabbing; }
  ul#list li .grip { color: #6b6c70; font-size: 16px; line-height: 1; flex: none; }
  ul#list li .icon {
    flex: none; font: 11px/1 ui-monospace, monospace; text-transform: uppercase;
    letter-spacing: .04em; color: #5fb98f;
    border: 1px solid #2f4f3f; border-radius: 999px; padding: 4px 8px;
    min-width: 78px; text-align: center;
  }
  ul#list li .meta { flex: 1; min-width: 0; }
  ul#list li .label { font-weight: 600; }
  ul#list li .url { color: #8d8d86; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .status { font-size: 13px; margin-top: 12px; min-height: 18px; }
  .status.ok { color: #5fb98f; }
  .status.err { color: #e36d58; }
  .muted { color: #8d8d86; font-size: 12px; margin-top: 14px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Social links — reorder</h1>
  <p class="sub">Drag the rows into the order you want them in the footer, then save. Editing icon / URL / label is done in the <a href="/_/" target="_blank" rel="noopener">PocketBase dashboard</a>.</p>

  <div class="card" id="login">
    <form id="loginForm">
      <label for="email">Superuser email</label>
      <input type="email" id="email" autocomplete="username" required>
      <label for="password">Password</label>
      <input type="password" id="password" autocomplete="current-password" required>
      <div class="row">
        <button type="submit">Sign in</button>
        <span class="status err" id="loginErr"></span>
      </div>
    </form>
  </div>

  <div id="app" hidden>
    <ul id="list"></ul>
    <div class="row">
      <button id="save" type="button">Save order</button>
      <button id="reload" class="ghost" type="button">Reload</button>
      <span class="spacer"></span>
      <button id="logout" class="ghost" type="button">Sign out</button>
    </div>
    <div class="status" id="status"></div>
    <p class="muted">Order is stored in the <code>socials.order</code> column. The site reads it fresh on every request — no redeploy needed.</p>
  </div>
</div>

<script>
(function () {
  var TOKEN_KEY = 'pb_socials_order_token';
  var token = sessionStorage.getItem(TOKEN_KEY) || '';
  var loginEl = document.getElementById('login');
  var appEl = document.getElementById('app');
  var listEl = document.getElementById('list');
  var statusEl = document.getElementById('status');
  var loginErrEl = document.getElementById('loginErr');
  var records = [];

  function authHeaders() { return token ? { Authorization: token } : {}; }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (kind ? ' ' + kind : '');
  }

  function show(authed) {
    loginEl.hidden = authed;
    appEl.hidden = !authed;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    listEl.innerHTML = '';
    records.forEach(function (r) {
      var li = document.createElement('li');
      li.draggable = true;
      li.dataset.id = r.id;
      li.innerHTML =
        '<span class="grip" aria-hidden="true">⠿</span>' +
        '<span class="icon">' + esc(r.icon) + '</span>' +
        '<span class="meta"><div class="label">' + esc(r.label || '(no label)') + '</div>' +
        '<div class="url">' + esc(r.url) + '</div></span>';
      listEl.appendChild(li);
    });
  }

  // ── drag & drop (native, vertical list) ────────────────────────────
  var dragEl = null;
  listEl.addEventListener('dragstart', function (ev) {
    var li = ev.target.closest('li'); if (!li) return;
    dragEl = li; li.classList.add('dragging');
    ev.dataTransfer.effectAllowed = 'move';
    try { ev.dataTransfer.setData('text/plain', li.dataset.id); } catch (e) {}
  });
  listEl.addEventListener('dragend', function () {
    if (dragEl) dragEl.classList.remove('dragging');
    dragEl = null;
  });
  listEl.addEventListener('dragover', function (ev) {
    ev.preventDefault();
    if (!dragEl) return;
    var li = ev.target.closest('li');
    if (!li || li === dragEl) return;
    var rect = li.getBoundingClientRect();
    var after = ev.clientY > rect.top + rect.height / 2;
    listEl.insertBefore(dragEl, after ? li.nextSibling : li);
  });

  function currentOrderIds() {
    return Array.prototype.map.call(listEl.querySelectorAll('li'), function (li) { return li.dataset.id; });
  }

  // ── data ───────────────────────────────────────────────────────────
  function load() {
    setStatus('Loading…');
    return fetch('/api/collections/socials/records?perPage=500&sort=order,created', { headers: authHeaders() })
      .then(function (res) {
        if (res.status === 401 || res.status === 403) { signOut(); throw new Error('Session expired — sign in again.'); }
        if (!res.ok) throw new Error('Failed to load (HTTP ' + res.status + ').');
        return res.json();
      })
      .then(function (data) {
        records = data.items || [];
        render();
        setStatus(records.length ? '' : 'No social links yet — add some in the PocketBase dashboard.');
      })
      .catch(function (err) { setStatus(err.message || String(err), 'err'); });
  }

  function save() {
    var ids = currentOrderIds();
    var byId = {};
    records.forEach(function (r) { byId[r.id] = r; });
    var changed = ids.map(function (id, i) { return { id: id, order: i + 1, was: byId[id] ? byId[id].order : null }; })
      .filter(function (c) { return c.order !== c.was; });
    if (!changed.length) { setStatus('Nothing to save — order unchanged.', 'ok'); return; }
    setStatus('Saving ' + changed.length + ' change' + (changed.length === 1 ? '' : 's') + '…');
    document.getElementById('save').disabled = true;
    var chain = Promise.resolve();
    changed.forEach(function (c) {
      chain = chain.then(function () {
        return fetch('/api/collections/socials/records/' + encodeURIComponent(c.id), {
          method: 'PATCH',
          headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
          body: JSON.stringify({ order: c.order }),
        }).then(function (res) {
          if (res.status === 401 || res.status === 403) { signOut(); throw new Error('Session expired — sign in again.'); }
          if (!res.ok) throw new Error('Save failed on one row (HTTP ' + res.status + ').');
        });
      });
    });
    chain.then(function () {
      document.getElementById('save').disabled = false;
      setStatus('Saved. ' + changed.length + ' row' + (changed.length === 1 ? '' : 's') + ' updated.', 'ok');
      return load();
    }).catch(function (err) {
      document.getElementById('save').disabled = false;
      setStatus(err.message || String(err), 'err');
    });
  }

  function signOut() {
    token = '';
    sessionStorage.removeItem(TOKEN_KEY);
    show(false);
  }

  // ── wire up ────────────────────────────────────────────────────────
  document.getElementById('loginForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    loginErrEl.textContent = '';
    var identity = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    fetch('/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: identity, password: password }),
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status === 400 ? 'Wrong email or password.' : 'Sign-in failed (HTTP ' + res.status + ').');
      return res.json();
    }).then(function (data) {
      token = data.token;
      sessionStorage.setItem(TOKEN_KEY, token);
      document.getElementById('password').value = '';
      show(true);
      load();
    }).catch(function (err) { loginErrEl.textContent = err.message || String(err); });
  });
  document.getElementById('save').addEventListener('click', save);
  document.getElementById('reload').addEventListener('click', load);
  document.getElementById('logout').addEventListener('click', signOut);

  if (token) { show(true); load(); } else { show(false); }
})();
</script>
</body>
</html>`;
  return e.html(200, html);
});
