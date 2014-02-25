var PersistidorManual = {
    start:function(id_usuario){
        vx.pedirMensajes({
            filtro: {
                tipoDeMensaje:"vortex.persistencia.guardarDatos",
                de: id_usuario,
                para: id_usuario
            }, 
            callback: function(mensaje){
                alertify.prompt("Copia tus datos donde quieras", function (e, str) {
                    if (e) {

                    } else {

                    }
                }, JSON.stringify(mensaje.datos));
            }
        });  
        
        vx.pedirMensajes({
            filtro: {
                tipoDeMensaje:"vortex.persistencia.obtenerDatos",
                de: id_usuario
            }, 
            callback: function(mensaje){
                alertify.prompt("Ingrese sus datos guardados", function (e, str) {
                    if (e) {
                        vx.enviarMensaje({
                            tipoDeMensaje:"vortex.persistencia.datos",
                            para: id_usuario,
                            datos:JSON.parse(str)
                        });
                    } else {
                        // user clicked "cancel"
                        vx.enviarMensaje({
                            tipoDeMensaje:"vortex.persistencia.noHayDatos",
                            para:id_usuario
                        });
                    }
                }, "");
            }
        });          
    }
};