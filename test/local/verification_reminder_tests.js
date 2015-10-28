/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var proxyquire = require('proxyquire')
var uuid = require('uuid')

var test = tap.test
var P = require('../../lib/promise')
var mockLog = require('../mocks').mockLog

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')

var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: 'reminder' + Math.random() + '@bar.com',
  emailCode: zeroBuffer16,
  acceptLanguage: 'bg-BG,en-US;q=0.7,ar-BH;q=0.3'
}

var accData = {
  email: ACCOUNT.email,
  uid: ACCOUNT.uid.toString('hex'),
  code: ACCOUNT.emailCode.toString('hex'),
  acceptLanguage: ACCOUNT.acceptLanguage
}

var mockDb = {
  createVerificationReminder: function () {
    return P.resolve()
  }
}

test(
  'creates reminders with valid options and rate',
  function (t) {
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

    var addedTimes = 0
    var thisMockLog = mockLog({
      increment: function (name) {
        if (name === 'reminder.created') {
          addedTimes++
          if (addedTimes === 5) {
            t.end()
          }
        }
      }
    })

    var verificationReminder = proxyquire('../../lib/verification-reminder', moduleMocks)(thisMockLog, mockDb)

    verificationReminder.add(accData)
    verificationReminder.add(accData)
    verificationReminder.add(accData)
    verificationReminder.add(accData)
    verificationReminder.add(accData)
  }
)


test(
  'does not create reminders when rate is 0',
  function (t) {
    var moduleMocks = {
      '../config': {
        'get': function (item) {
          if (item === 'verificationReminders') {
            return {
              rate: 0
            }
          }
        }
      }
    }

    var verificationReminder = proxyquire('../../lib/verification-reminder', moduleMocks)(mockLog, mockDb)
    verificationReminder.add(accData)
      .then(function (result) {
        if (result === false) {
          t.end()
        }
      })
  }
)
