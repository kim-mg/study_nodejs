// array, object

var f = function(){
  console.log(1+1);
}

// if나 while은 변수가 될 수 없다.
// var i = if(true){console.log(1)};
// var w = while(true){console.log(1)};

// 변수로써 사용되며 나타낼 수 있고
console.log(f);
f();

// 배열로써 사용할 수도 있다.
var a = [f];
a[0]();

// 오브젝트로도 사용할 수 있다.
var o = {
  func:f
}
o.func();
