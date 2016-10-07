const globalStore = {};
function reloadStore(key) {
  if (globalStore[key] === undefined) {
    globalStore[key] = {};
  }
  return globalStore[key];
}

const runOnce = (fn, name) => {
  if (!reloadStore("runOnce")[name]) 
    fn()

  reloadStore("runOnce")[name] = true
}

export { reloadStore, runOnce }
