export function addEventListener<K extends keyof DocumentEventMap>(el: Document, type: K, listener: (this: Element, ev: DocumentEventMap[K]) => any): {remove: () => void}
export function addEventListener<K extends keyof ElementEventMap>(el: Element | Document, type: K, listener: (this: Element, ev: ElementEventMap[K]) => any) {
  el.addEventListener(type, listener);
  return {
    remove: () => {
      el.removeEventListener(type, listener);
    }
  };
}
