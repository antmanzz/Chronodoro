import Dispositivo from "../app.antman.reloj/dispositivo.js";

const dispositivo = new Dispositivo();
const temporizador = new Worker("../app.antman.reloj/temporizador.js");

/*
* Operación del sistema para iniciar la actividad del temporizador
*/
function iniciar_temporizador() {
    let estado = {
        minutero: dispositivo.leer_minutero(),
        segundero : dispositivo.leer_segundero()
    }
    temporizador.postMessage({ mensaje: "start", contenido: estado });
}
/*
* Operación del sistema para pausar la actividad del temporizador
*/
function pausar_temporizador() {
    let estado = undefined;
    temporizador.postMessage({ mensaje: "pause", contenido: estado });
}
/*
* Operación del sistema para detener la actividad del temporizador
*/
function detener_temporizador() {
    let estado = {
        minutero: dispositivo.leer_minutero(),
        segundero: dispositivo.leer_segundero(),
        duracion_ciclos: dispositivo.leer_longitud_ciclos(),
        iteraciones: dispositivo.leer_cuenta_iteraciones(),
        ciclos: dispositivo.leer_cuenta_ciclos(),
        duracion_iteracion: dispositivo.leer_duracion_iteracion()
    };
    temporizador.postMessage({ mensaje: "stop", contenido: estado });
}
/*
* Operación del sistema para cambiar la iteración a la siguiente
* fase de la actividad actual del temporizador
*/
function cambiar_iteracion_temporizador() {
    let estado = {
        duracion_ciclos: dispositivo.leer_longitud_ciclos(),
        minutero: dispositivo.leer_minutero(),
        segundero: dispositivo.leer_segundero(),
        duracion_descanso_corto: dispositivo.leer_descanso_corto(),
        iteraciones: dispositivo.leer_cuenta_iteraciones(),
        duracion_descanso_largo: dispositivo.leer_descanso_largo(),
        ciclos: dispositivo.leer_cuenta_ciclos(),
        duracion_iteracion: dispositivo.leer_duracion_iteracion()
    }
    temporizador.postMessage({ mensaje: "step", contenido: estado });
}

/*
* Hilo de ejecución una vez cargada la página
*/
document.addEventListener('DOMContentLoaded', function() {
    let t_iteracion = dispositivo.leer_duracion_iteracion();
    dispositivo.preparar(t_iteracion, 0);
    temporizador.postMessage({ mensaje: "init", contenido: t_iteracion });
    //operaciones del sistema
    document.getElementById('start').onclick = iniciar_temporizador;
    document.getElementById('pause').onclick = pausar_temporizador;
    document.getElementById('stop').onclick = detener_temporizador;
    document.getElementById('step').onclick = cambiar_iteracion_temporizador;
    //requisitos urps+
    document.getElementById('herramienta-estadisticas').onclick = dispositivo.mostrar_estadisticas.bind(dispositivo);
    document.getElementById('herramienta-configuracion').onclick = dispositivo.mostrar_configuracion.bind(dispositivo);
    document.getElementById('duracion-iteracion').onchange = function() {
        let minutos = dispositivo.leer_duracion_iteracion();
        dispositivo.preparar(minutos, 0);
        temporizador.postMessage({ mensaje: "update", contenido: minutos });
    };
});

//coordinar acciones del worker
temporizador.onmessage = function(event) {
    let mensaje = event.data.mensaje;
    let contenido = event.data.contenido;
    let alarm = null;
    switch(mensaje) {
        case "reg_stats":
            dispositivo.registrar_estadisticas( contenido['iteracion'], contenido['t_iteracion'], contenido['t_transcurrido'],
                contenido['cuenta_it'], contenido['ciclo'], contenido['cuenta_ciclos'] );
            break;
        case "prepare":
            dispositivo.preparar(contenido[0], contenido[1]);
            break;
        case "update_iterations_count":
            dispositivo.actualizar_cuenta_iteraciones(contenido);
            break;
        case "update_break_state":
            dispositivo.actualizar_estado_descanso(contenido);
            break;
        case "update_cycles_count":
            dispositivo.actualizar_cuenta_ciclos(contenido);
            break;
        case "update_minutes":
            dispositivo.actualizar_minutero(contenido.length, contenido);
            break;
        case "update_seconds":
            dispositivo.actualizar_segundero(contenido);
            break;
        case "audio_break":
            alarm = new Audio("../audio/536420__rudmer_rotteveel__electronic-timer-beeping-4x.wav");
            alarm.play();
            break;
        case "audio_focus":
            alarm = new Audio("../audio/536421__rudmer_rotteveel__setting-electronic-timer-multiple-beeps.wav");
            alarm.play();
            break;
        case "next":
            cambiar_iteracion_temporizador();
            break;
    }
}