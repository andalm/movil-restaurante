(function($)
{
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.phonegapNavigationEnabled = true;
	var activePage = undefined,
		PEDIDO_ERROR = 0,
		PEDIDO_SUCESS = 1;
	
	$(function()
	{
		loadIndex(false);
		
		//Accion del formulario de inicio de sesion
		$('form#LoginForm').submit(function(event)
		{
			event.preventDefault();
			
			loadIndex(true);		
		});
		
		//Accion del boton salir de la sesion
		$(document).on('click', 'a#logOut', function(event)
		{
			event.preventDefault();
			$('form#LoginForm')[0].reset();
			logOut();		
		});
				
		//Accion de los botones de cambio de pagina
		$(document).on('click', 'a[data-role=button]', function(event)
		{
			event.preventDefault();
			
			var anchor = $(this);
			activePage = $.mobile.activePage[0].id;
			
			$.mobile.changePage(anchor.attr("href"), 
			{
				changeHash: false,
				transition : 'plop'
			});
		});
		
		//Accion boton atrás 
		$(document).on('click', 'a[data-rel=back]', function(event)
		{
			event.preventDefault();
			
			$.mobile.changePage($('div#' + activePage), 
			{
				changeHash: false,
				transition : 'plop'
			});
		});
		
		//Accion de los botones de tipos de producto
		$(document).on('click', 'a[id^=nav]', function()
		{
			var $this = $(this),
				$products = $('div[id^=items]'),
				actualNav =  $this.attr('id').split('-');
				
			$products.hide();
			$products.parent().find('div[id=items-'+actualNav[1]+']').show();
		});
		
		//Accion del fomrulario de pedido
		$(document).on('submit', 'form#pedido-form', function (event) 
		{
			event.preventDefault();
			
			if(confirm("Está seguro que desea guardar el pedido?"))
			{
				var $form = $( this );
				
				$.ajax({
					url : $form.attr('action'),
					type: "post",
					dataType : 'json',
					//timeout: 1500,
					beforeSend: function() { $.mobile.loading('show'); },
					complete: function() { $.mobile.loading('hide'); },
					data : $form.serialize(),
					success : function(data) 
					{
						if(data.cod == PEDIDO_ERROR)
							alert(data.msg);
						else
						{
							alert(data.msg);
							$.mobile.changePage("http://restaurante.esspia.com/index.php?r=Mesero/pedido/list", 
							{
								changeHash: false,
								transition : 'plop'
							});
						}
					},
					error : function(jqXHR, textStatus, errorThrown) 
					{
						if(jqXHR.status == 0)
							alert("Error de conexión");
					}
				});
			}
		});
		
		//Eliminar items del pedido
		$(document).on('click', 'input#Elimnar', function (event) 
		{
			event.preventDefault();
			
			var $this = $(this),
				server = $this.attr('server');
			
			$this.parent().parent().remove();			
		});
		
		//Agregar items al pedido
		$(document).on('click', 'input#agregar', function (event) 
		{
			var $contentItems = $('div[id^=items]');
			
			$contentItems.each(function(i, e)
			{
				var $contentItem = $(e);
				
				if($contentItem.css( "display" ) == 'block')
				{
					var actual =  $contentItem.attr('id').split('-'),
						$cuentaItems = $contentItem.find('input#cuentaItems'),
						count = parseInt($cuentaItems.val()) + 1,
						$item = $contentItem.find('div.ui-field-contain').eq(0).clone(),
						$select = $item.find('select'),
						selectOptions = $select[0].options;
						
					$cuentaItems.val(count);
					
					$item
						.html("")
						.append('<span>Item #'+(count + 1)+'</span>');					
					
					$item.append(
						$('<select></select>', {
							'name' : 'PedidoDetalle['+actual[1]+'][idProducto]['+count+']',
							'id' : 'PedidoDetalle_'+actual[1]	+'_idProducto_'+count,
						})
						.append(selectOptions)
					)
					.find('select')
					.val('')
					.selectmenu();
					
					$item.append(
						$('<input></input>', {
							'name' : 'PedidoDetalle['+actual[1]+'][cantidad]['+count+']',
							'type' : 'number',
							'placeholder' : 'Cantidad',
						})					
					)
					.find('input')
					.val("")
					.textinput();
					
					$item.append(
						$('<textarea></textarea>', {
							'name' : 'PedidoDetalle['+actual[1]+'][observaciones]['+count+']',
							'placeholder' : 'Observaciones',
						})					
					)
					.find('textarea')
					.val("")
					.textinput();
					
					$item.append(
						'<p><input type="button" data-inline="true" value="Eliminar Item #'+(count + 1)+'" class="ui-btn ui-corner-all ui-shadow" id="Elimnar"></p>'
					);
					
					$contentItem.append($item);
					
					return false;
				}
			});
		});
	});
	
	//Cargar pagina de inicio
	function loadIndex(flag)
	{
		$.ajax({
			url : "http://restaurante.esspia.com/index.php?r=site/login",
			type: "post",
			dataType : 'html',
			//timeout: 1500,
			data : $( "form#LoginForm" ).serialize(),
			beforeSend: function() { $.mobile.loading('show'); },
			complete: function() { $.mobile.loading('hide'); },
			success : function(data) 
			{
				var $page = $('div#welcome');
				
				if($page.length < 1)
					$('body').append(data);
				
				$.mobile.changePage($('div#welcome'), 
				{
					changeHash: false,
					transition : 'plop'
				});
			},
			error : function(jqXHR, textStatus, errorThrown) 
			{
				if(jqXHR.status == 0)
					alert("Error de conexión");
				else if(flag)
					$('p#loginError').show();
			}
		});
	}
	
	//Cerrar sesion
	function logOut()
	{
		$.ajax({
			url : "http://restaurante.esspia.com/index.php?r=site/logout",
			type: "post",
			dataType : 'text',
			data : '',
			//timeout: 1500,
			beforeSend: function() { $.mobile.loading('show'); },
			complete: function() { $.mobile.loading('hide'); },
			success : function(data) 
			{
				$( "form#LoginForm" )[0].reset();
				$('p#loginError').hide();
				
				$.mobile.changePage($('div#init'), 
				{
					changeHash: false,
					transition : 'plop'
				});
			},
			error : function(jqXHR, textStatus, errorThrown) 
			{
				alert("Error de conexión");
			}
		});		
	}
	
})(jQuery);