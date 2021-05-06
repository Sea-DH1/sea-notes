(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{356:function(t,s,a){t.exports=a.p+"assets/img/event-loop.8e70cfe2.png"},372:function(t,s,a){"use strict";a.r(s);var n=a(45),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"javascript数据结构与算法"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#javascript数据结构与算法"}},[t._v("#")]),t._v(" JavaScript数据结构与算法")]),t._v(" "),n("h2",{attrs:{id:"栈"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#栈"}},[t._v("#")]),t._v(" 栈")]),t._v(" "),n("div",{staticClass:"custom-block tip"},[n("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),n("p",[t._v("栈的场景")])]),t._v(" "),n("h3",{attrs:{id:"_1、什么是栈"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1、什么是栈"}},[t._v("#")]),t._v(" 1、什么是栈？")]),t._v(" "),n("ul",[n("li",[t._v("栈是一个后进先出的数据结构")]),t._v(" "),n("li",[t._v("javascript 中没有栈，但可以用Array实现栈的所有功能")]),t._v(" "),n("li",[t._v("栈常用操作：push、pop、stack[stack.length - 1]")]),t._v(" "),n("li",[t._v("特性：后进先出")])]),t._v(" "),n("h3",{attrs:{id:"_2、函数调用堆栈"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_2、函数调用堆栈"}},[t._v("#")]),t._v(" 2、函数调用堆栈")]),t._v(" "),n("p",[t._v("理解函数的调用顺序")]),t._v(" "),n("h2",{attrs:{id:"队列"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#队列"}},[t._v("#")]),t._v(" 队列")]),t._v(" "),n("div",{staticClass:"custom-block tip"},[n("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),n("ul",[n("li",[t._v("生活场景：食堂打饭。")]),t._v(" "),n("li",[t._v("code：Event Loop")])])]),t._v(" "),n("h3",{attrs:{id:"_1、队列是什么"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1、队列是什么"}},[t._v("#")]),t._v(" 1、队列是什么？")]),t._v(" "),n("ul",[n("li",[t._v("一个先进先出的数据结构，并有序的。")]),t._v(" "),n("li",[t._v("javascript 中没有队列，但可以用Array实现队列的所有功能")]),t._v(" "),n("li",[t._v("js是单线程，无法同时处理异步中的并发任务")]),t._v(" "),n("li",[t._v("使用任务队列先后处理异步任务")]),t._v(" "),n("li",[t._v("特性：先进先出")])]),t._v(" "),n("div",{staticClass:"language-js extra-class"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" queue "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nqueue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 入列")]),t._v("\nqueue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 入列")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" item1 "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" queue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("shift")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 出列  item1 = 1")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" item2 "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" queue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("shift")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 出列  item2 = 2")]),t._v("\n")])])]),n("h3",{attrs:{id:"_2、异步队列"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_2、异步队列"}},[t._v("#")]),t._v(" 2、异步队列")]),t._v(" "),n("div",{staticClass:"language-js extra-class"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setTimeout")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" console"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nconsole"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),n("p",[n("strong",[t._v("事件循环与任务队列")]),t._v("：")]),t._v(" "),n("ol",[n("li",[t._v("一段js代码刚执行的时候，会有一个主事件，因为js引擎是单线程的")]),t._v(" "),n("li",[t._v("可以用如下图表示")])]),t._v(" "),n("p",[n("img",{attrs:{src:a(356),alt:"事件循环与任务队列"}})])])}),[],!1,null,null,null);s.default=e.exports}}]);