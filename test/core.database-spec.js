(function () {
  'use strict';

  require('should');
  
  var plz = {
    config: {
      database: {
        default: {
          uri: process.env.PLZ_DB_DEFAULT + '/test'
        }
      }
    }
  };

  require('../app/core.database.js')(plz);

  describe('core.database | Public API', function () {
    describe('plz.get.database()', function () {
      it('should get an active database connection', function (done) {
        plz.get.database(function (error, database) {
          error.should.be.false;
          (typeof database === 'object').should.be.true;
          
          done();
        });
      });
    });
  });

}());
