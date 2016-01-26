$(function() {
    fanoSpec.init(); //первым делом проставим классы для слепой версии
    
    // Переменная для определения iOS устройств
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

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
            hash = $(this).attr('href').substring(1),
            ajaxHref = $(this).data('href');

        if (ajaxHref && $('#js-tab-' + hash).hasClass('ajax-loading')) {
            $.get(ajaxHref, function (data) {
                $('#js-tab-' + hash).html($(data).html()).removeClass('ajax-loading');
            })
        }

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

    // вариант для альтернативного меню
    $('.tabs-handles_full').on('click', '.js-tabs-handle', function (e) {
        var hash = $(this).attr('href').substring(1);
        
        $('.js-tabs-item').each(function() {
            $(this).addClass('js-hidden');
        })

        $('#js-tab-' + hash)
            .removeClass('js-hidden');

        $(this)
            .parent()
                .addClass('tabs-handles-item_active')
                .siblings('.tabs-handles-item')
                    .removeClass('tabs-handles-item_active');
        
        e.preventDefault();
    })

    // пагинация для AJAX подгружаемых табов 
    $('.js-tabs-item').on('click', '.ajax-paginator a', function (e) {
        var link = "",
            item = $(this).closest('.js-tabs-item'),
            linkArray = $(this).attr('href').split('/'),
            tabs = item.closest('.js-tabs');

        link = linkArray[linkArray.length - 1];
        $.get('/common/module_router.php' + link, function (data) {
            item.html($(data).html());
        })
        e.preventDefault();
    })

    // инициализация табов 
    $(window).load(function () {
        $('.js-tabs').each(function () {
            $(this).find('.js-tabs-handle:first').click();
        })

        if ($('.tabs-handles_full').length) {
            $('.js-tabs-item').each(function (i) {
                if (i != 0) {
                    $(this).addClass('js-hidden');
                }
            })
        }
    })
        
    


    /**
    * Ограничение размера текста рядом с основным изображением
    * новости на главной странице
    */
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

    /**
    * Круговая диаграмма для отображения рейтинга
    */
    $('.circle-rating').each( function () {
        var score = $(this).data('score').toFixed(1) / 5;
        $(this).circleProgress({
            value: score,
            size: 50,
            thickness: 3,
            emptyFill: "#b0bec5",
            fill: {
                color: choiceColorCircle() || "#0276bd"
            }
        }).on('circle-animation-progress', function(event, progress, stepValue) {
            stepValue = stepValue * 5;
            $(this).find('strong').text(String(stepValue.toFixed(1)));
        });
    })


    /**
    * Проставление и вывод оценки пользователем
    */
    $('.star-rating__list:not(.star-rating__list_disabled)').each(function () {
        var items = $(this).find('.star-rating-item'),
            selected = $(this).find('.star-rating-item_active').length,
            starlist = $(this),
            rel = $(this).data('rel');

        /**
        * Выделение нужного количества галочек
        */
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
            var itemNum = items.index($(this));
            setActive(items, itemNum);
        })

        $(this).on('click', '.star-rating-item', function(e) {
            var itemNum = items.index( $(this)),
                itemHref = $(this).data('ajax-href');

            $.ajax({
                url: itemHref
            }).done(function(data) {
                var rating = {},
                    score;
                
                if (data && data != "") {
                    data = $.parseJSON(data);
                    rating = data.rating;
                    score = rating.AVG_RATING.toFixed(1) / 5;
                    if (rel) {
                        $('.circle-rating[data-rel="'+rel+'"]').circleProgress('value', score);
                        $('.circle-rating[data-rel="'+rel+'"] span').text('(' + rating.COUNT + ')');
                    }
                }

                selected = itemNum + 1;
                starlist.addClass('star-rating__list_disabled');
                setActive(starlist.find('.star-rating-item'), itemNum);
                starlist.off('mouseenter').off('click');

                if (rel) {
                    var rellist = $('.star-rating__list[data-rel="'+rel+'"]:not(.star-rating__list_disabled)');
                    rellist.addClass('star-rating__list_disabled');
                    setActive(rellist.find('.star-rating-item'), itemNum);
                    rellist.off('mouseenter').off('click');
                }
            });

            e.preventDefault();
        })
        
        // сброс оценки при отводе курсора
        $(this).on('mouseleave', function () {
            if (!$(this).hasClass('star-rating__list_disabled')) {
                setActive(items, -1);
            }
        })

    })

    /**
    *   Привязка управлений к руководителям на странице "Руководство"
    */
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

    /**
    *   Календарь
    */
    $('.search-filter-more__calendar, .form-calendar').datepicker({
        showOn: "button",
        buttonImage: "",
        buttonImageOnly: false,
        buttonText: "Выберите дату",
        beforeShow: function(input, inst)
            {
                var offset = (input.offsetWidth - 132 ); 
                inst.dpDiv.css({ marginLeft: offset  + 'px'});
            }
    });

    /**
    *   Выпадающее меню
    */
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

    // переход по указанному url сразу после выбора значения в выпадающем списке
    $('.js-select-instant').on('selectmenuchange', function () {
        var url = $(this).find('option:selected').data('url');
        window.location = url;
    })

    // Destroy для вып. списков в скрытых блоках фильтров
    if ($('.js-search-filter-more').find(".js-select").length && $('.js-search-filter-more').is(':hidden')) {
        $('.js-search-filter-more').show().css('opacity', 0);
        $('.js-search-filter-more').find(".js-select").each(function() {
            var options = $(this).selectmenu( "option" );
            $(this).selectmenu( "destroy");
            $(this).selectmenu(options);
        })
        $('.js-search-filter-more').hide().css('opacity', 1);
    }

    // Скрыть / Отобразить фильтр по нажатию
    $('.js-show-filter').on('click', function (e) {
        $(this).toggleClass('show-structure_active');
        $('.js-search-filter-more').slideToggle();
        e.preventDefault();
    })

    // Скрыть / Отобразить фильтр при активном поиске
    if(!window.location.search) {
        $('.js-search-filter-more').hide();
    } else {
        if ($('.js-search-filter').length == 0) {
            if (window.location.search.indexOf('DATE_to') >= 0 || window.location.search.indexOf('date_to') >=0 ) {
                $('.js-show-filter').toggleClass('show-structure_active');
            } else {
                $('.js-search-filter-more').hide();
            }
        } else {
            if ($('.search-filter_searched').length) {
                $('.js-show-filter').toggleClass('show-structure_active');
            } else {
                $('.js-search-filter-more').hide();
            }
        }
    }

    $('.js-search-filter-more').css('opacity', 1);


    /**
    *   Фотогалерея
    */
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

    // изменение размера галереи
    $('.slider').on('click', '.flex-change-size', function (e) {
        var slider = $(this).closest('.slider');
        if (slider.hasClass('slider-small')) {
            slider.find('.flex-caption-block').hide();
            $(this).closest('.slider')
                .animate({'width': '100%'}, 300, function () {
                    $(this).removeClass('slider-small');
                    $(this).find('.flex-caption-block').show();
                });
        } else {
            $(this).closest('.slider')
                .animate({'width': '357'}, 300, function () {
                    $(this).addClass('slider-small');
                });
        }
        e.preventDefault();
    })

    $('#js-search-filter').insertAfter($('.page-content-header'));

    /**
    *   Видеогалерея
    */
    if (!iOS) {
        $('video').mediaelementplayer({
            loop: true,
            shuffle: false,
            playlist: true,
            playlistposition: 'bottom',
            features: ['playlistfeature', 'prevtrack', 'playpause', 'nexttrack', 'loop', 'shuffle', 'playlist', 'current', 'progress', 'duration', 'volume'],
        });
    }

    // Выбор количества элементов на странице
    $('.search-filter-form .filter-select-pages').on('selectmenuchange', function () {
        $(this).closest('.search-filter-form').submit()
    });

    
    /**
    *   Несколько блоков с пагинацией на одной странице
    *   При переходе по страницам, scroll к соответствующему блоку
    */
    var jsPageId = 1;
   
    $('.js-paging-in').each(function () {
        var wrap = $(this),
            pages = wrap.find('.pages');

        if (pages.length) {
            wrap.attr('id', 'wrap'+jsPageId);
            jsPageId ++;
        }
    })

    $('.js-paging-in .pages a').on('click', function () {
        var pageId = $(this).closest('.js-paging-in').attr('id');
        
        if($(window).scrollTop() != 0) {
            $(this).attr('href', $(this).attr('href') + '#' + pageId);
        }
        
    })


    /**
    *   Форматирование размера файла в байтах
    */
    function formatBytes(bytes,decimals) {
       if(bytes == 0) return '0 Байтов';
       var k = 1000;
       var dm = decimals + 1 || 3;
       var sizes = ['Б', 'Kб', 'Mб', 'Гб', 'Тб', 'Пб', 'EB', 'ZB', 'YB'];
       var i = Math.floor(Math.log(bytes) / Math.log(k));
       return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    }

    /**
    *   Вывод размера и типа файла
    */
    $('.js-sizeres-link, .open-passport-link').each(function() {
        var link = $(this),
            url = link.attr('href'),
            fileType = '',
            tempArray = [],
            request;

        tempArray = url.split('.');
        fileType = tempArray[tempArray.length - 1];
        request = $.ajax({
            type: "HEAD",
            url: url,
                success: function () {
                    var fileSize = formatBytes(request.getResponseHeader("Content-Length"));
                    link.html('<span style="text-transform:uppercase;">' + fileType + '</span>, ' + fileSize);
                    if (link.hasClass('open-passport-link')) {
                        $('.page-content-header__stats .doc-links').prepend(link);
                    }
                },
                error: function () {
                    link.remove();
                }
        });
    })

    /**
    *   Форма обратной связи
    */

    var isIE9OrBelow = function() {
       return /MSIE\s/.test(navigator.userAgent) && parseFloat(navigator.appVersion.split("MSIE")[1]) < 10;
    }

    // Поле для привязки файла
    $('.js-form-file').on('click', function(e) {
        $(this).prev('.form-file-inline').click();
        e.preventDefault();
    })

    // Вывод параметров привязанного файла
    $('.form-file-inline').on('change', function () {
        var file,
            filename = '',
            filesize = '',
            line = '';
        if ( isIE9OrBelow()) { // IE 9
            var tempArray = ($(this)[0].value).split('\\');
            filename = tempArray[tempArray.length - 1];
        } else {
            file = $(this)[0].files[0];
            filename = file['name'];
            filesize = formatBytes(file['size']);
        }

        line = '<div class="form-note form-note_file">' + filename  + ' ' + filesize +  '</div>';

        $(this).parent()
            .find('.form-note_file')
                .remove()
                .end()
            .append(line);
    })

    // Валидация полей формы
    var form_q = $('.form_question');
    if (form_q.length > 0) {
        $.each(form_q, function(i, el) {
            var area_id = $(el).data('area');
            var validobj = $("#feedback-form_" + area_id).validate({
                ignore: [],  
                errorClass: "error",

                errorPlacement: function (error, element) {
                    var elem = $(element);
                    if (elem.hasClass("select-required")) {
                        $parent = elem.parent();
                        $parent.append(error);
                    } else {
                        error.insertAfter(element);
                    }
                },

                highlight: function (element, errorClass, validClass) {
                    var elem = $(element);
                    if (elem.hasClass("select-required")) {
                        $parent = elem.parent();
                        $parent.addClass("form-wrap_select_error");
                    } else {
                        elem.addClass(errorClass);
                        
                    }
                },

                unhighlight: function (element, errorClass, validClass) {
                    var elem = $(element);
                    if (elem.hasClass("select-required")) {
                        $parent = elem.parent();
                        $parent.removeClass("form-wrap_select_error");
                    } else {
                        elem.removeClass(errorClass);
                    }
                }, 

                submitHandler: function(form) {
                    var send_params = new FormData(form); //$(form).serialize();
                    $('.errors_message').remove();
                    $.ajaxSetup({processData:false, contentType: false});
                    $.post(document.location.href, send_params, function(data){
                        //console.log(data);
                        var my_data = JSON.parse(data);
                        //$("#loading_{/literal}{$env.area_id}{literal}").hide();
                        if(my_data.error == 'captcha_error'){
                            var res = "/common/tool/getcaptcha.php?captcha_id="+my_data.capcha_id;
                            $("#captcha_img_" + area_id).attr("src",res);
                            $("#captcha_id_" + area_id).val(my_data.capcha_id);
                            $("#captcha_error_" + area_id).html(captchaError);
                        }
                        if(my_data.error == 'ok'){
                            var res = "/common/tool/getcaptcha.php?captcha_id="+my_data.capcha_id;
                            $("#captcha_img_" + area_id).attr("src",res);
                            $("#captcha_id_" + area_id).val(my_data.capcha_id);
                            $("#captcha_error_" + area_id).html(captchaError);
                            $("#feedback-content-form_" + area_id).hide();
                            $("#feedback-content-result_" + area_id).html(my_data.result_body);
                        }
                    });
                }
            });

            $("#feedback-form_" + area_id + " .form-text-int").each(function(){
                $(this).rules("add", { 
                    digits: true
                });
            })

            $("#feedback-form_" + area_id + " .select-required").each(function(){
                $(this).rules("add", { 
                    selectcheck: true
                });
            })

            jQuery.validator.addMethod('selectcheck', function (value) {
                return (value != '-1');
            }, "Это поле необходимо заполнить.");

            $("#feedback-form_" + area_id + " .select-required").on("selectmenuchange", function () {
                if (!$.isEmptyObject(validobj.submitted)) {
                    validobj.form();
                }
            });

        })
    }

    // Форма для подписки
    var subscribe_form = $('.subscribe-form');
    if (subscribe_form.length > 0) {
        $.each(subscribe_form, function(i, el) {
            var area_id = $(el).data('area'),
                checkboxName = 'list_' + area_id + '[]',
                rules = {},
                messages = {};

            rules['list_' + area_id + '[]'] = {required: true};
            messages['list_' + area_id + '[]'] = "Выберите хотя бы одну группу";

            $("#form_" + area_id).validate({
                rules: rules,
                messages: messages
            });

        })
    }


    /**
    *   Опросы
    */
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


    /**
    *   Формат ссылок с баннеров на главной странице
    */
    $('.banners__link').each(function () {
        var textUnedited = $(this).text(),
            tempArray = [],
            textReault = "";
        
        // cut "http://"
        tempArray = textUnedited.split('://');
        if (tempArray.length > 1 ) {
            textReault = tempArray[1];
        }

        // cut last "/"
        tempArray = textReault.split('/');
        if (tempArray[tempArray.length - 1] == "") {
            textReault = tempArray[tempArray.length - 2];
        } else {
            textReault = tempArray[tempArray.length - 1];
        }

        $(this).text(textReault);

    })


    /**
    *   Основное выпадающее меню, разбивка на 3 колонки
    */
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
            
            if (tempHeight > colHeight*tempCol ) {
                tempCol++;
            }

            if ((tempHeight > (colHeight*(tempCol-1) + colHeight/3)) || (tempCol == 1)) {
                wraps[i].col = tempCol;
            } else  {
                wraps[i].col = tempCol - 1;
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

    /**
    *   Подгонка высоты элементов плитки со списком управлений
    */
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
        var $dropDown = $(this).next('.dropdown-cont'),
            $closeBtn = $dropDown.find('.highcharts-set-date_calendar');

        hideElWithClickOutside({el:$dropDown, closeBtn: $closeBtn, startAnimation:'slide', endAnimation:'slide', duration:'fast'});
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
            if (!yourClick && $(e.target).closest($el).length == 0 && $(e.target).closest('#ui-datepicker-div').length == 0 && $(e.target).closest('.ui-corner-all').length == 0) {
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


//charts in statistics
(function(){
    if ( (typeof fanoCharts == "object") && fanoCharts.column ) {
        for (var key in fanoCharts.column.mode) {
            var mode = key,
                categories = fanoCharts.column.mode[mode].categories,
                users = fanoCharts.column.mode[mode].users,
                pageviews = fanoCharts.column.mode[mode].pageviews,
                sessions = fanoCharts.column.mode[mode].sessions;

            makeColumnCharts(mode, categories, users, pageviews, sessions)
        }
    }
})();
(function(){
    if ( (typeof fanoCharts == "object") && fanoCharts.pie ) {
        for (var key in fanoCharts.column.mode) {
            var mode = key,
                data = fanoCharts.pie.mode[mode].data;

            makePieCharts(mode, data)
        }
    }
})();

function makeColumnCharts(mode, categories, users, pageviews, sessions) {
    var step,
        rotation = 0;

    switch (mode) { //для вкладки год шаг через 3 месяца, для месяца шаг - неделя
        case "year":
            step = 4;
            break;
        case "month":
            step = 7;
            break;
        default:
            step = null;
    }

    if (categories.length > 36) { //при большом числе подписей наклоняем их
        rotation = -45;
    }

    $('#container-highcharts_column_' + mode).highcharts({
        chart: {
            ignoreHiddenSeries: false, //сетка перестает прыгать при отключении показателей
            height: 345,
            width: 720,
            spacingLeft: 0,
            spacingRight: 15,
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
            categories: categories,
            tickLength: 0,
            crosshair: true,
            labels: {
                style: {
                    "color": "#3A484F;"
                },
                step: step,
                rotation: rotation
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
            data: users

        }, {
            name: 'Просмотры страниц',
            color: '#0276BD',
            pointWidth: 4,
            groupPadding: 0.3,
            data: pageviews

        }, {
            name: 'Посещения',
            color: '#B0BEC5',
            pointWidth: 4,
            groupPadding: 0.3,
            data: sessions

        }]
    });
}

function makePieCharts(mode, data) {
    $('#container-highcharts_pie_' + mode).highcharts({
        chart: {
            spacingLeft: 0,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            width: 720,
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
                        '<span class="hli_line">' +
                            '<span class="hli_line_inner" style="background-color: ' + this.color + '; width:' + this.width +'%;"></span>' +
                        '</span>' +
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
            data: data
        }]
    });
}

function makePagesCharts(mode, dataPages) {
    var html = "",
        liClass = "";

    for (var i = 0; i < dataPages.length; i++) {
        liClass = (i > 10) ? ' class="more_page_statistic"' : "";

        html += '<li' + liClass + '>' +
                '<span class="rpage_txt">' + dataPages[i].name + '</span>' +
                '<span class="rpage_r">' +
                    dataPages[i].pageviews + '<br>' +
                    '<div style="width: ' + dataPages[i].width + '%;" class="rpage_line"></div>' +
                '</span>' +
            '</li>';
    }

    $('.ol_rp_' + mode).html(html);
}


$('.highcharts-set-date_calendar').on('click', function(e){
    var stat = $(this).closest('.statistic-list'),
        area = stat.data('area'),
        page = stat.data('page'),
        type = stat.data('charttype');

    if(!area || !page) {
        console.log( stat );
        return false;
    }

    var url = '/common/module_router.php?page_id=' + page + '&area_id=' + area;

    var dateCont = $(this).closest('.statistic-date-dropdown'),
        mode = dateCont.data("mode"),
        startDate = dateCont.find('.start_date').val(),
        endDate =   (dateCont.find('.end_date').length) ? dateCont.find('.end_date').val() : startDate;

    if ( validDateForCharts(startDate, endDate) ) {
        makeLoaderInCharts(stat);

        var params = {};
        params['endDate_' + area] = endDate;
        params['startDate_' + area] = startDate;

        $.ajax({
            method: "POST",
            url: url,
            data: params
        })
        .done(function( data ) {
            removeLoaderInCharts();

            var dataCharts = JSON.parse(data)[mode].data;

            //console.log(JSON.parse(data));
            makeDataForCharts(dataCharts, mode, type);
            changeDateInChart(type, mode, startDate, endDate);
        })
        .fail(function( jqXHR, textStatus ) {
            console.log( textStatus );
        });
    }
});

function makeDataForCharts(data, mode, type) {
    var localeMonthForCharts = [" ", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        categories = [],
        users = [],
        pageviews = [],
        sessions = [],
        dataPie = [],
        dataPages = [],
        hour = '',
        day = '',
        month = '',
        year = '';

    if (type == 'column') {
        for (var i = 0; i < data.length; i++) {
            hour = data[i].dimensions.hour ? data[i].dimensions.hour + " " : "";
            day = data[i].dimensions.day ? data[i].dimensions.day + "." : "";
            year = data[i].dimensions.year ? data[i].dimensions.year : "";

            if (mode === 'year') {
                month = data[i].dimensions.month ? localeMonthForCharts[parseInt(data[i].dimensions.month)] + " " : "";
            } else {
                month = data[i].dimensions.month ? data[i].dimensions.month + "." : "";
            }

            categories.push(hour + day + month + year);
            users.push(data[i].metrics.users);
            pageviews.push(data[i].metrics.pageviews);
            sessions.push(data[i].metrics.sessions);
        }
    }

    if (type == 'pie') {
        for (var i = 0; i < data.length; i++) {
            dataPie.push({
                name: data[i].dimensions.pageName,
                color: fanoCharts.colors[i],
                y: data[i].metrics.pageviews,
                width: data[i].width.pageviews
            });
        }
    }

    if (type == 'pages') {
        for (var i = 0; i < data.length; i++) {
            dataPages.push({
                name: data[i].dimensions.pageName,
                pageviews: data[i].metrics.pageviews,
                width: data[i].width.pageviews
            });
        }
    }

    switch (type) {
        case "column":
            makeColumnCharts(mode, categories, users, pageviews, sessions);
            break;
        case "pie":
            makePieCharts(mode, dataPie);
            break;
        case "pages":
            makePagesCharts(mode, dataPages);
            break;
        default:
            return false;
    }

}

function validDateForCharts(startDate, endDate) {
    if ( !startDate || !endDate ) {
        alert("Не заполнены обязательные поля");
        return false;
    } else if ( Date.parse(startDate) > Date.parse(endDate) ) {
        alert("Дата начала не может быть позже даты окончания");
        return false;
    } else {
        return true;
    }
}

function makeLoaderInCharts(stat) {
    removeLoaderInCharts();

    var loader = $('<div>').addClass('ajax-loading');

    stat.append(loader);
}

function removeLoaderInCharts() {
    $('.ajax-loading').remove();
}

function showMorePageRatig(event) {
    event.preventDefault();

    var $link = $(event.target),
        $cont = $link.closest('.rating-page-list');

    if ( $link.hasClass('show_statistic') ) {
        $link.removeClass('show_statistic');
        $link.text("Рейтинг всех страниц сайта");
        $cont.find('.more_page_statistic').hide();
    } else {
        $link.addClass('show_statistic');
        $link.text("Рейтинг топ 10 страниц сайта");
        $cont.find('.more_page_statistic').show();
    }
}

function changeDateInChart(type, mode, startDate, endDate) {
    var txt = "";

    if (startDate == endDate) {
        txt = startDate;
    } else {
        txt = startDate + " - " + endDate;
    }

    $('.statistic-list-' + type).find('.statistic-date-' + mode).text(txt);
}

$('.statistic_calendar').datepicker({
    showOn: "button",
    buttonImage: "",
    buttonImageOnly: false,
    buttonText: "Выберите дату",
    maxDate: 0
});