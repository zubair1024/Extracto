/**
 * Created by zubair on 20-Aug-16.
 */
"use strict";
process.env.NODE_ENV = 'test';


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../bin/www');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Assets', () => {
    beforeEach((done) => {
    //If you want something to be done before you start; all pre-reqs go in here :)
        done()
});

/*
 * Test the /GET assets
 */
describe('/GET assets', () => {
    it('it should GET all the assets', (done) => {
    chai.request(server)
        .get('/assets')
        .end((err, res) => {
        res.should.have.status(200);
    res.body.should.be.a('array');
    res.body.length.should.be.not.eql(0);
    done();
});
});
});

});