var PersistidorManual = {
    start:function(id_usuario){
        
		vx.when({
		
			tipoDeMensaje:"vortex.persistencia.guardarDatos",
			de: id_usuario,
			para: id_usuario
			
		},function(mensaje){
			
			alertify.prompt("Copia esto al portapeles", function (e, str) {
				if (e) {
					clipboardCopy(JSON.stringify(mensaje.datos));
				} else {
					
				}
			}, JSON.stringify(mensaje.datos));
			
			
        });
        
		
		vx.when({
		
			tipoDeMensaje:"vortex.persistencia.obtenerDatos",
			de: id_usuario
			
		},function(mensaje){
			
			alertify.prompt("Ingrese sus datos guardados", function (e, str) {
				if (e) {
					vx.enviarMensaje({
						tipoDeMensaje:"vortex.persistencia.datos",
						de: id_usuario,
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
        });
    }
};