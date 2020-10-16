/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-16 17:11:49
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-16 17:13:31
 */
import { nodeOps } from "./nodeOps";
export function render(vnode, container) {
  container._vnode = vnode;
  console.log(container, nodeOps);
  const ele = nodeOps.createElement(vnode.type);
  const textNode = nodeOps.appendElementTxt(vnode.text);
  nodeOps.insert(ele, container, null);
  nodeOps.insert(textNode, ele, null);
}

// patch(n1,n2,container){

// }
