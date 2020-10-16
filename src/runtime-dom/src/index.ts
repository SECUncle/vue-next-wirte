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
