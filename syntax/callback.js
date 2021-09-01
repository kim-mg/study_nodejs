// function a(){
//   console.log('A');
// }
// 함수는 값이다.
var a = function(){
  console.log('A');
}

function slowfunc(callback){
  callback();
}

slowfunc(a);
