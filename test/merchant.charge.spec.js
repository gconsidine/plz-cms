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

describe('merchant.charge | Public API', function () {
  var plz, collectionName, chargeCollection, Utility, db;

  plz = require('../app/core.hub')(Tc.validMerchantConfig);
  Utility = require('../app/utility.api')(plz);
  db = Utility.db;
  collectionName = Tc.validMerchantConfig.merchant.charge.collection;

  describe('plz.create.charge()', function () {

    before(function (done) {
      db.getDatabase(function (error, database) {
        chargeCollection = database.collection(collectionName);

        chargeCollection.count(function(error, count) {
          if(count >= 1) {
            chargeCollection.drop(function () {
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

      plz.create.charge(invalidRequest, function (error) {
        error.should.be.true;
        var requestWithoutAmount = {
          currency: 'usd',
          card: Tc.validCard,
          description: 'test request without amount'
        };
        plz.create.charge(requestWithoutAmount, function (error) {
          error.should.be.true;
          var requestWithoutCard = {
            amount: 100,
            currency: 'usd',
            description: 'test request without card'
          };
          plz.create.charge(requestWithoutCard, function (error) {
            error.should.be.true;
            done();
          });
        });
      });
    });

    it('should add the charge result to the charge collection', function(done) {
      var request = {
        amount: 100,
        currency: 'usd',
        card: Tc.validCard,
        description: 'test request without amount'
      };
      plz.create.charge(request, function (error, result) {
        error.should.be.false;
        (result === null).should.be.false;
        chargeCollection.count(function(error, count) {
          count.should.equal(1);
          done();
        });
      });
    });
    after(function (done) {
      chargeCollection.drop(function () {
        done();
      });
    });
  });

});
