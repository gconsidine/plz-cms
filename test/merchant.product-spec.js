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

describe('merchant.product | Public API', function () {
  var collectionName, productCollection;

  var plz = require('../app/core.hub')(Tc.validMerchantConfig);
  var db = require('../app/utility.database')(plz);

  describe('plz.create.product()', function () {

    before(function (done) {
      db.getDatabase(function (error, database) {
        collectionName = Tc.validMerchantConfig.merchant.product.collection;
        productCollection = database.collection(collectionName);
        
        productCollection.count(function(error, count) {
          if(count >= 1) {
            productCollection.drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      plz.create.product(Tc.invalidProduct, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should insert a product with required fields present', function(done) {
      plz.create.product(Tc.validProduct, function (error) {
        error.should.be.false;

        productCollection.count(function(error, count) {
          count.should.equal(1);
          var findOptions = {name: Tc.validProduct.name};

          productCollection.findOne(findOptions, function (error, result) {
            for(var field in Tc.validProduct) {
              if(Tc.validProduct.hasOwnProperty(field) && field !== "_id") {
                if(result[field] instanceof Array){
                  var arrayString = result[field].toString();
                  arrayString.should.equal(Tc.validProduct[field].toString());
                }
                else{
                  result[field].should.equal(Tc.validProduct[field]);
                }
              }
            }
            done();
          });
        });
      });
    });

    it('should not insert a product that already exists', function(done) {
      plz.create.product(Tc.validProduct, function (error) {
        error.should.be.true;
        done();
      });
    });

    after(function (done) {
      productCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.get.product()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validMerchantConfig);

      db.getDatabase(function (error, database) {
        collectionName = Tc.validMerchantConfig.merchant.product.collection;
        productCollection = database.collection(collectionName);

        plz.create.product(Tc.validProduct, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.get.product(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should fetch a product using name', function(done) {
      var request = {
        userName: 'chahm',
        name: 'Acme 16-oz Claw Hammer',
      };

      plz.get.product(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        done();
      });
    });

    it('should fetch a product using _id', function(done) {
      plz.create.product(Tc.anotherValidProduct, function (error, result) {
        error.should.be.false;
        var request = {
          _id: result.insertedId
        };
        plz.get.product(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          done();
        });
      });
    });

    it('should fetch multiple products using label', function(done) {
      Tc.anotherValidProduct.name = 'product 3';
      Tc.anotherValidProduct._id = undefined;
      plz.create.product(Tc.anotherValidProduct, function (error) {
        error.should.be.false;
        var request = {
          label: 'tools',
        };
        plz.get.product(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          result.length.should.equal(3);
          done();
        });
      });
    });

    it('should not fetch more products than specified limit', function(done) {
      var request = {
        label: 'tools',
        limit: 2
      };
      plz.get.product(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        result.length.should.equal(request.limit);
        done();
      });
    });

    it('should not fetch previous revisions using label', function(done) {
      var editRequest = {
        userName: 'chahm',
        name: 'Acme 16-oz Claw Hammer',
        modifications: { price: '$10.99' }
      };

      plz.edit.product(editRequest, function (error) {
        error.should.be.false;
        var getRequest = {
          label: 'tools',
        };
        plz.get.product(getRequest, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          result.length.should.equal(3);
          done();
        });
      });
    });

    it('should return error if product does not exist', function(done) {
      var request = {
        userName: 'chahm',
        name: 'nonexistent product',
      };

      plz.get.product(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      productCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.edit.product()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validMerchantConfig);

      db.getDatabase(function (error, database) {
        collectionName = Tc.validMerchantConfig.merchant.product.collection;
        productCollection = database.collection(collectionName);

        plz.create.product(Tc.validProduct, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.edit.product(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutCriteria = {
          userName: 'chahm',
        };
        plz.edit.product(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should modify a product by name with new content', function(done) {
      var editRequest = {
        userName: 'chahm',
        name: 'Acme 16-oz Claw Hammer',
        modifications: { price: '$10.99' }
      };

      plz.edit.product(editRequest, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        var findRequest = {
          userName: 'chahm',
          name: 'Acme 16-oz Claw Hammer',
        };
        productCollection.findOne(findRequest, function (error, result) {
          result.price.should.equal(editRequest.modifications.price);
          done();
        });
      });
    });

    it('should modify a product by id with new content', function(done) {
      plz.create.product(Tc.anotherValidProduct, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.insertedId,
          modifications: { price: '$10.99' }
        };
        plz.edit.product(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          var findRequest = {_id : request._id};
          productCollection.findOne(findRequest, function (error, result) {
            result.price.should.equal(request.modifications.price);
            done();
          });
        });
      });
    });

    it('should return error if product does not exist', function(done) {
      var request = {
        userName: 'chahm',
        name: 'nonexistent product',
      };

      plz.get.product(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      productCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.remove.product()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validMerchantConfig);

      db.getDatabase(function (error, database) {
        collectionName = Tc.validMerchantConfig.merchant.product.collection;
        productCollection = database.collection(collectionName);

        plz.create.product(Tc.validProduct, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var invalidRequest = {
        options: 'invalid options',
      };

      plz.remove.product(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutCriteria = {
          userName: 'chahm',
        };
        plz.remove.product(requestWithoutCriteria, function (error) {
          error.should.be.true;
          done();
        });
      });
    });

    it('should remove a product matching the given name', function(done) {
      var request = {
        userName: 'chahm',
        name: 'Acme 16-oz Claw Hammer'
      };

      plz.remove.product(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        productCollection.count(function(error, count) {
          count.should.equal(0);
          done();
        });
      });
    });

    it('should remove a product matching the given _id', function(done) {
      plz.create.product(Tc.anotherValidProduct, function (error, result) {
        error.should.be.false;
        var request = {
          userName: 'chahm',
          _id: result.insertedId
        };
        plz.remove.product(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;

          productCollection.count(function(error, count) {
            count.should.equal(0);
            done();
          });
        });
      });
    });

    it('should remove all versions of a product if multiple exist', 
    function(done){
      plz.create.product(Tc.validProduct, function (error) {
        error.should.be.false;
        var editRequest = {
          userName: 'chahm',
          name: 'Acme 16-oz Claw Hammer',
          modifications: {price: '$10.99'}
        };
        plz.edit.product(editRequest, function (error) {
          error.should.be.false;
          var removeRequest = {
            userName: 'chahm',
            name: 'Acme 16-oz Claw Hammer'
          };

          plz.remove.product(removeRequest, function (error, result) {
            error.should.be.false;
            result.should.not.be.empty;

            productCollection.count(function(error, count) {
              count.should.equal(0);
              done();
            });
          });
        });
      });
    });

    it('should return error if product does not exist', function(done) {
      var request = {
        userName: 'chahm',
        title: 'nonexistent product',
      };

      plz.remove.product(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      productCollection.drop(function () {
        done();
      });
    });
  });
});
