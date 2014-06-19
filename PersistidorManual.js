var PersistidorManual = {
    start:function(id_usuario){
        
		vx.when({		
			tipoDeMensaje:"vortex.persistencia.guardarDatos",
			de: id_usuario,
			para: id_usuario
		},function(mensaje){
			vex.dialog.prompt({
				message: 'Llevate tus datos tranquilo',
				value: JSON.stringify(mensaje.datos),
				callback: function(value) {
					if(value){
						clipboardCopy(JSON.stringify(mensaje.dato));
					}
				}
			});
		});
        
		
		vx.when({
			tipoDeMensaje:"vortex.persistencia.obtenerDatos",
			de: id_usuario,
			para: id_usuario
		},function(mensaje){
			vex.dialog.prompt({
				message: 'Ingresá tus datos guardados',
				placeholder: 'Tus datos',
				callback: function(value) {
					if (value) {					
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
				}
			});
        });
    }
};