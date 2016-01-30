angular.module('grocery.controllers')
  .controller('CartController', function ($scope, $stateParams, Cart, Items)
  {
    var itemId = $stateParams.itemId;
    console.log(itemId);
    if (itemId === undefined)
    {
      $scope.cartProducts = Cart.all();
      console.log($scope.cartProducts);
      $scope.controller = "cart";
      $scope.isNested = false;
    }
    else
    {
      $scope.product = Items.get(itemId);
      var pattern = new RegExp(/\d+/);
      $scope.product.EffectiveStartDate = pattern.exec($scope.product.EffectiveStartDate)[0];
      $scope.product.EffectiveEndDate = pattern.exec($scope.product.EffectiveEndDate)[0];
    }

    $scope.deleteCart = function (product)
    {
      var productList = localStorage.getObject("cartProducts");
      if (productList != null && productList.length > 0)
      {
        var cartProduct = _.find(productList, {Id: product.Id});
        if (cartProduct.CartQuantity == 1)
        {
          productList = _.without(productList, _.findWhere(productList, {Id: product.Id}));

          localStorage.setObject("cartProducts", productList);
        }
        else
        {
          cartProduct.CartQuantity--;
          _.extend(_.findWhere(productList, { CartQuantity: cartProduct.CartQuantity }), cartProduct);
          localStorage.setObject("cartProducts", productList);
        }
        $scope.cartProducts = productList;
      }
    };

    $scope.$on("refreshCart", function ()
    {
      $scope.cartProducts = Cart.all();
    });
  });
