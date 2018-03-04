#!/usr/bin/env node
const program = require('caporal');
const parseCurl = require('parse-curl')
const inquirer = require('inquirer')
const diff = require('variable-diff')
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({ pkg }).notify();

program
  .version('0.0.1')
  .description('An interactive utility to compare differences between two curl requests in a human readable format.')
  .option('-i', 'compare curl requests in an interactive mode')
  .action(function () {
    inquirer
      .prompt([
        { type: 'input', name: 'request1', message: 'Enter the first curl call\n' },
        { type: 'input', name: 'request2', message: 'Enter the second curl call\n' },
      ])
      .then((args) => {
        const parsedCurl1 = parseCurl(args.request1)
        const parsedCurl2 = parseCurl(args.request2)
        console.log('\n The diff is: \n')
        console.log(diff(parsedCurl1, parsedCurl2).text)
      })
  });

program.parse(process.argv);