var PersistidorLocalStorage = {
    start:function(id_usuario){
		
		var _this = this;
		
		vx.when({
			tipoDeMensaje:"vortex.persistencia.guardarDatos",
			de: id_usuario,
			para: id_usuario
			
		},function(mensaje){
			
			var estado = 'ERROR';
			
			//estado = 'DENEGADO';
			
			if(typeof(Storage)!=="undefined"){
				localStorage.setItem(id_usuario, JSON.stringify(mensaje.datoSeguro.datos));
				estado = 'OK';
			}
			
			vx.send({
				responseTo: mensaje.idRequest,
				de: id_usuario,
				para: id_usuario,
				descripcion: 'LocalStorage',
				datoSeguro: {
					estado: estado
				}
			});
			
		});
		
		
		
		
		vx.when({
			tipoDeMensaje:"vortex.persistencia.obtenerDatos",
			de: id_usuario,
			para: id_usuario
		},function(mensaje){
			
			var estado = 'ERROR';
			
			var datos;
			
			
			if(typeof(Storage)!=="undefined"){
				datos = JSON.parse(localStorage.getItem(id_usuario));
				if(datos){
					estado = 'OK';
				}
			}
			
			
			console.log('alguien quiere obtener los datos');
			console.log(datos);
			
			
			var obj = {
				responseTo: mensaje.idRequest,
				de: id_usuario,
				para: id_usuario,
				descripcion: 'LocalStorage',
				datoSeguro: {
					datos: datos,
					estado: estado
				}				
			};
			
			vx.send(obj);
			
        });
		
	}
}
