var Traders = {
    
	_mercaderes:[],
	_maxIdDeProductoGenerado: 0,
	usuario: {},
	
	
	_onNovedades:function(){},
    _onUsuarioLogueado:function(){},
	
    onNovedades:function(callback){
        this._onNovedades = callback;
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
			_this.setDataUsuario(mensaje.datos);
        });
		
		
		vx.when({
			tipoDeMensaje:"trocador.claveAgregada",
			para: this.usuario.id
		},function(mensaje){
			/*
				TO DO:
				- por ahora acepta autamáticamente, luego ver de poner un avido en la pantalla para que confirme al mejor estilo facebook
				- analizar si con que uno solo agregue la public alcanza para hacer todo el lazo, por ahora va doble, me agregas la public y yo la tuya
			*/
			vx.send({
				idRequest: mensaje.idRequest,
				para: mensaje.de,
				de: _this.usuario.id,
				nombre: _this.usuario.nombre,
				inventario: _this.usuario.inventario
			});
		});
		
		
		/*
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.inventario"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _this.mercaderes({id:mensaje.de});
                mercader.inventario = mensaje.datos.inventario;
                _this._onNovedades();
            }
        }, this.claveRSA); 
		
		vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.avisoDeIngreso"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) 
                    return;
                _this._agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
                vx.enviarMensajeSeguro({
                    tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                    de: _this.usuario.id,
                    para: mensaje.de,                 
                    datoSeguro: {
                        nombre: _this.usuario.nombre,  
                        inventario:_this.usuario.inventario
                    }
                }, _this.claveRSA);
                _this._onNovedades();
            }
        }, this.claveRSA);
        
		
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                para: this.usuario.id
            },
            callback: function(mensaje){
                _this._agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
                _this._onNovedades();
            }
        }, this.claveRSA);
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.avisoDeNuevoProducto"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _this.mercaderes({id:mensaje.de});
                _this._agregarProductoAlInventarioDe(mensaje.datos.producto, mercader);
                _this._onNovedades();
            }
        }, this.claveRSA);  
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.avisoDeBajaDeProducto"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _this.mercaderes({id:mensaje.de});
                _this._quitarProductoDelInventarioDe(mensaje.datos.id_producto, mercader);
                _this._onNovedades();
            }
        }, this.claveRSA);  
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: this.usuario.id
            },
            callback: function(mensaje){
                var mercader = _this.mercaderes({id:mensaje.de});
                mercader.trueque.mio = mensaje.datos.pido;
                mercader.trueque.suyo = mensaje.datos.doy;            
                mercader.trueque.estado = "recibido";                
                _this._onNovedades();
            }
        }, this.claveRSA);  
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: this.usuario.id
            },
            callback: function(mensaje){
                var mercader = _this.mercaderes({id:mensaje.de});
                mercader.trueque.mio = mensaje.datos.pido;
                mercader.trueque.suyo = mensaje.datos.doy;      
                _this._concretarTruequeCon(mercader);
                _this._onNovedades();
            }
        }, this.claveRSA);
        */
		
		
		/* Vemos */
        setTimeout(function(){
            /*
			vx.enviarMensajeSeguro({
                tipoDeMensaje: "trocador.avisoDeIngreso",
                de: _this.usuario.id,
                datoSeguro:{
                    nombre: _this.usuario.nombre,
                    inventario:_this.usuario.inventario
                }
            }, _this.claveRSA);
			*/
			
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
        this._onNovedades();
    },
    quitarProductoDePropuesta: function(id_mercader, id_producto, mio_o_suyo){
        var mercader = this.mercaderes({id:id_mercader});
        if(mio_o_suyo == "suyo") mercader.trueque.suyo.splice(mercader.trueque.suyo.indexOf(id_producto), 1);
        else mercader.trueque.mio.splice(mercader.trueque.mio.indexOf(id_producto), 1);
        mercader.trueque.estado = "borrador";
        this._onNovedades();
    },
    proponerTruequeA: function(id_mercader){
        var mercader = this.mercaderes({id:id_mercader});
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.propuestaDeTrueque",
            para: id_mercader,
            de: this.usuario.id,
            datoSeguro:{
                pido: mercader.trueque.suyo,
                doy: mercader.trueque.mio
            }
        }, this.claveRSA);
        mercader.trueque.estado = "enviado";
        this._onNovedades();
    },
    aceptarTruequeDe: function(id_mercader){
        var mercader = this.mercaderes({id:id_mercader});
        if(mercader.trueque.estado != "recibido") return;
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.aceptacionDeTrueque",
            para: id_mercader,
            de: this.usuario.id,
            datoSeguro:{
                pido: mercader.trueque.suyo,
                doy: mercader.trueque.mio
            }
        }, this.claveRSA);
        this._concretarTruequeCon(mercader);
        this._onNovedades();
    },
    agregarProducto: function(p){
        var producto = _.clone(p);
        producto.id = this._maxIdDeProductoGenerado;
        this._maxIdDeProductoGenerado+=1;
        this._agregarProductoAlInventarioDe(producto, this.usuario);
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.avisoDeNuevoProducto",
            de: this.usuario.id,
            datoSeguro: {
                producto: producto
            }
        }, this.claveRSA);
        this._onNovedades();
    },
    quitarProducto: function(id_producto){
        this._quitarProductoDelInventarioDe(id_producto, this.usuario)
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
            de: this.usuario.id,
            datoSeguro:{
                id_producto: id_producto
            }
        }, this.claveRSA);
        this._onNovedades();
    },
	setDataUsuario: function(datos){
		var _this = this;
		
		this.usuario = ClonadorDeObjetos.extend(this.usuario, datos.usuario);
		
		this.maxIdDeProductoGenerado = datos.maxIdDeProductoGenerado;
		
		
		this.saveDataUsuario();
		
		vx.enviarMensajeSeguro({
			tipoDeMensaje: "trocador.inventario",
			de: _this.usuario.id,
			datoSeguro:{
				inventario:_this.usuario.inventario
			}
		}, this.claveRSA);
		
		this._onNovedades();
	},
	
	
    saveDataUsuario: function(){
		
		var _datos = {
			usuario: 					this.usuario,
			maxIdDeProductoGenerado: 	this._maxIdDeProductoGenerado
		};
		
		if(typeof(Storage)!=="undefined"){
			//no se si usar la clave privada ahi o algo más seguro que solo yo tenga
			
			localStorage.setItem(this.usuario.id, JSON.stringify(_datos));
			
		}else{
			
			vx.send({
				tipoDeMensaje:"vortex.persistencia.guardarDatos",
				de: this.usuario.id,
                para: this.usuario.id,
				datos: _datos
			});
		
		}
		
		
    },
	
    loadDataUsuario: function(){
        
		var _this = this;
		
		var _datos = {};
		
		if(typeof(Storage)!=="undefined"){
			//no se si usar la clave privada ahi o algo más seguro que solo yo tenga
			var sDatos = localStorage.getItem(this.usuario.id);
			
			vx.enviarMensaje({
				tipoDeMensaje:"vortex.persistencia.datos",
				de: this.usuario.id,
				para: this.usuario.id,
				datos: JSON.parse(sDatos)
			});
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
	
	
	_agregarMercader: function(idMercader, _alias){
        
		var _this = this;
		
		this._mercaderes.push({
            id: idMercader,
            alias: _alias, // <-- opcional
			nombre: null,
            inventario: [],
            trueque: {
                suyo: [],
                mio: [],
                estado: "cero"
            }
        });
		
		
		vx.when({
			tipoDeMensaje:"trocador.inventario",
			de: idMercader
		}, function(mensaje){
			
			var mercader = _this.mercaderes({id:mensaje.de});
			mercader.inventario = mensaje.datos.inventario;
			
			_this._onNovedades();
			
        });
		
		
        vx.when({
			tipoDeMensaje:"trocador.avisoDeNuevoProducto",
			de: idMercader
			
		}, function(mensaje){
			
			var mercader = _this.mercaderes({id:mensaje.de});
				
			_this._agregarProductoAlInventarioDe(mensaje.datos.producto, mercader);
			
			_this._onNovedades();
			
		});
        
		
        vx.when({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
			de: idMercader
		}, function(mensaje){
			
			var mercader = _this.mercaderes({id:mensaje.de});
			_this._quitarProductoDelInventarioDe(mensaje.datos.id_producto, mercader);
			_this._onNovedades();
		});
		
		
		 vx.when({
			tipoDeMensaje:"trocador.propuestaDeTrueque",
			para: this.usuario.id,
			de: idMercader
		}, function(mensaje){
			var mercader = _this.mercaderes({id:mensaje.de});
			
			mercader.trueque.mio = mensaje.datos.pido;
			mercader.trueque.suyo = mensaje.datos.doy;            
			mercader.trueque.estado = "recibido";                
			_this._onNovedades();
		});
        
        vx.when({
            tipoDeMensaje:"trocador.aceptacionDeTrueque",
			para: this.usuario.id,
			de: idMercader
		}, function(mensaje){
			var mercader = _this.mercaderes({id:mensaje.de});
			mercader.trueque.mio = mensaje.datos.pido;
			mercader.trueque.suyo = mensaje.datos.doy;      
			_this._concretarTruequeCon(mercader);
			_this._onNovedades();
		});
		
		
		vx.send({
			tipoDeMensaje:"trocador.claveAgregada",
			de: this.usuario.id,
			para: idMercader
		},function(mensaje){
			
			console.log('respuesta a trocador.claveAgregada', mensaje);
			
			var mercader = _this.mercaderes({id:mensaje.de});
			
			mercader.nombre = mensaje.nombre;
			mercader.inventario = mensaje.inventario;
			if(!mercader.alias){
				mercader.alias = mercader.nombre;
			}
			
			_this._onNovedades();
			
		});
		
		
		
		/*
		vx.when({
			tipoDeMensaje:"trocador.avisoDeIngreso",
			de: idMercader
		}, function(mensaje){
			
			_this._agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
			
			vx.enviarMensajeSeguro({
				tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
				de: _this.usuario.id,
				para: mensaje.de,                 
				datoSeguro: {
					nombre: _this.usuario.nombre,  
					inventario:_this.usuario.inventario
				}
			}, _this.claveRSA);
			_this._onNovedades();
		});
		
		
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                para: this.usuario.id
            },
            callback: function(mensaje){
                _this._agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
                _this._onNovedades();
            }
        }, this.claveRSA);
        */
		
		
        
       
        
		
		
    }
	
	/*
    _agregarMercader: function(id, nombre, inventario){
        var mercader = this.mercaderes({id:id});
        if( mercader !== undefined) {
            mercader.inventario = inventario;
            return;
        }
        this._mercaderes.push({
            id:id,
            nombre: nombre,
            inventario:inventario||[],
            trueque: {
                suyo: [],
                mio: [],
                estado: "cero"
            }
        });
    }
	*/
	
	
};