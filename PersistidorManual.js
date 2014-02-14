var PersistidorManual = {
    start:function(nombre_usuario){
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"vortex.persistencia.guardarDatos",
                de: nombre_usuario
            }), 
            callback: function(mensaje){
                alertify.alert(JSON.stringify(mensaje.datos));
            }
        });  
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"vortex.persistencia.obtenerDatos",
                de: nombre_usuario
            }), 
            callback: function(mensaje){
                alertify.prompt("Ingrese sus datos guardados", function (e, str) {
                    if (e) {
                        vx.enviarMensaje({
                            tipoDeMensaje:"vortex.persistencia.datos",
                            de: nombre_usuario,
                            datos:JSON.parse(str)
                        });
                    } else {
                        // user clicked "cancel"
                        vx.enviarMensaje({
                            tipoDeMensaje:"vortex.persistencia.noHayDatos",
                            de: nombre_usuario
                        });
                    }
                }, "");
            }
        });          
    }
};