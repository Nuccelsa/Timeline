var gulp = require('gulp');

// Variable de plugins
var sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    autoprefix = require('gulp-autoprefixer'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    comb = require('gulp-csscomb'),
    beautify = require('gulp-cssbeautify'),
    browserSync = require('browser-sync');
    runSequence = require('run-sequence');

// Variables de chemins
var source = './src';       // dossier de dev
var destination = './dist'; // dossier de prod

// Gestion des msg d'erreur
var plumberErrorHandler = {
    errorHandler: function (err) {
        notify.onError({
            title: "Gulp error in " + err.plugin,
            message: err.toString()
        })(err);
    }
};

// css
gulp.task('style', function () {
    return gulp.src(source + '/scss/styles.scss')
        .pipe(plumber(plumberErrorHandler.errorHandler)) // messages d'erreur
        .pipe(sass.sync({
            outputStyle: 'expanded'
        }).on('error', sass.logError))                   // compiler
        .pipe(comb())                                    // ordonner propriétés css
        .pipe(beautify({indent: '  '}))                  // nettoyer les espaces superflus
        .pipe(autoprefix())                              // générer les préfixes
        .pipe(csso())                                    // minifier
        .pipe(rename({suffix: '.min'}))                  // renommer le fichier minifié
        .pipe(gulp.dest(destination + '/css/'))          // destination
        .pipe(browserSync.reload({
            stream: true
        }))                                              // reload navigateur

});

// html
gulp.task('html', function() {
    return gulp.src('*.html')
        .pipe(plumber())
        .pipe(gulp.dest('dist/'))
});

// reload navigateur
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

// watcher ("gulp watch")
gulp.task('watch', ['browserSync', 'style'], function (){
    gulp.watch(source + '/scss/*.scss', ['style']).on('change', function(event){
        console.log('La feuille de style ' + event.path + ' a été modifié');
    });
    gulp.watch('*.html', browserSync.reload);
    gulp.watch(source + '/js/*.js', browserSync.reload)
        .on('change', function(event){
            console.log('Le script ' + event.path + ' a été modifié');
         })
        .on('error', notify.onError(function (error) {
            return error.message;
        }));
});

// commande "gulp"
gulp.task('default', ['style']);
// commande "gulp prod"
gulp.task('prod', ['style','html']);

