/*jshint globalstrict:true, devel:true */
/*global require, module, exports, process, __dirname, describe, before, after, it, expect */
"use strict";

var buster       = require('buster'),
    XlsxTemplate = require('../lib'),
    fs           = require('fs'),
    path         = require('path'),
    zip          = require('node-zip');

buster.spec.expose();
buster.testRunner.timeout = 500;

describe("CRUD operations", function() {
    
    before(function(done) {
        done();
    });

    describe('XlsxTemplate', function() {

        it("can load data", function(done) {
            
            fs.readFile(path.join(__dirname, 'templates', 't1.xlsx'), function(err, data) {
                expect(err).toBeNull();

                var t = new XlsxTemplate(data);
                expect(t.sharedStrings).toEqual([
                    "Name", "Role", "Plan table", "${table:planData.name}",
                    "${table:planData.role}", "${table:planData.days}",
                    "${dates}", "${revision}",
                    "Extracted on ${extractDate}"
                ]);

                done();
            });

        });

        it("can write changed shared strings", function(done) {
            
            fs.readFile(path.join(__dirname, 'templates', 't1.xlsx'), function(err, data) {
                expect(err).toBeNull();

                var t = new XlsxTemplate(data);
                
                t.replaceString("Plan table", "The plan");

                t.writeSharedStrings();
                
                var text = t.archive.file("xl/sharedStrings.xml").asText();
                expect(text).not.toMatch("<si><t>Plan table</t></si>");
                expect(text).toMatch("<si><t>The plan</t></si>");

                done();
            });

        });

        it("can substitute values and write a file", function(done) {
            
            fs.readFile(path.join(__dirname, 'templates', 't1.xlsx'), function(err, data) {
                expect(err).toBeNull();

                var t = new XlsxTemplate(data);
                
                t.substitute(1, {
                    extractDate: new Date("2013-01-02"),
                    revision: 10,
                    dates: [new Date("2013-01-01"), new Date("2013-01-02"), new Date("2013-01-03")],
                    planData: [
                        {
                            name: "John Smith",
                            role: "Developer",
                            days: [8, 8, 4]
                        }, {
                            name: "James Smith",
                            role: "Analyst",
                            days: [4, 4,4 ]
                        }
                    ]
                });

                // TODO: Test file contents

                var newData = t.generate();

                // XXX: Use a proper test
                // fs.writeFileSync('test.xlsx', newData, 'binary');

                done();
            });

        });



    });

});