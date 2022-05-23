const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const spritesmith = require('gulp.spritesmith');
const rimraf = require('rimraf');
const rename = require("gulp-rename");
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('gulp-autoprefixer');

// Static server
gulp.task('server', function() {
    browserSync.init({
        server: {
            port: 8080,
            baseDir: "build"
        }
    });

    gulp.watch('build/**/*').on('change', browserSync.reload);


});

// Pug compile
gulp.task('templates:compile', function buildHTML(){
    return gulp.src('src/templates/index.pug')
        .pipe(pug({
        pretty: true
        }))
       .pipe(gulp.dest('build'))
});
// Sass compile
gulp.task('styles:compile', function () {
    return gulp.src('src/styles/main.scss')
        .pipe(sourcemaps.init()) // инициализируем создание Source Maps
        .pipe(postcss([autoprefixer]))
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(sourcemaps.write()) // пути для записи SourceMaps - в данном случае карта SourceMaps будет добавлена прям в данный файл main.min.css в самом конце
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest('build/css'));//перемещение скомпилированного файла main.min.css в папку build
});
//Sprite

gulp.task('sprite', function (cb) {
  var spriteData = gulp.src('src/images/icons/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: 'sprite.scss'
  }));
    spriteData.img.pipe(gulp.dest('build/images/'));
    spriteData.css.pipe(gulp.dest('src/styles/global'));
    cb();
});
// Clear build folder
gulp.task('clean', function del(cb) {
    return rimraf('build', cb)
});

// Copy fonts into build folder
gulp.task('copy:fonts', function () {
    return gulp.src('./src/fonts/**/*.*')
        .pipe(gulp.dest('build/fonts'))
});

// Copy images into build folder
gulp.task('copy:images', function () {
    return gulp.src('./src/images/**/*.*')
        .pipe(gulp.dest('build/images'))
});
//Copy
gulp.task('copy', gulp.parallel('copy:images', 'copy:fonts'));

//Watchers
gulp.task('watch', function () {
    gulp.watch('src/templates/**/*.pug',
        gulp.series('templates:compile'));
    gulp.watch('src/styles/**/*.scss',
        gulp.series('styles:compile'));
})
// Default command for terminal - gulp
gulp.task('default', gulp.series(
    'clean',
    gulp.parallel('templates:compile', 'styles:compile', 'sprite', 'copy'),
    gulp.parallel('watch', 'server')
))