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

    // Declaro variales
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let addOffer = JSON.parse(localStorage.getItem("addOffer")) || [];
    let data = "";
    let cantIndex = 0;

    // Contabilizo los índices para poder borrar productos en caso de ser necesario
    for(const indice of carrito) {
        cantIndex = indice.index;
    }

    // Productos generales
    let getProducts = async() => {
        
        const response = await fetch("./assets/json/products.json");
        data = await response.json();
        
        // Llamo a las funciones para renderizar productos y añadir botones de Agregar/Quitar
        renderProducts(data);
        ItemButtons();

    };

    // Obtengo los productos generales desde la BD JSON
    getProducts();

    // Producto en oferta
    let getProductsOffer = async() => {

        const productOffer = await fetch("./assets/json/productsOffer.json");
        dataOffer = await productOffer.json();
    
    };

    // Obtengo el producto en oferta desde la BD JSON
    getProductsOffer();

    // Comienzo render de productos generales
    renderProducts(data);

    // Si el usuario no adquirió la oferta, muestro el alert de la misma cada 10 segundos
    if(addOffer != 1) {
        alertOffer = setInterval(intervalOffer, 10 * 1000);
    }

    // Renderizado de productos generales
    function renderProducts(Productos) {

        for (const producto of Productos) {

            // Agrego los productos a la tabla
            document.getElementById("contenidotienda").innerHTML +=
            `
            <div class="col-6 p-2 mx-auto text-center">
                <article class="card bg-primary flex-row text-white">
                    <img src="${producto.foto}" class="card-img-top" style="width:220px" />
                    <div class="my-auto card-body">
                        <h3 class="card-title">${producto.nombre}</h3>
                        <p class="card-text">${"$ " + producto.precio}</p>
                        <p hidden="hidden" class="card-id">${producto.id}</p>
                        <button class="btn btn-success addBtn">+</button>
                        <input size="2" class="col-sm-1 text-white text-center bg-primary no-border" value="0" readonly></input>
                        <button class="btn btn-danger remBtn">-</button>
                        <button class="btn btn-secondary toCart">Añadir a Carrito</button>
                    </div>
                </article>
            </div>
            `

        }

    }

    // Función para agregar eventos a los botones de añadir y quitar
    function ItemButtons() {

        const addButton = document.querySelectorAll('.addBtn');
        const removeButton = document.querySelectorAll('.remBtn');
        const toCartButton = document.querySelectorAll('.toCart');

        // Botón Añadir cantidad de productos
        addButton.forEach(button => {
            
            button.addEventListener('click', function() {
                
                const input = this.parentElement.querySelector('input');
                let cantidad = parseInt(input.value) || 0;
                cantidad++;
                
                if(cantidad > 20) {
                    input.value = 20;
                }else{
                    input.value = cantidad;
                }
            
            });

        });

        // Botón Quitar cantidad de productos
        removeButton.forEach(button => {
            
            button.addEventListener('click', function() {
                
                const input = this.parentElement.querySelector('input');
                let cantidad = parseInt(input.value) || 0;
                
                if (cantidad > 0) {
                    cantidad--;
                    input.value = cantidad;
                }

            });

        });
    
        // Botón Añadir productos al carrito
        toCartButton.forEach(button => {
            
            button.addEventListener('click', function() {
                
                cantIndex = cantIndex + 1;
                
                // Obtengo los valores de los productos
                const parentCard = this.closest('.card-body');
                const productId = parentCard.querySelector('.card-id').textContent;
                const productName = parentCard.querySelector('.card-title').textContent;
                const productPrice = parentCard.querySelector('.card-text').textContent.replace("$", "");
                const input = parentCard.querySelector('input');
                const quantity = parseInt(input.value) || 0;
                
                // Construyo la variable que será agregada al Carrito y quedará en localStorage
                const product = {
                    index: cantIndex,
                    id: productId,
                    nombre: productName,
                    precio: parseFloat(productPrice),
                    cantidad: quantity
                };

                agregarAlCarrito(product);

                // cantIndex = cantIndex++;
                cantIndex++;

            });

        });
    
    }

    // Función para agregar un producto al carrito
    function agregarAlCarrito(producto) {
        
        if(producto.cantidad == 0){

            Swal.fire({
                icon: "warning",
                title: "Debe agregar al menos un producto",
                showConfirmButton: true,
            });

            cantIndex = cantIndex - 1;

        }else{

            // Seteo textos en base las cantidades seleccionadas
            if(producto.cantidad == 1) {
                textUnit = "unidad";
            }else{
                textUnit = "unidades";
            }

            Toastify({
                text: "🛒 Se agregó al carrito ✔️\n▶️ " + producto.nombre + " x" + producto.cantidad + " " + textUnit + " ",
                style: {
                    background: "linear-gradient(to right, #FFF932, #FFFA59)",
                    color: "#313131"
                },
                destination: "./pages/cart.html",
                newWindow: true,
                offset: {
                    y: 50,
                }
            }).showToast();

            carrito.push(producto);
            localStorage.setItem("carrito", JSON.stringify(carrito));
        
        }

    }

    // Sumo el producto en oferta a la tabla (mediante push) y a localStorage
    function addCartOffer(){
        
        Toastify({
            text: "🛒 Se agregó al carrito ✔️\n▶️ " + dataOffer.nombre,
            style: {
                background: "linear-gradient(to right, #FFF932, #FFFA59)",
                color: "#313131"
            },
            destination: "./pages/cart.html",
            newWindow: true,
            offset: {
                y: 50,
            }
        }).showToast();

        cantIndex++;

        // Construyo la variable que será agregada al Carrito y quedará en localStorage
        const productOffer = {
            index: cantIndex,
            id: dataOffer.id,
            nombre: dataOffer.nombre,
            precio: dataOffer.precio,
            cantidad: 1
        };

        carrito.push(productOffer);
        localStorage.setItem("carrito",JSON.stringify(carrito));

    }

    // Anuncio oferta
    function intervalOffer() {

        Toastify({
            text: "🤑 Oferta solo por hoy en " + dataOffer.nombre + " 🤑\n👉 click para añadir 👈",
            position: "left",
            style: {
                background: "linear-gradient(to right, #92FF64, #C2FFA8)",
                color: "#353535"
            },
            offset: {
                y: 50,
            },
            onClick: addCartOffer_intervalOfferStop
        }).showToast();

    }

    // Añado oferta al carrito y llamo a función para detener el alert
    function addCartOffer_intervalOfferStop() {
        
        // Añado el producto en oferta al carrito
        addCartOffer();
        // Realizo stop de alerta de oferta
        intervalOfferStop();
        // Seteo addOffer en 1 para que no muestre más la oferta
        localStorage.setItem("addOffer", 1);

    }

    // Elimino el intervalo del alert de la oferta
    function intervalOfferStop() {    
        clearInterval(alertOffer);
    }

});
