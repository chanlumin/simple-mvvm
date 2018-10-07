class MVVM {
  constructor(options) {
    // 先把可用的东西挂在实例上 
    this.$el = options.el 
    this.$data = options.data 

    // 如果有需要编译的模板,就开始编译
    if(this.$el) {
      // 用数据和元素
      new Compile(this.$el, this)
    }

  }

}

// export default MVVM