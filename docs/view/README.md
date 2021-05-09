---
sidebar: auto
sidebarDepth: 2
---

# JavaScript基础知识

<!-- bind的实现 -->
## bind的实现  
### bind是什么？  
一句话介绍bind:  
> `bind()`方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行平时的this，之后的序列参数将会在传递的实参前传入作为它的参数，供调用时使用。（来自于[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)）  
由此可以首先得出`bind`函数的两个特点：  
1、返回一个函数  
2、可以传入参数

### 返回函数的模拟实现  
从第一个特点开始，举个例子：  
```js
var foo = {
  value: 1
};

function bar() {
  console.log(this.value);
}

// 返回了一个函数
var bindFoo = bar.bind(foo);

bindFoo(); // 1
```

关于指定`this`的指向，可以使用`call`或者`apply`实现。    
```js
// 第一版代码
Function.prototype.bind2 = function(context) {
  var self = this;
  return function() {
    return self.apply(context);
  }
}
```  
此外，之所以`return self.apply(context)`，是考虑到绑定函数可能是有返回值的，依然是这个例子：  
```js
var foo = {
  value: 1
};

function bar() {
  return this.value;
}

var bindFoo = bar.bind(foo);

console.log(bindFoo()); // 1
```

### 传参的模拟实现  
接下来看第二点，可以传入参数。这个就有点让人费解了，我在`bind`的时候，是否可以传参呢？我在执行`bind`返回的函数的时候，可不可以传参呢？接下来看个例子：  
```js
var foo = {
  value: 1
};

function bar(name, age) {
  console.log(this.value);
  console.log(name);
  console.log(age);
}

var bindFoo = bar.bind(foo, 'xiaoming');
bindFoo(18);
// 1
// xiaoming
// 18
```

函数需要传`name`和`age`两个参数，竟然还可以在`bind`的时候，只传一个`name`，在执行返回的函数的时候，再传另一个参数`age!`这可咋办？不急，可以用`arguments`进行处理：  
```js
// 第二版
Function.prototype.bind2 = function () {
  var self = this;
  // 获取bind2函数从第二个参数到最后一个参数
  var args = Array.prototype.slice.call(arguments, 1);

  return function () {
    // 这个时候的arguments是指bind返回的函数传入的参数
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(context, args.concat(bindArgs));
  }
}
```

### 构造函数效果的模拟实现  
完成了这两点，最难的部分到了！因为`bind`还有一个特点，就是：  
> 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的this值被忽略，同时调用时的参数被提供给模拟函数。

也就是说当`bind`返回的函数作为构造函数的时候，`bind`时指定的`this`值会失效，但传入的参数依然生效。举个例子：  
```js
var value = 2;

var foo = {
  value: 1
};

function bar(name, age) {
  this.habit = 'shopping';
  console.log(this.value);
  console.log(name);
  console.log(age);
}

bar.prototype.friend = 'xiaoming';

var bindFoo = bar.bind(foo, 'xiaohong')；

var obj = new bindFoo(18);
// undefined
// xiaohong
// 18
console.log(obj.habit);n
console.log(obj.friend);
// shopping
// xiaoming
```

::: warning
注意：尽管在全局和foo中都声明了value值，最后依然返回了undefined，说明绑定的this失效了，如果了解new的模拟实现，就会知道这个时候的this已经指向了obj。
:::

所以可以通过修改返回的函数的原型来实现：  
```js
// 第三版
Function.prototype.bind2 = function(context) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);

  var fBound = function() {
    var bindArgs = Array.prototype.slice.call(arguments);
    // 当作为函数时，this指向实例，此时结果为true，将绑定函数的this指向该实例，可以让实例获得来自绑定函数的值。
    // 以上的都是demo为例，如果改成 `this instanceof fBound ? null : context`，实例只是一个空对象，将null改成this, 实例会具有habit属性
    // 当作为普通函数时，this指向window，此时结果为false，将绑定函数的this指向context
    return self.apply(this.instanceof fBound ? this : context, args.concat(bindArgs));
  }
  // 修改返回函数的prototype为绑定函数的prototype，实例就可以继承绑定函数的原型中的值
  fBound.prototype = this.prototype;
  return fBound;
}
```

### 构造函数效果的优化实现  
但是在这个写法中，直接将`fBound.prototype = this.prototype`，可以直接修改`fBound.prototype`的时候，也会直接修改绑定函数的`prototype`。这个时候，可以通过一个空函数来进行中转：  
```js
// 第四版
Function.prototype.bind2 = function(context) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);

  var fNOP = function () {};

  var fBound = function () {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
  }

  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
}
```

### 两个小问题  
接下来处理些小问题  
#### 1、调用bind的不是函数怎么办？  
要给出报错：  
```js
if (typeof this != "function") {
  throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
}
```  
#### 2、在线上使用  
别忘了做个兼容  
```js
Function.prototype.bind = Function.prototype.bind || function () {
  .....
}
```  

### 最终代码  
```js
Function.prototype.bind2 = function(context) {
  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable")；
  }

  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);

  var fNOP = function() {};

  var fBound = function () {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(this. instanceof fNOP ? this : context, args.concat(bindArgs));
  }

  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
}
```
***

## new操作符的原理和实现  
### new是什么？  
一句话介绍new：  
> new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一  
也许有点难懂，在模拟`new`之前，先看看`new`实现了哪些功能。

举个例子：  
```js
// Otaku 
function Otaku(name, age) {
  this.name = name;
  this.age = age;

  this.habit = 'Games';
}

Otaku.prototype.strength = 60;
Otaku.prototype.sayYourName = function () {
  console.log('I am' + this.name);
}

var person = new Otaku('xiaoming', 18);

console.log(person.name) // xiaoming
console.log(person.habit) // 'Games'
console.log(person.strength) // 60

person.sayYourName(); // I am xiaoming
```  
从这个例子中，可以看到，实例`person`可以：  
1、访问到`Otaku`构造函数里的属性  
2、访问到`Otaku.prototype`中的属性

接下来，可以尝试着模拟一下了。

因为`new`是关键字，所以无法像bind函数一样直接覆盖，所以写一个函数，命名为`objectFactory`，来模拟`new`的效果。用的时候是这样的：  
```js
function Otaku() {
  .....
}

// 使用 new
var person = new Otaku(.....);
var person = objectFactory(Otaku, .....);
```

### 初步实现  
分析：  
因为`new`的结果是一个新对象，所以在模拟实现的时候，也要建立一个新对象，假设这个对象叫`obj`，因为`obj`会具有`Otaku`构造函数里面的属性，想想经典继承的例子，可以使用`Otaku.apply(obj, arguments)`来给`obj`添加新的属性。

现在，我们可以尝试着写第一版了：  
```js
// 第一版代码
function objectFactory() {
  var obj = new Object(),
  Constructor = [].shift.call(arguments);

  obj.__proto__ = Constrcutor.prototype;
  Constructor.apply(obj, arguments);

  return obj;
};
```  
在这一版中，我们：  
1、用`new Object()`的方式新建了一个对象`obj`  
2、取出第一个参数，就是我们要传入的构造函数。此外因为`shift`会修改原数组，所以`arguments`会被去除第一个参数  
3、将`obj`的原型指向构造函数，这样`obj`就可以用访问到构造函数原型中的属性  
4、使用`apply`，改变构造函数`this`的指向到新建的对象，这样`obj`就可以访问到构造函数的属性  
5、返回`obj`

复制以下的代码，到浏览器中，我们可以做一下测试：  
```js
function Otaku (name, age) {
    this.name = name;
    this.age = age;

    this.habit = 'Games';
}

Otaku.prototype.strength = 60;

Otaku.prototype.sayYourName = function () {
    console.log('I am ' + this.name);
}

function objectFactory() {
    var obj = new Object(),
    Constructor = [].shift.call(arguments);
    obj.__proto__ = Constructor.prototype;
    Constructor.apply(obj, arguments);
    return obj;
};

var person = objectFactory(Otaku, 'xiaoming', '18')

console.log(person.name) // xiaoming
console.log(person.habit) // Games
console.log(person.strength) // 60

person.sayYourName(); // I am xiaoming
```

### 返回值效果实现  
接下来再来看一种情况，假如构造函数有返回值，举个例子：  
```js
function Otaku (name, age) {
  this.strength = 60;
  this.age = age;

  return {
    name: name,
    habit: 'Games'
  }
}

var person = new Otaku('xiaoming', 18);

console.log(person.name) // xiaoming
console.log(person.habit) // Games
console.log(person.strength) // undefined
console.log(person.age) // undefined
```  
在这个例子中，构造函数返回了一个对象，在实例`person`中只能访问返回的对象中的属性。
而且还要注意一点，在这里是返回了一个对象，假如只是返回一个基本类型的值呢？  
再举个例子：  
```js
function Otaku(name, age) {
  this.strength = 60;
  this.age = age;

  return 'handsome boy';
}

var person = new Otaku('xiaoming', 18);

console.log(person.name) // undefined
console.log(person.habit) // undefined
console.log(person.strength) // 60
console.log(person.age) // 18
```  
结果完全颠倒过来，这次尽管有返回值，但是相当于没有返回值进行处理。  
所以我们还需要判断返回的值是不是一个对象，如果是一个对象，就返回这个对象，如果没有，该返回什么就返回什么。  
再来看第二版的代码，也是最后一版的代码：  
```js
// 第二版代码
function objectFactory() {
  var obj = new Object(),
  Constructor = [].shift.call(arguments);
  obj.__proto__ = Constructor.prototype;
  var ret = Constructor.apply(obj, arguments);
  return typeof ret === 'object' ? ret : obj;
}
```

***

## apply和call  
### call是什么？
一句话介绍`call`  
> call()方法在使用一个指定的this值和若干个指定的参数值的前提下调用某个函数或方法。  

举个例子：  
```js
var foo = {
  value: 1
};

function bar () {
  console.log(this.value);
}

bar.call(foo) // 1
```  
注意两点：  
1、`call`改变了`this`的指向，指向到`foo`  
2、`bar`函数执行了

### 模拟实现第一步  
那么该怎么模拟实现这两个效果呢？  
试想当调用call的时候，把`foo`对象改造成如下：  
```js
var foo = {
  value: 1,
  bar: function() {
    console.log(this.value)
  }
};

foo.bar(); // 1
```  
这个时候`this`就指向了`foo`，是不是很简单呢？  
但是这样却给`foo`对象本身添加了一个属性，这不符合预期！  
不过也不用担心，用delete再删除它不就好了~  
所以模拟的步骤可以分为：  
1、将函数设为对象的属性  
2、执行该函数  
3、删除该函数

以上个例子为例，就是：  
```js
// 第一步
foo.fn = bar
// 第二步
foo.fn()
// 第三步
delete foo.fn
```  
`fn`是对象的属性名，反正最后也要删除它，所以起成什么都无所谓。  
根据这个思路，可以尝试着去写第一版的`call2`函数：  
```js
// 第一版
Function.prototype.call2 = function(context) {
  // 首先要获取调用call的函数，用this可以获取
  context.fn = this;
  context.fn();
  delete context.fn;
}

// 测试一下
var foo = {
  value: 1
}

function bar () {
  console.log(this.value);
}

bar.call2(foo); // 1
```  
正好可以打印`1`，是不是很开心~  

### 模拟实现第二步  
从一开始也讲了，`call`函数还能给定参数执行函数。举个例子：  
```js
var foo = {
  value: 1
};

function bar(name, age) {
  console.log(name);
  console.log(age);
  console.log(this.value);
}

bar.call(foo, 'xiaoming', 18);
// xiaoming
// 18
// 1
```  
::: warning
注意：传入的参数并不确定，这可咋办？  
不急，可以从Arguments对象中取值，取出第二个到最后一个参数，然后放到一个数组里。
:::  
比如这样：   
```js
// 以上个例子为例，此时的arguments为：
// arguments = {
//   0: foo,
//   1: 'xiaoming',
//   2: 18,
//   length: 3
// }
// 因为arguments是类数组对象，所以可以用for循环
var args = [];
for (var i = 1, len = arguments.length; i < len; i++>) {
  args.push(`arguments[${i}]`);
}

// 执行后args为【“arguments[1]”, “arguments[2]”, “arguments[3]”】
```  
不确定长的参数问题解决了，接着要把这个参数数组放到要执行的函数的参数里面去。  
```js
// 将数组里面的元素作为多个参数放进函数的形参里
context.fn(args.join(','))
// ??
// 这个方法肯定是不行的！！
```  
也许有人想到用ES6的方法，不过call是ES3的方法，为了模拟实现一个ES3的方法，要用到ES6的方法，这就有点说不过去了。不过....，反正也都是学习，嘻嘻。  
这次用eval方法拼成一个函数，类似于这样：  
```js
eval('context.fn(' + args + ')')
```  
这里`args`会自动调用`Array.toString()`这个方法。  
所以第二版克服了两个大总是，代码如下：  
```js
// 第二版
Function.prototype.call2 = function(context) {
  context.fn = this;
  var args = [];
  for (var i = 1, len = arguments.length; i < len; i++) {
    args.push(`arguments[${i}]`);
  }
  eval('context.fn(' + args + ')');
  delete context.fn;
}

// 测试一下
var foo = {
  value: 1
};

function bar(name, age) {
  console.log(name)
  console.log(age)
  console.log(this.value)
}

bar.call2(foo, 'xiaoming', 18);
// xiaom
// 18
// 1
```  
模拟第二步完毕  

### 模拟实现第三步  
模拟代码已经完成80%，还有两个小点要注意：  
1、`this`参数可以传`null`，当为`null`的时候，视为指定`window`  
举个例子：  
```js
var value = 1;

function bar() {
  console.log(this.value);
}

bar.call(null) // 1
```  
虽然这个例子本身不使用call，结果依然一样。  
2、函数是可以有返回值的！  
举个例子：  
```js
var obj = {
  value: 1
}

function bar (name, ages) {
  return {
    value: this.value,
    name: name,
    age: age
  }
}

console.log(bar.call(obj, 'xiaoming', 18));
// Object {
//   value: 1,
//   name: 'xiaoming',
//   age: 18
// }
```  
不过都很好解决，直接看第三版也是就最后一版的代码：  
```js
// 第三版
Function.prototype.call2 = function (context) {
  var context = context || window;
  context.fn = this;

  var args = [];
  for (var i = 1, len = arguments.length; i < len; i++) {
    args.push(`arguments[${i}]`);
  }

  var result = eval('context.fn(' + args + ')');

  delete context.fn;
  return result;
}

// 测试一下
var value = 2;

var obj = {
  value: 1
}

function bar (name, age) {
  console.log(this.value);
  return {
    value: this.value,
    name: name,
    age: age
  }
}

bar.call2(null) // 2

console.log(bar.call2(obj, 'xiaoming', 18));
// 1
// Object {
//   value: 1,
//   name: 'xiaoming',
//   age: 18
// }
```  
到此，完成了`call`的模拟实现。

### apply的模拟实现   
`apply`的实现跟`call`类似，在这里直接给代码：  
```js
Function.prototype.apply = function (context, arr) {
  var context = Object(context) || window;
  context.fn = this;

  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = []
    for (var i = 1, len = arguments.length; i < len; i++) {
      args.push(`arguments[${i}]`);
    }
    result = eval('context.fn(' + args + ')')
  }

  delete context.fn;
  return result;
}
```

***

## 原型、原型链

### prototype

每个函数都有一个`prototype`属性，就是我们经常在各种例子中看到的那个`prototype`。  

**例子**：

```js
function Person() {

}
var person = new Person();
person.name = 'xiaoming';
console.log(person.name); // xiaoming
```

在这个例子中，`Person`就是一个构造函数，我们使用了`new`创建了一个实例对象就是`person`。

函数就是一个构造器(可以是`class`类，或者是工厂函数的叫法，`new`出来的，叫实例对象。这块知识以前都是比较模糊的，这里重点记一下笔记。)

**比如**：

```js
function Person() {

}
// prototype是函数才会有的属性
Person.prototype.name = 'xiaoming';
var person1 = new Person();
var person2 = new Person();
console.log(person1.name) // 'xiaoming'
console.log(person2.name) // 'xiaoming'
```
这个例子中的函数`prototype`属性指向了一个对象，这个对象正是调用该构造函数创建的实例的原型，也就是这个例子中的`person1`和`person2`的原型。

那么什么是原型呢？你可以这样理解：每一个`JavaScript`对象(`null`除外)在创建的时候就会与之关联另一个对象，这个对象就是我们所说的原型，每个对象都会从原型“继承”属性。

用一张图表示构造函数和实例原型之间的关系图：

![原型和原型链关系图1](../images/view/prototype1.png)

在这张图中用`Object.prototype`表示实例原型。

那么该怎么表示实例与实例原型，也就是`person`与`person.prototype`之间的关系呢，这时候我们就要讲到第二个属性：

### \_\_proto\_\_

这是每个`JavaScript`对象(除了null)都具有的一个属性，叫`__proto__`，这个属性会指向该对象的原型。  
为了证明这一点，可以在火狐或者谷歌中输入：  
```js
function Person() {

}
var person = new Person();
console.log(person.__proto__ === Person.prototype); // true
```
于是更新下原型和原型链关系图：  
![原型和原型链关系图2](../images/view/prototype2.png)

既然实例对象和构造函数都可以指向原型，那么原型是否有属性指向构造函数或者实例呢？

### constructor
指向实例倒是没有，因为一个构造函数可以生成多个实例，但是原型指向函数倒是有的，这就要讲到第三个属性：  
`constructor`，每个原型都有一个`constructor`属性指向关联的构造函数。

为了验证这一点，可以尝试：
```js
function Person() {

}
console.log(Person === Person.prototype.constructor) // true
```  
所以再更新下关系图：  
![原型和原型链关系图3](../images/view/prototype3.png)  
综上已经得出：  
```js
function Person () {

}
var person = new Person()
console.log(person.__proto__ === Person.prototype) // true
console.log(Person.prototype.constructor === Person) // true
// 顺便学习一个ES5的方法，可以获得对象的原型
console.log(Object.getPrototypeOf(person === Person.prototype)) // true
```  
了解了构造函数、实例原型和实例之间的关系，接下来讲讲实例和原型的关系

### 实例与原型

当读取实例的属性时，如果找不到，就会查找与对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层为止。

举个例子：  
```js
function Person () {

}
Person.prototype.name = 'xiaoming'

var person = new Person()
person.name = 'xiaohong'
console.log(person.name) // xiaohong

delete person.name
console.log(person.name) // xiaoming
```  
在这个例子中，给实例对象`person`添加了`name`属性，当我们打印person.name的时候，结果自然为`xiaohong`。

但是当删除了`person`的`name`属性时，读取`person.name`，从`person`对象中找不到的`name`属性就会`person`的原型也就是`person.__proto__`，也就是`Person.prototype`中查找，幸运的是我们找到了`name`属性，结果为`xiaoming`。

但是万一还没有找到呢？原型的原型又是什么呢？

### 原型的原型

在前面，已经讲了原型也是一个对象，既然是对象，就可以用最原始的方式创建它，那就是：  
```js
var obj = new Object();
obj.name = 'xiaoming';
console.log(obj.name); // xiaoming
```  
其实原型对象就是通过`Object`构造函数生成的，结合之前所讲的，实例的`__proto__`指向构造函数的`prototype`，所以再更新下关系图：  
![原型和原型链关系图4](../images/view/prototype4.png)

### 原型链

那`Object.prototype`的原型呢？

`null`，我们可以打印：  
```js
console.log(Object.prototype.__proto__ === null) // true
```  
然而`null`究竟代表了什么呢？  
引用阮一峰老师的[《undefined与null的区别》](https://www.ruanyifeng.com/blog/2014/03/undefined-vs-null.html)就是：  
> `null`表示“没有对象”，即该处不应该有值。

所以查找属性的时候查到`Object.prototype`就可以停止查找了。

最后一张关系图也可以更新为：  
![原型和原型链关系图5](../images/view/prototype5.png)  
顺便还要说一下，图中由相互关联的原型组成的链状结构就是原型链，也就是蓝色的这条线。

#### 补充

最后，补充三点可能不会注意的地方：

#### constructor  
首先是`constructor`属性，看个例子：  
```js
function Person() {

}
var person = new Person()
console.log(person.constructor === Person) // true
```

当获取`person.constructor`时，其实`person`中并没有`constructor`属性，当不能读取到`constructor`属性时，会从`person`的原型也就是`Person.prototype`中读取，正好原型中有该属性，所以：  
```js
person.constructor === Person.prototype.constructor
```

#### \_\_proto\_\_  
其次是`__proto__`，绝大部分浏览器都支持这个非标准的方法访问原型，然而它并不存在于`Person.prototype`中，实际上，它是来自于`Object.prototype`，与其说是一个属性，不如说是一个`getter/setter`，当使用`obj.__proto__`时，可以理解成返回了`Object.getPrototypeOf(obj)`。

#### 真的是继承吗？  
最后是关于继承，前面讲到“每一个对象都会从原型“继承”属性”，实际上，继承是一个十分具有迷惑的说法，引用《你不知道的JavaScript》中的话，就是：  
继承意味着复制操作，然而`JavaScript`默认并不会复制对象的属性，相反，`JavaScript`只是在两个对象之间创建一个关联，这样，一个对象就可以通过委托访问另一个对象的属性和函数，所以与其叫继承，委托的说法反而更准确些。

***

## 继承

记录JavaScript各种继承方式和优缺点。

### 1、原型链继承  
```js
function Parent() {
  this.name = 'xiaoming';
}

Parent.prototype.getName = function() {
  console.log(this.name);
}

function Child() {

}

Child.prototype = new Parent();

var child1 = new Child();

console.log(child1.getName()); // xiaoming
```

问题:  
1、引用类型的属性被所有实例共享，举个例子：  
```js
function Parent() {
  this.names = ['xiaoming', 'xiaohong'];
}

function Child() {

}

Child.prototype = new Parent();

var child1 = new Child();
child1.names.push('zhangsan');

console.log(child1.names) // ['xiaoming', 'xiaohong', 'zhangsan']

var child2 = new Child()

console.log(child2.names) // ['xiaoming', 'xiaohong', 'zhangsan']
```

2、在创建`Child`的实例时，不能向`Parent`传参

### 2、借用构造函数（经典继承）  
```js
function Parent() {
  this.names = ['xiaoming', 'xiaohong'];
}

function Child() {
  Parent.call(this);
}

var child1 = new Child();
child1.names.push('zhangsan');

console.log(child1.names); // ['xiaoming', 'xiaohong', 'zhangsan']

var child2 = new Child();
console.log(child2.names); // ['xiaoming', 'xiaohong']
```  
优点：  
1、避免了引用类型的属性被所有实例共享。
2、可以在`Child`中向`Parent`传参

举个例子：  
```js
function Parent(name) {
  this.name = name;
}

function Child(name) {
  Parent.call(this, name);
}

var child1 = new Child('xiaoming');
console.log(child1.name); // xiaoming

var child2 = new Child('xiaohong')
console.log(child2.name); // xiaohong
```  
缺点：  
方法都在构造函数中定义，每次创建实例都会创建一遍方法。

### 3、组合继承  
原型链继承和经典继承双剑合璧  
```js
function Parent(name) {
  this.name = name;
  this.colors = ['res', 'blue', 'green'];
}

Parent.prototype.getName = function() {
  console.log(this.name);
}

function Child(name, age) {
  Parent.call(this, name);
  
  this.age = age;
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

var child1 = new Child('xiaoming', 18);
child1.colors.push('black');

console.log(child1.name); // xiaoming
console.log(child1.age); // 18
console.log(child1.colors); // ['red', 'blue', 'green', 'black']

var child2 = new Child('xiaohong', 20)

console.log(child2.name); // xiaohong
console.log(child2.age); // 20
console.log(child2.colors); // ['red', 'blue', 'green']
```  
优点：融合原型链继承和构造函数的优点，是JavaScript中最常用的继承模式。

### 4、原型式继承  
```js
function createObj(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
```  
就是`ES5 Object.create`的模拟实现，将传入的对象作为创建的对象的原型。  
缺点：  
包含引用类型的属性始终都会共享相应的值，这点跟原型链继承一样。  
```js
var person = {
  name: 'xiaoming',
  firends: ['xiaohong', 'zhangsan']
}

var person1 = createObj(person);
var person2 = createObj(person);

person1.name = 'person1'
console.log(person2.name); // xiaoming

person1.firends.push('lisi');
console.log(person2.friends); // ['xiaohong', 'zhangsan', 'lisi']
```  
:::warning
注意：修改`person1.name`的值，`person2.name`的值并未发生改变，并不是因为`person1`和`person2`有独立的`name`值，而是因为`persion1.name = 'persion1'`，给`persion1`添加了`name`值，并非修改了原型上的`name`值。
:::

### 5、寄生式继承  
创建一个仅用于封装继承过程的函数，该函数在内部以某种形式来做增强对象，最后返回对象。  
```js
function createObj(o) {
  var clone = Object.create(o);
  clone.sayName = function () {
    console.log('hi');
  }
  return clone
}
```  
缺点：跟借用构造函数模式一样，每次创建对象都会创建一遍方法。

### 6、寄生组合式继承  
为了方便阅读，在这里重复一下组合继承的代码：  
```js
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function() {
  consloe.log(this.name);
}

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

Child.prototype = new Parent();

var child1 = new Child('xiaoming', 18);
console.log(child1)
```  
组合继承最大的缺点就是会调用两次父构造函数。  
一次是设置子类型实例的原型的时候：  
```js
Child.prototype = new Parent();
```  
一次在创建子类型实例的时候：  
```js
var child1 = new Child('xiaoming', 18);
```  
回想下`new`的模拟实现，其实在这句中，会执行：  
```js
Parent.call(this, name);
```  
在这里，又会调用了一次`Parent`构造函数。  
所以，在这个例子中，如果是打印`child1`对象，会发现`Child.prototype`和`child1`都有一个属性为`colors`，属性值为`['red', 'blue', 'green']`。  
那么该如何精益求精，避免这一次重复调用呢？  
如果不使用`Child.prototype = new Parent()`，而是间接的让`Child.prototype`访问到`Parent.prototype`呢？  

看看如何实现：  
```js
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function () {
  console.log(this.name)
}

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

// 关键的三步
var F = function () {};
F.prototype = Parent.prototype;
Child.prototype = new F();

var child1 = new Child('xiaoming', 18);
console.log(child1);
```  
最后封装一下这个继承方法：  
```js
function object(o) {
  function f() {};
  f.prototype = o;
  return new F();
}

function prototype(child, parent) {
  var prototype = object(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

prototype(Child, Parent);
```  
引用《JavaScript高级程序设计》中对寄生组合工继承的夸赞就是：  
这种方式的高效率体现它只调用了一次`Parent`构造函数，并且因此避免了在`Parent.prototype`上而创建不必要的、多余的属性。与些同时，原型链还能保持不变；因此，还能够正常使用`instanceof`和`isPrototypeOf`。开发人员普遍认为寄生组合式继承是引用类型最理想的继承范式。

***

## 闭包  
### 定义  
MDN对闭包的定义：  
> 闭包是指那些能够访问自由变量的函数。  
那什么是自由变量呢？  
> 自由变量是指在函数中使用的，但既不是函数参数也不是函数的局部变量的变量。  
由此，可以看出闭包共有两部分组成：  
> 闭包 = 函数 + 函数能够访问的自由变量  

举个例子：  
```js
var a = 1;

function foo () {
  console.log(a);
}

foo();
```  
`foo`函数可以访问变量`a`，但是`a`既不是foo函数的局部变量，也不是`foo`函数的参数，所以`a`就是自由变量。  
那么，函数`foo + foo`函数访问的自由变量`a`不就是构成了一个闭包嘛。。。。  
还真是这样的！！  
所以在《JavaScript权威指南》中就讲到：从技术的角度讲，所有的JavaScript函数都是闭包。  
咦，这怎么跟我们平时看到的讲到的闭包不一样呢！？  
别着急，这是理论上的闭包，其实还有一个实践角度上的闭包：  
ECMAScript中，闭包指的是：  
1、从理论角度：所有的函数。因为它们都创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。  
2、从实践角度：以下函数才算是闭包：  
 i: 即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）  
 ii: 在代码中引用了自由变量  

接下来就来讲讲实践上的闭包。  

### 分析  
先写个例子，例子依然是来自《JavaScript权威指南》，稍微做点发动：  
```js
var scope = "global scope";

function checkscope() {
  var scope = "local scope";
  function f () {
    return scope;
  }
  return f;
}

var foo = checkscope();
foo()
```  
首先要分析一下这段代码中执行上下文栈和执行上下文的变化情况。  

这里直接给出简要的执行过程：  
:::tip
1、进入全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈  
2、全局执行上下文初始化  
3、执行`checkscope`函数，创建`checkscope`函数执行上下文，`checkscope`执行上下文被压入执行上下文栈  
4、`checkscope`执行上下文初始化，创建变量对象、作用域链、`this`等  
5、`checkscope`函数执行完毕，`checkscope`执行上下文从执行上下文栈中弹出  
6、执行`f`函数，创建`f`函数执行上下文，`f`执行上下文被压入执行上下文栈  
7、`f`执行上下文初始化，创建变量对象、作用域链、this等  
8、`f`函数执行完毕，`f`函数上下文从执行上下文栈中弹出
:::  
了解到这个过程，应该思考一个问题，那就是：  
当`f`函数执行的时候，`checkscope`函数上下文已经被销毁了（即从执行上下文栈中弹出），怎么还会读取到`checkscope`作用域下的`scope`值呢？  

当了解了具体的执行过程后，知道`f`执行上下文维护了一个作用链：  
```js
fContext = {
  Scope: [AO, checkscopeContext.AO, globalContext.VO]
}
```  
对的，就是因为这个作用域链，`f`函数依然可以读取到`checkscopeContext.AO`的值，说明当`f`函数引用了`checkscopeContext.AO`中的值的时候，即使`checkscopeContext`被销毁了，但是JavaScript依然会让`checkscopeContext.AO`活在内存中，`f`函数依然可以通过`f`函数的作用域链找到它，正是因为JavaScript做到了这一点，从而实现了闭包这个概念。  

所以，再看一遍实践角度上闭包的定义：  
1、即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数返回）  
2、在代码中引用了自由变量  

在这里再补充一个《JavaScript权威指南》英文原版对闭包的定义：  
> This combination of a function object and a scope (a set of variable bindings) in which the function's variables are resolved is called a closure in the computer science literature.  

闭包在计算机科学中也只是一个普通的概念，不要去想得太复杂。

### 必刷题  
接下来，看这道刷题必刷，面试必考的闭包题：  
```js
var data = []

for(var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i)
  };
}

data[0]();
data[1]();
data[2]();
```  
答案都是3，分析一下原因：  
当执行到`data[0]`函数之前，此时全局上下文的`VO`为：  
```js
globalContext = {
  VO: {
    data: [...],
    i: 3
  }
}
```  
当执行`data[0]`函数的时候，`data[0]`函数的作用域链为：  
```js
data[0]Context = {
  Scope: [AO, globalContext.VO]
}
```  
`data[0]Context`的`AO`并没有`i`值，所以会从`globalContext.VO`中查找，`i`为`3`，所以打印的结果就是`3`。  
`data[1]`和`data[2]`是一样的道理。  
所以改成闭包看看：  
```js
var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = (function (i) {
    return function () {
      console.log(i);
    }
  })
}

data[0]();
data[1]();
data[2]();
```  
当执行到`data[0]`函数之前，此时全局上下文的`VO`为：  
```js
globalContext = {
  VO: {
    data: [...],
    i: 3
  }
}
```  
跟没改之前一模一样。  
当执行`data[0]`函数的时候，`data[0]`函数的作用域链发生了改变：  
```js
data[0]Context = {
  Scope: [AO, 匿名函数Context.AO globalContext.VO]
}
```  
匿名函数执行上下文的AO为：  
```js
匿名函数Context = {
  AO: {
    arguments: {
      0: 0,
      length: 1
    },
    i: 0
  }
}  
```  
`data[0]Context`的`AO`并没有`i`值，所以会沿着作用域链从匿名函数`Context.AO`中查找，这时候就会找`i`为`0`，找到了就不会往`globalContext.VO`中查找了，即使`globalContext.VO`也有`i`的值（值为`3`），所以打印的结果就是`0`。  

`data[1]`和`data[2]`是一样的道理

***

## 变量提升  
变量对象是与执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。  
因为不同执行上下文下的变量对象稍有不同，所以全局上下文下的变量对象和函数上下文下的变量对象。  

### 全局上下文  
先了解一个概念，叫全局对象。在[W3School](https://www.w3school.com.cn/jsref/jsref_obj_global.asp)中也介绍：  
> 全局对象是预定义的对象，作为JavaScript的全局函数和全局属性的点位符。通过使用全局对象，可以访问所有其他所有预定义的对象、函数和属性。  
> 在顶层JavaScript代码中，可以用关键字this引用全局对象。因为全局对象是作用域链的头，这意味着所有非限定性的变量和函数名都会作为该对象的属性来查询。  
> 例如，当JavaScript代码引用parseInt()函数时，它引用的是全局对象的parseInt属性。全局对象是作用域链的头，还意味着在顶层JavaScript代码中声明的所有变量都将成为全局对象的属性。  

如果看的不是很懂的话，请继续看下面的全局对象的介绍：  
1、可以通过`this`引用，在客户端`JavaScript`中，全局对象就是`Window`对象。  
```js
console.log(this);
```  
2、全局对象是由`Object`构造函数实例化的一个对象。  
```js
console.log(this instanceof Object);
```  
3、预定义了一堆，一大堆函数和属性。  
```js
console.log(Math.random());
console.log(this.Math.random());
```  
4、作为全局变量的宿主。  
```js
var a = 1;
console.log(this.a);
```  
5、客户端`JavaScript`中，全局对象有`window`属性指向自身  
```js
var a = 1;
console.log(window.a);

this.window.b = 2;
console.log(this.b);
```  
花了一个大篇幅介绍全局对象，其他就想说：  
全局上下文中的变量对象就是全局对象！  

### 函数上下文  
在函数上下文中，用活动对象`(activation object, AO)`来表示变量对象。  

活动对象和变量对象其实是一个东西，只是变量对象是规范上的或者说是引擎实现上的，不可在`JavaScript`环境中访问，只有到当进入一个执行上下文中，这个执行上下文的变量对象才会被激活，所有才叫`activation object`，而只有被激活的变量对象，也就是活动对象上的各种属性才能被访问。  

活动对象是在进入函数上下文时刻被创建的，它通过函数的`arguments`属性初始化。`arguments`属性值是`Arguments`对象。  

### 执行过程  
执行上下文的代码会分成两个阶段进行处理：分析和执行，也可以叫做：  
1、进入执行上下文  
2、代码执行  

### 进入执行上下文  
当进入执行上下文时，这时候还没有执行代码，  
变量对象会包括：  
1、函数的所有形参（如果是函数上下文）  
* 由名称和对应值组成的一个变量对象的属性被创建  
* 没有实参，属性值设为undefined  
2、函数声明  
* 由名称和对应值（函数对象(function-object)）组成一个变量对象的属性被创建  
* 如果变量名称跟已经声明的形式参数或函数相同，则变量声明不会干扰已经存在的这类属性  

举个例子：  
```js
function foo(a) {
  var b = 2;
  function c() {}
  var d = function() {};

  b = 3;
}

foo(1);
```  
在进入执行上下文后，这时候的`AO`是：  
```js
AO = {
  arguments: {
    0: 1,
    length: 1
  },
  a: 1,
  b: undefined,
  c: reference to function c(){},
  d: undefined
}
```  

### 代码执行  


***

## this的指向

## 立即执行函数

## instanceof原理

## 柯里化

## v8垃圾回收机制

## 浮点数精度

## new操作符

## 事件循环机制

## promise原理

## generator原理