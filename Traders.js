var Traders = {
    
	_mercaderes:[],
	_maxIdDeProductoGenerado: 0,
	usuario: {},
	
	
	_onNovedades:function(){},
    _onUsuarioLogueado:function(){},
	
    onNovedades:function(){
		
		if(arguments.length==1){
		
			this._onNovedades = arguments[0];
			
		}else{
			
			saveDataUsuario();
			
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
			
			
			/*
			_this._mercaderes.push({
				id: mensaje.de,
				nombre: null,
				inventario: [],
				trueque: {
					suyo: [],
					mio: [],
					estado: "cero"
				}
			});
			
			
			var mercader = _this.mercaderes({id: mensaje.de});
			
			
			
			mercader.nombre = mensaje.datoSeguro.nombre;
			mercader.inventario = mensaje.datoSeguro.inventario;
			
			*/
			
			
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
        producto.id = this._maxIdDeProductoGenerado;
        this._maxIdDeProductoGenerado+=1;
        this._agregarProductoAlInventarioDe(producto, this.usuario);
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
        this._quitarProductoDelInventarioDe(id_producto, this.usuario)
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
		
		
		if(dato.maxIdDeProductoGenerado){
			this.maxIdDeProductoGenerado = dato.maxIdDeProductoGenerado;
		}
		
		if(dato.mercaderes){
			console.log('dato.mercaderes', dato.mercaderes);
			this._mercaderes = dato.mercaderes;
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
			mercaderes:					this.mercaderes(),
			maxIdDeProductoGenerado: 	this._maxIdDeProductoGenerado
			
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
	
    _agregarProductoAlInventarioDe: function(producto, mercader){
        if(_.findWhere(mercader.inventario, {id: producto.id})!== undefined) return;
        mercader.inventario.push(producto);
    },
    _quitarProductoDelInventarioDe: function(id_producto, mercader){
        mercader.inventario = $.grep(mercader.inventario, function(prod){
            return prod.id != id_producto;
        });
    },    
    _concretarTruequeCon: function(mercader){
        var _this = this;
        _.each(mercader.trueque.mio, function(id_producto){
            _this.quitarProducto(id_producto);
        });
        _.each(mercader.trueque.suyo, function(id_producto){
            _this.agregarProducto(_.findWhere(mercader.inventario, {id: id_producto}));            
            _this._quitarProductoDelInventarioDe(id_producto, mercader);
        });
        mercader.trueque.mio.length = 0;
        mercader.trueque.suyo.length = 0;   
        mercader.trueque.estado = "cero";
    },
	
	
	agregarMercader: function(){
		//arguments[] es un array con los argumentos de la funcion
		
		var _this = this;
		
		var mercader = {}
		
		
		
        if(typeof(arguments[0]) == 'string'){
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
			
			mercader = arguments[0];
		}
		
		
		
		this._mercaderes.push(mercader);
		
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
			
			_this._agregarProductoAlInventarioDe(mensaje.datoSeguro.producto, mercader);
			
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