var Traders = {
    
	_mercaderes:[],
	
	
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
    mercaderes:function(p){
        if(!p) return this._mercaderes;
        if(p.id) return _.findWhere(this._mercaderes, {id:p.id});
        if(p.query){
            if(p.query == "") 
                return this._mercaderes;
            else 
                return _.filter(this._mercaderes, function(mercader){
                    return mercader.nombre.indexOf(p.query)>=0 || mercader.id == p.query;
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
		
		
		
        this._onUsuarioLogueado();
        
		
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
					mercader: {
						nombre: _this.usuario.nombre,
						inventario: _this.usuario.inventario
					}
				}
			});
			//
			
			
			// lo agrego
			_this.agregarMercader(mensaje.datoSeguro.mercader);
			
			
			_this.onNovedades();
			
		});
		
		
		
		/* Vemos */
        setTimeout(function(){
			
			_this.loadDataUsuario();
			
        },1000);
    },
    agregarProductoAPropuesta: function(id_mercader, id_producto, mio_o_suyo){
		var mercader = this.mercaderes({
			id: id_mercader
		});
        
		if(mio_o_suyo == "suyo"){
			mercader.trueque.suyo.push(id_producto);
		}else{
			mercader.trueque.mio.push(id_producto);
		}
		
        mercader.trueque.estado = "borrador";
        this.onNovedades();
    },
    quitarProductoDePropuesta: function(id_mercader, id_producto, mio_o_suyo){
        var mercader = this.mercaderes({id:id_mercader});
        if(mio_o_suyo == "suyo") mercader.trueque.suyo.splice(mercader.trueque.suyo.indexOf(id_producto), 1);
        else mercader.trueque.mio.splice(mercader.trueque.mio.indexOf(id_producto), 1);
        mercader.trueque.estado = "borrador";
        this.onNovedades();
    },
    proponerTruequeA: function(id_mercader){
        var mercader = this.mercaderes({id:id_mercader});
        vx.send({
            tipoDeMensaje:"trocador.propuestaDeTrueque",
            para: id_mercader,
            de: this.usuario.id,
            datoSeguro:{
                pido: mercader.trueque.suyo,
                doy: mercader.trueque.mio
            }
        });
		
		
        mercader.trueque.estado = "enviado";
        this.onNovedades();
    },
    aceptarTruequeDe: function(id_mercader){
        var mercader = this.mercaderes({id:id_mercader});
        if(mercader.trueque.estado != "recibido") return;
        
		vx.send({
            tipoDeMensaje:"trocador.aceptacionDeTrueque",
            para: id_mercader,
            de: this.usuario.id,
            datoSeguro:{
                pido: mercader.trueque.suyo,
                doy: mercader.trueque.mio
            }
        });
		
        this._concretarTruequeCon(mercader);
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
		
		if(dato.mercaderes){
				
			$.each(dato.mercaderes, function(index, item){
				_this.agregarMercader(item);
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
			mercaderes:					this.mercaderes()
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
	
    _quitarProductoDelInventarioDe: function(id_producto, mercader){
		
        mercader.inventario = $.grep(mercader.inventario, function(prod){
            return prod.id != id_producto;
        });
    },    
    _concretarTruequeCon: function(mercader){
        var _this = this;
        
		_.each(mercader.trueque.mio, function(id_producto){
		
            //_this.quitarProducto(id_producto);
			//ver de usar delete
			this.usuario.inventario = $.grep(this.usuario.inventario, function(prod){
				return prod.id != id_producto;
			});
        });
		
        _.each(mercader.trueque.suyo, function(id_producto){
            
			this.usuario.inventario.push(producto);
			
			mercader.inventario = $.grep(mercader.inventario, function(prod){
				return prod.id != id_producto;
			});
			
        });
		
		
        mercader.trueque.mio.length = 0;
        mercader.trueque.suyo.length = 0;   
        mercader.trueque.estado = "cero";
		
		
		
		// informo a la comunidad mi inventario actualizado
		vx.send({
			tipoDeMensaje: "trocador.inventario",
			de: _this.usuario.id,
			datoSeguro:{
				inventario:_this.usuario.inventario
			}
		});
		
    },
	
	
	agregarMercader: function(){
		//arguments[] es un array con los argumentos de la funcion
		
		var _this = this;
		
		var mercader = {};
		
		
		
        if(typeof(arguments[0]) == 'string'){
			
			
			var mercader = _this.mercaderes({id:arguments[0]});
			
			if(!mercader){
			
			
				// es el id
				mercader = {
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
				this._mercaderes.push(mercader);
			}
			
			vx.send({
				tipoDeMensaje:"trocador.claveAgregada",
				de: this.usuario.id,
				para: arguments[0],
				datoSeguro: {
					mercader: {
						id: this.usuario.id,
						nombre: this.usuario.nombre,
						inventario: this.usuario.inventario
					}
				}
				
			},function(mensaje){
				
				var mercader = _this.mercaderes({id:mensaje.de});
				
				mercader = ClonadorDeObjetos.extend(mercader, mensaje.datoSeguro.mercader);
				
				_this.onNovedades();
				
				
				
			});
			
		}else if(typeof(arguments[0]) == 'object'){
			
			
			var mercader = _this.mercaderes({id:arguments[0].id});
			if(!mercader){
			
				mercader=arguments[0];
				this._mercaderes.push(mercader);
			}
			
		}
		
		
		console.log('mercader', mercader);
		
		
		/*
			
		ojo con esta: mensaje de update y hace esto
		
		var mercader = _this.mercaderes({id:mensaje.de});
		mercader = ClonadorDeObjetos.extend(mercader, mensaje.datoSeguro.mercader);
		
		
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
			de: mercader.id
		}, function(mensaje){
			
			mercader.inventario = mensaje.datoSeguro.inventario;
			
			_this.onNovedades();
			
        });
		
		
        vx.when({
			tipoDeMensaje:"trocador.avisoDeNuevoProducto",
			de: mercader.id
		}, function(mensaje){
			
			//_this._agregarProductoAlInventarioDe(mensaje.datoSeguro.producto, mercader);
			
			
			if(_.findWhere(mercader.inventario, {id: mensaje.datoSeguro.producto.id})!== undefined) return;
			
			
			mercader.inventario.push(mensaje.datoSeguro.producto);
			
			_this.onNovedades();
		});
        
		
        vx.when({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
			de: mercader.id
		}, function(mensaje){
			
			_this._quitarProductoDelInventarioDe(mensaje.datoSeguro.id_producto, mercader);
			_this.onNovedades();
		});
		
		
		 vx.when({
			tipoDeMensaje:"trocador.propuestaDeTrueque",
			para: this.usuario.id,
			de: mercader.id
		}, function(mensaje){
			
			mercader.trueque.mio = mensaje.datoSeguro.pido;
			mercader.trueque.suyo = mensaje.datoSeguro.doy;            
			mercader.trueque.estado = "recibido";
			
			_this.onNovedades();
		});
        
		
        vx.when({
            tipoDeMensaje:"trocador.aceptacionDeTrueque",
			para: this.usuario.id,
			de: mercader.id
		}, function(mensaje){
			
			mercader.trueque.mio = mensaje.datoSeguro.pido;
			mercader.trueque.suyo = mensaje.datoSeguro.doy;
			_this._concretarTruequeCon(mercader);
			
			_this.onNovedades();
		});
		
		
		
		
    },
	
	quitarMercader: function(id){
		this._mercaderes = $.grep(this._mercaderes, function(item){
            return item.id != id;
        });
	}
	
	
};