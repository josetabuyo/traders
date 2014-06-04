var RepositorioDeConexiones = {
	start: function(id_usuario){
		this.id_usuario = id_usuario;
		var datos_guardados = localStorage.getItem(this.id_usuario + "_conexiones");
		if(datos_guardados)	{
			this._items = JSON.parse(datos_guardados);
			this._on_load(this._items);
		}
		else this.add({url:"https://router-vortex.herokuapp.com",
					   activa:true});
		vx.conectarPorWebSockets({
			url:this.conexionActiva().url
		}); 
	},
	_on_load:function(){},
	onLoad: function(callback){
		this._on_load = callback;
	},
	_items:[],
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
		localStorage.setItem(this.id_usuario + "_conexiones", JSON.stringify(this._items));
		this._on_add_item(item);
		return item;
	},
	_on_add_item:function(){},
	onAdd: function(callback){
		this._on_add_item = callback;
	},
	remove: function(id){
		this._items = $.grep(this._items, function(item){
            return item.id != id;
        });
		localStorage.setItem(this.id_usuario + "_conexiones", JSON.stringify(this._items));
		this._on_remove_item(id);
	},
	_on_remove_item:function(){},
	onRemove: function(callback){
		this._on_remove_item = callback;
	},
	find: function(query){
		if(!query) return this._items;     
		return _.findWhere(this._items, query);
	},
	conexionActiva: function(){
		return this.find({activa:true});
	},
	activarConexion: function(id_conexion){
		var conexion_activa;
		_.each(this._items, function(conexion){
			if(conexion.id==id_conexion) {
				conexion.activa = true;
				conexion_activa = conexion
			} else {
				conexion.activa = false;
			}
		})
		vx.conectarPorWebSockets({
			url:conexion_activa.url
		}); 
		localStorage.setItem(this.id_usuario + "_conexiones", JSON.stringify(this._items));
		this._on_conexion_activada(conexion_activa);
	},
	_on_conexion_activada:function(){},
	onConexionActivada: function(callback){
		this._on_conexion_activada = callback;
	}
}