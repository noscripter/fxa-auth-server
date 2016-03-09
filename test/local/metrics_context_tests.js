/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var test = require('../ptaptest')

var metricsContext = require('../../lib/metrics/context')

test(
  'metricsContext interface is correct',
  function (t) {
    t.equal(typeof metricsContext, 'object', 'metricsContext is object')
    t.notEqual(metricsContext, null, 'metricsContext is not null')
    t.equal(Object.keys(metricsContext).length, 2, 'metricsContext has 2 properties')

    t.equal(typeof metricsContext.schema, 'object', 'metricsContext.schema is object')
    t.notEqual(metricsContext.schema, null, 'metricsContext.schema is not null')

    t.equal(typeof metricsContext.add, 'function', 'metricsContext.add is function')
    t.equal(metricsContext.add.length, 2, 'metricsContext.add expects 2 arguments')

    t.end()
  }
)

test(
  'metricsContext.add without metadata',
  function (t) {
    var result = metricsContext.add({})

    t.equal(typeof result, 'object', 'result is object')
    t.notEqual(result, null, 'result is not null')
    t.equal(Object.keys(result).length, 0, 'result is empty')

    t.end()
  }
)

test(
  'metricsContext.add with metadata',
  function (t) {
    var time = Date.now() - 1
    var result = metricsContext.add({}, {
      flowId: 'mock flow id',
      flowBeginTime: time,
      context: 'mock context',
      entrypoint: 'mock entry point',
      migration: 'mock migration',
      service: 'mock service',
      utmCampaign: 'mock utm_campaign',
      utmContent: 'mock utm_content',
      utmMedium: 'mock utm_medium',
      utmSource: 'mock utm_source',
      utmTerm: 'mock utm_term',
      ignore: 'mock ignorable property'
    })

    t.equal(typeof result, 'object', 'result is object')
    t.notEqual(result, null, 'result is not null')
    t.equal(Object.keys(result).length, 12, 'result has 12 properties')
    t.ok(result.time > time, 'result.time seems correct')
    t.equal(result.flow_id, 'mock flow id', 'result.flow_id is correct')
    t.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
    t.ok(result.flow_time < time, 'result.flow_time is less than the current time')
    t.equal(result.context, 'mock context', 'result.context is correct')
    t.equal(result.entrypoint, 'mock entry point', 'result.entry point is correct')
    t.equal(result.migration, 'mock migration', 'result.migration is correct')
    t.equal(result.service, 'mock service', 'result.service is correct')
    t.equal(result.utm_campaign, 'mock utm_campaign', 'result.utm_campaign is correct')
    t.equal(result.utm_content, 'mock utm_content', 'result.utm_content is correct')
    t.equal(result.utm_medium, 'mock utm_medium', 'result.utm_medium is correct')
    t.equal(result.utm_source, 'mock utm_source', 'result.utm_source is correct')
    t.equal(result.utm_term, 'mock utm_term', 'result.utm_term is correct')

    t.end()
  }
)

