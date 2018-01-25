// This controls the collapse/expand functionality for H2 content, and handles anchor links to content
// within an H2, automatically expanding the relevant H2
// This requires that target content be wrapped with <div class="accordion"></div>
(function($){
  Drupal.behaviors.dhs_accordion = {
    attach: function(context, settings){
    
    var ExpandAllSectionsText = 'Expand All Sections';
    var CollapseAllSectionsText = 'Collapse All Sections';
    var expandAllId = "expandAllText";
    var expandAllSpan = '<span id="' + expandAllId + '">' + ExpandAllSectionsText + '</span>';

    var imagePath = '/profiles/dhs_gov/themes/dhs_mobile_theme/images/source/';
    var expandAlt = "This Section is Collapsed. Click to Expand";
    var collapseAlt = "This Section is Expanded. Click to Collapse";
    var expandAllAlt = "Sections are collapsed.  Click to expand all sections";
    var collapseAllAlt = "Sections are expanded.  Click to collapse all sections";

        imagePlus = imagePath + 'space.png';
        imageMinus = imagePath + 'space.png';

    //checks that the body tag has either of these two classes, if they do the region-content class will be folded
    if ((jQuery("body").hasClass("node-type-site-page") || jQuery("body").hasClass("node-type-landing-page") || jQuery("body").hasClass("node-type-topic")) && !jQuery('body').hasClass('accordion-processed')) { 
        var content = "#content-area .field-name-body .field-items";
        var contentH2 = content + " h2";
//        console.log(contentH2);
        //This loops through all the h2 in the region-content class and checks their parent elements for empty div tags
        //meaning if an h2 is a child of a div tag with no class then that div tag will be unwrapped
        jQuery(contentH2).each(function () {
          if(jQuery(this).parent().attr("class") == undefined){
            if(jQuery(this).parents(".field-item").length > 0) {
              jQuery(this).parentsUntil(".field-item").andSelf().unwrap();
            } else {
              jQuery(this).parents(".field-item").andSelf().unwrap();
            }
          }
        });
        //counting the number of h2s in the loop
        var count = 0;
        var lastH2 = jQuery(contentH2 + ':last').text();
        var lastH2Children =  jQuery(contentH2 +':last').nextUntil().length;
//        console.log('lastH2 ' + lastH2 + ' ' + lastH2Children);
        jQuery(contentH2).each(function () {
            //wraps all elements within each h2 around an accordion_fold class
            jQuery(this).wrapInner('<a class="accordion-icon" href="#"></a>');
            jQuery(".accordion-icon > img.accordion-icon", this).remove(this);
            //jQuery(".accordion-icon", this).append('<img src="' + imagePlus + '" alt="' + expandAlt + '"class="accordion-icon">');
            //If the current h2 has any siblings who contain h2 elements then those h2 elements will be unwrapped until
            //it reaches its first h2.  This is used when h2 tags are hidden within layers of empty div tags.  Which could
            //cause h2 being collapsed into each other
            if(jQuery(this).siblings().find("H2").length > 0){
                jQuery(this).siblings().find("H2").prevUntil("H2").unwrap();
            }

            var h2variable = this;
            var currentH2Count = 0;
            var h2Siblings = jQuery(this).siblings().length;
            jQuery(h2variable).nextAll().each(function () {
                currentH2Count++;
                if(this.tagName == "H2" || currentH2Count == h2Siblings) {
                    jQuery(h2variable).nextUntil(jQuery(h2variable).prop("tagName")).wrapAll('<div class="accordion_fold" />');
                    return false;
                } else if(jQuery(h2variable).text() == lastH2 && currentH2Count == lastH2Children){
                    jQuery(h2variable).nextUntil(jQuery(h2variable).prop("tagName")).wrapAll('<div class="accordion_fold" />');
                    return false;
                }
            });
            //this line wraps everything up into an accordion_fold div and assigned to the current h2
            //    jQuery(this).nextUntil(jQuery(this).attr("tagName")).wrapAll('<div class="accordion_fold" />');
            count++;
        });



        //Expand All Section : if the count isn't greater than 1 don't include the Expand All Section
        if(count > 1) {
            //Adds expand all to the first h2 in the region-content class
            jQuery(contentH2 + ":first").before("<div id='expandAll'><a id=\"expand\" href=\"#\">"
            + expandAllSpan 
//            + "<img src='" + imagePlus + "' alt='" + expandAllAlt + "' class='expand-all-icon'>"
            + "</a></div>");
            document.getElementById("expandAllText").innerHTML = ExpandAllSectionsText;
        }
        if(count > 0 ) {
          jQuery(content).wrapInner("<div class='accordion'></div>");
          jQuery('.accordion_fold').hide();
          jQuery('body:not(.accordion-processed)').addClass('accordion-processed');
        }

//H2 Click : when an h2 is clicked this function will be called to either open or close the accordion
        jQuery('h2').click(function (e) {
            e.preventDefault();
            jQuery(this).next('.accordion_fold').slideToggle("fast");
            jQuery(this).toggleClass('open');
            jQuery().toggleIcons(jQuery(this));


            var tableWidthLarge = jQuery("table.stacktable.large-only").width();
            var blockRightWidth = jQuery(".block-right .content-wrapper").width();

            if(tableWidthLarge > blockRightWidth){
                jQuery(".stacktable.large-only").css("display", "none");
                jQuery(".stacktable.small-only").css("display", "table");
            }

            //every time an h2 is click this loop will run and will count how many h2's are open and how many are closed
            var expandAllText = 0;
            var collapseAllText = 0;
            if(count > 1) {
                jQuery(contentH2 + ':not(.h2break)').each(function () {
                    if (jQuery(this).hasClass("open")) {
                        collapseAllText++;
                    } else {
                        expandAllText++;
                    }
                });

                //if the number of closed h2's equal the number of total h2 then the link should say 'Expand All Sections'
                //if the number of open h2's equal the number of total h2 then the link should say 'Collapse All Sections'
                if (expandAllText == count) {
                    jQuery().collapseAll();
                } else if (collapseAllText == count) {
                    jQuery().expandAll();
                }
            }
        });

// onpage links
        jQuery('a[href*=#]').click(function (e) {
            var href = jQuery(this).attr('href'); //get anchor
            if(href == "#" || jQuery(href).parents("h2").length > 0) {
                var $targetAccordion = jQuery(href).parents("h2");
                jQuery($targetAccordion).next('.accordion_fold').slideDown('fast', function () {
                    jQuery('html,body').animate({scrollTop: jQuery($targetAccordion).offset().top}, 'fast'); // scroll to anchor);
                });
                jQuery($targetAccordion).addClass('open').toggleIcons($targetAccordion);
            } else if(jQuery(href).parents().closest(".accordion_fold").length > 0){
                var $targetAccordion = jQuery(href).parents().closest(".accordion_fold");
                jQuery($targetAccordion).slideDown('fast'); // scroll to anchor);
                jQuery($targetAccordion).prev("h2").addClass('open').toggleIcons($targetAccordion);
            }
        });
// offpage links
        if (window.location.hash) {
            var $anchor = jQuery("body").find(window.location.hash);
            var $targetAccordion = $anchor.parents('.accordion_fold');

            //if the anchor is located inside the h2 tag
            if (jQuery($targetAccordion).attr("tagName") !== undefined) {
                jQuery($anchor).prev('h2').addClass('open');
                jQuery($anchor).slideDown("fast");
                jQuery($anchor).toggleClass('open').toggleIcons($anchor);
            } else if(jQuery($anchor).parents("h2").length > 0) {
                $targetAccordion = jQuery($anchor).parents("h2");
                jQuery($targetAccordion).next('.accordion_fold').slideDown('fast', function () {
                    jQuery('html,body').animate({scrollTop: jQuery($targetAccordion).offset().top}, 'fast'); // scroll to anchor
                });
                jQuery($targetAccordion).toggleClass('open').toggleIcons($targetAccordion);
            }
        }

        jQuery("#expand").click(function (e) {
            e.preventDefault();
            var expandValue = jQuery("#expandAll");
            if (!jQuery(expandValue).hasClass("open")) {
                jQuery().expandAll();
            } else if (jQuery(expandValue).hasClass("open")) {
                jQuery().collapseAll();
            }
        });

//function to toggle icons
        //TODO translations for alt text
        jQuery.fn.toggleIcons = function (thisObj) {
            if(jQuery(thisObj).hasClass("open")){
                jQuery("img[alt='" + expandAlt + "']", thisObj).attr({src:
                    imageMinus })
                jQuery("img[alt='" + expandAlt + "']", thisObj).attr({alt:
                    collapseAlt});
            } else {
                jQuery("img[alt='" + collapseAlt + "']", thisObj).attr({src:
                    imagePlus})
                jQuery("img[alt='" + collapseAlt + "']", thisObj).attr({alt:
                    expandAlt});
            }
        };

        ///function to expand all h2 accordions
        jQuery.fn.expandAll = function () {
            document.getElementById("expandAllText").innerHTML = CollapseAllSectionsText;
            jQuery(".accordion_fold").slideDown("fast");
            jQuery(contentH2).addClass('open');
            jQuery("img[alt='" + expandAlt + "']").attr({src:
                imageMinus});
            jQuery("img[alt='" + expandAlt + "']").attr({alt:
                collapseAlt});

            jQuery("#expandAll").addClass("open");
            jQuery("img[alt='" + expandAllAlt + "']").attr({src:
                imageMinus});
            jQuery("img[alt='" + expandAllAlt + "']").attr({alt:
                collapseAllAlt});
        };

        //function to collapse all h2 accordions
        jQuery.fn.collapseAll = function () {
            document.getElementById("expandAllText").innerHTML = ExpandAllSectionsText;
            jQuery(".accordion_fold").slideUp("fast");
            jQuery("h2").removeClass('open');
            jQuery("img[alt='" + collapseAlt + "']").attr({src:
                imageMinus});
            jQuery("img[alt='" + collapseAlt + "']").attr({alt:
                expandAlt});

            jQuery("#expandAll").removeClass("open");
            jQuery("img[alt='" + collapseAllAlt + "']").attr({src:
                imageMinus});
            jQuery("img[alt='" + collapseAllAlt + "']").attr({alt:
                expandAllAlt});
        };
    }
 
    }
  }; //end behavior
})(jQuery);
;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
