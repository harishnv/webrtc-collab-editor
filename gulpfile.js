var gulp  = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var autoprefix = require('gulp-autoprefixer');
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
// gulp.task('watchhtml', function() {
//    gulp.watch("src/*.html").on("change",'html');
// })


gulp.task('default', ['html','styles','browserSync'], function() {
   
   gulp.watch('src/sass/*.scss',['styles']);
   gulp.watch("src/*.html", ['html',reload]);
   
});