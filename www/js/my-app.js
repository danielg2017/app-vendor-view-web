// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: "#app",
    // App Name
    name: "My App",
    // App id
    id: "com.myapp.test",
    // Enable swipe panel
    panel: {
        swipe: "left",
    },
    // Add default routes
    routes: [
        { path: "/index/", url: "index.html" },
        { path: "/register/", url: "register.html" },
        { path: "/registroOk/", url: "registroOk.html" },
        { path: "/user/", url: "login.html" },
        { path: "/pedido/", url: "pedidos.html" },
        { path: "/carrito/", url: "carrito.html" },
        { path: "/busqueda/", url: "busqueda.html" },
        { path: "/cuenta/", url: "cuenta.html" },
        { path: "/resumen/", url: "resumen.html" },
        { path: "/detalle/:id/", url: "detalle.html" },
        { path: "/clientes/", url: "clientes.html" },
    ],
    // ... other parameters
});

var mainView = app.views.create(".view-main");
var cantProductos = 0;
var cantTotalPesos = 0;
var carrito = [];
var cliente = {};
var db = firebase.firestore();
var coleccionUsuarios = db.collection("USUARIOS");
var colClientes = db.collection("clientes");
var colProductos = db.collection("productos");
var colPedidos = db.collection("pedidos");
//db.collection("productos")
// Handle Cordova Device Ready Event
$$(document).on("deviceready", function () {
    console.log("Device is ready!");
    //iniciarDatos();
});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on("page:init", function (e) {
    // Do something here when page loaded and initialized
    console.log("Default page:init");
});

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on("page:init", '.page[data-name="login"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log("Ingreso en login");

    $$("#ingresa").on("click", fnIngresoUsuario);
});

$$(document).on("page:init", '.page[data-name="index"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log("Ingreso en index");

    $$("#registro").on("click", fnNuevoUsuario);
});

$$(document).on("page:init", '.page[data-name="register"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log("Ingreso de Registro");

    $$("#registro").on("click", fnNuevoUsuario);
});

var nombre, apellido, email, tipoUsuario;

function fnIngresoUsuario() {
    email = $$("#lEmail").val();
    password = $$("#lPassword").val();

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;

            console.log("Bienvenid@!!! " + email);
            // traer los datos de la base de datos de ESTE usuario en particular

            docRef = coleccionUsuarios.doc(email);

            docRef
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        nombre = doc.data().nombre;
                        apellido = doc.data().apellido;
                        tipoUsuario = doc.data().tipoUsuario;

                        if (tipoUsuario == "Usuario") {
                            console.log("anda para Usuario");
                            mainView.router.navigate("/index/");
                        } else {
                            console.log("anda para Admin");
                        }
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                })
                .catch((error) => {
                    console.log("Error getting document:", error);
                });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;

            console.error(errorCode);
            console.error(errorMessage);
            $$("#msgErrorLogin").html(errorMessage);
        });
}

function fnNuevoUsuario() {
    /*
      tomar los datos del formulario servicio de auth base de datos!
  */

    nombre = $$("#rNombre").val();
    apellido = $$("#rApellido").val();
    email = $$("#rEmail").val();
    password = $$("#rPassword").val();

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Usuario creado. Agregar datos a la base de datos

            var datosUsuario = {
                nombre: nombre,
                apellido: apellido,
                tipoUsuario: "Usuario",
            };

            coleccionUsuarios
                .doc(email)
                .set(datosUsuario)
                .then(function () {
                    // .then((docRef) => {
                    console.log("BD OK!");
                    mainView.router.navigate("/index/");
                })
                .catch(function (error) {
                    // .catch((error) => {
                    console.log("Error: " + error);
                });
        })
        .catch((error) => {
            // error en AUTH
            var errorCode = error.code;
            var errorMessage = error.message;

            console.error(errorCode);
            console.error(errorMessage);

            if (errorCode == "auth/email-already-in-use") {
                console.error("el mail ya esta usado");
                $$("#msgError").html("el mail ya esta usado");
            }
        });
}

function iniciarDatos() {
    var miClave = "mario@gomez.net";
    var nombre = "Mario";
    var apellido = "Gomez";
    var tipoUsuario = "Administrador";

    var data = {
        nombre: nombre,
        apellido: apellido,
        tipoUsuario: tipoUsuario,
    };

    coleccionUsuarios
        .doc(miClave)
        .set(data)
        .then(function () {
            // .then((docRef) => {
            console.log("OK!");
        })
        .catch(function (error) {
            // .catch((error) => {
            console.log("Error: " + error);
        });

    miClave = "cristina@fernand.net";
    nombre = "Cris";
    apellido = "Fer";
    tipoUsuario = "Usuario";

    data = {
        nombre: nombre,
        apellido: apellido,
        tipoUsuario: tipoUsuario,
    };

    coleccionUsuarios
        .doc(miClave)
        .set(data)
        .then(function () {
            // .then((docRef) => {
            console.log("OK!");
        })
        .catch(function (error) {
            // .catch((error) => {
            console.log("Error: " + error);
        });
}

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on("page:init", '.page[data-name="carrito"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log("Pagina Carrito Enviar Pedido DB");
    console.log($$("#totalArt"));

    //TODO: mostrar el cliente por pantalla
    console.log(cliente);
    var listadocliente = $$("#detalle_cliente");
    var itemcliente = `
        <li class="item-content">
            <div class="item-inner">
                <span>${cliente.apellido}</span>
                <span>${cliente.nombre}</span>
            </div>
        </li>
    `;
    listadocliente.append(itemcliente);
    carrito.forEach((producto) => {
        //TODO: mostrar los productos por pantalla
        console.log(producto);
        var listado = $$("#detalle_pedido");
        var item = `
            <li class="item-content">
                <div class="item-inner">
                    <span>${producto.nombre}</span>
                    <span>$${producto.precio}</span>
                </div>
            </li>
        `;
        listado.append(item);
    });

    document.getElementById("totalArt").innerHTML = cantProductos;
    document.getElementById("totalPesos").innerHTML = cantTotalPesos;

    $$("#btn_pedido_ok").on("click", (event) => {
        console.log("clic en enviar pedido");
        // Add a new document with a generated id.
        colPedidos
            .add({
                cliente: cliente,
                productos: carrito,
            })
            .then((docRef) => {
                const toastWithCallback = app.toast.create({
                    text: "Pedido enviado correctamente",
                    position: "center",
                    closeButton: true,
                    closeButtonText: "Aceptar",
                    closeButtonColor: "green",
                    on: {
                        close: function () {
                            carrito = [];
                            cliente = {};
                            mainView.router.navigate("/pedido/");
                        },
                    },
                });
                toastWithCallback.open();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    });
});

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on("page:init", '.page[data-name="pedidos"]', function (e) {
    console.log("Pagina pedidos");
    var selectClientes = $$("#select-clientes");
    var selectProductos = $$("#select-productos");
    var productList = $$("#product_list");
    var productos = {};
    var clientes = {};

    carrito.forEach((producto) => {
        const template = `
            <div id="${producto.id}" class="row no-gap">
                <div class="col">${producto.nombre} </div>
                <div class="col">
                    <input type="text" name="Cantidad" />
                </div>
                <div class="col">
                    <input type="text" name="precio" />
                </div>
                <div class="col">
                    <button id="remove-prod-${producto.id}" data-producto="${producto.id}">
                        <i class="icon f7-icons color-blue">cart_badge_minus</i>
                    </button>
                </div>
            </div>`;
        productList.append(template);
    });

    colClientes
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                var data = doc.data();
                option = `
            <option value="${doc.id}">
                ${data.nombre} ${data.apellido}
            </option>`;
                selectClientes.append(option);
                clientes[doc.id] = { ...data, id: doc.id };
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

    colProductos
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                var data = doc.data();
                option = `
                <option value="${doc.id}">
                    ${data.nombre}
                </option>`;
                selectProductos.append(option);
                productos[doc.id] = { ...data, id: doc.id };
                console.log(doc.data());
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

    $$("#btn_add").on("click", (event) => {
        event.preventDefault();
        var producto = productos[$$("#select-productos").val()];

        const existe = carrito.find((item) => producto.id == item.id);

        if (existe) {
            return;
        }

        var prodTemplate = `
            <div id="${producto.id}" class="row no-gap">
                <div class="col">${producto.nombre} </div>
                <div class="col">
                    <input type="text" name="Cantidad" />
                </div>
                <div class="col">
                    <input type="text" name="precio" />
                </div>
                <div class="col">
                    <button type="button" id="remove-prod-${producto.id}" data-producto="${producto.id}" class="button button-fill item-link">
                        <i class="icon f7-icons color-white">cart_badge_minus</i>
                    </button>
                </div>
            </div>`;
        productList.append(prodTemplate);
        cantProductos += 1;
        cantTotalPesos += producto.precio;
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
        });

        $$(`#remove-prod-${producto.id}`).on("click", (event) => {
            const productId = event.currentTarget.dataset.producto;
            $$(`#${productId}`).remove();
            if (cantProductos > 0) {
                cantProductos -= 1;
            }
            if (cantTotalPesos > 0) {
                cantTotalPesos -= producto.precio;
            }
            carrito = carrito.filter((item) => item.id != productId);
        });
    });
    $$("#select-clientes").on("change", (event) => {
        cliente = clientes[$$("#select-clientes").val()];
    });
});

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on("page:init", '.page[data-name="busqueda"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    // eventBus.$on("busqueda", fnBusqueda);
    //$$("#search").on("focusout", function () {

    $$("#search").on("click", printsearch());
    crearBusqueda();

    // });
    console.log("Pagina busqueda");
});

function printsearch() {
    console.log("busqueda");
    colProductos
        .orderBy("nombre")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const producto = doc.data();
                var linkproducto = `<li class="item-content">
                    <div class="item-inner">
                        <div class="item-title">${doc.data().nombre}</div>
                        <div class="item-after">
                            <button id="btn_add_search_${doc.id}">
                            <i class="icon f7-icons color-blue">cart_badge_plus</i>
                            </button>
                        </div>
                    </div>
                </li>`;
                $$("#select-productos").append(linkproducto);

                $$(`#btn_add_search_${doc.id}`).on("click", (event) => {
                    const existe = carrito.find((item) => producto.id == item.id);

                    if (existe) {
                        return;
                    }
                    cantProductos += 1;
                    cantTotalPesos += producto.precio;
                    carrito.push({
                        id: doc.id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                    });
                });
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

function crearBusqueda() {
    var searchbar = app.searchbar.create({
        el: ".searchbar",
        searchContainer: ".list",
        searchIn: ".item-title",
        on: {
            search(sb, query, previousQuery) {
                console.log(query, previousQuery);
            },
            clear(sb) {
                console.log("clear");
            },
        },
    });
}

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on("page:init", '.page[data-name="cuenta"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log("Pagina cuenta");
});

$$(document).on("page:init", '.page[data-name="clientes"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log("Ingreso de Registro Cliente");

    $$("#registro_cliente").on("click", fnNuevoCliente);
});

function fnNuevoCliente() {
    nombre = $$("#rNombre").val();
    apellido = $$("#rApellido").val();
    calle = $$("#rCalle").val();
    localidad = $$("#rLocalidad").val();
    telefono = $$("#rTelefono").val();
    email = $$("#rEmail").val();
    dni = $$("#rDni").val();

    console.log(nombre);
    console.log(apellido);
    console.log(calle);
    console.log(localidad);
    console.log(telefono);
    console.log(email);
    console.log(dni);

    colClientes
        .add({
            nombre: nombre,
            apellido: apellido,
            calle: calle,
            localidad: localidad,
            telefono: telefono,
            email: email,
            dni: dni,
        })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            $$("#rNombre").val("");
            $$("#rApellido").val("");
            $$("#rCalle").val("");
            $$("#rLocalidad").val("");
            $$("#rTelefono").val("");
            $$("#rEmail").val("");
            $$("#rDni").val("");
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on("page:init", '.page[data-name="resumen"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log("Pagina resumen");
});
