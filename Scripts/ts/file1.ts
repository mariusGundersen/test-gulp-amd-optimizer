import Greeter from "app";

export default function init(){
    console.log('init');
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};

console.log('onload');