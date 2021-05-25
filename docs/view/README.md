---
sidebar: auto
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

### 原型链继承  
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

### 借用构造函数（经典继承）  
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

### 组合继承  
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

### 原型式继承  
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

### 寄生式继承  
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

### 寄生组合式继承  
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
在代码执行阶段，会顺序执行代码，根据代码，修改变量对象的值  
还是上面的例子，当代码执行完后，这时候的`AO`是：  
```js
AO = {
  arguments: {
    0: 1,
    length: 1
  },
  a: 1,
  b: 3,
  c: reference to function c(){},
  d: reference to FunctionExpression: "d"
}
```  
到这里变量对象的创建过程就介绍完了，简洁的总结上述所说：  
1、全局上下文的变量对象初始化是全局对象  
2、函数上下文的变量对象初始化只包括`Arguments`对象  
3、在进入执行上下文时会给变量对象添加形参、函数声明、变量声明等初始的属性值  
4、在代码执行阶段，会再修改变量对象的属性值  

### 思考题  
最后再看几个例子  
1、第一题  
```js
function foo() {
  console.log(a);
  a = 1
}

foo(); // ???

function bar() {
  a = 1;
  console.log(a);
}

bar() // ???
```  
第一段会报错： `Uncaught ReferenceError: a is not defined.`  
第二段会打印： `1`。  
这是因为函数中的`"a"`并没有通过`var`关键字创建，所以不会被存放在`AO`中。  
第一段执行`console`的时候，`AO`的值是：  
```js
AO = {
  arguments: {
    length: 0
  }
}
```  
没有`a`的值，然后就会找到全局去找，全局也没有，所以会报错。  
当第二段执行`console`的时候，全局对象已经被赋予了`a`属性，这时候就可以从全局找到`a`的值，所以会打印`1`。  

2、第二题  
```js
console.log(foo);

function foo() {
  console.log("foo");
}

var foo = 1;
```  
会打印函数，而不是`undefied`。  
这是因为在进入执行上下文时，首先会处理函数声明，首次会处理变量声明，如果变量名称跟已经声明的形式参数或函数相同，则变量声明不会干扰已经存在的这类发属性。


***

## this的指向  

### 前言
当JavaScript代码执行一段可执行代码(executable code)时，会创建对应的执行上下文(execution context)  

对于每个执行上下文，都有三个重要属性  
* 变量对象(Variable object, VO)
* 作用域链(Scope chain)
* this  

先奉上ECMAScript5.1规范开始讲起：  

英文版：[http://es5.github.io/#x15.1](http://es5.github.io/#x15.1)  
中文版：[http://yanhaijing.com/es5/#115](http://yanhaijing.com/es5/#115)  

### Types  
首先是第8章Types：  
> Types are further subclassified into ECMAScript language types and specification types.  

> An ECMAScript language type corresponds to values that are directly manipulated by an ECMAScript programmer using the ECMAScript language. The ECMAScript language types are Undefined, Null, Boolean, String, Number, and Object.  

> A specification type corresponds to meta-values that are used within algorithms to describe the semantics of ECMAScript language constructs and ECMAScript language types. The specification types are Reference, List, Completion, Property Descriptor, Property Identifier, Lexical Environment, and Environment Record.  

简单的翻译一下：  
> ECMAScript 的类型分为语言类型和规范类型。  

> ECMAScript 语言类型是开发者直接使用ECMAScript可以操作的。其实就是常说的Undefined, Null, Boolean, String, Number, 和Object。  

> 而规范类型相当于 meta-values, 是用来用算法描述 ECMAScript 语言结构和 ECMAScript 语言类型的。规范类型包括：Reference, List, Completion, Property Descriptor, Property Identifier, Lexical Environment, 和 Environment Record。  

没懂？没关系，只要知道在 ECMAScript 规范中还有一种只存在于规范中的类型，它们的作用是用来描述语言底层的行为逻辑。  

重点是便是其中的`Reference`类型。它与`this`的指向有着密切的关联。  

### Reference  
那什么又是`Reference`？  
先看8.7章 The Reference Spectification Type:  
> The Reference type is used to explain the behaviour of such operators as delete, typeof and the assignment operators.  
所以`Reference`类型就是用来解释诸如 delete、typeof 以及赋值等操作行为的。  

抄袭尤雨溪大佬的话，就是：  
> 这里的Reference是一个Specification Type, 也就是”只存于规范里的抽象类型“。它们是为了更好地描述底层行为逻辑才存在的，但并不存在于实际的js代码中。  

再看接下来的这段具体介绍`Reference`内容：  
> A Reference is a resolved name binding.  
> A Reference consists of three components, the base value, the referenced name and the Boolean valued strict reference flag.  
> The base value is either undefined, an Object, a Boolean, a String, a Number, or an environment record(10.2.1).  
> A base value of undefined indicates that the reference could not be resolved to binding. The referenced name is a String.  

这段讲述了`Reference`的构成，由三个组成部分，分别是：  
* base value
* referenced name
* strict reference  

可是这些到底是什么呢？  
简单的理解的话：  
base value就是属性所在的对象或者就是EnvironmentRecord，它的值只可能是undefined, an Object, a Boolean, a String, a Number, or an environment record其中一种。  

referenced name就是属性的名称。  

举个例子：  
```js
var foo = 1;

// 对应的Reference是： 
var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false
};
```  

再举个例子：  
```js
var foo = {
  bar: function () {
    return this;
  }
}

foo.bar(); // foo

var BarReference = {
  base: foo,
  propertyName: 'bar',
  strict: false
};
```  

而且规范中还提供了获取Reference组成部分的方法，比如GetBase和isProertyReference。  
这两个方法很简单，简单看一看：  

1.GetBase  
> GetBase(V). Returns the base value component of the reference V.  
返回`reference`的`base value`。  

2、isPropertyReference  
> isPropertyReference(V). Returns true if either the base value is an object or HasPrimitiveBase(V) is true; otherwise returns false.  
简单的理解：如果`base value`是一个对象，就返回true。  

### GetValue  
除此之外，紧接着8.7.1章规范中就讲了一个用于从`Reference`类型获取对应值的方法：`GetValue`。  
简单模拟`GetValue`的使用：  
```js
var foo = 1;

var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false
};

GetValue(fooReference) // 1;
```  
GetValue 返回对象属性真正的值，但是要注意：  
调用`GetValue`，返回的将是具体的值，而不再是一个`Reference`  
这个很重要，这个很重要，这个很重要。  

### 如何确定this的值  

关于`Reference`讲了那么多，为什么要讲`Reference`呢？到底`Reference`跟本文的主题`this`有哪些关联呢？如果你能耐心看完之前的内容，以下开始进入高能阶段：  

看规范 11.2.3 Function Calls:  
这里讲了当函数调用的时候，如何确定`this`的取值。  

只看第一步、第六步、第七步：  
> 1. Let ref be the result of evaluating MemberExpression.  

> 6. if Type(ref) is Reference, then  

>    a.If IsPropertyReference(ref) is true, then  
>    i.Let thisValue be GetBase(ref).  
>    b.Else, the base of ref is an Environment Record  
>    i.Let thisValue be the result of calling the ImplicitThisValue concrete method of GetBase(ref).  

> 7. Else, Type(ref) is not Reference.  

>    a. Let thisValue be undefined.  

描述一下：  
1. 计算MemberExpression 的结果赋值给ref  
2. 判断ref是不是一个 Reference 类型  
``` 
   2.1 如果 ref 是 Reference，并且 IsPropertyReference(ref)是true，那么this的值为GetBase(ref)
   2.2 如果 ref 是 Reference，并且 base value 值是 Environment Record, 那么this的值为 ImplicitThisValue(ref)
   2.3 如果 ref 不是 Reference，那么 this 的值为 undefined
```  

### 具体分析  
一步一步看：  
1. 计算MemberExpression的结果赋值给ref  
什么是 MemberExpression？看规范 11.2 Left-Hand-Side Expressions:  
MemberExpression: 
* PrimaryExpression // 原始表达式可以参见《JavaScript权威指南第四章》
* FunctionExpression // 函数定义表达式  
* MemberExpression [Expression] // 属性访问表达式
* MemberExpression . IdentifierName // 属性访问表达式
* new MemberExpression Arguments // 对象创建表达式  

举个例子：  
```js
function foo() {
  console.log(this)
}

foo(); // MemberExpression是foo

function foo() {
  return function() {
    console.log(this)
  }
}

foo()(); // MemberExpression 是 foo

var foo = {
  bar: function() {
    return this;
  }
}

foo.bar(); // MemberExpression 是 foo.bar
```  

所以简单理解`MemberExpression`其实就是()左边的部分。  

2. 判断 ref 是不是一个 Reference 类型。  
关键就在于看规范是如果处理各种`MemberExpression`，返回的结果是不是一个`Reference`类型。  

举最后一个例子：  
```js
var value = 1;

var foo = {
  value: 2,
  bar: function() {
    return this.value();
  }
}

// 示例1
console.log(foo.bar());
// 示例2
console.log((foo.bar)());
// 示例3
console.log((foo.bar = foo.bar)());
// 示例
console.log((false || foo.bar)());
// 示例
console.log((foo.bar, foo.bar)());
```  

#### foo.bar()  
在示例1中，`MemberExpression`计算的结果是foo.bar，那么`foo.bar`是不是一个`Reference`呢？  
查看规范 11.2.1 Property Accessors, 这里展示了一个计算的过程，什么都不管了，就看最后一步：  
> Return a value of type Reference whose base value is baseValue and whose referenced name is propertyNameString, and whose strict mode flag is strict.  

我们得知该表达式返回了一个`Reference`类型！  

根据之前的内容，知道该值为：  
```js
var Reference = {
  base: foo,
  name: 'bar',
  strict: false
};
```  

接下来按照2.1的判断流程走：  
> 2.1 如果 ref 是 Reference，并且 IsPropertyReference(ref)是true，那么this的值为GetBase(ref)  

该值是`Reference`类型，那么`IsPropertyReference(ref)`的结果是多少呢？  
前面我们已经铺垫了`IsPropertyReference`方法，如果`base value`是一个对象，结果返回`true`。  
`base value`为`foo`，是一个对象，所以`IsPropertyReference(ref)`结果为`true`  
这个时候就可以确定`this`的值了：  
```js
this = GetBase(ref)
```  

GetBase也已经铺垫了，获得base value值，这个例子中就是foo，所以this的值就是foo，示例1的结果就是2！  

上面的例子证明了`this`指向`foo`。知道了原理后，剩下的就更快了。  

#### (foo.bar)()  
看示例2：  
```js
console.log((foo.bar)());
```  
`foo.bar`被`()`包住，就看规范11.1.6 The Grouping Operator  

直接看结果部分：  
> Return the result of evaluating Expression. This may be of type Reference.  
> NOTE This algorithm does not apply GetValue to the result of evaluating Expression.  

实际上`()`并没有对`MemberExpression`进行计算，所以其实跟示例1的结果是一样的。  

(foo.bar = foo.bar)()  
看示例3，有赋值操作符，查看规范 11.13.1 Simple Assignment (=):  
计算的第三步：  
> 3.Let rval be GetValue(rref).  
因为使用了`GetValue`，所以返回的值是不是`Reference`类型，  

按照之前讲的判断逻辑：  
> 2.3 如果 ref 不是Reference，那么 this 的值为 undefined  

`this`为`undefined`，非严格模式下，`this`的值为`undefined`的时候，其值会被隐式转换为全局对象。  

#### (false || foo.bar)()  
看示例4，逻辑与算法，查看规范 11.11 Binary Logical Operators：  
计算第二步：  
> 2.Let lval be GetValue(lref)  

因为使用了`GetValue`，所以返回的不是`Reference`类型，`this`为`undefined`  

#### (foo.bar, foo.bar)()  
看示例5，逗号操作符，查看规范 11.14 Comma Operator(,)  
计算第二步：  
> 2.Call GetValue(lref).  
因为使用了`GetValue`，所以返回的不是`Reference`类型，`this`为`undefined`  

### 揭晓结果  
所以最后一个例子的结果是：  
```js
var value = 1;

var foo = {
  value: 2,
  bar: function () {
    return this.value;
  }
}

// 示例1
console.log(foo.bar()); // 2
// 示例2
console.log((foo.bar)()); // 2
// 示例3
console.log((foo.bar = foo.bar)()); // 1
// 示例4
console.log((false || foo.bar)()); // 1
// 示例5
console.log((foo.bar, foo.bar)()); // 1
```  

::: warning
注意：以上是在非严格模式下的结果，严格模式下因为`this`返回`undefined`，所以示例3会报错。
:::  

### 补充  
最最后，忘记了一个最最普通的情况：  
```js
function foo() {
  console.log(this)
}

foo();
```  
`MemberExpression`是`foo`，解析标识符，查看规范`10.3.1 Identifier Resolution`，会返回一个`Reference`类型的值：  
```js
var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false
}
```  
接下来进行判断：  
> 2.1如果 ref 是 Reference，并且IsPropertyReference(ref)是true，那么this的值为GetBase(ref)  

因为 base value 是 EnvironmentRecord，并不是一个 Object 类型，还记得前面讲过的 base value 的取值可能吗？ 只可能是undefined, an Object, a Boolean, a String, a Number, 和 an environment record 中的一种。  

isPropertyReference(ref)的结果为 false，进入下判断：  
> 2.2如果 ref 是 Reference，并且 base value 值是 Environment Record, 那么 this 的值为 ImplicitThisValue(ref)  
base value 正是 Environment Record，所以会调 ImplicitThisValue(ref)  
查看规范 10.2.1.1.6， ImplicitThisValue 方法的介绍：该函数始终返回undefined。  
所以最后`this`的值就是`undefined`。  

### 多说一句  
尽管可以简单的理解`this`为调用函数的对象，如果是这样的话，如何解释下面这个例子呢？  
```js
var value = 1;

var foo = {
  value: 2,
  bar: function() {
    return this.value;
  }
}

console.log((false || foo.bar)()); // 1
```  
此外，又如何确定调用函数的对象是谁呢？在写`this`文章之初，我就面临着这些问题，最后还是放弃从多个情形下给大家讲解 this 指向的思路，而是追根溯源的从 ECMASciript 规范讲解 this 的指向，尽管从这个角度写起来和读起来都比较吃力，但是一旦多读几遍，明白原理，绝对会给你一个全新的视角看待 this 。而你也就能明白，尽管 foo() 和 (foo.bar = foo.bar)() 最后结果都指向了 undefined，但是两者从规范的角度上却有着本质的区别。 

***

## 立即执行函数  
### 它是什么？  
在`JavaScript`里，每个函数，当被调用时，都会创建一个新的执行上下文。因为在函数里定义的变量和函数是唯一在内部被访问的变量，而不是在外部被访问的变量，当调用函数时，函数提供的上下文提供了一个非常简单的方法创建私有变量。  
```js
function makeCounter() {
  var i = 0;
  return function() {
    console.log(i++);
  };
}

// 记住：`counter`和`counter2`都有它们自己的变量`i`

var counter = makeCounter();
counter(); // 1
counter(); // 2

var counter2 = makeCounter();
counter2(); // 1
counter2(); // 2

i; // ReferenceError: i is not defined(它只存在于makeCounter里)
```  
在许多情况下，可能并不需要`makeWhatever`这样的函数返回多次累加值，并且可以只调用一次得一个单一的值，在其他一些情况里，甚至不需要明确的知道返回值。  

### 它的核心  
现在，无论定义一个函数像这样`function foo() {}`或者`var foo = function() {}`，调用时，都需要在后面加上一对圆括号，像这样`foo()`。  
```js
// 向下面这样定义的函数可以通过在函数名称后加一对括号进行调用，像这样`foo()`，
// 因为foo相对于函数表达式`function() {/* code */}`只是一个引用变量

var foo = function () {/* code */}

// 那这可以说明函数表达式可以通过在其后加上一对括号自己调用自己吗？
function() {/* code */}(); // SyntaxError: Unexpected token ()
```  
正如你所看到的，这里捕获了一个错误，当圆括号为了调用出现在函数后面时，无论在全局或者局部环境里面遇到了这样的`function`关键字，默认的，它会将它当作是一个函数声明，而不是函数表达式，如果你不明确的告诉圆括号它是一个表达式，它会将其当作没有名字的函数声明并且抛出一个错误，因为函数声明需要一个名字。  

问题1：这里可以思考一个问题，是不是也可以像这样直接调用函数`var foo = function() {console.log(1)}()`，答案是可以的。  
问题2：同样的，还可以再思考一个问题，像这样的函数声明在后面加上圆括号被直接调用，又会出现什么情况呢？请看下面的解答。  

### 函数，圆括号，错误  
有趣的是，如果你为一个函数指定一个名字并在它后面放一对圆括号，同样的也会抛出错误，但这次是因为另一个原因。当圆括号放在一个函数表达式后面指明了这是一个被调用的函数，而圆括号放在一个声明后面便意味着完全的和前面的函数声明分开了，此时圆括号只是一个简单的代表一个括号(用来控制运算优先的括号)。  
```js
// 然而函数声明语法上是无效的，它仍然是一个声明，紧跟着的圆括号是无效的，因为圆括号里面需要包含表达式

function foo() { /* code */ }();  // SyntaxError: Unexpected token

// 现在，你把一个表达式放在圆括号里面，没有抛出错误... ，但是函数也并没有执行，因为：
;
function foo() {/* code */}(1)

// 它等同于如下，一个函数声明跟着一个完全没有关系的表达式：

function foo() {/* code */}
(1);
```  

### 立即执行函数表达式（IIFE）  
幸运的是，修正语法很简单。最流行的也最被接受的方法是将函数声明包裹在圆括号里来告诉语法分析器去表达一个函数表达式，因为在`JavaScript`里面，圆括号不能包含声明。因为这点，当圆括号为了包裹函数碰上了`function`关键词，它便知道将作为一个函数表达式去解析而不是函数声明。注意理解这里的圆括号和上面的圆括号遇到的函数时的表现是不一样的，也就是说。  
* 当圆括号出现在匿名函数的末尾想要调用函数时，它会默认将函数当成是函数声明。  
* 当圆括号包裹函数时，它会默认将函数作为表达式去解析，而不是函数声明。  

```js
// 这两种模式都可以被用来立即调用一个函数表达式，利用函数的执行来创造私有变量

(function() {/* code */}()); // Crockford recommends this one, 括号内的表达式代表函数立即调用表达式
(function() {/* code */})(); // But this one works just as well，括号内的表达式代表函数表达式

// Because the point of the parens or coercing operators is to disambiguate
// between function expressions and function declarations, they can be
// omitted when the parser already expects an expression (but please see the
// "important note" below).

var i = function() {return 10;}();
true && function() {/* code */}();
0, function() {}();

// 如果你并不关心返回值，或者让你的代码尽可能的易读，你可以通过在你的函数前面带上一个一元操作符来存储字节

!function() {/* code */}();
~function() {/* code */}();
-function() {/* code */}();
+function() {/* code */}();

// Here's another variation, from @kuvos - I'm not sure of the performance
// implications, if any, of using the `new` keyword, but it works.
// http://twitter.com/kuvos/status/18209252090847232

new function() {/* code */}
new function() {/* code */}() // Only need parents if passing arguments
```  

### 关于括号的重要笔记  
在一些情况下，当额外的带着歧义的括号围绕在函数表达式周围是没有必要的(因为这时候的括号已经将其作为一个表达式去表达)，但当括号用于调用函数表达式时，这仍然是一个好主意。  
这样的括号指明函数表达式将会被立即调用，并且变量将会储存函数的结果，而不是函数本身。当这是一个非常长的函数表达式时，这可以节约给人阅读你代码的时间，不用滚到页面底部去看这个函数是否被调用。  
作为规则，当你书写清楚明晰的代码时，有必要阻止`JavaScript`抛出错误的，同样也有必要阻止其他开发者抛出错误`WTFError`！  

### 保存闭包的状态  
就像当函数通过它们的名字被调用时，参数会被传递，而当函数表达式被立即调用时，参数也会被传递。一个立即调用的函数表达式可以用锁定值并且有效的保存此时的状态，因为任何定义在一个函数内的函数都可以使用外面函数传递进来的参数和变量(这种关系被叫做闭包)。  
```js
// 它的运行原理可能并不像你想的那样，因为`i`的值从来没有被锁定
// 相反下，每个链接，当被点击时（循环已经被很好的执行完毕），因此会弹出所有元素的总数，
// 因为这是`i`，此时的真实值

var elems = document.getElementByTagName('a');
for (var i = 0; i < elems.length; i++) {
  elems[i].addEventListener('click', function(e) {
    e.preventDefault();
    alert('I am link #' + i)
  }, false)
}

// 而像下面这样改写，便可以了，因为在IIFE里，`i`值被锁定在了`lockedInIndex`里。
// 在循环结果执行时，尽管`i`值的数值是所有元素的总和，但每一次函数表达式被调用时，
// IIFE里的`lockedInIndex`值都是`i`传给它的值，所以当链接被点击时，正确的值被弹出。

var elems = document.getElementsByTagName('a');
for (var i = 0; i < elems.length; i++) {
  (function(lockedInIndex) {
    elems[i].addEventListener('click', function(e) {
      e.preventDefault();
      alert('I amlink #' + lockedInIndex);
    }, false)
  })(i)
}

// 同样可以像下面这样使用IIFE，仅仅中用括号包括点击处理函数，并不包含整个`addEventListener`。
// 无论用哪种方式，这两个例子都可以用IIFE将值锁定，不过我发现前面一个例子更可读。

var elems = document.getElementByTagName('a');
for (var i = 0; i < elems.length; i++) {
  elems[i].addEventListener('click', (function (lockedInIndex) {
    return function(e) {
      e.preventDefalut();
      alert('I am link #' + lockedInIndex);
    };
  })(i), false);
}
```  
记住，在这最后两个例子里，`lockedInIndex`可以没有任何问题访问`i`，但是作为函数参数使用一个不同的命名标识符可以使概念更加容易的被解释。  
立即执行函数一个最显著的优势是就算它没有命名或者说是匿名，函数表达式也可以在没有使用标识符的情况下被立即调用，一个闭包也可以在没有当前变量污染的情况下被调用。

### 自执行匿名函数("Self-executing anonymous function")有什么问题？  
你看到它已经被提到好几次了，但是它仍然不是那么清楚的被解释，提议将术语改成`immediately-Invoked Function Expression`，或者，`IIFE`，如果喜欢缩写的话。  
什么是`immediately-Invoked Function Expression`呢？它使一个被立即调用的函数表达式，就像引导你去调用的函数表达式。  
`JavaScript`社区的成员应该可以在他们文章里或者陈述里接受术语，`immediately-Invoked Function Expression`和`IIFE`，因为感觉这样更容易让这个概念被理解，并且术语`self-execting anonymous function`真的也不够精确。  
```js
// 下面是个自执行函数，递归的调用自己本身

function foo() {foo();};

// 这是一个自执行函数。因为它没有标识符，它必须是使用`arguments.callee`属性来调用它自己

var foo = function() {arguments.callee();};

// 这也许算是一个自执行函数，但是仅仅当`foo`标识符作为它的引用时，如果你将它换成`foo`来调用同样可行

var foo = function() {foo();};

// 有些人像这样叫`self-executing anonymous function`下面的函数，即使它不是自执行的，因为它并没有调用它自己。然后，它只是被立即调用了而已。

(function() {/* code */}());

// 为函数表达式增加标识符（也就是六创造一个命名函数）对调试会有很大帮助。一旦命名，函数将不再匿名。

(function foo() {/* code */}());

// IIFEs同样也可以自执行，尽管，也许他不是最有用的模式。

(function() {arguments.callee();}())
(function foo() {foo();}())
```  
希望上面的例子可以更加清楚的知道术语`self-executing`是有一些错误的，因为它并不是执行自己的函数，尽管函数已经被执行。同样的，匿名函数也没用必要特别指出，因为，`immediately-Invoked Function Expression`，既可以是命名函数也可以匿名函数。

### 最后：模块模式  
当我调用函数表达式时，如果我不至少一次的提醒我自己关于模块模式，我便很可能会忽略它。如果你并不属于`JavaScript`里的模块模式，它和我下面的例子很像，但是返回值用对象代替了函数。  
```js
var counter = (function() {
  var i = 0;
  return {
    get: funciton() {
      return i;
    },
    set: function (val) {
      i = val;
    },
    increment: function () {
      return i++
    }
  }
}());

counter.get(); // 0
counter.set(3);
counter.increment(); // 4
counter.increment(); // 5

counter.i; // undefined(`i` is not a property of the returned object)
i; // ReferenceeError: i is not defined (it only exists inside the closure)
```  
模块模式方法不仅相当的厉害而且简单。非常少的代码，可以有效的利用与方法和属性相关的命名，在一个对象里，组织全部的模块代码即最小化了全局变量的污染也创造了使用变量。

***

## typeof和instanceof  
### JavaScript数据类型  
有八种内置类型  
* null(空值)
* undefined(未定义)
* boolean(布尔值)
* number(数字)
* object(对象)
* symbol(符号，ES6中新增)
* Bigint(大整数，ES2020引入)  
  
> 除对象外，其他统称为”基本类型“。  

```js
typeof null // 'object'
typeof undefined // 'undefined'
typeof false // 'boolean'
typeof 1 // 'number'
typeof '1' // 'string'
typeof {} // 'object'
typeof [] // 'object'
typeof new Date() // 'object'

typeof Symbol(); // 'Symbol'
typeof 123n  // 'bigint'
```  
这里的类型指的是值，变量是没有类型的，变量可以随时持有任何类型的值。JavaScript中变量是”弱类型“的，一个变量可以现在被赋值为字符串类型，随后又被赋值为数字类型。  

`typeof`是一个操作符而不是函数，用来检测给定变量的数据类型。  
> Symbol 是ES6引入的一种`原始数据`类型，表示独一无二的值。BigInt(大整数)是ES2020引入的一种新的数据类型，用来解决JavaScript中数字只能到53个二进制位（JavaScript所有数字都保存成64们浮点数，大于这个范围的整数，无法精确表示的总问题。（在平常的开发中，数据的id一般用string表示的原因）。）为了与Number类型区别，BigInt类型的数据必须添加后缀n。`1234`为普通整数，`1234n`为`BigInt`。了解更多可以看《ES6入门教程》  

`typeof null`为什么返回`object`，稍后会从JavaScript数据底层存储机制来解释。  

还有一种情况  
```js
function foo() {};
typeof foo; // 'function'
```  
这样看来，`function`也是`JavaScript`的一个`内置类型`。然而查阅规范，就会知道，它实际上是`object`的一个”子类型“。具体来说，函数是”可调用对象“，它有一个内部属性`[[call]]`，该属性使其可以调用。`typeof`可以用来区分函数其他对象。  

但是使用`typeof`不能判断对象具体是哪种类型，所有`typeof`返回值为"object"的对象（如数组，正则等）都包含一个内部属性`[[class]]`(可以把它看做一个内部的分类)。这个属性无法直接访问，一般通过`Object.prototype.toString(...)`来查看。  

```js
Object.prototype.toString.call(new Date); // '[object object]'
Object.prototype.toString.call([]); // '[object Array]'
Object.prototype.toString.call(/reg/ig); // '[object RegExp]'
```  
`instanceof`运算符也常常用来判断对象类型。用法：左边的运算数是一个`object`，右边运算数是对象类的名字或者构造函数；返回`true`或`false`。  

```js
[] instanceof Array; // true
[] instanceof Object; // true
[] instanceof RegExp; // false
new Date instanceof Date; // true
```  
`instanceof`的内部机制是：检测构造函数的`prototype`属性是否出现在某个实例对象的原型链上。下面会详解介绍该部分。  

### typeof原理  
`typeof`原理：不同的对象在底层都表示为二进制，在JavaScript中二进制前（低）三位存储其类型信息。  
* 000：对象
* 010：浮点数
* 100：字符串
* 110：布尔
* 1：整数

`typeof null`为`object`，原因是因为不同的对象在底层都表示为二进制，在JavaScript中二进制前（低）三位都为0的话会被判断为`Object`类型，`null`的二进制表示全为0，自然前三位也是0，所以执行`typeof`时会返回`object`。一个不恰当的例子，假设所有的JavaScript对象都是16位的，也就是有16个0或1组成的序列，猜想如下：  
```js
Array: 1000100010001000
null:  0000000000000000

typeof [] // 'object'
typeof null // 'object'
```  
因为`Array`和`null`的前三位都是000。为什么`Array`的前三位是100? 因为二进制中的”前“一般代表低位，比如二进制000000011对应十进制数是3，它的前三位是011。  

### instanceof  
要想从根本上理解，需要从两个方面入手：  
* 语言规范中是如何定义这个运算的
* JavaScript原型继承机制

通俗一些讲，`instanceof`用来比较一个对象是否为某一个构造函数的实例。注意，`instanceof`运算符只能用于对象，不适用原始类型的值。  
1、判断某个`实例`是否属性`某种类型`  
```js
function Foo() {};
Foo.prototype.message = ...;
const a = new Foo();
```  
2、也可以判断一个实例是否是其父类型或者祖先类型的实例。  
```js
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}
const auto = new Car('Honda', 'Accord', 1998);

console.log(auto instanceof Car);
// expected output: true

console.log(auto instanceof Object);
// expected output: true
```  

### JavaScrtip原型链  
关于原型和原型链，可以阅读上面的文章[原型、原型链](/view/#原型、原型链)

### Symbol.hasInstance  
对象的`Symbol.hasInstance`属性，指向一个内部方法。当其他对象使用`instanceof`运算符，判断是否为该对象的实例时，会调用这个方法。比如，`foo instanceof Foo`在语言内部，实际调用的是`Foo[Symbol.hasInstance](foo)`。  
```js
class MyClass{
  [Symbol.hasInstance](foo) {
    return foo instanceof Arrya;
  }
}

[1, 2, 3] instanceof new MyClass() // true
```  

### 总结  
看完之后，脑子里可以把上面的内容串一下；看看下面的几个问题是否可以立刻想出来  
* `JavaScript`有哪几种类型，都有哪些判断数据类型的操作，返回值是什么，原理是什么
* `typeof null`为什么是`"object"`
* 什么是`原型`，哪里是`[[prototype]]`的"尽头"，为什么要这么设计
* `JavaScript`原型链的核心是什么
* `instanceof`的原理是什么
* `Symbol.hasInstance`又是什么（或者你自己实现一个`instanceof`）

***

## 柯里化   
### 定义  
维基百科中对柯里化（Currying）的定义为：  
> In mathematics and computer science, currying is the technique of translating the evaluation of a function that takes multiple arguments (or a tuple of arguments) into evaluating a sequence of functions, each with a single argument.  

翻译成中文：  
在数学和计算机科学中，柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。  

举个例子：  
```js
function add(a, b) {
  return a + b
}

// 执行 add 函数，一次传入两个参数即可
add(1, 2) // 3

// 假设有一个 curry 函数可以做到柯里化
var addCurry = curry(add);
addCurry(1)(2) // 3
```  

### 用途  
我们会讲到如何写出这个 curry 函数，并且会将这个 curry 函数写得很强大，但是在编写之前，我们需要知道柯里化到底有什么用？  
举个例子：  
```js
// 示例而已
function ajax(type, url, data) {
  var xhr = new XMLHttpRequest();
  xhr.open(type, url, true);
  xhr.send(data);
}

// 虽然 ajax 这个函数非常通用，但在重复调用的时候参数冗余
ajax('POST', 'www.test.com', 'name=kevin')
ajax('POST', 'www.test2.com', 'name=kevin')
ajax('POST', 'www.test3.com', 'name=kevin')

// 利用 curry
var ajaxCurry = curry(ajax);

// 以 POST 类型请求来自于 www.test.com 的数据
var postFromTest = post('www.test.com');
postFromTest('name=kevin');
```  
想想`jQuery`虽然有`$.ajax`这样通用的方法，但是也有`$.get`和`$.post`的语法糖。（当然jQuery底层是否是这样做的，我就没有研究了）。  

`curry`的这种用途可以理解为：参数复用。本质上是降低通用性，提高适用性。  
可以是即便如此，是不是依然感觉没什么用呢？  
如果我们仅仅是把参数一个一个传进去，意义可能不大，但是如果我们是把柯里化后的函数传给其他函数比如map呢？  
举个例子：  
比如有这样一段数据：  
```js
var person = [{name: 'kevin'}, {name: 'daisy'}]
```  
如果要获取所有的name值，可以这样做：  
```js
var name = person.map(function(item) {
  return item.name
})
```  
不过如果有`curry`函数  
```js
var prop = curry(function(key, obj) {
  return obj[key]
});

var name = person.map(prop('name'))
```  
为了获取`name`属性还要再编写一个`prop函数`，是不是又麻烦了些？  
但是要注意，`prop函数`编写一次后，以后可以多次使用，实际上代码从原本的三行精简成了一行，而且你看代码是不是更加易懂了？  
`person.map(prop('name'))`就好像直白的告诉你：person对象遍历(map)获取(prop)name属性。  

### 第一版  
未来会接触到更多有关柯里化的应用，不过那是未来的事情了，现在该编写这个`curry函数`了。  
```js
// 第一版
var curry = function(fn) {
  var args = [].slice.call(arguments, 1);
  return function() {
    var newArgs = args.concat([].slice.call(arguments));
    return fn.apply(this, newArgs);
  };
};
```  
可以这样使用  
```js
function add(a, b) {
  return a + b;
}

var addCurry = curry(add, 1, 2);
addCurry() // 3

var addCurry = curry(add, 1);
addCurry(2) // 3

var addCurry = curry(add);
addCurry(1, 2) // 3
```  
已经有柯里化的感觉了，但是还没有达到要求，不过我们可以把这个函数用作辅助函数，帮助我们写真正的`curry函数`。  

### 第二版  
```js
// 第二版
function sub_curry(fn) {
  var args = [].slice.call(arguments, 1);
  return function() {
    return fn.apply(this, args.concat([].slice.call(arguments)));
  };
}

function curry(fn, length) {
  length = length || fn.length;

  var slice = Array.prototype.slice;

  return function() {
    if (arguments.length < length) {
      var combined = [fn].concat(slice.call(arguments));
      return curry(sub_curry.apply(this, combined), length - arguments.length);
    } else {
      return fn.apply(this, arguments);
    }
  }
}
```  
验证下这个函数  
```js
var fn = curry(function(a, b, c) {
  return [a, b, c]
})
fn('a', 'b', 'c') // ['a', 'b', 'c']
fn('a', 'b')('c') // ['a', 'b', 'c']
fn('a')('b')('c') // ['a', 'b', 'c']
fn('a')('b', 'c') // ['a', 'b', 'c']
```  
效果已经达到需要的预期，然而这个`curry函数`的实现好难理解....  
为了让大家更好的理解这个`curry函数`，给大家写个极简版的代码：  
```js
function sub_curry(fn) {
  return function() {
    return fn()
  }
}

function curry(fn, length) {
  length = length || 4;
  return function() {
    if (length > 1) {
      return curry(sub_curry(fn), --length)
    } else {
      return fn()
  }
}

var fn0 = function() {
  console.log(1)
}

var fn1 = curry(fn0)
fn1()()()() // 1
```  
先从理解这个`curry函数`开始。  

当执行fn1()时，函数返回：  
```js
curry(sub_curry(fn0))
// 相当于
curry(function() {
  return fn0
})
```  
当执行fn1()()，函数返回：  
```js
curry(sub_curry(function() {
  return fn0
}))
// 相当于
curry(function() {
  return (function() {
    return fn0()
  })()
})
// 相当于
curry(function() {
  return fn0()
})
```  
当执行fn1()()()时，函数返回：  
```js
// 跟fn1()()的分析过程一样
curry(function() {
  return fn0()
})
```  
当执行fn1()()()()时，因为此时length > 2为false，所以执行fn():  
```js
fn()
// 相当于
（function() {
  return fn0()
})()
// 相当于
fn0()
// 执行fn0 函数，打印 1
```  
再回到真正的`curry函数`，以下面的例子为例：  
```js
var fn0 = function(a, b, c, d) {
  return [a, b, c, d];
}

var fn1 = curry(fn0);
fn1('a', 'b')('c')('d')
```  
当执行fn1('a', 'b')时：  
```js
fn1('a', 'b')
// 相当于
curry(sub_curry(fn0, 'a', 'b'))
// 相当于
// 注意... 只是一个示意，表示该函数执行时传入的参数会作为 fn0 后面的参数传入
curry(function(...) {
  return fn0('a', 'b', ...)
})
```  
当执行fn1('a', 'b')('c')时，函数返回：  
```js
curry(sub_curry(function(...){
  return fn0('a', 'b', '...')
}), 'c')
// 相当于
curry(function(...) {
  return (function(...) {return fn0('a', 'b', '...')})('c')
})
// 相当于
curry(function(...) {
  return fn0('a', 'b', 'c', '...')
})
```  
当执行fn1('a', 'b')('c')('d')时，此时arguments.length < length 为 false ，执行 fn(arguments)，相当于：  
```js
(function(...) {
  return fn0('a', 'b', 'c', '...')
})('d')
// 相当于
fn0('a', 'b', 'c', 'd')
```  
函数执行结束。  

所以，其实整段代码又很好理解：  
`sub_curry`的作用就是用函数包裹原函数，然后给原函数传入之前的参数，当执行`fn0(...)(...)`的时候，执行包裹函数，返回原函数，然后再调用`sub_curry`再包裹函数，然后将新的参数混合旧的参数再传入原函数，直到函数参数的数目达到要求为止。  

如果要明白`curry`函数的运行原理，还是要动手写一遍，尝试着分析执行步骤。  

### 更易懂的实现  
当然了，如果你觉得还是无法理解，你可以选择下面这种实现方式，可以实现同样的效果：  
```js
function curry(fn, args) {
  var length = fn.length;

  args = args || [];

  return function() {
    var _args = args.slice(0),
    arg, i
    
    for (i = 0; i < arguments.length; i++) {
      arg = arguments[i];
      _args.push(arg);
    }

    if (_args.length < length) {
      return curry.call(this, fn, _args);
    } else {
      return fn.apply(this, _args);
    }
  }
}

var fn = curry(function(a, b, c) {
  console.log([a, b, c])
})

fn('a', 'b', 'c') // ['a', 'b', 'c']
fn('a', 'b')('c') // ['a', 'b', 'c']
fn('a')('b')('c') // ['a', 'b', 'c']
fn('a')('b', 'c') // ['a', 'b', 'c']
```  
或许觉得这种方式更好理解，又能实现一样的效果，为什么不直接就讲这种呢？  
因为想给大家介绍实现的方法嘛，不能因为难以理解就不给大家介绍。。  

### 第三版  
`curry函数`写到这里其实已经很完善了，但是注意这个函数的传参顺序必须是从左到右，根据形参的顺序今次传入，如果我不想根据这个顺序传呢？  
可以创建一个占位符，比如这样：  
```js
var fn = curry(function(a, b, c) {
  console.log([a, b, c]);
});

fn('a', _, 'c')('b') // ['a', 'b', 'c']
```  
直接看第三版的代码：  
```js
// 第三版
function curry(fn, args, holes) {
  length = fn.length;

  args = args || [];

  holes = holes || [];

  return function() {
    var _args = args.slice(0),
    _holes = holes.slice(0),
    argsLen = args.length,
    holesLen = holes.length,
    arg, i, index = 0;

    for (i = 0; i < arguments.length; i++) {
      arg = arguments[i];
      // 处理类似 fn(1, _, _, 4)(_, 3) 这种情怀，index 需要指向 holes 正确的下标
      if (arg === _ && holesLen) {
        index++ 
        if (index > holesLen) {
          _args.push(arg);
          _holes.push(argsLen - 1 + index - holesLen)
        }
      }
      // 处理类似 fn(1)(_)这种情况
      else if (arg === _) {
        _args.push(arg);
        _holes.push(argsLen + i)
      }
      // 处理类似 fn(_, 2)(1)，这种情况
      else if (holesLen) {
        // fn(_, 2)(_, 3)
        if (index >= holesLen) {
          _args.push(arg);
        }
        // fn(_, 2)(1)用参数 1 替换占位符
        else {
          _args.splice(_holes[index], 1, arg);
          _holes.splice(index, 1)
        }
      } else {
        _args.push(arg);
      }
    }
    if (_holes.length || _args.length < length) {
      return curry.call(this, fn, _args, _holes);
    } else {
      return fn.apply(this, _args);
    }
  }
}

var _ = {};

var fn = curry(function(a, b, c, d, e) {
  console.log([a, b, c, d, e])
});

// 验证输出全部都是[1, 2, 3, 4, 5,]
fn(1, 2, 3, 4, 5);
fn(_, 2, 3, 4, 5)(1);
fn(1, _, 3, 4, 5)(2);
fn(1, _, 3,)(_, 4)(2)(5);
fn(1, _, _, 4)(_, 3)(2)(5);
fn(_, 2)(_, _, 4)(1)(3)(5);
```  

### 写在最后  
至此，已经实现了一个强大的`curry函数`，可是这个`curry函数`符合柯里化的定义吗？柯里化可是将一个多参数的函数转换成多个单参数的函数，但是现在我们不仅可以传入一个参数，还可以一次传入两个参数，甚至更多参数....这看起来更像一个柯里化`(curry)`和偏函数`(partial application)`的综合应用。

***


## v8垃圾回收机制
[查看出自掘金‘@小维FE’的文章](https://juejin.cn/post/6844904016325902344)

***

## 浮点数精度  
### 前言  
0.1 + 0.2 是否等于 0.3 作为一道经典的面试题，已经广外熟知，说起原因，能回答出这是浮点数精度总是导致，也能辩证的看待这并非是ECMAScript这门语言的问题，今天就是具体看一直背后的原因。  

### 数据类型  
ECMAScript中的 Number 类型使用 IEEE754 标准来表示整数和浮点数值。所谓 IEEE754 标准，全称 IEEE 二进制浮点数算术标准，这个标准定义了表示浮点数的格式等内容。  

在 IEEE754 中，规定了四种表示浮点数值的方式：单精确度（32位）、双精确度（64位）、延伸单精确度、与延伸双精确度。像 ECMAScript 采用的就是双精确度，也就是说，会用64位字节来储存一个浮点数。  

### 浮点数转二进制  
我们来看下 1020 用十进制的表示：  
> 1020 = 1 * 10^3 + 0 * 10^2 + 2 * 10^1 + 0 * 10^0  

所以 1020 用十进制表示就是 1020....  

如果 1020 用二进制来表示呢？  
> 1020 = 1 * 2^9 + 1 * 2^8 + 1 * 2^7 + 1 * 2^6 + 1 * 2^5 + 1 * 2^4 + 1 * 2^3 + 1 * 2^2 + 1 * 2^1 + 1 * 2^0  

所以 1020 的二进制为 1111111100  

那如果是 0.75 用二进制表示呢？同理应该是： 
> 0.75 = a * 2^-1 + b * 2^-2 + c* 2^-3 + d * 2^-4 + ...  
因为使用的是二进制，这里的abcd....的值要么是0，要么是1.  

那怎么算出 abcd..... 的值呢，可以两边不停的乘以2算出来，解法如下：  
> 0.75 = a * 2^-1 + b * 2^-2 + c * 2^-3 + d * 2^-4...  

两边同时乘以2  
> 1 + 0.5 = a * 2^0 + b * 2^-1 + c * 2^-2 + d * 2^-3...(所以a = 1)  

剩下的：  
> 0.5 = b * 2^-1 + c * 2^-2 + d * 2^-3...  

再同时乘以2  
> 1 + 0 = b * 2^0 + c * 2^-2 + d * 2^-3...(所以 b = 1)  

所以 0.75 用二进制表示就是0.ab，也就是0.11  

然而不是所有的数都像0.75那么好算，我们来算下0.1：  
```
0.1 = a * 2^-1 + b * 2^ -2 + c * 2^-3 + d * 2^-4 + ...

0 + 0.2 = a * 2^0 + b * 2^-1 + c * 2^-2 + ...  (a = 0)
0 + 0.4 = b * 2^0 + c * 2^-1 + d * 2^-2 + ...  (b = 0)
0 + 0.8 = c * 2^0 + d * 2^-1 + e * 2^-2 + ...  (c = 0)
0 + 0.6 = d * 2^0 + e * 2^-1 + f * 2^-2 + ...  (d = 1)
0 + 0.2 = e * 2^0 + f * 2^-1 + g * 2^-2 + ...  (e = 0)
0 + 0.4 = f * 2^0 + g * 2^-1 + h * 2^-2 + ...  (f = 0)
0 + 0.8 = g * 2^0 + h * 2^-1 + i * 2^-2 + ...  (g = 0)
0 + 0.6 = h * 2^0 + i * 2^-1 + j * 2^-2 + ...  (h = 1)
...
```  
然后你就会发现，这个计算在不停的循环，所以 0.1 用二进制表示就是 0.00011001100110011......  

### 浮点数的存储  
虽然0.1转成二进制时是一个无限循环的数，但计算机总要储存吧，我们知道ECMAScript使用64位字节来储存一个浮点数，那具体是怎么储存的呢？这就要说回 IEEE754 这个标准了，毕竟是这个标准规定了存储的方式。  

这个标准认为，一个浮点数（Value）可以这样表示：  
> Value = sign * exponent * fraction  

看起来很抽象的样子，简单理解就是科学计数法......  

比如 -1020，用科学计数法表示就是：  
> -1 * 10^3 * 1.02  

sign就是 -1，exponent 就是10^3, fraction就是1.02  
对于二进制也是一样，以0.1的二进制0.00011001100110011......这个数来说：  
可以表示为：  
> 1 * 2^4 * 1.1001100110011......   
其中sign就是1，exponent就是2^-4，fraction就是1.1001100110011......  
而当只做二进制科学计数法的表示时，这个Value的表示可以再具体一点变成：  
V = (-1)^S * (1 + Fraction) * 2^E  
(如果所有的浮点数都可以这样表示，那么存储的时候就把这其中会变化的一些值存储起来就好了)  
来一点点看：  
(-1)^S 表示符号位，当S = 0, V为正数；当S = 1，V为负数。  

再看(1 + Fraction)，这是因为所有的浮点数都可以表示为1.xxxx * 2^xxx的形式，前面的一定是1.xxx，那干脆我们就不存储这个1了，直接存后面的xxxxxx好了，这也就是Fraction的部分。  

最后再看2^E  
如果是1020.75，对应二进制就是1111111100.11，对应二进制科学计数法就是1 * 1.111111110011 * 2^9，E的值就是9，而如果是0.1，对应二进制是1 * 1.1001100110011...... * 2^-4，E的值就是-4，也就是说，E既可能是负数，又可能是正数，那问题就来了，那该怎么储存这个E呢？  

可以这样解决，假如用8位字节来存储E这个数，如果只有正数的话，储存的值的范围是0 ~ 254，而如果要储存正负数的话，值的范围就是-127 ~ 127，在存储的时候，把要存储的数字加上127，这样当要存-127的时候，我们存0，当存127的时候，存254，这样就解决了存负数的问题。对应的，当取值的时候，再减去127。  

所以呢，真到实际存储的时候，并不会直接存储E，而是会存储E + bias，当用8个字节的时候，这个bias就是127。  

所以，如果要存储一个浮点数，存S和Fraction和E + bias这三个值就好了，那具体要分配多少个字节位来存储这些数呢？  
IEEE754给出了标准：  

![IEEE754标准](../images/view/IEEE754.jpeg)  

在这个标准下：  
我们会用1位存储S，0表示正数，1表示负数。  
用11位存储E + bias，对于11位来说，bias的值是2^(11-1) - 1，也就是1023。  
用52位存储Fraction。  
举个例子，就拿0.1来看，对应二进制是1 * 1.1001100110011...... * 2^-4，Sign是0，E + bias是-4 + 1023 = 1019，1019用二进制表示是1111111011，Fraction是1001100110011......  
对应64个字节位的完整表示就是：  
> 0 01111111011 1001100110011001100110011001100110011001100110011010  

同理，0.2表示的完整表示是： 
> 0 01111111100 1001100110011001100110011001100110011001100110011010  

所以当0.1存下来的时候，就已经发生了精度丢失，当用浮点数进行运算的时候，使用的其实是精度丢失后的数。  

### 浮点数的运算  
关于浮点数的运算，一般由以下五个步骤完成：对阶、尾数运算、规格化、舍入处理、溢出判断。来简单看一下0.1和0.2的计算。  

首先是对阶，所谓对阶，就是把阶码调整为相同，比如0.1是1.1001100110011...... * 2^-4，阶码是-4，而0.2就是1.0011001100110... * 2^-3，阶码是-3，两个阶码不同，所以先调整为相同的阶码再进行计算，调整原则是小阶对大阶，也就是0.1的-4调整为-3，对应变成0.11001100110011...... * 2^3  

接下来是尾数计算：  
```
  0.1100110011001100110011001100110011001100110011001101
+ 1.1001100110011001100110011001100110011001100110011010
————————————————————————————————————————————————————————
 10.0110011001100110011001100110011001100110011001100111
```  

得到结果为 10.0110011001100110011001100110011001100110011001100111 * 2^-3  

将这个结果处理一下，即结果规格化，变成1.0011001100110011001100110011001100110011001100110011(1) * 2^-2  

括号里的1意思是说计算后这个1超出了范围，所以要被舍弃了。  

再然后是舍入，四舍五入对应到二进制中，就是0舍1入，因为我们要把括号里面的1丢了，所以这里会进1，结果变成  

1.0011001100110011001100110011001100110011001100110100 * 2^-2  

本来还有一个溢出判断，因为这里不涉及，就不讲了。  

所以最终的结果存成64位就是：  

> 0 01111111101 0011001100110011001100110011001100110011001100110100  

将它转换为10进制数就得到 0.30000000000000004440892098500626  

因为两次存储时的精度丢失加上一次运算时的精度丢失，最终导致了 0.1 + 0.2 !== 0.3  

### 其他  
```js
// 十进制转二进制
parseFloat(0.1).toString(2);
=> "0.0001100110011001100110011001100110011001100110011001101"

// 二进制转十进制
parseInt(1100100,2)
=> 100

// 以指定的精度返回该数值对象的字符串表示
(0.1 + 0.2).toPrecision(21)
=> "0.300000000000000044409"
(0.3).toPrecision(21)
=> "0.299999999999999988898"
```

***

## 事件循环机制

### 前言  
web开发者都知道，JavaScript从诞生之日起就是一门单线程的非阻塞的脚本语言。这是由其最初的用途来决定的：与浏览器交互。  
单线程意味着，JavaScript代码在执行的任何时候，都只有一个主线程来处理所有的任务。  

而非阻塞则是当代码需要进行一项异步任务，（无法立刻返回结果，需要花一定时间才能返回的任务，如I/O事件）的时候，主线程会挂起（pending）这个任务，然后在异步任务返回结果的时候再根据一定规则去执行相应的回调。  

单线程是必要的，也JavaScript这门语言的基石，原因之一在其最初也是最主要的执行环境————浏览器中，我们需要进行各种各样的dom操作。试想一下如果JavaScript是多线程的，那么当两个线程同时对dom进行一项操作，例如一个向其添加事件，而另一个删除了这个dom，此时该如何处理呢？因此，为了保证不会发生类似于这个例子中的情景，JavaScript选择只用一个主线程来执行代码，这样就保证了程序执行的一致性。  

当然，现如今人们也意识到，单线程在保证了执行顺序的同时也限制了JavaScript的效率，因此开发出了web worker技术。这项技术号称让JavaScript成为一门多线程语言。  

然而，使用web worker技术开发的多线程有着诸多限制，例如：所有新线程都受主线程的完全控制，不能独立执行。这意味着这些”线程“实际上应属性主线程的子线程。另外，这些子线程并没有执行I/O操作的权限，只能为主线程分担一些诸如计算等任务。所以严格来讲这些线程并没有完整的功能，也因此这项技术并非改变了JavaScript语言的单线程本质。  

可以预见，未来的JavaScript也会一直是一门单线程的语言。  

话说回来，前面提到JavaScript的另一个特点是”非阻塞“，那么JavaScript引擎到底是如何实现的这一点呢？答案就是这篇文章的主角———— event loop(事件循环)  

*注：虽然nodejs中的也存在与传统浏览器环境下的相似的事件循环。然而两者间却有着诸多不同，故把两者分开，单独解释。*

### 正文  

#### 浏览器环境下的js引擎的事件循环机制  
#### 1、执行栈与事件队列  
当javascript代码执行的时候会将不同的变量存于内存中的不同位置：堆（heap）和栈（stack）中来加以区分。其中，堆里存放着一些对象。而栈中则存放着一些基础类型变量以及对象的指针。 但是我们这里说的执行栈和上面这个栈的意义却有些不同。

我们知道，当我们调用一个方法的时候，js会生成一个与这个方法对应的执行环境（context），又叫执行上下文。这个执行环境中存在着这个方法的私有作用域，上层作用域的指向，方法的参数，这个作用域中定义的变量以及这个作用域的this对象。 而当一系列方法被依次调用的时候，因为js是单线程的，同一时间只能执行一个方法，于是这些方法被排队在一个单独的地方。这个地方被称为执行栈。

当一个脚本第一次执行的时候，js引擎会解析这段代码，并将其中的同步代码按照执行顺序加入执行栈中，然后从头开始执行。如果当前执行的是一个方法，那么js会向执行栈中添加这个方法的执行环境，然后进入这个执行环境继续执行其中的代码。当这个执行环境中的代码 执行完毕并返回结果后，js会退出这个执行环境并把这个执行环境销毁，回到上一个方法的执行环境。。这个过程反复进行，直到执行栈中的代码全部执行完毕。

下面这个图片非常直观的展示了这个过程，其中的global就是初次运行脚本时向执行栈中加入的代码：  
![事件循环机制](../images/view/event-loop1.gif)  

从图片可知，一个方法执行会向执行栈中加入这个方法的执行环境，在这个执行环境中还可以调用其他方法，甚至是自己，其结果不过是在执行栈中再添加一个执行环境。这个过程可以是无限进行下去的，除非发生了栈溢出，即超过了所能使用内存的最大值。

以上的过程说的都是同步代码的执行。那么当一个异步代码（如发送ajax请求数据）执行后会如何呢？前文提过，js的另一大特点是非阻塞，实现这一点的关键在于下面要说的这项机制——事件队列（Task Queue）。

js引擎遇到一个异步事件后并不会一直等待其返回结果，而是会将这个事件挂起，继续执行执行栈中的其他任务。当一个异步事件返回结果后，js会将这个事件加入与当前执行栈不同的另一个队列，我们称之为事件队列。被放入事件队列不会立刻执行其回调，而是等待当前执行栈中的所有任务都执行完毕， 主线程处于闲置状态时，主线程会去查找事件队列是否有任务。如果有，那么主线程会从中取出排在第一位的事件，并把这个事件对应的回调放入执行栈中，然后执行其中的同步代码...，如此反复，这样就形成了一个无限的循环。这就是这个过程被称为“事件循环（Event Loop）”的原因。

这里还有一张图来展示这个过程：  
![事件循环机制](../images/view/event-loop2.png)  
图中的stack表示我们所说的执行栈，web apis则是代表一些异步事件，而callback queue即事件队列。  

#### 2、macro task与micro task  

以上的事件循环过程是一个宏观的表述，实际上因为异步任务之间并不相同，因此他们的执行优先级也有区别。不同的异步任务被分为两类：微任务（micro task）和宏任务（macro task）。

以下事件属于宏任务：
* setInterval()
* setTimeout()

以下事件属性微任务：  
* new Promise()
* new MutaionObserver()  

前面我们介绍过，在一个事件循环中，异步事件返回结果后会被放到一个任务队列中。然而，根据这个异步事件的类型，这个事件实际上会被对应的宏任务队列或者微任务队列中去。并且在当前执行栈为空的时候，主线程会 查看微任务队列是否有事件存在。如果不存在，那么再去宏任务队列中取出一个事件并把对应的回到加入当前执行栈；如果存在，则会依次执行队列中事件对应的回调，直到微任务队列为空，然后去宏任务队列中取出最前面的一个事件，把对应的回调加入当前执行栈...如此反复，进入循环。

我们只需记住 **当前执行栈执行完毕时会立刻先处理所有微任务队列中的事件，然后再去宏任务队列中取出一个事件。同一次事件循环中，微任务永远在宏任务之前执行。**  

这样就能解释下面这段代码的结果：  
```js
setTimeout(function () {
    console.log(1);
});

new Promise(function(resolve,reject){
    console.log(2)
    resolve(3)
}).then(function(val){
    console.log(val);
})
```  
结果为：  
```
2
3
1
```  

### node环境下的事件循环机制  

#### 1、与浏览器环境有何不同?  
在node中，事件循环表现出的状态与浏览器中大致相同。不同的是node中有一套自己的模型。node中事件循环的实现是依靠的libuv引擎。我们知道node选择chrome v8引擎作为js解释器，v8引擎将js代码分析后去调用对应的node api，而这些api最后则由libuv引擎驱动，执行对应的任务，并把不同的事件放在不同的队列中等待主线程执行。 因此实际上node中的事件循环存在于libuv引擎中。  

#### 2、事件循环模型  
下面是一个libuv引擎中的事件循环的模型：  
```js

┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<──connections───     │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘

```  
*注：模型中的每一个方块代表事件循环的一个阶段*  

这个模型是node官网上的一篇文章中给出的，我下面的解释也都来源于这篇文章。我会在文末把文章地址贴出来，有兴趣的朋友可以亲自与看看原文。

#### 3、事件循环各阶段详解  
从上面这个模型中，我们可以大致分析出node中的事件循环的顺序：

外部输入数据-->轮询阶段(poll)-->检查阶段(check)-->关闭事件回调阶段(close callback)-->定时器检测阶段(timer)-->I/O事件回调阶段(I/O callbacks)-->闲置阶段(idle, prepare)-->轮询阶段...

以上各阶段的名称是根据我个人理解的翻译，为了避免错误和歧义，下面解释的时候会用英文来表示这些阶段。

这些阶段大致的功能如下：

timers: 这个阶段执行定时器队列中的回调如 setTimeout() 和 setInterval()。
I/O callbacks: 这个阶段执行几乎所有的回调。但是不包括close事件，定时器和setImmediate()的回调。
idle, prepare: 这个阶段仅在内部使用，可以不必理会。
poll: 等待新的I/O事件，node在一些特殊情况下会阻塞在这里。
check: setImmediate()的回调会在这个阶段执行。
close callbacks: 例如socket.on('close', ...)这种close事件的回调。
下面我们来按照代码第一次进入libuv引擎后的顺序来详细解说这些阶段：  

#### poll阶段  
当个v8引擎将js代码解析后传入libuv引擎后，循环首先进入poll阶段。poll阶段的执行逻辑如下： 先查看poll queue中是否有事件，有任务就按先进先出的顺序依次执行回调。 当queue为空时，会检查是否有setImmediate()的callback，如果有就进入check阶段执行这些callback。但同时也会检查是否有到期的timer，如果有，就把这些到期的timer的callback按照调用顺序放到timer queue中，之后循环会进入timer阶段执行queue中的 callback。 这两者的顺序是不固定的，收到代码运行的环境的影响。如果两者的queue都是空的，那么loop会在poll阶段停留，直到有一个i/o事件返回，循环会进入i/o callback阶段并立即执行这个事件的callback。

值得注意的是，poll阶段在执行poll queue中的回调时实际上不会无限的执行下去。有两种情况poll阶段会终止执行poll queue中的下一个回调：1.所有回调执行完毕。2.执行数超过了node的限制。  

#### check阶段  
check阶段专门用来执行setImmediate()方法的回调，当poll阶段进入空闲状态，并且setImmediate queue中有callback时，事件循环进入这个阶段。

#### close阶段  
当一个socket连接或者一个handle被突然关闭时（例如调用了socket.destroy()方法），close事件会被发送到这个阶段执行回调。否则事件会用process.nextTick（）方法发送出去。  

#### timer阶段  
这个阶段以先进先出的方式执行所有到期的timer加入timer队列里的callback，一个timer callback指得是一个通过setTimeout或者setInterval函数设置的回调函数。  

#### I/O callback阶段  
如上文所言，这个阶段主要执行大部分I/O事件的回调，包括一些为操作系统执行的回调。例如一个TCP连接生错误时，系统需要执行回调来获得这个错误的报告。  

#### 4、process.nextTick,setTimeout与setImmediate的区别与使用场景  
在node中有三个常用的用来推迟任务执行的方法：process.nextTick,setTimeout（setInterval与之相同）与setImmediate

这三者间存在着一些非常不同的区别：  

#### process.nextTick()  
尽管没有提及，但是实际上node中存在着一个特殊的队列，即nextTick queue。这个队列中的回调执行虽然没有被表示为一个阶段，当时这些事件却会在每一个阶段执行完毕准备进入下一个阶段时优先执行。当事件循环准备进入下一个阶段之前，会先检查nextTick queue中是否有任务，如果有，那么会先清空这个队列。与执行poll queue中的任务不同的是，这个操作在队列清空前是不会停止的。这也就意味着，错误的使用process.nextTick()方法会导致node进入一个死循环。。直到内存泄漏。

那么合适使用这个方法比较合适呢？下面有一个例子：  
```js
const server = net.createServer(() => {}).listen(8080);

server.on('listening', () => {});
```  
这个例子中当，当listen方法被调用时，除非端口被占用，否则会立刻绑定在对应的端口上。这意味着此时这个端口可以立刻触发listening事件并执行其回调。然而，这时候on('listening)还没有将callback设置好，自然没有callback可以执行。为了避免出现这种情况，node会在listen事件中使用process.nextTick()方法，确保事件在回调函数绑定后被触发。  

#### setTimeout()和setImmediate()  
在三个方法中，这两个方法最容易被弄混。实际上，某些情况下这两个方法的表现也非常相似。然而实际上，这两个方法的意义却大为不同。

setTimeout()方法是定义一个回调，并且希望这个回调在我们所指定的时间间隔后第一时间去执行。注意这个“第一时间执行”，这意味着，受到操作系统和当前执行任务的诸多影响，该回调并不会在我们预期的时间间隔后精准的执行。执行的时间存在一定的延迟和误差，这是不可避免的。node会在可以执行timer回调的第一时间去执行你所设定的任务。

setImmediate()方法从意义上将是立刻执行的意思，但是实际上它却是在一个固定的阶段才会执行回调，即poll阶段之后。有趣的是，这个名字的意义和之前提到过的process.nextTick()方法才是最匹配的。node的开发者们也清楚这两个方法的命名上存在一定的混淆，他们表示不会把这两个方法的名字调换过来---因为有大量的node程序使用着这两个方法，调换命名所带来的好处与它的影响相比不值一提。

setTimeout()和不设置时间间隔的setImmediate()表现上及其相似。猜猜下面这段代码的结果是什么？  
```js
setTimeout(() => {
    console.log('timeout');
}, 0);

setImmediate(() => {
    console.log('immediate');
});
```  
实际上，答案是不一定。没错，就连node的开发者都无法准确的判断这两者的顺序谁前谁后。这取决于这段代码的运行环境。运行环境中的各种复杂的情况会导致在同步队列里两个方法的顺序随机决定。但是，在一种情况下可以准确判断两个方法回调的执行顺序，那就是在一个I/O事件的回调中。下面这段代码的顺序永远是固定的：  
```js
const fs = require('fs');

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0);
    setImmediate(() => {
        console.log('immediate');
    });
});
```  
答案永远是：
```
immediate
timeout
```  
因为在I/O事件的回调中，setImmediate方法的回调永远在timer的回调前执行。

### 结尾  
JavaScript的事件循环是这门语言中非常重要且基础的概念。清楚的了解了事件循环的执行顺序和每一个阶段的特点，可以使我们对一段异步代码的执行顺序有一个清晰的认识，从而减少代码运行的不确定性。合理的使用各种延迟事件的方法，有助于代码更好的按照其优先级去执行。这篇文章期望用最易理解的方式和语言准确描述事件循环这个复杂过程，但由于作者自己水平有限，文章中难免出现疏漏。如果您发现了文章中的一些问题，欢迎在留言中提出，我会尽量回复这些评论，把错误更正。


***

## Promise原理  
Promise 必须为以下三种状态之一：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）。一旦Promise 被 resolve 或 reject，不能再迁移至其他任何状态（即状态 immutable）。  

基本过程：  

1. 初始化 Promise 状态（pending）  
2. 立即执行 Promise 中传入的 fn 函数，将Promise 内部 resolve、reject 函数作为参数传递给 fn ，按事件机制时机处理  
3. 执行 then(..) 注册回调处理数组（then 方法可被同一个 promise 调用多次）  
4. Promise里的关键是要保证，then方法传入的参数 onFulfilled 和 onRejected，必须在then方法被调用的那一轮事件循环之后的新执行栈中执行。  

真正的链式Promise是指在当前promise达到fulfilled状态后，即开始进行下一个promise.  

### 链式调用  

先从 Promise 执行结果看一下，有如下一段代码：
```js
new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({ test: 1 })
        resolve({ test: 2 })
        reject({ test: 2 })
    }, 1000)
}).then((data) => {
    console.log('result1', data)
},(data1)=>{
    console.log('result2',data1)
}).then((data) => {
    console.log('result3', data)
})
//result1 { test: 1 }
//result3 undefined

```  

显然这里输出了不同的 data。由此可以看出几点：
1. 可进行链式调用，且每次 then 返回了新的 Promise(2次打印结果不一致，如果是同一个实例，打印结果应该一致。
2. 只输出第一次 resolve 的内容，reject 的内容没有输出，即 Promise 是有状态且状态只可以由pending -> fulfilled或 pending-> rejected,是不可逆的。
3. then 中返回了新的 Promise,但是then中注册的回调仍然是属于上一个 Promise 的。

基于以上几点，我们先写个基于 PromiseA+ 规范的只含 resolve 方法的 Promise 模型:  
```js
function Promise(fn){ 
    let state = 'pending';
    let value = null;
    const callbacks = [];

    this.then = function (onFulfilled){
        return new Promise((resolve, reject)=>{
            handle({ //桥梁，将新 Promise 的 resolve 方法，放到前一个 promise 的回调对象中
                onFulfilled, 
                resolve
            })
        })
    }

    function handle(callback){
        if(state === 'pending'){
            callbacks.push(callback)
            return;
        }
        
        if(state === 'fulfilled'){
            if(!callback.onFulfilled){
                callback.resolve(value)
                return;
            }
            const ret = callback.onFulfilled(value) //处理回调
            callback.resolve(ret) //处理下一个 promise 的resolve
        }
    }
    function resolve(newValue){
        const fn = ()=>{
            if(state !== 'pending')return

            state = 'fulfilled';
            value = newValue
            handelCb()
        }
        
        setTimeout(fn,0) //基于 PromiseA+ 规范
    }
    
    function handelCb(){
        while(callbacks.length) {
            const fulfiledFn = callbacks.shift();
            handle(fulfiledFn);
        };
    }
    
    fn(resolve)
}
```  
这个模型简单易懂，这里最关键的点就是在 then 中新创建的 Promise，它的状态变为 fulfilled 的节点是在上一个 Promise的回调执行完毕的时候。也就是说当一个 Promise 的状态被 fulfilled 之后，会执行其回调函数，而回调函数返回的结果会被当作 value，返回给下一个 Promise(也就是then 中产生的 Promise)，同时下一个 Promise的状态也会被改变(执行 resolve 或 reject)，然后再去执行其回调,以此类推下去...链式调用的效应就出来了。  

但是如果仅仅是例子中的情况，我们可以这样写：  
```js
new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({ test: 1 })
    }, 1000)
}).then((data) => {
    console.log('result1', data)
    //dosomething
    console.log('result3')
})
//result1 { test: 1 }
//result3
```  

实际上，我们常用的链式调用，是用在异步回调中，以解决"回调地狱"的问题。如下例子：  
```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({ test: 1 })
  }, 1000)
}).then((data) => {
  console.log('result1', data)
  //dosomething
  return test()
}).then((data) => {
  console.log('result2', data)
})

function test(id) {
  return new Promise(((resolve) => {
    setTimeout(() => {
      resolve({ test: 2 })
    }, 5000)
  }))
}
//基于第一个 Promise 模型，执行后的输出
//result1 { test: 1 }
//result2 Promise {then: ƒ}
```  
用上面的 Promise 模型，得到的结果显然不是我们想要的。认真看上面的模型，执行 callback.resolve 时，传入的参数是 callback.onFulfilled 执行完成的返回，显然这个测试例子返回的就是一个 Promise，而我们的 Promise 模型中的 resolve 方法并没有特殊处理。那么我们将 resolve 改一下:  
```js
function Promise(fn){ 
    ...
    function resolve(newValue){
        const fn = ()=>{
            if(state !== 'pending')return

            if(newValue && (typeof newValue === 'object' || typeof newValue === 'function')){
                const {then} = newValue
                if(typeof then === 'function'){
                    // newValue 为新产生的 Promise,此时resolve为上个 promise 的resolve
                    //相当于调用了新产生 Promise 的then方法，注入了上个 promise 的resolve 为其回调
                    then.call(newValue,resolve)
                    return
                }
            }
            state = 'fulfilled';
            value = newValue
            handelCb()
        }
        
        setTimeout(fn,0)
    }
    ...
}
```  

用这个模型，再测试我们的例子，就得到了正确的结果：   
```js
new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({ test: 1 })
    }, 1000)
}).then((data) => {
    console.log('result1', data)
    //dosomething
    return test()
}).then((data) => {
    console.log('result2', data)
})

function test(id) {
    return new Promise(((resolve, reject) => {
        setTimeout(() => {
        resolve({ test: 2 })
        }, 5000)
    }))
}
//result1 { test: 1 }
//result2 { test: 2 }
```  
显然，新增的逻辑就是针对 resolve 入参为 Promise 的时候的处理。我们观察一下 test 里面创建的 Promise，它是没有调用 then方法的。从上面的分析我们已经知道 Promise 的回调函数就是通过调用其 then 方法注册的，因此 test 里面创建的 Promise 其回调函数为空。  

显然如果没有回调函数，执行 resolve 的时候，是没办法链式下去的。因此，我们需要主动为其注入回调函数。  

我们只要把第一个 then 中产生的 Promise 的 resolve 函数的执行，延迟到 test 里面的 Promise 的状态为 onFulfilled 的时候再执行，那么链式就可以继续了。所以，当 resolve 入参为 Promise 的时候，调用其 then 方法为其注入回调函数，而注入的是前一个 Promise 的 resolve 方法，所以要用 call 来绑定 this 的指向。  

基于新的 Promise 模型，上面的执行过程产生的 Promise 实例及其回调函数，可以用看下表：  

|  Promise   | 	callback  |
|  :----  | :----  |
| P1  | `[{onFulfilled:c1(第一个then中的fn),resolve:p2resolve}]` |
| P2 (P1 调用 then 时产生)  | `[{onFulfilled:c2(第二个then中的fn),resolve:p3resolve}]` |
| P3 (P2 调用 then 时产生)  | [] |
| P4 (执行c1中产生[调用 test ])  | `[{onFulfilled:p2resolve,resolve:p5resolve}]` |
| P5 (调用p2resolve 时，进入 then.call 逻辑中产生)  | [] |  

有了这个表格，我们就可以清晰知道各个实例中 callback 执行的顺序是：  
c1 -> p2resolve -> c2 -> p3resolve -> [] -> p5resolve -> []  
以上就是链式调用的原理了。

### reject  
下面我们再来补全 reject 的逻辑。只需要在注册回调、状态改变时加上 reject 的逻辑即可。  
完整代码如下:
```js
function Promise(fn){ 
  let state = 'pending';
  let value = null;
  const callbacks = [];

  this.then = function (onFulfilled,onRejected){
      return new Promise((resolve, reject)=>{
          handle({
              onFulfilled, 
              onRejected,
              resolve, 
              reject
          })
      })
  }

  function handle(callback){
      if(state === 'pending'){
          callbacks.push(callback)
          return;
      }
      
      const cb = state === 'fulfilled' ? callback.onFulfilled:callback.onRejected;
      const next = state === 'fulfilled'? callback.resolve:callback.reject;

      if(!cb){
          next(value)
          return;
      }
      const ret = cb(value)
      next(ret)
  }
  function resolve(newValue){
      const fn = ()=>{
          if(state !== 'pending')return

          if(newValue && (typeof newValue === 'object' || typeof newValue === 'function')){
              const {then} = newValue
              if(typeof then === 'function'){
                  // newValue 为新产生的 Promise,此时resolve为上个 promise 的resolve
                  //相当于调用了新产生 Promise 的then方法，注入了上个 promise 的resolve 为其回调
                  then.call(newValue,resolve, reject)
                  return
              }
          }
          state = 'fulfilled';
          value = newValue
          handelCb()
      }
      
      setTimeout(fn,0)
  }
  function reject(error){

      const fn = ()=>{
          if(state !== 'pending')return

          if(error && (typeof error === 'object' || typeof error === 'function')){
              const {then} = error
              if(typeof then === 'function'){
                  then.call(error,resolve, reject)
                  return
              }
          }
          state = 'rejected';
          value = error
          handelCb()
      }
      setTimeout(fn,0)
  }
  function handelCb(){
      while(callbacks.length) {
          const fn = callbacks.shift();
          handle(fn);
      };
  }
  fn(resolve, reject)
}
```  

### 异常处理  
异常通常是指在执行成功/失败回调时代码出错产生的错误，对于这类异常，我们使用 try-catch 来捕获错误，并将 Promise 设为 rejected 状态即可。

handle代码改造如下：  
```js
function handle(callback){
  if(state === 'pending'){
      callbacks.push(callback)
      return;
  }
  
  const cb = state === 'fulfilled' ? callback.onFulfilled:callback.onRejected;
  const next = state === 'fulfilled'? callback.resolve:callback.reject;

  if(!cb){
      next(value)
      return;
  }
  try {
      const ret = cb(value)
      next(ret)
  } catch (e) {
      callback.reject(e);
  }  
}
```  

我们实际使用时，常习惯注册 catch 方法来处理错误，例：
```js
new Promise((resolve, reject) => {
  setTimeout(() => {
      resolve({ test: 1 })
  }, 1000)
}).then((data) => {
  console.log('result1', data)
  //dosomething
  return test()
}).catch((ex) => {
  console.log('error', ex)
})
```  

实际上，错误也好，异常也罢，最终都是通过reject实现的。也就是说可以通过 then 中的错误回调来处理。所以我们可以增加这样的一个 catch 方法：  
```js
function Promise(fn){ 
  ...
  this.then = function (onFulfilled,onRejected){
      return new Promise((resolve, reject)=>{
          handle({
              onFulfilled, 
              onRejected,
              resolve, 
              reject
          })
      })
  }
  this.catch = function (onError){
      this.then(null,onError)
  }
  ...
}
```  

### Finally方法  
在实际应用的时候，我们很容易会碰到这样的场景，不管Promise最后的状态如何，都要执行一些最后的操作。我们把这些操作放到 finally 中，也就是说 finally 注册的函数是与 Promise 的状态无关的，不依赖 Promise 的执行结果。所以我们可以这样写 finally 的逻辑：  
```js
function Promise(fn){ 
  ...
  this.catch = function (onError){
      this.then(null,onError)
  }
  this.finally = function (onDone){
      this.then(onDone,onDone)
  }
  ...
}
```  

### resolve 方法和 reject 方法  
实际应用中，我们可以使用 Promise.resolve 和 Promise.reject 方法，用于将于将非 Promise 实例包装为 Promise 实例。如下例子：  
```js
Promise.resolve({name:'winty'})
Promise.reject({name:'winty'})
// 等价于
new Promise(resolve => resolve({name:'winty'}))
new Promise((resolve,reject) => reject({name:'winty'}))
```

这些情况下，Promise.resolve 的入参可能有以下几种情况：
* 无参数 [直接返回一个resolved状态的 Promise 对象]
* 普通数据对象 [直接返回一个resolved状态的 Promise 对象]
* 一个Promise实例 [直接返回当前实例]
* 一个thenable对象(thenable对象指的是具有then方法的对象) [转为 Promise 对象，并立即执行thenable对象的then方法。]  

基于以上几点，我们可以实现一个 Promise.resolve 方法如下：  
```js
function Promise(fn){ 
  ...
  this.resolve = function (value){
    if (value && value instanceof Promise) {
      return value;
    } else if (value && typeof value === 'object' && typeof value.then === 'function'){
      let then = value.then;
      return new Promise(resolve => {
          then(resolve);
      });
    } else if (value) {
      return new Promise(resolve => resolve(value));
    } else {
      return new Promise(resolve => resolve());
    }
  }
  ...
}
```

Promise.reject与Promise.resolve类似，区别在于Promise.reject始终返回一个状态的rejected的  
Promise实例，而Promise.resolve的参数如果是一个Promise实例的话，返回的是参数对应的
Promise实例，所以状态不一 定。 因此，reject 的实现就简单多了，如下：  
```js
function Promise(fn){ 
  ...
  this.reject = function (value){
    return new Promise(function(resolve, reject) {
      reject(value);
    });
  }
  ...
}
```

### Promise.all  
入参是一个 Promise 的实例数组，然后注册一个 then 方法，然后是数组中的 Promise 实例的状态都转为 fulfilled 之后则执行 then 方法。这里主要就是一个计数逻辑，每当一个 Promise 的状态变为 fulfilled 之后就保存该实例返回的数据，然后将计数减一，当计数器变为 0 时，代表数组中所有 Promise 实例都执行完毕。

```js
function Promise(fn){ 
  ...
  this.all = function (arr){
    var args = Array.prototype.slice.call(arr);
    return new Promise(function(resolve, reject) {
      if(args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if(val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if(typeof then === 'function') {
              then.call(val, function(val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if(--remaining === 0) {
            resolve(args);
          }
        } catch(ex) {
          reject(ex);
        }
      }
      for(var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  }
  ...
}
```  

### Promise.race  
有了 Promise.all 的理解，Promise.race 理解起来就更容易了。它的入参也是一个 Promise 实例数组，然后其 then 注册的回调方法是数组中的某一个 Promise 的状态变为 fulfilled 的时候就执行。因为 Promise 的状态只能改变一次，那么我们只需要把 Promise.race 中产生的 Promise 对象的 resolve 方法，注入到数组中的每一个 Promise 实例中的回调函数中即可。

```js
function Promise(fn){ 
  ...
  this.race = function(values) {
    return new Promise(function(resolve, reject) {
      for(var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  }
  ...
}  
```

### 总结  
Promise 源码不过几百行，我们可以从执行结果出发，分析每一步的执行过程，然后思考其作用即可。其中最关键的点就是要理解 then 函数是负责注册回调的，真正的执行是在 Promise 的状态被改变之后。而当 resolve 的入参是一个 Promise 时，要想链式调用起来，就必须调用其 then 方法(then.call),将上一个 Promise 的 resolve 方法注入其回调数组中。

### 补充说明  
虽然 then 普遍认为是微任务。但是浏览器没办法模拟微任务，目前要么用 setImmediate ，这个也是宏任务，且不兼容的情况下还是用 setTimeout 打底的。还有，promise 的 polyfill (es6-promise) 里用的也是 setTimeout。因此这里就直接用 setTimeout,以宏任务来代替微任务了。

### 参考资料  
* [PromiseA+规范](https://promisesaplus.com/)
* [Promise 实现原理精解](https://zhuanlan.zhihu.com/p/58428287)
* [30分钟，让你彻底明白Promise原理](https://mengera88.github.io/2017/05/18/Promise%E5%8E%9F%E7%90%86%E8%A7%A3%E6%9E%90/)

### 完整 Promise 模型  
```js
function Promise(fn) {
  let state = 'pending'
  let value = null
  const callbacks = []

  this.then = function (onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      handle({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      })
    })
  }

  this.catch = function (onError) {
    return this.then(null, onError)
  }

  this.finally = function (onDone) {
    this.then(onDone, onError)
  }

  this.resolve = function (value) {
    if (value && value instanceof Promise) {
      return value
    } if (value && typeof value === 'object' && typeof value.then === 'function') {
      const { then } = value
      return new Promise((resolve) => {
        then(resolve)
      })
    } if (value) {
      return new Promise(resolve => resolve(value))
    }
    return new Promise(resolve => resolve())
  }

  this.reject = function (value) {
    return new Promise(((resolve, reject) => {
      reject(value)
    }))
  }

  this.all = function (arr) {
    const args = Array.prototype.slice.call(arr)
    return new Promise(((resolve, reject) => {
      if (args.length === 0) return resolve([])
      let remaining = args.length

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            const { then } = val
            if (typeof then === 'function') {
              then.call(val, (val) => {
                res(i, val)
              }, reject)
              return
            }
          }
          args[i] = val
          if (--remaining === 0) {
            resolve(args)
          }
        } catch (ex) {
          reject(ex)
        }
      }
      for (let i = 0; i < args.length; i++) {
        res(i, args[i])
      }
    }))
  }

  this.race = function (values) {
    return new Promise(((resolve, reject) => {
      for (let i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject)
      }
    }))
  }

  function handle(callback) {
    if (state === 'pending') {
      callbacks.push(callback)
      return
    }

    const cb = state === 'fulfilled' ? callback.onFulfilled : callback.onRejected
    const next = state === 'fulfilled' ? callback.resolve : callback.reject

    if (!cb) {
      next(value)
      return
    }	
    let ret;
    try {
     ret = cb(value)
    } catch (e) {
      callback.reject(e)
    }
	callback.resolve(ret);
  }
  function resolve(newValue) {
    const fn = () => {
      if (state !== 'pending') return

      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        const { then } = newValue
        if (typeof then === 'function') {
          // newValue 为新产生的 Promise,此时resolve为上个 promise 的resolve
          // 相当于调用了新产生 Promise 的then方法，注入了上个 promise 的resolve 为其回调
          then.call(newValue, resolve, reject)
          return
        }
      }
      state = 'fulfilled'
      value = newValue
      handelCb()
    }

    setTimeout(fn, 0)
  }
  function reject(error) {
    const fn = () => {
      if (state !== 'pending') return

      if (error && (typeof error === 'object' || typeof error === 'function')) {
        const { then } = error
        if (typeof then === 'function') {
          then.call(error, resolve, reject)
          return
        }
      }
      state = 'rejected'
      value = error
      handelCb()
    }
    setTimeout(fn, 0)
  }
  function handelCb() {
    while (callbacks.length) {
      const fn = callbacks.shift()
      handle(fn)
    }
  }
  try {
  fn(resolve, reject)
  } catch(ex) {
	reject(ex);
  }
}
```

***

## generator原理


***