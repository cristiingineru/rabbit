var gulp = require('gulp');
var exec = require('gulp-exec');
var del = require('del');
var babel = require('gulp-babel');
var mkdirp = require('mkdirp');
var gulpSequence = require('gulp-sequence')

gulp.task('build', gulpSequence(
  'clean',
  'buildAmd',
  'buildCommonJS',
  'buildSystemJS'));

gulp.task('clean', function() {
  del(['build']);
});

gulp.task('buildAmd', function() {
  mkdirp('build');
  return gulp.src('src/*.js')
    .pipe(babel({
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-amd']
    }))
    .pipe(gulp.dest('build/amd'));
});

gulp.task('buildCommonJS', function() {
  mkdirp('build');
  return gulp.src('src/*.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('build/commonjs'));
});

gulp.task('buildSystemJS', function() {
  mkdirp('build');
  return gulp.src('src/*.js')
    .pipe(babel({
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-systemjs']
    }))
    .pipe(gulp.dest('build/systemjs'));
});
