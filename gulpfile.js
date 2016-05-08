var gulp = require('gulp');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var es = require('event-stream');
var runSequence = require('run-sequence');

gulp.task('clean', function() {
  return gulp.src('public').pipe(clean());
});

gulp.task('jshint', function() {
  return gulp.src('src/js/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
  return es.merge([
    gulp.src([
      'lib/angular/angular.min.js', 
      'lib/angular-route/angular-route.min.js', 
      'lib/angular-messages/angular-messages.min.js'
    ]), 
    gulp.src(['src/js/*.js'])
    .pipe(concat('scripts.js'))
    .pipe(uglify())
  ])
  .pipe(concat('all.min.js'))
  .pipe(gulp.dest('public/js'));
});

gulp.task('htmlmin', function() {
  return gulp.src('src/html/index.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('public/'))
});

gulp.task('cssmin', function() {
  return es.merge([
    gulp.src([
      'lib/bootstrap/dist/css/bootstrap.min.css' 
    ]), 
    gulp.src(['src/css/*.css'])
    .pipe(concat('style.css'))
    .pipe(cleanCSS())
  ])
  .pipe(concat('all.min.css'))
  .pipe(gulp.dest('public/css'));
});

gulp.task('default', function(end) {
  return runSequence(
    'clean', 
    ['jshint', 'uglify', 'htmlmin', 'cssmin'],
    end);
});


