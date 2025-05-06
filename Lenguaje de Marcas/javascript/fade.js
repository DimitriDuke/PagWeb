document.addEventListener("DOMContentLoaded", function () {
    var apartadoInfo = document.querySelector(".apartadoInfo")
    var apartadoComoJugar = document.querySelector(".apartadoComoJugar")
    var apartado = document.querySelector(".apartado");
    var apartado2 = document.querySelector(".apartado2");
    var apartado3 = document.querySelector(".apartado3");

    setTimeout(function () {
        apartadoComoJugar.classList.add("aparecer-apartadoComoJugar")
    }, 200);

    setTimeout(function () {
        apartadoInfo.classList.add("aparecer-apartadoInfo")
    }, 200);

    setTimeout(function () {
        apartado.classList.add("aparecer-apartado");
        
    }, 300);

    setTimeout(function () {
        apartado2.classList.add("aparecer-apartado2");
        
    }, 500);

    setTimeout(function () {
        apartado3.classList.add("aparecer-apartado3");
        
    }, 700);
});