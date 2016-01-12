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
  cname: 'CNAME',
  html: 'index.html',
  readme: 'README.md',
  scripts: ['js/*.js', '!js/templates.js'],
  styles: 'css/*.css',
  views: 'view/*.html',
  buildRoot: 'dist',
  buildScripts: 'dist/js',
  buildStyles: 'dist/css',
  buildHtml: 'dist/index.html',
  buildCname: 'dist/CNAME',
  buildReadme: 'dist/README.md'
};

gulp.task('clean', function() {
  return del([paths.buildRoot]);
});

gulp.task('cname', ['clean'], function () {
  return gulp.src(paths.cname)
  .pipe(rename(paths.buildCname))
  .pipe(gulp.dest('.'));
});

gulp.task('readme', ['clean'], function () {
  return gulp.src(paths.readme)
  .pipe(rename(paths.buildReadme))
  .pipe(gulp.dest('.'));
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
      'css': '/css/all.min.css?v='+now,
      'js': ['/js/templates.js?v='+now, '/js/all.min.js?v='+now],
      'weinre': ''
    }))
    .pipe(rename(paths.buildHtml))
    .pipe(gulp.dest('.'));
});

gulp.task('deploy', ['temp', 'cname', 'readme', 'scripts', 'styles', 'html'], function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

gulp.task('default', ['temp', 'cname', 'readme', 'scripts', 'styles', 'html', 'deploy']);
