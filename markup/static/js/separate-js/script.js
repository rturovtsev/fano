$(function() {
    fanoSpec.init(); //первым делом проставим классы для слепой версии

    // Функция для определения максимального значения в массиве
    Array.max = function( array ){
        return Math.max.apply( Math, array );
    };

    /**
    * Разделение выпадающего меню на колонки
    */
    var navigationColumns = function () {
        var navigationArray = [];
        $('.navigation-menu li').each(function () {
            var el = $(this);
            navigationArray.push(el.width() + 1);
            el.width(el.width() + 1);
        })

        $('.navigation-menu-hidden li').each(function (i) {
            var el = $(this);
            el.width(navigationArray[i] + 20);
        })

        $('.js-navigation-handle').on('click', function (e) {
            $('#js-navigation-hidden').slideToggle();
            e.preventDefault();
        })
    };

    $(window).load(function () {
        navigationColumns();
    })


    /**
    * Переключатель "Скрыть структуру" / "Отобразить структуру"
    */
    $('.js-show-structure').on('click', function(e) {
        $(this).toggleClass('show-structure_active');
        $('.js-structure-more').slideToggle().closest('li.structure-item').toggleClass('specbordered');
        if ($(this).hasClass('show-structure_active')) {
            $(this).text("Скрыть структуру");
        } else {
            $(this).text("Отобразить структуру");
        }
        e.preventDefault();
    })


    /**
    * Табы
    */
    $('.js-tabs').on('click', '.js-tabs-handle', function (e) {
        var tabs = $(this).closest('.js-tabs'),
            hash = $(this).attr('href').substring(1);

        tabs
            .find('.js-tabs-item')
                .addClass('js-hidden');

        $('#js-tab-' + hash)
            .removeClass('js-hidden');

        $(this)
            .parent()
                .addClass('tabs-handles-item_active')
                .siblings('.tabs-handles-item')
                    .removeClass('tabs-handles-item_active');

        e.preventDefault();
    })

    $('.js-tabs').each(function () {
        var heights = [];

        $(this).find('.js-tabs-item').each(function (i) {
            heights.push($(this).height());
        })

        $(this).find('.js-tabs-item').each(function (i) {
            $(this).height(Array.max(heights));
        })

        $(this).find('.js-tabs-handle:first').click();
    })


    /* News First Crop */
    if ($('.news-main-item_first').length > 0 ) {
        var newsFirstImage = $('.news-main-item_first .news-main__image'),
            newsFirstText = $('.news-main-item_first .news-main__text'),
            newsFirstHeights = {};

        var getFirstHeights = function (newsFirstImage, newsFirstText) {
            var niHeight = newsFirstImage.height(),
                htHeight = newsFirstText.height();
            return {
                niHeight : niHeight,
                htHeight : htHeight
            }
        };

        var setFirstHeights = function () {
            newsFirstHeights = getFirstHeights(newsFirstImage, newsFirstText);
            if (newsFirstHeights.niHeight == 0 || newsFirstHeights.htHeight == 0) {
                setTimeout( setFirstHeights, 100);
            } else {
                if (newsFirstHeights.niHeight < newsFirstHeights.htHeight) {
                    newsFirstText.css({'height':newsFirstHeights.niHeight - 5, 'overflow-y':'hidden'});
                }
            }
        };

        if (newsFirstImage.length && newsFirstText.length) {
            setFirstHeights();
        }
    }

    /* Circle Rating */
    $('.circle-rating').each( function () {
        var score = $(this).data('score').toFixed(1) / 5,
            staticRating = ($(this).hasClass('circle-rating_static') ? true : false),
            animationRating = {
                duration: 1200,
                easing: 'circleProgressEasing'
            };

        $(this).circleProgress({
            value: score,
            size: 50,
            thickness: 3,
            emptyFill: "#b0bec5",
            animation: staticRating ? false : animationRating,
            fill: {
                color: choiceColorCircle() || "#0276bd"
            }
        }).on('circle-animation-progress', function(event, progress, stepValue) {
            stepValue = stepValue * 5;
            $(this).find('strong').text(String(stepValue.toFixed(1)));
        });

        if (staticRating) {
            $(this).find('strong').text($(this).data('score').toFixed(1));
        }
    })


    /* Star Rating*/
    $('.star-rating__list').each(function () {
        var items = $(this).find('.star-rating-item'),
            selected = $(this).find('.star-rating-item_active').length;

        function setActive(items, itemNum) {
            items.each(function(i) {
                if (i <= itemNum) {
                    $(this).addClass('star-rating-item_active');
                } else {
                    $(this).removeClass('star-rating-item_active');
                }
            })
        }

        $(this).on('mouseenter', '.star-rating-item', function() {
            var itemNum = items.index( $(this) );
            setActive(items, itemNum);
        })

        $(this).on('click', '.star-rating-item', function(e) {
            var itemNum = items.index( $(this) ),
                itemHref = $(this).data('ajax-href');

            $.ajax({
                url: itemHref
            }).done(function(data) {
                selected = itemNum + 1;
                setActive(items, itemNum);
            });

            e.preventDefault();
        })

        $(this).on('mouseleave', function () {
            setActive(items, selected - 1);
        })


    })


    $('#expander').find('.structure-more-item').each(function() {
        var section = $(this),
            strWrap;

        if (section.data("parent")) {
            strWrap = $('#structureItem_' + section.data("parent"));
            if (strWrap.find('.structure-more').length == 0) {
                strWrap.append('<div class="structure-more js-structure-more"></div>');
            }
            strWrap.find('.structure-more').append(section);
        }
    })


    $('.search-filter-more__calendar, .form-calendar').datepicker({
        showOn: "both",
        buttonImage: "",
        buttonImageOnly: false,
        buttonText: "Выберите дату"
    });

    $.widget( 'app.selectmenu', $.ui.selectmenu, {
        _drawButton: function() {
            this._super();

            var selected = this.element
                    .find( '[selected]' )
                    .length,
                placeholder = this.options.placeholder;

            if ( !selected && placeholder ) {
                this.buttonText.text( placeholder );
            }
        }
    });

    $( ".js-select" ).each(function () {
        var select = $(this),
            placeholder = $(this).data('placeholder'),
            selectmenuOptions = {},
            selectMenuClass = select.data('menuclass'),
            apis = [];

        if (placeholder) {
            selectmenuOptions.placeholder = placeholder;
        }

        //var uimenu = select.selectmenu( "menuWidget").parent();

        selectmenuOptions.open = function( event, ui ) {
            var menuHeight = select.selectmenu( "menuWidget").height(),
                selectWidth = select.next('.ui-selectmenu-button').width(),
                scrollHeight  = 200,
                selectmenu = select.selectmenu( "menuWidget").parent();

            if (menuHeight <= scrollHeight) {
                scrollHeight = 'auto';
            }

            select.selectmenu( "menuWidget").css({
                'width': selectWidth + 2
            })

            selectmenu.css({
                'width': selectWidth + 2,
                'height': scrollHeight
            });

            selectmenu.niceScroll({
                horizrailenabled:false,
                cursorcolor:'#b0bec5',
                autohidemode:false,
                background:'#eceff1',
                cursorborder:0
            });

        };

        select.selectmenu(selectmenuOptions);

        select
            .selectmenu( "menuWidget").parent()
                .addClass(select.data("menuclass"));


    });



    $('.js-show-filter').on('click', function (e) {
        $(this).toggleClass('show-structure_active');
        $('.js-search-filter-more').slideToggle();
        /*if ($(this).hasClass('show-structure_active')) {
            $(this).text("");
        } else {
            $(this).text("");
        }*/
        e.preventDefault();
    })

    $('.js-search-filter-more').hide();
    $('.filter-opened .js-search-filter-more').show();


    $('.flexslider').flexslider({
        animation: "fade",
        controlNav: false,
        slideshow:false,
        start: function(slider){
           $('.total-slides').text(slider.count);
           $('.current-slide').text(slider.currentSlide + 1)
        },
          after: function(slider) {
            $('.current-slide').text(slider.currentSlide + 1);
          }
      });

    $('.flex-counter-prev').on('click', function (e) {
        $('.flex-prev').click();
        e.preventDefault();
    })
    $('.flex-counter-next').on('click', function (e) {
        $('.flex-next').click();
        e.preventDefault();
    })

    $('.slider').on('click', '.flex-change-size', function (e) {
        var slider = $(this).closest('.slider');
        if (slider.hasClass('slider-small')) {
            $(this).closest('.slider')
                .animate({'width': '100%'}, 0, function () {
                    $(this).removeClass('slider-small');
                });
        } else {
            $(this).closest('.slider')
                .animate({'width': '350'}, 0, function () {
                    $(this).addClass('slider-small');
                });
        }
        e.preventDefault();
    })



    $('video').mediaelementplayer({
        loop: true,
        shuffle: false,
        playlist: true,
        playlistposition: 'bottom',
        success: function(player, node) {
            $(player).closest(".mejs-container").attr("lang", mejs.i18n.getLanguage());
        },
        features: ['playlistfeature', 'prevtrack', 'playpause', 'nexttrack', 'loop', 'shuffle', 'playlist', 'current', 'progress', 'duration', 'volume'],
    });

    $.validator.setDefaults({
        submitHandler: function() {

        }
    });

    $("#feedback-form").validate();

    // Departments list Grid
    if ($('.departments-list-grid').length) {
        var gridItems = $('.departments-list-grid-item'),
            gridItemsArray = [],
            n = 0;

        $('.departments-list-grid').css({"opaicty":0,"display":"block"});
        
        gridItemsArray[0] = {
            heights: [],
            headersHeights:[],
            items: []
        };

        gridItems.each(function (i) {
            if (i%2 == 0 && i != 0) {
                n ++; 
                gridItemsArray[n] = {
                    heights:[],
                    headersHeights:[],
                    items: []
                };
            }
            gridItemsArray[n].items.push($(this));
        })
        
        $.each(gridItemsArray, function(i){
            $.each(gridItemsArray[i].items, function (j) {
                gridItemsArray[i].heights.push($(this).outerHeight());
                gridItemsArray[i].headersHeights.push($(this).find('.departments-list-grid_header').outerHeight());
            })

            $.each(gridItemsArray[i].items, function (j) {
                $(this).outerHeight(Array.max(gridItemsArray[i].heights));
                $(this).find('.departments-list-grid_header').outerHeight(Array.max(gridItemsArray[i].headersHeights));
            })
        })

        $('.departments-list-grid').prev('.ajax-loading').remove();
        $('.departments-list-grid').css({"opaicty":1});

    }


    // Dropdown in statistic
    $('.dropdown-trigger').on('click', function() {
        var $dropDown = $(this).next('.dropdown-cont');

        hideElWithClickOutside({el:$dropDown, startAnimation:'slide', endAnimation:'slide', duration:'fast'});
    });

    /*Polls*/

    $('.poll-form').each(function() {
        var form = $(this);
        if (form.find('input:checked').length  == 0) {
            form.find('input[type="submit"]').attr('disabled', true);
        }
    })
    $('.poll-form').on('click', '.form-radio-label', function() {
        var form = $(this).closest('.poll-form');
        form.find('input[type="submit"]').removeAttr('disabled');
    })


    /* Three column hidden navigation */
    if ($('.navigation-hidden_3col').length > 0) {
        var wraps = [],
            totalHeight = 0,
            colHeight = 0,
            tempHeight = 0,
            tempCol = 1;

        $('.navigation-hidden_3col').css('opacity', 0).show();

        $('.navigation-3col-wrap').each(function (i) {
            var wrapOptions = {},
                wrapHeight = $(this).height();

            wrapOptions.height = wrapHeight;
            wrapOptions.index = i;

            wraps.push(wrapOptions);
            totalHeight += wrapHeight;
        })

        colHeight = parseInt(totalHeight/3, 10);

        $.each(wraps, function (i) {
            tempHeight += wraps[i].height;
            wraps[i].col = tempCol;
            if (tempHeight > colHeight*tempCol) {
                tempCol++;
            }
        })

        $('.navigation-3col-wrap').each(function (i) {
            if (wraps[i].col == 2) {
                $('#js-navigation-hidden-col2').append($(this));
            }
            if (wraps[i].col == 3) {
                $('#js-navigation-hidden-col3').append($(this));
            }
        })

        $('.navigation-hidden_3col').css('opacity', 1).hide();
    }

/*
    function fixPosition(block, offset) {
        var blockTop = block.offset().top,
            scrollEvent = iOS ? 'scrollstop' : 'scroll'
            ;


        var fixScroll = function(block, offset ) {
            var docHeight = $(document).height(),
                footerHeight = 0,
                topHeight = 0,
                blockHeight = block.height(),
                blockNext = block.next(),
                blockPadding = (blockNext.length > 0) ? blockHeight : 0,
                winTop = $(window).scrollTop()
                ;

            winHeight = $(window).height();
            blockHeight = block.height();
            var correct_2 = 0;

            if ((winTop + topHeight) > blockTop)  {
                if (docHeight  - footerHeight  - winTop  - topHeight - blockHeight - offset - correct_2<= 0) {
                    block.css({
                        position:'absolute',
                        bottom: 0,
                        top:''
                    });
                    block.parent().css({
                        position:'relative',
                        height:'100%'
                    });
                } else {
                    block.css({
                        position:'fixed',
                        top:topHeight,
                        bottom:'',
                        zIndex:10,
                        width:block.width()
                    });
                    blockNext.css({
                        paddingTop:blockPadding
                    });
                }

            } else {
                block.css({
                    position:'static'
                });
                blockNext.css({
                    paddingTop:''
                });
                block.parent().css({
                    position:''
                });
            }

        };

        if (iOS) {
            var iTopStart = 0,
                iTopEnd = 0,
                iInt;

            $(window).on('touchstart', function(){
                iTopStart = $(window).scrollTop();

            });
            $(window).on("touchend", function() {
                iTopEnd = $(window).scrollTop();
                if (Math.abs(iTopEnd - iTopStart) > 100) {
                    if (block.css('position') == 'fixed') {
                        block.css('opacity', 0);
                    }

                }
            });

            setTimeout(function(){
                fixScroll(block, offset);
            }, 10);

        }


        $(window).on('scroll', function(){
            fixScroll(block, offset);
            block.css('opacity', 1);
        });

        fixScroll(block, offset);


    }

    fixPosition($('.navigation'), 0);*/
})


//временные графики для статики
$(function () {
    $(document).ready(function () {
        $('#container-highcharts_1').highcharts({
            chart: {
                ignoreHiddenSeries: false, //сетка перестает прыгать при отключении показателей
                height: 335,
                spacingLeft: 0,
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
            legend: {
                align: "right",
                verticalAlign: "top",
                itemMarginBottom: 40,
                itemStyle: {
                    "fontSize": "13px",
                    "color": "#3A484F",
                    "fontWeight": "normal",
                    "cursor": "default"
                }
            },
            xAxis: {
                categories: [
                    '19',
                    '20',
                    '21',
                    '22',
                    '23',
                    '24',
                    '25'
                ],
                tickLength: 0,
                crosshair: true,
                labels: {
                    style: {
                        "color": "#3A484F;"
                    }
                },
                lineWidth: 1,
                lineColor: '#AFBCC3'
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                },
                labels: {
                    style: {
                        "color": "#B0BEC5;"
                    }
                },
                gridLineColor: '#D7DDE1',
                lineWidth: 1,
                lineColor: '#AFBCC3'
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px"><b>{point.key}</b></span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                },
                series:{
                    events : {
                        legendItemClick: function(e){
                            e.preventDefault();
                        }
                    }
                }
            },
            series: [{
                name: 'Посетители',
                color: '#37B0F2',
                pointWidth: 4,
                groupPadding: 0.3,
                data: [37, 40, 41, 47, 38, 43, 34]

            }, {
                name: 'Просмотры страниц',
                color: '#0276BD',
                pointWidth: 4,
                groupPadding: 0.3,
                data: [12, 21, 22, 25, 18, 25, 15]

            }, {
                name: 'Посещения',
                color: '#B0BEC5',
                pointWidth: 4,
                groupPadding: 0.3,
                data: [8, 11, 14, 13, 11, 15, 15]

            }]
        });

        $('#container-highcharts_2').highcharts({
            chart: {
                spacingLeft: 0,
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            title: {
                text: null
            },
            tooltip: {
                backgroundColor: "#fff",
                borderColor: "#B0BEC5",
                borderRadius: 0,
                pointFormat: '{point.y} ({point.percentage:.0f}%)'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: false,
                    point:{
                        events : {
                            legendItemClick: function(e){
                                e.preventDefault();
                            }
                        }
                    },
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: "right",
                verticalAlign: "top",
                useHTML: true,
                width: 474,
                padding: 0,
                symbolPadding: 0,
                layout: "vertical",
                itemWidth: 474,
                itemStyle: {
                    "color": "#37474E",
                    "fontSize": "13px",
                    "fontWeight": "normal"
                },
                labelFormatter: function() {
                    return '<div class="hch_legend_item">' +
                        '<div class="hli_l">' + this.name + '</div>' +
                        '<div class="hli_r">'
                            + this.y +
                            '<span class="hli_line" style="background-color: ' + this.color + '; margin-right: ' + ( 100 - this.percentage.toFixed() ) * 2 + 'px;"></span>' +
                        '</div>' +
                    '</div>';
                },
                symbolWidth: 0
            },
            series: [{
                name: "Brands",
                colorByPoint: true,
                size: 200,
                center: [100, '50%'],
                innerSize: '45%',
                data: [{
                    name: "Об агентстве",
                    color: "#B3E5FC",
                    y: 530
                }, {
                    name: "Деятельность",
                    color: "#607D8B",
                    y: 662
                }, {
                    name: "Пресс-центр",
                    color: "#B0BEC5",
                    y: 752
                }, {
                    name: "Документы",
                    color: "#00579B",
                    y: 1304
                }, {
                    name: "Открытое агентство",
                    color: "#0276BD",
                    y: 2117
                }, {
                    name: "Обращения граждан",
                    color: "#29B6F6",
                    y: 2227
                }]
            }]
        });
    });
});


function choiceColorCircle() {
    var $body = $('body');

    if ( $body.hasClass('special') && $body.hasClass('color2') ) {
        return '#ffffff';
    }

    if ( $body.hasClass('special') && $body.hasClass('color3') ) {
        return '#063462';
    }

    if ( $body.hasClass('special') ) {
        return '#000000';
    }

    return false;
}


/**
 * show/hide element
 * @param options {object} Свойства: el - показываемый/скрываемый элемент; closeBtn - кнопка закрытия элемента; startAnimation - анимация открытия; endAnimation - анимация закрытия; duration - время продолжительности анимации в милисекундах
 */
function hideElWithClickOutside(options) {
    var options = options || {},
        $el = options.el,
        $closeBtn = options.closeBtn || null,
        startAnimation = options.startAnimation || 'show',
        endAnimation = options.endAnimation || 'hide',
        duration = options.duration || 400;


    if ($el.css('display') != 'block') {
        switch (startAnimation) {
            case 'show':
                $el.show(duration);
                break;
            case 'fade':
                $el.fadeIn(duration);
                break;
            case 'slide':
                $el.slideDown(duration);
        }

        var yourClick = true;

        $(document).on('click.myEvent', function (e) {
            if (!yourClick && $(e.target).closest($el).length == 0) {
                chooseEndAnimation();

                $(document).off('click.myEvent');
            }
            yourClick = false;
        });

        if ($closeBtn) {
            $closeBtn.on('click', function() {
                chooseEndAnimation();
                $(document).off('click.myEvent');
                yourClick = false;
            });
        }
    }

    function chooseEndAnimation() {
        switch (endAnimation) {
            case 'hide':
                $el.hide(duration);
                break;
            case 'fade':
                $el.fadeOut(duration);
                break;
            case 'slide':
                $el.slideUp(duration);
        }
    }
}


/* Cookie */
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
/**
 * @param name {string}
 * @param value {string}
 * @param options {object} Свойства: expires - время в секундах истечения cookie; path - путь для cookie; domain - домен для cookie; secure - если true, то пересылать cookie только по защищенному соединению.
 */
function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}


/* Special version */
var fanoSpec = {
    cookieTime: 3600*24,
    render: function() {
        var $html = $('html'),
            $body = $('body'),
            $special_pane = $('#special_pane');

        //установка размера шрифта
        if( getCookie('fontsize') ) {
            var size = getCookie('fontsize'),
                $aSizeLinks = $special_pane.find('.a-fontsize');

            $html.removeClass('fontsize1 fontsize2 fontsize3');
            $html.addClass('fontsize' + size);
            $aSizeLinks.removeClass('active');
            $aSizeLinks.eq(size - 1).addClass('active');
        }


        //установка цвета
        if( getCookie('color') ) {
            var color = getCookie('color'),
                $aColorLinks1 = $special_pane.find('.a-color');

            $body.removeClass('color1 color2 color3');
            $body.addClass('color' + color);
            $aColorLinks1.removeClass('active');
            $aColorLinks1.eq(color - 1).addClass('active');
        }


        //установка семейства
        if( getCookie('font') ) {
            var font = getCookie('font'),
                $aFontLinks = $special_pane.find('.a-font-family');

            $body.removeClass('font1 font2');
            $body.addClass('font' + font);
            $aFontLinks.removeClass('active');
            $aFontLinks.eq(font - 1).addClass('active');
        }


        //установка межбуквенного интервала
        if( getCookie('spacing') ) {
            var spacing = getCookie('spacing'),
                $aSpacingLinks = $special_pane.find('.a-letter-spacing');

            $body.removeClass('spacing1 spacing2 spacing3');
            $body.addClass('spacing' + spacing);
            $aSpacingLinks.removeClass('active');
            $aSpacingLinks.eq(spacing - 1).addClass('active');
        }
    },
    rebuildCircle: function() {
        var $circles =  $('.circle-rating');

        if ( $circles.length ) {
            $circles.circleProgress({fill: { color: choiceColorCircle() }});
        }
    },
    event: function() {
        var $html = $('html'),
            $body = $('body'),
            $special_pane = $('#special_pane'),
            $aSpecSettings = $('#a-special-settings'),
            $aSpecialVersion = $('.icon-link_special'),
            $aDefaultVersion = $('#a-default-version'),
            $dropDown = $special_pane.find('.popped'),
            $defaultBtn = $dropDown.find('.default');

        //раскрытие настроек в панеле для спецверсии
        $aSpecSettings.off('click');
        $aSpecSettings.on('click', function(e) {
            e.preventDefault();
            var $closeBtn = $dropDown.find('.closepopped');

            hideElWithClickOutside({el:$dropDown, closeBtn: $closeBtn, startAnimation:'slide', endAnimation:'slide', duration:'fast'});
        });


        //установка размера шрифта
        var $fontsizeCont = $special_pane.find('.fontsize'),
            $aSizeLinks = $fontsizeCont.find('.a-fontsize');

        $aSizeLinks.off('click');
        $aSizeLinks.on('click', function(e) {
            e.preventDefault();
            var size = $(this).data('fontsize');

            $aSizeLinks.removeClass('active');
            $(this).addClass('active');
            $html.removeClass('fontsize1 fontsize2 fontsize3');
            $html.addClass('fontsize' + size);
            setCookie('fontsize', size, {expires: this.cookieTime, path: '/'});
        });


        //установка цвета
        var $colorsCont1 = $special_pane.find('.colors'),
            $aColorLinks1 = $colorsCont1.find('.a-color'),
            $colorsCont2 = $special_pane.find('.choose-colors'),
            $aColorLinks2 = $colorsCont2.find('.li-color>a'),
            $allColorsLink = $aColorLinks1.add($aColorLinks2);

        $allColorsLink.off('click');
        $allColorsLink.on('click', function(e) {
            e.preventDefault();
            var color = $(this).data('color');

            $allColorsLink.removeClass('active');
            $(this).addClass('active');
            $body.removeClass('color1 color2 color3');
            $body.addClass('color' + color);
            setCookie('color', color, {expires: this.cookieTime, path: '/'});

            fanoSpec.rebuildCircle();
        });


        //установка семейства шрифта
        var $fontCont = $special_pane.find('.choose-font-family'),
            $aFontLinks = $fontCont.find('.a-font-family');

        $aFontLinks.off('click');
        $aFontLinks.on('click', function(e) {
            e.preventDefault();
            var font = $(this).data('font');

            $aFontLinks.removeClass('active');
            $(this).addClass('active');
            $body.removeClass('font1 font2');
            $body.addClass('font' + font);
            setCookie('font', font, {expires: this.cookieTime, path: '/'});
        });


        //установка межбуквенного интервала
        var $spacingCont = $special_pane.find('.choose-letter-spacing'),
            $aSpacingLinks = $spacingCont.find('.a-letter-spacing');

        $aSpacingLinks.off('click');
        $aSpacingLinks.on('click', function(e) {
            e.preventDefault();
            var spacing = $(this).data('spacing');

            $aSpacingLinks.removeClass('active');
            $(this).addClass('active');
            $body.removeClass('spacing1 spacing2 spacing3');
            $body.addClass('spacing' + spacing);
            setCookie('spacing', spacing, {expires: this.cookieTime, path: '/'});
        });


        //возвращение стандартных настроек
        $defaultBtn.off('click');
        $defaultBtn.on('click', function(e) {
            e.preventDefault();
            $body.removeClass('color2 color3 font2 spacing2 spacing3');
            $html.removeClass('fontsize2 fontsize3');
            $body.addClass('fontsize1 color1 font1 spacing1');
            $html.addClass('fontsize1');

            $aSizeLinks.removeClass('active');
            $aSizeLinks.eq(0).addClass('active');
            $allColorsLink.removeClass('active');
            $allColorsLink.eq(0).addClass('active');
            $aFontLinks.removeClass('active');
            $aFontLinks.eq(0).addClass('active');
            $aSpacingLinks.removeClass('active');
            $aSpacingLinks.eq(0).addClass('active');

            setCookie('fontsize', '1', {expires: this.cookieTime, path: '/'});
            setCookie('color', '1', {expires: this.cookieTime, path: '/'});
            setCookie('font', '1', {expires: this.cookieTime, path: '/'});
            setCookie('spacing', '1', {expires: this.cookieTime, path: '/'});
        });


        //переход в специальную версию сайта
        $aSpecialVersion.off('click');
        $aSpecialVersion.on('click', function(e) {
            //e.preventDefault();
            setCookie('special_version', 1, {expires: this.cookieTime, path: '/'});
            setCookie('general_version', 0, {expires: this.cookieTime, path: '/'});

            //location.pathname = '/special'+location.pathname;
        });


        //переход в обычную версию сайта
        $aDefaultVersion.off('click');
        $aDefaultVersion.on('click', function(e) {
            //e.preventDefault();
            setCookie('special_version', 0, {expires: this.cookieTime, path: '/'});
            setCookie('general_version', 1, {expires: this.cookieTime, path: '/'});

            //location = '/';
        });
    },
    init: function() {
        if ( !$('body').hasClass('special') ) return;
        this.render();
        this.event();
    }
};
