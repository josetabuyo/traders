var PersistidorManual = {
    start:function(id_usuario){
        
		vx.when({
		
			tipoDeMensaje:"vortex.persistencia.manual.guardarDatos",
			de: id_usuario,
			para: id_usuario
			
		},function(mensaje){
			
			alertify.prompt("Copia esto al portapeles", function (e, str) {
				if (e) {
					clipboardCopy(JSON.stringify(mensaje.datoSeguro.datos));
				} else {
					
				}
			}, JSON.stringify(mensaje.datoSeguro.datos));
			
			
        });
        
		
		vx.when({
			tipoDeMensaje:"vortex.persistencia.manual.obtenerDatos",
			de: id_usuario,
			para: id_usuario
		},function(mensaje){
			
			alertify.prompt("Ingrese sus datos guardados", function (e, str) {
				
				var estado = 'ERROR';
				var datos = {};
				
				if (e) {
					datos = JSON.parse(str);
					estado = 'OK';
				} else {
					estado = 'ERROR';
				}
				
				
				vx.send({
					idRequest: mensaje.idRequest,
					de: id_usuario,
					para: id_usuario,
					datoSeguro: {
						datos: datos,
						estado: estado
					}
				});
				
			}, "");
        });
    }
};