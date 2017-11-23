'use strict';

  const gulp = require('gulp'),
        sass = require('gulp-sass'),
      inject = require('gulp-inject'),
autoprefixer = require("gulp-autoprefixer"),
      uglify = require('gulp-uglify'),
      minify = require('gulp-clean-css'),
        util = require('gulp-util'),
      concat = require('gulp-concat'),
     include = require("gulp-include"),
         rev = require('gulp-rev'),
       async = require('async'),
{ isProduction } = require("../../utilities")

require("../../config/initializers/global")

gulp.task('sass', () => {
  async.series([
    (next) => {
      gulp.src(`${__dirname}/../../assets/styles/index.scss`)
        .pipe(include())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat("compose.css"))
        .pipe(gulp.dest(`${__dirname}/../../public/styles`))
        .on('end', () => next())
    },

    (next) => {
      gulp.src([`${__dirname}/../../public/styles/compose.css`, `${__dirname}/../../public/styles/sprite.css`])
          .pipe(concat("bundle.css"))
          .pipe(isProduction() ? rev() : util.noop())
          .pipe(isProduction() ? minify() : util.noop())
          .pipe(autoprefixer({
      			browsers: ['last 2 versions'],
      			cascade: false
      		}))
          .pipe(gulp.dest(`${__dirname}/../../public/styles`))
          .on('end', () => next())
    },

    (next) => {
      gulp.src(`${__dirname}/../../views/layout/default.ejs`)
        .pipe(inject(gulp.src(`${__dirname}/../../public/styles/bundle.css`, {read: false}), {
          ignorePath: 'public',
          addPrefix: BASE_NAME
        }))
        .pipe(gulp.dest(`${__dirname}/../../views/layout`))
        .on('end', () => next())
    }
  ], (err, result) => {
  })
})

gulp.task('sass:watch', () => {
  gulp.watch(`${__dirname}/../../assets/styles/**/*.scss`, ['sass']);
})
