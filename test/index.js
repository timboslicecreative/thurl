const Thurl = require('../lib/index.js');
const crypto = require('crypto');
const assert = require('assert');

describe('Thurl', function () {

    describe('Thurl Module', function () {
        it('can be initiated through the module request', function () {
            const thurl = new (require('../lib/index.js'))()
            assert.equal(typeof (thurl.build), "function");
        });
    });

    describe('Thurl Class: new Thurl(key,url)', function () {
        it('should have a build function', function () {
            const thurl = new Thurl('', '');
            assert.equal(typeof (thurl.build), "function");
        });
    });

    describe('Build Adjustments: thurl.buildAdjustments(adjustments)', function () {
        const thurl = new Thurl('', '');

        it('should return a empty string with no adjustments', function () {
            assert.equal(thurl.buildAdjustments(), "");
        });

        it('should return a empty string with empty adjustments', function () {
            assert.equal(thurl.buildAdjustments({}), "");
        });

        it('should build trim into url', function () {
            assert.equal(thurl.buildAdjustments({trim: true}), "trim/");
        });

        it('should build crop into url', function () {
            assert.equal(thurl.buildAdjustments({crop: {left: 1, top: 2, right: 3, bottom: 4}}), "1x2:3x4/");
        });

        it('should build fit into url', function () {
            assert.equal(thurl.buildAdjustments({fit: 'fit-in'}), "fit-in/");
        });

        it('should build height into url', function () {
            assert.equal(thurl.buildAdjustments({height: 100}), "x100/");
        });

        it('should build width into url', function () {
            assert.equal(thurl.buildAdjustments({width: 200}), "200x/");
        });

        it('should build width and height into url', function () {
            assert.equal(thurl.buildAdjustments({width: 200, height: 100}), "200x100/");
        });

        it('should build halign into url', function () {
            assert.equal(thurl.buildAdjustments({halign: 'left'}), "left/");
        });

        it('should build valign into url', function () {
            assert.equal(thurl.buildAdjustments({valign: 'top'}), "top/");
        });

        it('should build halign and valign into url', function () {
            assert.equal(thurl.buildAdjustments({halign: 'left', valign: 'top'}), "left/top/");
        });

        it('should build smart into url', function () {
            assert.equal(thurl.buildAdjustments({smart: true}), "smart/");
        });

        it('should build a filter into url as string or array', function () {
            assert.equal(thurl.buildAdjustments({blur: '3,2'}), "filters:blur(3,2)/");
            assert.equal(thurl.buildAdjustments({blur: [3, 2]}), "filters:blur(3,2)/");
        });

        it('should build complicated filters into url', function () {
            assert.equal(
                thurl.buildAdjustments({watermark: ['http:/www.abc.com/img.png', -10, -11, 15, 25, 20]}),
                "filters:watermark(http:/www.abc.com/img.png,-10,-11,15,25,20)/");
            assert.equal(
                thurl.buildAdjustments({watermark: 'http:/www.abc.com/img.png, -10, -11, 15, 25, 20'}),
                "filters:watermark(http:/www.abc.com/img.png,-10,-11,15,25,20)/");
        });

        it('should build multiple filters into url', function () {
            assert.equal(
                thurl.buildAdjustments({blur: [3, 2], grayscale: '', brightness: -100}),
                "filters:blur(3,2):grayscale():brightness(-100)/");
        });
    });


    describe('Build Insecure', function () {
        const thurl = new Thurl('http://thumbor.com');

        it('should build a unsafe url', function () {
            assert.equal(thurl.build('image.jpg'), "http://thumbor.com/unsafe/image.jpg");
        });

        it('should build an unsafe url with adjustments', function () {
            assert.equal(thurl.build('image.jpg', {
                width: 200,
                height: 100
            }), "http://thumbor.com/unsafe/200x100/image.jpg");
        });

        it('should build an unsafe url with complicated adjustments', function () {
            assert.equal(thurl.build('image.jpg', {
                crop: {left: 1, top: 2, right: 3, bottom: 4},
                width: 200, height: 100,
                blur: [3, 2],
                grayscale: '',
                brightness: '-100'
            }), "http://thumbor.com/unsafe/1x2:3x4/200x100/filters:blur(3,2):grayscale():brightness(-100)/image.jpg");
        });
    });

    describe('Build Secure', function () {
        // hmac was pre-generated for testing
        const thurl = new Thurl('http://thumbor.com', 'abcdefghijklmnopqrstuvwxyz123');


        it('should build a secure url', function () {
            assert.equal(thurl.build('image.jpg'), "http://thumbor.com/VBzHpmdOfP55Gn1WUoiVqbNACxg=/image.jpg");
        });

        it('should build a secure url with adjustments', function () {
            assert.equal(thurl.build('image.jpg', {
                width: 200,
                height: 100
            }), "http://thumbor.com/Sx5oLDLg01zu3dgHkFJQlzBcqcw=/200x100/image.jpg");
        });

        it('should build a secure url with complicated adjustments', function () {
            assert.equal(thurl.build('image.jpg', {
                crop: {left: 1, top: 2, right: 3, bottom: 4},
                width: 200, height: 100,
                blur: [3, 2],
                grayscale: '',
                brightness: '-100'
            }), "http://thumbor.com/aTdK7Q0AL0opoBePUBpm6XAReM8=/1x2:3x4/200x100/filters:blur(3,2):grayscale():brightness(-100)/image.jpg");
        });

    });

});
