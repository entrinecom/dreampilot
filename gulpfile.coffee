# initiating plugins
gulp = require 'gulp'
uglify = require 'gulp-uglify'
concat = require 'gulp-concat'
bower = require 'gulp-bower'
rename = require 'gulp-rename'
coffee = require 'gulp-coffee'
fs = require 'fs'
path = require 'path'

# base folder
rootFolder = './'
distFolder = 'dist/'
buildFolder = distFolder + 'build/'

# prefix to all paths
fullPath = (path) ->
    neg = ''
    if path.substr(0, 1) is '!'
        neg = '!'
        path = path.substr(1)
    neg + rootFolder + path

# coffee settings
coffeeFolder = 'source/'
coffeeMask = '**/**/*.coffee'

# js settings
jsOutput = 'dp.js'
jsFiles = [
    buildFolder + '**/*.js'
]

# watch settings
watchSettings =
    'coffee':
        mask: coffeeFolder + coffeeMask
    'js-concat':
        mask: jsFiles
    'js-min':
        mask: distFolder + jsOutput

# coffee
gulp.task 'coffee', (done) ->
    gulp.src fullPath coffeeFolder + coffeeMask
    .pipe coffee bare: true
    .pipe gulp.dest fullPath buildFolder
    .on 'end', -> done()

# copy bower files to public
gulp.task 'bower-files', (done) ->
    bower
        interactive: true
    #.pipe gulp.dest './'
    .on 'end', -> done()

# js concat
gulp.task 'js-concat', (done) ->
    gulp.src jsFiles.map (f) -> fullPath f
    .pipe concat jsOutput
    .pipe gulp.dest fullPath distFolder
    .on 'end', -> done()

# js minify
gulp.task 'js-min', (done) ->
    gulp.src fullPath distFolder + jsOutput
    .pipe uglify()
    .pipe rename suffix: '.min'
    .pipe gulp.dest fullPath distFolder
    .on 'end', -> done()

# build
gulp.task 'build', gulp.series(
    'bower-files'
    'coffee'
    'js-concat'
    'js-min'
)

# monitoring
gulp.task 'watch', (done) ->
    for process of watchSettings
        do (process, mask = watchSettings[process].mask) ->
            gulp.watch mask, gulp.series(process)
            true
    done()

# default
gulp.task 'default', gulp.series(
    'build'
    'watch'
)
