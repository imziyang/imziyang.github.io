var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var templateCache = require('gulp-angular-templatecache');
var htmlreplace = require('gulp-html-replace');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var del = require('del');

var paths = {
  html: 'index.html',
  scripts: ['js/*.js', '!js/templates.js'],
  styles: 'css/*.css',
  views: 'view/*.html',
  buildRoot: 'dist',
  buildScripts: 'dist/js',
  buildStyles: 'dist/css',
  buildHtml: 'dist/index.html'
};

gulp.task('clean', function() {
  return del([paths.buildRoot]);
});

gulp.task('temp', ['clean'], function() {
  return gulp.src(paths.views)
    .pipe(templateCache({standalone: true}))
    .pipe(gulp.dest(paths.buildScripts));
});

gulp.task('scripts', ['clean'], function() {
  return gulp.src(paths.scripts)
    .pipe(replace(/view\/(\S+\.html)(\?v=\d+)?/g, '$1'))
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest(paths.buildScripts));
});

gulp.task('styles', ['clean'], function() {
  return gulp.src(paths.styles)
    .pipe(minifyCss())
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest(paths.buildStyles));
});

gulp.task('html', ['clean'], function() {
  var now = new Date().getTime();
  return gulp.src(paths.html)
    .pipe(htmlreplace({
      'css': '/'+paths.buildStyles+'/all.min.css?v='+now,
      'js': ['/'+paths.buildScripts+'/templates.js?v='+now, '/'+paths.buildScripts+'/all.min.js?v='+now],
      'weinre': ''
    }))
    .pipe(rename(paths.buildHtml))
    .pipe(gulp.dest('.'));
});

gulp.task('deploy', ['temp', 'scripts', 'styles', 'html'], function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

gulp.task('default', ['temp', 'scripts', 'styles', 'html', 'deploy']);
