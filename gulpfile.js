var gulp = require('gulp'),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    fs = require("fs"),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    shell = require('gulp-shell'),
    runSequence = require('run-sequence'),
    htmlmin = require('gulp-htmlmin'),
    jsmin = require('gulp-jsmin'),
    replace = require('gulp-replace-task');    

gulp.task('sass', function(){
    return gulp.src('src/assets/scss/main.scss')
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/css'))
});

gulp.task('replace', function () { 
    return gulp.src('src/*.html')
        .pipe(replace({
            patterns: [
                {
                    match: 'inlineCSS',
                    replacement: function (callback) {
                        return fs.readFileSync("assets/css/main.min.css", "utf8", function() {
                            callback();
                        });
                    }
                }
            ]
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./')); 
});

gulp.task('minifycss', ['sass'], function () {
    return gulp.src('assets/css/main.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/css'));
});

gulp.task('minifyjs', function () {
    return gulp.src('src/assets/js/**/*.js')
        .pipe(gulp.dest('assets/js'))
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/js'));
});


gulp.task('images', function(){
    return gulp.src('src/assets/img/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('assets/img'))
});

gulp.task('cleanImages', function(cb) { return del(['assets/img'], cb); });
gulp.task('cleanCSS', function() { 
    return del(['assets/css/*.css']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
}); 

gulp.task('default', function(callback) {
    runSequence('minifycss', 'cleanImages', 'images', 'minifyjs', 'replace' ,callback);
    gulp.watch('src/**/*.html', function() { 
        runSequence('minifycss','replace');
    });
    gulp.watch('src/assets/js/**/*.js', function() {
        runSequence('minifyjs','replace');
    });
    gulp.watch('src/assets/scss/**/*.scss', function() {
        runSequence('minifycss','replace');
    });
    gulp.watch('src/assets/img/**/*.+(png|jpg|jpeg|gif|svg)', function() {
        runSequence('cleanImages', 'images');
    })
});