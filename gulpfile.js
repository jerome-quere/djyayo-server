/*
 *The MIT License (MIT)
 *
 * Copyright (c) 2015 Jérôme Quéré <contact@jeromequere.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:#
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var gulp = require('gulp'),
    typescript = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    nodemon = require('gulp-nodemon'),
    tsd = require('gulp-tsd'),
    runSequence = require('run-sequence');

var config = {
    ts: {
        entries: ['./src/**/*.ts'],
        watch: ['./src/**/*.ts'],
        output: {
            path: './dist'
        }
    },
    nodemon: {
        entry: "./build/index.js"
    },
    tsd: {
        config: './tsd.json'
    }
};

/**
 *
 */
var debug = false;

/**
 *
 */
gulp.task('ts', function () {
    var s = gulp.src(config.ts.entries);

    if (debug) {
        s = s.pipe(sourcemaps.init());
    }

    s = s.pipe(typescript({
        target: 'ES5',
        module: 'commonjs',
        noImplicitAny: true
    }));

    if (debug) {
        s = s.pipe(sourcemaps.write({
            sourceRoot: __dirname + '/src'
        }));
    }

    s = s.pipe(gulp.dest(config.ts.output.path));

    return s;
});

/**
 *
 */
gulp.task('watch', ['debug'], function () {
    gulp.watch(config.ts.watch, ['ts']);
});

/**
 *
 */
gulp.task('nodemon', ['ts'], function () {
    nodemon({
        script: config.nodemon.entry,
        env: {
            NODE_ENV: 'dev'
        }
    });
});

/**
 *
 */
gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: config.tsd.config
    }, callback);
});

/**
 *
 */
gulp.task('debug', function () {
    debug = true;
});

/**
 *
 */
gulp.task('default', function (callback) {
    runSequence('tsd', 'ts', callback);
});

/**
 *
 */
gulp.task('dev', ['debug', 'ts', 'watch', 'nodemon']);