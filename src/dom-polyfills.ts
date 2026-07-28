if (typeof window !== 'undefined' && typeof Node !== 'undefined' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function safeRemoveChild<T extends Node>(child: T): T {
    try {
      return originalRemoveChild.call(this, child) as T;
    } catch (err) {
      if (
        (err as Error).name === 'NotFoundError' ||
        (err as Error).message?.includes?.('removeChild') &&
          (err as Error).message?.includes?.('不是此节点的子节点')
      ) {
        if (typeof console !== 'undefined') {
          console.warn('[polyfill] 忽略 removeChild 子节点不存在异常：', (err as Error).message);
        }
        return child;
      }
      throw err;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function safeInsertBefore<T extends Node>(newNode: T, referenceNode: Node | null): T {
    try {
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } catch (err) {
      if (
        (err as Error).name === 'NotFoundError' ||
        (err as Error).message?.includes?.('insertBefore')
      ) {
        if (typeof console !== 'undefined') {
          console.warn('[polyfill] 忽略 insertBefore 异常，尝试 fallback 为 appendChild：', (err as Error).message);
        }
        this.appendChild(newNode);
        return newNode;
      }
      throw err;
    }
  };
}
