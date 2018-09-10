var gulp  = require('gulp');
var gutil = require('gulp-util');
var os = require('os');
var nodemon = require('gulp-nodemon')
var open = require('gulp-open');
var sass = require('gulp-sass');

var minifyCSS = require('gulp-minify-css');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;


gulp.task('styles', function() {
    gulp.src('src/sass/**/*.scss')
       .pipe(sass().on('error', sass.logError))
       .pipe(minifyCSS())
	   .pipe(gulp.dest('./dist/css'))
	   .pipe(browserSync.reload({
      stream: true
   }));
});

gulp.task('open', function(){
  gulp.src('dist/index.html')
  .pipe(open());
});

gulp.task('html', function() {
     gulp.src(['src/index.html'])
        .pipe(gulp.dest("./dist"))
        .pipe(browserSync.stream());
});

gulp.task('browserSync', function() {
   browserSync.init({
      server: {
         baseDir: 'dist/'
      },
   })
});

gulp.task('js', function() {
     gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js',
      'node_modules/socket.io-client/dist/socket.io.js','src/js/main.js','src/js/adapter.js','node_modules/codemirror-minified/lib/codemirror.js'])
        .pipe(gulp.dest("./dist/js"))
        .pipe(browserSync.stream());
});


gulp.task('start', function () {
  nodemon({
    script: 'index.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('default', ['html','styles','js','start','open'], function() {
  // gulp.task('default', ['html','styles','js','browserSync'], function() {
   
   gulp.watch('src/sass/*.scss',['styles']);
     gulp.watch('src/js/*.js',['js']);
   gulp.watch("src/*.html", ['html',reload]);
   
});