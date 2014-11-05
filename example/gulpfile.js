var gulp = require('gulp');

var template = require('../');

gulp.task('tmpl', function() {
    return gulp.src('./tmpl/*.html')
        .pipe(template({
            commonjs: true,
            // amd: true,
            strict: true
        }))
        .pipe(gulp.dest('./tmpl/'));
});