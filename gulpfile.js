var gulp = require('gulp');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var runSequence = require('run-sequence');

gulp.task('clean', function() {
  return gulp.src('public').pipe(clean());
});

gulp.task('jshint', function() {
  return gulp.src(['src/js/*.js', 'index.js', 'src/api/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('jslibs', function() {
  return gulp.src([
    'lib/angular/angular.min.js', 
    'lib/angular-route/angular-route.min.js', 
    'lib/angular-messages/angular-messages.min.js',
    'lib/please-wait/build/please-wait.min.js'
  ])
  .pipe(gulp.dest("public/js"));
});

gulp.task('uglify', function() {
  return gulp.src(['src/js/*.js'])
  .pipe(concat('all-scripts.min.js'))
  .pipe(uglify({compress: {sequences:false}, mangle: false}))
  .pipe(gulp.dest('public/js'));
});

gulp.task('htmlmin', function() {
  return gulp.src(['src/html/*.html', '!src/html/index.html'])
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('public/html/'));
});

gulp.task('htmlmin-index', function() {
  return gulp.src('src/html/index.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('public/'));
});

gulp.task('csslibs', function() {
  return gulp.src([
    'lib/bootstrap/dist/css/bootstrap.min.css',
    'lib/please-wait/build/please-wait.css',
    'lib/SpinKit/css/spinners/9-cube-grid.css'  
  ])
  .pipe(gulp.dest("public/css"));
});

gulp.task('cssmin', function() {
  return gulp.src(['src/css/*.css'])
  .pipe(concat('all-style.min.css'))
  .pipe(cleanCSS())
  .pipe(gulp.dest('public/css'))
});

gulp.task('img', function() {
  return gulp.src(['src/img/*'])
  .pipe(gulp.dest("public/img"));
});

gulp.task('default', function(end) {
  return runSequence(
    'clean', 
    ['jshint', 'jslibs', 'uglify', 'htmlmin', 'htmlmin-index', 'csslibs', 'cssmin', 'img'],
    end);
});
