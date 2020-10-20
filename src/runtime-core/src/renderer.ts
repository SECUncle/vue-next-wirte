/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-16 17:18:41
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-20 17:37:10
 */
import { nodeOps } from "../../runtime-dom/src/nodeOps";
import { effect } from "../../reactivity/src/index";
let rootContainer;

export function render(vnode, container) {
  patch(container._vnode || null, vnode, container);
  container._vnode = vnode; // 下载渲染时，container._vnode就成为旧节点
}

const patch = (n1, n2, container) => {
  if (typeof n2.type === "string") {
    processElement(n1, n2, container);
  } else if (typeof n2.type === "object") {
    mountComponent(n2, container);
  }
};

const mountComponent = (vnode, container) => {
  const instance = {
    vnode,
    type: vnode.type,
    render: null,
    subTree: null
  };
  //TODO
  const Component = instance.type;
  instance.render = Component.setup();

  effect(() => {
    instance.subTree = instance.render && instance.render();
    if (container === rootContainer) {
      container.childNodes[0] && nodeOps.remove(container.childNodes[0]);
    }
    patch(null, instance.subTree, container);
  });
};

const processElement = (n1, n2, container) => {
  if (n1 === null) {
    mountElement(n2, container);
  } else {
    patchElement(n1, n2, container);
  }
};
const mountElement = (vnode, container) => {
  const { type, props, children } = vnode;
  let el = (vnode.el = nodeOps.createElement(type));
  if (props) {
    for (const key in props) {
      hostPatchProps(el, key, null, props[key]);
    }
  }
  if (typeof children === "string") {
    nodeOps.setElementText(el, children);
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }
  nodeOps.insert(el, container, null);
};

const patchElement = (n1, n2, container) => {
  const el = (n2.el = n1.el);
  const oldProps = n1.props;
  const newProps = n2.props;

  patchProps(el, n2, oldProps, newProps);
  patchChildren(n1, n2, el);
};

const patchProps = (el, n2, oldProps, newProps) => {
  if (oldProps !== newProps) {
    // 新的属性有，就渲染

    for (const key in newProps) {
      const next = newProps[key];
      const prev = oldProps[key];
      if (next !== prev) {
        hostPatchProps(el, key, prev, next);
      }
    }
    // 旧的属性有，新属性没有，就删除

    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProps(el, key, oldProps[key], null);
      }
    }
  }
};
const patchChildren = (n1, n2, container) => {
  const c1 = n1 && n1.children;
  const c2 = (n2 = n2.children);
  if (typeof c2 === "string") {
    // array => string
    if (Array.isArray(c1)) {
      unmountChildren(c1);
    }
    // string => string
    if (c1 !== c2) {
      nodeOps.setElementText(container, c2);
      mountChildren(c2, container);
    }
  } else {
    if (typeof c1 === "string") {
      nodeOps.setElementText(container, "");
      mountChildren(c2, container);
    }

    // array => array
    // TODO
    patchKeyedChildren(c1, c2, container);
  }
};

const move = (vnode, container, anchor) => {
  nodeOps.insert(vnode.el, container, anchor);
};
const mountChildren = (children, container) => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    patch(null, child, container);
  }
};

const unmountChildren = children => {
  for (let i = 0; i < children.length; i++) {
    unmount(children[i]);
  }
};

const unmount = child => {
  nodeOps.remove(child.el);
};

const onRe = /^on[^a-z]/;
const isOn = key => onRe.test(key);
const hostPatchProps = (el, key, prev, next) => {
  // 处理事件属性 onClick
  if (isOn(key)) {
    const name = key.slice(2).toLowerCase();
    prev && el.removeEventListener(name, prev);
    next && el.addEventListener(name, next);
  } else {
    // 其他属性
    if (next === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, next);
    }
  }
};

const patchKeyedChildren = (c1, c2, container) => {
  let i;
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;
  const keyToNewIndexMap = new Map();
  for (i = 0; i <= e2; i++) {
    const nextChild = c2[i];
    keyToNewIndexMap.set(nextChild.props.key, i);
  }

  const newIndexToOldIndexMap = new Array(e2 + 1);
  for (i = 0; i <= e2; i++) newIndexToOldIndexMap[i] = -1;
  for (i = 0; i <= e1; i++) {
    const prevChild = c1[i];
    let newIndex = keyToNewIndexMap.get(prevChild.props.key);
    if (newIndex === undefined) {
      // 删除
      unmount(prevChild);
    } else {
      newIndexToOldIndexMap[newIndex] = i;
      // 更新，但不移动位置
      patch(prevChild, c2[newIndex], container);
    }
  }

  const sequence = getSequence(newIndexToOldIndexMap);
  let j = sequence.length - 1;
  for (i = e2; i >= 0; i--) {
    const newChild = c2[i];

    const anchor = i + 1 <= e2 ? c2[i + 1].el : null;
    if (newIndexToOldIndexMap[i] === -1) {
      // 新增
      patch(null, newChild, container);
    } else {
      if (i == sequence[j]) {
        j--;
      } else {
        move(newChild, container, anchor);
      }
    }
  }
};

// https://leetcode-cn.com/problems/longest-increasing-subsequence/

const getSequence = arr => {
  const p = arr.slice();
  // 子序列的索引 [0,1,3,5]
  const result = [0];

  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    // 在末尾插入数据
    j = result[result.length - 1];
    if (arr[j] < arrI) {
      p[i] = j;
      result.push(i);
      continue;
    }
    // 更新数组
    u = 0;
    v = result.length - 1;
    while (u < v) {
      c = ((u + v) / 2) | 0;
      if (arr[result[c]] < arrI) {
        u = c + 1;
      } else {
        v = c;
      }
    }
    if (u > 0) {
      p[i] = result[u - 1];
    }
    result[u] = i;
  }

  u = result.length - 1;
  v = result[u];
  while (u >= 0) {
    result[u] = v;
    v = p[v];
    u--;
  }

  return result;
};
