let gulp = require('gulp')
var uglify = require('gulp-uglify') // 压缩 JS
var autoprefixer = require('gulp-autoprefixer') // 自动为CSS添加前缀
var minifyCss = require('gulp-minify-css') // 压缩 CSS
var htmlmin = require('gulp-htmlmin') // 压缩HTML

var root = 'src' // 当前根目录
var targetDir = 'dist/1.0.5/1.0.5' // 目标生成目录

// CSS添加前缀/压缩
gulp.task ('css', function() {
  return gulp.src(root + '/css/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'Android >= 4.0'],
      cascade: false, // 是否美化属性值 默认：true 像这样：
      // -webkit-transform: rotate(45deg);
      //        transform: rotate(45deg);
      remove: true // 是否去掉不必要的前缀 默认：true
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest(targetDir + '/css'))
})

// js压缩
gulp.task('js-compile', function() {
  return gulp.src(root + '/js/*.js')
    .pipe(uglify({
      output: {
        ascii_only: true
      }
    }))
    .pipe(gulp.dest(targetDir + '/js'))
})

// 复制所有图片
gulp.task('image', function() {
  return gulp.src(root + '/images/**/*')
    .pipe(gulp.dest(targetDir + '/images'))
})

// Bootstrap
gulp.task('todcBootstrap', function() {
  return gulp.src(root + '/todcBootstrap/**/*')
    .pipe(gulp.dest(targetDir + '/todcBootstrap'))
})

// 复制manifest.json文件
gulp.task('main-file', function() {
  return gulp.src(root + '/manifest.json')
    .pipe(gulp.dest(targetDir))
})

// 复制js下的json文件
gulp.task('json', ['js-compile'], function() {
  return gulp.src(root + '/js/*.json')
    .pipe(gulp.dest(targetDir + '/js'))
})

// 复制并压缩HTML
gulp.task('html', function() {
  var options = {
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: true,
    minifyCSS: true
  }
  gulp.src(root + '/*.html')
    .pipe(htmlmin(options))
    .pipe(gulp.dest(targetDir))
})

gulp.task('build', ['main-file', 'image', 'json', 'todcBootstrap', 'css', 'html'])
