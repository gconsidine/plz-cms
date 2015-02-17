'use strict';

require('should');

var Tc = require('./test-config');

describe('merchant | Configuration', function () {
  it('should not accept undefined merchant options', function () {
    (function () {
      require('../app/core.hub')(Tc.invalidMerchantConfig);
    }).should.throw();
  });

  it('should accept properly defined merchant options', function () {
    (function () {
      require('../app/core.hub')(Tc.validMerchantConfig);
    }).should.not.throw();
  });
});

describe('merchant.cart | Public API', function () {
  var cartCollection;
  var collectionName = Tc.validMerchantConfig.merchant.cart.collection;
  var mockDatabase = {
    getDocument: function (query, callback) {
      if(query.collectionName === collectionName) {
        callback(true, 'Mock failure');
      }
      else {
        callback(false, 'Mock success');
      }
    },
    removeDocument: function (query, callback) { callback(true, 'fail'); }
  };
  var plz = require('../app/core.hub')(Tc.validMerchantConfig);
  var db = require('../app/utility.database')(plz);

  describe('plz.add.cartItem()', function () {

    before(function (done) {
      plz.create.product(Tc.validProduct, function(){} );

      db.getDatabase(function (error, database) {
        cartCollection = database.collection(collectionName);

        cartCollection.count(function(error, count) {
          if(count >= 1) {
            cartCollection.drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.add.cartItem(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutCustomerId = {
          productName: Tc.validProduct.name
        };
        plz.add.cartItem(requestWithoutCustomerId, function (error) {
          error.should.be.true;
          var requestWithoutProductName = {
            customerId: Tc.validCustomerId
          };
          plz.add.cartItem(requestWithoutProductName, function (error) {
            error.should.be.true;
            done();
          });
        });
      });
    });

    it('should return error if product does not exist', function(done) {
      var request = {
        customerId: Tc.validCustomerId,
        productName: 'nonexistant product',
        quantity: 1
      };
      plz.add.cartItem(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should add the product to the cart collection', function(done) {
      var beforeCreateDate = new Date();
      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: 'Acme 16-oz Claw Hammer',
        quantity: 1
      };
      plz.add.cartItem(addRequest, function (error, result) {
        error.should.be.false;
        (result === null).should.be.false;
        cartCollection.count(function(error, count) {
          count.should.equal(1);
          var findOptions = {
            customerId: Tc.validCustomerId,
            productName: addRequest.productName
          };

          cartCollection.findOne(findOptions, function (error, result) {
            (error === null).should.be.true;
            for(var field in addRequest) {
              if(addRequest.hasOwnProperty(field) && field !== "_id") {
                if(typeof result[field] === 'object'){
                  result[field].toString().should.equal(addRequest[field].toString());
                }
                else {
                  result[field].should.equal(addRequest[field]);
                }
              }
            }
            var afterCreateDate = new Date();
            var createDate = new Date(result.createdAt);
            (createDate.getTime() >= beforeCreateDate.getTime()).should.be.true;
            (createDate.getTime() <= afterCreateDate.getTime()).should.be.true;
            done();
          });
        });
      });
    });

    it('should add quantity if already present in collection', function(done) {
      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: 'Acme 16-oz Claw Hammer',
        quantity: 2
      };
      plz.add.cartItem(addRequest, function (error, result) {
        error.should.be.false;
        (result === null).should.be.false;
        addRequest.quantity = 3;
        cartCollection.count(function(error, count) {
          count.should.equal(1);
          plz.add.cartItem(addRequest, function (error, result) {
            error.should.be.false;
            (result === null).should.be.false;
            var findOptions = {
              customerId: Tc.validCustomerId,
              productName: addRequest.productName
            };

            cartCollection.findOne(findOptions, function (error, result) {
              (error === null).should.be.true;
              result.quantity.should.equal(6);
              done();
            });
          });
        });
      });
    });

    it('should callback error if getDocument fails', function(done) {
      require('../app/merchant.cart')(plz, mockDatabase);

      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: 'Acme 16-oz Claw Hammer',
        quantity: 2
      };
      plz.add.cartItem(addRequest, function (error, result) {
        error.should.be.true;
        result.message.should.be.a.String;
        require('../app/merchant.cart')(plz);
        done();
      });
    });

    after(function (done) {
      cartCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.remove.cartItem()', function () {

    before(function (done) {
      plz.create.product(Tc.validProduct, function(){} );

      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: 'Acme 16-oz Claw Hammer',
        quantity: 5
      };
      plz.add.cartItem(addRequest, function (error) {
        error.should.be.false;
        done();
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };
      plz.remove.cartItem(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutCustomerId = {
          productName: Tc.validProduct.name
        };
        plz.remove.cartItem(requestWithoutCustomerId, function (error) {
          error.should.be.true;
          var requestWithoutProductName = {
            customerId: Tc.validCustomerId
          };
          plz.remove.cartItem(requestWithoutProductName, function (error) {
            error.should.be.true;
            done();
          });
        });
      });
    });

    it('should return error if product does not exist', function(done) {
      var request = {
        customerId: Tc.validCustomerId,
        productName: 'nonexistant product',
        quantity: 1
      };
      plz.remove.cartItem(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should decrement quantity if specified in options', function(done) {
      var removeRequest = {
        customerId: Tc.validCustomerId,
        productName: 'Acme 16-oz Claw Hammer',
        quantity: 4
      };
      plz.remove.cartItem(removeRequest, function (error, result) {
        error.should.be.false;
        (result === null).should.be.false;

        var findOptions = {
          customerId: Tc.validCustomerId,
          productName: removeRequest.productName
        };

        cartCollection.findOne(findOptions, function (error, result) {
          (error === null).should.be.true;
          result.quantity.should.equal(1);
          done();
        });
      });
    });

    it('should remove the product from the cart collection', function(done) {
      var removeRequest = {
        customerId: Tc.validCustomerId,
        productName: 'Acme 16-oz Claw Hammer',
      };
      plz.remove.cartItem(removeRequest, function (error, result) {
        error.should.be.false;
        (result === null).should.be.false;

        var findOptions = {
          customerId: Tc.validCustomerId,
          productName: removeRequest.productName
        };

        cartCollection.findOne(findOptions, function (error) {
          (error === null).should.be.true;
          done();
        });
      });
    });

    it('should callback error if getDocument fails', function(done) {
      require('../app/merchant.cart')(plz, mockDatabase);

      var removeRequest = {
        customerId: Tc.validCustomerId,
        productName: 'Acme 16-oz Claw Hammer',
      };
      plz.remove.cartItem(removeRequest, function (error, result) {
        error.should.be.true;
        result.message.should.be.a.String;
        require('../app/merchant.cart')(plz);
        done();
      });
    });

    after(function (done) {
      cartCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.get.cart()', function () {

    before(function (done) {
      plz.create.product(Tc.validProduct, function(){} );
      plz.create.product(Tc.anotherValidProduct, function(){} );

      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: Tc.validProduct.name,
        quantity: 1
      };
      var anotherAddRequest = {
        customerId: Tc.validCustomerId,
        productName: Tc.anotherValidProduct.name,
        quantity: 2
      };
      plz.add.cartItem(addRequest, function (error) {
        error.should.be.false;
        plz.add.cartItem(anotherAddRequest, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };
      plz.get.cart(invalidRequest, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should return the expected array of added cart items', function(done) {
      var request = {
        customerId: Tc.validCustomerId
      };
      plz.get.cart(request, function (error, result) {
        error.should.be.false;
        var cart = result.data;
        cart.length.should.equal(2);
        var productsDictObject = {};
        for(var index in cart) {
          if(cart.hasOwnProperty(index)) {
            cart[index].customerId.should.equal(request.customerId);
            if (cart[index].productName === Tc.validProduct.name ||
                cart[index].productName === Tc.anotherValidProduct.name ) {
              productsDictObject[cart[index].productName] = 1;
            }
          }
		}
        Object.keys(productsDictObject).length.should.equal(2);
        done();
      });
    });

    it('should callback error if getDocument fails', function(done) {
      require('../app/merchant.cart')(plz, mockDatabase);

      var request = {
        customerId: Tc.validCustomerId
      };
      plz.get.cart(request, function (error, result) {
        error.should.be.true;
        result.message.should.be.a.String;
        require('../app/merchant.cart')(plz);
        done();
      });
    });

    after(function (done) {
      cartCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.remove.cart()', function () {

    before(function (done) {
      plz.create.product(Tc.validProduct, function(){} );
      plz.create.product(Tc.anotherValidProduct, function(){} );

      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: Tc.validProduct.name,
        quantity: 1
      };
      var anotherAddRequest = {
        customerId: Tc.validCustomerId,
        productName: Tc.anotherValidProduct.name,
        quantity: 2
      };
      plz.add.cartItem(addRequest, function (error) {
        error.should.be.false;
        plz.add.cartItem(anotherAddRequest, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };
      plz.remove.cart(invalidRequest, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should remove all cart items with customerId', function(done) {
      var request = {
        customerId: Tc.validCustomerId
      };
      plz.remove.cart(request, function (error, result) {
        error.should.be.false;
        (result === null).should.be.false;
        cartCollection.count(function(error, count) {
          count.should.equal(0);
          done();
        });
      });
    });

    it('should not remove items that do not match customerId', function(done) {
      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: Tc.validProduct.name,
        quantity: 1
      };
      plz.add.cartItem(addRequest, function (error) {
        error.should.be.false;
        var request = {
          customerId: 'different customer'
        };
        plz.remove.cart(request, function (error, result) {
          error.should.be.true;
          (result === null).should.be.false;
          cartCollection.count(function(error, count) {
            count.should.equal(1);
            done();
          });
        });
      });
    });

    it('should callback error if removeDocument fails', function(done) {
      require('../app/merchant.cart')(plz, mockDatabase);

      var request = {
        customerId: Tc.validCustomerId
      };
      plz.remove.cart(request, function (error, result) {
        error.should.be.true;
        result.message.should.be.a.String;
        require('../app/merchant.cart')(plz);
        done();
      });
    });

    after(function (done) {
      cartCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.get.cartSubtotal()', function () {

    before(function (done) {
      plz.create.product(Tc.validProduct, function(){} );
      plz.create.product(Tc.anotherValidProduct, function(){} );

      var addRequest = {
        customerId: Tc.validCustomerId,
        productName: Tc.validProduct.name,
        quantity: 1
      };
      var anotherAddRequest = {
        customerId: Tc.validCustomerId,
        productName: Tc.anotherValidProduct.name,
        quantity: 2
      };
      plz.add.cartItem(addRequest, function (error) {
        error.should.be.false;
        plz.add.cartItem(anotherAddRequest, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };
      plz.get.cartSubtotal(invalidRequest, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should return sum of all products in cart', function(done) {
      var request = {
        customerId: Tc.validCustomerId
      };
      var expected = parseFloat(Tc.validProduct.price.replace(/^\$/,''));
      expected += parseFloat(Tc.anotherValidProduct.price.replace(/^\$/,''))*2;
      plz.get.cartSubtotal(request, function (error, result) {
        error.should.be.false;
        result.data.should.equal(expected);
        done();
      });
    });

    it('should return 0 for an empty cart', function(done) {
      var request = {
        customerId: Tc.validCustomerId
      };
      plz.remove.cart(request, function (error) {
        error.should.be.false;
        plz.get.cartSubtotal(request, function (error, result) {
          error.should.be.false;
          result.data.should.equal(0);
          done();
        });
      });
    });

    it('should callback error if removeDocument fails', function(done) {
      require('../app/merchant.cart')(plz, mockDatabase);

      var request = {
        customerId: Tc.validCustomerId
      };
      plz.get.cartSubtotal(request, function (error, result) {
        error.should.be.true;
        result.message.should.be.a.String;
        require('../app/merchant.cart')(plz);
        done();
      });
    });

    after(function (done) {
      cartCollection.drop(function () {
        done();
      });
    });
  });
});
