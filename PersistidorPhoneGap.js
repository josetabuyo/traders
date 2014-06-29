var PersistidorPhoneGap = function(opt){
	var _this = this;    
	
	// validacion
	if(!window.isphone) return;
	//
	
	
	var optDefault = {
		usuario_id: null,
		contacto_id: null
	};
	
	$.extend(true, optDefault, opt);	
	$.extend(true, this, optDefault);	
	
	if(!this.contacto_id){
		this.contacto_id = this.usuario_id
	}
	
	
	var db = window.openDatabase("traders_db", "1.0", "traders_db", 1000000);
	var cmd;
	
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
				//localStorage.setItem(_this.contacto_id, mensaje.datoSeguro);
				
				
				var addDato = function(tx){
					cmd= '';
					cmd+='CREATE TABLE IF NOT EXISTS Datos (';
					cmd+='	id		TEXT PRIMARY KEY,';
					cmd+='	dato	TEXT';
					cmd+=')';
					tx.executeSql(cmd);
					
					cmd = '';
					cmd+='INSERT INTO Datos (';
					cmd+='	id,		'
					cmd+='	dato	';
					cmd+=')';
					cmd+='VALUES (';
					cmd+='	"'+ mensaje.de + '",';
					cmd+='	"'+ mensaje.datoSeguro + '",';
					cmd+=')';
					tx.executeSql(cmd);
				};
				
				var errorCB = function(err){
					console.log(err);
					estado = 'ERROR';
				};
				
				var successCB = function(){
					estado = 'OK';
				};
				
				db.transaction(addDato, errorCB, successCB);
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

			var dato;

			if(typeof(Storage)!=="undefined"){
				
				
				var queryDB = function(tx) {
					cmd= '';
					cmd+='SELECT dato';
					cmd+='	FROM Datos';
					cmd+='	WHERE id = "' + mensaje.de + '"';
					
					tx.executeSql(cmd, [], querySuccess, errorCB);
				}

				
				var querySuccess = function(tx, results) {
					dato = results.rows[0];
					estado = 'OK';
				};
				

				var errorCB = function (err) {
					console.log(err);
					estado = 'ERROR';
				};

				
				db.transaction(queryDB, errorCB);
			}
			
			
			var obj = {
				responseTo: mensaje.idRequest,
				de: _this.usuario_id,
				para: _this.contacto_id,
				descripcion: 'PersistidorPhoneGap',
				estado: estado,
				datoSeguro: dato
			};
			
			vx.enviarMensaje(obj);
		}
	});	
};
