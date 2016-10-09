import 'babel-polyfill';
import { expect } from 'chai';

global.expect = expect;

process.on('uncaughtException', (err) => { throw err; });
process.on('unhandledRejection', (err) => { throw err; });
