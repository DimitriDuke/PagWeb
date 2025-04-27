var apartado = document.querySelector(".apartado");

//window.addEventListener("scroll", function()());

window.onscroll = function()
{
    apartado.classList.add(".aparecer-apartado");

    var distancia = window.innerHeight - apartado.getBoundingClientRect().top;
    if(distancia >= 38)
    {
        apartado.classList.add("aparecer-apartado")
    }

    console.log(distancia);
};