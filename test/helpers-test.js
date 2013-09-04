/*jshint globalstrict:true, devel:true */
/*global require, module, exports, process, __dirname, describe, before, after, it, expect */
"use strict";

var buster       = require('buster'),
    XlsxTemplate = require('../lib');

buster.spec.expose();
buster.testRunner.timeout = 500;

describe("Helpers", function() {
    
    before(function(done) {
        done();
    });

    describe('stringIndex', function() {

        it("adds new strings to the index if required", function() {
            var t = new XlsxTemplate();
            expect(t.stringIndex("foo")).toEqual(0);
            expect(t.stringIndex("bar")).toEqual(1);
            expect(t.stringIndex("foo")).toEqual(0);
            expect(t.stringIndex("baz")).toEqual(2);
        });

    });

    describe('replaceString', function() {

        it("adds new string if old string not found", function() {
            var t = new XlsxTemplate();
            
            expect(t.replaceString("foo", "bar")).toEqual(0);
            expect(t.sharedStrings).toEqual(["bar"]);
            expect(t.sharedStringsLookup).toEqual({"bar": 0});
        });

        it("replaces strings if found", function() {
            var t = new XlsxTemplate();
            
            t.addSharedString("foo");
            t.addSharedString("baz");

            expect(t.replaceString("foo", "bar")).toEqual(0);
            expect(t.sharedStrings).toEqual(["bar", "baz"]);
            expect(t.sharedStringsLookup).toEqual({"bar": 0, "baz": 1});
        });

    });

    describe('extractPlaceholders', function() {

        it("can extract simple placeholders", function() {
            var t = new XlsxTemplate();
            
            expect(t.extractPlaceholders("${foo}")).toEqual([{
                full: true,
                key: undefined,
                name: "foo",
                placeholder: "${foo}",
                type: "normal"
            }]);
        });

        it("can extract simple placeholders inside strings", function() {
            var t = new XlsxTemplate();
            
            expect(t.extractPlaceholders("A string ${foo} bar")).toEqual([{
                full: false,
                key: undefined,
                name: "foo",
                placeholder: "${foo}",
                type: "normal"
            }]);
        });

        it("can extract multiple placeholders from one string", function() {
            var t = new XlsxTemplate();
            
            expect(t.extractPlaceholders("${foo} ${bar}")).toEqual([{
                full: false,
                key: undefined,
                name: "foo",
                placeholder: "${foo}",
                type: "normal"
            }, {
                full: false,
                key: undefined,
                name: "bar",
                placeholder: "${bar}",
                type: "normal"
            }]);
        });

        it("can extract placeholders with keys", function() {
            var t = new XlsxTemplate();
            
            expect(t.extractPlaceholders("${foo.bar}")).toEqual([{
                full: true,
                key: "bar",
                name: "foo",
                placeholder: "${foo.bar}",
                type: "normal"
            }]);
        });

        it("can extract placeholders with types", function() {
            var t = new XlsxTemplate();
            
            expect(t.extractPlaceholders("${table:foo}")).toEqual([{
                full: true,
                key: undefined,
                name: "foo",
                placeholder: "${table:foo}",
                type: "table"
            }]);
        });

        it("can extract placeholders with types and keys", function() {
            var t = new XlsxTemplate();
            
            expect(t.extractPlaceholders("${table:foo.bar}")).toEqual([{
                full: true,
                key: "bar",
                name: "foo",
                placeholder: "${table:foo.bar}",
                type: "table"
            }]);
        });

        it("can handle strings with no placeholders", function() {
            var t = new XlsxTemplate();
            
            expect(t.extractPlaceholders("A string")).toEqual([]);
        });

    });

    describe('splitRef', function() {

        it("splits single digit and letter values", function() {
            var t = new XlsxTemplate();
            expect(t.splitRef("A1")).toEqual({col: "A", row: 1});
        });

        it("splits multiple digit and letter values", function() {
            var t = new XlsxTemplate();
            expect(t.splitRef("AB12")).toEqual({col: "AB", row: 12});
        });

    });

    describe('joinRef', function() {

        it("joins single digit and letter values", function() {
            var t = new XlsxTemplate();
            expect(t.joinRef({col: "A", row: 1})).toEqual("A1");
        });

        it("joins multiple digit and letter values", function() {
            var t = new XlsxTemplate();
            expect(t.joinRef({col: "AB", row: 12})).toEqual("AB12");
        });

    });

    describe('nexCol', function() {

        it("increments single columns", function() {
            var t = new XlsxTemplate();
            
            expect(t.nextCol("A1")).toEqual("B1");
            expect(t.nextCol("B1")).toEqual("C1");
        });

        it("maintains row index", function() {
            var t = new XlsxTemplate();
            
            expect(t.nextCol("A99")).toEqual("B99");
            expect(t.nextCol("B11231")).toEqual("C11231");
        });

        it("captialises letters", function() {
            var t = new XlsxTemplate();

            expect(t.nextCol("a1")).toEqual("B1");
            expect(t.nextCol("b1")).toEqual("C1");
        });
        
        it("increments the last letter of double columns", function() {
            var t = new XlsxTemplate();

            expect(t.nextCol("AA12")).toEqual("AB12");
        });

        it("rolls over from Z to A and increments the preceding letter", function() {
            var t = new XlsxTemplate();

            expect(t.nextCol("AZ12")).toEqual("BA12");
        });

        it("rolls over from Z to A and adds a new letter if required", function() {
            var t = new XlsxTemplate();

            expect(t.nextCol("Z12")).toEqual("AA12");
            expect(t.nextCol("ZZ12")).toEqual("AAA12");
        });

    });

    describe('nexRow', function() {

        it("increments single digit rows", function() {
            var t = new XlsxTemplate();
            
            expect(t.nextRow("A1")).toEqual("A2");
            expect(t.nextRow("B1")).toEqual("B2");
            expect(t.nextRow("AZ2")).toEqual("AZ3");
        });

        it("captialises letters", function() {
            var t = new XlsxTemplate();

            expect(t.nextRow("a1")).toEqual("A2");
            expect(t.nextRow("b1")).toEqual("B2");
        });
        
        it("increments multi digit rows", function() {
            var t = new XlsxTemplate();

            expect(t.nextRow("A12")).toEqual("A13");
            expect(t.nextRow("AZ12")).toEqual("AZ13");
            expect(t.nextRow("A123")).toEqual("A124");
        });

    });

    describe('stringify', function() {

        it("can stringify dates", function() {
            var t = new XlsxTemplate();
            
            expect(t.stringify(new Date("2013-01-01"))).toEqual("2013-01-01T00:00:00.000Z");
        });

        it("can stringify numbers", function() {
            var t = new XlsxTemplate();
            
            expect(t.stringify(12)).toEqual("12");
            expect(t.stringify(12.3)).toEqual("12.3");
        });

        it("can stringify booleans", function() {
            var t = new XlsxTemplate();
            
            expect(t.stringify(true)).toEqual("1");
            expect(t.stringify(false)).toEqual("0");
        });

        it("can stringify strings", function() {
            var t = new XlsxTemplate();
            
            expect(t.stringify("foo")).toEqual("foo");
        });

    });

});