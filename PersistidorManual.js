var PersistidorManual = {
    start:function(id_usuario){
		vx.when({
		
			tipoDeMensaje:"vortex.persistencia.manual.guardarDatos",
			de: id_usuario,
			para: id_usuario
		},function(mensaje){
			vex.dialog.prompt({
				message: 'Copia esto al portapeles',
				value: JSON.stringify(mensaje.datoSeguro.datos),
				callback: function(value) {
					if(value){
						clipboardCopy(JSON.stringify(mensaje.datoSeguro.datos));
					}
				}
			});
			
        });
		
		vx.when({
			tipoDeMensaje:"vortex.persistencia.manual.obtenerDatos",
			de: id_usuario,
			para: id_usuario
		},function(mensaje){			
			vex.dialog.prompt({
				message: 'Ingrese sus datos guardados',
				placeholder: 'Sus datos',
				callback: function(value) {
					
					var estado = 'ERROR';
					var datos = {};

					if (value) {
						datos = value;
						estado = 'OK';
					} else {
						estado = 'ERROR';
					}
				
					vx.send({
					responseTo: mensaje.idRequest,
					de: id_usuario,
					para: id_usuario,
					datoSeguro: {
							datos: datos,
							estado: estado
						}
					});
					
				}
			});
        });
    }
};