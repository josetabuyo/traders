var PantallaUsuario = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_usuario");
        
        this.lbl_nombre_usuario = this.ui.find("#lbl_nombre_usuario");
        this.panel_inventario = this.ui.find("#panel_inventario");
        this.panel_me_deben = this.ui.find("#panel_me_deben");
        this.panel_debo = this.ui.find("#panel_debo");
		this.img_avatar_usuario = this.ui.find(".avatar_usuario");
		
        this.btn_add_producto = this.ui.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.ui.find("#txt_nombre_producto_add");
        this.btnSave = this.ui.find("#btn_save");
        this.btnLoad = this.ui.find("#btn_load");
        
        this.btn_add_producto.click(function(){
            Traders.agregarProducto({
                nombre:_this.txt_nombre_producto_add.val()
            });
            _this.txt_nombre_producto_add.val("");
        }); 
		this.txt_nombre_producto_add.keypress(function(e) {
			if(e.which == 13) {
				_this.btn_add_producto.click();
			}
		});    
        this.btnSave.click(function(){  
            Traders.saveDataUsuario();
        });
		
        this.btnLoad.click(function(){            
            Traders.loadDataUsuario();
        });
        
		
		
		this.btn_compartir_id = this.ui.find("#btn_compartir_id");
		
		this.btn_compartir_id.click(function(){
			
			
			alertify.prompt("Compartí tu Id", function (e, str) {
				if (e) {
					clipboardCopy(Traders.usuario.id);
				} else {
					
				}
			}, Traders.usuario.id);
		});
		
        this.btn_sacar_foto = this.ui.find("#btn_sacar_foto");
		this.btn_sacar_foto.click(function(){		
            var video = $('<video id="video" width="320px" height="240px" autoplay></video>')[0];
            var canvas = $('<canvas>')[0];
            var width = 320;
            var height = 240;
            var streaming = false;
            
            _this.ui.append($(canvas));  
            _this.ui.append($(video));
            var ctx = canvas.getContext('2d');
            
            var errBack = function(error) {
                    console.log("Video capture error: ", error.code); 
                };
            
            navigator.getMedia = ( navigator.getUserMedia || 
                                    navigator.webkitGetUserMedia ||
                                    navigator.mozGetUserMedia ||
                                    navigator.msGetUserMedia);

            navigator.getMedia(
                { 
                    video: true, 
                    audio: false 
                },
                function(stream) {
                    if (navigator.mozGetUserMedia) { 
                        video.mozSrcObject = stream;
                    } else {
                        var vendorURL = window.URL || window.webkitURL;
                        video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
                    }
                    video.play();
                    
                    
                },
                function(err) {
                    console.log("An error occured! " + err);
                }
            );
            
            video.addEventListener('canplay', function(ev){
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth/width);
                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }   
            }, false);
            var btn_sacar_foto2 = this.ui.find("#btn_sacar_foto2");
            btn_sacar_foto2.click(function(){
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(video, 0, 0, width, height);
                var imagen_serializada = canvas.toDataURL('image/jpeg');
                console.log(imagen_serializada);   
                _this.img_avatar_usuario.attr("src", imagen_serializada);
            });
        });
        
		Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });
		
		
        this.txt_nombre_producto_add.focus();
    },
    render: function(){
        this.lbl_nombre_usuario.text(Traders.usuario.nombre);
        this.panel_inventario.empty();
        this.panel_me_deben.empty();
        this.panel_debo.empty();
        var _this = this;
		
		///// panel_inventario
		_.each(Traders.usuario.inventario, function(producto){
			var vista = new VistaDeUnProductoEnInventario({
				producto: producto, 
				alEliminar: function(){
					Traders.quitarProducto(producto.id);
				}
			});
			vista.dibujarEn(_this.panel_inventario);
		});
		
		///// panel_me_deben
		if(Traders.usuario.me_deben.length > 0){
			_this.panel_me_deben.closest('.seccion_container').closest('li').show();
			
			_.each(Traders.usuario.me_deben, function(producto){
				var vista = new VistaDeUnProductoEnInventario({
					producto: producto
				});
				vista.dibujarEn(_this.panel_me_deben);
			});
		}else{
			_this.panel_me_deben.closest('.seccion_container').closest('li').hide();
		}
			
		///// panel_debo
		if(Traders.usuario.debo.length > 0){
			_this.panel_debo.closest('.seccion_container').closest('li').show();
			_.each(Traders.usuario.debo, function(producto){
				var vista = new VistaDeUnProductoEnInventario({
					producto: producto,
					alEliminar: function(){
						Traders.quitarProducto(producto.id);
					}
				});
				vista.dibujarEn(_this.panel_debo);
			});
		}else{
			_this.panel_debo.closest('.seccion_container').closest('li').hide();
		}
		
		
		
       
        this.ui.show();      
    }
};