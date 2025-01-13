class Dispositivo {
    constructor() {}
    preparar(minutos, segundos) {
        let control_minutos = document.getElementById('minutero');
        let control_segundos = document.getElementById('segundero');
        control_minutos.innerHTML = minutos.toString().padStart(minutos.toString().length, '0');
        control_segundos.innerHTML = segundos.toString().padStart(2, '0');
    }
    leer_minutero() {
        let control_minutos = document.getElementById('minutero');
        return parseInt(control_minutos.innerHTML); 
    }
    leer_segundero() {
        let control_segundos = document.getElementById('segundero');
        return parseInt(control_segundos.innerHTML);
    }
    actualizar_minutero(digitos, minutos) {
        let control_minutos = document.getElementById('minutero');
        control_minutos.innerHTML = minutos.padStart(digitos, '0');
    }
    actualizar_segundero(segundos) {
        let control_segundos = document.getElementById('segundero');
        control_segundos.innerHTML = segundos.padStart(2, '0');
    }
    leer_longitud_ciclos() {
        let longitud_ciclos = document.getElementById('iteraciones-por-ciclo');
        return longitud_ciclos.value;
    }
    leer_descanso_corto() {
        let entrada_descanso_corto = document.getElementById('duracion-descanso-iteracion');
        return entrada_descanso_corto.value;
    }
    leer_descanso_largo() {
        let entrada_descanso_largo = document.getElementById('duracion-descanso-ciclo');
        return entrada_descanso_largo.value;
    }
    leer_duracion_iteracion() {
        let duracion_iteracion = document.getElementById('duracion-iteracion');
        return duracion_iteracion.value;
    }
    leer_cuenta_iteraciones() {
        let iteraciones = document.getElementById('iteraciones');
        return parseFloat(iteraciones.innerHTML);
    }
    actualizar_cuenta_iteraciones(iteraciones) {
        let cuenta_it = document.getElementById('iteraciones');
        cuenta_it.innerHTML = iteraciones;
    }
    leer_cuenta_ciclos() {
        let ciclos = document.getElementById('ciclos');
        return parseFloat(ciclos.innerHTML);
    }
    actualizar_cuenta_ciclos(ciclos) {
        let cuenta_ciclos = document.getElementById('ciclos');
        cuenta_ciclos.innerHTML = ciclos;
    }
    actualizar_estado_descanso(descanso) {
        let estado_descanso = document.getElementById('descanso');
        estado_descanso.innerHTML = descanso;
    }
    registrar_estadisticas(iteracion, t_iteracion, cuenta_it, ciclo, cuenta_ciclo) {
        let tabla = document.getElementById('registro');
        let entrada = tabla.insertRow();
        for( let i = 0; i < 5; i++) {
            let celda = entrada.insertCell(i);
            switch(i) {
                case 0:
                    celda.innerHTML = iteracion;
                    break;
                case 1:
                    celda.innerHTML = t_iteracion;
                    break;
                case 2:
                    celda.innerHTML = cuenta_it;
                    break;
                case 3:
                    celda.innerHTML = ciclo;
                    break;
                case 4:
                    celda.innerHTML = cuenta_ciclo;
                    break;
            }
        }
    }
    mostrar_estadisticas() {
        let estadisticas = document.getElementById('estadisticas');
        if( estadisticas.hasAttribute('hidden') ) {
            let herramientas = document.getElementsByClassName('herramientas');
            for( let herramienta of herramientas ) {
                if( !herramienta.hasAttribute('hidden') ) herramienta.setAttribute('hidden', '');
            }
            estadisticas.removeAttribute('hidden');
        } else estadisticas.setAttribute('hidden', '');
    }
}

class Temporizacion {
    constructor(t_iteracion) {
        this.t_iteracion = t_iteracion;
    }
    actualizar(minutos, segundos) {
        let minutero = this.obtener_secuencia(minutos);
        let segundero = this.obtener_secuencia(segundos);
        let excedido = segundero.decrementar();
        if( excedido ) {
            segundero.digito = 5;
            excedido = minutero.decrementar();
            if( excedido ) return { actualizado: false, minutero: minutero, segundero: segundero };
            else return { actualizado: true, minutero: minutero, segundero: segundero };
        } else {
            return { actualizado: true, minutero: minutero, segundero: segundero };
        }
    }
    obtener_secuencia(digitos) {
        return { digito: parseInt(digitos[0]), secuencia: digitos.length > 1 ? this.obtener_secuencia(digitos.slice(1)) : undefined,
            decrementar: function() {
                if( this.secuencia == undefined && this.digito === 0 ) this.digito = 9;
                else if( this.secuencia == undefined ) this.digito--;
                else {
                    let propagar = this.secuencia.decrementar();
                    if( propagar && this.digito === 0 ) this.digito = 9;
                    else if( propagar ) this.digito--;
                }
                return (this.digito === 9);
            },
            leer: function() {
                if( this.secuencia == undefined ) return this.digito.toString();
                else return this.digito.toString().concat(this.secuencia.leer());
            }
        };
    }
}

let temporizador = {
    dispositivo: null, //propiedad de acceso al dispositivo de temporización
    temporizacion: null, //propiedad que encapsula el objetivo del caso de uso del temporizador
    actividad: null, //propiedad que determina el estado de acción del temporizador
    iteracion: 0, //propiedad que sigue la cuenta de las iteraciones de un mismo ciclo
    ciclo: 0, //propiedad que registra la cuenta de ciclos comprendidos por la sesión de caso de uso 
    recorrido: 0, //propiedad que sigue la cuenta de iteraciones efectivas de un mismo ciclo
    descanso: false, //propiedad que determina el estado de descanso o actividad del temporizador
    calcular_iteraciones: function(t_iteracion, minutero) {
        let cuenta_it = 1 - (minutero / t_iteracion);
        return Math.round(cuenta_it * 100) / 100;
    },
    calcular_ciclos: function(duracion_ciclos, recorrido) {
        let cuenta_ciclos = 1 - ((duracion_ciclos - recorrido) / duracion_ciclos);
        return Math.round(cuenta_ciclos * 100) / 100;
    },
    next: function() {
        if( !this.descanso ) { //si la iteración actual no es de descanso
            let duracion_ciclos = this.dispositivo.leer_longitud_ciclos();
            //calcular la fracción de tiempo recorrido 
            let t_iteracion = this.temporizacion.t_iteracion;
            let minutero = this.dispositivo.leer_minutero();
            let cuenta_it = this.calcular_iteraciones(t_iteracion, minutero);
            //actualizar estadísticas de sesión
            this.iteracion++;
            this.recorrido += cuenta_it;
            let cuenta_ciclos = this.calcular_ciclos(duracion_ciclos, this.recorrido);
            this.dispositivo.registrar_estadisticas(this.iteracion, t_iteracion - minutero, cuenta_it,
                this.ciclo + 1, cuenta_ciclos);
            //realizar cambio de estado
            if(  (this.iteracion - 1) < (duracion_ciclos - 1) ) { //si el número de iteraciones actuales no completan un ciclo
                let duracion_descanso_corto = this.dispositivo.leer_descanso_corto();
                this.dispositivo.preparar(duracion_descanso_corto, 0);
                let iteraciones = this.dispositivo.leer_cuenta_iteraciones();
                this.dispositivo.actualizar_cuenta_iteraciones(iteraciones + cuenta_it)
                this.descanso = true;
                this.dispositivo.actualizar_estado_descanso("Si");
                this.temporizacion.t_iteracion = duracion_descanso_corto;
            } else { //si el número de iteraciones actuales completan un ciclo
                let duracion_descanso_largo = this.dispositivo.leer_descanso_largo();
                this.dispositivo.preparar(duracion_descanso_largo, 0);
                let iteraciones = this.dispositivo.leer_cuenta_iteraciones();
                this.dispositivo.actualizar_cuenta_iteraciones(iteraciones + cuenta_it);
                let ciclos = this.dispositivo.leer_cuenta_ciclos();
                this.dispositivo.actualizar_cuenta_ciclos(ciclos + cuenta_ciclos);
                this.iteracion = 0;
                this.recorrido = 0;
                this.ciclo++;
                this.descanso = true;
                this.dispositivo.actualizar_estado_descanso("Si");
                this.temporizacion.t_iteracion = duracion_descanso_largo;
            }
            let alarma = new Audio("audio/536420__rudmer_rotteveel__electronic-timer-beeping-4x.wav");
            alarma.play();
        } else { //si la iteración actual es un descanso
            let duracion_iteracion = this.dispositivo.leer_duracion_iteracion();
            this.dispositivo.preparar(duracion_iteracion, 0);
            this.descanso = false;
            this.dispositivo.actualizar_estado_descanso("No");
            this.temporizacion.t_iteracion = duracion_iteracion;
            let alarma = new Audio("audio/536421__rudmer_rotteveel__setting-electronic-timer-multiple-beeps.wav");
            alarma.play();
        }
    },
    stop: function() {
        clearInterval(this.actividad);
        //calcular la fracción de tiempo recorrido no contabilizado aún, de iteración o descanso 
        let t_iteracion = this.temporizacion.t_iteracion;
        let minutero = this.dispositivo.leer_minutero();
        let cuenta_it = this.calcular_iteraciones(t_iteracion, minutero);
        //calcular la fracción de ciclos no contabilizados aún
        this.recorrido += cuenta_it;
        let duracion_ciclos = this.dispositivo.leer_longitud_ciclos();
        let cuenta_ciclos = this.calcular_ciclos(duracion_ciclos, this.recorrido);
        //agregar estadísticas de la última iteración
        this.dispositivo.registrar_estadisticas(this.iteracion + 1, t_iteracion - minutero, cuenta_it,
            this.ciclo + 1, cuenta_ciclos);
        //actualiza el contador de iteraciones o el estado de descanso del temporizador
        if( !this.descanso ) { //si la iteración actual no es un descanso
            let iteraciones = this.dispositivo.leer_cuenta_iteraciones();
            this.dispositivo.actualizar_cuenta_iteraciones(iteraciones + cuenta_it);
            let ciclos = this.dispositivo.leer_cuenta_ciclos();
            this.dispositivo.actualizar_cuenta_ciclos(ciclos + cuenta_ciclos);
        } else { //si la iteración actual es un descanso
            this.descanso = false;
            this.dispositivo.actualizar_estado_descanso("No");
        }
        //preparar la siguiente temporización
        let duracion_iteracion = this.dispositivo.leer_duracion_iteracion();
        this.dispositivo.preparar(duracion_iteracion, 0);
        this.iteracion = 0;
        this.recorrido = 0;
        this.ciclo++;
    },
    pause: function() {
        clearInterval(this.actividad);
    },
    start: function() {
        this.actividad = setInterval(() => {
            let minutos = this.dispositivo.leer_minutero().toString();
            let digitos = minutos.length;
            minutos = minutos.padStart(digitos, '0');
            let segundos = this.dispositivo.leer_segundero().toString();
            segundos = segundos.padStart(2, '0');
            let tiempo = this.temporizacion.actualizar(minutos, segundos);
            if( !tiempo.actualizado ) this.next();
            else {
                minutos = tiempo.minutero.leer();
                segundos = tiempo.segundero.leer();
                this.dispositivo.actualizar_minutero(digitos, minutos);
                this.dispositivo.actualizar_segundero(segundos);
            }
        }, 1000);
    }
}

/*
* Operación del sistema para iniciar la actividad del temporizador
*/
function iniciar_temporizador() {
    temporizador.start();
}
/*
* Operación del sistema para pausar la actividad del temporizador
*/
function pausar_temporizador() {
    temporizador.pause();
}
/*
* Operación del sistema para detener la actividad del temporizador
*/
function detener_temporizador() {
    temporizador.stop();
}
/*
* Operación del sistema para cambiar la iteración a la siguiente
* fase de la actividad actual del temporizador
*/
function cambiar_iteracion_temporizador() {
    temporizador.next();
}

/*
* Hilo de ejecución una vez cargada la página
*/
document.addEventListener('DOMContentLoaded', function() {
    let dispositivo = new Dispositivo();
    let t_iteracion = dispositivo.leer_duracion_iteracion();
    dispositivo.preparar(t_iteracion, 0);
    temporizador.dispositivo = dispositivo;
    temporizador.temporizacion = new Temporizacion(t_iteracion);
    //operaciones del sistema
    document.getElementById('start').onclick = iniciar_temporizador;
    document.getElementById('pause').onclick = pausar_temporizador;
    document.getElementById('stop').onclick = detener_temporizador;
    document.getElementById('step').onclick = cambiar_iteracion_temporizador;
    //requisitos urps+
    document.getElementById('herramienta-estadisticas').onclick = dispositivo.mostrar_estadisticas.bind(dispositivo);
});
