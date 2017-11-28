'use strict';

  const gulp = require('gulp'),
        sass = require('gulp-sass'),
      inject = require('gulp-inject'),
      uglify = require('gulp-uglify'),
      minify = require('gulp-clean-css'),
        util = require('gulp-util'),
      concat = require('gulp-concat'),
 spritesmith = require('gulp.spritesmith'),
   svgSprite = require('gulp-svg-sprite'),
{ isProduction } = require("../../utilities")

gulp.task('sprite', () => {
  var spriteData = gulp.src('images/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));

  // const config = {
  // 	mode: {
  // 		css: {		// Activate the «css» mode
  //       dest: ".",
  // 			render: {
  // 				css: true	// Activate CSS output (with default options)
  // 			}
  // 		}
  // 	}
  // }
  //
  // gulp.src('**/*.svg', {cwd: 'assets/images'})
  //   	.pipe(svgSprite(config))
  //   	.pipe(gulp.dest('public/styles'));

  return spriteData.pipe(gulp.dest('path/to/output/'));
})
