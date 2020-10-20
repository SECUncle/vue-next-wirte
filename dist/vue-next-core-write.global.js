var Vue = (function (exports) {
  'use strict';

  /*
   * @Description:
   * @Version: 2.0
   * @Autor: wangyaju
   * @Date: 2020-10-16 16:08:51
   * @LastEditors: wangyaju
   * @LastEditTime: 2020-10-20 14:58:19
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
      setElementText: function (el, text) {
          el.textContent = text;
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
   * @Date: 2020-10-16 15:25:15
   * @LastEditors: wangyaju
   * @LastEditTime: 2020-10-20 15:49:58
   */
  var activeEffect;
  function effect(fn) {
      activeEffect = fn;
      fn();
  }
  function reactive(target) {
      return new Proxy(target, {
          get: function (target, key, receiver) {
              var res = Reflect.get(target, key, receiver);
              track(target, key);
              return res;
          },
          set: function (target, key, value, receiver) {
              var res = Reflect.set(target, key, value, receiver);
              trigger(target, key);
              return res;
          }
      });
  }
  var targetMap = new WeakMap();
  function track(target, key) {
      var depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()));
      }
      var deps = depsMap.get(key);
      if (!deps) {
          depsMap.set(key, (deps = new Set()));
      }
      if (activeEffect && !deps.has(activeEffect)) {
          deps.add(activeEffect);
      }
  }
  function trigger(target, key, val) {
      var depsMap = targetMap.get(target);
      if (!depsMap)
          return;
      var effects = depsMap.get(key);
      effects && effects.forEach(function (effect) { return effect(); });
  }

  /*
   * @Description:
   * @Version: 2.0
   * @Autor: wangyaju
   * @Date: 2020-10-16 17:18:41
   * @LastEditors: wangyaju
   * @LastEditTime: 2020-10-20 17:37:10
   */
  var rootContainer;
  function render(vnode, container) {
      patch(container._vnode || null, vnode, container);
      container._vnode = vnode; // 下载渲染时，container._vnode就成为旧节点
  }
  var patch = function (n1, n2, container) {
      if (typeof n2.type === "string") {
          processElement(n1, n2, container);
      }
      else if (typeof n2.type === "object") {
          mountComponent(n2, container);
      }
  };
  var mountComponent = function (vnode, container) {
      var instance = {
          vnode: vnode,
          type: vnode.type,
          render: null,
          subTree: null
      };
      //TODO
      var Component = instance.type;
      instance.render = Component.setup();
      effect(function () {
          instance.subTree = instance.render && instance.render();
          if (container === rootContainer) {
              container.childNodes[0] && nodeOps.remove(container.childNodes[0]);
          }
          patch(null, instance.subTree, container);
      });
  };
  var processElement = function (n1, n2, container) {
      if (n1 === null) {
          mountElement(n2, container);
      }
      else {
          patchElement(n1, n2);
      }
  };
  var mountElement = function (vnode, container) {
      var type = vnode.type, props = vnode.props, children = vnode.children;
      var el = (vnode.el = nodeOps.createElement(type));
      if (props) {
          for (var key in props) {
              hostPatchProps(el, key, null, props[key]);
          }
      }
      if (typeof children === "string") {
          nodeOps.setElementText(el, children);
      }
      else if (Array.isArray(children)) {
          mountChildren(children, el);
      }
      nodeOps.insert(el, container, null);
  };
  var patchElement = function (n1, n2, container) {
      var el = (n2.el = n1.el);
      var oldProps = n1.props;
      var newProps = n2.props;
      patchProps(el, n2, oldProps, newProps);
      patchChildren(n1, n2, el);
  };
  var patchProps = function (el, n2, oldProps, newProps) {
      if (oldProps !== newProps) {
          // 新的属性有，就渲染
          for (var key in newProps) {
              var next = newProps[key];
              var prev = oldProps[key];
              if (next !== prev) {
                  hostPatchProps(el, key, prev, next);
              }
          }
          // 旧的属性有，新属性没有，就删除
          for (var key in oldProps) {
              if (!(key in newProps)) {
                  hostPatchProps(el, key, oldProps[key], null);
              }
          }
      }
  };
  var patchChildren = function (n1, n2, container) {
      var c1 = n1 && n1.children;
      var c2 = (n2 = n2.children);
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
      }
      else {
          if (typeof c1 === "string") {
              nodeOps.setElementText(container, "");
              mountChildren(c2, container);
          }
          // array => array
          // TODO
          patchKeyedChildren(c1, c2, container);
      }
  };
  var move = function (vnode, container, anchor) {
      nodeOps.insert(vnode.el, container, anchor);
  };
  var mountChildren = function (children, container) {
      for (var i = 0; i < children.length; i++) {
          var child = children[i];
          patch(null, child, container);
      }
  };
  var unmountChildren = function (children) {
      for (var i = 0; i < children.length; i++) {
          unmount(children[i]);
      }
  };
  var unmount = function (child) {
      nodeOps.remove(child.el);
  };
  var onRe = /^on[^a-z]/;
  var isOn = function (key) { return onRe.test(key); };
  var hostPatchProps = function (el, key, prev, next) {
      // 处理事件属性 onClick
      if (isOn(key)) {
          var name_1 = key.slice(2).toLowerCase();
          prev && el.removeEventListener(name_1, prev);
          next && el.addEventListener(name_1, next);
      }
      else {
          // 其他属性
          if (next === null) {
              el.removeAttribute(key);
          }
          else {
              el.setAttribute(key, next);
          }
      }
  };
  var patchKeyedChildren = function (c1, c2, container) {
      var i;
      var e1 = c1.length - 1;
      var e2 = c2.length - 1;
      var keyToNewIndexMap = new Map();
      for (i = 0; i <= e2; i++) {
          var nextChild = c2[i];
          keyToNewIndexMap.set(nextChild.props.key, i);
      }
      var newIndexToOldIndexMap = new Array(e2 + 1);
      for (i = 0; i <= e2; i++)
          newIndexToOldIndexMap[i] = -1;
      for (i = 0; i <= e1; i++) {
          var prevChild = c1[i];
          var newIndex = keyToNewIndexMap.get(prevChild.props.key);
          if (newIndex === undefined) {
              // 删除
              unmount(prevChild);
          }
          else {
              newIndexToOldIndexMap[newIndex] = i;
              // 更新，但不移动位置
              patch(prevChild, c2[newIndex], container);
          }
      }
      var sequence = getSequence(newIndexToOldIndexMap);
      var j = sequence.length - 1;
      for (i = e2; i >= 0; i--) {
          var newChild = c2[i];
          var anchor = i + 1 <= e2 ? c2[i + 1].el : null;
          if (newIndexToOldIndexMap[i] === -1) {
              // 新增
              patch(null, newChild, container);
          }
          else {
              if (i == sequence[j]) {
                  j--;
              }
              else {
                  move(newChild, container, anchor);
              }
          }
      }
  };
  // https://leetcode-cn.com/problems/longest-increasing-subsequence/
  var getSequence = function (arr) {
      var p = arr.slice();
      // 子序列的索引 [0,1,3,5]
      var result = [0];
      var i, j, u, v, c;
      var len = arr.length;
      for (i = 0; i < len; i++) {
          var arrI = arr[i];
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
              }
              else {
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

  exports.effect = effect;
  exports.reactive = reactive;
  exports.render = render;

  return exports;

}({}));
//# sourceMappingURL=vue-next-core-write.global.js.map
