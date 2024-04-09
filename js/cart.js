function init() {
	
	document.addEventListener("DOMContentLoaded", function() {

		// Manejo del evento de almacenamiento
		function handleStorageChange(event) {
			
			// Verifico si ocurrió un cambio en localStorage
			if (event.storageArea === localStorage) {
				
				// Recargo la página
				location.reload();
			}
		}

		// Agrego un event listener para el evento de almacenamiento
		window.addEventListener('storage', handleStorageChange);
		
		let carrito = JSON.parse(localStorage.getItem("carrito"));
		let resultado = 0
		let totalCompra = document.getElementById("totalizador");

		totalCompra.innerText = "Total a pagar💲0";
		
		if(carrito != null ){
		
			// Agrego los botones de Pagar y Vaciar carrito si existen productos en Carrito
			if(carrito.length > 0){
				
				document.getElementById("btnsCart").innerHTML +=
				`
				<button class="btn btn-success" id="payCartBtn">Pagar</button>
				<button class="btn btn-warning" id="emptyCartBtn">Vaciar carrito</button>
				`
				emptyCart();
				payCart();	
			}

			// Llamo a las funciones necesarias para agregar botones de:
			// Añadir/Quitar productos, Pagar, Vaciar
			renderProducts(carrito);
			remButton();
			
			// Renderizo productos del carrito
			function renderProducts(carrito) {
				
				for(const item of carrito) {

					let total = item.precio * item.cantidad;
					
					// Cargo los productos en la tabla
					document.getElementById("carritoTable").innerHTML +=
					`
					<tr>
					<td class="text-start item-index" hidden="hidden">${item.index}</td>
					<td class="text-start item-id" hidden="hidden">${item.id}</td>
					<td class="text-start item-nombre">${item.nombre}</td>
					<td class="text-end item-cantidad">${item.cantidad}</td>
					<td class="text-end">${item.precio}</td>
					<td class="text-end precio-total">${total}</td>
					<td class="text-center"><button class="remBtn btn btn-ligth">🗑️</button></td>
					</tr>
					`
					
					// Precio parcial total
					resultado += total;

				}

				// Inicializo y cargo el valor del total a pagar
				totalCompra.innerHTML = "";
				totalCompra.innerHTML += `Total a pagar💲${resultado}`;

			}

			// Función para quitar producto del carrito
			function remButton() {
				
				const removeButton = document.querySelectorAll('.remBtn');
			
				removeButton.forEach(button => {
					
					button.addEventListener('click', function() {
						
						// Obtengo el elemento padre del botón
						const row = this.closest('tr');
						
						// Obtengo el ID y el precio del producto que se va a eliminar
						const id = row.querySelector('.item-index').innerText;
						const prodId = row.querySelector('.item-id').innerText;
						const nombre = row.querySelector('.item-nombre').innerText;
						const precio = row.querySelector('.precio-total').innerText;
						const cantidad = row.querySelector('.item-cantidad').innerText;

						// Seteo textos en base las cantidades seleccionadas
						if(cantidad == 1) {
							textUnit = "unidad";
						}else{
							textUnit = "unidades";
						}

						// Pregunto al Cliente si está seguro de eliminar el producto del carrito
						Swal.fire({
							title: "Desea eliminar " + nombre + " x" + cantidad + " " + textUnit,
							icon: "question",
							showCancelButton: true,
							confirmButtonColor: "#76DA3E",
							confirmButtonText: "Sí, estoy seguro",
							cancelButtonColor: "#d33",
							cancelButtonText: "Cancelar"
						}).then((result) => {

							// Cliente confirma, procedo con la ejecución
							if(result.isConfirmed) {
			
								// Elimino la fila de la tabla
								row.remove();
								
								// Defino la clave y valor específicos para la coincidencia
								const clave = "index";
								const valor = parseInt(id);

								// Obtengo el array del localStorage
								let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

								// Busco el índice del objeto que coincida con la clave y valor obtenidos
								const indice = carrito.findIndex(objeto => objeto[clave] === valor);

								// Quito el producto según el índice
								carrito.splice(indice, 1);

								// Seteo nuevamente el carrito en localStorage
								localStorage.setItem("carrito", JSON.stringify(carrito));

								// Si el producto a eliminar, es el de la oferta, lo remuevo del localStorage
								// para que se muestre nuevamente el alert de la misma 
								if(prodId == 7) {
									localStorage.removeItem("addOffer");
								}
								
								// Resto a la suma total, el precio del/los producto/s eliminiado/s
								totalCompra.innerHTML = `Total a pagar💲${resultado - precio}`;
								resultado = resultado - precio;

								Toastify({
									text: "🛒 Se quitó del carrito ✖️\n▶️ " + nombre + " x" + cantidad + " " + textUnit,	
									style: {
										background: "linear-gradient(to right, #FF2525, #FE0000)"
									},
									newWindow: true,
									offset: {
										y: 50,
									}
								}).showToast();

								// Elimino los botones de Pagar / Vaciar carrito si no quedan ítems en carrito
								if(carrito.length == 0){

									document.getElementById("btnsCart").innerHTML = "";

									// Seteo el precio total en 0 (cero)
									resultado = 0;
							
									// Actualizo el texto del total a pagar
									totalCompra.innerHTML = `Total a pagar💲${resultado}`;
								}

								// Llamo a la función para comenzar nuevamente
								init();
							
							}

						});
			
					});			

				});
			
			}
			

			// Botón Pagar carrito
			function payCart() {

				const payBtn = document.getElementById("payCartBtn");

				payBtn.addEventListener('click', () => {

					// Si el carrito tiene productos, 
					// le pregunto al Cliente si está seguro de realizar la compra
					Swal.fire({
						title: "Está seguro que desea realizar la compra por un total de $ " + resultado + "?",
						text: "La compra no podrá revertirse.",
						icon: "question",
						showCancelButton: true,
						confirmButtonColor: "#76DA3E",
						confirmButtonText: "Sí, estoy seguro",
						cancelButtonColor: "#d33",
						cancelButtonText: "Cancelar"
					}).then((result) => {

						// Si el Cliente confirma la compra, le muestro la confirmación,
						// reinicializo las variables y vacío localStorage
						if(result.isConfirmed) {
							
							Swal.fire({
								title: "Felicitaciones! 😄",
								text: "Su compra ha sido realizada con éxito",
								icon: "success",
								confirmButtonColor: "#76DA3E"
							});

							carrito = [];

							// Vacío el carrito y producto de oferta del localStorage
							localStorage.removeItem("carrito");
							localStorage.removeItem("addOffer");
							
							// Limpio la tabla
							document.getElementById("carritoTable").innerHTML = "";
							
							// Seteo el precio total en 0 (cero)
							resultado = 0;
							
							// Actualizo el texto del total a pagar
							totalCompra.innerHTML = `Total a pagar💲${resultado}`;
							
							// Elimino los botones de Pagar / Vaciar carrito
							document.getElementById("btnsCart").innerHTML = "";
							
							// Llamo a la función para comenzar nuevamente
							init();

						}

					});
				
				});
			
			}

			// Botón Vaciar carrito
			function emptyCart() {

				const remBtn = document.getElementById("emptyCartBtn");

				remBtn.addEventListener('click', () => {

					// Pregunto al Cliente si está seguro de vaciar el carrito
					Swal.fire({
						title: "Está seguro que desea vaciar el carrito?",
						icon: "question",
						showCancelButton: true,
						confirmButtonColor: "#76DA3E",
						confirmButtonText: "Sí, estoy seguro",
						cancelButtonColor: "#d33",
						cancelButtonText: "Cancelar"
					}).then((result) => {
						
						// Cliente confirma, procedo con la ejecución
						if(result.isConfirmed) {
					
							// Vacío el carrito y producto de oferta del localStorage
							localStorage.removeItem("carrito");
							localStorage.removeItem("addOffer");
							
							// Limpio la tabla
							document.getElementById("carritoTable").innerHTML = "";
							
							// Seteo el precio total en 0 (cero)
							resultado = 0;
							
							// Actualizo el texto del total a pagar
							totalCompra.innerHTML = `Total a pagar💲${resultado}`;
							
							// Elimino los botones de Pagar / Vaciar carrito
							document.getElementById("btnsCart").innerHTML = "";

							Swal.fire({
								icon: "success",
								title: "Se vació el carrito",
							});
							
							// Llamo a la función para comenzar nuevamente
							init();
					
						}
					
					});
				
				});
			
			}

		}
	
	});

}

init();