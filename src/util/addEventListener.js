export default function addEventListener(el, type, cb) {
  el.addEventListener(type, cb);
  return {
    remove: () => {
      el.removeEventListener(type, cb);
    }
  }
}
