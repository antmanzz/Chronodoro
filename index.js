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
        return { digitos: control_minutos.innerHTML.length, valor: parseInt(control_minutos.innerHTML) };
    }
    leer_segundero() {
        let control_segundos = document.getElementById('segundero');
        return parseInt(control_segundos.innerHTML);
    }
    actualizar_minutero(minutero) {
        let control_minutos = document.getElementById('minutero');
        control_minutos.innerHTML = minutero.valor.toString().padStart(minutero.digitos, '0');
    }
    actualizar_segundero(segundero) {
        let control_segundos = document.getElementById('segundero');
        control_segundos.innerHTML = segundero.toString().padStart(2, '0');
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
}

class Temporizacion {
    constructor(t_iteracion) {
        this.t_iteracion = t_iteracion;
        this.minutero = { digitos:2, valor:t_iteracion };
        this.segundero = 0;
    }
    actualizar(minutero, segundero) {
        this.minutero = minutero;
        this.segundero = segundero; 
        if( --this.segundero < 0 ) {
            this.segundero = 59;
            if( --this.minutero.valor < 0 ) return { actualizado:false, minutero:this.minutero, segundero:this.segundero };
            else {
                return { actualizado: true, minutero:this.minutero, segundero:this.segundero };
            }
        } else {
            return { actualizado: true, minutero:this.minutero, segundero:this.segundero };
        }
    }
}

let temporizador = {
    dispositivo: null, //propiedad de acceso al dispositivo de temporización
    temporizacion: null, //propiedad que encapsula el objetivo del caso de uso del temporizador
    actividad: null, //propiedad que determina el estado de acción del temporizador
    iteracion: 0, //propiedad que sigue la cuenta de las iteraciones de un mismo ciclo
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
            let cuenta_it = this.calcular_iteraciones(t_iteracion, minutero.valor);
            if(  this.iteracion < (duracion_ciclos - 1) ) { //si el número de iteraciones actuales no completan un ciclo
                let duracion_descanso_corto = this.dispositivo.leer_descanso_corto();
                this.dispositivo.preparar(duracion_descanso_corto, 0);
                let iteraciones = this.dispositivo.leer_cuenta_iteraciones();
                this.dispositivo.actualizar_cuenta_iteraciones(iteraciones + cuenta_it)
                this.iteracion++;
                this.recorrido += cuenta_it;
                this.descanso = true;
                this.dispositivo.actualizar_estado_descanso("Si");
                this.temporizacion.t_iteracion = duracion_descanso_corto;
            } else { //si el número de iteraciones actuales completan un ciclo
                let duracion_descanso_largo = this.dispositivo.leer_descanso_largo();
                this.dispositivo.preparar(duracion_descanso_largo, 0);
                let iteraciones = this.dispositivo.leer_cuenta_iteraciones();
                this.dispositivo.actualizar_cuenta_iteraciones(iteraciones + cuenta_it);
                this.iteracion = 0;
                this.recorrido += cuenta_it;
                let ciclos = this.dispositivo.leer_cuenta_ciclos();
                let cuenta_ciclos = this.calcular_ciclos(duracion_ciclos, this.recorrido);
                this.dispositivo.actualizar_cuenta_ciclos(ciclos + cuenta_ciclos);
                this.recorrido = 0;
                this.descanso = true;
                this.dispositivo.actualizar_estado_descanso("Si");
                this.temporizacion.t_iteracion = duracion_descanso_largo;
            }
        } else { //si la iteración actual es un descanso
            let duracion_iteracion = this.dispositivo.leer_duracion_iteracion();
            this.dispositivo.preparar(duracion_iteracion, 0);
            this.descanso = false;
            this.dispositivo.actualizar_estado_descanso("No");
            this.temporizacion.t_iteracion = duracion_iteracion;
        }
    },
    stop: function() {
        clearInterval(this.actividad);
        //calcular la fracción de tiempo recorrido no contabilizado aún, de iteración o descanso 
        let t_iteracion = this.temporizacion.t_iteracion;
        let minutero = this.dispositivo.leer_minutero();
        let cuenta_it = this.calcular_iteraciones(t_iteracion, minutero.valor);
        //calcular la fracción de ciclos no contabilizados aún
        this.recorrido += cuenta_it;
        let duracion_ciclos = this.dispositivo.leer_longitud_ciclos();
        let cuenta_ciclos = this.calcular_ciclos(duracion_ciclos, this.recorrido);
        //preparar la siguiente temporización
        let duracion_iteracion = this.dispositivo.leer_duracion_iteracion();
        this.dispositivo.preparar(duracion_iteracion, 0);
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
        this.iteracion = 0;
        this.recorrido = 0;
    },
    pause: function() {
        clearInterval(this.actividad);
    },
    start: function() {
        this.actividad = setInterval(() => {
            let minutero = this.dispositivo.leer_minutero();
            let segundero = this.dispositivo.leer_segundero();
            let resultado = this.temporizacion.actualizar(minutero, segundero);
            if( !resultado.actualizado ) this.next();
            else {
                this.dispositivo.actualizar_minutero(resultado.minutero);
                this.dispositivo.actualizar_segundero(resultado.segundero);
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
    temporizador.dispositivo = dispositivo;
    let t_iteracion = dispositivo.leer_duracion_iteracion();
    dispositivo.preparar(t_iteracion, 0);
    temporizador.temporizacion = new Temporizacion(t_iteracion);
    document.getElementById('start').onclick = iniciar_temporizador;
    document.getElementById('pause').onclick = pausar_temporizador;
    document.getElementById('stop').onclick = detener_temporizador;
    document.getElementById('step').onclick = cambiar_iteracion_temporizador;
});
