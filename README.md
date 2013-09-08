# grunt-aco2less

> A grunt plugin used to create .less variables out of .aco files. Currently supports rgb and hsb(->hsv) colors.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-aco2less --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-aco2less');
```

## The "aco2less" task

### Overview
In your project's Gruntfile, add a section named `aco2less` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  aco2less: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    }
  },
})
```

### Options

#### options.nameOverride
Type: `String`
Default value: `undefined`

Used to override the color names in .aco files. aco2less appends color numbers automatically: my-color-name-1, my-color-name-2 etc.


### Usage Examples

```js
grunt.initConfig({
  aco2less: {
    options: {
      nameOverride: "my-color-name"
    },
    files: {
      'dest/my_less_file.less': ['my_aco_name.aco', 'path_to_my_acos/*.aco'],
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.0.1
