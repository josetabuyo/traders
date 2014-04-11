var PantallaInicio = {
    start : function(){   
        var _this = this;
        this.ui = $("#pantalla_inicio");
        this.txtNombreUsuario = this.ui.find("#nombre_usuario");
        this.txtPassword = this.ui.find("#password");
        this.botonIngresar = this.ui.find("#boton_ingresar");
        this.divIndicadorFuerza = this.ui.find("#indicador_fuerza");
        
        this.botonIngresar.click(function(){
            var nombre_usuario = _this.txtNombreUsuario.val();
            var password = _this.txtPassword.val();
            
            Traders.login(nombre_usuario, password);
            
            _this.ui.hide();
			BarraSuperior.render();
			BarraSuperior.ui.find("#solapa_yo").click();
			
        });
		
		this.txtNombreUsuario.keypress(function(e) {
			if(e.which == 13) {
				_this.txtPassword.focus();
			}
		});
		
		this.txtPassword.keyup(function(e) {
            var password = _this.txtPassword.val();
            var tiene_mayusculas = /[A-Z]+/.test(password)?1:0;
            var tiene_minusculas = /[a-z]+/.test(password)?1:0;
            var tiene_numeros = /[0-9]+/.test(password)?1:0;
            var tiene_simbolos = /[\W]+/.test(password)?1:0;
            
            var fortaleza = (tiene_mayusculas + tiene_minusculas + tiene_numeros + tiene_simbolos) * password.length;
            
            var red = (255/18) * (36-fortaleza);
            var green = (255/18) * fortaleza;
            if(red>255) red = 255;
            if(green>255) green = 255;
            red = Math.round(red);
            green = Math.round(green);
            _this.divIndicadorFuerza.css("background-color", "rgb("+red+","+green+",0)")
            
            if(e.which == 13) {
				_this.botonIngresar.click();
			}
		});
		
		
    },
    render: function(){
        this.ui.show();
        this.txtNombreUsuario.focus();
    }
};