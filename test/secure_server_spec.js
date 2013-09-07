var mqtt = require("mqtt");
var abstractServerTests = require("./abstract_server");

var SECURE_KEY = __dirname + '/secure/tls-key.pem';
var SECURE_CERT = __dirname + '/secure/tls-cert.pem';

var moscaSettings = function() {
  var settings = {
    logger: {
      childOf: globalLogger,
      level: 60
    },
    secure : { 
      port: nextPort(),
      keyPath: SECURE_KEY,
      certPath: SECURE_CERT
    }
  };

  // this is required to make the original server
  // test work
  // TODO refactor abstract test suite to take
  // the port as a parameter
  settings.port = settings.secure.port;

  return settings;
};

describe("mosca.Server - Secure Connection", function() {
  abstractServerTests(moscaSettings, require("./createSecureConnection"));
});

describe("mosca.Server - Secure and non-secure Connection", function() {
  var settings;
  var instance;
  var conn;

  afterEach(function(done) {
    conn.stream.end();
    conn.on("close", function() {
      instance.close(done);
    });
  });

  it("should not allow non-secure connections", function(done) {
    settings = moscaSettings();
    settings.secure.port = nextPort();

    instance = new mosca.Server(settings, function() {
      conn = mqtt.createConnection(settings.port);
      conn.on('error', function(err) {
        done();
      });
    });
  });

  it("should allow non-secure connections", function(done) {
    settings = moscaSettings();
    settings.allowNonSecure = true;
    settings.secure.port = nextPort();

    instance = new mosca.Server(settings, function() {
      conn = mqtt.createConnection(settings.port);
      conn.on('connected', function(err) {
        done();
      });
    });
  });
});