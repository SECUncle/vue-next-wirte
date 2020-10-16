var Vue = (function (exports) {
  'use strict';

  /*
   * @Description:
   * @Version: 2.0
   * @Autor: wangyaju
   * @Date: 2020-10-16 15:25:15
   * @LastEditors: wangyaju
   * @LastEditTime: 2020-10-16 15:34:53
   */
  function effect(fn) {
      fn();
  }

  /*
   * @Description:
   * @Version: 2.0
   * @Autor: wangyaju
   * @Date: 2020-10-16 15:33:52
   * @LastEditors: wangyaju
   * @LastEditTime: 2020-10-16 15:34:41
   */
  function reactive(fn) {
      fn();
  }

  /*
   * @Description:
   * @Version: 2.0
   * @Autor: wangyaju
   * @Date: 2020-10-16 16:08:51
   * @LastEditors: wangyaju
   * @LastEditTime: 2020-10-16 17:04:38
   */
  var nodeOps = {
      insert: function (child, parent, anchor) {
          if (anchor) {
              parent.insertBefore(child, anchor);
              return;
          }
          parent.appendChild(child);
      },
      remove: function (child) {
          var parent = child.parentNode;
          if (parent) {
              parent.removeChild(child);
          }
      },
      createElement: function (type) {
          var ele = document.createElement(type);
          return ele;
      },
      appendElementTxt: function (text) {
          var textNode = document.createTextNode(text);
          return textNode;
      }
  };

  /*
   * @Description:
   * @Version: 2.0
   * @Autor: wangyaju
   * @Date: 2020-10-16 17:11:49
   * @LastEditors: wangyaju
   * @LastEditTime: 2020-10-16 17:13:31
   */
  function render(vnode, container) {
      container._vnode = vnode;
      console.log(container, nodeOps);
      var ele = nodeOps.createElement(vnode.type);
      var textNode = nodeOps.appendElementTxt(vnode.text);
      nodeOps.insert(ele, container, null);
      nodeOps.insert(textNode, ele, null);
  }
  // patch(n1,n2,container){
  // }

  exports.effect = effect;
  exports.reactive = reactive;
  exports.render = render;

  return exports;

}({}));
//# sourceMappingURL=vue-next-core-write.global.js.map
