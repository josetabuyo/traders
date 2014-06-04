var Traders = {
	nextProductoId: function(){
		
		var maxValue = -1;
		
		_.each(this.usuario.inventario, function(producto){
			if(producto.id > maxValue){
				maxValue = producto.id;
			}
		});
		
		maxValue++;
		
		return maxValue;
		
	},
	
    usuario: {},
	
    _onUsuarioLogueado:function(){},
	
	_onNovedades:[],
    
	onNovedades: function(){
		var _this = this;
		
		if(arguments.length==1){
			this._onNovedades.push(arguments[0]);
			
		}else{
			this.saveDataUsuario();
			
			_.each(this._onNovedades, function(evento){
				evento();
			});
		}
		
	},
	
    onUsuarioLogueado:function(callback){
        this._onUsuarioLogueado = callback;
    },
	
	
	nextTruequeId: function(){
		
		var maxValue = -1;
		
		_.each(this.trueques(), function(_trueque){
			if(_trueque.id > maxValue){
				maxValue = _trueque.id;
			}
		});
		
		maxValue++;
		
		return maxValue;
		
	},
	
	
	_contactos:[],
    contactos:function(p){
        if(!p) return this._contactos;
        if(p.id) return _.findWhere(this._contactos, {id:p.id});
        if(p.query){
            if(p.query == "") 
                return this._contactos;
            else 
                return _.filter(this._contactos, function(contacto){
                    return contacto.nombre.indexOf(p.query)>=0 || contacto.id == p.query;
                });  
        }
    },
	login: function(_nombre, password){
        var _this = this;
		
		
		var _id = vx.addKey(_nombre + password);
		
		this.claveRSA = vx.keys[_id];
		
		
        this.usuario = {
            id: _id,
            nombre: _nombre,
            inventario: [],
			me_deben: [], 
			debo: [],
            avatar:""
        };
		
		
		
        
		
		////parche para atajar las respuestas
		vx.when({
			para: this.usuario.id
		}, function(mensaje){
			//nada-nop
        });
		
		
		
		vx.when({
			tipoDeMensaje:"vortex.persistencia.datos",
			de: this.usuario.id,
			para: this.usuario.id
		}, function(mensaje){
			
			_this.setDataUsuario(mensaje.dato);
        });
		
		
		vx.when({
			tipoDeMensaje:"traders.claveAgregada",
			para: this.usuario.id
		},function(mensaje){
			// le completo los datos
			vx.send({
				idRequest: mensaje.idRequest,
				para: mensaje.de,
				de: _this.usuario.id,
				datoSeguro: {
					contacto: {
						nombre: _this.usuario.nombre,
						inventario: _this.usuario.inventario,
						avatar:_this.usuario.avatar
					}
				}
			});
			
			// lo agrego
			_this.agregarContacto(mensaje.datoSeguro.contacto);
			
			
			_this.onNovedades();
			
		});
		
		
		
		/* Vemos */
        setTimeout(function(){
			
			_this.loadDataUsuario();
			
        },20);
		
		RepositorioDeConexiones.start(this.usuario.id);
		
        this._onUsuarioLogueado();
		
    },
	
	
	
	
    agregarProducto: function(p){
		var producto = _.clone(p);
        
		producto.id = this.nextProductoId();
		
		this.usuario.inventario.push(producto);
		
		
        vx.send({
            tipoDeMensaje:"traders.avisoDeNuevoProducto",
            de: this.usuario.id,
            datoSeguro: {
                producto: producto
            }
        });
		
        this.onNovedades();
    },
	modificarProducto: function(p){		
		var producto = _.findWhere(this.usuario.inventario, {id: p.id});
		producto = ClonadorDeObjetos.extend(producto, p);
		
        vx.send({
            tipoDeMensaje:"traders.avisoDeProductoModificado",
            de: this.usuario.id,
            datoSeguro: {
                producto: producto
            }
        });
		
        this.onNovedades();
    },
    quitarProducto: function(id_producto){
        
		//ver de usar delete
		this.usuario.inventario = $.grep(this.usuario.inventario, function(prod){
            return prod.id != id_producto;
        });
		
		
        vx.send({
            tipoDeMensaje:"traders.avisoDeBajaDeProducto",
            de: this.usuario.id,
            datoSeguro:{
                id_producto: id_producto
            }
        });
        this.onNovedades();
    },
	setDataUsuario: function(dato){
		var _this = this;
		
		if(dato) {
			this.usuario = ClonadorDeObjetos.extend(this.usuario, dato.usuario);
		
			this._trueques = dato.trueques;
		
			$.each(dato.contactos, function(index, item){
				_this.agregarContacto(item);
			});
		}
		else{
			this._trueques = [];
			
		}
		
		setTimeout(function(){
			vx.send({
				tipoDeMensaje: "traders.inventario",
				de: _this.usuario.id,
				datoSeguro:{
					inventario:_this.usuario.inventario
				}
			});
		}, 200);
		
		this.onNovedades();
	},
	
	
    saveDataUsuario: function(){
		
		var _dato = {
			usuario: 					this.usuario,
			contactos:					this.contactos(),
			trueques:					this.trueques()
		};
		
		if(typeof(Storage)!=="undefined"){
			//no se si usar la clave privada ahi o algo m?seguro que solo yo tenga
			
			localStorage.setItem(this.usuario.id, JSON.stringify(_dato));
			
		}else{
			
			vx.send({
				tipoDeMensaje:"vortex.persistencia.guardarDatos",
				de: this.usuario.id,
                para: this.usuario.id,
				dato: _dato
			});
		
		}
		
		
    },
	
    loadDataUsuario: function(){
        
		var _this = this;
		
		if(typeof(Storage)!=="undefined"){
			//no se si usar la clave privada ahi o algo m?seguro que solo yo tenga
			var sDatos = localStorage.getItem(this.usuario.id);
			
			this.setDataUsuario(JSON.parse(sDatos));
			

		}else{
			
			vx.send({
				tipoDeMensaje:"vortex.persistencia.obtenerDatos",
				de: this.usuario.id
			});
		}
		
		
		
    },
	
	_trueques:[],
    trueques:function(p){
        if(!p){
		
			return this._trueques;
		
		}else if(p.query){
		
			return _.filter(this._trueques, function(_trueque){
				return _trueque.contacto.nombre.indexOf(p.query)>=0 || contacto.id == p.query;
			});
			
        }else if(p.contacto){
			
			return _.filter(this._trueques, function(_trueque){
				return _trueque.contacto.id == p.contacto.id;
			});
			
		} else {
			console.log('a lo trueque 1 1 1 11 111  11 a los.... a re ');
			
			console.log('this._trueques', this._trueques);
			console.log('p', p);
			console.log('_.findWhere(this._trueques, p)', _.findWhere(this._trueques, p));
			
			return _.findWhere(this._trueques, {id: p.id});
			
			
		}
    },
	
	nuevoTrueque: function(){
		//****	arguments[] ****
		// forma 1: idContacto 	string
		// forma 2: contacto 	object
		//**********************
		
		var _this = this;
		
		var contacto = {};
		
        if(typeof(arguments[0]) == 'string'){
			
			var contacto = _this.contactos({id:arguments[0]});
			
		}else if(typeof(arguments[0]) == 'object'){
			contacto=arguments[0];
		}
		
		
		/*DEF: trueque*/
		var trueque = {
			id: this.nextTruequeId(),
			estado: "cero",
			contacto: contacto,
			ofertas:[
				{
					ofertante: 'usuario',
					estado: 'sin_enviar',
					doy: [],
					recibo: []
				}
			]
		};
		
		this._trueques.push(trueque);
		
		this.onNovedades();
		
		
		
		return trueque;
		
	},
	
	agregarProductoTrueque: function(trueque, producto, recibo_doy){
		
		
		if(typeof(trueque) == 'string'){
			var trueque = _this.trueque({id:trueque});
		}
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		
		
		if(oferta.ofertante == 'usuario'){
			oferta[recibo_doy].push(producto);
		}else{
			var nuevaOferta = ClonadorDeObjetos.clonarObjeto(oferta);
			
			nuevaOferta.ofertante = 'usuario';
			nuevaOferta.estado = 'sin_enviar';
			
			nuevaOferta[recibo_doy].push(producto);
			trueque.ofertas.push(nuevaOferta);
		}
		
		this.onNovedades();
    },
	
	
    quitarProductoTrueque: function(trueque, producto, recibo_doy){
		
		var _this = this;
		
		if(typeof(trueque) == 'string'){
			var trueque = _this.trueque({id:trueque});
		}
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1]
		
		if(oferta.ofertante == 'usuario'){
			
			
			oferta[recibo_doy] = $.grep(oferta[recibo_doy], function(producto_id){
				return producto_id != producto;
			});
			
		}else{
			var nuevaOferta = ClonadorDeObjetos.clonarObjeto(oferta);
			
			nuevaOferta.ofertante = 'usuario';
			nuevaOferta.estado = 'sin_enviar';
			
			nuevaOferta[recibo_doy] = $.grep(nuevaOferta[recibo_doy], function(prod){
				return prod.id != producto.id;
			});
			
			trueque.ofertas.push(nuevaOferta);
		}
		
		
		this.onNovedades();
		
    },
	
	
	
	enviarOferta: function(trueque){
	
		if(typeof(trueque) == 'string'){
			var trueque = _this.trueque({id:trueque});
		}
		
		var _oferta = trueque.ofertas[trueque.ofertas.length - 1]
		
		
		if(_oferta.estado == 'enviada'){
			alert('Ya hiciste tu oferta, esper?a respuesta.');
			return;
		}
		
		_oferta.estado = 'enviada';
		
        vx.send({
            tipoDeMensaje:"traders.trueque.oferta",
            para: trueque.contacto.id,
            de: this.usuario.id,
            datoSeguro:{
				trueque: {id : trueque.id},
				oferta: _oferta
            }
        });
		
		
        this.onNovedades();
    },
	
    
	aceptarTruequeDe: function(contacto){
		
        if(contacto.trueque.estado != "recibido") return;
        
		vx.send({
            tipoDeMensaje:"traders.aceptacionDeTrueque",
            para: id_contacto,
            de: this.usuario.id,
            datoSeguro:{
				recibo: contacto.trueque.propuestas.usuario.suyo,
                doy: contacto.trueque.propuestas.usuario.mio
            }
        });
		
        this._concretarTruequeCon(contacto);
        this.onNovedades();
    },
    _concretarTruequeCon: function(contacto){
        var _this = this;
        
		_.each(contacto.trueque.propuestas.usuario.mio, function(id_producto){
		    //_this.quitarProducto(id_producto);
			//ver de usar delete
			this.usuario.inventario = $.grep(this.usuario.inventario, function(prod){
				return prod.id != id_producto;
			});
        });
		
        _.each(contacto.trueque.propuestas.usuario.suyo, function(id_producto){
            
			this.usuario.inventario.push(producto);
			
			contacto.inventario = $.grep(contacto.inventario, function(prod){
				return prod.id != id_producto;
			});
			
        });
		
		//TO DO: historiar, no borrar, guardar muchos trueques
        contacto.trueque.propuestas.usuario.mio.length = 0;
        contacto.trueque.propuestas.usuario.suyo.length = 0;
		contacto.trueque.propuestas.contacto.mio.length = 0;
        contacto.trueque.propuestas.contacto.suyo.length = 0;
        contacto.trueque.estado = "cero";
		
		// informo a la comunidad mi inventario actualizado
		vx.send({
			tipoDeMensaje: "traders.inventario",
			de: _this.usuario.id,
			datoSeguro:{
				inventario:_this.usuario.inventario
			}
		});
		
    },
	
	
	agregarContacto: function(){
		//****	arguments[] ****
		// forma 1: idContacto 	string
		// forma 2: contacto 	object
		//**********************
		
		var _this = this;
		
		var contacto = {};
		
		
		
        if(typeof(arguments[0]) == 'string'){
			
			
			var contacto = _this.contactos({id:arguments[0]});
			
			if(!contacto){
			
			
				// es el id
				contacto = {
					id: arguments[0],
					estado: 'SIN_CONFIRMAR',
					nombre: null,
					inventario: [],
					avatar:""
				};
				this._contactos.push(contacto);
			}
			
			vx.send({
				tipoDeMensaje:"traders.claveAgregada",
				de: this.usuario.id,
				para: arguments[0],
				datoSeguro: {
					contacto: {
						id: this.usuario.id,
						nombre: this.usuario.nombre,
						inventario: this.usuario.inventario,
						avatar:this.usuario.avatar
					}
				}
				
			},function(mensaje){
				
				var contacto = _this.contactos({id:mensaje.de});
				
				contacto = ClonadorDeObjetos.extend(contacto, mensaje.datoSeguro.contacto);
				contacto.estado = 'CONFIRMADO';
				
				
				
				_this.onNovedades();
				
				
				
			});
			
		}else if(typeof(arguments[0]) == 'object'){
			
			
			var contacto = _this.contactos({id:arguments[0].id});
			if(!contacto){
			
				contacto=arguments[0];
				this._contactos.push(contacto);
			}
			
		}
		
		
		
		/*
			
		ojo con esta: mensaje de update y hace esto
		
		var contacto = _this.contactos({id:mensaje.de});
		contacto = ClonadorDeObjetos.extend(contacto, mensaje.datoSeguro.contacto);
		
		
		PARA HACER ESTO DEBO PROBAR EL CLONADOR DE OBJETOS CON VECTORES
		
		obj:{
			vec: [],
			atrib: 'bla'
		}
		
		tambien probar el $.extend
		
		*/
		
		
		//publico todos los filtros de ?
		vx.when({
			tipoDeMensaje:"traders.inventario",
			de: contacto.id
		}, function(mensaje){
			
			contacto.inventario = mensaje.datoSeguro.inventario;
			
			_this.onNovedades();
			
        });
		
		
        vx.when({
			tipoDeMensaje:"traders.avisoDeProductoModificado",
			de: contacto.id
		}, function(mensaje){
			var producto = _.findWhere(contacto.inventario, {id: mensaje.datoSeguro.producto.id});
			if(producto === undefined) return;			
			producto = ClonadorDeObjetos.extend(producto, mensaje.datoSeguro.producto);
				
			_this.onNovedades();
		});
        
		vx.when({
			tipoDeMensaje:"traders.avisoDeNuevoProducto",
			de: contacto.id
		}, function(mensaje){
			
			//_this._agregarProductoAlInventarioDe(mensaje.datoSeguro.producto, contacto);
			
			
			if(_.findWhere(contacto.inventario, {id: mensaje.datoSeguro.producto.id})!== undefined) return;
			
			
			contacto.inventario.push(mensaje.datoSeguro.producto);
			
			_this.onNovedades();
		});
		
        vx.when({
            tipoDeMensaje:"traders.avisoDeBajaDeProducto",
			de: contacto.id
		}, function(mensaje){
			
			contacto.inventario = $.grep(contacto.inventario, function(prod){
				return prod.id != mensaje.datoSeguro.id_producto;
			});
			
			_this.onNovedades();
		});
		
		
		vx.when({
			tipoDeMensaje:"traders.trueque.oferta",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			
			var trueque = _this.trueques({
				id: mensaje.datoSeguro.trueque.id,
				contacto: {id: mensaje.de}
			})[0];
			
			
			if(!trueque){
				trueque = _this.nuevoTrueque(mensaje.de)
			}
			
			
			var _oferta = mensaje.datoSeguro.oferta;
			
			_oferta.ofertante = 'contacto';
			_oferta.estado = 'recibida';
			
			
			var aux_doy = _oferta.doy;
			_oferta.doy = _oferta.recibo;
			_oferta.recibo = aux_doy;
			
			
			trueque.ofertas.push(_oferta);
			
			_this.onNovedades();
		});
		        
		
        vx.when({
            tipoDeMensaje:"traders.aceptacionDeTrueque",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			contacto.trueque.propuestas.contacto.mio = mensaje.datoSeguro.recibo;
			contacto.trueque.propuestas.contacto.suyo = mensaje.datoSeguro.doy;
			
			_this._concretarTruequeCon(contacto);
			
			_this.onNovedades();
		});
		
		vx.when({
			tipoDeMensaje:"traders.avisoDeCambioDeAvatar",
			de: contacto.id
		}, function(mensaje){
			contacto.avatar = mensaje.datoSeguro.avatar;
			_this.onNovedades();
		});
		
		_this.onNovedades();
		
		
		return contacto;
		
    },
	quitarTrueque: function(id){
		this._trueques = $.grep(this._trueques, function(item){
            return item.id != id;
        });
		
		this.onNovedades();
	},
	quitarContacto: function(id){
		this._contactos = $.grep(this._contactos, function(item){
            return item.id != id;
        });
		
		this.onNovedades();
	},
	cambiarAvatar: function(imagen_codificada){
        this.usuario.avatar=imagen_codificada;
		vx.send({
            tipoDeMensaje:"traders.avisoDeCambioDeAvatar",
            de: this.usuario.id,
            datoSeguro: {
                avatar: imagen_codificada
            }
        });
		
		this.onNovedades();
    }
};