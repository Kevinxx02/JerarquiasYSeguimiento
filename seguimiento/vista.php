<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/png" href="./../../../gui/themes/default/images/QGinternet.png" />
    <title>Control de seguimiento</title>
    <link rel="stylesheet" href="estilos.css?<?php echo time(); ?>">
    <link rel="stylesheet" href="./../../../third_party/adminlt3/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="./../../../third_party/bootstrap4/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="./../../../third_party/datatables/datatables.min.css"/>
    <link rel="stylesheet"  type="text/css" href="./../../../third_party/datatables/DataTables-1.10.18/css/dataTables.bootstrap4.min.css">    
    <link href="./../../../gui/icons/font-awesome-4.5.0/css/font-awesome.css" rel="stylesheet">  
    <link rel="stylesheet" href="./../../../third_party/bootstrap4/css/bootstrap.min.css">
    <link rel="stylesheet" href="./../../../third_party/adminlt3/estilos_QG.css">
    <link rel="stylesheet" href="./../../../third_party/bootstrap-select/1.13.14/css/bootstrap-select.min.css">
  </head>
  
  <body class="hold-transition layout-top-nav">  
    <div class="content-wrapper">
        <div class="content-header">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <span class="text-left vistaTitulo"> Control de Seguimiento </span>
                    <a href="<?php echo basename(__FILE__) ?>">
                        <button type="button" class="btn btn-info btn-sm" style="padding: 0px 7px;" title="Actualizar">
                            <i class="material-icons" style="font-size: 20px; margin-top:3px;">refresh</i>
                        </button> 
                    </a>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right mr-4">
                    <li class="breadcrumb-item"><a href="../../../index.php" target="_parent">Inicio</a></li>
                    <li class="breadcrumb-item"><a href="<?php echo basename(__FILE__) ?>">Control de Seguimiento</a></li>
                    </ol>
                </div>
            </div>
        </div>
        <hr class="style-one">

        <div class="card_p">
            <div class="row">
                <div class="col-md-2">
                    <button type="button" title="Registrar" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modal">
                        <i class="material-icons" title="Registrar">library_add</i>
                        Iniciar Seguimiento
                    </button>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-primary btn-sm" onclick="window.location.href='../atencion/atencionView.php'">
                        <i class="material-icons">library_add</i> <span>Atenciones</span>
                    </button>  
                </div>
            </div>
        </div>
        <hr class="style-four">
    </div>
        <div class="container caja" style="max-width: 98%; margin-bottom:20px;">
            <div class="row">
                <div class="col-lg-12">
                    <div class="table-responsive">   
                        <table id="tablaDatos" class="table table-striped table-bordered table-condensed table-hover" style="width:100%;">
                            <thead class="text-center text-white" style="background-color: #0d47a1;">
                            
                            </thead>

                            <tbody>                           
                            </tbody>        
                        </table>  
                    </div>             
                </div>
            </div>
        </div>
    </div>

        <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-hidden="true" style="font-size:12px;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Registrar</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="formulario">
                    <div class="modal-body m-2">
                            
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cerrar</button>
                        <button class="btn btn-primary btn-sm">Guardar</button>
                    </div>
                </form>
                </div>
            </div>
        </div>
        <div id="container-loader" class="container-loader" style="position: fixed;background-color: #000;width: 100%;height: 100%;z-index: 9999;top: 0;opacity: 0.7;display:none">
            <img src="./../../../gui/themes/default/images/loader_gears.gif" id="loading-indicator" style="position: fixed;left: 45vw;top: 30vh;">
        </div>
        <script src="./../../../third_party/jquery3/jquery-3.3.1.min.js"></script>
        <script src="./../../../third_party/popper/popper.min.js"></script>
        <script type="text/javascript" src="../../../third_party/jquery/mask.js"></script>
        <script src="./../../../third_party/bootstrap4/js/bootstrap.min.js"></script>
        <script src="./../../../third_party/bootstrap-select/1.13.14/js/bootstrap-select.min.js"></script>
        <script src="./../../../third_party/adminlt3/plugins/sweetalert2/sweetalert2.all.min.js"></script>
            
        <script type="text/javascript" src="./../../../third_party/datatables/datatables.min.js"></script>    
            
        <script type="text/javascript" src="./../../../third_party/library/validCampoFranz.js"></script>
        <script type="module" src="main.js?<?php echo time(); ?>"></script>  

        <script type="text/javascript" src="./../../../third_party/adminlt3/plugins/datatables-buttons/js/dataTables.buttons.min.js"></script>
        <script type="text/javascript" src="./../../../third_party/adminlt3/plugins/jszip/jszip.min.js"></script>
        <script type="text/javascript" src="./../../../third_party/adminlt3/plugins/pdfmake/pdfmake.min.js"></script>
        <script type="text/javascript" src="./../../../third_party/adminlt3/plugins/pdfmake/vfs_fonts.js"></script>   
        <script type="text/javascript" src="./../../../third_party/adminlt3/plugins/datatables-buttons/js/buttons.html5.min.js"></script>
        <script type="text/javascript" src="./../../../third_party/adminlt3/plugins/datatables-buttons/js/buttons.print.min.js"></script>
    </body>
</html>