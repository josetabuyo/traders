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
	
	
	var estado;
	
	// this is called when an error happens in a transaction
	var onErrorGenerico = function(transaction, error) {
		
		vx.send({
			tipoDeMensaje	: "vortex.debug",
			descripcion		: 'Error: ' + error.message + ' code: ' + error.code,
			error 			: error,
			arguments		: arguments
		});
	};
	
	var onSuccessGenerico = function() {
		vx.send({
			tipoDeMensaje	: "vortex.debug",
			descripcion		: 'Success!!',
			arguments		: arguments
		});
		
	}
	
	
	
	// this is called when a successful transaction happens
	
	var obtenerDatos = function (id, onObtenerDatos){
		var dato = {dummy: 'dummmy'};
		
		db.transaction(function(tx){
			
			var sql = '';
			sql+='SELECT dato';
			sql+='	FROM Datos;';
			//sql+='	WHERE id = "' + id + '";';
			
			vx.send({
				tipoDeMensaje	: "vortex.debug",
				descripcion		: "se ejecuta " + sql
			});
			
			
			tx.executeSql(sql, [], function(tx, result) {
				
				vx.send({
					tipoDeMensaje	: "vortex.debug",
					descripcion		: "obtenerDatos result: " + result,
					result			: result
				});
				
				
				if (result != null && result.rows != null) {
					
					dato = JSON.parse(result.rows.item(0));
					
					onObtenerDatos(dato);
				}
			}, onErrorGenerico);
			
		}, onErrorGenerico, onSuccessGenerico);
		
	};
	
	
	
	// this line will try to create the table User in the database just	created/openned
	db.transaction(function(tx){
		
		// this line actually creates the table User if it does not exist	and sets up the three columns and their types
		// note the UserId column is an auto incrementing column which is	useful if you want to pull back distinct rows
		// easily from the table.
		var sql = '';
		sql+='CREATE TABLE IF NOT EXISTS Datos (';
		sql+='	id		TEXT PRIMARY KEY,';
		sql+='	dato	TEXT';
		sql+=')';
		
		vx.send({
			tipoDeMensaje	: "vortex.debug",
			descripcion		: "se ejecuta " + sql
		});
		
		
		
		tx.executeSql( sql, [], function(){
			
			vx.send({
				tipoDeMensaje	: "vortex.debug",
				descripcion		: "se crea la base, onSucces creo",
				arguments		: arguments
			});
			
			
			vx.pedirMensajesSeguros({
				filtro: {
					tipoDeMensaje:"vortex.persistencia.obtenerDatos",
					de: _this.contacto_id,
					para: _this.usuario_id
				},
				callback: function(mensaje){
					estado = 'ERROR';
					//estado = 'DENEGADO';
					
					vx.send({
						tipoDeMensaje	: "vortex.debug",
						descripcion		: "llego mensaje de obtener datos",
						mensaje			: mensaje
						
					});
					
					
					obtenerDatos(mensaje.de, function(dato){
						
						vx.send({
							tipoDeMensaje	: "vortex.debug",
							descripcion		: "se obtiene el dato de " + dato.nombre,
							dato			: dato
						});
						
						var obj = {
							responseTo: mensaje.idRequest,
							de: _this.usuario_id,
							para: _this.contacto_id,
							descripcion: 'PersistidorPhoneGap',
							estado: estado,
							datoSeguro: dato
						};
						
						vx.enviarMensaje(obj);
						
					});
				}
			});	
			
			
			
			
			vx.pedirMensajes({
				filtro: {
						tipoDeMensaje: "vortex.persistencia.guardarDatos",
						de: _this.contacto_id,
						para: _this.usuario_id
					},
				callback: function(mensaje){
					estado = 'ERROR';
					//estado = 'DENEGADO';
					
					
					vx.send({
						tipoDeMensaje	: "vortex.debug",
						descripcion		: "llegó el mensaje de guardar datos",
						mensaje			: mensaje
					});
					
					
					obtenerDatos(mensaje.de, function(dato){
						
						// this is the section that actually inserts the values into the User table
						db.transaction(function(tx) {
							
							var sql = '';
							if(dato){
								sql+='UPDATE Datos';
								sql+='	SET dato = "'+ mensaje.datoSeguro + '",';
								sql+='	WHERE id = "'+ mensaje.de + '"';
							}else{
								sql+='INSERT INTO Datos (';
								sql+='	id,		'
								sql+='	dato	';
								sql+=')';
								sql+='VALUES (';
								sql+='	"'+ mensaje.de + '",';
								sql+='	"'+ mensaje.datoSeguro + '"';
								sql+=')';
							}
							
							
							vx.send({
								tipoDeMensaje	: "vortex.debug",
								descripcion		: "se ejecuta " + sql
							});
							
							tx.executeSql(sql,[], function(tx, result){
								
								vx.send({
									tipoDeMensaje	: "vortex.debug",
									descripcion		: "resultados",
									arguments		: arguments
								});
								
								estado = 'OK';
								
								vx.send({
									responseTo: mensaje.idRequest,
									de: _this.usuario_id,
									para: _this.contacto_id,
									descripcion: 'PersistidorPhoneGap',
									estado: estado
								});
								
							}, function (tx, error) {
			
								vx.send({
									tipoDeMensaje	: "vortex.debug",
									descripcion		: 'Error: ' + error.message + ' code: ' + error.code,
									error 			: error,
									arguments		: arguments
								});
							
							   
								estado = 'ERROR';
								
								vx.send({
									responseTo: mensaje.idRequest,
									de: _this.usuario_id,
									para: _this.contacto_id,
									descripcion: 'PersistidorPhoneGap',
									estado: estado
								});
								
							});
							
						}, onErrorGenerico, onSuccessGenerico);
					});
				}
			});
			
		}, onErrorGenerico);
		
	}, onErrorGenerico, function() {
		
		/*onSuccess*/
		vx.send({
			tipoDeMensaje	: "vortex.debug",
			descripcion		: 'Terminou la transaccion global',
			arguments		: arguments
		});
		
	});

	
		
};
