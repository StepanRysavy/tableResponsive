/*!
 * tableResponsive jQuery plugin
 *
 * Copyright (c) 2014 Stepan Rysavy, oMicrone (http://www.omicrone.net/)
 * Dual licensed under the MIT and GPL licenses.
 *
 * Converts a table into another table or div based on template and switches between them accorting to breakpoint
 * Doesn't work with: 
 * - tables containing rowspan
 *
 * MIN USAGE:
 *
 * $(table).tableResponsive();
 *
 * USAGE:
 *
 * $(table).tableResponsive({
 *    renderAsDiv: Boolean, 
 *   breakpoint: Number,
 *   afterResize: Callback
 * });
 *
 * ADVANCED 1: Create your own template for generated rows by setting "template" parameter:
 *
 * <div {class} {attr}>{row}<h4>{headline}</h4><div>{value}</div>{row}</div>
 *
 * {class} will get all classes in parameter class and in TR
 * {attr} will get all TR parameters
 * {row}...{row} contains ROW template and loops thru all original TR
 * {headline} is a respective TH in THEAD or TH left from current TD (in non header tables)
 * {value} is a respective TR
 *
 * ADVANCED 2: Create your own wrapper element with "wrapper":
 *
 * <div class="tableResponsiveHolder"></div>
 *
 * follow jQuery Wrap() guidelines
 * 
 * ADVANCED 3: set classes for element states with "classLarge", "classSmall"
 *
 * ADVANCED 4: set callbacks for both size changes or separately with "afterResizeLarge", "afterResizeSmall", "afterResize"
 *
 */
 
;(function ( $, window, undefined ) {
    $.fn.tableResponsive = function(options) {
    
    this.each (function () {
    
      var settings = $.extend ({
        isLarge: true,
        renderAsDiv: false,
        breakpoint: 500,
        htmlSmall: undefined,
        htmlLarge: undefined,
        afterResizeLarge: undefined,
        afterResizeSmall: undefined,
        afterResize: undefined,
        template: undefined,
        defaultTableTemplate: tableTemplate,
        defaultDivTemplate: divTemplate,
        class: undefined,
        keepClasses: true,
        wrapper: wrapperTemplate,
        classLarge: "tableResponsiveLarge",
        classSmall: "tableResponsiveSmall",
      }, options);
    
      var $this = $(this);
      
      if ($this.find("[rowspan]").length > 0) {
        if (window.console) {
          window.console.log ("tableResponsive doesn't support tables with rowspan");
        }
        return;
      }
      
      var $table = $this.wrap(settings.wrapper).parent();
      
      function tableShowSmall () {
      
        $table.html(settings.htmlSmall).removeClass(settings.classLarge).addClass(settings.classSmall);
      
        if (settings.afterResize !== undefined) {
          settings.afterResize($table);
        }
        if (settings.afterResizeSmall !== undefined) {
          settings.afterResizeSmall($table);
        }
      
      }
      
      function tableShowLarge () {
      
        $table.html(settings.htmlLarge).removeClass(settings.classSmall).addClass(settings.classLarge);
      
        if (settings.afterResize !== undefined) {
          settings.afterResize($table);
        }
        if (settings.afterResizeLarge !== undefined) {
          settings.afterResizeLarge($table);
        }
        
      }
      
      function onResize () {
      
        var isLarge = $table.width() > settings.breakpoint ? true : false;
        
        if (isLarge === true && settings.isLarge === false) {
        
          settings.isLarge = true;
          
          tableShowLarge ();
          return;
          
        }
        
        if (isLarge === false && settings.isLarge === true) {
        
          settings.isLarge = false;
          
          tableShowSmall();
          return;
          
        }
        
      }
      
      function createSmallTable () {
      
        var $headers = $table.find("thead tr th");
        var $rows = $table.find("tbody").length === 0 ? $table.find("tr") : $table.find("tbody tr");
        
        var parsedTemplate = settings.template.split("{row}");
        
        var newtable, tag, header, newHTML, attr, attrList, newtables = [], i;
        
        $rows.each(function (index, row) {
  
          newtable = [parsedTemplate[0]];
          
          attr = [];
          attrList = $(row).get(0).attributes;
          
          for (i = 0; i < attrList.length; i++) {
          
            if (attrList[i].name === "class") {
              
              var newClasses = attrList[i].value.split(" ");
            
              for (var j = 0; j < newClasses.length ; j++) {
                settings.class.push (newClasses[j]);
              }
            
              
            } else {
              attr.push(attrList[i].name + '="' + attrList[i].value + '"');
            }
            
          }
          
          newtable[0] = newtable[0].replace ("{class}", 'class="' + settings.class.join(" ") + '"');
          newtable[0] = newtable[0].replace ("{attr}", attr.join(" "));
          
          $(row).find("td").each(function (index, cell) {
          
            header = $($headers[index]).html();
            
            tag = parsedTemplate[1];
            if ($headers.length === 0) {
              if ($(cell).prev().prop("tagName") === "TH") {
                tag = tag.replace ("{headline}", $(cell).prev().html());
              } else {
                tag = tag.replace ("{headline}", "");
              }
            } else {
              tag = tag.replace ("{headline}", Number($(cell).attr("colspan")) === $headers.length ? "" : header);
            }
            tag = tag.replace ("{value}", $(cell).html());
                        
            newtable.push(tag);
            
          });
          
          newtable.push([parsedTemplate[2]]);
          
          newtables.push (newtable.join(""));
          
        });
        
        newHTML = $.parseHTML (newtables.join(""));
      
        return newHTML;
        
      }
      
      function init () {
      
        settings.template = settings.renderAsDiv === true ? settings.template || settings.defaultDivTemplate : settings.template || settings.defaultTableTemplate;
        
        settings.htmlLarge = $table.html();
        
        var classes = [];

        if (settings.keepClasses === true) {
          classes = classes.concat($this.attr("class").split(" "));
        }
        if (settings.class !== undefined) {
          classes = classes.concat(settings.class);
        }
        
        settings.class = classes;
        
        settings.htmlSmall = createSmallTable();
      
        $(window).resize(onResize);
      
        onResize ();
      }
      
      init ();
    
    });
      
    };
    
    var wrapperTemplate = '<div class="tableResponsiveHolder"></div>';
    var tableTemplate = '<table {class} {attr}><tbody>{row}<tr><th>{headline}</th><td>{value}</td></tr>{row}</tbody></table>';
    var divTemplate = '<div {class} {attr}>{row}<h4>{headline}</h4><div>{value}</div>{row}</div>';
    
}(jQuery, window));