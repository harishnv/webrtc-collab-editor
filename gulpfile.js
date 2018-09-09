var gulp  = require('gulp');
var gutil = require('gulp-util');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

gulp.task('html', function() {
     gulp.src(['index.html'])
        .pipe(gulp.dest("./dist"))
        .pipe(browserSync.stream());
});
gulp.task('browserSync', function() {
   browserSync.init({
      server: {
         baseDir: './dist/'
      },
   })
})

gulp.task('default', ['browserSync','js','styles',], function() {
   
   
   gulp.watch("*.html").on("change", reload);
});