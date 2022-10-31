export const h = (tag: string, props?: any, ...child: Array<HTMLElement | String>) => {
  const el = document.createElement(tag)

  child.forEach(c => {
    if (typeof c === 'string') el.innerHTML = c
    else if (c instanceof HTMLElement) el.append(c)
  })

  return el
}

// https://github.com/nanojsx/nano/blob/master/src/helpers.ts
function isDescendant(desc: ParentNode | null, root: Node): boolean {
  // @ts-ignore
  return !!desc && (desc === root || isDescendant(desc.parentNode, root))
}

// https://github.com/nanojsx/nano/blob/master/src/helpers.ts
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
export const onNodeRemove = (element: HTMLElement, callback: () => void) => {
  let observer = new MutationObserver(mutationsList => {
    mutationsList.forEach(mutation => {
      mutation.removedNodes.forEach(removed => {
        if (isDescendant(element, removed)) {
          callback()
          if (observer) {
            // allow garbage collection
            observer.disconnect()
            // @ts-ignore
            observer = undefined
          }
        }
      })
    })
  })
  observer.observe(document, {
    childList: true,
    subtree: true
  })
  return observer
}
