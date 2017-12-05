'use strict';

  const gulp = require('gulp'),
        sass = require('gulp-sass'),
      inject = require('gulp-inject'),
      uglify = require('gulp-uglify'),
      minify = require('gulp-clean-css'),
        util = require('gulp-util'),
      concat = require('gulp-concat'),
 spritesmith = require('gulp.spritesmith'),
   svgSprite = require('gulp-svg-sprite')

require("../../config/settings")

gulp.task('sprite', () => {
  // var spriteData = gulp.src('images/*.png').pipe(spritesmith({
  //   imgName: 'sprite.png',
  //   cssName: 'sprite.css'
  // }));

  gulp.src('**/*.svg', {cwd: 'lib/assets/images'})
    	.pipe(svgSprite({
      	mode: {
      		css: {		// Activate the «css» mode
            dest: ".",
      			render: {
      				css: true	// Activate CSS output (with default options)
      			}
      		}
      	}
      }))
    	.pipe(gulp.dest(`${__dirname}/../../public/styles`));

  // return spriteData.pipe(gulp.dest(`${__dirname}/../../public/images`));
})
