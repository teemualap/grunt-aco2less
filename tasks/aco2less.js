/*
 * grunt-aco2less
 * https://github.com/teemualap/grunt-aco2less
 *
 * Copyright (c) 2013 Teemu Alapoikela
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('aco2less', 'A grunt plugin used to create .less variables out of .aco files.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: '\n',
    });

    var fs = require('fs');
    var binary = require('binary');

    //variables for logging
    var nFiles = 0;
    var nTotalColors = 0;

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {

        //store palette information in this object
        var colorTable = {};

        //read buffer
        var buf = fs.readFileSync(filepath);
        
        //aco1 header information mainly to get color count
        var header = binary.parse(buf)
          .word16be('ver')
          .word16be('nColors')
          .vars;
        
        var skipOneHeader = 4;

        //skip aco1 section
        var skipSection1 = skipOneHeader + header.nColors * (5 * 2);
        //skip aco2 header
        var toSection2 = skipSection1 + skipOneHeader;

        //count palette iterations
        var colorCount = 0;

        //parse section 2 the first time to get color info and color name field length
        binary.parse(buf)
        .skip(toSection2)
        .loop(function(end,vars){
          colorCount++;
          if(this.eof()) {
            end();
          }
          this.word16be('colorSpace')
          .word16be('w')
          .word16be('x')
          .word16be('y')
          .word16be('z')
          .word16be('separator')
          .word16be('lenplus1') //let's not parse any further
          .tap(function(vars){
            //skipping results in an additional iteration so let's not store that one
            //binary module assigns nulls for fields read outside the buffer so we can test the first one.
            if (vars.colorSpace !== null) {
              //an object for each color
              colorTable['color-'+colorCount] = {};
              color = colorTable['color-'+colorCount];
              //store field information in those objects
              for (var i in vars) {
                color[i] = vars[i];
              }
              //give these colors an index number for later use
              color.index = colorCount-1;
              
              //skip to the next color
              this.skip(( (vars.lenplus1) * 2));
            }
          });
        });

        function getColorName(color,skip) {

          var colorName = "";
          var n = 0;

          binary.parse(buf)
            .skip(skip)
            .loop(function(end,vars){
              n++;
              if (n === (color.lenplus1 -1)) {
                //end
                end();
              }
              this.word16be('namepart')
              .tap(function(vars) {
                //hex representation of this part
                var hexPart = (vars.namepart).toString(16);
                //ascii representation of this part
                var asciiPart = hexToAscii(hexPart);
                //console.log(asciiPart);
                colorName += asciiPart;
              });
            });

          return colorName;
        }
        
        var palette = "";

        function hexToAscii(hex) {
          var ascii = "";
          for (var i = 0; i < hex.length; i += 2) {
            ascii += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }  
          return ascii;
        }

        var lastNamesLength = 0;

        //iterate over our colorTable and store color names
        for (var i in colorTable) {

          nTotalColors++;

          var color = colorTable[i];

          //skip aco1, aco2 header, and previously iterated colors
          var toNextColorName = toSection2 + ( (color.index + 1) * 14 ) + lastNamesLength;

          //get color name
          if (options.nameOverride && typeof options.nameOverride === String && options.nameOverride.length > 0) {
            color.name = options.nameOverride + "-" + (parseInt(color.index,10) + 1);
          } else {
            color.name = getColorName(color,toNextColorName);
          }

          //the length of previous names in bytes
          lastNamesLength = lastNamesLength + (color.lenplus1 * 2);

          //write color name to the palette
          palette += ("@"+ color.name + ": ");

          //calculate color values and write them to the palette
          if (color.colorSpace === 0) {
            //RGB
            color.w = color.w/256;
            color.x = color.x/256;
            color.y = color.y/256;

            palette += "rgb("+color.w+","+color.x+","+color.y+");\n";

          } 
          if (color.colorSpace === 1) {
            //HSB
            color.w = color.w/182.04;
            color.x = color.x/655.35;
            color.y = color.y/655.35;

            palette += "hsv("+color.w+","+color.x+"%,"+color.y+"%);\n";
          }
          
        }

        nFiles++;

        return palette;

      }).join(grunt.util.normalizelf(options.separator));

      // Write banner if specified
      if (options.banner) {
        grunt.file.write(f.dest, options.banner);
      }
      // Write palettes
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
      grunt.log.writeln('--> Aco2less converted ' + nTotalColors + ' colors from ' + nFiles + ' files.');
    });
  });

};
