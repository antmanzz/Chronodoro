export default class Dispositivo {
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
    leer_duracion_iteracion() {
        let duracion_iteracion = document.getElementById('duracion-iteracion');
        return duracion_iteracion.value;
    }
    leer_descanso_corto() {
        let entrada_descanso_corto = document.getElementById('duracion-descanso-iteracion');
        return entrada_descanso_corto.value;
    }
    leer_descanso_largo() {
        let entrada_descanso_largo = document.getElementById('duracion-descanso-ciclo');
        return entrada_descanso_largo.value;
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
    registrar_estadisticas(iteracion, t_iteracion, t_transcurrido, cuenta_it, ciclo, cuenta_ciclos) {
        let tabla = document.getElementById('registro');
        let entrada = tabla.insertRow();
        for( let i = 0; i < 6; i++) {
            let celda = entrada.insertCell(i);
            switch(i) {
                case 0:
                    celda.innerHTML = iteracion;
                    break;
                case 1:
                    celda.innerHTML = t_iteracion;
                    break;
                case 2:
                    celda.innerHTML = t_transcurrido;
                    break;
                case 3:
                    //castea automáticamente a String
                    celda.innerHTML = new BigNumber(cuenta_it).times(100);
                    break;
                case 4:
                    celda.innerHTML = ciclo;
                    break;
                case 5:
                    //castea automáticamente a String
                    celda.innerHTML = new BigNumber(cuenta_ciclos).times(100);
                    break;
            }
        }
    }
    mostrar_estadisticas() {
        let estadisticas = document.getElementById('estadisticas');
        if( estadisticas.hasAttribute('hidden') ) {
            let herramientas = document.getElementsByClassName('herramienta');
            for( let herramienta of herramientas ) {
                if( !herramienta.hasAttribute('hidden') ) herramienta.setAttribute('hidden', '');
            }
            estadisticas.removeAttribute('hidden');
        } else estadisticas.setAttribute('hidden', '');
    }
    mostrar_configuracion() {
        let configuracion = document.getElementById('configuracion-aplicacion');
        if( configuracion.hasAttribute('hidden') ) {
            let herramientas = document.getElementsByClassName('herramienta');
            for( let herramienta of herramientas ) {
                if( !herramienta.hasAttribute('hidden') ) herramienta.setAttribute('hidden', '');
            }
            configuracion.removeAttribute('hidden');
        } else configuracion.setAttribute('hidden', '');
    }
}