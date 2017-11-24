'use strict';

  const gulp = require('gulp'),
        sass = require('gulp-sass'),
      inject = require('gulp-inject'),
      uglify = require('gulp-uglify'),
    composer = require('gulp-uglify/composer'),
      minify = require('gulp-clean-css'),
        util = require('gulp-util'),
      concat = require('gulp-concat'),
     include = require("gulp-include"),
    uglifyEs = require('uglify-es'),
         rev = require('gulp-rev'),
       async = require('async'),
       babel = require('gulp-babel'),
{ isProduction } = require("../../utilities")

require("../../config/initializers/global")

gulp.task('js', (cb) => {
  async.series([
    (next) => {
      gulp.src(`${__dirname}/../../assets/scripts/index.js`)
        .pipe(include())
        .pipe(concat('bundle.js'))
        .pipe(isProduction() ? rev() : util.noop())
        .pipe(isProduction() ? composer(uglifyEs)() : util.noop())
        .pipe(babel({"presets": ["es2015"]}))
        .pipe(gulp.dest(`${__dirname}/../../public/javascripts`))
        .on('end', () => next())
    },

    (next) => {
      gulp
        .src(`${__dirname}/../../views/layout/default.ejs`)
        .pipe(inject(gulp.src(`${__dirname}/../../public/**/bundle.js`, {read: false}), {
          // ignorePath: `${__dirname}/../../public`,
           ignorePath: `lib/public`,
          addPrefix: BASE_NAME
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
