let visible = false;
const listeners = new Set();

function subscribe(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  // push current state to new subscriber
  try { listener(visible); } catch (_) {}
  return () => listeners.delete(listener);
}

function set(next) {
  const v = !!next;
  if (v === visible) return; 
  visible = v;
  // notify safely
  listeners.forEach(fn => {
    try { fn(visible); } catch (_) {}
  });
}

function get() {
  return visible;
}

function reset() {
  visible = false;
  listeners.clear();
}

const UpdateGate = { get, set, subscribe, reset };
export default UpdateGate;
