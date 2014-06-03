var RepositorioGeneral: {
    start: function(id_usuario){
        var _this = this;
		this.id_usuario = id_usuario;
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
}