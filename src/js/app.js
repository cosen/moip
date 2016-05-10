angular.module('stillRefuge', ['ngRoute']);

angular.module('stillRefuge').controller("produtosCtrl", function($scope, $http) {
  var carregarProdutos = function() {
    $http.get("/produtos").success(function(data, status) {
      $scope.produtos = data;
    });
  };

  carregarProdutos();
});

angular.module('stillRefuge').controller("pedidosCtrl", function($scope, $http, $routeParams) {
   var carregaProduto = function() {
      $http.get("/produtos/" + $routeParams.produtoId).success(function(data, status) {
        $scope.produto = data;
      });
   };

   carregaProduto();
});

angular.module('stillRefuge').config(function($routeProvider){
  $routeProvider
    .when("/", {
      templateUrl: "html/produtos.html",
      controller: "produtosCtrl"
    })
    .when("/produtos/:produtoId", {
      templateUrl: "html/produto.html",
      controller: "pedidosCtrl"
    })
    .otherwise({
      redirectTo: "/"
    });
});
