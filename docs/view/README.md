---
sidebar: auto
sidebarDepth: 2
---

# 前端基础

## JavaScript基础知识

### 原型、原型链

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

#### prototype

每个函数都有一个`prototype`属性，就是我们经常在各种例子中看到的那个`prototype`。

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

#### \_\_proto\_\_

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

#### constructor
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

#### 实例与原型

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

#### 原型的原型

在前面，已经讲了原型也是一个对象，既然是对象，就可以用最原始的方式创建它，那就是：  
```js
var obj = new Object();
obj.name = 'xiaoming';
console.log(obj.name); // xiaoming
```  
其实原型对象就是通过`Object`构造函数生成的，结合之前所讲的，实例的`__proto__`指向构造函数的`prototype`，所以再更新下关系图：  
![原型和原型链关系图4](../images/view/prototype4.png)

#### 原型链

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

### 继承

记录JavaScript各种继承方式和优缺点。

#### 1、原型链继承  
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

#### 2、借用构造函数（经典继承）  
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

#### 3、组合继承  
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

#### 4、原型式继承  
```js
function createObj(o) {
  function F() {}
  F.prototype = 0;
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
注意：修改`person1.name`的值，`person2.name`的值并未发生改变，并不是因为`person1`和`person2`有独立的`name`值，而是因为`persion1.name = 'persion1'`，给`persion1`添加了`name`值，并非修改了原型上的`name`值。

#### 5、寄生式继承  
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

#### 6、寄生组合式继承  
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

### 闭包

### 变量提升

### this的指向

### 立即执行函数

### instanceof原理

### bind的实现

### apply和call

### 柯里化

### v8垃圾回收机制

### 浮点数精度

### new操作符

### 事件循环机制

### promise原理

### generator原理