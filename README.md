# Climate Vis

## Get Started

```bash
yarn            # 安装依赖
yarn dev        # 启动本地开发服务器
```

**注：**
1. 如果你没有全局安装 yarn 命令，请执行 `npm install -g yarn` 来安装。
2. 推荐使用 VSCode 配合 ESLint 插件使用，可以在保存文件时自动格式化并修复一些语法风格问题。

## 项目结构

```bash
climate-vis
├── index.html                      # 网页的 html 文件
├── public                          # 一些静态资源，编译后将直接放到产物的根目录
├── src                             # 项目的 js 代码，通过 script 标签引入到 index.html 中
│   ├── const.js                    # 一些常量的存放位置
│   ├── mapbox                      # 一个 mapbox 的示例
│   │   └── main.js
│   └── windgl                      # copied from https://github.com/mapbox/webgl-wind
│       ├── main.js
│       ├── shaders
│       │   ├── draw.frag.glsl
│       │   ├── draw.vert.glsl
│       │   ├── quad.vert.glsl
│       │   ├── screen.frag.glsl
│       │   └── update.frag.glsl
│       ├── util.js
│       └── windgl.js
├── package.json                    # npm 配置
├── vite.config.js                  # 项目使用 vite 构建，这是 vite 的配置文件
└── yarn.lock                       # 锁定依赖版本
```

## Build

```bash
yarn build
```

编译生成物会在项目根目录的 `dist` 文件夹中。
