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
	
	vx.send({
		tipoDeMensaje	: "vortex.debug",
		descripcion		: "se inicializó el PersistidorPhoneGap y se instanció la base"
	});
	
	
	var obtenerDatos = function (id){
		var dato;
		
		var cmd;
		
		
		function populateDB(tx) {
			cmd= '';
			cmd+='CREATE TABLE IF NOT EXISTS Datos (';
			cmd+='	id		TEXT PRIMARY KEY,';
			cmd+='	dato	TEXT';
			cmd+=')';
			tx.executeSql(cmd);
		}

		
		function queryDB(tx) {
			cmd= '';
			cmd+='SELECT dato';
			cmd+='	FROM Datos';
			cmd+='	WHERE id = "' + id + '"';
			
			tx.executeSql(cmd, [], querySuccess, errorCB);
		}

		// Query the success callback
		//
		function querySuccess(tx, results) {
			dato = JSON.parse(results.rows[0]);
			estado = 'OK';
		}

		// Transaction error callback
		//
		function errorCB(err) {
			vx.send({
				tipoDeMensaje	: "vortex.debug",
				descripcion		: "dio error " + err.code,
				err				: err
			});
			
			estado = 'ERROR';
		}

		// Transaction success callback
		//
		function successCB() {
			db.transaction(queryDB, errorCB);
		}
		
		db.transaction(populateDB, errorCB, successCB);
		
		
		
		/*
		db.transaction(
			function(tx) {
				
				cmd= '';
				cmd+='SELECT dato';
				cmd+='	FROM Datos';
				cmd+='	WHERE id = "' + id + '"';
				
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "se ejecuta " + cmd
				});
		
				
				
				tx.executeSql(cmd, [],
					function(tx, results) {
					
						dato = JSON.parse(results.rows[0]);
						estado = 'OK';
						
					},function(err){
						
						vx.send({
							tipoDeMensaje	: "vortex.debug",
							descripcion		: "dio error " + err,
							err				: err
						});
						estado = 'ERROR';
					}
				);
			
			},function(err){
				
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "dio error " + err,
					err				: err
				});
				estado = 'ERROR';
			}
		);
		*/
		
		
		
		
		return dato;
	};
	
	
	
	
	
	
	
	vx.pedirMensajes({
		filtro: {
				tipoDeMensaje: "vortex.persistencia.guardarDatos",
				de: _this.contacto_id,
				para: _this.usuario_id
			},
		callback: function(mensaje){
			var estado = 'ERROR';
			
			
			vx.send({
				tipoDeMensaje	: "vortex.debug",
				descripcion		: "llegó el mensaje de guardar datos",
				mensaje			: mensaje
			});
			
			var dato = obtenerDatos(mensaje.de);
			
			
			vx.send({
				tipoDeMensaje	: "vortex.debug",
				descripcion		: "se obtiene este dato.nombre: " + dato.nombre,
				dato			: dato
			});
			
			
			//estado = 'DENEGADO';
			
			var addDato = function(tx){
				cmd= '';
				cmd+='CREATE TABLE IF NOT EXISTS Datos (';
				cmd+='	id		TEXT PRIMARY KEY,';
				cmd+='	dato	TEXT';
				cmd+=')';
				
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "se ejecuta " + cmd
				});
				
				tx.executeSql(cmd);
				
				
				if(dato){
					cmd = '';
					cmd+='UPDATE Datos (';
					cmd+='	SET dato = "'+ mensaje.datoSeguro + '",';
					cmd+='	WHERE id = "'+ mensaje.de + '"';
				}else{
					cmd = '';
					cmd+='INSERT INTO Datos (';
					cmd+='	id,		'
					cmd+='	dato	';
					cmd+=')';
					cmd+='VALUES (';
					cmd+='	"'+ mensaje.de + '",';
					cmd+='	"'+ mensaje.datoSeguro + '",';
					cmd+=')';
				}
					
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "se ejecuta " + cmd
				});
				
				tx.executeSql(cmd);
				
			};
			
			var errorCB = function(err){
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "dio error " + err,
					err				: err
				});
				
				estado = 'ERROR';
			};
			
			var successCB = function(){
				estado = 'OK';
			};
			
			db.transaction(addDato, errorCB, successCB);
			
			
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
			
			vx.send({
				tipoDeMensaje	: "vortex.debug",
				descripcion		: "llego mensaje de obtener datos",
				mensaje			: mensaje
				
			});
			
			var dato = obtenerDatos(mensaje.de);
			
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
