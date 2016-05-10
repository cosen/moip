angular.module('stillRefuge', ['ngRoute']);

angular.module('stillRefuge').controller("produtosCtrl", function($scope, $http) {
  var carregarProdutos = function() {
    $http.get("/produtos").success(function(data, status) {
      $scope.produtos = data;
    });
  };

  carregarProdutos();
});

angular.module('stillRefuge').config(function($routeProvider){
  $routeProvider.when("/", {
    templateUrl: "html/produtos.html",
    controller: "produtosCtrl"
  });
});
