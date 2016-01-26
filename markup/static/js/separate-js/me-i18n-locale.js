/*
 * This is a i18n.locale language object.
 *
 * German translation by Jalios, Twitter: @Jalios
 *
 * @author
 *   Jalios (Twitter: @Jalios)
 *
 * @see
 *   me-i18n.js
 *
 * @params
 *  - exports - CommonJS, window ..
 */
var mejs = mejs || {};
(function () {
  var language = param_lang();
  mejs.i18n = {
    locale: {
      language: language,
      strings: { }
    }
  };
  
  function param_lang() {
    // RFC 5646: https://tools.ietf.org/html/rfc5646
    // Examples: en, zh-CN, zh-Hans-CN, sr-Latn-RS, es-419, x-private
    var ietf_lang_re = /^(x\-)?[a-z]{2,}(\-\w{2,})?(\-\w{2,})?$/,
      lang = _param("lang").match(ietf_lang_re);
    return lang && lang[0];
  }
  function _param(key, _default) {
    _default = _default || "";
    var re = new RegExp("[&?]" + key + "=([^&]+)"),
      value = re.exec(window.location.search);
    return value ? value[1] : _default;
  }
})();
function log(s) {
  window.console && console.log(arguments.length > 1 ? arguments : s);
}


;(function(exports, undefined) {

    "use strict";

    if (typeof exports.ru === 'undefined') {
        exports.ru = {
            "None" : "Нет",
            "Unmute" : "Включить звук",
            "Fullscreen" : "Развернуть на полный экран",
            "Download File" : "Скачать файл",
            "Mute Toggle" : "Переключатель",
            "Play/Pause" : "Проиграть/Пауза",
            "Captions/Subtitles" : "Субтитры",
            "Download Video" : "Скачать видео",
            "Mute" : "Выключить звук",
            "Turn off Fullscreen" : "Свернуть",
            "Go Fullscreen" : "Развернуть на полный экран",
            "Close" : "Закрыть",
            "Play" : "Играть"
        };
    }

}(mejs.i18n.locale.strings));
