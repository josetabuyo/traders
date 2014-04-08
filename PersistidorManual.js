var PersistidorManual = {
    start:function(id_usuario){
        
		vx.when({
		
			tipoDeMensaje:"vortex.persistencia.guardarDatos",
			de: id_usuario,
			para: id_usuario
			
		},function(mensaje){
			
			alertify.prompt("Copia esto al portapeles", function (e, str) {
				if (e) {
					clipboardCopy(JSON.stringify(mensaje.dato));
				} else {
					
				}
			}, JSON.stringify(mensaje.datos));
			
			
        });
        
		
		vx.when({
			tipoDeMensaje:"vortex.persistencia.obtenerDatos",
			de: id_usuario,
			para: id_usuario
		},function(mensaje){
			
			alertify.prompt("Ingrese sus datos guardados", function (e, str) {
				if (e) {
					
					vx.send({
						tipoDeMensaje:"vortex.persistencia.datos",
						idRequest: mensaje.idRequest,
						de: id_usuario,
						para: id_usuario,
						dato: JSON.parse(str)
					});
					
				} else {
					
					// user clicked "cancel"
					vx.send({
						tipoDeMensaje:"vortex.persistencia.noHayDatos",
						idRequest: mensaje.idRequest,
						de: id_usuario,
						para: id_usuario
					});
				}
			}, "");
        });
    }
};