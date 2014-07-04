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
	
	
	vx.send({
		tipoDeMensaje	: "vortex.debug",
		descripcion		: "se inicializó el PersistidorPhoneGap"
	});
	
	
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
			var dato = {};
			
			
			vx.send({
				tipoDeMensaje	: "vortex.debug",
				descripcion		: "llegó el mensaje de guardar datos"
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
				
				cmd= '';
				cmd+='SELECT dato';
				cmd+='	FROM Datos';
				cmd+='	WHERE id = "' + mensaje.de + '"';
				
				
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "se ejecuta " + cmd
				});
				
				tx.executeSql(cmd, [], function(tx, results) {
					dato = JSON.parse(results.rows[0]);
					
					
					vx.send({
						tipoDeMensaje	: "vortex.debug",
						descripcion		: "se lee este dato" + dato,
						dato			: dato	
					});
					
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
					
				},function(err){
					vx.send({
						tipoDeMensaje	: "vortex.debug",
						descripcion		: "dio error " + err,
						dato			: err
					});
					estado = 'ERROR';
				});
				
				
			};
			
			var errorCB = function(err){
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "dio error " + err,
					dato			: err
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
				descripcion		: "llego mensaje de obtener datos"
			});
			
			
			var dato;

			var queryDB = function(tx) {
				cmd= '';
				cmd+='SELECT dato';
				cmd+='	FROM Datos';
				cmd+='	WHERE id = "' + mensaje.de + '"';


				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "se ejecuta " + cmd
				});
				
				tx.executeSql(cmd, [], querySuccess, errorCB);
			}

			
			var querySuccess = function(tx, results) {
				dato = JSON.parse(results.rows[0]);
				estado = 'OK';
				
				
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "se lee este dato" + dato,
					dato			: dato	
				});
				
			};
			

			var errorCB = function (err) {
				console.log(err);
				estado = 'ERROR';
			};

			
			db.transaction(queryDB, errorCB);
			
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
