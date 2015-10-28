/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var tap = require('tap')
var test = tap.test
var uuid = require('uuid')
var crypto = require('crypto')
var proxyquire = require('proxyquire')
var log = { trace: console.log, info: console.log }

var config = require('../../config').getProperties()
var TestServer = require('../test_server')
var Token = require('../../lib/tokens')(log)
var DB = require('../../lib/db')(
  config.db.backend,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: 'reminder' + Math.random() + '@bar.com',
  emailCode: zeroBuffer16,
  emailVerified: false,
  verifierVersion: 1,
  verifyHash: zeroBuffer32,
  authSalt: zeroBuffer32,
  kA: zeroBuffer32,
  wrapWrapKb: zeroBuffer32,
  acceptLanguage: 'bg-BG,en-US;q=0.7,ar-BH;q=0.3'
}

var mockLog = require('../mocks').mockLog

var moduleMocks = {
  '../config': {
    'get': function (item) {
      if (item === 'verificationReminders') {
        return {
          rate: 100
        }
      }
    }
  }
}

var dbServer
var dbConn = TestServer.start(config)
  .then(
    function (server) {
      dbServer = server
      return DB.connect(config[config.db.backend])
    }
  )


test(
  'verification reminders create in db',
  function (t) {
    var thisMockLog = mockLog({
      increment: function (name) {
        if (name === 'reminder.created') {
          t.end()
        }
      }
    })

    dbConn.then(function (db) {
      var verificationReminder = proxyquire('../../lib/verification-reminders', moduleMocks)(thisMockLog, db)

      return verificationReminder.create({
        email: ACCOUNT.email,
        uid: ACCOUNT.uid.toString('hex'),
        code: ACCOUNT.emailCode.toString('hex'),
        acceptLanguage: ACCOUNT.acceptLanguage
      }).then(
          function () {
            t.end()
          },
          function () {
            t.fail()
          }
        )
    });
  }
)


test(
  'teardown',
  function (t) {
    return dbConn.then(function(db) {
      return db.close()
    }).then(function() {
      return dbServer.stop()
    }).then(function () {
      t.end()
    })
  }
)
