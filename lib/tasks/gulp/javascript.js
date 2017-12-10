'use strict';

  const gulp = require('gulp'),
        sass = require('gulp-sass'),
      inject = require('gulp-inject'),
      uglify = require('gulp-uglify'),
      minify = require('gulp-clean-css'),
        util = require('gulp-util'),
      concat = require('gulp-concat'),
     include = require("gulp-include"),
         rev = require('gulp-rev'),
       async = require('async'),
       babel = require('gulp-babel')

require("../../config/settings")

gulp.task('js', (cb) => {
  async.series([
    (next) => {
      gulp.src(`${__dirname}/../../assets/scripts/index.js`)
        .pipe(include())
        .pipe(concat('bundle.js'))
        .pipe(isProduction ? rev() : util.noop())
        .pipe(babel({"presets": ["es2015"]}))
        .pipe(isProduction ? uglify() : util.noop())
        .pipe(gulp.dest(`${__dirname}/../../public/javascripts`))
        .on('end', () => next())
    },

    (next) => {
      const bundleName = isProduction ? 'bundle-*' : 'bundle'

      gulp
        .src(`${__dirname}/../../views/layout/vue.ejs`)
        .pipe(inject(gulp.src(`${__dirname}/../../public/**/${bundleName}.js`, {read: false}), {
          ignorePath: `lib/public`,
          addPrefix: SETTINGS.path_prefix,
        }))
        .pipe(gulp.dest(`${__dirname}/../../views/layout`))
        .on('end', () => next())
    },
  ], (err, result) => {

  })
});

gulp.task('js:watch', () => {
  gulp.watch(`${__dirname}/../../assets/scripts/**/*.js`, ['js']);
});
