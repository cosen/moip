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
  var inicializa = function() {
    $scope.produtos = produtosService.getProdutosSelecionados();

    $scope.pagamento = {
      installmentCount: "1"
    };

    if(!$scope.produtos || $scope.produtos.length === 0) {
      location.href = "/";
    }    
  };

  inicializa();

  $scope.mastercard = function() {
    $scope.pagamento.cartao = {
      number: "5555666677778884",
      cvc: "123",
      month: "05",
      year: "2018",
      holder: {
        fullname: "José da Silva",
        birthdate: "1999-12-25",
        taxDocument: {
          number: "11111111111"
        }
      }
    };
  };

  $scope.visa = function() {
    $scope.pagamento.cartao = {
      number: "4012001037141112",
      cvc: "123",
      month: "05",
      year: "2018",
      holder: {
        fullname: "José da Silva",
        birthdate: "1999-12-25",
        taxDocument: {
          number: "11111111111"
        }
      }
    };
  };

  $scope.amex = function() {
    $scope.pagamento.cartao = {
      number: "376449047333005",
      cvc: "1234",
      month: "05",
      year: "2018",
      holder: {
        fullname: "José da Silva",
        birthdate: "1999-12-25",
        taxDocument: {
          number: "11111111111"
        }
      }
    };
  };

  $scope.elo = function() {
    $scope.pagamento.cartao = {
      number: "6362970000457013",
      cvc: "123",
      month: "05",
      year: "2018",
      holder: {
        fullname: "José da Silva",
        birthdate: "1999-12-25",
        taxDocument: {
          number: "11111111111"
        }
      }
    };
  };

  $scope.dinners = function() {
    $scope.pagamento.cartao = {
      number: "36490102462661",
      cvc: "123",
      month: "05",
      year: "2018",
      holder: {
        fullname: "José da Silva",
        birthdate: "1999-12-25",
        taxDocument: {
          number: "11111111111"
        }
      }
    };
  };

  $scope.hiper = function() {
    $scope.pagamento.cartao = {
      number: "6370950000000005",
      cvc: "123",
      month: "05",
      year: "2018",
      holder: {
        fullname: "José da Silva",
        birthdate: "1999-12-25",
        taxDocument: {
          number: "11111111111"
        }
      }
    };
  };

  $scope.hipercard = function() {
    $scope.pagamento.cartao = {
      number: "6062825624254001",
      cvc: "123",
      month: "05",
      year: "2018",
      holder: {
        fullname: "José da Silva",
        birthdate: "1999-12-25",
        taxDocument: {
          number: "11111111111"
        }
      }
    };
  };

  $scope.authorized = function() {
    $scope.pagamento.cartao.holder.fullname = "AUTHORIZED";
  };

  $scope.cancelled = function() {
    $scope.pagamento.cartao.holder.fullname = "REJECT";
  };

  $scope.total = function(produtos, pagamento) {
    var fator = 1;

    if(pagamento.installmentCount > 1) {
      fator += 0.025;
    }

    if(pagamento.cupom && pagamento.cupom.startsWith("A")) {
      fator -= 0.05;
    }

    var total = 0;

    for(var i = 0; i < produtos.length; i++) {
      total += parseInt(produtos[i].preco * fator * 100) * produtos[i].quantidade;
    }

    return total / 100 + 10;
  };


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

    var loadingScreen = pleaseWait({
      logo: "img/logo.png",
      backgroundColor: '#f46d3b',
      loadingHtml: '<div class="sk-cube-grid"><div class="sk-cube sk-cube1"></div><div class="sk-cube sk-cube2"></div><div class="sk-cube sk-cube3"></div><div class="sk-cube sk-cube4"></div><div class="sk-cube sk-cube5"></div><div class="sk-cube sk-cube6"></div><div class="sk-cube sk-cube7"></div><div class="sk-cube sk-cube8"></div><div class="sk-cube sk-cube9"></div></div>'
    });

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
     
      console.log(host + "?pagamentoId=" + data.pagamentoId);

      ws.onmessage = function (event) {
        if(event.data != "true" && event.data != "false") {
          console.log(event.data);
          return;
        }        
        
        ws.close();

        if(event.data == "true") {
          alert("Pagamento Autorizado");
        } else {
          alert("Pagamento não Autorizado");
        }
        
        loadingScreen.finish();
        location.href = "/";    
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
