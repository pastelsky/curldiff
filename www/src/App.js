import React, { Component } from 'react';
import TextArea from './TextArea'
import DiffResults from './DiffResults'
import parseCurl from 'parse-curl'
import './App.css';

class App extends Component {
  tempCurlCallA = ''
  tempCurlCallB = ''

  state = {
    curlCallA: '',
    curlCallB: '',
  }

  handleSubmit = () => {
    if (!parseCurl(this.tempCurlCallA) || !parseCurl(this.tempCurlCallB)) {
      alert('Please enter valid curl calls on RHS and the LHS/')
      return
    }

    this.setState({
      curlCallA: this.tempCurlCallA,
      curlCallB: this.tempCurlCallB,
    }, () => {
      this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  render() {

    const { curlCallA, curlCallB } = this.state
    return (
      <div className="app">
        <header>
          <h1>curldi<span className="logo-f">f</span><span className="logo-f">f</span>
            <small className="app-version">
              <span>v</span> 0.0.1
            </small>
          </h1>
        </header>
        <div className="container">
          <div className="columns col-gapless">
            <div className="column col-6">
              <h6 className="textarea-label">First curl</h6>
              <TextArea
                className="textarea--left"
                onChange={ value => (this.tempCurlCallA = value) }
              />
            </div>
            <div className="column col-6">
              <h6 className="textarea-label">Second curl</h6>
              <TextArea
                className="textarea--right"
                onChange={ value => (this.tempCurlCallB = value) }
              />
            </div>
          </div>
          <div className="columns">
            <div className="centered">
              <button
                onClick={ this.handleSubmit }
                className="submit-button btn btn-primary btn-lg"
              >
                Diff
              </button>
            </div>
          </div>
        </div>
        <DiffResults
          curlCallA={ curlCallA }
          curlCallB={ curlCallB }
          withRef={ (dr) => (this.resultsSection = dr) }
        />
      </div>
    );
  }
}

export default App;
