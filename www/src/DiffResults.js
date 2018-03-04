import React, { Component } from 'react'
import parseCurl from 'parse-curl'
import deepEqual from 'deep-equal'
import cookies from 'cookie'
import Accordion from './Accordion'

import './DiffResults.css'

function LineDiff({ lhsValue, rhsValue, heading }) {
  if (lhsValue === rhsValue) {
    return null
  }
  let contentLeft, contentRight

  if (typeof lhsValue === 'undefined' || lhsValue === null) {
    contentLeft = '—'
    contentRight = (
      <div className="result-added">
        { rhsValue }
      </div>
    )
  } else if (typeof rhsValue === 'undefined' || rhsValue === null) {
    contentLeft = (
      <div className="result-added">
        { lhsValue }
      </div>
    )
    contentRight = '—'
  } else {
    contentLeft = (
      <div className="result-modified">
        { lhsValue }
      </div>
    )
    contentRight = (
      <div className="result-modified">
        { rhsValue }
      </div>
    )
  }

  return (
    <div className="columns result-line">
      { heading && (
        <h6 className="column col-12 result-line-heading"> { heading } </h6>
      ) }
      <div className="column col-6 result-lhs">
        { contentLeft }
      </div>
      <div className="column col-6 result-rhs">
        { contentRight }
      </div>
    </div>
  )
}

export default class DiffResults extends Component {
  state = {
    resultDiff: {},
    parsedCallA: {},
    parsedCallB: {},
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.curlCallA &&
      nextProps.curlCallB && (
        this.props.curlCallA !== nextProps.curlCallA ||
        this.props.curlCallB !== nextProps.curlCallB
      )
    ) {
      const parsedA = parseCurl(nextProps.curlCallA)
      const parsedB = parseCurl(nextProps.curlCallB)

      this.setState({
        parsedCallA: parsedA,
        parsedCallB: parsedB,
      })
    }
  }

  render() {
    const { withRef, curlCallA, curlCallB } = this.props
    const { parsedCallA, parsedCallB } = this.state

    if (!curlCallA || !curlCallB) {
      return null
    }

    return (
      <div ref={ withRef } className="results-container">
        <h4 className="results-heading"> Differences </h4>
        { deepEqual(parsedCallA, parsedCallB) && (
          <p className="results-same-text">
            potayto, potahto.
            It's all the same.
          </p>
        ) }
        <AccordionMethod
          lhsMethod={ parsedCallA.method }
          rhsMethod={ parsedCallB.method }
        />
        <AccordionURL
          lhsURL={ parsedCallA.url }
          rhsURL={ parsedCallB.url }
        />
        <AccordionParams
          lhsURL={ parsedCallA.url }
          rhsURL={ parsedCallB.url }
        />
        <AccordionBody
          lhsType={ parsedCallA.header ? parsedCallA.header['Content-Type'] : '' }
          lhsBody={ parsedCallA.body }
          rhsType={ parsedCallB.header ? parsedCallB.header['Content-Type'] : '' }
          rhsBody={ parsedCallB.body }
        />
        <AccordionCookies
          lhsHeaders={ parsedCallA.header }
          rhsHeaders={ parsedCallB.header }
        />
        <AccordionHeaders
          lhsHeaders={ parsedCallA.header }
          rhsHeaders={ parsedCallB.header }
        />
      </div>
    )
  }
}

function AccordionURL({ lhsURL, rhsURL }) {
  if (!lhsURL || !rhsURL) {
    return null
  }

  const urlAParsed = new URL(lhsURL)
  const urlBParsed = new URL(rhsURL)

  if (deepEqual(
      [urlAParsed.protocol, urlAParsed.hostname, urlAParsed.port, urlAParsed.pathname],
      [urlBParsed.protocol, urlBParsed.hostname, urlBParsed.port, urlBParsed.pathname],
    )) {
    return null
  }

  return (
    <Accordion header="URL">
      <LineDiff
        heading="Protocol"
        lhsValue={ urlAParsed.protocol }
        rhsValue={ urlBParsed.protocol }
      />
      <LineDiff
        heading="Hostname"
        lhsValue={ urlAParsed.hostname }
        rhsValue={ urlBParsed.hostname }
      />
      <LineDiff
        heading="Port"
        lhsValue={ urlAParsed.port }
        rhsValue={ urlBParsed.port }
      />
      <LineDiff
        heading="Path"
        lhsValue={ urlAParsed.pathname }
        rhsValue={ urlBParsed.pathname }
      />
    </Accordion>
  )
}

function AccordionBody({ lhsBody, rhsBody, lhsType, rhsType }) {
  if (lhsBody === rhsBody) {
    return null
  }

  const decodeFormBody = (body) =>
    decodeURIComponent(body.replace(/&/g, '\n'))

  const lhsBodyParsed = lhsType === 'application/x-www-form-urlencoded' ?
    decodeFormBody(lhsBody) : lhsBody

  const rhsBodyParsed = rhsType === 'application/x-www-form-urlencoded' ?
    decodeFormBody(rhsBody) : rhsBody

  return (
    <Accordion header="Body">
      <LineDiff
        lhsValue={ lhsBodyParsed }
        rhsValue={ rhsBodyParsed }
      />
    </Accordion>
  )
}

function AccordionParams({ lhsURL, rhsURL }) {
  if (!lhsURL || !rhsURL) {
    return null
  }

  const urlAParsed = new URL(lhsURL)
  const urlBParsed = new URL(rhsURL)

  if (deepEqual(
      [...urlAParsed.searchParams],
      [...urlBParsed.searchParams],
    )) {
    return null
  }

  const paramKeys = new Set([
    ...urlAParsed.searchParams.keys(),
    ...urlBParsed.searchParams.keys(),
  ]);

  return (
    <Accordion header="Params">
      { [...paramKeys].map(paramKey => (
        <LineDiff
          key={ paramKey }
          heading={ paramKey }
          lhsValue={ urlAParsed.searchParams.get(paramKey) }
          rhsValue={ urlBParsed.searchParams.get(paramKey) }
        />
      )) }
    </Accordion>
  )
}


function AccordionMethod({ lhsMethod, rhsMethod }) {
  if (lhsMethod === rhsMethod) {
    return null
  }

  return (
    <Accordion header="Method">
      <div className="columns result-method">
        <div className="column col-6 result-lhs">{ lhsMethod }</div>
        <div className="column col-6 result-rhs">{ rhsMethod }</div>
      </div>
    </Accordion>
  )
}

function AccordionCookies({ lhsHeaders = {}, rhsHeaders = {} }) {
  const lhsCookiesParsed = cookies.parse(lhsHeaders.cookie || '')
  const rhsCookiesParsed = cookies.parse(rhsHeaders.cookie || '')

  const cookieKeys = new Set([
    ...Object.keys(rhsCookiesParsed),
    ...Object.keys(lhsCookiesParsed),
  ]);

  if (deepEqual(lhsCookiesParsed, rhsCookiesParsed)) {
    return null
  }

  return (
    <Accordion header="Cookies">
      { [...cookieKeys].map(cookieKey => (
        <LineDiff
          key={ cookieKey }
          heading={ cookieKey }
          lhsValue={ lhsCookiesParsed[cookieKey] }
          rhsValue={ rhsCookiesParsed[cookieKey] }
        />
      )) }
    </Accordion>
  )
}

function AccordionHeaders({ lhsHeaders = {}, rhsHeaders = {} }) {
  const lhsHeadersFiltered = { ...lhsHeaders }
  const rhsHeadersFiltered = { ...rhsHeaders }
  delete lhsHeadersFiltered.cookie
  delete rhsHeadersFiltered.cookie

  if (deepEqual(lhsHeadersFiltered, rhsHeadersFiltered)) {
    return null
  }

  const headerKeys = new Set([
    ...Object.keys(lhsHeadersFiltered).map(key => key.toLowerCase()),
    ...Object.keys(rhsHeadersFiltered).map(key => key.toLowerCase()),
  ])

  const headerPairs = [...headerKeys]
    .map((headerKey) => ({
      key: headerKey,
      lhsValue: lhsHeaders[headerKey],
      rhsValue: rhsHeaders[headerKey],
    }))

  return (
    <Accordion header="Headers">
      { headerPairs.map(headerPair => (
        <LineDiff
          key={ headerPair.key }
          heading={ headerPair.key }
          lhsValue={ headerPair.lhsValue }
          rhsValue={ headerPair.rhsValue }
        />
      )) }
    </Accordion>
  )
}