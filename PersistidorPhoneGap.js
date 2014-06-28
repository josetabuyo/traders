var PersistidorPhoneGap = function(opt){
	var _this = this;    
	
	// Al dope creo, no se si hacerlo acá o afuera
	if(!window.isphone) return;
	
	var optDefault = {
		usuario_id: null,
		contacto_id: null
	};
	
	$.extend(true, optDefault, opt);	
	$.extend(true, this, optDefault);	
	
	if(!this.contacto_id){
		this.contacto_id = this.usuario_id
	}
	
	vx.pedirMensajes({
		filtro: {
				tipoDeMensaje: "vortex.persistencia.guardarDatos",
				de: _this.contacto_id,
				para: _this.usuario_id
			},
		callback: function(mensaje){

			var estado = 'ERROR';

			//estado = 'DENEGADO';
			
			if(typeof(Storage)!=="undefined"){
				localStorage.setItem(_this.contacto_id, mensaje.datoSeguro);
				estado = 'OK';
			}

			vx.send({
				responseTo: mensaje.idRequest,
				de: _this.usuario_id,
				para: _this.contacto_id,
				descripcion: 'PersistidorPhoneGap',
				estado: estado
			});
		}
	});
	
	
	vx.pedirMensajesSeguros({
		filtro: {
			tipoDeMensaje:"vortex.persistencia.obtenerDatos",
			de: _this.contacto_id,
			para: _this.usuario_id
		},
		callback: function(mensaje){

			var estado = 'ERROR';
			//estado = 'DENEGADO';

			var datos;

			if(typeof(Storage)!=="undefined"){
				datos = localStorage.getItem(_this.usuario_id);
				if(datos){
					estado = 'OK';
				}
			}

			var obj = {
				responseTo: mensaje.idRequest,
				de: _this.usuario_id,
				para: _this.contacto_id,
				descripcion: 'LocalStorage',
				estado: estado,
				datoSeguro: datos														
			};
			vx.enviarMensaje(obj);
		}
	});	
};
