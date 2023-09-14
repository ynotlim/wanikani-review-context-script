// ==UserScript==
// @name        WaniKani Show Context Sentence
// @namespace   skatefriday
// @match       https://www.wanikani.com/subjects/review
// @match       https://www.wanikani.com/subjects/extra_study*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant       none
// @version     1.1.2
// @license     Apache, https://www.apache.org/licenses/LICENSE-2.0
// @author      skatefriday
// @description Show context sentence on review page.
// ==/UserScript==

(function() {

if (!window.wkof) {
    alert('The show context sentence script requires Wanikani Open Framework.\nYou will now be forwarded to installation instructions.');
    window.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
    return;
}

var currSubject = null;
var sentence = "";
var sentence_en = "";
var sentenceNode = null;
var wk_items = null;

function get_new_sentence()
{
    if (wk_items == null) {
      return;
    }

    if (currSubject.type === "Vocabulary") {
      let id_index = wkof.ItemData.get_index(wk_items, 'subject_id');
      let item = id_index[currSubject.id]
      sentence = item.data.context_sentences[0]?.ja || '';
      sentence = sentence + item.data.context_sentences[1]?.ja || '' ;
      sentence = sentence + item.data.context_sentences[2]?.ja || '';

      sentenceNode.innerHTML = '<span><p>' + item.data.context_sentences[0]?.ja +'</p></span>';
    sentenceNode.innerHTML = sentenceNode.innerHTML + '<span><p>' + item.data.context_sentences[0]?.en +'</p></span>';

    sentenceNode.innerHTML = sentenceNode.innerHTML + '<span><p>' + item.data.context_sentences[1]?.ja +'</p></span>';
    sentenceNode.innerHTML = sentenceNode.innerHTML + '<span><p>' + item.data.context_sentences[1]?.en +'</p></span>';

    sentenceNode.innerHTML = sentenceNode.innerHTML + '<span><p>' + item.data.context_sentences[2]?.ja +'</p></span>';
    sentenceNode.innerHTML = sentenceNode.innerHTML + '<span><p>' + item.data.context_sentences[2]?.en +'</p></span>';

		//var source_embed = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&total=1&idx=0&q=${encodeURIComponent(sentence)}`;
    //sentenceNode.innerHTML = sentenceNode.innerHTML + '<audio controls src='+source_embed+'></audio>';


    } else {
      sentence = "";
      sentenceNode.innerHTML = "";
    }




}


function play_audio (){
  	//let speech_play_option = new SpeechSynthesisUtterance();
	  //speech_play_option.text = sentence;
	  //speech_play_option.lang = 'ja-JP';
	  //speechSynthesis.speak(speech_play_option);


		var source = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&total=1&idx=0&q=${encodeURIComponent(sentence)}`;
    var audio = new Audio(source);
    audio.playbackRate = 0.9;
    audio.play();
}

window.addEventListener(`willShowNextQuestion`, e => {
	console.log(e.detail);
  currSubject = e.detail.subject;
  get_new_sentence();
});


var config = {
    wk_items: {
        options: {
            study_materials: true
        }
    }
};

//
// Note that this async operation is slower than the willShowNextQuestion above.
// Which is why we cache the current subject as a global in the event handler.
// Otherwise the first item, if vocabulary, will have no sentence.
//
function fetch_items()
{
    wkof.ItemData.get_items(config)
        .then((items) => { wk_items = items; })
        .then(get_new_sentence);

    console.log("Fetched the items")
}

function startup_wkof()
{
    wkof.include('ItemData');
    wkof.ready('ItemData')
      .then(fetch_items);
}

function install_context_sentence_css()
{
    var better_font = "<link href=\"https://fonts.googleapis.com/css?family=Sawarabi+Mincho\" rel=\"stylesheet\">";
    var context_sentence_css = ".wf-sawarabimincho p {padding: 0.50em 0.50em 0.50em 0.50em; font-size: 1.5em;}"

    $('head').append(better_font);
    $('head').append('<style>'+ context_sentence_css +'</style>');
}

// Add event listener on keydown
document.addEventListener('keydown', (event) => {
  var name = event.key;
  if (name == "a"){
    play_audio();
  }

}, false);

$(document).ready(function()
{
  parent =
  sentenceNode = document.createElement('div');
  // sentenceNode.setAttribute('style', 'font-family: \'Sawarabi Mincho\', serif;');
  sentenceNode.setAttribute('class', 'wf-sawarabimincho');
  sentenceNode.setAttribute('style', 'text-align:center')
  sentenceNode.innerHTML = '<span>' + sentence + '</span>';
  $(document.getElementsByClassName('quiz__content')[0].insertBefore(sentenceNode, document.getElementsByClassName('quiz-input')[0]));
  startup_wkof();
  install_context_sentence_css();
  console.log( "ready!" );
});

})();
