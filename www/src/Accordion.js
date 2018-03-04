import React, { Component } from 'react';

export default class Accordion extends Component {
  render() {
    const { children, header } = this.props
    return (
      <details className="accordion" open>
        <summary className="accordion-header">
          <span className="accordion-arrow">
          <i className="icon icon-arrow-right mr-1"/>
          </span>
          { header }
        </summary>
        <div className="accordion-body">
          { children }
        </div>
      </details>
    )
  }
}