class Compile {
  /**
   * 构造函数
   * @param {字符串或者DOM元素} el 
   * @param {vm自己的实例}} vm 
   */
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm 

    // 元素存在才开始编译
    if(this.el) {
      // 1. 把真实元素的DOM 移入内存fragment 
      let fragment = this.node2Fragment(this.el)
      // 2. 编译=> 提取想要的元素节点v-model 和文本节点{{}}
      this.compile(fragment)
      // 3. 把编译号的fragment放回页面中
      this.el.appendChild(fragment)
    }
  }
  // 辅助方法
  isElementNode(node) {
    return node.nodeType === 1
  }

  // 核心方法
  node2Fragment(el) {
    let fragment = document.createDocumentFragment()
    let firstChild
    while(firstChild = el.firstChild) {
      fragment.appendChild(firstChild)
    }
    return fragment // 内存中的节点 
  }
  isDirective(name) {
    return name.includes('v-')
  }
  compileElement(node) {
    // 带v-model
    let attrs = node.attributes; 
    // NamedNodeMap可以打出键值对
    Array.from(attrs).forEach(attr=> {
      // 属性名字v-
      let attrName = attr.name
      if(this.isDirective(attrName)) {
        // 取到对应的值放到节点中
        let expr = attr.value
        // node this.$vm.$data
        // let type = attrName.slice(2)
        let [,type] = attrName.split('-')
        console.log(type)
        CompileUtil[type](node, this.vm, expr)
      }
    })
  }
  compileText(node) {
    let reg = /\{\{([^}]+)\}\}/g
    let expr = node.textContent 
    if(reg.test(expr)) {
      CompileUtil['text'](node, this.vm, expr)
    }
  }
  compile(fragment) {
    let childNodes = fragment.childNodes
    Array.from(childNodes).forEach(node => {
      if(this.isElementNode(node)) {
        // 元素节点 递归检查
        // 编译元素
        this.compileElement(node)
        this.compile(node)

      } else {
        // 文本节点
        // 编译文本
        this.compileText(node)
      }
    })
  }
}

// 编译指令
CompileUtil = {
  getVal(vm, expr) { // 获取实例上对应的数据
    expr = expr.split('.')
    return expr.reduce((prev, next)=> { //[c,s,a,c]
      return prev[next]
    }, vm.$data)

  },
  getTextVal(vm, expr) {
    expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=> {
      // 通过{{}} 里面的内容去获取获取vm中data的值 然后把它赋值回去
      return this.getVal(vm, arguments[1])
    })
  },
  text(node, vm, expr) { // 文本
    // console.log(expr)
    let updateFn = this.updater['textUpdater']
    let value = this.getTextVal(vm, expr)
    updateFn && updateFn(node, value)
  },
  model(node,vm, expr) { // 输入框
    let updateFn = this.updater['modelUpdater']

    updateFn && updateFn(node, this.getVal(vm,expr))
  },
  updater: {
    // 文本更新
    textUpdater(node, value) {
      node.textContent = value
    },
    // 输入框赋值
    modelUpdater(node, value) {
      node.value = value 
    }
  }
}