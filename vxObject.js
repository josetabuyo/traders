var vxObject = Vxo = vxo =  function(identificador, idOwner, idUsuario){    
    var _this = this;
    this._identificador = identificador;
    this._objeto = {};
    this._id_owner = idOwner;
    this._id_usuario = idUsuario;
    
    if(this.elObjetoEsMio()){ //el objeto es mio
        this._filtro_mensajes_get_valor = {};    
        this._filtro_mensajes_get_valor = ClonadorDeObjetos.extend(this._filtro_mensajes_get_valor, identificador); 
        this._filtro_mensajes_get_valor.tipoDeMensaje = "vortex.persistencia.get";
        this._filtro_mensajes_get_valor.para = this._id_usuario;
        vx.when(this._filtro_mensajes_get_valor, function(mensaje){
            var mensaje = {};
            mensaje = ClonadorDeObjetos.extend(mensaje, this._identificador);
            mensaje.tipoDeMensaje = "vortex.persistencia.respuestaAlGet";
            mensaje.de = this._id_usuario;
            mensaje.para = mensaje.de;
            mensaje.idRequest = mensaje.idRequest;
            mensaje.datoSeguro = _this._objeto;
            vx.send(mensaje);
        });
        
        this._filtro_mensajes_set_valor = {};    
        this._filtro_mensajes_set_valor = ClonadorDeObjetos.extend(this._filtro_mensajes_get_valor, identificador); 
        this._filtro_mensajes_set_valor.tipoDeMensaje = "vortex.persistencia.set";
        this._filtro_mensajes_set_valor.de = this._owner;
        vx.when(this._filtro_mensajes_set_valor, function(mensaje){
            _this.val(mensaje.datoSeguro.cambios);
        });
    } else{
        this._filtro_mensajes_obj_actualizado = {};
        this._filtro_mensajes_obj_actualizado = ClonadorDeObjetos.extend(this._filtro_mensajes_obj_actualizado, identificador); 
        this._filtro_mensajes_obj_actualizado.tipoDeMensaje = "vortex.persistencia.objetoActualizado";                        
        this._filtro_mensajes_obj_actualizado.de = this._id_owner;
        vx.when(this._filtro_mensajes_obj_actualizado, function(mensaje){
            _this._objeto = ClonadorDeObjetos.extend(_this._objeto, mensaje.datoSeguro.cambios);
        });
        
        var mensaje = {};
        mensaje = ClonadorDeObjetos.extend(mensaje, this._identificador);
        mensaje.tipoDeMensaje = "vortex.persistencia.get";
        mensaje.de = this._id_usuario;
        mensaje.para = this._id_owner;
        vx.send(mensaje, function(){
            _this._objeto = mensaje.datoSeguro;
        });        
    }
};
    
vxObject.prototype.val = function(){
    if(arguments.length == 0) return this.getVal();
    if(arguments.length == 1) this.setVal(arguments[0]);
};  

vxObject.prototype.getVal = function(){
    return this._objeto;
};

vxObject.prototype.setVal = function(val){    
    if(this.elObjetoEsMio()){
        this._objeto = ClonadorDeObjetos.extend(this._objeto, val);
        var mensaje = {};
        mensaje = ClonadorDeObjetos.extend(mensaje, this._identificador);
        mensaje.tipoDeMensaje = "vortex.persistencia.objetoActualizado";
        mensaje.datoSeguro = {
            cambios: val
        };
        mensaje.de = this._id_usuario;
        vx.send(mensaje);
    }
};

vxObject.prototype.elObjetoEsMio = function(){
    return this._id_owner == this._id_usuario;
};



/*

    {
    start: function(id_usuario){
        var datos_guardados = localStorage.getItem(this.id_usuario);
        if(datos_guardados)	{
            this._items = JSON.parse(datos_guardados);
        }
        vx.when({
            de:this.id_usuario, 
            para:this.id_usuario,
            tipo_de_mensaje: vortex.persistencia.saveObjeto
        }, function(mensaje){
            var objeto = mensaje.datoSeguro;            
            if(!objeto.id) {
                objeto.id = _this._next_item_id();		          
                _this._objetos.push(objeto);                
            } 
        });
        vx.when({
            de:this.id_usuario, 
            para:this.id_usuario,
            tipo_de_mensaje: vortex.persistencia.getObjetos
        }, function(mensaje){
            var criterios = mensaje.datoSeguro;
            vx.send({
                de:_this.id_usuario, 
                para:_this.id_usuario,
                idRequest:mensaje.idRequest,
                datoSeguro: _this.find(criterios)
            })
        });
	},
	_objetos:[],
	_next_item_id: function(){
		var maxValue = -1;		
		_.each(this._items, function(item) {
			if (item.id > maxValue) {
				maxValue = item.id;
			}
		});
		maxValue++;
		return maxValue;
	},
	add: function(item){
		item.id = this._next_item_id();
		this._items.push(item);
		localStorage.setItem(this.id_usuario, JSON.stringify(this._items));
		return item;
	},
	remove: function(id){
		this._items = $.grep(this._items, function(item){
            return item.id != id;
        });
	},
	find: function(query){
		if(!query) return this._items;     
		return _.findWhere(this._items, query);
	}
}*/