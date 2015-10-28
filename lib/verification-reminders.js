/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config')
var P = require('./promise')
var reminderConfig = config.get('verificationReminders')

var LOG_REMINDERS_CREATED = 'verification-reminders.created'
var LOG_REMINDERS_ERROR_ADD = 'verification-reminder.add'

module.exports = function (log, db) {
  /**
   * shouldRemind
   *
   * Determines if we should create a reminder for this user to verify their account.
   *
   * @returns {boolean}
   */
  function shouldRemind() {
    // random between 0 and 100, inclusive
    var rand = Math.floor(Math.random() * (100 + 1))
    return rand < reminderConfig.rate
  }
 
  return {
    /**
     * Create a new reminder
     *
     * @param reminderData
     *        {Object} reminder data
     * @promise
     */
    create: function create(reminderData) {
      if (! shouldRemind()) {
        // resolves if not part of the verification roll out
        return P.resolve(false)
      }

      reminderData.type = 'first'
      var firstReminder = db.createVerificationReminder(reminderData)
      reminderData.type = 'second'
      var secondReminder = db.createVerificationReminder(reminderData)

      return Promise.all([firstReminder, secondReminder])
        .then(
          function () {
            log.increment(LOG_REMINDERS_CREATED)
          },
          function (err) {
            log.error({ op: LOG_REMINDERS_ERROR_ADD, err: err })
          }
        )
    }
  }
}
