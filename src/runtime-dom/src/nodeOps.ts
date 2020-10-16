/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-16 16:08:51
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-16 17:21:37
 */
export const nodeOps = {
  insert: (child, parent, anchor) => {
    if (anchor) {
      parent.insertBefore(child, anchor);
      return;
    }
    parent.appendChild(child);
  },
  remove: child => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (type): Element => {
    const ele = document.createElement(type);
    return ele;
  },
  appendElementTxt: text => {
    const textNode = document.createTextNode(text);
    return textNode;
  }
};
