importScripts("https://cdn.jsdelivr.net/npm/bignumber.js");

class Temporizacion {
    constructor(t_iteracion) {
        this.t_iteracion = t_iteracion;
        this.minutero = null;
        this.segundero = null;
    }
    preparar(minutero, segundero) {
        this.minutero = this.obtener_secuencia(minutero);
        this.segundero = this.obtener_secuencia(segundero);
    }
    actualizar() {
        let excedido = this.segundero.decrementar();
        if( excedido ) {
            this.segundero.digito = 5;
            excedido = this.minutero.decrementar();
            if( excedido ) return { actualizado: false, minutero: this.minutero, segundero: this.segundero };
            else return { actualizado: true, minutero: this.minutero, segundero: this.segundero };
        } else {
            return { actualizado: true, minutero: this.minutero, segundero: this.segundero };
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
    temporizacion: null, //propiedad que encapsula el objetivo del caso de uso del temporizador
    actividad: null, //propiedad que determina el estado de acción del temporizador
    iteracion: 0, //propiedad que sigue la cuenta de las iteraciones de un mismo ciclo
    ciclo: 0, //propiedad que registra la cuenta de ciclos comprendidos por la sesión de caso de uso 
    recorrido: 0, //propiedad que sigue la cuenta de iteraciones efectivas de un mismo ciclo
    descanso: false, //propiedad que determina el estado de descanso o actividad del temporizador
    inicializar: function(t_iteracion) {
        this.temporizacion = new Temporizacion(t_iteracion);
    },
    actualizar_temporizador: function(minutos) {
        if( !this.actividad ) this.temporizacion.t_iteracion = minutos;
    },
    calcular_tiempo_transcurrido: function(t_iteracion, minutero, segundero) {
        let t_transcurrido = t_iteracion - ((minutero * 60 + segundero) / 60);
        return new BigNumber(t_transcurrido.toFixed(4));
    },
    calcular_iteraciones: function(t_iteracion, minutero, segundero) {
        let cuenta_it = 1 - (minutero * 60 + segundero) / (t_iteracion * 60);
        return new BigNumber(cuenta_it.toFixed(4));
    },
    calcular_ciclos: function(duracion_ciclos, recorrido, cuenta_it) {
        let acumulado_ciclos = 1 - ((duracion_ciclos - recorrido) / duracion_ciclos);
        let cuenta_ciclos = 1 - ((duracion_ciclos - cuenta_it) / duracion_ciclos);
        return [new BigNumber(cuenta_ciclos.toFixed(4)), new BigNumber(acumulado_ciclos.toFixed(4))];
    },
    formato: function(entrada) {
        return entrada.toString();
    },
    next: function(estado) {
        if( !this.descanso ) { //si la iteración actual no es de descanso
            let duracion_ciclos = estado['duracion_ciclos'];
            //calcular la fracción de tiempo recorrido 
            let t_iteracion = this.temporizacion.t_iteracion;
            let minutero = estado['minutero'];
            let segundero = estado['segundero'];
            let t_transcurrido = this.calcular_tiempo_transcurrido(t_iteracion, minutero, segundero);
            let cuenta_it = this.calcular_iteraciones(t_iteracion, minutero, segundero);
            //actualizar estadísticas de sesión
            this.iteracion++;
            //castear a Number cuenta_it porque es de tipo BigNumber
            this.recorrido += Number(cuenta_it);
            let cuenta_ciclos = this.calcular_ciclos(duracion_ciclos, this.recorrido, cuenta_it);
            console.log(cuenta_ciclos[0], cuenta_ciclos[1]);
            let estadisticas = { iteracion: this.iteracion, t_iteracion: t_iteracion, t_transcurrido: this.formato(t_transcurrido), 
                cuenta_it: this.formato(cuenta_it), ciclo: this.ciclo + 1, cuenta_ciclos: this.formato(cuenta_ciclos[1]) };
            self.postMessage({ mensaje: "reg_stats", contenido: estadisticas })
            //realizar cambio de estado
            let iteraciones = estado['iteraciones'];
            self.postMessage({ mensaje: "update_iterations_count", contenido: this.formato(cuenta_it.plus(iteraciones)) });
            let ciclos = estado['ciclos'];
            self.postMessage({ mensaje: "update_cycles_count", contenido: this.formato(cuenta_ciclos[0].plus(ciclos)) });
            self.postMessage({ mensaje: "update_break_state", contenido: "Si" });
            if( (this.iteracion - 1) < (duracion_ciclos - 1) ) { //si el número de iteraciones actuales no completan un ciclo
                let duracion_descanso_corto = estado['duracion_descanso_corto'];
                self.postMessage({ mensaje: "prepare", contenido: [duracion_descanso_corto, 0] });
                this.temporizacion.preparar(duracion_descanso_corto.toString(), "00");
                this.descanso = true;
                this.temporizacion.t_iteracion = duracion_descanso_corto;
            } else { //si el número de iteraciones actuales completan un ciclo
                let duracion_descanso_largo = estado['duracion_descanso_largo'];
                self.postMessage({ mensaje: "prepare", contenido: [duracion_descanso_largo, 0] });
                this.temporizacion.preparar(duracion_descanso_largo.toString(), "00");
                this.iteracion = 0;
                this.recorrido = 0;
                this.ciclo++;
                this.descanso = true;
                this.temporizacion.t_iteracion = duracion_descanso_largo;
            }
            self.postMessage({ mensaje: "audio_break", contenido: undefined });
        } else { //si la iteración actual es un descanso
            let duracion_iteracion = estado['duracion_iteracion'];
            self.postMessage({ mensaje: "prepare", contenido: [duracion_iteracion, 0] });
            this.temporizacion.preparar(duracion_iteracion.toString(), "00");
            this.descanso = false;
            self.postMessage({ mensaje: "update_break_state", contenido: "No" });
            this.temporizacion.t_iteracion = duracion_iteracion;
            self.postMessage({ mensaje: "audio_focus", contenido: undefined });
        }
    },
    stop: function(estado) {
        if( this.actividad ) clearInterval(this.actividad);
        this.actividad = null;
        //calcular la fracción de tiempo recorrido no contabilizado aún, de iteración o descanso 
        let t_iteracion = this.temporizacion.t_iteracion;
        let minutero = estado['minutero'];
        let segundero = estado['segundero'];
        let t_transcurrido = this.calcular_tiempo_transcurrido(t_iteracion, minutero, segundero);
        let cuenta_it = this.calcular_iteraciones(t_iteracion, minutero, segundero);
        //actualiza el contador de iteraciones o el estado de descanso del temporizador
        if( !this.descanso ) { //si la iteración actual no es un descanso
            //calcular la fracción de ciclos no contabilizados aún
            //castear a Number cuenta_it porque es de tipo BigNumber
            this.recorrido += Number(cuenta_it);
            let duracion_ciclos = estado['duracion_ciclos'];
            let cuenta_ciclos = this.calcular_ciclos(duracion_ciclos, this.recorrido, cuenta_it);
            //actualizar conteos de iteraciones y ciclos
            let iteraciones = estado['iteraciones'];
            self.postMessage({ mensaje: "update_iterations_count", contenido: this.formato(cuenta_it.plus(iteraciones)) });
            let ciclos = estado['ciclos'];
            self.postMessage({ mensaje: "update_cycles_count", contenido: this.formato(cuenta_ciclos[0].plus(ciclos)) });
            //agregar estadísticas de la última iteración
            let estadisticas = { iteracion: this.iteracion + 1, t_iteracion: t_iteracion, t_transcurrido: this.formato(t_transcurrido),
                cuenta_it: this.formato(cuenta_it), ciclo: this.ciclo + 1, cuenta_ciclos: this.formato(cuenta_ciclos[1]) };
            self.postMessage({ mensaje: "reg_stats", contenido: estadisticas });
        } else { //si la iteración actual es un descanso
            this.descanso = false;
            self.postMessage({ mensaje: "update_break_state", contenido: "No" });
        }
        //preparar el siguiente ciclo de temporización 
        let duracion_iteracion = estado['duracion_iteracion'];
        self.postMessage({ mensaje: "prepare", contenido: [duracion_iteracion, 0] });
        this.temporizacion.preparar(duracion_iteracion.toString(), "00");
        this.iteracion = 0;
        this.recorrido = 0;
        this.ciclo++;
        this.temporizacion.t_iteracion = duracion_iteracion;
    },
    pause: function() {
        if( this.actividad ) clearInterval(this.actividad);
        this.actividad = null;
    },
    start: function(estado) {
        if( !this.actividad ) {
                let minutos = estado.minutero.toString();
                let digitos = minutos.length;
                minutos = minutos.padStart(digitos, '0');
                let segundos = estado.segundero.toString();
                segundos = segundos.padStart(2, '0');
                this.temporizacion.preparar(minutos, segundos);
            this.actividad = setInterval(() => {
                let tiempo = this.temporizacion.actualizar();
                if( !tiempo.actualizado ) self.postMessage({ mensaje: "next", contenido: undefined });
                else {
                    minutos = tiempo.minutero.leer();
                    segundos = tiempo.segundero.leer();
                    self.postMessage({ mensaje: "update_minutes", contenido: minutos });
                    self.postMessage({ mensaje: "update_seconds", contenido: segundos });
                }
            }, 1000);
        }
    }
}

/*
* Recibir mensajes del módulo principal
*/
self.onmessage = function(event) {
    let mensaje = event.data.mensaje;
    let contenido = event.data.contenido;
    switch(mensaje) {
        case "init":
            temporizador.inicializar(contenido);
            break;
        case "update":
            temporizador.actualizar_temporizador(contenido);
            break;
        case "step":
            temporizador.next(contenido);
            break;
        case "stop":
            temporizador.stop(contenido);
            break;
        case "pause":
            temporizador.pause();
            break;
        case "start":
            temporizador.start(contenido);
            break;
    }
}