angular.module('stillRefuge', ['ngRoute']);

// CONSTANTS
angular.module('stillRefuge').constant("PUBLIC_KEY", "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6ayJA/x99SNYhxe5FUaR\nQBnt6HLrxEccczLhk7/TUe9N+MO/ih9AwszSTDccqSiao3/vNUlEQ10s0Me+dU1J\ns24cNmVZSzIuY0/1WNqBArZqWUDprwo5HHV+Ic/E9b8knqHaiU9qEU8X7DklLyPo\nk99weh+WiSodrmy1Xds20iVvk5wDlZucrkUX+vrsuaKydwHbmAJUdRIqi4U0lBu8\nEtPMo7oFSewRnLshoA4fmP2u/8QZfFUumdHPAdn1TmuRR2xmxac2pjaXPfueG7/D\npOnW0g1bEtOUhnHdQOiFlEGIoiPXPIAEmrQsTK+cc9Mtu9cedCu6kYBOsJHGIZPq\nawIDAQAB\n-----END PUBLIC KEY-----");

// SERVICES
angular.module('stillRefuge').service('produtosService', function() {
  var produtosSelecionados = [];

  var setProdutosSelecionados = function(produtos) {
    produtosSelecionados = produtos;
  };

  var getProdutosSelecionados = function() {
    return produtosSelecionados;
  };

  return {
    setProdutosSelecionados: setProdutosSelecionados,
    getProdutosSelecionados: getProdutosSelecionados
  };
});

// CONTROLLERS
angular.module('stillRefuge').controller("produtosCtrl", function($scope, $http, produtosService) {
  var carregarProdutos = function() {
    $http.get("/produtos").success(function(data, status) {
      $scope.produtos = data;
    });
  };

  $scope.comprarProdutos = function(produtos) {
    var produtosSelecionados = produtos.filter(function(produto) {
      if(produto.selecionado) {
        return produto;
      }
    });

    produtosSelecionados.forEach(function(produto) {
      produto.quantidade = 1;
    });

    produtosService.setProdutosSelecionados(produtosSelecionados);
  };

  $scope.temProdutoSelecionado = function(produtos) {
    return produtos && produtos.some(function(produto) {
      return produto.selecionado;
    });
  };

  carregarProdutos();
});

angular.module('stillRefuge').controller("pedidosCtrl", function($scope, $http, $routeParams, produtosService, PUBLIC_KEY) {
  $scope.produtos = produtosService.getProdutosSelecionados();
  $scope.pagamento = {
    installmentCount: "1"
  };

  // TESTE - INICIO
  $scope.pagamento.cartao = {};
  $scope.pagamento.cartao.number = 5491670208076682;
  $scope.pagamento.cartao.cvc = 900;
  $scope.pagamento.cartao.month = "03";
  $scope.pagamento.cartao.year = "2024";
  
  $scope.pagamento.cartao.holder = {};
  $scope.pagamento.cartao.holder.fullname = "Rafael Antonio Cosentino";
  $scope.pagamento.cartao.holder.birthdate = "1984-10-30";

  $scope.pagamento.cartao.holder.taxDocument = {};
  $scope.pagamento.cartao.holder.taxDocument.number = "32000035884";
  // TESTE - FIM

  $scope.checkout = function(produtos, pagamento) {
    var novoCheckout = {};

    var cc = new Moip.CreditCard({
      number: pagamento.cartao.number,
      cvc: "" + pagamento.cartao.cvc,
      expMonth: pagamento.cartao.month,
      expYear: pagamento.cartao.year,
      pubKey: PUBLIC_KEY
    });

    if(!cc.isValid()) {
      alert('Cartao inválido!');
      return;
    }

    novoCheckout.order = { items: [] };
    for(var i = 0; i < produtos.length; i++) {
      novoCheckout.order.items.push({
        id: produtos[i].id,
        product: produtos[i].nome,
        quantity: produtos[i].quantidade,
        detail: produtos[i].descricao,
        price: produtos[i].preco
      });
    }

    novoCheckout.payment = {
      installmentCount: pagamento.installmentCount,
      fundingInstrument: {
        creditCard: {
          hash: cc.hash(),
          holder: {
            fullname: pagamento.cartao.holder.fullname,
            birthdate: pagamento.cartao.holder.birthdate,
            taxDocument: {
              type: "CPF",
              number: pagamento.cartao.holder.taxDocument.number
            }
          }
        }
      },
      cupom: pagamento.cupom
    };

    $http.post("/checkout", novoCheckout).success(function(data, status) {
      var host = location.origin.replace(/^http/, 'ws');
      var ws = new WebSocket(host + "?pagamentoId=" + data.pagamentoId);

      ws.onmessage = function (event) {
        console.log(event.data);
      };
    });
  };
});

angular.module('stillRefuge').config(function($routeProvider){
  $routeProvider
    .when("/", {
      templateUrl: "html/produtos.html",
      controller: "produtosCtrl"
    })
    .when("/comprar", {
      templateUrl: "html/comprar.html",
      controller: "pedidosCtrl"
    })
    .otherwise({
      redirectTo: "/"
    });
});
