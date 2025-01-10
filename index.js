class Temporizacion {
    constructor(t_iteracion) {
        this.t_iteracion = t_iteracion;
        this.minutero = [2, null];
        this.segundero = null;
        let entrada_duracion = document.getElementById('duracion-iteracion');
        let duracion_iteracion = entrada_duracion.value;
        this.preparar(duracion_iteracion, 0);
    }
    leer_minutero() {
        let control_minutos = document.getElementById('minutero');
        return [control_minutos.innerHTML.length, parseInt(control_minutos.innerHTML)];
    }
    leer_segundero() {
        let control_segundos = document.getElementById('segundero');
        return parseInt(control_segundos.innerHTML);
    }
    actualizar_temporizacion() {
        this.minutero = this.leer_minutero();
        this.segundero = this.leer_segundero();
        let control_segundos = document.getElementById('segundero');
        if( --this.segundero < 0 ) {
            this.segundero = 59;
            control_segundos.innerHTML = this.segundero.toString().padStart(2, '0');
            if( --this.minutero[1] < 0 ) return false;
            else {
                let control_minutos = document.getElementById('minutero');
                control_minutos.innerHTML = this.minutero[1].toString().padStart(this.minutero[0], '0');
                return true;
            }
        } else {
            control_segundos.innerHTML = this.segundero.toString().padStart(2, '0');
            return true;
        }
    }
    preparar(minutos, segundos) {
        this.minutero = [minutos.toString().length, minutos];
        this.segundero = segundos;
        let control_minutos = document.getElementById('minutero');
        let control_segundos = document.getElementById('segundero');
        control_minutos.innerHTML = this.minutero[1].toString().padStart(this.minutero[0], '0');
        control_segundos.innerHTML = this.segundero.toString().padStart(2, '0');
    }
}

let temporizador = {
    temporizacion: null,
    actividad: null, //propiedad que determina el estado de acción del temporizador
    iteracion: 0, //propiedad que sigue la cuenta de las iteraciones de un mismo ciclo
    recorrido: 0, //propiedad que sigue la cuenta de iteraciones efectivas de un mismo ciclo
    descanso: false, //propiedad que determina el estado de descanso o actividad del temporizador
    next: function() {
        if( !this.descanso ) { //si la iteración actual no es de descanso
            let longitud_ciclos = document.getElementById('iteraciones-por-ciclo');
            let duracion_ciclos = longitud_ciclos.value; 
            //calcular la fracción de tiempo recorrido 
            let t_iteracion = this.temporizacion.t_iteracion;
            let control_minutos = document.getElementById('minutero');
            let minutos_restantes = parseInt(control_minutos.innerHTML);
            let cuenta_it = 1 - (minutos_restantes / t_iteracion);
            cuenta_it = Math.round(cuenta_it * 100) / 100;
            if(  this.iteracion < (duracion_ciclos - 1) ) { //si el número de iteraciones actuales no completan un ciclo
                let entrada_descanso_corto = document.getElementById('duracion-descanso-iteracion');
                let duracion_descanso_corto = entrada_descanso_corto.value;
                this.temporizacion.preparar(duracion_descanso_corto, 0);
                this.descanso = true;
                this.iteracion++;
                this.recorrido += cuenta_it;
                this.temporizacion.t_iteracion = duracion_descanso_corto;
                let iteraciones = document.getElementById('iteraciones');
                iteraciones.innerHTML = parseFloat(iteraciones.innerHTML) + cuenta_it;
                let estado_descanso = document.getElementById('descanso');
                estado_descanso.innerHTML = "Si"; 
            } else { //si el número de iteraciones actuales completan un ciclo
                let entrada_descanso_largo = document.getElementById('duracion-descanso-ciclo');
                let duracion_descanso_largo = entrada_descanso_largo.value;
                this.temporizacion.preparar(duracion_descanso_largo, 0);
                this.descanso = true;
                this.iteracion = 0;
                this.recorrido += cuenta_it;
                this.temporizacion.t_iteracion = duracion_descanso_largo;
                let iteraciones = document.getElementById('iteraciones');
                iteraciones.innerHTML = parseFloat(iteraciones.innerHTML) + cuenta_it;
                let ciclos = document.getElementById('ciclos');
                let cuenta_ciclos = parseFloat(ciclos.innerHTML);
                let longitud_ciclo = document.getElementById('iteraciones-por-ciclo');
                let duracion_ciclos = longitud_ciclo.value;
                this.recorrido = 1 - ((duracion_ciclos - this.recorrido) / duracion_ciclos);
                this.recorrido = Math.round(this.recorrido * 100) / 100;
                ciclos.innerHTML = cuenta_ciclos + this.recorrido;
                this.recorrido = 0;
                let estado_descanso = document.getElementById('descanso');
                estado_descanso.innerHTML = "Si";
            }
        } else { //si la iteración actual es un descanso
            let entrada_duracion = document.getElementById('duracion-iteracion');
            let duracion_iteracion = entrada_duracion.value;
            this.temporizacion.preparar(duracion_iteracion, 0);
            this.descanso = false;
            this.temporizacion.t_iteracion = duracion_iteracion;
            let estado_descanso = document.getElementById('descanso');
            estado_descanso.innerHTML = "No";
        }
    },
    start: function() {
        this.actividad = setInterval(() => {
            let actualizado = this.temporizacion.actualizar_temporizacion();
            if( !actualizado ) this.next();
        }, 1000);
    },
    pause: function() {
        clearInterval(this.actividad);
    },
    stop: function() {
        clearInterval(this.actividad);
        //calcular la fracción de tiempo recorrido no contabilizado aún, de iteración o descanso 
        let t_iteracion = this.temporizacion.t_iteracion;
        let control_minutos = document.getElementById('minutero');
        let minutos_restantes = parseInt(control_minutos.innerHTML);
        let cuenta_it = 1 - (minutos_restantes / t_iteracion);
        cuenta_it = Math.round(cuenta_it * 100) / 100;
        //calcular la fracción de ciclos no contabilizados aún
        this.recorrido += cuenta_it;
        let longitud_ciclo = document.getElementById('iteraciones-por-ciclo');
        let duracion_ciclos = longitud_ciclo.value;
        let cuenta_ciclos = 1 - ((duracion_ciclos - this.recorrido) / duracion_ciclos);
        cuenta_ciclos = Math.round(cuenta_ciclos * 100) / 100;
        //preparar la siguiente temporización
        let entrada_duracion = document.getElementById('duracion-iteracion');
        let duracion_iteracion = entrada_duracion.value;
        this.temporizacion.preparar(duracion_iteracion, 0);
        //actualiza el contador de iteraciones o el estado de descanso del temporizador
        if( !this.descanso ) { //si la iteración actual no es un descanso
            let iteraciones = document.getElementById('iteraciones');
            iteraciones.innerHTML = parseFloat(iteraciones.innerHTML) + cuenta_it;
            let ciclos = document.getElementById('ciclos');
            ciclos.innerHTML = parseFloat(ciclos.innerHTML) + cuenta_ciclos;
        } else { //si la iteración actual es un descanso
            let estado_descanso = document.getElementById('descanso');
            estado_descanso.innerHTML = "No";
            this.descanso = false;
        }
        this.iteracion = 0;
        this.recorrido = 0;
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
    let entrada_duracion = document.getElementById('duracion-iteracion');
    let t_iteracion = entrada_duracion.value;
    temporizador.temporizacion = new Temporizacion(t_iteracion);
    document.getElementById('start').onclick = iniciar_temporizador;
    document.getElementById('pause').onclick = pausar_temporizador;
    document.getElementById('stop').onclick = detener_temporizador;
    document.getElementById('step').onclick = cambiar_iteracion_temporizador;
});
