import './style.css';

type DemoState = {
  stamp: string;
  label: string;
  meta: string;
  dom: string;
  aria: string;
  console: string;
  network: string;
  note: string;
  failed: boolean;
};

const states: Record<string, DemoState> = {
  loaded: {
    stamp: 'Checkpoint passed · baseline', label: 'Product page loaded', meta: '38 KB · masked', dom: 'data-stock="ready"', aria: 'heading “Field notes”', console: 'No errors', network: 'GET /product · 200', note: 'Checkpoint 1 of 3: successful baseline selected.', failed: false,
  },
  failed: {
    stamp: 'Assertion failed · evidence frozen', label: 'Cart count increments', meta: '42 KB · masked', dom: 'data-count="0"', aria: 'status “0 items”', console: 'TypeError × 1', network: 'POST /cart · 200', note: 'Checkpoint 2 of 3: failed assertion evidence selected.', failed: true,
  },
  continued: {
    stamp: 'Journey continued · final state', label: 'Checkout rendered', meta: '40 KB · masked', dom: 'data-step="shipping"', aria: 'heading “Checkout”', console: '1 prior error', network: 'GET /checkout · 200', note: 'Checkpoint 3 of 3: continued journey state selected.', failed: false,
  },
};

const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const text = (id: string, value: string) => { const node = document.getElementById(id); if (node) node.textContent = value; };

function selectTab(tab: HTMLButtonElement): void {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  const state = states[tab.dataset.state ?? 'failed'];
  text('demo-stamp', state.stamp);
  text('demo-label', state.label);
  text('visual-meta', state.meta);
  text('dom-value', state.dom);
  text('aria-value', state.aria);
  text('console-value', state.console);
  text('network-value', state.network);
  text('demo-status', state.note);
  text('demo-id', `RCPT / ${String(tabs.indexOf(tab) + 1).padStart(2, '0')}`);
  document.getElementById('console-value')?.classList.toggle('danger', state.failed);
  document.getElementById('mini-browser')?.classList.toggle('is-failed', state.failed);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    selectTab(tabs[nextIndex]);
  });
});

const copyButton = document.getElementById('copy-code') as HTMLButtonElement | null;
copyButton?.addEventListener('click', async () => {
  const code = document.getElementById('install-code')?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(code);
    copyButton.textContent = 'Copied';
    text('copy-status', 'Code copied to the clipboard.');
  } catch {
    copyButton.textContent = 'Select code';
    text('copy-status', 'Clipboard access was blocked. Select the code block to copy it.');
  }
  window.setTimeout(() => { copyButton.textContent = 'Copy code'; }, 2200);
});

const offline = document.getElementById('offline');
function updateConnection(): void { if (offline) offline.hidden = navigator.onLine; }
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
