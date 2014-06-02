var Traders = {
    
	
	usuario: {},
	
	
	
	
    _onUsuarioLogueado:function(){},
	
	
	
	_onNovedades:[],
	onNovedades: function(){
		var Traders = this;
		
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
	
	
	
	
	
	_contactos:[],
    contactos:function(){
        
		if(typeof(arguments[0]) == 'string'){
			return _.where(this._contactos, {id: arguments[0]});
		}else if(typeof(arguments[0]) == 'object'){
			return _.where(this._contactos, arguments[0]);
		}else{
			return this._contactos;
		}
    },
	login: function(_nombre, password){
        var Traders = this;
		
		
		var _id = vx.addKey(_nombre + password);
		
		this.claveRSA = vx.keys[_id];
		
		
        this.usuario = {
            id: _id,
            nombre: _nombre
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
			
			Traders.setDataUsuario(mensaje.dato);
        });
		
		
		vx.when({
			tipoDeMensaje:"traders.claveAgregada",
			para: this.usuario.id
		},function(mensaje){
			
			
			// le completo los datos
			vx.send({
				idRequest: mensaje.idRequest,
				para: mensaje.de,
				de: Traders.usuario.id,
				datoSeguro: {
					productos: Traders.productos({
						propietario: Traders.usuario.id
					}),
					contacto: {
						nombre: Traders.usuario.nombre
					}
				}
			});
			
			Traders.agregarContacto(mensaje.datoSeguro.contacto);
			Traders.actualizarInventario(mensaje.de, mensaje.datoSeguro.productos);
			
			
			Traders.onNovedades();
			
		});
		
		
		
		/* Vemos */
        setTimeout(function(){
			
			Traders.loadDataUsuario();
			
        },20);
		
		
		
        this._onUsuarioLogueado();
		
    },
	
	
	
	
    agregarProducto: function(){
		var Traders = this;
		
		var producto = arguments[0];
		
		var flagInformar;
		
		if(arguments.length == 2){
			flagInformar = arguments[1];
		}
		
		producto.id = Traders.nextProductoId();
		
		
		this._productos.push(producto);
		
		if(flagInformar){
			vx.send({
				tipoDeMensaje:"traders.productos.alta",
				de: this.usuario.id,
				datoSeguro: {
					producto: producto
				}
			});
		}
		
        this.onNovedades();
    },
	
    quitarProducto: function(){
        
		var producto = arguments[0];
		
		var flagInformar;
		
		if(arguments.length == 2){
			flagInformar = arguments[1];
		}
		
		this._productos = $.grep(this._productos, function(_producto){
			return !(_producto.id == producto.id && _producto.propietario == producto.propietario);
		});
		
<<<<<<< HEAD
		this._productos = $.grep(this._productos, function(item){
            return !(item.id == producto.id && item.propietario == producto.propietario);
        });
		
=======
		/*
		_.each(this.productos(), function(_producto, i, lista){
			if(	producto.id == _producto.id &&
				producto.propietario == _producto.propietario
			)
			delete lista[i];
			
			return false;
		});
		*/
>>>>>>> cefaaaf62d1c66695419e89a8ca7e019459018f4
		
		if(flagInformar){
			vx.send({
				tipoDeMensaje:"traders.productos.baja",
				de: this.usuario.id,
				datoSeguro:{
					producto: producto
				}
			});
		}
		
        this.onNovedades();
    },
	setDataUsuario: function(dato){
		var Traders = this;
		
		this.usuario = ClonadorDeObjetos.extend(this.usuario, dato.usuario);
		
		console.log('dato.productos', dato.productos);
		if(dato.productos){
			this._productos = dato.productos;
		}
		
		if(dato.trueques){
			this._trueques = dato.trueques;
		}
		
		if(dato.contactos){
			$.each(dato.contactos, function(index, item){
				Traders.agregarContacto(item);
			});
		}
		
		
		vx.send({
			tipoDeMensaje: "traders.productos.inventario",
			de: Traders.usuario.id,
			datoSeguro:{
				productos: Traders.productos({
					propietario: Traders.usuario.id
				})
			}
		});
		
		
		this.onNovedades();
	},
	
	
    saveDataUsuario: function(){
		
		var _dato = {
			usuario: 					this.usuario,
			contactos:					this.contactos(),
			trueques:					this.trueques(),
			productos:					this.productos()
		};
		
		if(typeof(Storage)!=="undefined"){
			//no se si usar la clave privada ahi o algo más seguro que solo yo tenga
			
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
        
		var Traders = this;
		
		if(typeof(Storage)!=="undefined"){
			//no se si usar la clave privada ahi o algo más seguro que solo yo tenga
			var sDatos = localStorage.getItem(this.usuario.id);
			
			this.setDataUsuario(JSON.parse(sDatos));
			

		}else{
			
			vx.send({
				tipoDeMensaje:"vortex.persistencia.obtenerDatos",
				de: this.usuario.id
			});
		}
		
		
		
    },
	
	_productos:[],
    productos:function(p){
        if(!p){
		
			return this._productos;
		
		}else if(p.query){
		
			return _.filter(this._productos, function(_producto){
				return _producto.nombre.indexOf(p.query)>=0 || _producto.id == p.query;
			});
			
        } else {
			
			if(this._productos.length > 0){
				return _.where(this._productos, p);
			}else{
				return [];
			}
		}
    },
	nextProductoId: function(){
		var Traders = this;
		var maxValue = -1;
		
		_.each(Traders.productos({
			propietario: Traders.usuario.id
			
		}), function(producto){
			if(producto.id > maxValue){
				maxValue = producto.id;
			}
		});
		
		maxValue++;
		
		return maxValue;
		
	},
	
	
	
	
	
	
	
	_trueques:[],
    trueques:function(p){
		var Traders = this;
        if(!p){
		
			return this._trueques;
		
		}else if(p.query){
		
			return _.filter(this._trueques, function(_trueque){
				
				var contacto = Traders.contactos(trueque.contraparte)[0];
				
				return contacto.nombre.indexOf(p.query)>=0 || contacto.id == p.query;
			});
			
        }else if(p.contacto){
			
			return _.filter(this._trueques, function(_trueque){
				return _trueque.contraparte == p.contacto.id;
			});
			
		} else {
			return _.findWhere(this._trueques, p);
		}
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
	nuevoTrueque: function(){
		//****	arguments[] ****
		// forma 1: idContacto 	string
		// forma 2: contacto 	object
		//**********************
		
		var Traders = this;
		
		var contacto = {};
		
        if(typeof(arguments[0]) == 'string'){
			
			var contacto = Traders.contactos({id:arguments[0]})[0];
			
		}else if(typeof(arguments[0]) == 'object'){
			contacto=arguments[0];
		}
		
		
		/*DEF: trueque*/
		var trueque = {
			id: this.nextTruequeId(),
			estado: "cero",
			contraparte: contacto.id,
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
			var trueque = Traders.trueque({id:trueque});
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
		
		var Traders = this;
		
		if(typeof(trueque) == 'string'){
			var trueque = Traders.trueque({id:trueque});
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
			var trueque = Traders.trueque({id:trueque});
		}
		
		var _oferta = trueque.ofertas[trueque.ofertas.length - 1]
		
		
		if(_oferta.estado == 'enviada'){
			alert('Ya hiciste tu oferta, esperá la respuesta.');
			return;
		}
		
		_oferta.estado = 'enviada';
		
        vx.send({
            tipoDeMensaje:"traders.trueque.oferta",
            para: trueque.contraparte,
            de: this.usuario.id,
            datoSeguro:{
				trueque: {id : trueque.id},
				oferta: _oferta
            }
        });
		
		
        this.onNovedades();
    },
	
    
	aceptarTrueque: function(trueque){
		
		
        if(trueque.estado == "cerrado"){
			alert('Este trueque ya está cerrado.');
			return;
		}
		
		trueque.estado = "cerrado";
		
		var _oferta = trueque.ofertas[trueque.ofertas.length - 1]
		
		
		if(_oferta.estado != 'recibida'){
			alert('La oferta tiene modificaciones, deberías ofertar.');
			return;
		}
		
		//tipoDeMensaje:"traders.aceptacionDeTrueque",
		
		
		
		vx.send({
            tipoDeMensaje:"traders.trueque.aceptar",
            para: trueque.contraparte,
            de: this.usuario.id,
            datoSeguro:{
				trueque: {id : trueque.id},
				oferta: _oferta
            }
        });
		
		
        this._concretarTrueque(trueque);
        this.onNovedades();
    },
	
	
    _concretarTrueque: function(trueque){
        var Traders = this;
        
		
		var _oferta = trueque.ofertas[trueque.ofertas.length - 1]
		
		// TO DO: ver de loguear en el producto la historia
		
		_.each(_oferta.doy, function(id_producto){
		    
			var producto = Traders.productos({
				id: id_producto,
				propietario: Traders.usuario.id
			})[0];
			
			producto.propietario = trueque.contraparte;
			
        });
		
		
		_.each(_oferta.recibo, function(id_producto){
		    
			var producto = Traders.productos({
				id: id_producto,
				propietario: trueque.contraparte
			})[0];
			
			producto.propietario = Traders.usuario.id;
			
        });
		
		
		trueque.estado = "cerrado";
		
		vx.send({
			tipoDeMensaje: "traders.productos.inventario",
			de: Traders.usuario.id,
			datoSeguro:{
				productos: Traders.productos({
					propietario: Traders.usuario.id
				})
			}
		});
		
		
    },
	
	actualizarInventario: function(propietario, productos){
		var Traders = this;
		
		var lista_original = Traders.productos({
			propietario: propietario
		});
		
		//var lista_update = _.intersection(mensaje.datoSeguro.productos, lista_original);
		
		var lista_insert = _.difference(productos, lista_original);
		
		var lista_delete = _.difference(lista_original, productos);
		
		console.log('lista_insert', lista_insert);
		console.log('lista_delete', lista_delete);
		
		
		_.each(lista_insert, function(_producto){
			Traders.agregarProducto(_producto, false);
		});
		
		_.each(lista_delete, function(_producto){
			Traders.quitarProducto(_producto, false);
		});
			
	},
	agregarContacto: function(){
		//****	arguments[] ****
		// forma 1: idContacto 	string
		// forma 2: contacto 	object
		//**********************
		
		var Traders = this;
		
		var contacto = {};
		
		
		
        if(typeof(arguments[0]) == 'string'){
			
			
			var contacto = Traders.contactos({id:arguments[0]})[0];
			
			if(!contacto){
			
			
				// es el id
				contacto = {
					id: arguments[0],
					estado: 'SIN_CONFIRMAR',
					nombre: null
				};
				
				Traders._contactos.push(contacto);
			}
			
			vx.send({
				tipoDeMensaje:"traders.claveAgregada",
				de: Traders.usuario.id,
				para: arguments[0],
				datoSeguro: {
					productos: Traders.productos({
						propietario: Traders.usuario.id
					}),
					contacto: {
						id: Traders.usuario.id,
						nombre: Traders.usuario.nombre
					}
				}
				
			},function(mensaje){
				
				var contacto = Traders.contactos({id:mensaje.de})[0];
				
				contacto = ClonadorDeObjetos.extend(contacto, mensaje.datoSeguro.contacto);
				contacto.estado = 'CONFIRMADO';
				
				
				Traders.actualizarInventario(mensaje.de, mensaje.datoSeguro.productos);
				
				
				Traders.onNovedades();
				
				
				
			});
			
		}else if(typeof(arguments[0]) == 'object'){
			
			
			var contacto = Traders.contactos({id:arguments[0].id})[0];
			if(!contacto){
			
				contacto=arguments[0];
				Traders._contactos.push(contacto);
			}
			
		}
		
		
		
		//publico todos los filtros de él
		vx.when({
			tipoDeMensaje: "traders.productos.inventario",
			de: contacto.id
		}, function(mensaje){
			
			Traders.actualizarInventario(mensaje.de, mensaje.datoSeguro.productos);
			
			Traders.onNovedades();
			
        });
		
		
        vx.when({
			tipoDeMensaje:"traders.productos.alta",
			de: contacto.id
		}, function(mensaje){
			
			var _producto = mensaje.datoSeguro.producto;
			
			
			if(_.findWhere(Traders.productos(),{
				id: 			_producto.id,
				propietario: 	_producto.propietario
			})!== undefined) return;
			
			
			Traders.agregarProducto(_producto, false);
			
			Traders.onNovedades();
		});
        
		
        vx.when({
            tipoDeMensaje:"traders.productos.baja",
			de: contacto.id
		}, function(mensaje){
			
			Traders.quitarProducto(mensaje.datoSeguro.producto, false);
			
			Traders.onNovedades();
		});
		
		
		vx.when({
			tipoDeMensaje:"traders.trueque.oferta",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			
			var trueque = Traders.trueques({
				id: mensaje.datoSeguro.trueque.id,
				contacto: {id: mensaje.de}
			})[0];
			
			
			if(!trueque){
				trueque = Traders.nuevoTrueque(mensaje.de)
			}
			
			
			var _oferta = mensaje.datoSeguro.oferta;
			
			_oferta.ofertante = 'contacto';
			_oferta.estado = 'recibida';
			
			
			var aux_doy = _oferta.doy;
			_oferta.doy = _oferta.recibo;
			_oferta.recibo = aux_doy;
			
			
			trueque.ofertas.push(_oferta);
			
			Traders.onNovedades();
		});
		        
		
        vx.when({
            tipoDeMensaje:"traders.trueque.aceptar",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			// TO DO
			
			contacto.trueque.propuestas.contacto.mio = mensaje.datoSeguro.recibo;
			contacto.trueque.propuestas.contacto.suyo = mensaje.datoSeguro.doy;
			
			Traders._concretarTrueque(trueque);
			
			Traders.onNovedades();
		});
		
		
		
		
		
		Traders.onNovedades();
		
		
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
	}
	
	
};