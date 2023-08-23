import Logger from './../../general/controladores/Logger.js';
import Datos from './../../general/controladores/Datos.js';
import DOM from './../../general/controladores/DOM.js';
import Graficos from '../../general/controladores/Graficos.js';

/*
Contenido: 
  1) declaracion de variables(Arrays) globales.
    - Jerarquias. 
    - Usuarios.
    - Permisos. 
  2) Event Listeners. 
    - Submit. 
    - Click.
    - Change. 
    - Modal show.
  3) Datatable.
  4) Funciones.
*/
$(document).ready(function() {
  var jerarquias;
  var usuarios;
  var permisos;

  document.querySelector('#formulario').addEventListener('submit', solicitud);
  document.addEventListener("click", function(event) {
    if (event.target.matches('[title="Eliminar"]')) {
      eliminarNodo(event);
    } else if (event.target.matches('[title="Agregar nuevo"]')) {
      nuevoNodo(event);
    } else if (event.target.matches('[title="Cambio visualizacion"]')) {
      let tabla = document.querySelector("#formulario table");
      let mermaid = document.querySelector("#formulario pre");
      
      if(mermaid.classList.contains("d-none")){
        tabla.classList = "d-none";
        mermaid.classList = "mermaid";
      }else{
        tabla.classList = "";
        mermaid.classList = "d-none";
      }
    }
  });
  //Este event listener solo esta para la comprobacion de que el nodo no existe en la jerarquia. 
  //Las funciones estan declaradas dentro del eventListener debido a que no serian utiles para nada mas que esto.
  document.addEventListener("change", function(event) {
    let nombre = event.target.getAttribute("name");
    if(nombre){

      nombre = nombre.split(" ");
      const valorSeleccionado = event.target.value;
    
      if (["insertar", "actualizar"].includes(nombre[0])) {
        const idJerarquia = nombre[1].replace("[]", "");
        repetidoEnJerarquiaSuperior(idJerarquia);
        repetidoEnJerarquiaInferior(idJerarquia);
      }
      //Revisa si el nodo que se modifico tiene padre, si es asi, revisa si el idUsuario del padre es igual al valor del nodo modificado.
      //Si lo es, se termina la ejecucion. Muestra un mensaje y deselecciona el valor del selector que fue modificado.
      //Si no es asi, revisa si el nodo padre, tiene un nodo padre y se llama asi mismo, con el id de jerarquia de su nodo padre.
      function repetidoEnJerarquiaSuperior(nodo) {
        const nodoActual = jerarquias.find(element => element.idJerarquia === nodo);
  
        if (nodoActual && nodoActual.idSuperior != 0) {
          const nodoPadre = jerarquias.find(element => element.idJerarquia === nodoActual.idSuperior);
    
          if (nodoPadre && valorSeleccionado == nodoPadre.idUsuario) {
            Logger.swal("El usuario seleccionado ya se encuentra en un nivel superior de la jerarquía.", "error");
            event.target.selectedIndex = 0;
          } else {
            repetidoEnJerarquiaSuperior(nodoPadre.idJerarquia);
          }
        }
      }
  
    
      //Revisa si el nodo que se modifico tiene hijos, si es asi, revisa si el idUsuario de cada hijo, si es igual al valor del nodo modificado.
      //Si lo es, se termina la ejecucion. Muestra un mensaje y deselecciona el valor del selector que fue modificado.
      //Si no es asi, revisa si el nodo padre, tiene un nodo padre y se llama asi mismo, con el id de jerarquia de su nodo padre.
      function repetidoEnJerarquiaInferior(nodo) {
        const nodosInferiores = jerarquias.filter(element => element.idSuperior === nodo);
            
        for (const nodoInferior of nodosInferiores) {
          if (valorSeleccionado == nodoInferior.idUsuario) {
            Logger.swal("El usuario seleccionado se encuentra en un nivel inferior de la jerarquía", "error");
            event.target.selectedIndex = 0;
            break; 
          } else {
            repetidoEnJerarquiaInferior(nodoInferior.idJerarquia);
          }
        }
      }

    }
  });

  //Esta funcion es un event listener para el modal. Cada vez que se muestre, se ejecutara y llamara la funcion correcta para generar el contenido.
  $('#modal').on('show.bs.modal', function(event) {
    let titulo = event.relatedTarget.getAttribute('title');
    document.querySelector(".modal-title").innerText = titulo;
    let contenedor = document.querySelector(".modal-body");
    DOM.vaciar(contenedor);
    switch (titulo) {
      case "Registrar":
        modalRegistro();
        break;
      case "Modificar":
        modalModificacion(event.relatedTarget.closest('tr'));
        break;
    }
  });

  //Definicion basica del datatables. Los datos son insertados utilizando la funcion solicitud("buscar").
  const tablaDatos = $('#tablaDatos').DataTable({
    columns: [
        { title: "ID Jerarquia", data: 'idJerarquia' },
        { 
          title: "Nombre Grupo", 
          data: null,
          render: function(data, type, row, meta) {
              return `Grupo Número ${meta.row + 1}`;
          }
        },
        { title: "Lider", data: 'first' },
        {
          title: "Acciones",
          input: "Acciones",
          class: "text-center align-middle",
          render: function(data, type, row) {
            let respuesta = '<div style="display: flex;width: 100%;justify-content: center;">';
            respuesta +=  `     <button class="btn btn-primary btn-sm" title="Modificar" data-toggle="modal" data-target="#modal">
                                  <i class="fa fa-eye" aria-hidden="true"></i>
                                </button>`;
            respuesta += '    </div>';
            return respuesta;
          }
        }
      ],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
      createdRow: function(row, data, dataIndex) {
        $(row).attr('id', data.idJerarquia);
      },
  });
  

  //Se hizo un wrapper al metodo  Datos.enviar para colocar el then usar(); Todas las solicitudes pasan por aqui. 
  async function solicitud(event, aux = "") {
    try {
      const response = await Datos.enviar(event, aux);
      if(response.estado == "finalizado"){
        usar(event, response.data);
        if(typeof(event) == "object"){
          solicitud("buscar");
          $("#modal").modal('hide');
        }
      }else{
        console.log(response);
      }
    } catch (error) {
      Logger.swal("Error en la solicitud", "error", "parent");
    }
  }

  function usar(vista, data){
    switch (vista) {
      case "buscarPermisos":
        permisosValidar(data);
        break;
        case 'buscarUsuarios':
          //Guardar todos los usuarios en un arreglo global. La informacion no volvera a ser solicitada a la base de datos hasta que se actualice la pagina.
          usuarios = data;
          //Continuar con la cadena de solicitudes. 
          solicitud("buscar");
          break;
        case "buscar":
          //Guardar la jerarquia, para ser utilizada en otros 9 lugares. Solo se actualizara en caso de que se haya realizado una modificacion de los datos.
          jerarquias = data;
          //Obtiene los elementos lideres de su jerarquia.
          data = jerarquias.filter( function(element) {
            return (element.NivelJerarquia == 1);
          });
          //Limpia la tabla y luego muestra los rows obtenidos.
          tablaDatos.clear().rows.add(data).draw();
          break;
        default:
          Logger.swal("Se realizo correctamente", "success");
          break;
    }
  }

  //Funcion creada para generar un nodo justo debajo del nodo actual. 
  //Quiza un append a la closest table evite el uso de esta funcion. 
  function insertAfter(newNode, referenceNode) {
    const parent = referenceNode.parentNode;
    const nextSibling = referenceNode.nextSibling;
    if (nextSibling) {
      parent.insertBefore(newNode, nextSibling);
    } else {
      parent.appendChild(newNode);
    }
  }

  //Utiliza los datos de jerarquia recursiva para generar el texto necesario para generar el grafico. 
  function generarGrafico(jsonData){
    const mermaidData = `graph TD;\n`+jsonData.map(item => {
      const idJerarquia = item.idJerarquia;
      const idSuperior = item.idSuperior;
      const nombre = item.first;
      return (idSuperior>0) ? `  ${idSuperior} --> ${idJerarquia}[${nombre}];`: `  ${idJerarquia}[${nombre}];`;
    }).join('\n');
    
    const preElement = document.querySelector('.mermaid');
    Graficos.dibujarMermaid(preElement, mermaidData);
  }

function jerarquiaRecursiva(idJerarquia, jerarquiaActual = []) {
  jerarquias.forEach((element) => {
    if (idJerarquia == element.idJerarquia && element.idSuperior == 0) {
      jerarquiaActual.push(element);
    } else if (idJerarquia == element.idSuperior) {
      jerarquiaActual.push(element);
      jerarquiaRecursiva(element.idJerarquia, jerarquiaActual);
    }
  });
  return jerarquiaActual;
}
  //Validar que permisos tiene el usuario actual.
  function permisosValidar(data){
    permisos = data;
    if (!permisos.includes("ver")) Logger.swal('NO TIENES PERMISOS PARA VER ESTE MODULO', 'error', 'parent'); //Redireccionarlo apenas haga click.
    if (!permisos.includes("insertar")) document.querySelector(".btn.btn-primary").remove(); //Retirar el boton de crear nuevo grupo.
    solicitud("buscarUsuarios"); //Pasar a la siguiente llamada de la cadena de solicitudes. 
  }

  //Crea un nuevo nodo para insertarlo en la tabla. como hijo del nodo que genero el evento. 
  //El calculo del width es 80% del contenedor.
  //Debe ser calculado en base al (width del modal *(nodoSuperior.nivelJerarquia+1)/10). 
  function nuevoNodo(event){
    let idSuperior = event.target.closest("td").previousSibling.firstChild.getAttribute("name").split(" ")[1];
    let contenedor = event.target.closest("tr");
    let tr = document.createElement("tr");

    let tdPrincipal = document.createElement("td");
    let tdSecundario = document.createElement("td");
    let select = selector_de_usuarios();
    let anchoModal = document.querySelector(".modal-body").offsetWidth -150;
    let NivelJerarquia = parseInt(jerarquias.find((element) => {
      return element.idJerarquia == idSuperior;
    }).NivelJerarquia);
    let anchoElemento = anchoModal * Math.abs(((NivelJerarquia+1)*0.1)-1);
    select.setAttribute('style', 'width: '+anchoElemento+"px");
    select.name = `insertar ${idSuperior}[]`;
    tdPrincipal.appendChild(select);
    tr.appendChild(tdPrincipal);
    tr.appendChild(tdSecundario);
    insertAfter(tr, contenedor);
  }

  //Hacer invisible el elemento actual y todos sus hijos. 
  //Reemplazar del nombre actualizar por eliminar. En caso de que el nombre contenga insertar, lo remueve del DOM. 
  function eliminarNodo(event){
    let table = event.target.closest("table");
    table.className = "d-none";
    let hijos = table.querySelectorAll("select");
    hijos.forEach(element => {
      element.name = element.name.replace("actualizar", "eliminar");
      if(element.name.includes("insertar")){
        element.remove();
      }
    });
  }


  function generarBotones(contenedor){
    if(permisos.includes("actualizar")){
      let button = DOM.insertar({tag: "button", clase: "btn btn-sm btn-info", atributo:["title", "Agregar nuevo"], tipo:"button"}, contenedor);
      DOM.insertar({tag: "i", clase: "fa fa-plus-square-o", atributo:["title", "Agregar nuevo"]}, button);
    }
    if(permisos.includes("eliminar")){
      let button = DOM.insertar({tag: "button", clase: "btn btn-sm btn-danger", atributo:["title", "Eliminar"], tipo:"button"}, contenedor);
      DOM.insertar({tag: "i", clase: "fa fa-trash-o", atributo:["title", "Eliminar"]}, button);
    }
    return contenedor;
  }

  function modalRegistro() {
    document.querySelector('[role="document"]').className = "modal-dialog";
    let contenedor = document.querySelector(".modal-body");
    DOM.insertar({tag: "input", nombre:"opcion", valor:"insertar", clase:"d-none"}, contenedor);
    DOM.insertar({tag: "label", texto:"Selecciona el lider"}, contenedor);

    let select = selector_de_usuarios();
    select.setAttribute("required", true);
    select.setAttribute("style", "");
    contenedor.appendChild(select);
  }

  function modalModificacion(row) {
    const idJerarquia = row.firstChild.innerText;
    const nombreGrupo = row.firstChild.nextSibling.innerText;
    document.querySelector('[role="document"]').className = "modal-dialog";
    let contenedor = document.querySelector(".modal-body");
    
    contenedor.setAttribute("width", "480px;");
    const tab = DOM.insertar({tag: "i", atributo: ["title", "Cambio visualizacion"], clase: "fa fa-eye"}, contenedor);
    DOM.insertar({tag: "div", texto: nombreGrupo, clase: "text-center h4"}, contenedor);
    DOM.insertar({tag: "input", valor:"modificar", nombre:"opcion", texto: nombreGrupo, clase: "d-none"}, contenedor);

    contenedor.appendChild(tabla_con_selectores(idJerarquia));
    let data = jerarquiaRecursiva(idJerarquia);
    if(data.length>0){
      DOM.insertar({tag: "pre", atributo: ["style", "text-align: center;"], clase: "mermaid d-none"}, contenedor);
      generarGrafico(data);
    }
  }

  //tabla_con_selectores es la función recursiva que construye una tabla que muestra selectores de usuarios en función de una jerarquía determinada. La función toma un idJerarquia como entrada y busca entre los elementos de la jerarquía (jerarquias) para encontrar aquellos que coincidan con el idJerarquia proporcionado o tengan idSuperior igual al idJerarquia.
  //En cada nivel de recursión, se crean elementos de tabla (<table>), fila (<tr>), y celdas (<td>) para representar la estructura jerárquica y los selectores de usuarios. Para los elementos de la jerarquía que coinciden con el idJerarquia proporcionado, se crea un selector de usuarios usando la función selector_de_usuarios. Para los elementos que tienen un idSuperior igual al idJerarquia, se vuelve a invocar la función tabla_con_selectores para crear una nueva tabla y selectores para esa jerarquía anidada.
  // Esta función construye una tabla con selectores de usuarios basados en la jerarquía.
  function tabla_con_selectores(idJerarquia){
    const table = document.createElement("table");
    jerarquias.forEach(element => {
      // Verifica si el elemento actual coincide con el idJerarquia proporcionado o si tiene el idSuperior igual al idJerarquia.
      if(element.idJerarquia == idJerarquia || element.idSuperior == idJerarquia){
        const tr = document.createElement('tr');
        const tdPrincipal = document.createElement('td');
        const tdSecundario = document.createElement('td');
        tdSecundario.className = "d-flex justify-content-around";
        //Deberia enviar la creacion de botones a otro lugar. 
        if(element.idJerarquia == idJerarquia){
          generarBotones(tdSecundario);
        }
        // Crea el contenido principal dependiendo de si el elemento actual coincide con el idJerarquia proporcionado.
        let contenidoPrincipal = (element.idJerarquia == idJerarquia) ? selector_de_usuarios(element) : tabla_con_selectores(element.idJerarquia);
        tdPrincipal.appendChild(contenidoPrincipal);

        tr.appendChild(tdPrincipal);
        tr.appendChild(tdSecundario);
        table.appendChild(tr);
      }
    });
    return table;
  }

  // Esta función crea un selector de usuarios dentro de un elemento <select> basado en el elemento de la jerarquía proporcionado.
  function selector_de_usuarios(elementoOriginal){  
    let anchoModal = parseInt(document.querySelector(".modal-body").getAttribute("width"))-150;
    let anchoElemento = (elementoOriginal) ? anchoModal * Math.abs(((parseInt(elementoOriginal.NivelJerarquia))*0.1)-1) : 250;
    const select = document.createElement("select");
    select.setAttribute('style', 'width: '+anchoElemento+"px");

    select.className = "form-control";
    select.name = (elementoOriginal) ? `actualizar ${elementoOriginal.idJerarquia}` : "idUsuario";
    let option = document.createElement('option');
    option.value = "";
    option.textContent = `Selecciona un Analista`;
    select.appendChild(option);
    usuarios.forEach(element => {
      let option = document.createElement('option');
      // Si el usuario actual coincide con el usuario del elemento de la jerarquía proporcionado, se selecciona la opción.
      if (elementoOriginal && element.id == elementoOriginal.idUsuario) {
        option.setAttribute('selected', '');
      }
      option.value = element.id;
      option.textContent = `${element.first}`;
      select.appendChild(option);
    });
    return select;
  }

  //Inicio de la cadena de request necesarios para que la pagina funcione adecuadamente.
  solicitud("buscarPermisos");
});


