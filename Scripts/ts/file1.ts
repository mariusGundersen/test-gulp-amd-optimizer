import Greeter from "app";

window.onload = () => {
    debugger;
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};