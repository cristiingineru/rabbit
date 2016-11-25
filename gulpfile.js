var gulp = require('gulp');
var run = require('gulp-run');
var del = require('del');
var babel = require('gulp-babel');
var mkdirp = require('mkdirp');
var gulpSequence = require('gulp-sequence');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');

gulp.task('build', gulpSequence(
  'clean',
  'buildAmd',
  'buildCommonJS',
  'buildSystemJS',
  'buildBundle'));

gulp.task('clean', function() {
  del.sync(['build']);
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

gulp.task('buildBundle', function() {
  mkdirp('build/bundle');

  var bundler = browserify('./src/rabbit.js', {
    debug: true,
    require: './src/rabbit.js'
  }).transform(babelify, {
    presets: ['es2015']
  });

  return bundler.bundle()
    .pipe(source('rabbit.js'))
    .pipe(gulp.dest('./build/bundle'));
});

gulp.task('testExamples', function(cb) {
  process.chdir('examples/face');
  return gulp.src('.')
    .pipe(run('npm install'))
    .pipe(run('npm run test'));
});
