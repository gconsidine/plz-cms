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
  var plz, collectionName, productCollection, Utility, db;

  plz = require('../app/core.hub')(Tc.validMerchantConfig);
  Utility = require('../app/utility.api')(plz);
  db = Utility.db;

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
});
