var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var uglifyCss = require('gulp-minify-css');
// 图片压缩
gulp.task('default', function(){
       gulp.src('images/*')
              .pipe(imagemin({
                progressive: true,
                use: [pngquant()]
              }))
              .pipe(gulp.dest('imagemin-dist'));
      // js 文件压缩和并
      gulp.src(['javascript/lib/jquery.min.js', 'javascript/loadImg.js'])
          .pipe(concat('main.js'))
          .pipe(uglify())
          .pipe(gulp.dest('./dest'));

      gulp.src('style/main.css')
          .pipe(uglifyCss())
          .pipe(gulp.dest('./dest'));    
});
