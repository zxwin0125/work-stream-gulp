import { src, dest, parallel, series, watch } from 'gulp';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';
import loadPlugins from 'gulp-load-plugins';

const plugins = loadPlugins()
const bs = browserSync.create()
const cwd = process.cwd()

let config = {
  // default config
  build: {
    // 抽象路径配置
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
}

// 通过约定大于配置的方式，在模块中尝试读取项目根目录下的配置文件 pages.config.js
// 使用异步 IIFE (Immediately Invoked Function Expression) 来处理 await
(async () => {
  try {
    const loadConfig = await import(`${cwd}/pages.config.js`);
    Object.assign(config, loadConfig.default || loadConfig);
  } catch (e) {
    console.error('Failed to load custom configuration:', e);
  }
})();

const clean = async () => await deleteAsync([config.build.dist, config.build.temp]);

const style = () =>
  src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }));

const script = () =>
  src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }));

const page = () =>
  src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.swig({ data: config.data, defaults: { cache: false } }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }));

const image = () =>
  src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist));

const font = () =>
  src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist));

const extra = () =>
  src('**', { base: config.build.public, cwd: config.build.public })
    .pipe(dest(config.build.dist));

const serve = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style);
  watch(config.build.paths.scripts, { cwd: config.build.src }, script);
  watch(config.build.paths.pages, { cwd: config.build.src }, page);
  watch([
    config.build.paths.images,
    config.build.paths.fonts
  ], { cwd: config.build.src }, bs.reload);

  watch('**', { cwd: config.build.public }, bs.reload);

  bs.init({
    notify: false,
    port: 2080,
    server: {
      baseDir: [config.build.temp, config.build.dist, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });
};

const useref = () =>
  src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(config.build.dist));

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build = series(clean, parallel(series(compile, useref), image, font, extra))

const develop = series(compile, serve)

export default { clean, build, develop }
