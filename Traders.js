var Traders = {
    
	_contactos:[],
	
	
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
	
	
	_onNovedades:function(){},
    _onUsuarioLogueado:function(){},
	
    onNovedades:function(){
		
		if(arguments.length==1){
		
			this._onNovedades = arguments[0];
			
		}else{
			
			this.saveDataUsuario();
			
			this._onNovedades();
		}
		
    },
    onUsuarioLogueado:function(callback){
        this._onUsuarioLogueado = callback;
    },  
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
			debo: []
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
			tipoDeMensaje:"trocador.claveAgregada",
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
						inventario: _this.usuario.inventario
					}
				}
			});
			//
			
			
			// lo agrego
			_this.agregarContacto(mensaje.datoSeguro.contacto);
			
			
			_this.onNovedades();
			
		});
		
		
		
		/* Vemos */
        setTimeout(function(){
			
			_this.loadDataUsuario();
			
        },20);
		
		
		
        this._onUsuarioLogueado();
		
    },
    agregarProductoAPropuesta: function(id_contacto, id_producto, mio_o_suyo){
		var contacto = this.contactos({
			id: id_contacto
		});
        
		if(mio_o_suyo == "suyo"){
			contacto.trueque.suyo.push(id_producto);
		}else{
			contacto.trueque.mio.push(id_producto);
		}
		
        contacto.trueque.estado = "borrador";
        this.onNovedades();
    },
    quitarProductoDePropuesta: function(id_contacto, id_producto, mio_o_suyo){
        var contacto = this.contactos({id:id_contacto});
        if(mio_o_suyo == "suyo") contacto.trueque.suyo.splice(contacto.trueque.suyo.indexOf(id_producto), 1);
        else contacto.trueque.mio.splice(contacto.trueque.mio.indexOf(id_producto), 1);
        contacto.trueque.estado = "borrador";
        this.onNovedades();
    },
    proponerTruequeA: function(id_contacto){
        var contacto = this.contactos({id:id_contacto});
        vx.send({
            tipoDeMensaje:"trocador.propuestaDeTrueque",
            para: id_contacto,
            de: this.usuario.id,
            datoSeguro:{
                pido: contacto.trueque.suyo,
                doy: contacto.trueque.mio
            }
        });
		
		
        contacto.trueque.estado = "enviado";
        this.onNovedades();
    },
    aceptarTruequeDe: function(id_contacto){
        var contacto = this.contactos({id:id_contacto});
        if(contacto.trueque.estado != "recibido") return;
        
		vx.send({
            tipoDeMensaje:"trocador.aceptacionDeTrueque",
            para: id_contacto,
            de: this.usuario.id,
            datoSeguro:{
                pido: contacto.trueque.suyo,
                doy: contacto.trueque.mio
            }
        });
		
        this._concretarTruequeCon(contacto);
        this.onNovedades();
    },
    agregarProducto: function(p){
		var producto = _.clone(p);
        
		producto.id = this.nextProductoId();
		
		this.usuario.inventario.push(producto);
		
		
        vx.send({
            tipoDeMensaje:"trocador.avisoDeNuevoProducto",
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
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
            de: this.usuario.id,
            datoSeguro:{
                id_producto: id_producto
            }
        });
        this.onNovedades();
    },
	setDataUsuario: function(dato){
		var _this = this;
		
		this.usuario = ClonadorDeObjetos.extend(this.usuario, dato.usuario);
		
		if(dato.contactos){
				
			$.each(dato.contactos, function(index, item){
				_this.agregarContacto(item);
			});
		}
		
		
		vx.send({
			tipoDeMensaje: "trocador.inventario",
			de: _this.usuario.id,
			datoSeguro:{
				inventario:_this.usuario.inventario
			}
		});
		
		
		this.onNovedades();
	},
	
	
    saveDataUsuario: function(){
		
		var _dato = {
			usuario: 					this.usuario,
			contactos:					this.contactos()
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
        
		var _this = this;
		
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
	
    _quitarProductoDelInventarioDe: function(id_producto, contacto){
		
        contacto.inventario = $.grep(contacto.inventario, function(prod){
            return prod.id != id_producto;
        });
    },    
    _concretarTruequeCon: function(contacto){
        var _this = this;
        
		_.each(contacto.trueque.mio, function(id_producto){
		
            //_this.quitarProducto(id_producto);
			//ver de usar delete
			this.usuario.inventario = $.grep(this.usuario.inventario, function(prod){
				return prod.id != id_producto;
			});
        });
		
        _.each(contacto.trueque.suyo, function(id_producto){
            
			this.usuario.inventario.push(producto);
			
			contacto.inventario = $.grep(contacto.inventario, function(prod){
				return prod.id != id_producto;
			});
			
        });
		
		
        contacto.trueque.mio.length = 0;
        contacto.trueque.suyo.length = 0;   
        contacto.trueque.estado = "cero";
		
		
		
		// informo a la comunidad mi inventario actualizado
		vx.send({
			tipoDeMensaje: "trocador.inventario",
			de: _this.usuario.id,
			datoSeguro:{
				inventario:_this.usuario.inventario
			}
		});
		
    },
	
	
	agregarContacto: function(){
		//arguments[] es un array con los argumentos de la funcion
		
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
					trueque: {
						suyo: [],
						mio: [],
						estado: "cero"
					}
				};
				this._contactos.push(contacto);
			}
			
			vx.send({
				tipoDeMensaje:"trocador.claveAgregada",
				de: this.usuario.id,
				para: arguments[0],
				datoSeguro: {
					contacto: {
						id: this.usuario.id,
						nombre: this.usuario.nombre,
						inventario: this.usuario.inventario
					}
				}
				
			},function(mensaje){
				
				var contacto = _this.contactos({id:mensaje.de});
				
				contacto = ClonadorDeObjetos.extend(contacto, mensaje.datoSeguro.contacto);
				
				_this.onNovedades();
				
				
				
			});
			
		}else if(typeof(arguments[0]) == 'object'){
			
			
			var contacto = _this.contactos({id:arguments[0].id});
			if(!contacto){
			
				contacto=arguments[0];
				this._contactos.push(contacto);
			}
			
		}
		
		
		console.log('contacto', contacto);
		
		
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
		
		//publico todos los filtros de él
		vx.when({
			tipoDeMensaje:"trocador.inventario",
			de: contacto.id
		}, function(mensaje){
			
			contacto.inventario = mensaje.datoSeguro.inventario;
			
			_this.onNovedades();
			
        });
		
		
        vx.when({
			tipoDeMensaje:"trocador.avisoDeNuevoProducto",
			de: contacto.id
		}, function(mensaje){
			
			//_this._agregarProductoAlInventarioDe(mensaje.datoSeguro.producto, contacto);
			
			
			if(_.findWhere(contacto.inventario, {id: mensaje.datoSeguro.producto.id})!== undefined) return;
			
			
			contacto.inventario.push(mensaje.datoSeguro.producto);
			
			_this.onNovedades();
		});
        
		
        vx.when({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
			de: contacto.id
		}, function(mensaje){
			
			_this._quitarProductoDelInventarioDe(mensaje.datoSeguro.id_producto, contacto);
			_this.onNovedades();
		});
		
		
		 vx.when({
			tipoDeMensaje:"trocador.propuestaDeTrueque",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			contacto.trueque.mio = mensaje.datoSeguro.pido;
			contacto.trueque.suyo = mensaje.datoSeguro.doy;            
			contacto.trueque.estado = "recibido";
			
			_this.onNovedades();
		});
        
		
        vx.when({
            tipoDeMensaje:"trocador.aceptacionDeTrueque",
			para: this.usuario.id,
			de: contacto.id
		}, function(mensaje){
			
			contacto.trueque.mio = mensaje.datoSeguro.pido;
			contacto.trueque.suyo = mensaje.datoSeguro.doy;
			_this._concretarTruequeCon(contacto);
			
			_this.onNovedades();
		});
		
		
		_this.onNovedades();
		
    },
	
	quitarContacto: function(id){
		this._contactos = $.grep(this._contactos, function(item){
            return item.id != id;
        });
	}
	
	
};